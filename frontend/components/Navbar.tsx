'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';

export default function Navbar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    // Don't show navbar on login/register pages
    if (pathname === '/login' || pathname === '/register' || pathname === '/auth/forgot-password') {
        return null;
    }

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo/Brand */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                            <span className="text-white font-bold text-lg">DT</span>
                        </div>
                        <span className="text-white font-semibold text-lg hidden sm:inline">Dichoptic Training</span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="flex items-center gap-6">
                        <Link
                            href="/tetris"
                            className={`text-sm font-medium transition-colors ${pathname === '/tetris' ? 'text-cyan-400' : 'text-slate-300 hover:text-cyan-400'}`}
                        >
                            Tetris
                        </Link>
                        <Link
                            href="/snake"
                            className={`text-sm font-medium transition-colors ${pathname === '/snake' ? 'text-pink-400' : 'text-slate-300 hover:text-pink-400'}`}
                        >
                            Snake
                        </Link>

                        {/* Auth Section */}
                        {user ? (
                            <div className="flex items-center gap-3">
                                <span className="text-slate-300 text-sm hidden md:inline">{user.email}</span>
                                <button
                                    onClick={logout}
                                    className="px-3 py-1.5 bg-red-600/80 hover:bg-red-600 rounded-lg text-white text-sm font-medium transition-colors"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                className="px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 rounded-lg text-white text-sm font-medium transition-all"
                            >
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
