# Code Architecture & Best Practices

This document outlines the architecture, patterns, and best practices used in this codebase.

## 📁 Project Structure

```
lzgame/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Home page (game selection)
│   ├── tetris/page.tsx          # Tetris game route
│   ├── snake/page.tsx           # Snake game route
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Global styles
│
├── components/
│   ├── ui/                      # Reusable UI components
│   │   ├── ScoreCard.tsx        # Score display component
│   │   ├── BackButton.tsx       # Navigation button
│   │   ├── GameOverlay.tsx      # Game state overlays
│   │   └── GameCard.tsx         # Game selection card
│   │
│   ├── games/                   # Game implementations
│   │   ├── Tetris.tsx           # Tetris game logic & UI
│   │   └── Snake.tsx            # Snake game logic & UI
│   │
│   ├── ColorProvider.tsx        # Dichoptic color context
│   └── SettingsPanel.tsx        # Settings modal
│
├── lib/
│   ├── constants/
│   │   └── game.ts              # Game configuration constants
│   │
│   ├── hooks/
│   │   ├── useHighScores.ts     # High scores management
│   │   └── useSettings.ts       # Settings management
│   │
│   └── types/
│       └── scores.ts            # TypeScript type definitions
│
└── public/                      # Static assets
```

## 🏗️ Architecture Patterns

### 1. Component-Based Architecture

We follow a strict component hierarchy:

- **Page Components** (`app/*/page.tsx`): Route handlers, minimal logic
- **Feature Components** (`components/games/*`): Game logic and UI
- **UI Components** (`components/ui/*`): Reusable, presentational components
- **Provider Components**: Context providers for global state

### 2. Separation of Concerns

Each component has a single responsibility:

```typescript
// ❌ Bad: Mixed concerns
function Game() {
  // Game logic
  // UI rendering
  // Navigation
  // Score display
}

// ✅ Good: Separated concerns
function Game() {
  const gameLogic = useGameLogic();
  return (
    <>
      <BackButton />
      <GameBoard {...gameLogic} />
      <ScoreCard scores={scores} />
    </>
  );
}
```

### 3. Custom Hooks for Logic

Business logic is extracted into custom hooks:

```typescript
// lib/hooks/useHighScores.ts
export function useHighScores() {
  // All score management logic
  return { highScores, updateHighScore, isLoaded };
}

// Usage in component
const { highScores, updateHighScore } = useHighScores();
```

### 4. Constants Over Magic Numbers

All configuration values are centralized:

```typescript
// ❌ Bad: Magic numbers
const board = Array(20).fill(null).map(() => Array(10).fill('empty'));
setScore(prev => prev + 100);

// ✅ Good: Named constants
const board = Array(TETRIS.BOARD_HEIGHT)
  .fill(null)
  .map(() => Array(TETRIS.BOARD_WIDTH).fill('empty'));
setScore(prev => prev + SCORE.TETRIS_LINE_POINTS);
```

## 🎨 Component Design Patterns

### Reusable Components

All UI components follow this pattern:

```typescript
interface ComponentProps {
  // Required props
  title: string;
  // Optional props with defaults
  className?: string;
  // Typed variants
  variant: 'primary' | 'secondary';
}

export default function Component({ 
  title, 
  className = '', 
  variant 
}: ComponentProps) {
  return <div className={className}>{title}</div>;
}
```

### Compound Components

Complex components use the compound pattern:

```typescript
<GameOverlay isVisible={gameOver} title="Game Over!">
  <p>Final Score: {score}</p>
  <button onClick={resetGame}>Play Again</button>
</GameOverlay>
```

## 📝 TypeScript Best Practices

### 1. Strict Typing

```typescript
// Define interfaces for all props
interface ScoreCardProps {
  scores: ScoreEntry[];
  title: string;
  accentColor: 'cyan' | 'pink';
}

// Use const assertions for constants
export const CONTROLS = {
  PAUSE: ['p', 'P'],
  ARROW_UP: 'ArrowUp',
} as const;
```

### 2. Type Inference

Let TypeScript infer types when possible:

```typescript
// ✅ Good: Type inferred from constant
const { BOARD_WIDTH, BOARD_HEIGHT } = TETRIS;

// ❌ Unnecessary: Explicit type
const BOARD_WIDTH: number = TETRIS.BOARD_WIDTH;
```

## 🎮 Game Development Patterns

### State Management

Games use local state with hooks:

```typescript
const [board, setBoard] = useState<Board>(() => createEmptyBoard());
const [currentPiece, setCurrentPiece] = useState<Piece | null>(null);
const [gameOver, setGameOver] = useState(false);
const [score, setScore] = useState(0);
```

### Game Loop

Use `useEffect` with cleanup for game loops:

```typescript
useEffect(() => {
  if (gameOver || isPaused) return;

  const gameLoop = setInterval(() => {
    movePiece(0, 1);
  }, TETRIS.INITIAL_SPEED);

  return () => clearInterval(gameLoop);
}, [movePiece, gameOver, isPaused]);
```

### Keyboard Controls

Centralize keyboard handling:

```typescript
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    switch (e.key) {
      case CONTROLS.ARROW_LEFT:
        movePiece(-1, 0);
        break;
      // ...
    }
  };

  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, [movePiece]);
```

## 🎯 Adding a New Game

To add a new game, follow these steps:

1. **Create game component** in `components/games/YourGame.tsx`
2. **Create route** in `app/your-game/page.tsx`
3. **Add constants** to `lib/constants/game.ts`
4. **Update types** in `lib/types/scores.ts` if needed
5. **Add to home page** using `GameCard` component

Example:

```typescript
// 1. components/games/Pong.tsx
import { PONG, CONTROLS, SCORE } from '@/lib/constants/game';
import BackButton from '@/components/ui/BackButton';
import GameOverlay from '@/components/ui/GameOverlay';

export default function PongGame() {
  // Game logic here
  return (
    <div>
      <BackButton className="absolute top-4 left-4 z-50" />
      {/* Game UI */}
      <GameOverlay isVisible={gameOver} title="Game Over!">
        {/* Overlay content */}
      </GameOverlay>
    </div>
  );
}

// 2. app/pong/page.tsx
import PongGame from '@/components/games/Pong';

export default function PongPage() {
  return <PongGame />;
}

// 3. lib/constants/game.ts
export const PONG = {
  PADDLE_HEIGHT: 100,
  BALL_SPEED: 5,
} as const;
```

## 🧪 Testing Guidelines

### Component Testing

Test components in isolation:

```typescript
// Test props and rendering
it('renders score correctly', () => {
  render(<ScoreCard scores={mockScores} title="High Scores" accentColor="cyan" />);
  expect(screen.getByText('High Scores')).toBeInTheDocument();
});

// Test user interactions
it('navigates on back button click', () => {
  const { push } = useRouter();
  render(<BackButton />);
  fireEvent.click(screen.getByText('← Back'));
  expect(push).toHaveBeenCalledWith('/');
});
```

### Hook Testing

Test hooks with `renderHook`:

```typescript
it('updates high score', () => {
  const { result } = renderHook(() => useHighScores());
  act(() => {
    result.current.updateHighScore('tetris', 1000);
  });
  expect(result.current.highScores.tetris[0].score).toBe(1000);
});
```

## 📚 Further Reading

- [Next.js App Router](https://nextjs.org/docs/app)
- [React Hooks](https://react.dev/reference/react)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Component Patterns](https://www.patterns.dev/posts/react-component-patterns)

## 🤝 Contributing

When contributing:

1. Follow existing patterns and conventions
2. Add TypeScript types for all new code
3. Extract reusable components to `components/ui/`
4. Use constants from `lib/constants/game.ts`
5. Update this documentation for architectural changes
6. Add entries to `CHANGELOG.md`
