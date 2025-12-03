'use client';

import Link from 'next/link';
import { useHighScores } from '@/lib/hooks/useHighScores';

export default function Home() {
  const { highScores } = useHighScores();

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Animated background gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Header */}
      <header className="py-12 px-4 md:px-6 md:py-20 lg:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block mb-4 md:mb-6">
            <span className="px-3 py-1.5 md:px-4 md:py-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 rounded-full text-cyan-300 text-xs md:text-sm font-medium backdrop-blur-sm">
              Advanced Vision Therapy
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 mb-4 md:mb-6 leading-tight">
            Dichoptic Training Platform
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Scientifically designed games for <span className="text-cyan-400 font-semibold">amblyopia treatment</span> using cutting-edge dichoptic technology
          </p>
        </div>
      </header>

      {/* Game Selection */}
      <main className="flex-1 flex items-center justify-center px-4 pb-16 md:px-6 md:pb-20 lg:pb-24">
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl w-full">
          {/* Tetris Card */}
          <Link href="/tetris" className="group">
            <div className="relative h-full bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-500/20 hover:-translate-y-2">
              {/* Glow effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-purple-500/0 group-hover:from-cyan-500/10 group-hover:to-purple-500/10 rounded-3xl transition-all duration-500"></div>

              {/* Icon */}
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/30 group-hover:shadow-cyan-500/50 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <svg
                    className="w-10 h-10 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z"
                    />
                  </svg>
                </div>
              </div>

              <h2 className="relative text-4xl font-bold text-white mb-4 group-hover:text-cyan-300 transition-colors">
                Tetris
              </h2>

              {/* High Score Display */}
              <div className="relative mb-6 p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-cyan-400 font-semibold text-sm uppercase tracking-wide">Top 10 Scores</span>
                  {highScores.tetris.length > 0 && (
                    <span className="px-2 py-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-full text-yellow-400 text-xs font-bold">
                      🏆 {highScores.tetris.length} Score{highScores.tetris.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                {highScores.tetris.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
                    {highScores.tetris.map((entry, index) => (
                      <div key={index} className={`flex items-center justify-between p-2 rounded ${index === 0 ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20' : 'bg-slate-800/30'}`}>
                        <div className="flex items-center gap-3">
                          <span className={`text-lg font-bold ${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-slate-300' : index === 2 ? 'text-orange-400' : 'text-slate-500'}`}>
                            #{index + 1}
                          </span>
                          <div>
                            <div className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
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
                  <span className="text-slate-500 text-sm">No scores yet - be the first!</span>
                )}
              </div>

              <p className="relative text-slate-300 mb-6 leading-relaxed">
                Stack falling blocks to clear lines. Active pieces use one eye, the stack uses the other.
              </p>

              {/* Tags */}
              <div className="relative flex flex-wrap gap-2 mb-6">
                <span className="px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 rounded-full text-sm font-medium">
                  Spatial Awareness
                </span>
                <span className="px-3 py-1.5 bg-purple-500/10 border border-purple-500/30 text-purple-300 rounded-full text-sm font-medium">
                  Coordination
                </span>
              </div>

              {/* CTA Button */}
              <div className="relative">
                <button className="w-full py-4 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-cyan-500/30 group-hover:shadow-cyan-500/50 group-hover:scale-105">
                  Play Now →
                </button>
              </div>
            </div>
          </Link>

          {/* Snake Card */}
          <Link href="/snake" className="group">
            <div className="relative h-full bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 hover:border-pink-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-pink-500/20 hover:-translate-y-2">
              {/* Glow effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/0 to-orange-500/0 group-hover:from-pink-500/10 group-hover:to-orange-500/10 rounded-3xl transition-all duration-500"></div>

              {/* Icon */}
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-500/30 group-hover:shadow-pink-500/50 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <svg
                    className="w-10 h-10 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
              </div>

              <h2 className="relative text-4xl font-bold text-white mb-4 group-hover:text-pink-300 transition-colors">
                Snake
              </h2>

              {/* High Score Display */}
              <div className="relative mb-6 p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-pink-400 font-semibold text-sm uppercase tracking-wide">Top 10 Scores</span>
                  {highScores.snake.length > 0 && (
                    <span className="px-2 py-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-full text-yellow-400 text-xs font-bold">
                      🏆 {highScores.snake.length} Score{highScores.snake.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                {highScores.snake.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
                    {highScores.snake.map((entry, index) => (
                      <div key={index} className={`flex items-center justify-between p-2 rounded ${index === 0 ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20' : 'bg-slate-800/30'}`}>
                        <div className="flex items-center gap-3">
                          <span className={`text-lg font-bold ${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-slate-300' : index === 2 ? 'text-orange-400' : 'text-slate-500'}`}>
                            #{index + 1}
                          </span>
                          <div>
                            <div className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-orange-400">
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
                  <span className="text-slate-500 text-sm">No scores yet - be the first!</span>
                )}
              </div>

              <p className="relative text-slate-300 mb-6 leading-relaxed">
                Guide the snake to eat food and grow. The snake uses one eye, food uses the other.
              </p>

              {/* Tags */}
              <div className="relative flex flex-wrap gap-2 mb-6">
                <span className="px-3 py-1.5 bg-pink-500/10 border border-pink-500/30 text-pink-300 rounded-full text-sm font-medium">
                  Tracking
                </span>
                <span className="px-3 py-1.5 bg-orange-500/10 border border-orange-500/30 text-orange-300 rounded-full text-sm font-medium">
                  Reaction Time
                </span>
              </div>

              {/* CTA Button */}
              <div className="relative">
                <button className="w-full py-4 bg-gradient-to-r from-pink-500 to-orange-600 hover:from-pink-400 hover:to-orange-500 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-pink-500/30 group-hover:shadow-pink-500/50 group-hover:scale-105">
                  Play Now →
                </button>
              </div>
            </div>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-8 px-6 text-center text-slate-400 text-sm">
        <p>Designed for therapeutic vision training • Use with red-cyan glasses for optimal results</p>
      </footer>
    </div>
  );
}
