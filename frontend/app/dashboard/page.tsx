'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        // Decode token or fetch user profile here
        // For now, just show a welcome message
        setUser({ email: 'User' }); // Placeholder
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        router.push('/login');
    };

    if (!user) {
        return <div className="min-h-screen flex items-center justify-center bg-[#0f172a] text-white">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-[#0f172a] text-white p-8">
            <div className="max-w-4xl mx-auto">
                <header className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        Dashboard
                    </h1>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors"
                    >
                        Sign Out
                    </button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                        <h2 className="text-xl font-semibold mb-4">Welcome Back!</h2>
                        <p className="text-slate-400">
                            You are successfully logged in. This is your dashboard where you can track your progress and start training sessions.
                        </p>
                    </div>

                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                        <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400">Sessions Completed</span>
                                <span className="font-mono text-blue-400">0</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400">Total Training Time</span>
                                <span className="font-mono text-purple-400">0m</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
