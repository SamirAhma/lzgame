'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useHighScores } from '@/lib/hooks/useHighScores';

const GRID_SIZE = 20;
const CELL_SIZE = 25;
const INITIAL_SPEED = 150;

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Position = { x: number; y: number };

export default function SnakeGame() {
    const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
    const [food, setFood] = useState<Position>({ x: 15, y: 15 });
    const [direction, setDirection] = useState<Direction>('RIGHT');
    const [nextDirection, setNextDirection] = useState<Direction>('RIGHT');
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
    const { updateHighScore, highScores } = useHighScores();

    const generateFood = useCallback((snakeBody: Position[]): Position => {
        let newFood: Position;
        do {
            newFood = {
                x: Math.floor(Math.random() * GRID_SIZE),
                y: Math.floor(Math.random() * GRID_SIZE),
            };
        } while (
            snakeBody.some((segment) => segment.x === newFood.x && segment.y === newFood.y)
        );
        return newFood;
    }, []);

    const checkCollision = useCallback((head: Position, body: Position[]): boolean => {
        // Wall collision
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
            return true;
        }
        // Self collision
        if (body.length < 2) return false;
        // Ignore the last segment because it will move (unless we eat, but head != food here)
        const bodyToCheck = body.slice(0, -1);
        return bodyToCheck.some((segment) => segment.x === head.x && segment.y === head.y);
    }, []);

    const moveSnake = useCallback(() => {
        if (gameOver || isPaused) return;

        setDirection(nextDirection);

        setSnake((prevSnake) => {
            const head = { ...prevSnake[0] };

            switch (nextDirection) {
                case 'UP':
                    head.y -= 1;
                    break;
                case 'DOWN':
                    head.y += 1;
                    break;
                case 'LEFT':
                    head.x -= 1;
                    break;
                case 'RIGHT':
                    head.x += 1;
                    break;
            }

            if (checkCollision(head, prevSnake)) {
                setGameOver(true);
                return prevSnake;
            }

            const newSnake = [head, ...prevSnake];

            // Check if food is eaten
            if (head.x === food.x && head.y === food.y) {
                setScore((prev) => prev + 10);
                setFood(generateFood(newSnake));
            } else {
                newSnake.pop();
            }

            return newSnake;
        });
    }, [nextDirection, food, gameOver, isPaused, checkCollision, generateFood]);

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (gameOver) return;

            switch (e.key) {
                case 'ArrowUp':
                    if (direction !== 'DOWN') setNextDirection('UP');
                    break;
                case 'ArrowDown':
                    if (direction !== 'UP') setNextDirection('DOWN');
                    break;
                case 'ArrowLeft':
                    if (direction !== 'RIGHT') setNextDirection('LEFT');
                    break;
                case 'ArrowRight':
                    if (direction !== 'LEFT') setNextDirection('RIGHT');
                    break;
                case 'p':
                case 'P':
                    setIsPaused((prev) => !prev);
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [direction, gameOver]);

    useEffect(() => {
        if (gameOver || isPaused) {
            if (gameLoopRef.current) {
                clearInterval(gameLoopRef.current);
            }
            return;
        }

        gameLoopRef.current = setInterval(moveSnake, INITIAL_SPEED);

        return () => {
            if (gameLoopRef.current) {
                clearInterval(gameLoopRef.current);
            }
        };
    }, [moveSnake, gameOver, isPaused]);

    useEffect(() => {
        if (gameOver) {
            updateHighScore('snake', score);
        }
    }, [gameOver, score, updateHighScore]);

    const resetGame = () => {
        setSnake([{ x: 10, y: 10 }]);
        setFood({ x: 15, y: 15 });
        setDirection('RIGHT');
        setNextDirection('RIGHT');
        setGameOver(false);
        setScore(0);
        setIsPaused(false);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
            <Link
                href="/"
                className="absolute top-4 left-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg transition-colors z-50"
            >
                ← Back
            </Link>

            <h1 className="text-4xl font-bold text-slate-100 mb-2">Snake</h1>
            <div className="flex gap-8 mb-6 text-slate-400 items-start">
                <p>Score: {score}</p>
                <div className="flex flex-col items-end">
                    <p>High Score: {highScores.snake[0]?.score || 0}</p>
                    {highScores.snake[0]?.date && (
                        <p className="text-xs text-slate-500">{highScores.snake[0].date}</p>
                    )}
                </div>
            </div>

            <div
                className="relative border-4 border-slate-700  bg-black"
                style={{
                    width: GRID_SIZE * CELL_SIZE,
                    height: GRID_SIZE * CELL_SIZE,
                }}
            >
                {/* Grid cells */}
                {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
                    const x = i % GRID_SIZE;
                    const y = Math.floor(i / GRID_SIZE);
                    const isSnake = snake.some((segment) => segment.x === x && segment.y === y);
                    const isFood = food.x === x && food.y === y;

                    return (
                        <div
                            key={i}
                            className="absolute border border-slate-900"
                            style={{
                                left: x * CELL_SIZE,
                                top: y * CELL_SIZE,
                                width: CELL_SIZE,
                                height: CELL_SIZE,
                                backgroundColor: isSnake
                                    ? 'var(--left-eye)'
                                    : isFood
                                        ? 'var(--right-eye)'
                                        : 'transparent',
                                mixBlendMode: isSnake || isFood ? 'screen' : 'normal',
                                borderRadius: isSnake ? '3px' : isFood ? '50%' : '0',
                            }}
                        />
                    );
                })}

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
                <p>Arrow Keys to Move | P to Pause</p>
                <p className="text-sm">
                    <span style={{ color: 'var(--left-eye)' }}>Snake (Left Eye)</span> |{' '}
                    <span style={{ color: 'var(--right-eye)' }}>Food (Right Eye)</span>
                </p>
            </div>
        </div >
    );
}
