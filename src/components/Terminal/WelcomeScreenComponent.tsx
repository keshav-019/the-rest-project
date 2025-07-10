// components/Terminal/WelcomeScreen.tsx
'use client'
import { Monitor, Plus, Server } from 'lucide-react';
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
        <div className="h-full w-full p-8 bg-white dark:bg-gray-900">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Terminal Manager</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        Manage your local and SSH terminals in one place
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Quick Access Card */}
                    <div
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={onLocalTerminalClick}
                    >
                        <div className="p-6 flex flex-col items-center">
                            <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-4 mb-4">
                                <Monitor className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Local Terminal</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                                Open a terminal session on your local machine
                            </p>
                        </div>
                    </div>

                    {/* Add Connection Card */}
                    <div
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-dashed border-gray-300 dark:border-gray-600 cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={onAddConnection}
                    >
                        <div className="p-6 flex flex-col items-center h-full justify-center">
                            <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-4 mb-4">
                                <Plus className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Add SSH Connection</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                                Create a new SSH connection to a remote server
                            </p>
                        </div>
                    </div>

                    {/* Existing Connections */}
                    {connections.map(connection => (
                        <div
                            key={connection.id}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg transition-shadow"
                            onClick={() => onConnectionClick(connection)}
                        >
                            <div className="p-6">
                                <div className="flex items-center mb-4">
                                    <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-3 mr-4">
                                        <Server className="h-6 w-6 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                            {connection.name}
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {connection.username}@{connection.host}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                                    <span>Port: {connection.port}</span>
                                    <span className="capitalize">{connection.authMethod}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}