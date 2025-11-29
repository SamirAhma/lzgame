import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="py-8 px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-center text-slate-100">
          Dichoptic Training Platform
        </h1>
        <p className="text-center text-slate-400 mt-2">
          Vision therapy games for amblyopia treatment
        </p>
      </header>

      {/* Game Selection */}
      <main className="flex-1 flex items-center justify-center px-4 pb-16">
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full">
          {/* Tetris Card */}
          <Link href="/tetris">
            <div className="group relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 hover:from-slate-700 hover:to-slate-800 transition-all duration-300 cursor-pointer border border-slate-700 hover:border-slate-600 hover:shadow-2xl hover:scale-105">
              <div className="absolute top-4 right-4 w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center group-hover:bg-slate-600 transition-colors">
                <svg
                  className="w-6 h-6 text-slate-300"
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
              <h2 className="text-3xl font-bold text-slate-100 mb-3">Tetris</h2>
              <p className="text-slate-400 mb-4">
                Stack falling blocks to clear lines. Active pieces use one eye, the stack uses the other.
              </p>
              <div className="flex gap-2 text-sm">
                <span className="px-3 py-1 bg-slate-700 text-slate-300 rounded-full">
                  Spatial Awareness
                </span>
                <span className="px-3 py-1 bg-slate-700 text-slate-300 rounded-full">
                  Coordination
                </span>
              </div>
            </div>
          </Link>

          {/* Snake Card */}
          <Link href="/snake">
            <div className="group relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 hover:from-slate-700 hover:to-slate-800 transition-all duration-300 cursor-pointer border border-slate-700 hover:border-slate-600 hover:shadow-2xl hover:scale-105">
              <div className="absolute top-4 right-4 w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center group-hover:bg-slate-600 transition-colors">
                <svg
                  className="w-6 h-6 text-slate-300"
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
              <h2 className="text-3xl font-bold text-slate-100 mb-3">Snake</h2>
              <p className="text-slate-400 mb-4">
                Guide the snake to eat food and grow. The snake uses one eye, food uses the other.
              </p>
              <div className="flex gap-2 text-sm">
                <span className="px-3 py-1 bg-slate-700 text-slate-300 rounded-full">
                  Tracking
                </span>
                <span className="px-3 py-1 bg-slate-700 text-slate-300 rounded-full">
                  Reaction Time
                </span>
              </div>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}

