import { z } from "zod";

// Lobby schema
export const lobbySchema = z.object({
  id: z.string(),
  code: z.string(),
  hostId: z.string(),
  targetNumber: z.number().min(1).max(100),
  currentTurnIndex: z.number(),
  status: z.enum(["waiting", "playing", "finished"]),
  winnerId: z.string().optional(),
});

export type Lobby = z.infer<typeof lobbySchema>;

// Player schema
export const playerSchema = z.object({
  id: z.string(),
  name: z.string(),
  lobbyId: z.string(),
  isHost: z.boolean(),
});

export type Player = z.infer<typeof playerSchema>;

// Guess schema
export const guessSchema = z.object({
  playerId: z.string(),
  playerName: z.string(),
  number: z.number().min(1).max(100),
  feedback: z.enum(["higher", "lower", "correct"]),
  timestamp: z.number(),
});

export type Guess = z.infer<typeof guessSchema>;

// Game state schema (what gets sent to clients)
export const gameStateSchema = z.object({
  lobby: lobbySchema,
  players: z.array(playerSchema),
  guesses: z.array(guessSchema),
  currentPlayer: playerSchema.optional(),
  minRange: z.number(),
  maxRange: z.number(),
});

export type GameState = z.infer<typeof gameStateSchema>;

// WebSocket message schemas
export const wsMessageSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("create_lobby"),
    playerName: z.string().min(1).max(30),
  }),
  z.object({
    type: z.literal("join_lobby"),
    code: z.string().length(6),
    playerName: z.string().min(1).max(30),
  }),
  z.object({
    type: z.literal("start_game"),
    lobbyId: z.string(),
  }),
  z.object({
    type: z.literal("submit_guess"),
    lobbyId: z.string(),
    guess: z.number().min(1).max(100),
  }),
  z.object({
    type: z.literal("new_round"),
    lobbyId: z.string(),
  }),
]);

export type WSMessage = z.infer<typeof wsMessageSchema>;

// Server response schemas
export const wsResponseSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("lobby_created"),
    playerId: z.string(),
    gameState: gameStateSchema,
  }),
  z.object({
    type: z.literal("lobby_joined"),
    playerId: z.string(),
    gameState: gameStateSchema,
  }),
  z.object({
    type: z.literal("game_updated"),
    gameState: gameStateSchema,
  }),
  z.object({
    type: z.literal("error"),
    message: z.string(),
  }),
]);

export type WSResponse = z.infer<typeof wsResponseSchema>;
