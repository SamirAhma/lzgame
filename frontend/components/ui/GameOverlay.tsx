import { ReactNode } from 'react';

interface GameOverlayProps {
    isVisible: boolean;
    title: string;
    children?: ReactNode;
}

export default function GameOverlay({ isVisible, title, children }: GameOverlayProps) {
    if (!isVisible) return null;

    return (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-slate-100 mb-4">{title}</h2>
                {children}
            </div>
        </div>
    );
}
