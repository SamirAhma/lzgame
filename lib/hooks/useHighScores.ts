'use client';

import { useState, useEffect } from 'react';
import { HighScores, DEFAULT_SCORES } from '@/lib/types/scores';

const STORAGE_KEY = 'amblyopia_high_scores';

export function useHighScores() {
    const [highScores, setHighScores] = useState<HighScores>(DEFAULT_SCORES);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setHighScores(JSON.parse(stored));
            }
        } catch (error) {
            console.error('Failed to load high scores:', error);
        } finally {
            setIsLoaded(true);
        }
    }, []);

    const updateHighScore = (game: keyof HighScores, score: number) => {
        setHighScores((prev) => {
            let currentScores = prev[game];

            // Handle legacy data (single number) or undefined
            if (typeof currentScores === 'number') {
                currentScores = [currentScores];
            } else if (!Array.isArray(currentScores)) {
                currentScores = [];
            }

            const newScoresList = [...currentScores, score]
                .sort((a, b) => b - a)
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
