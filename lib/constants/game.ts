// Tetris Game Constants
export const TETRIS = {
    BOARD_WIDTH: 10,
    BOARD_HEIGHT: 20,
    CELL_SIZE: 30,
    INITIAL_SPEED: 1000, // milliseconds
} as const;

// Snake Game Constants
export const SNAKE = {
    GRID_SIZE: 20,
    CELL_SIZE: 25,
    INITIAL_SPEED: 150, // milliseconds
} as const;

// Game Controls
export const CONTROLS = {
    PAUSE: ['p', 'P'],
    ARROW_UP: 'ArrowUp',
    ARROW_DOWN: 'ArrowDown',
    ARROW_LEFT: 'ArrowLeft',
    ARROW_RIGHT: 'ArrowRight',
    SPACE: ' ',
} as const;

// Score Constants
export const SCORE = {
    MAX_HIGH_SCORES: 10,
    TETRIS_LINE_POINTS: 100,
    SNAKE_FOOD_POINTS: 10,
} as const;

// Storage Keys
export const STORAGE_KEYS = {
    HIGH_SCORES: 'amblyopia_high_scores',
    SETTINGS: 'amblyopia_settings',
} as const;
