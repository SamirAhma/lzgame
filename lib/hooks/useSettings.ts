'use client';

import { useState, useEffect } from 'react';
import { UserSettings, DEFAULT_SETTINGS } from '@/lib/types/settings';

const STORAGE_KEY = 'amblyopia_settings';

export function useSettings() {
    const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load settings from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                setSettings(parsed);
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        } finally {
            setIsLoaded(true);
        }
    }, []);

    // Save settings to localStorage whenever they change
    const updateSettings = (newSettings: Partial<UserSettings>) => {
        const updated = { ...settings, ...newSettings };
        setSettings(updated);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    };

    const resetToDefaults = () => {
        setSettings(DEFAULT_SETTINGS);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
        } catch (error) {
            console.error('Failed to reset settings:', error);
        }
    };

    return {
        settings,
        updateSettings,
        resetToDefaults,
        isLoaded,
    };
}
