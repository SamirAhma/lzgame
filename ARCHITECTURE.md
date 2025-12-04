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




# Backend Architecture

## Overview

This backend is built with **NestJS**, a progressive Node.js framework for building efficient and scalable server-side applications. The architecture follows NestJS best practices with a modular, service-oriented design.

## Technology Stack

- **Framework**: NestJS 11.x
- **Database**: PostgreSQL (Neon serverless)
- **ORM**: Prisma 7.1.0
- **Authentication**: JWT with Passport
- **Validation**: Zod
- **Language**: TypeScript

## Architecture Decisions

### 1. Modular Design

The application is organized into feature modules:

```
src/
├── app.module.ts          # Root module
├── prisma/                # Database module
│   ├── prisma.module.ts
│   └── prisma.service.ts
└── auth/                  # Authentication module
    ├── auth.module.ts
    ├── auth.service.ts
    ├── auth.controller.ts
    ├── jwt.strategy.ts
    ├── jwt-auth.guard.ts
    └── dto/
        ├── login.dto.ts
        └── register.dto.ts
```

**Rationale**: Modular architecture promotes:
- **Separation of concerns**: Each module handles a specific domain
- **Reusability**: Modules can be imported and reused
- **Testability**: Isolated modules are easier to test
- **Maintainability**: Changes are localized to specific modules

### 2. Prisma 7 with Driver Adapters

**Decision**: Use Prisma 7 with the PostgreSQL driver adapter pattern.

```typescript
// prisma.service.ts
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
super({ adapter });
```

**Rationale**:
- **Prisma 7 Requirement**: Version 7 mandates driver adapters for database connections
- **Connection Pooling**: The `pg` Pool manages database connections efficiently
- **Serverless Compatibility**: Works well with Neon's serverless PostgreSQL
- **Type Safety**: Prisma generates TypeScript types from the schema

**Trade-offs**:
- Additional dependency (`@prisma/adapter-pg`)
- More verbose setup compared to Prisma 6
- Better performance and smaller bundle size

### 3. JWT Authentication Strategy

**Decision**: Implement stateless authentication with JWT tokens.

```typescript
// Flow:
// 1. User registers → Password hashed with bcrypt
// 2. User logs in → JWT token generated
// 3. Protected routes → JWT validated via Passport strategy
```

**Rationale**:
- **Stateless**: No server-side session storage needed
- **Scalable**: Works across multiple server instances
- **Standard**: Industry-standard authentication method
- **Flexible**: Easy to extend with refresh tokens

**Security Considerations**:
- Passwords hashed with bcrypt (10 salt rounds)
- JWT secret stored in environment variables
- Token expiration set to 1 hour
- Bearer token authentication in headers

### 4. Zod for Validation

**Decision**: Use Zod instead of class-validator.

```typescript
// Example DTO
export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
```

**Rationale**:
- **Type Inference**: Zod schemas automatically infer TypeScript types
- **Runtime Safety**: Validates data at runtime
- **Composability**: Easy to compose and reuse schemas
- **Developer Experience**: Better error messages and autocomplete

### 5. Global Configuration Module

**Decision**: Use `@nestjs/config` with global scope.

```typescript
ConfigModule.forRoot({
  isGlobal: true,
})
```

**Rationale**:
- **Centralized Config**: Single source of truth for environment variables
- **Type Safety**: Can define typed configuration
- **No Import Needed**: Global scope eliminates repeated imports
- **Validation**: Can validate env vars on startup

## Database Schema Design

### User Model

```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Design Decisions**:
- **Integer ID**: Auto-incrementing for simplicity (can migrate to UUID if needed)
- **Unique Email**: Ensures one account per email address
- **Password Field**: Stores bcrypt hash (never plain text)
- **Timestamps**: Automatic tracking of creation and updates

**Future Considerations**:
- Add `name` field for user profiles
- Add `role` enum for authorization (USER, ADMIN)
- Add `emailVerified` boolean for email verification flow
- Add `refreshToken` field for refresh token rotation

## Service Layer Pattern

**Decision**: Separate business logic into service classes.

```
Controller → Service → Prisma
```

**Rationale**:
- **Single Responsibility**: Controllers handle HTTP, services handle logic
- **Testability**: Services can be unit tested without HTTP layer
- **Reusability**: Services can be injected into multiple controllers
- **Maintainability**: Business logic centralized and easier to modify

## Authentication Flow

### Registration Flow
1. Client sends email + password to `POST /auth/register`
2. `ZodValidationPipe` validates request body
3. `AuthService.register()` hashes password with bcrypt
4. User created in database via Prisma
5. Response returns user info (without password)

### Login Flow
1. Client sends email + password to `POST /auth/login`
2. `ZodValidationPipe` validates request body
3. `AuthService.login()` finds user by email
4. Password compared with bcrypt
5. JWT token generated with user payload
6. Response returns access token

### Protected Route Access
1. Client sends request with `Authorization: Bearer <token>` header
2. `JwtAuthGuard` extracts and validates token
3. `JwtStrategy.validate()` decodes payload
4. User object attached to request
5. Controller accesses user via `@Request() req`

## Error Handling

**Current Implementation**:
- `UnauthorizedException` for invalid credentials
- Zod validation errors automatically formatted by `nestjs-zod`
- Prisma errors (unique constraint, etc.) bubble up as 500 errors

**Improvements Needed**:
- Global exception filter for Prisma errors
- Custom error messages for better UX
- Error logging and monitoring

## Environment Configuration

Required environment variables:

```env
DATABASE_URL="postgresql://..."  # Neon PostgreSQL connection string
JWT_SECRET="..."                 # Secret key for JWT signing
PORT=3000                        # Optional, defaults to 3000
```

## Testing Strategy

**Recommended Approach**:
- **Unit Tests**: Test services in isolation with mocked dependencies
- **Integration Tests**: Test controllers with real database (test container)
- **E2E Tests**: Test complete authentication flows

**Current Status**: Tests not yet implemented (future work)

## Performance Considerations

1. **Connection Pooling**: pg Pool manages database connections
2. **Password Hashing**: Bcrypt is CPU-intensive (consider async operations)
3. **JWT Validation**: Stateless validation is fast (no DB lookup)
4. **Database Indexes**: Email field has unique index for fast lookups

## Security Best Practices

✅ **Implemented**:
- Password hashing with bcrypt
- JWT token expiration
- Environment variable for secrets
- Unique email constraint

⚠️ **Future Improvements**:
- Rate limiting on auth endpoints
- Refresh token rotation
- Email verification
- Password reset flow
- CORS configuration
- Helmet for security headers
- Input sanitization

## Scalability Considerations

**Current Architecture Supports**:
- Horizontal scaling (stateless JWT)
- Database connection pooling
- Neon serverless auto-scaling

**Future Enhancements**:
- Redis for token blacklisting
- Caching layer for frequently accessed data
- Message queue for async operations
- Microservices separation if needed

## Migration Strategy

**Prisma Migrations**:
- Development: `prisma migrate dev`
- Production: `prisma migrate deploy`
- Schema changes tracked in `prisma/migrations/`

**Best Practices**:
- Always review generated SQL
- Test migrations on staging first
- Keep migrations small and focused
- Never edit migration files manually

## Deployment Considerations

**Environment Setup**:
1. Set environment variables (DATABASE_URL, JWT_SECRET)
2. Run migrations: `pnpm exec prisma migrate deploy`
3. Generate Prisma Client: `pnpm exec prisma generate`
4. Build application: `pnpm build`
5. Start server: `pnpm start:prod`

**Neon-Specific**:
- Use connection pooler URL for better performance
- Enable SSL mode (already configured)
- Monitor connection usage in Neon dashboard

## Future Roadmap

### Short-term
- [ ] Add refresh token mechanism
- [ ] Implement role-based access control (RBAC)
- [ ] Add email verification
- [ ] Add password reset flow
- [ ] Write unit and integration tests

### Medium-term
- [ ] Add user profile management
- [ ] Implement OAuth providers (Google, GitHub)
- [ ] Add rate limiting and throttling
- [ ] Set up logging and monitoring
- [ ] Add API documentation (Swagger)

### Long-term
- [ ] Implement microservices architecture
- [ ] Add GraphQL API
- [ ] Set up CI/CD pipeline
- [ ] Add comprehensive E2E tests
- [ ] Performance optimization and caching
