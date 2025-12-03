'use client';

import { useState, useEffect } from 'react';
import { HighScores, DEFAULT_SCORES, ScoreEntry } from '@/lib/types/scores';

const STORAGE_KEY = 'amblyopia_high_scores';

export function useHighScores() {
    const [highScores, setHighScores] = useState<HighScores>(DEFAULT_SCORES);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                // Migration logic: ensure all entries are ScoreEntry objects
                const migrateScores = (scores: any): ScoreEntry[] => {
                    if (typeof scores === 'number') {
                        return [{
                            score: scores,
                            date: new Date().toLocaleDateString(),
                            time: '--:--'
                        }];
                    }
                    if (!Array.isArray(scores)) return [];

                    return scores.map((s: any) => {
                        if (typeof s === 'number') {
                            return {
                                score: s,
                                date: new Date().toLocaleDateString(),
                                time: '--:--'
                            };
                        }
                        // Add time field if missing (for backward compatibility)
                        if (!s.time) {
                            return { ...s, time: '--:--' };
                        }
                        return s;
                    });
                };

                const migrated: HighScores = {
                    tetris: migrateScores(parsed.tetris),
                    snake: migrateScores(parsed.snake),
                };
                setHighScores(migrated);
            }
        } catch (error) {
            console.error('Failed to load high scores:', error);
        } finally {
            setIsLoaded(true);
        }
    }, []);

    const updateHighScore = (game: keyof HighScores, score: number) => {
        setHighScores((prev) => {
            const currentScores = prev[game] || [];

            const now = new Date();
            const newEntry: ScoreEntry = {
                score,
                date: now.toLocaleDateString(),
                time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            const newScoresList = [...currentScores, newEntry]
                .sort((a, b) => b.score - a.score)
                .slice(0, 10);

            const newScores = { ...prev, [game]: newScoresList };
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(newScores));
            } catch (error) {
                console.error('Failed to save high scores:', error);
            }
            return newScores;
        });
    };

    return { highScores, updateHighScore, isLoaded };
}
