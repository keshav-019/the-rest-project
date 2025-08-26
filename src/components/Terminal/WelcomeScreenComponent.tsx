// components/Terminal/WelcomeScreen.tsx
'use client'
import { Plus, Server } from 'lucide-react';
import { TerminalConnection } from '@/types/Terminal';

interface WelcomeScreenProps {
    connections: TerminalConnection[];
    onAddConnection: () => void;
    onConnectionClick: (connection: TerminalConnection) => void;
    onLocalTerminalClick: () => void;
}

export default function WelcomeScreen({
    connections,
    onAddConnection,
    onConnectionClick,
    onLocalTerminalClick
}: WelcomeScreenProps) {
    return (
        <div className="h-full w-full p-6 bg-white dark:bg-gray-900">
            <div className="max-w-6xl mx-auto h-full flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-lg font-medium text-gray-900 dark:text-white">My Connections</h1>
                    <button
                        onClick={onLocalTerminalClick}
                        className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <span>Local Terminal</span>
                    </button>
                </div>

                {/* Connections Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 flex-1 overflow-y-auto">
                    {/* Always visible Add Connection tile */}
                    <div
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-dashed border-gray-300 dark:border-gray-600 cursor-pointer hover:shadow-md transition-shadow h-40"
                        onClick={onAddConnection}
                    >
                        <div className="h-full flex flex-col items-center justify-center p-4">
                            <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-3 mb-3">
                                <Plus className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">Add SSH Connection</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                                Create a new SSH connection
                            </p>
                        </div>
                    </div>

                    {/* Existing connections */}
                    {connections.map(connection => (
                        <div
                            key={connection.id}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-md transition-shadow h-40"
                            onClick={() => onConnectionClick(connection)}
                        >
                            <div className="h-full flex flex-col p-4">
                                <div className="flex items-center mb-3">
                                    <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-2 mr-3">
                                        <Server className="h-5 w-5 text-green-600 dark:text-green-400" />
                                    </div>
                                    <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                        {connection.name}
                                    </h3>
                                </div>
                                <div className="flex-1 flex flex-col justify-between">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                        {connection.username}@{connection.host}:{connection.port}
                                    </p>
                                    <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded self-start">
                                        {connection.authMethod === 'password' ? 'Password' : 'SSH Key'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}