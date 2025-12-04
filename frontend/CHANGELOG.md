# Changelog

All notable changes to this project will be documented in this file.

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

