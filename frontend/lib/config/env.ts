/**
 * Type-safe environment variable access
 * Provides validated access to environment variables with fallbacks
 */

interface EnvConfig {
    apiUrl: string;
    isDevelopment: boolean;
    isProduction: boolean;
}

/**
 * Get the API base URL from environment variables
 * Falls back to localhost:3001 if not set
 */
export function getApiUrl(): string {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
}

/**
 * Check if running in development mode
 */
export function isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development';
}

/**
 * Check if running in production mode
 */
export function isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
}

/**
 * Get all environment configuration
 */
export function getEnvConfig(): EnvConfig {
    return {
        apiUrl: getApiUrl(),
        isDevelopment: isDevelopment(),
        isProduction: isProduction(),
    };
}
