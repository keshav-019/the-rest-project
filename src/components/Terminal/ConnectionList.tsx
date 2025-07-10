// components/Terminal/ConnectionList.tsx
'use client'
import { TerminalConnection } from '@/types/Terminal';
import { PencilIcon, ServerIcon, TrashIcon } from 'lucide-react';

interface ConnectionListProps {
    connections: TerminalConnection[];
    onSelect: (connection: TerminalConnection) => void;
    onEdit: (connection: TerminalConnection) => void;
    onDelete: (id: string) => void;
}

export default function ConnectionList({ connections, onSelect, onEdit, onDelete }: ConnectionListProps) {
    if (connections.length === 0) {
        return (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                <p>No connections yet. Add your first SSH connection.</p>
            </div>
        );
    }

    return (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {connections.map((connection) => (
                <li key={connection.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <div className="flex items-center justify-between px-4 py-3">
                        <div 
                            className="flex items-center flex-1 min-w-0 cursor-pointer"
                            onClick={() => onSelect(connection)}
                        >
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <ServerIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="ml-3 overflow-hidden">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {connection.name}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                    {connection.username}@{connection.host}:{connection.port}
                                </p>
                            </div>
                        </div>
                        <div className="ml-4 flex-shrink-0 flex space-x-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit(connection);
                                }}
                                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                            >
                                <PencilIcon className="h-5 w-5" />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(connection.id);
                                }}
                                className="text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                            >
                                <TrashIcon className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </li>
            ))}
        </ul>
    );
}