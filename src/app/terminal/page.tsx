// app/terminal/page.tsx
'use client'
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { MonitorX } from 'lucide-react';

const TerminalManager = dynamic(() => import('@/components/Terminal/TerminalManager'), {
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">Loading terminal manager...</div>
});

export default function TerminalPage() {
    const [isClient, setIsClient] = useState(false);
    const [isElectronRuntime, setIsElectronRuntime] = useState(false);

    useEffect(() => {
        setIsClient(true);
        setIsElectronRuntime(typeof window !== 'undefined' && !!window.electronAPI);
    }, []);

    if (!isClient) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
                <div>Loading...</div>
            </div>
        );
    }

    if (!isElectronRuntime) {
        return (
            <div className="h-screen w-full bg-slate-50 dark:bg-gray-900 flex items-center justify-center p-6">
                <div className="max-w-xl w-full rounded-2xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm p-8 text-center">
                    <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-slate-100 dark:bg-gray-700 flex items-center justify-center">
                        <MonitorX className="h-7 w-7 text-slate-600 dark:text-slate-300" />
                    </div>
                    <h1 className="text-xl font-semibold text-slate-900 dark:text-white">SSH Manager is desktop-only</h1>
                    <p className="mt-2 text-sm text-slate-600 dark:text-gray-300">
                        This section is available only when API Nexus is launched in Electron.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen w-full bg-gray-50 dark:bg-gray-900">
            <TerminalManager />
        </div>
    );
}
