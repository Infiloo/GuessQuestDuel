# Multiplayer Number Guessing Game

## Overview
A real-time multiplayer web game where players compete to guess a randomly generated number between 1-100. Built with React, Express, and WebSocket for real-time gameplay.

## Tech Stack
- **Frontend**: React with Wouter routing, shadcn/ui components, Tailwind CSS
- **Backend**: Express.js with WebSocket (ws package)
- **Storage**: In-memory (MemStorage)
- **Real-time**: WebSocket connections via shared context provider

## Architecture
- **WebSocket State**: Single persistent WebSocket connection managed by WebSocketContext provider, shared across all routes
- **Turn-based Gameplay**: Server manages turn order, validates guesses, and broadcasts updates to all players
- **Lobby System**: 6-character unique codes for lobby creation/joining

## Key Features
- Create and join lobbies using unique codes
- Real-time multiplayer with WebSocket connections
- Turn-based guessing with higher/lower feedback
- Live guess history for all players
- Player sidebar showing current turn
- Winner celebration with confetti animation
- New round functionality

## Design System
- **Colors**: Primary (Indigo #6366F1), Secondary (Emerald #10B981), Success (Green #22C55E), Error (Red #EF4444)
- **Fonts**: Poppins for headings/lobby codes, Inter for body text
- **Inspiration**: Kahoot's lobby system, Wordle's guess feedback

## Data Models
- **Lobby**: id, code, hostId, targetNumber, currentTurnIndex, status (waiting/playing/finished), winnerId
- **Player**: id, name, lobbyId, isHost
- **Guess**: playerId, playerName, number, feedback (higher/lower/correct), timestamp
- **GameState**: lobby, players, guesses, currentPlayer, minRange, maxRange

## User Flow
1. Home → Create lobby or Join lobby with code
2. Lobby → Wait for players, host starts game
3. Game → Players take turns guessing, receive feedback
4. Winner → Celebration modal, option to start new round

## API (WebSocket Messages)
- **create_lobby**: { type, playerName }
- **join_lobby**: { type, code, playerName }
- **start_game**: { type, lobbyId }
- **submit_guess**: { type, lobbyId, guess }
- **new_round**: { type, lobbyId }

## Recent Changes
- Implemented shared WebSocketContext to maintain persistent connection across route changes
- Fixed navigation to use useEffect instead of render-time redirects
- All components now consume shared WebSocket state

## Development
- Run: `npm run dev`
- Server: Express on port 5000
- WebSocket: ws://localhost:5000/ws (wss:// on production)
