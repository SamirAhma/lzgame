'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const authSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type AuthFormData = z.infer<typeof authSchema>;

export default function AuthModal({ onClose }: { onClose: () => void }) {
    const [isLogin, setIsLogin] = useState(true);
    const { login } = useAuth();
    const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<AuthFormData>({
        resolver: zodResolver(authSchema),
    });
    const router = useRouter();

    const onSubmit = async (data: AuthFormData) => {
        try {
            const endpoint = isLogin ? '/auth/login' : '/auth/register';
            const response = await api.post(endpoint, data);

            // If registering, we might need to login afterwards or backend returns token directly.
            // Based on architecture, register returns user info, login returns token.
            // So if register, let's auto-login or ask to login.
            // Let's assume for simpler UX: register -> auto login (if backend returns token) OR register -> switch to login

            if (isLogin) {
                if (response.data.access_token) {
                    login(response.data.access_token);
                    onClose();
                }
            } else {
                // Registration successful
                // Try to login automatically if token is provided, else switch to login view
                if (response.data.access_token) {
                    login(response.data.access_token);
                    onClose();
                } else {
                    // If no token on register, switch to login
                    setIsLogin(true);
                    alert("Registration successful. Please log in.");
                }
            }
        } catch (error: any) {
            if (error.response?.data?.message) {
                setError('root', { message: error.response.data.message });
            } else {
                setError('root', { message: 'An unexpected error occurred' });
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-8 rounded-lg w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-white">{isLogin ? 'Login' : 'Register'}</h2>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Email</label>
                        <input
                            {...register('email')}
                            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300">Password</label>
                        <input
                            type="password"
                            {...register('password')}
                            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                    </div>

                    {errors.root && <p className="text-red-500 text-sm">{errors.root.message}</p>}

                    <div className="flex justify-end gap-2 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {isSubmitting ? 'Loading...' : (isLogin ? 'Login' : 'Register')}
                        </button>
                    </div>
                </form>
                <div className="mt-4 text-center">
                    <button
                        type="button"
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-sm text-indigo-400 hover:text-indigo-300"
                    >
                        {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
                    </button>
                </div>
            </div>
        </div>
    );
}
