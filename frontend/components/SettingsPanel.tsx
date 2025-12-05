'use client';

import { useSettings } from '@/lib/hooks/useSettings';
import { useState } from 'react';

export default function SettingsPanel() {
    const { settings, updateSettings, resetToDefaults } = useSettings();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Settings Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-4 right-4 z-50 p-3 **bg-indigo-600** hover:**bg-indigo-500** rounded-lg transition-colors"
                aria-label="Settings"
            >
                <svg
                    // Icon color remains bright white for high contrast
                    className="w-6 h-6 **text-white**"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                </svg>
            </button>

            {/* Settings Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/70">
                    <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full shadow-2xl">
                        <h2 className="text-2xl font-bold text-slate-100 mb-6">
                            Color Settings
                        </h2>

                        {/* Left Eye Color */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Left Eye Filter
                            </label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={settings.leftEyeColor}
                                    onChange={(e) =>
                                        updateSettings({ leftEyeColor: e.target.value })
                                    }
                                    className="w-16 h-16 rounded cursor-pointer border-2 border-slate-600"
                                />
                                <input
                                    type="text"
                                    value={settings.leftEyeColor}
                                    onChange={(e) =>
                                        updateSettings({ leftEyeColor: e.target.value })
                                    }
                                    className="flex-1 px-3 py-2 bg-slate-700 text-slate-100 rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="#FF0000"
                                />
                            </div>
                        </div>

                        {/* Right Eye Color */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Right Eye Filter
                            </label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={settings.rightEyeColor}
                                    onChange={(e) =>
                                        updateSettings({ rightEyeColor: e.target.value })
                                    }
                                    className="w-16 h-16 rounded cursor-pointer border-2 border-slate-600"
                                />
                                <input
                                    type="text"
                                    value={settings.rightEyeColor}
                                    onChange={(e) =>
                                        updateSettings({ rightEyeColor: e.target.value })
                                    }
                                    className="flex-1 px-3 py-2 bg-slate-700 text-slate-100 rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="#00FFFF"
                                />
                            </div>
                        </div>

                        {/* Preview Box */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Preview (Colors should merge to white/grey)
                            </label>
                            <div className="relative h-24 bg-black rounded overflow-hidden">
                                <div
                                    className="absolute inset-0 w-1/2"
                                    style={{
                                        backgroundColor: settings.leftEyeColor,
                                        mixBlendMode: 'screen',
                                    }}
                                />
                                <div
                                    className="absolute inset-0 left-1/2 w-1/2"
                                    style={{
                                        backgroundColor: settings.rightEyeColor,
                                        mixBlendMode: 'screen',
                                    }}
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={resetToDefaults}
                                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-lg transition-colors font-medium"
                            >
                                Reset to Red/Cyan
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
