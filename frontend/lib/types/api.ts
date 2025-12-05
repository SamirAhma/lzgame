/**
 * API Response Type Definitions
 * Type-safe interfaces for all API responses
 */

import { ScoreEntry } from './scores';
import { UserSettings } from './settings';

// Authentication Responses
export interface LoginResponse {
    access_token: string;
    refresh_token: string;
}

export interface RefreshResponse {
    access_token: string;
}

export interface RegisterResponse {
    id: number;
    email: string;
    createdAt: string;
    updatedAt: string;
}

export interface ProfileResponse {
    id: number;
    email: string;
}

// Score Responses
export type ScoreResponse = ScoreEntry[];

// Settings Response
export type SettingsResponse = UserSettings;

// Generic API Error
export interface ApiError {
    message: string;
    statusCode: number;
    error?: string;
}
