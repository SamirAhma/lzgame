'use client';

import { useRouter } from 'next/navigation';

interface BackButtonProps {
    className?: string;
}

export default function BackButton({ className = '' }: BackButtonProps) {
    const router = useRouter();

    return (
        <button
            onClick={() => router.back()}
            className={`px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg transition-colors ${className}`}
            aria-label="Go back to previous page"
        >
            ← Back
        </button>
    );
}
