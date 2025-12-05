'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { HighScores, DEFAULT_SCORES } from '@/lib/types/scores';
import { SCORE } from '@/lib/constants/game';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { API_ENDPOINTS } from '@/lib/config/constants';

export function useHighScores() {
    const { isAuthenticated } = useAuth();
    const queryClient = useQueryClient();

    const fetchHighScores = async (): Promise<HighScores> => {
        if (!isAuthenticated) return DEFAULT_SCORES;

        try {
            const [tetris, snake] = await Promise.all([
                api.get(API_ENDPOINTS.SCORES_TETRIS).then(res => res.data),
                api.get(API_ENDPOINTS.SCORES_SNAKE).then(res => res.data)
            ]);

            return { tetris, snake };
        } catch (error) {
            console.error("Failed to fetch high scores from API", error);
            // Return empty scores on error to avoid crashing
            return DEFAULT_SCORES;
        }
    };

    const { data: highScores = DEFAULT_SCORES, isLoading } = useQuery({
        queryKey: ['highScores', isAuthenticated],
        queryFn: fetchHighScores,
        enabled: isAuthenticated,
    });

    const mutation = useMutation({
        mutationFn: async ({ game, score }: { game: keyof HighScores; score: number }) => {
            if (!isAuthenticated) return;
            // Generate basic date/time string for backend validation reqs
            // though backend might overwrite it with server time
            const now = new Date();
            const date = now.toLocaleDateString();
            const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            await api.post(API_ENDPOINTS.SCORES, {
                game,
                score,
                date,
                time
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['highScores'] });
        },
    });

    const updateHighScore = (game: keyof HighScores, score: number) => {
        if (!isAuthenticated) {
            console.warn("User not authenticated, score not saved to backend.");
            // Could implement local fallback here if requested
            return;
        }
        mutation.mutate({ game, score });
    };

    return {
        highScores,
        updateHighScore,
        isLoaded: isAuthenticated ? !isLoading : true // If not auth, we are "loaded" with defaults
    };
}
