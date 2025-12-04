import Link from 'next/link';
import { ReactNode } from 'react';
import { ScoreEntry } from '@/lib/types/scores';
import ScoreCard from '@/components/ui/ScoreCard';

interface GameCardProps {
    title: string;
    description: string;
    href: string;
    icon: ReactNode;
    scores: ScoreEntry[];
    tags: string[];
    accentColor: 'cyan' | 'pink';
    gradientFrom: string;
    gradientTo: string;
}

export default function GameCard({
    title,
    description,
    href,
    icon,
    scores,
    tags,
    accentColor,
    gradientFrom,
    gradientTo,
}: GameCardProps) {
    const hoverColors = {
        cyan: 'hover:border-cyan-500/50 hover:shadow-cyan-500/20 group-hover:from-cyan-500/10 group-hover:to-purple-500/10',
        pink: 'hover:border-pink-500/50 hover:shadow-pink-500/20 group-hover:from-pink-500/10 group-hover:to-orange-500/10',
    };

    const iconColors = {
        cyan: 'from-cyan-500 to-purple-600 shadow-cyan-500/30 group-hover:shadow-cyan-500/50',
        pink: 'from-pink-500 to-orange-600 shadow-pink-500/30 group-hover:shadow-pink-500/50',
    };

    const titleHoverColors = {
        cyan: 'group-hover:text-cyan-300',
        pink: 'group-hover:text-pink-300',
    };

    const buttonColors = {
        cyan: 'from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 shadow-cyan-500/30 group-hover:shadow-cyan-500/50',
        pink: 'from-pink-500 to-orange-600 hover:from-pink-400 hover:to-orange-500 shadow-pink-500/30 group-hover:shadow-pink-500/50',
    };

    return (
        <Link href={href} className="group">
            <div className={`relative h-full bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 ${hoverColors[accentColor]} transition-all duration-500 hover:shadow-2xl hover:-translate-y-2`}>
                {/* Glow effect on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br from-${gradientFrom}-500/0 to-${gradientTo}-500/0 ${hoverColors[accentColor]} rounded-3xl transition-all duration-500`}></div>

                {/* Icon */}
                <div className="relative mb-6">
                    <div className={`w-20 h-20 bg-gradient-to-br ${iconColors[accentColor]} rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                        {icon}
                    </div>
                </div>

                <h2 className={`relative text-4xl font-bold text-white mb-4 ${titleHoverColors[accentColor]} transition-colors`}>
                    {title}
                </h2>

                {/* High Score Display */}
                <ScoreCard
                    scores={scores}
                    title="Top 10 Scores"
                    accentColor={accentColor}
                />

                <p className="relative text-slate-300 mb-6 leading-relaxed">
                    {description}
                </p>

                {/* Tags */}
                <div className="relative flex flex-wrap gap-2 mb-6">
                    {tags.map((tag, index) => (
                        <span
                            key={index}
                            className={`px-3 py-1.5 bg-${index === 0 ? gradientFrom : gradientTo}-500/10 border border-${index === 0 ? gradientFrom : gradientTo}-500/30 text-${index === 0 ? gradientFrom : gradientTo}-300 rounded-full text-sm font-medium`}
                        >
                            {tag}
                        </span>
                    ))}
                </div>

                {/* CTA Button */}
                <div className="relative">
                    <button className={`w-full py-4 bg-gradient-to-r ${buttonColors[accentColor]} text-white font-bold rounded-xl transition-all duration-300 shadow-lg group-hover:scale-105`}>
                        Play Now →
                    </button>
                </div>
            </div>
        </Link>
    );
}
