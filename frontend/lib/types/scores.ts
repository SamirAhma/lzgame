export interface ScoreEntry {
    score: number;
    date: string;
    time: string;
}

export interface HighScores {
    tetris: ScoreEntry[];
    snake: ScoreEntry[];
}

export const DEFAULT_SCORES: HighScores = {
    tetris: [],
    snake: [],
};
