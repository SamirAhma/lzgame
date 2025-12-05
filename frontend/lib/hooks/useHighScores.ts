'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { HighScores, DEFAULT_SCORES } from '@/lib/types/scores';
import { SCORE } from '@/lib/constants/game';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { API_ENDPOINTS } from '@/lib/config/constants';

import { getHighScores, setHighScores as saveHighScores } from '@/lib/utils/storage';

export function useHighScores() {
    const { isAuthenticated } = useAuth();
    const queryClient = useQueryClient();

    const fetchHighScores = async (): Promise<HighScores> => {
        if (!isAuthenticated) {
            const local = getHighScores();
            if (local) {
                return local;
            }
            return DEFAULT_SCORES;
        }

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
        // Always enabled now to support local storage
        enabled: true,
    });

    const mutation = useMutation({
        mutationFn: async ({ game, score }: { game: keyof HighScores; score: number }) => {
            const now = new Date();
            const date = now.toLocaleDateString();
            const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            // --- ADD CHECK HERE ---
            if (score === 0) {
                console.log(`Local score of 0 rejected for game: ${game}`);
                return; // Stop the mutation if score is 0
            }

            if (!isAuthenticated) {
                // Update local storage
                const currentScores = getHighScores() || DEFAULT_SCORES;
                const newScores = { ...currentScores };

                // Add new score
                newScores[game] = [
                    ...newScores[game],
                    { score, date, time }
                ].sort((a, b) => b.score - a.score) // Sort descending
                    .slice(0, 10); // Keep top 10

                saveHighScores(newScores);
                return newScores;
            }

            // Authenticated: Save to backend
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
        mutation.mutate({ game, score });
    };

    return {
        highScores,
        updateHighScore,
        isLoaded: !isLoading
    };
}
