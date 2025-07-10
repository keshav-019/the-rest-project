// app/terminal/page.tsx
'use client'
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const TerminalManager = dynamic(() => import('@/components/Terminal/TerminalManager'), {
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">Loading terminal manager...</div>
});

export default function TerminalPage() {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
                <div>Loading...</div>
            </div>
        );
    }

    return (
        <div className="h-screen w-full bg-gray-50 dark:bg-gray-900">
            <TerminalManager />
        </div>
    );
}