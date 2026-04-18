// StatusBar.tsx
'use client'
import { ConnectionConfig } from '@/types/Connection';

interface StatusBarProps {
    selectedConnection: ConnectionConfig | null;
}

export const StatusBar = ({ selectedConnection }: StatusBarProps) => {
    const hasSelectedConnection = Boolean(selectedConnection);

    return (
        <div className="h-9 bg-white dark:bg-gray-800 border-t border-slate-200 dark:border-gray-700 px-4 flex items-center justify-between text-xs text-slate-500 dark:text-gray-400">
            <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${hasSelectedConnection ? 'bg-emerald-500' : 'bg-slate-400 dark:bg-gray-500'}`}></span>
                    <span>{hasSelectedConnection ? 'Connected' : 'No Connection Selected'}</span>
                </span>
                <span>{hasSelectedConnection ? 'Ready' : 'Idle'}</span>
                {hasSelectedConnection && (
                    <span className="hidden sm:inline text-slate-600 dark:text-gray-300">
                        {selectedConnection?.name}
                    </span>
                )}
            </div>

            <div className="flex items-center gap-4">
                <span>Memory: 45.2 MB</span>
                <span>Version 1.0.0</span>
            </div>
        </div>
    );
};
