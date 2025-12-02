'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useHighScores } from '@/lib/hooks/useHighScores';

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const CELL_SIZE = 30;

type Cell = 'empty' | 'active' | 'static';
type Board = Cell[][];

const TETROMINOS = {
    I: [[1, 1, 1, 1]],
    O: [
        [1, 1],
        [1, 1],
    ],
    T: [
        [0, 1, 0],
        [1, 1, 1],
    ],
    S: [
        [0, 1, 1],
        [1, 1, 0],
    ],
    Z: [
        [1, 1, 0],
        [0, 1, 1],
    ],
    J: [
        [1, 0, 0],
        [1, 1, 1],
    ],
    L: [
        [0, 0, 1],
        [1, 1, 1],
    ],
};

type TetrominoType = keyof typeof TETROMINOS;

interface Piece {
    shape: number[][];
    x: number;
    y: number;
    type: TetrominoType;
}

export default function TetrisGame() {
    const [board, setBoard] = useState<Board>(() =>
        Array(BOARD_HEIGHT)
            .fill(null)
            .map(() => Array(BOARD_WIDTH).fill('empty'))
    );
    const [currentPiece, setCurrentPiece] = useState<Piece | null>(null);
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
    const { updateHighScore, highScores } = useHighScores();

    const createNewPiece = useCallback((): Piece => {
        const types = Object.keys(TETROMINOS) as TetrominoType[];
        const type = types[Math.floor(Math.random() * types.length)];
        return {
            shape: TETROMINOS[type],
            x: Math.floor(BOARD_WIDTH / 2) - 1,
            y: 0,
            type,
        };
    }, []);

    const checkCollision = useCallback(
        (piece: Piece, offsetX = 0, offsetY = 0): boolean => {
            for (let y = 0; y < piece.shape.length; y++) {
                for (let x = 0; x < piece.shape[y].length; x++) {
                    if (piece.shape[y][x]) {
                        const newX = piece.x + x + offsetX;
                        const newY = piece.y + y + offsetY;

                        if (
                            newX < 0 ||
                            newX >= BOARD_WIDTH ||
                            newY >= BOARD_HEIGHT ||
                            (newY >= 0 && board[newY][newX] === 'static')
                        ) {
                            return true;
                        }
                    }
                }
            }
            return false;
        },
        [board]
    );

    const mergePiece = useCallback(() => {
        if (!currentPiece) return;

        const newBoard = board.map((row) => [...row]);
        for (let y = 0; y < currentPiece.shape.length; y++) {
            for (let x = 0; x < currentPiece.shape[y].length; x++) {
                if (currentPiece.shape[y][x]) {
                    const boardY = currentPiece.y + y;
                    const boardX = currentPiece.x + x;
                    if (boardY >= 0) {
                        newBoard[boardY][boardX] = 'static';
                    }
                }
            }
        }

        // Check for completed lines
        let linesCleared = 0;
        for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
            if (newBoard[y].every((cell) => cell === 'static')) {
                newBoard.splice(y, 1);
                newBoard.unshift(Array(BOARD_WIDTH).fill('empty'));
                linesCleared++;
                y++; // Check this line again
            }
        }

        setBoard(newBoard);
        setScore((prev) => prev + linesCleared * 100);

        // Check game over
        const newPiece = createNewPiece();
        if (checkCollision(newPiece)) {
            setGameOver(true);
            return;
        }
        setCurrentPiece(newPiece);
    }, [currentPiece, board, createNewPiece, checkCollision]);

    const movePiece = useCallback(
        (dx: number, dy: number) => {
            if (!currentPiece || gameOver || isPaused) return;

            if (!checkCollision(currentPiece, dx, dy)) {
                setCurrentPiece({
                    ...currentPiece,
                    x: currentPiece.x + dx,
                    y: currentPiece.y + dy,
                });
            } else if (dy > 0) {
                mergePiece();
            }
        },
        [currentPiece, gameOver, isPaused, checkCollision, mergePiece]
    );

    const rotatePiece = useCallback(() => {
        if (!currentPiece || gameOver || isPaused) return;

        const rotated = currentPiece.shape[0].map((_, i) =>
            currentPiece.shape.map((row) => row[i]).reverse()
        );

        const rotatedPiece = { ...currentPiece, shape: rotated };
        if (!checkCollision(rotatedPiece)) {
            setCurrentPiece(rotatedPiece);
        }
    }, [currentPiece, gameOver, isPaused, checkCollision]);

    const dropPiece = useCallback(() => {
        if (!currentPiece || gameOver || isPaused) return;

        let newY = currentPiece.y;
        while (!checkCollision(currentPiece, 0, newY - currentPiece.y + 1)) {
            newY++;
        }
        setCurrentPiece({ ...currentPiece, y: newY });
        setTimeout(mergePiece, 50);
    }, [currentPiece, gameOver, isPaused, checkCollision, mergePiece]);

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (gameOver) return;

            switch (e.key) {
                case 'ArrowLeft':
                    movePiece(-1, 0);
                    break;
                case 'ArrowRight':
                    movePiece(1, 0);
                    break;
                case 'ArrowDown':
                    movePiece(0, 1);
                    break;
                case 'ArrowUp':
                    rotatePiece();
                    break;
                case ' ':
                    dropPiece();
                    break;
                case 'p':
                case 'P':
                    setIsPaused((prev) => !prev);
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [movePiece, rotatePiece, dropPiece, gameOver]);

    useEffect(() => {
        if (!currentPiece && !gameOver) {
            setCurrentPiece(createNewPiece());
        }
    }, [currentPiece, gameOver, createNewPiece]);

    useEffect(() => {
        if (gameOver || isPaused) {
            if (gameLoopRef.current) {
                clearInterval(gameLoopRef.current);
            }
            return;
        }

        gameLoopRef.current = setInterval(() => {
            movePiece(0, 1);
        }, 1000);

        return () => {
            if (gameLoopRef.current) {
                clearInterval(gameLoopRef.current);
            }
        };
    }, [movePiece, gameOver, isPaused]);

    useEffect(() => {
        if (gameOver) {
            updateHighScore('tetris', score);
        }
    }, [gameOver, score, updateHighScore]);

    const renderBoard = () => {
        const displayBoard = board.map((row) => [...row]);

        // Draw current piece
        if (currentPiece) {
            for (let y = 0; y < currentPiece.shape.length; y++) {
                for (let x = 0; x < currentPiece.shape[y].length; x++) {
                    if (currentPiece.shape[y][x]) {
                        const boardY = currentPiece.y + y;
                        const boardX = currentPiece.x + x;
                        if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
                            displayBoard[boardY][boardX] = 'active';
                        }
                    }
                }
            }
        }

        return displayBoard;
    };

    const resetGame = () => {
        setBoard(
            Array(BOARD_HEIGHT)
                .fill(null)
                .map(() => Array(BOARD_WIDTH).fill('empty'))
        );
        setCurrentPiece(null);
        setGameOver(false);
        setScore(0);
        setIsPaused(false);
    };

    const displayBoard = renderBoard();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <Link
                href="/"
                className="absolute top-4 left-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg transition-colors"
            >
                ← Back
            </Link>

            <h1 className="text-4xl font-bold text-slate-100 mb-2">Tetris</h1>
            <div className="flex gap-8 mb-6 text-slate-400">
                <p>Score: {score}</p>
                <p>High Score: {highScores.tetris[0] || 0}</p>
            </div>

            <div
                className="relative border-4 border-slate-700 bg-black"
                style={{
                    width: BOARD_WIDTH * CELL_SIZE,
                    height: BOARD_HEIGHT * CELL_SIZE,
                }}
            >
                {displayBoard.map((row, y) =>
                    row.map((cell, x) => (
                        <div
                            key={`${y}-${x}`}
                            className="absolute border border-slate-900"
                            style={{
                                left: x * CELL_SIZE,
                                top: y * CELL_SIZE,
                                width: CELL_SIZE,
                                height: CELL_SIZE,
                                backgroundColor:
                                    cell === 'active'
                                        ? 'var(--left-eye)'
                                        : cell === 'static'
                                            ? 'var(--right-eye)'
                                            : 'transparent',
                                mixBlendMode: cell !== 'empty' ? 'screen' : 'normal',
                            }}
                        />
                    ))
                )}

                {gameOver && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                        <div className="text-center">
                            <h2 className="text-3xl font-bold text-slate-100 mb-4">Game Over!</h2>
                            <p className="text-xl text-slate-300 mb-6">Final Score: {score}</p>
                            <button
                                onClick={resetGame}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
                            >
                                Play Again
                            </button>
                        </div>
                    </div>
                )}

                {isPaused && !gameOver && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                        <h2 className="text-3xl font-bold text-slate-100">PAUSED</h2>
                    </div>
                )}
            </div>

            <div className="mt-6 text-center text-slate-400 space-y-2">
                <p>← → Move | ↑ Rotate | ↓ Soft Drop | Space Hard Drop | P Pause</p>
                <p className="text-sm">
                    <span style={{ color: 'var(--left-eye)' }}>Active Piece (Left Eye)</span> |{' '}
                    <span style={{ color: 'var(--right-eye)' }}>Stack (Right Eye)</span>
                </p>
            </div>
        </div>
    );
}
