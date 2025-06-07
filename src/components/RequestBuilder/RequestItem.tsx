// components/RequestItem.tsx
'use client';
import { Request } from '@/types/Collections';
import { Menu } from '@headlessui/react';
import { EllipsisHorizontalIcon } from '@heroicons/react/24/outline';

interface RequestItemProps {
    request: Request;
    onSelectRequest: (request: Request) => void;
    onRenameItem: (id: string, newName: string) => void;
    onDeleteItem: (id: string) => void;
    onDuplicateRequest: (request: Request) => void;
}

export default function RequestItem({ 
    request, 
    onSelectRequest,
    onRenameItem,
    onDeleteItem,
    onDuplicateRequest
}: RequestItemProps) {
    return (
        <div className="flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer">
            <div 
                className="flex items-center flex-1 min-w-0"
                onClick={() => onSelectRequest(request)}
            >
                <span className={`px-2 py-1 text-xs font-medium rounded mr-2 ${request.method === 'GET' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                        request.method === 'POST' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                            request.method === 'PUT' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                                request.method === 'DELETE' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                                    'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                    }`}>
                    {request.method}
                </span>
                <span className="text-gray-700 dark:text-gray-300 truncate">{request.name}</span>
            </div>
            
            <Menu as="div" className="relative">
                <Menu.Button
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                    <EllipsisHorizontalIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </Menu.Button>
                <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right divide-y divide-gray-100 dark:divide-gray-700 rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <Menu.Item>
                        {({ active }) => (
                            <button
                                onClick={() => onDuplicateRequest(request)}
                                className={`${active ? 'bg-blue-500 text-white' : 'text-gray-900 dark:text-gray-100'} group flex w-full items-center px-2 py-2 text-sm`}
                            >
                                Duplicate
                            </button>
                        )}
                    </Menu.Item>
                    <Menu.Item>
                        {({ active }) => (
                            <button
                                onClick={() => {
                                    const newName = prompt('Enter new name:', request.name);
                                    if (newName) onRenameItem(request.id, newName);
                                }}
                                className={`${active ? 'bg-blue-500 text-white' : 'text-gray-900 dark:text-gray-100'} group flex w-full items-center px-2 py-2 text-sm`}
                            >
                                Rename
                            </button>
                        )}
                    </Menu.Item>
                    <Menu.Item>
                        {({ active }) => (
                            <button
                                onClick={() => onDeleteItem(request.id)}
                                className={`${active ? 'bg-blue-500 text-white' : 'text-gray-900 dark:text-gray-100'} group flex w-full items-center px-2 py-2 text-sm text-red-600 dark:text-red-400`}
                            >
                                Delete
                            </button>
                        )}
                    </Menu.Item>
                </Menu.Items>
            </Menu>
        </div>
    );
}