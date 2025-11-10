# Multiplayer Number Guessing Game - Design Guidelines

## Design Approach
**Reference-Based**: Drawing inspiration from Kahoot's engaging lobby system and Wordle's clear guess feedback interface to create an intuitive, competitive multiplayer experience.

## Color System
- **Primary**: #6366F1 (Indigo) - Main actions, lobby codes, active states
- **Secondary**: #10B981 (Emerald) - Positive feedback, success indicators
- **Background**: #F8FAFC (Light grey) - Page background
- **Text**: #1E293B (Slate) - Primary text content
- **Success**: #22C55E (Green) - Correct guesses, winner announcements
- **Error**: #EF4444 (Red) - Incorrect feedback, validation errors
- **Neutrals**: Use slate variations (slate-100, slate-300, slate-600) for borders, dividers, and secondary UI

## Typography
- **Font Stack**: Inter for body text, Poppins for headings and lobby codes
- **Hierarchy**:
  - Lobby codes: Poppins, 3xl-4xl, bold, letter-spaced
  - Page headings: Poppins, 2xl-3xl, semibold
  - Guess numbers: Poppins, 4xl-6xl, bold
  - Body text: Inter, base-lg, regular-medium
  - Player names: Inter, sm-base, medium
  - Feedback hints: Inter, lg, semibold

## Layout System
**Spacing**: Use Tailwind units of 2, 4, 6, 8, 12, 16, 24 for consistent rhythm (p-4, gap-6, mb-8, etc.)

**Grid Structure**:
- Main content area: Centered card-based layout, max-w-6xl
- Two-column desktop layout: Primary game area (2/3 width) + Player sidebar (1/3 width)
- Single column mobile: Stack vertically, sidebar becomes collapsible

## Component Library

**Game Lobby Card**:
- Large centered card with rounded-xl borders
- Display lobby code prominently in Poppins 4xl with primary color
- "Copy Code" button with secondary color
- Player count indicator with emerald accent
- "Start Game" button (host only) - large, primary colored

**Join Lobby Interface**:
- Centered card with large input field for lobby code
- Input styling: text-2xl, centered text, rounded-lg, border-2 with primary focus ring
- Prominent "Join Game" button below input

**Guessing Interface**:
- Number input: Extra large (text-4xl), centered, rounded-xl, primary border on focus
- "Submit Guess" button: Large, full-width on mobile, primary colored, bold text
- Current range display: "Guess between X and Y" in secondary color

**Guess History Feed**:
- Scrollable card showing all player guesses chronologically
- Each guess entry: Player name, number guessed, feedback indicator (↑ higher, ↓ lower, ✓ correct)
- Color-coded feedback: Red for incorrect, green for correct
- Most recent at top with subtle animations

**Player List Sidebar**:
- Fixed sidebar showing all active players
- Current turn indicator: Highlight active player with primary background
- Player status indicators (waiting, guessing, winner)
- Lobby code display at top of sidebar

**Winner Announcement**:
- Full-screen overlay with confetti animation
- Large winner name in Poppins 4xl
- Winning number display
- "New Round" button prominently centered

## Interaction Patterns
- Real-time updates: Smooth fade-in animations for new guesses
- Turn indicator: Pulsing border or glow on active player
- Button states: Disabled state with reduced opacity when not player's turn
- Loading states: Spinner for joining lobbies, submitting guesses
- Validation feedback: Shake animation for invalid inputs

## Responsive Design
- Desktop (lg+): Two-column layout with persistent sidebar
- Tablet (md): Sidebar toggles with hamburger menu
- Mobile: Single column, collapsible player list, full-width cards

## Visual Feedback
- Guess submission: Brief success/error toast notification
- Correct guess: Green pulse animation on guess history entry
- Turn changes: Subtle background color shift to indicate active state
- Connection status: Small indicator showing WebSocket connection health