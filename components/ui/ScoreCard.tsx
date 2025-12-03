import { ScoreEntry } from '@/lib/types/scores';

interface ScoreCardProps {
    scores: ScoreEntry[];
    title: string;
    accentColor: 'cyan' | 'pink';
    emptyMessage?: string;
}

export default function ScoreCard({
    scores,
    title,
    accentColor,
    emptyMessage = 'No scores yet - be the first!'
}: ScoreCardProps) {
    const colorClasses = {
        cyan: {
            title: 'text-cyan-400',
            gradient: 'from-cyan-400 to-purple-400',
        },
        pink: {
            title: 'text-pink-400',
            gradient: 'from-pink-400 to-orange-400',
        },
    };

    const colors = colorClasses[accentColor];

    const getRankColor = (index: number): string => {
        switch (index) {
            case 0: return 'text-yellow-400';
            case 1: return 'text-slate-300';
            case 2: return 'text-orange-400';
            default: return 'text-slate-500';
        }
    };

    const getRankBackground = (index: number): string => {
        return index === 0
            ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20'
            : 'bg-slate-800/30';
    };

    return (
        <div className="relative mb-6 p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
            <div className="flex items-center justify-between mb-3">
                <span className={`${colors.title} font-semibold text-sm uppercase tracking-wide`}>
                    {title}
                </span>
                {scores.length > 0 && (
                    <span className="px-2 py-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-full text-yellow-400 text-xs font-bold">
                        🏆 {scores.length} Score{scores.length !== 1 ? 's' : ''}
                    </span>
                )}
            </div>

            {scores.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
                    {scores.map((entry, index) => (
                        <div
                            key={`${entry.score}-${entry.date}-${entry.time}-${index}`}
                            className={`flex items-center justify-between p-2 rounded ${getRankBackground(index)}`}
                        >
                            <div className="flex items-center gap-3">
                                <span className={`text-lg font-bold ${getRankColor(index)}`}>
                                    #{index + 1}
                                </span>
                                <div>
                                    <div className={`text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r ${colors.gradient}`}>
                                        {entry.score}
                                    </div>
                                    <div className="flex items-center gap-1 text-slate-500 text-xs">
                                        <span>{entry.date}</span>
                                        <span>•</span>
                                        <span>{entry.time}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <span className="text-slate-500 text-sm">{emptyMessage}</span>
            )}
        </div>
    );
}
