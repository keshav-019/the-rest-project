// Updated RequestItem.tsx
'use client'
import { useState } from 'react';
import { Request } from '@/types/Collections';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
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
    onDuplicateRequest,
}: RequestItemProps) {
    const [isRenaming, setIsRenaming] = useState(false);
    const [renameInput, setRenameInput] = useState(request.name);

    const handleRename = () => {
        if (renameInput.trim() && renameInput !== request.name) {
            onRenameItem(request.id, renameInput.trim());
        }
        setIsRenaming(false);
    };

    return (
        <div className="flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer">
            <div
                className="flex items-center flex-1 min-w-0"
                onClick={() => onSelectRequest(request)}
            >
                <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 mr-2 uppercase">
                    {(request.protocol || 'http').replace('socketio', 'socket.io')}
                </span>
                <span
                    className={`px-2 py-1 text-xs font-medium rounded mr-2 ${request.method === 'GET'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                            : request.method === 'POST'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                                : request.method === 'PUT'
                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                    : request.method === 'DELETE'
                                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                        }`}
                >
                    {request.method}
                </span>

                {isRenaming ? (
                    <input title='renameinput'
                        type="text"
                        value={renameInput}
                        onChange={(e) => setRenameInput(e.target.value)}
                        onBlur={handleRename}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRename();
                            if (e.key === 'Escape') {
                                setRenameInput(request.name);
                                setIsRenaming(false);
                            }
                        }}
                        className="px-2 py-1 text-sm rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        autoFocus
                    />
                ) : (
                    <span className="text-gray-700 dark:text-gray-300 truncate">{request.name}</span>
                )}
            </div>

            <Menu as="div" className="relative">
                <MenuButton
                    onClick={(e) => e.stopPropagation()}
                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                    <EllipsisHorizontalIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </MenuButton>
                <MenuItems className="absolute right-0 z-10 mt-2 w-48 origin-top-right divide-y divide-gray-100 dark:divide-gray-700 rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                        <MenuItem>
                            {({ active }) => (
                                <button
                                    onClick={() => onDuplicateRequest(request)}
                                    className={`${active ? 'bg-blue-500 text-white' : 'text-gray-900 dark:text-gray-100'} group flex w-full items-center px-4 py-2 text-sm`}
                                >
                                    Duplicate
                                </button>
                            )}
                        </MenuItem>
                        <MenuItem>
                            {({ active }) => (
                                <button
                                    onClick={() => {
                                        setIsRenaming(true);
                                        setRenameInput(request.name);
                                    }}
                                    className={`${active ? 'bg-blue-500 text-white' : 'text-gray-900 dark:text-gray-100'} group flex w-full items-center px-4 py-2 text-sm`}
                                >
                                    Rename
                                </button>
                            )}
                        </MenuItem>
                        <MenuItem>
                            {({ active }) => (
                                <button
                                    onClick={() => onDeleteItem(request.id)}
                                    className={`${active ? 'bg-red-600 text-white' : 'text-red-600 dark:text-red-400'} group flex w-full items-center px-4 py-2 text-sm`}
                                >
                                    Delete
                                </button>
                            )}
                        </MenuItem>
                    </div>
                </MenuItems>
            </Menu>
        </div>
    );
}
