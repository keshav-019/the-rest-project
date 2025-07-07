// terminal/page.tsx
'use client'
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the terminal component to avoid SSR issues
const TerminalComponent = dynamic(() => import('@/components/Terminal/TerminalComponent'), {
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-full">Loading terminal...</div>
});

export default function TerminalPage() {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return (
            <div className="flex items-center justify-center h-screen bg-black text-white">
                <div>Loading...</div>
            </div>
        );
    }

    return (
        <div className="h-screen w-full bg-black text-white">
            <div className="h-full flex flex-col">
                <div className="flex-shrink-0 p-4 border-b border-gray-700">
                    <h1 className="text-xl font-bold">Terminal</h1>
                </div>
                <div className="flex-1 overflow-hidden">
                    <TerminalComponent />
                </div>
            </div>
        </div>
    );
}