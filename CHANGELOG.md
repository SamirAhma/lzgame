# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

## [2025-12-05] - Refresh Token Implementation

### Added

#### Backend - Refresh Token System
- **Database Schema**: Added `refreshToken` and `refreshTokenExpiry` fields to User model
  - Migration: `20251204182438_add_refresh_token`
  - Stores hashed refresh tokens for security
  - Tracks token expiration dates

- **Authentication Service Enhancements**:
  - `login()` now generates both access token (3min) and refresh token (7 days)
  - `refreshAccessToken()` validates refresh token and issues new access token
  - `logout()` invalidates refresh token in database
  - Refresh tokens are hashed with bcrypt before storage

- **New API Endpoints**:
  - `POST /auth/refresh` - Refresh access token using refresh token
  - `POST /auth/logout` - Logout and invalidate refresh token

- **Comprehensive Test Suite**:
  - 17 passing backend tests (100% success rate)
  - Unit tests for AuthService covering all refresh token flows
  - Unit tests for AuthController endpoints
  - Tests cover: token generation, validation, expiration, and logout

#### Frontend - Automatic Token Refresh
- **API Client Enhancements** (`lib/api.ts`):
  - Automatic token refresh on 401 errors
  - Request queuing during token refresh to prevent race conditions
  - Graceful session expiration handling with redirect to login
  - New `logout()` function for proper cleanup

- **Login Flow Updates**:
  - Stores both access and refresh tokens in localStorage
  - Seamless token refresh without user intervention

### Changed

#### Token Expiry Configuration
- **Testing Phase**: Access token expires in 3 minutes (for easy testing)
- **Production Ready**: Can be changed to 1 hour by updating `expiresIn` in auth.service.ts
- Refresh token: 7 days (both testing and production)

### Technical Details

#### Security Improvements
- Refresh tokens are hashed before database storage (bcrypt)
- Tokens are validated against database on each refresh
- Expired refresh tokens are rejected
- Logout properly invalidates tokens server-side

#### Frontend Token Refresh Flow
1. API request receives 401 Unauthorized
2. Client automatically attempts token refresh
3. If refresh succeeds, original request is retried with new token
4. If refresh fails, user is redirected to login
5. Concurrent requests are queued during refresh

### Files Modified

**Backend**:
- `backend/prisma/schema.prisma` - Added refresh token fields
- `backend/src/auth/auth.service.ts` - Implemented refresh token logic
- `backend/src/auth/auth.controller.ts` - Added refresh and logout endpoints
- `backend/src/auth/dto/refresh-token.dto.ts` - NEW DTO for refresh requests
- `backend/src/auth/auth.service.spec.ts` - Comprehensive unit tests
- `backend/src/auth/auth.controller.spec.ts` - Fixed with proper mocking

**Frontend**:
- `frontend/lib/api.ts` - Added automatic token refresh logic
- `frontend/app/login/page.tsx` - Store refresh token on login

### Testing

#### Backend Tests
```bash
pnpm test  # 17/17 tests passing
```

#### Frontend Tests
```bash
pnpm test  # 9/9 tests passing
```

### Migration Guide

To apply this update:
1. Run `npx prisma migrate dev` in backend directory
2. Restart backend server
3. Rebuild frontend
4. Test login flow - tokens will auto-refresh after 3 minutes


## [2025-12-05] - README Documentation Update

### Changed

#### README.md Complete Rewrite
- **What**: Completely rewrote root README.md to accurately reflect the full-stack project structure
- **Why**: Previous README was a generic NestJS template that didn't match the actual project
- **Details**:
  - Added comprehensive project overview describing Lazy Eye Game application
  - Documented complete tech stack:
    - Backend: NestJS, Prisma, PostgreSQL (Neon), JWT, Zod, Passport
    - Frontend: Next.js 16, React 19, TailwindCSS, React Query, React Hook Form, Vitest
  - Added prerequisites section (Node.js, pnpm, PostgreSQL)
  - Documented environment setup for both frontend and backend
  - Added database setup instructions with Prisma commands
  - Documented all available npm scripts from root package.json:
    - `pnpm run install:all` - Install all dependencies
    - `pnpm run dev` - Run both frontend and backend
    - `pnpm run dev:frontend` - Run frontend only
    - `pnpm run dev:backend` - Run backend only
    - `pnpm run build` - Build both applications
    - `pnpm run test:frontend` - Run frontend tests
    - `pnpm run test:backend` - Run backend tests
  - Added project structure overview
  - Created comprehensive scripts reference table
  - Added links to ARCHITECTURE.md and CHANGELOG.md

### Verified

#### Installation Command
- ✅ `pnpm run install:all` - Successfully installs dependencies in root, frontend, and backend
- Completed in ~10 seconds
- All packages installed correctly

#### Build Command
- ✅ `pnpm run build` - Successfully builds both frontend and backend
- Frontend: Next.js build completed with 7 routes (all static)
- Backend: NestJS build completed successfully
- No build errors

#### Development Servers
- ✅ Backend dev server running on http://localhost:3001
- ✅ Frontend dev server running on http://localhost:3000
- Both servers confirmed operational

#### Test Commands
- ✅ `pnpm run test:frontend` - Frontend tests pass (9/9 tests passed)
  - 2 test files: register.test.tsx and login.test.tsx
  - All tests completed in ~3 seconds
- ⚠️ `pnpm run test:backend` - Backend tests fail due to missing test mocks
  - Issue: Test files need proper dependency mocking (AuthService, PrismaService)
  - Note: This is a test setup issue, not a README documentation issue
  - The command itself works correctly as documented

### Technical Notes
- All documented commands match the actual package.json scripts
- Environment variable setup documented but .env files are gitignored (as expected)
- README now serves as accurate onboarding documentation for new developers
- Verification confirms all installation and build instructions work correctly

### Files Modified
- `README.md` - Complete rewrite with accurate project documentation

## [Unreleased]


### Added
- Frontend testing infrastructure using Vitest and React Testing Library.
- Unit/Integration tests for Login and Register pages.
- Root `package.json` for managing full-stack application.

### Fixed
- Accessibility issues in Login and Register forms (missing `htmlFor` and `id` attributes).

### Added - 2025-12-04

#### Backend Authentication System
- **NestJS Authentication Module**: Implemented complete authentication system with JWT tokens
  - User registration endpoint (`POST /auth/register`)
  - User login endpoint (`POST /auth/login`)
  - Protected profile endpoint (`GET /auth/profile`)
  
- **Database Layer**:
  - Prisma 7 integration with Neon PostgreSQL
  - User model with email (unique), password (hashed), timestamps
  - Initial migration: `20251204090252_init`
  - Prisma adapter pattern for Prisma 7 compatibility (`@prisma/adapter-pg`)

- **Security Features**:
  - Password hashing with bcrypt (salt rounds: 10)
  - JWT token generation and validation
  - Passport JWT strategy for route protection
  - JWT expiration: 1 hour

- **Validation**:
  - Zod schema validation for DTOs
  - Email format validation
  - Password minimum length: 6 characters

- **Dependencies**:
  - `@nestjs/passport`, `passport`, `passport-jwt` - Authentication
  - `@nestjs/jwt` - JWT token management
  - `bcrypt` - Password hashing
  - `zod`, `nestjs-zod` - Request validation
  - `@prisma/client`, `prisma` - Database ORM
  - `@prisma/adapter-pg`, `pg` - PostgreSQL driver adapter
  - `@nestjs/config` - Environment configuration

### Technical Details

#### Prisma 7 Migration
- Adapted to Prisma 7's breaking changes:
  - Removed `url` from datasource block in `schema.prisma`
  - Implemented driver adapter pattern with `PrismaPg`
  - Database URL configured via `prisma.config.ts` and environment variables

#### Architecture Decisions
- Modular structure: Separate `PrismaModule` and `AuthModule`
- Global configuration with `ConfigModule`
- Reusable `JwtAuthGuard` for protecting routes
- Service-based architecture for business logic separation

### Files Created
- `backend/prisma/schema.prisma` - Database schema
- `backend/prisma/migrations/20251204090252_init/` - Initial migration
- `backend/src/prisma/prisma.service.ts` - Database service
- `backend/src/prisma/prisma.module.ts` - Prisma module
- `backend/src/auth/auth.service.ts` - Authentication business logic
- `backend/src/auth/auth.controller.ts` - Authentication endpoints
- `backend/src/auth/auth.module.ts` - Auth module configuration
- `backend/src/auth/jwt.strategy.ts` - JWT validation strategy
- `backend/src/auth/jwt-auth.guard.ts` - Route protection guard
- `backend/src/auth/dto/login.dto.ts` - Login validation schema
- `backend/src/auth/dto/register.dto.ts` - Registration validation schema

### Files Modified
- `backend/src/app.module.ts` - Added ConfigModule and AuthModule
- `backend/.env` - Added DATABASE_URL and JWT_SECRET




## [2025-12-04] - Score Display & Navigation Fixes

### Changed

#### 1. High Score Display (app/page.tsx)
- **What**: Updated both Tetris and Snake game cards to display top 10 high scores instead of only the highest score
- **Why**: User reported that only 1 score was being shown when the system was designed to track 10 scores
- **Details**:
  - Changed "High Score" label to "Top 10 Scores"
  - Added scrollable list with max-height of 48 (overflow-y-auto)
  - Each score entry now shows:
    - Ranking number (#1, #2, etc.)
    - Score value with gradient styling
    - Date and time of achievement
  - Special styling for top 3 scores:
    - #1: Gold/yellow highlight with border
    - #2: Silver/slate color
    - #3: Bronze/orange color
  - Badge now shows count of scores (e.g., "🏆 5 Scores")

#### 2. Back Button Navigation (components/games/Tetris.tsx & Snake.tsx)
- **What**: Fixed non-working back button in both games
- **Why**: User reported that the back button was not functioning
- **Details**:
  - Replaced `Link` component from `next/link` with `useRouter` from `next/navigation`
  - Changed from declarative `<Link href="/">` to imperative `<button onClick={() => router.push('/')}`
  - This provides more reliable navigation, especially in client components with game state
  - Maintains all styling and positioning (absolute top-4 left-4)

### Technical Notes
- The `useHighScores` hook already supported storing 10 scores (slice(0, 10) on line 70)
- No backend changes were needed - only UI updates
- All changes are client-side only
- Scrollbar styling uses Tailwind's scrollbar utilities for consistent appearance

---

## [2025-12-04] - Code Refactoring for Modularity & Maintainability

### Added

#### 1. Reusable UI Components (components/ui/)
- **ScoreCard.tsx**: Reusable component for displaying top scores
  - Configurable accent colors (cyan/pink)
  - Automatic ranking with special styling for top 3
  - Scrollable list with custom scrollbar
  - Proper TypeScript typing with ScoreCardProps interface
  
- **BackButton.tsx**: Reusable navigation button
  - Uses Next.js useRouter for reliable navigation
  - Accepts className prop for flexible positioning
  - Includes aria-label for accessibility
  
- **GameOverlay.tsx**: Reusable overlay for game states
  - Handles both game over and pause states
  - Accepts children for custom content
  - Conditional rendering based on isVisible prop

- **GameCard.tsx**: Reusable game selection card (for home page)
  - Configurable colors, icons, and content
  - Integrates ScoreCard component
  - Responsive hover effects
  - Proper TypeScript typing

#### 2. Constants File (lib/constants/game.ts)
- **Why**: Eliminate magic numbers and centralize configuration
- **Contents**:
  - `TETRIS`: Board dimensions, cell size, initial speed
  - `SNAKE`: Grid size, cell size, initial speed
  - `CONTROLS`: Keyboard controls (arrows, pause, space)
  - `SCORE`: Points per action, max high scores
  - `STORAGE_KEYS`: LocalStorage key names
- **Benefits**: 
  - Single source of truth for game configuration
  - Easy to adjust game difficulty
  - Type-safe with `as const` assertion

### Changed

#### 3. Tetris Component Refactoring (components/games/Tetris.tsx)
- Replaced inline back button with `<BackButton />` component
- Replaced inline overlays with `<GameOverlay />` component
- Imported constants from centralized file
- Replaced magic numbers:
  - `100` → `SCORE.TETRIS_LINE_POINTS`
  - `'ArrowLeft'` → `CONTROLS.ARROW_LEFT`
  - etc.
- **Result**: ~50 lines of code reduced, improved readability

#### 4. Snake Component Refactoring (components/games/Snake.tsx)
- Same refactoring as Tetris component
- Replaced magic numbers:
  - `10` → `SCORE.SNAKE_FOOD_POINTS`
  - Control keys → `CONTROLS.*`
- **Result**: ~50 lines of code reduced, improved readability

#### 5. useHighScores Hook Refactoring (lib/hooks/useHighScores.ts)
- Replaced hardcoded storage key with `STORAGE_KEYS.HIGH_SCORES`
- Replaced `slice(0, 10)` with `SCORE.MAX_HIGH_SCORES`
- **Benefits**: Easier to change max scores in the future

### Benefits of Refactoring

1. **DRY Principle**: Eliminated code duplication across components
2. **Single Responsibility**: Each component has one clear purpose
3. **Type Safety**: Strong TypeScript typing throughout
4. **Maintainability**: Changes to UI elements only need to be made once
5. **Testability**: Smaller, focused components are easier to test
6. **Scalability**: Easy to add new games using existing components
7. **Configuration**: All game settings in one place
8. **Readability**: Self-documenting code with named constants

### File Structure After Refactoring

```
components/
├── ui/
│   ├── ScoreCard.tsx      (NEW - reusable score display)
│   ├── BackButton.tsx     (NEW - reusable navigation)
│   ├── GameOverlay.tsx    (NEW - reusable overlay)
│   └── GameCard.tsx       (NEW - reusable game card)
├── games/
│   ├── Tetris.tsx         (REFACTORED - cleaner, uses components)
│   └── Snake.tsx          (REFACTORED - cleaner, uses components)
lib/
├── constants/
│   └── game.ts            (NEW - centralized configuration)
├── hooks/
│   └── useHighScores.ts   (REFACTORED - uses constants)
```

### Migration Notes
- All changes are backward compatible
- No database or localStorage structure changes
- Existing high scores will continue to work
- No breaking changes to public APIs

