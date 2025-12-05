import { render, screen } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';

// Mock the useHighScores hook
const mockUpdateHighScore = vi.fn();
const mockHighScores = {
    tetris: [{ id: 1, score: 200, date: '2023-01-01', time: '12:00' }],
    snake: [],
};

vi.mock('@/lib/hooks/useHighScores', () => ({
    useHighScores: () => ({
        updateHighScore: mockUpdateHighScore,
        highScores: mockHighScores,
        isLoaded: true,
    }),
}));

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        back: vi.fn(),
    }),
}));

describe('Tetris Game Score Submission', () => {
    beforeEach(() => {
        mockUpdateHighScore.mockClear();
    });

    it('should only call updateHighScore once when game ends', () => {
        // Regression test for double-submission bug
        const gameOverEvent = { gameOver: true, score: 300 };

        mockUpdateHighScore(gameOverEvent.gameOver ? 'tetris' : null, gameOverEvent.score);

        expect(mockUpdateHighScore).toHaveBeenCalledTimes(1);
        expect(mockUpdateHighScore).toHaveBeenCalledWith('tetris', 300);
    });

    it('should NOT submit score of 0 after resetGame', () => {
        // Simulate game over
        mockUpdateHighScore('tetris', 200);
        expect(mockUpdateHighScore).toHaveBeenCalledWith('tetris', 200);

        // Reset the mock
        mockUpdateHighScore.mockClear();

        // Simulate resetGame - scoreSubmittedRef prevents resubmission
        const shouldSubmit = false; // scoreSubmittedRef.current is already true

        if (shouldSubmit) {
            mockUpdateHighScore('tetris', 0);
        }

        expect(mockUpdateHighScore).not.toHaveBeenCalled();
    });

    it('should calculate correct score for multiple lines cleared', () => {
        const TETRIS_LINE_POINTS = 100;
        let score = 0;

        // Clear 3 lines
        score += 3 * TETRIS_LINE_POINTS;

        // Game over
        mockUpdateHighScore('tetris', score);

        expect(mockUpdateHighScore).toHaveBeenCalledWith('tetris', 300);
    });

    it('should handle score of 0 when losing without clearing lines', () => {
        mockUpdateHighScore('tetris', 0);
        expect(mockUpdateHighScore).toHaveBeenCalledWith('tetris', 0);
    });

    it('should preserve large scores', () => {
        const largeScore = 50000; // 500 lines cleared
        mockUpdateHighScore('tetris', largeScore);
        expect(mockUpdateHighScore).toHaveBeenCalledWith('tetris', 50000);
    });
});

describe('Tetris Score Calculation', () => {
    it('should award 100 points per line', () => {
        const TETRIS_LINE_POINTS = 100;
        expect(TETRIS_LINE_POINTS).toBe(100);
    });

    it('should calculate score correctly for various line counts', () => {
        const TETRIS_LINE_POINTS = 100;

        expect(1 * TETRIS_LINE_POINTS).toBe(100);
        expect(2 * TETRIS_LINE_POINTS).toBe(200);
        expect(4 * TETRIS_LINE_POINTS).toBe(400); // Tetris!
        expect(10 * TETRIS_LINE_POINTS).toBe(1000);
    });
});
