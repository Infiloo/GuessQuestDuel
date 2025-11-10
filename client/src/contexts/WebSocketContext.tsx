import { createContext, useContext, useEffect, useRef, useState, useCallback, ReactNode } from "react";
import type { WSMessage, WSResponse, GameState } from "@shared/schema";

interface WebSocketContextType {
  gameState: GameState | null;
  playerId: string | null;
  connected: boolean;
  error: string | null;
  createLobby: (playerName: string) => void;
  joinLobby: (code: string, playerName: string) => void;
  startGame: (lobbyId: string) => void;
  submitGuess: (lobbyId: string, guess: number) => void;
  newRound: (lobbyId: string) => void;
  clearError: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const socket = new WebSocket(wsUrl);
    
    socket.onopen = () => {
      setConnected(true);
      setError(null);
    };
    
    socket.onmessage = (event) => {
      try {
        const response: WSResponse = JSON.parse(event.data);
        
        if (response.type === "error") {
          setError(response.message);
          return;
        }
        
        if (response.type === "lobby_created" || response.type === "lobby_joined") {
          setPlayerId(response.playerId);
          setGameState(response.gameState);
          setError(null);
        } else if (response.type === "game_updated") {
          setGameState(response.gameState);
          setError(null);
        }
      } catch (err) {
        console.error("Failed to parse WebSocket message:", err);
      }
    };
    
    socket.onerror = () => {
      setError("Connection error");
      setConnected(false);
    };
    
    socket.onclose = () => {
      setConnected(false);
    };
    
    ws.current = socket;
    
    return () => {
      socket.close();
    };
  }, []);

  const sendMessage = useCallback((message: WSMessage) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    } else {
      setError("Not connected to server");
    }
  }, []);

  const createLobby = useCallback((playerName: string) => {
    sendMessage({ type: "create_lobby", playerName });
  }, [sendMessage]);

  const joinLobby = useCallback((code: string, playerName: string) => {
    sendMessage({ type: "join_lobby", code, playerName });
  }, [sendMessage]);

  const startGame = useCallback((lobbyId: string) => {
    sendMessage({ type: "start_game", lobbyId });
  }, [sendMessage]);

  const submitGuess = useCallback((lobbyId: string, guess: number) => {
    sendMessage({ type: "submit_guess", lobbyId, guess });
  }, [sendMessage]);

  const newRound = useCallback((lobbyId: string) => {
    sendMessage({ type: "new_round", lobbyId });
  }, [sendMessage]);

  const clearError = useCallback(() => setError(null), []);

  return (
    <WebSocketContext.Provider
      value={{
        gameState,
        playerId,
        connected,
        error,
        createLobby,
        joinLobby,
        startGame,
        submitGuess,
        newRound,
        clearError,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within WebSocketProvider");
  }
  return context;
}
