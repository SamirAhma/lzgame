'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserSettings, DEFAULT_SETTINGS } from '@/lib/types/settings';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export function useSettings() {
    const { isAuthenticated } = useAuth();
    const queryClient = useQueryClient();

    const fetchSettings = async (): Promise<UserSettings> => {
        if (!isAuthenticated) return DEFAULT_SETTINGS;
        const res = await api.get('/settings');
        // If no settings result (e.g. 204 or null), return defaults
        // Need to make sure backend returns something usable even if empty
        return res.data || DEFAULT_SETTINGS;
    };

    const { data: settings = DEFAULT_SETTINGS, isLoading } = useQuery({
        queryKey: ['settings', isAuthenticated],
        queryFn: fetchSettings,
        enabled: isAuthenticated,
    });

    const mutation = useMutation({
        mutationFn: async (newSettings: Partial<UserSettings>) => {
            if (!isAuthenticated) return;
            // Merge current settings with new ones for the API call 
            // OR the backend handles partial updates. 
            // Implementation Plan said PUT /settings, so we should send full object or backend supports partial.
            // Let's assume we send the updated fields and backend merges or we send full.

            // To do it right with PUT, we should usually send the full resource. 
            // But let's send what changed and let backend handle it or merge here.
            // Safe bet: merge with current state.
            const updated = { ...settings, ...newSettings };
            await api.put('/settings', updated);
            return updated;
        },
        onSuccess: (data) => {
            queryClient.setQueryData(['settings', isAuthenticated], data);
            queryClient.invalidateQueries({ queryKey: ['settings'] });
        },
    });

    const updateSettings = (newSettings: Partial<UserSettings>) => {
        if (!isAuthenticated) {
            // Local Fallback or simple no-op with warning
            return;
        }
        mutation.mutate(newSettings);
    };

    const resetToDefaults = () => {
        if (!isAuthenticated) return;
        mutation.mutate(DEFAULT_SETTINGS);
    };

    return {
        settings,
        updateSettings,
        resetToDefaults,
        isLoaded: isAuthenticated ? !isLoading : true,
    };
}
