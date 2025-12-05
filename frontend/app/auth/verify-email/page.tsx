'use client';

import { useEffect, useState, Suspense } from 'react';
import { verifyEmail } from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function VerifyEmailContent() {
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [message, setMessage] = useState('');
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Invalid verification token.');
            return;
        }

        const verify = async () => {
            try {
                await verifyEmail(token);
                setStatus('success');
            } catch (err) {
                setStatus('error');
                setMessage('Failed to verify email. The token may be invalid or expired.');
            }
        };

        verify();
    }, [token]);

    return (
        <div className="text-center">
            {status === 'verifying' && (
                <p className="text-gray-600">Verifying your email...</p>
            )}
            {status === 'success' && (
                <div>
                    <h2 className="text-2xl font-bold text-green-600 mb-4">Email Verified!</h2>
                    <p className="text-gray-600 mb-6">Your email has been successfully verified.</p>
                    <Link
                        href="/login"
                        className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                        Go to Login
                    </Link>
                </div>
            )}
            {status === 'error' && (
                <div>
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Verification Failed</h2>
                    <p className="text-gray-600 mb-6">{message}</p>
                    <Link
                        href="/login"
                        className="text-indigo-600 hover:text-indigo-500 font-medium"
                    >
                        Back to Login
                    </Link>
                </div>
            )}
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
                <Suspense fallback={<div>Loading...</div>}>
                    <VerifyEmailContent />
                </Suspense>
            </div>
        </div>
    );
}
