/**
 * Type-safe localStorage wrapper
 * Handles SSR safety and provides centralized storage access
 */

import { STORAGE_KEYS } from '@/lib/config/constants';
import { UserSettings } from '@/lib/types/settings';

/**
 * Check if we're in a browser environment
 */
function isBrowser(): boolean {
    return typeof window !== 'undefined';
}

/**
 * Safely get an item from localStorage
 */
function getItem(key: string): string | null {
    if (!isBrowser()) return null;
    try {
        return localStorage.getItem(key);
    } catch (error) {
        console.error(`Error reading from localStorage (${key}):`, error);
        return null;
    }
}

/**
 * Safely set an item in localStorage
 */
function setItem(key: string, value: string): void {
    if (!isBrowser()) return;
    try {
        localStorage.setItem(key, value);
    } catch (error) {
        console.error(`Error writing to localStorage (${key}):`, error);
    }
}

/**
 * Safely remove an item from localStorage
 */
function removeItem(key: string): void {
    if (!isBrowser()) return;
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error(`Error removing from localStorage (${key}):`, error);
    }
}

// Token Management
export function getToken(): string | null {
    return getItem(STORAGE_KEYS.TOKEN);
}

export function setToken(token: string): void {
    setItem(STORAGE_KEYS.TOKEN, token);
}

export function removeToken(): void {
    removeItem(STORAGE_KEYS.TOKEN);
}

// Refresh Token Management
export function getRefreshToken(): string | null {
    return getItem(STORAGE_KEYS.REFRESH_TOKEN);
}

export function setRefreshToken(token: string): void {
    setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
}

export function removeRefreshToken(): void {
    removeItem(STORAGE_KEYS.REFRESH_TOKEN);
}

// Settings Management
export function getSettings(): UserSettings | null {
    const data = getItem(STORAGE_KEYS.SETTINGS);
    if (!data) return null;

    try {
        return JSON.parse(data) as UserSettings;
    } catch (error) {
        console.error('Error parsing settings from localStorage:', error);
        return null;
    }
}

export function setSettings(settings: UserSettings): void {
    try {
        setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
        console.error('Error saving settings to localStorage:', error);
    }
}

export function removeSettings(): void {
    removeItem(STORAGE_KEYS.SETTINGS);
}

// Scores Management
import { HighScores } from '@/lib/types/scores';

export function getHighScores(): HighScores | null {
    const data = getItem(STORAGE_KEYS.SCORES);
    if (!data) return null;

    try {
        return JSON.parse(data) as HighScores;
    } catch (error) {
        console.error('Error parsing scores from localStorage:', error);
        return null;
    }
}

export function setHighScores(scores: HighScores): void {
    try {
        setItem(STORAGE_KEYS.SCORES, JSON.stringify(scores));
    } catch (error) {
        console.error('Error saving scores to localStorage:', error);
    }
}

export function removeAllScores(): void {
    removeItem(STORAGE_KEYS.SCORES);
}

// Clear all auth-related data
export function clearAuthData(): void {
    removeToken();
    removeRefreshToken();
}

// Clear all app data
export function clearAllData(): void {
    clearAuthData();
    removeSettings();
}
