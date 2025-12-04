'use client';

import { useSettings } from '@/lib/hooks/useSettings';
import { ReactNode } from 'react';

export default function ColorProvider({ children }: { children: ReactNode }) {
    const { settings, isLoaded } = useSettings();

    if (!isLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-slate-400">Loading...</div>
            </div>
        );
    }

    return (
        <div
            style={
                {
                    '--left-eye': settings.leftEyeColor,
                    '--right-eye': settings.rightEyeColor,
                } as React.CSSProperties
            }
        >
            {children}
        </div>
    );
}
