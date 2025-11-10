import { randomUUID } from "crypto";
import type { Lobby, Player, Guess, GameState } from "@shared/schema";

export interface IStorage {
  // Lobby methods
  createLobby(hostId: string, code: string, targetNumber: number): Promise<Lobby>;
  getLobby(id: string): Promise<Lobby | undefined>;
  getLobbyByCode(code: string): Promise<Lobby | undefined>;
  updateLobby(lobby: Lobby): Promise<Lobby>;
  
  // Player methods
  createPlayer(player: Omit<Player, "id">): Promise<Player>;
  getPlayer(id: string): Promise<Player | undefined>;
  getPlayersByLobby(lobbyId: string): Promise<Player[]>;
  deletePlayer(id: string): Promise<void>;
  
  // Guess methods
  addGuess(guess: Guess): Promise<Guess>;
  getGuessesByLobby(lobbyId: string): Promise<Guess[]>;
  clearGuessesByLobby(lobbyId: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private lobbies: Map<string, Lobby>;
  private players: Map<string, Player>;
  private guesses: Map<string, Guess[]>;

  constructor() {
    this.lobbies = new Map();
    this.players = new Map();
    this.guesses = new Map();
  }

  async createLobby(hostId: string, code: string, targetNumber: number): Promise<Lobby> {
    const id = randomUUID();
    const lobby: Lobby = {
      id,
      code,
      hostId,
      targetNumber,
      currentTurnIndex: 0,
      status: "waiting",
    };
    this.lobbies.set(id, lobby);
    this.guesses.set(id, []);
    return lobby;
  }

  async getLobby(id: string): Promise<Lobby | undefined> {
    return this.lobbies.get(id);
  }

  async getLobbyByCode(code: string): Promise<Lobby | undefined> {
    return Array.from(this.lobbies.values()).find((lobby) => lobby.code === code);
  }

  async updateLobby(lobby: Lobby): Promise<Lobby> {
    this.lobbies.set(lobby.id, lobby);
    return lobby;
  }

  async createPlayer(playerData: Omit<Player, "id">): Promise<Player> {
    const id = randomUUID();
    const player: Player = { ...playerData, id };
    this.players.set(id, player);
    return player;
  }

  async getPlayer(id: string): Promise<Player | undefined> {
    return this.players.get(id);
  }

  async getPlayersByLobby(lobbyId: string): Promise<Player[]> {
    return Array.from(this.players.values()).filter(
      (player) => player.lobbyId === lobbyId
    );
  }

  async deletePlayer(id: string): Promise<void> {
    this.players.delete(id);
  }

  async addGuess(guess: Guess): Promise<Guess> {
    const lobbyGuesses = this.guesses.get(guess.playerId) || [];
    const player = this.players.get(guess.playerId);
    if (player) {
      const guessesForLobby = this.guesses.get(player.lobbyId) || [];
      guessesForLobby.push(guess);
      this.guesses.set(player.lobbyId, guessesForLobby);
    }
    return guess;
  }

  async getGuessesByLobby(lobbyId: string): Promise<Guess[]> {
    return this.guesses.get(lobbyId) || [];
  }

  async clearGuessesByLobby(lobbyId: string): Promise<void> {
    this.guesses.set(lobbyId, []);
  }
}

export const storage = new MemStorage();
