'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserSettings, DEFAULT_SETTINGS } from '@/lib/types/settings';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { getSettings, setSettings as saveSettings } from '@/lib/utils/storage';
import { API_ENDPOINTS } from '@/lib/config/constants';


export function useSettings() {
    const { isAuthenticated } = useAuth();
    const queryClient = useQueryClient();

    const fetchSettings = async (): Promise<UserSettings> => {
        if (!isAuthenticated) {
            // Try to load from local storage
            const local = getSettings();
            if (local) {
                return { ...DEFAULT_SETTINGS, ...local };
            }
            return DEFAULT_SETTINGS;
        }

        try {
            const res = await api.get(API_ENDPOINTS.SETTINGS);
            return res.data || DEFAULT_SETTINGS;
        } catch (error) {
            console.error("Failed to fetch settings from API", error);
            // Fallback to defaults or local storage if API fails
            return DEFAULT_SETTINGS;
        }
    };

    const { data: settings = DEFAULT_SETTINGS, isLoading } = useQuery({
        queryKey: ['settings', isAuthenticated],
        queryFn: fetchSettings,
        // Always enabled, behavior changes based on auth status
        enabled: true,
    });

    const mutation = useMutation({
        mutationFn: async (newSettings: Partial<UserSettings>) => {
            const updated = { ...settings, ...newSettings };

            if (!isAuthenticated) {
                // Save to local storage
                saveSettings(updated);
                return updated;
            }

            // Authenticated: Save to backend
            await api.put(API_ENDPOINTS.SETTINGS, updated);
            return updated;
        },
        onSuccess: (data) => {
            queryClient.setQueryData(['settings', isAuthenticated], data);
            queryClient.invalidateQueries({ queryKey: ['settings'] });
        },
    });

    const updateSettings = (newSettings: Partial<UserSettings>) => {
        mutation.mutate(newSettings);
    };

    const resetToDefaults = () => {
        mutation.mutate(DEFAULT_SETTINGS);
    };

    return {
        settings,
        updateSettings,
        resetToDefaults,
        isLoaded: !isLoading,
    };
}
