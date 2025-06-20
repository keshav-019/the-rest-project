// StatusBar.tsx
'use client'
export const StatusBar = () => {
    return (
        <div className="h-8 bg-gray-800 border-t border-gray-700 px-4 flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 bg-green-500 rounded-full"></span>
                    <span>Connected</span>
                </span>
                <span>Ready</span>
            </div>

            <div className="flex items-center gap-4">
                <span>Memory: 45.2 MB</span>
                <span>Version 1.0.0</span>
            </div>
        </div>
    );
};