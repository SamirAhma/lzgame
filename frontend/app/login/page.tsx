'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { setToken, setRefreshToken } from '@/lib/utils/storage';
import { API_ENDPOINTS } from '@/lib/config/constants';
import { useAuth } from '@/context/AuthContext';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const { login } = useAuth();
    const router = useRouter();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    });

    const loginMutation = useMutation({
        mutationFn: (data: LoginFormValues) =>
            api.post(API_ENDPOINTS.AUTH_LOGIN, data).then((res) => res.data),
        onSuccess: (data) => {
            console.log('[Login] Success! Received data:', data);
            login(data.access_token);
            // Refresh token is handled by the initial login response usually, 
            // but AuthProvider only takes one token. 
            // We should ensure refresh token is stored if the API returns it.
            // valid point: context login() only takes one arg.
            // Let's manually set refresh token if needed or check AuthContext.
            if (data.refresh_token) {
                setRefreshToken(data.refresh_token);
            }
        },
    });

    const onSubmit = (data: LoginFormValues) => {
        loginMutation.mutate(data);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f172a] relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="w-full max-w-md p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl z-10 animate-[slideInUp_0.5s_ease-out]">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
                        Welcome Back
                    </h1>
                    <p className="text-slate-400">Sign in to continue your training</p>
                </div>

                {loginMutation.isError && (
                    <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                        {loginMutation.error instanceof Error ? loginMutation.error.message : 'Login failed'}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            {...register('email')}
                            className={`w-full px-4 py-3 rounded-lg bg-slate-900/50 border ${errors.email ? 'border-red-500' : 'border-slate-700'} text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all`}
                            placeholder="name@example.com"
                        />
                        {errors.email && (
                            <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                        <input
                            id="password"
                            type="password"
                            {...register('password')}
                            className={`w-full px-4 py-3 rounded-lg bg-slate-900/50 border ${errors.password ? 'border-red-500' : 'border-slate-700'} text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all`}
                            placeholder="••••••••"
                        />
                        {errors.password && (
                            <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
                        )}
                    </div>

                    <div className="flex items-center justify-end">
                        <Link href="/auth/forgot-password" className="text-sm font-medium text-blue-400 hover:text-blue-300">
                            Forgot password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={loginMutation.isPending}
                        className="w-full py-3.5 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold shadow-lg shadow-blue-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loginMutation.isPending ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Signing in...
                            </span>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-slate-400">
                    Don't have an account?{' '}
                    <Link href="/register" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                        Create account
                    </Link>
                </div>
            </div>
        </div>
    );
}
