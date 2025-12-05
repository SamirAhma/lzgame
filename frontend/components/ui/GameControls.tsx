'use client';

import { FC } from 'react';

interface GameControlsProps {
    onUp?: () => void;
    onDown?: () => void;
    onLeft?: () => void;
    onRight?: () => void;
    onRotate?: () => void;
    onDrop?: () => void;
    onPause?: () => void;
    disabled?: boolean;
    gameType: 'snake' | 'tetris';
}

const GameControls: FC<GameControlsProps> = ({
    onUp,
    onDown,
    onLeft,
    onRight,
    onRotate,
    onDrop,
    onPause,
    disabled = false,
    gameType,
}) => {
    const buttonClass = `
        px-2 py-1.5 sm:px-3 sm:py-2 
        bg-slate-700 hover:bg-slate-600 active:bg-slate-500
        text-white rounded font-medium 
        transition-all duration-150
        disabled:opacity-50 disabled:cursor-not-allowed
        touch-manipulation select-none
        min-w-[48px] sm:min-w-[56px]
        text-xs sm:text-sm
        shadow-md hover:shadow-lg
    `;

    const arrowButtonClass = `
        ${buttonClass}
        flex items-center justify-center
        aspect-square
    `;

    return (
        <div className="w-full max-w-2xl mx-auto mt-3 space-y-2">
            {/* Directional Controls */}
            <div className="flex flex-col items-center gap-1">
                {/* Up Button */}
                {onUp && (
                    <button
                        onClick={onUp}
                        disabled={disabled}
                        className={arrowButtonClass}
                        aria-label="Move up"
                    >
                        ↑
                    </button>
                )}

                {/* Left, Down, Right */}
                <div className="flex gap-1">
                    {onLeft && (
                        <button
                            onClick={onLeft}
                            disabled={disabled}
                            className={arrowButtonClass}
                            aria-label="Move left"
                        >
                            ←
                        </button>
                    )}

                    {onDown && (
                        <button
                            onClick={onDown}
                            disabled={disabled}
                            className={arrowButtonClass}
                            aria-label="Move down"
                        >
                            ↓
                        </button>
                    )}

                    {onRight && (
                        <button
                            onClick={onRight}
                            disabled={disabled}
                            className={arrowButtonClass}
                            aria-label="Move right"
                        >
                            →
                        </button>
                    )}
                </div>
            </div>

            {/* Action Buttons - Tetris specific */}
            {gameType === 'tetris' && (
                <div className="flex gap-1 justify-center flex-wrap">
                    {onRotate && (
                        <button
                            onClick={onRotate}
                            disabled={disabled}
                            className={buttonClass}
                            aria-label="Rotate piece"
                        >
                            🔄 Rotate
                        </button>
                    )}

                    {onDrop && (
                        <button
                            onClick={onDrop}
                            disabled={disabled}
                            className={buttonClass}
                            aria-label="Drop piece"
                        >
                            ⬇ Hard Drop
                        </button>
                    )}
                </div>
            )}

            {/* Pause Button */}
            {onPause && (
                <div className="flex justify-center">
                    <button
                        onClick={onPause}
                        disabled={disabled}
                        className={`${buttonClass} bg-blue-700 hover:bg-blue-600 active:bg-blue-500`}
                        aria-label="Pause game"
                    >
                        ⏸ Pause
                    </button>
                </div>
            )}
        </div>
    );
};

export default GameControls;
