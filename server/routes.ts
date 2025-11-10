import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import type { WSMessage, WSResponse, GameState, Lobby, Player } from "@shared/schema";

const playerConnections = new Map<string, WebSocket>();

function generateLobbyCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function generateTargetNumber(): number {
  return Math.floor(Math.random() * 100) + 1;
}

async function getGameState(lobbyId: string): Promise<GameState | null> {
  const lobby = await storage.getLobby(lobbyId);
  if (!lobby) return null;

  const players = await storage.getPlayersByLobby(lobbyId);
  const guesses = await storage.getGuessesByLobby(lobbyId);
  const currentPlayer = players[lobby.currentTurnIndex % players.length];

  let minRange = 1;
  let maxRange = 100;

  for (const guess of guesses) {
    if (guess.feedback === "higher") {
      minRange = Math.max(minRange, guess.number + 1);
    } else if (guess.feedback === "lower") {
      maxRange = Math.min(maxRange, guess.number - 1);
    }
  }

  return {
    lobby,
    players,
    guesses,
    currentPlayer,
    minRange,
    maxRange,
  };
}

async function broadcastToLobby(lobbyId: string, message: WSResponse) {
  const players = await storage.getPlayersByLobby(lobbyId);
  const messageStr = JSON.stringify(message);
  
  for (const player of players) {
    const ws = playerConnections.get(player.id);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(messageStr);
    }
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on("connection", (ws: WebSocket) => {
    let currentPlayerId: string | null = null;

    ws.on("message", async (data: Buffer) => {
      try {
        const message: WSMessage = JSON.parse(data.toString());

        if (message.type === "create_lobby") {
          const code = generateLobbyCode();
          const targetNumber = generateTargetNumber();
          
          const lobby = await storage.createLobby("", code, targetNumber);
          const player = await storage.createPlayer({
            name: message.playerName,
            lobbyId: lobby.id,
            isHost: true,
          });

          lobby.hostId = player.id;
          await storage.updateLobby(lobby);

          currentPlayerId = player.id;
          playerConnections.set(player.id, ws);

          const gameState = await getGameState(lobby.id);
          if (gameState) {
            ws.send(JSON.stringify({
              type: "lobby_created",
              playerId: player.id,
              gameState,
            } as WSResponse));
          }
        } else if (message.type === "join_lobby") {
          const lobby = await storage.getLobbyByCode(message.code);
          
          if (!lobby) {
            ws.send(JSON.stringify({
              type: "error",
              message: "Lobby not found",
            } as WSResponse));
            return;
          }

          if (lobby.status !== "waiting") {
            ws.send(JSON.stringify({
              type: "error",
              message: "Game already started",
            } as WSResponse));
            return;
          }

          const player = await storage.createPlayer({
            name: message.playerName,
            lobbyId: lobby.id,
            isHost: false,
          });

          currentPlayerId = player.id;
          playerConnections.set(player.id, ws);

          const gameState = await getGameState(lobby.id);
          if (gameState) {
            ws.send(JSON.stringify({
              type: "lobby_joined",
              playerId: player.id,
              gameState,
            } as WSResponse));

            await broadcastToLobby(lobby.id, {
              type: "game_updated",
              gameState,
            });
          }
        } else if (message.type === "start_game") {
          const lobby = await storage.getLobby(message.lobbyId);
          if (!lobby) return;

          const players = await storage.getPlayersByLobby(lobby.id);
          if (players.length < 2) {
            ws.send(JSON.stringify({
              type: "error",
              message: "Need at least 2 players to start",
            } as WSResponse));
            return;
          }

          lobby.status = "playing";
          lobby.currentTurnIndex = 0;
          await storage.updateLobby(lobby);

          const gameState = await getGameState(lobby.id);
          if (gameState) {
            await broadcastToLobby(lobby.id, {
              type: "game_updated",
              gameState,
            });
          }
        } else if (message.type === "submit_guess") {
          const lobby = await storage.getLobby(message.lobbyId);
          if (!lobby || !currentPlayerId) return;

          const players = await storage.getPlayersByLobby(lobby.id);
          const currentPlayer = players[lobby.currentTurnIndex % players.length];

          if (currentPlayer.id !== currentPlayerId) {
            ws.send(JSON.stringify({
              type: "error",
              message: "Not your turn",
            } as WSResponse));
            return;
          }

          const player = await storage.getPlayer(currentPlayerId);
          if (!player) return;

          let feedback: "higher" | "lower" | "correct";
          if (message.guess === lobby.targetNumber) {
            feedback = "correct";
            lobby.status = "finished";
            lobby.winnerId = currentPlayerId;
          } else if (message.guess < lobby.targetNumber) {
            feedback = "higher";
          } else {
            feedback = "lower";
          }

          await storage.addGuess({
            playerId: currentPlayerId,
            playerName: player.name,
            number: message.guess,
            feedback,
            timestamp: Date.now(),
          });

          if (feedback !== "correct") {
            lobby.currentTurnIndex++;
          }
          
          await storage.updateLobby(lobby);

          const gameState = await getGameState(lobby.id);
          if (gameState) {
            await broadcastToLobby(lobby.id, {
              type: "game_updated",
              gameState,
            });
          }
        } else if (message.type === "new_round") {
          const lobby = await storage.getLobby(message.lobbyId);
          if (!lobby) return;

          lobby.status = "playing";
          lobby.currentTurnIndex = 0;
          lobby.winnerId = undefined;
          lobby.targetNumber = generateTargetNumber();
          await storage.updateLobby(lobby);

          await storage.clearGuessesByLobby(lobby.id);

          const gameState = await getGameState(lobby.id);
          if (gameState) {
            await broadcastToLobby(lobby.id, {
              type: "game_updated",
              gameState,
            });
          }
        }
      } catch (err) {
        console.error("WebSocket message error:", err);
        ws.send(JSON.stringify({
          type: "error",
          message: "Invalid message",
        } as WSResponse));
      }
    });

    ws.on("close", async () => {
      if (currentPlayerId) {
        const player = await storage.getPlayer(currentPlayerId);
        if (player) {
          const lobby = await storage.getLobby(player.lobbyId);
          await storage.deletePlayer(currentPlayerId);
          playerConnections.delete(currentPlayerId);

          if (lobby) {
            const remainingPlayers = await storage.getPlayersByLobby(lobby.id);
            
            if (remainingPlayers.length === 0) {
              // Clean up empty lobby
            } else {
              if (lobby.hostId === currentPlayerId && remainingPlayers.length > 0) {
                lobby.hostId = remainingPlayers[0].id;
                remainingPlayers[0].isHost = true;
                await storage.updateLobby(lobby);
              }

              const gameState = await getGameState(lobby.id);
              if (gameState) {
                await broadcastToLobby(lobby.id, {
                  type: "game_updated",
                  gameState,
                });
              }
            }
          }
        }
      }
    });
  });

  return httpServer;
}
