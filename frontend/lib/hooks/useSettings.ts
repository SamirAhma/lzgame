'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserSettings, DEFAULT_SETTINGS } from '@/lib/types/settings';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';


export function useSettings() {
    const { isAuthenticated } = useAuth();
    const queryClient = useQueryClient();

    const fetchSettings = async (): Promise<UserSettings> => {
        if (!isAuthenticated) {
            // Try to load from local storage
            if (typeof window !== 'undefined') {
                const local = localStorage.getItem('lazy_eye_settings');
                if (local) {
                    try {
                        return { ...DEFAULT_SETTINGS, ...JSON.parse(local) };
                    } catch (e) {
                        console.error("Failed to parse local settings", e);
                    }
                }
            }
            return DEFAULT_SETTINGS;
        }

        try {
            const res = await api.get('/settings');
            return res.data || DEFAULT_SETTINGS;
        } catch (error) {
            console.error("Failed to fetch settings from API", error);
            // Fallback to defaults or local storage if API fails?
            // For now, let's return defaults to avoid crashing
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
                localStorage.setItem('lazy_eye_settings', JSON.stringify(updated));
                return updated;
            }

            // Authenticated: Save to backend
            await api.put('/settings', updated);
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
