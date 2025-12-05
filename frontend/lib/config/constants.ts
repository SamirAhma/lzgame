/**
 * Application-wide constants
 * Centralized location for all magic strings, numbers, and configuration values
 */

// LocalStorage Keys
export const STORAGE_KEYS = {
    TOKEN: 'token',
    REFRESH_TOKEN: 'refreshToken',
    SETTINGS: 'lazy_eye_settings',
} as const;

// API Endpoints
export const API_ENDPOINTS = {
    // Auth
    AUTH_LOGIN: '/auth/login',
    AUTH_REGISTER: '/auth/register',
    AUTH_REFRESH: '/auth/refresh',
    AUTH_LOGOUT: '/auth/logout',
    AUTH_VERIFY_EMAIL: '/auth/verify-email',
    AUTH_RESEND_VERIFICATION: '/auth/resend-verification',
    AUTH_FORGOT_PASSWORD: '/auth/forgot-password',
    AUTH_RESET_PASSWORD: '/auth/reset-password',
    AUTH_PROFILE: '/auth/profile',

    // Settings
    SETTINGS: '/settings',

    // Scores
    SCORES: '/scores',
    SCORES_TETRIS: '/scores/tetris',
    SCORES_SNAKE: '/scores/snake',
} as const;

// Timeouts and Delays (in milliseconds)
export const TIMEOUTS = {
    REDIRECT_DELAY: 3000,           // Delay before redirecting after success
    TETRIS_MERGE_DELAY: 50,         // Delay before merging piece in Tetris
    TETRIS_GAME_LOOP: 1000,         // Tetris game loop interval
} as const;

// Custom Events
export const CUSTOM_EVENTS = {
    AUTH_LOGOUT: 'auth:logout',
} as const;
