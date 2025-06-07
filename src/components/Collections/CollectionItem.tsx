// components/CollectionItem.tsx
'use client';
import React, { useState } from 'react';
import { Collection, Request } from '@/types/Collections';
import FolderItem from './FolderItem';
import RequestItem from '../RequestBuilder/RequestItem'; // Add this import
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { EllipsisHorizontalIcon } from '@heroicons/react/24/outline';
import { ChevronIcon } from '../Common/Icons';

interface CollectionItemProps {
    collection: Collection;
    onSelectRequest: (request: Request) => void;
    onAddRequest: (collectionId: string, folderId?: string) => void;
    onAddFolder: (collectionId: string, parentFolderId?: string) => void;
    onRenameItem: (id: string, newName: string) => void;
    onDeleteItem: (id: string) => void;
    onDuplicateRequest: (request: Request) => void;
}

const CollectionItem: React.FC<CollectionItemProps> = ({
    collection,
    onSelectRequest,
    onAddRequest,
    onAddFolder,
    onRenameItem,
    onDeleteItem,
    onDuplicateRequest,
}) => {
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <div className="relative">
            <div className="flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer">
                <div
                    className="flex items-center flex-1 min-w-0"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <ChevronIcon expanded={isExpanded} />
                    <span className="ml-2 text-gray-800 dark:text-white font-medium truncate flex-1">
                        {collection.name}
                    </span>
                </div>
                
                <Menu as="div" className="relative">
                    <MenuButton
                        onClick={(e) => e.stopPropagation()}
                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                        <EllipsisHorizontalIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    </MenuButton>
                    <MenuItems className="absolute right-0 z-10 mt-2 w-48 origin-top-right divide-y divide-gray-100 dark:divide-gray-700 rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <MenuItem>
                            {({ active }) => (
                                <button
                                    onClick={() => onAddFolder(collection.id)}
                                    className={`${active ? 'bg-blue-500 text-white' : 'text-gray-900 dark:text-gray-100'} group flex w-full items-center px-2 py-2 text-sm`}
                                >
                                    Add Folder
                                </button>
                            )}
                        </MenuItem>
                        <MenuItem>
                            {({ active }) => (
                                <button
                                    onClick={() => onAddRequest(collection.id)}
                                    className={`${active ? 'bg-blue-500 text-white' : 'text-gray-900 dark:text-gray-100'} group flex w-full items-center px-2 py-2 text-sm`}
                                >
                                    Add Request
                                </button>
                            )}
                        </MenuItem>
                        <MenuItem>
                            {({ active }) => (
                                <button
                                    onClick={() => {
                                        const newName = prompt('Enter new name:', collection.name);
                                        if (newName) onRenameItem(collection.id, newName);
                                    }}
                                    className={`${active ? 'bg-blue-500 text-white' : 'text-gray-900 dark:text-gray-100'} group flex w-full items-center px-2 py-2 text-sm`}
                                >
                                    Rename
                                </button>
                            )}
                        </MenuItem>
                        <MenuItem>
                            {({ active }) => (
                                <button
                                    onClick={() => onDeleteItem(collection.id)}
                                    className={`${active ? 'bg-blue-500 text-white' : 'text-gray-900 dark:text-gray-100'} group flex w-full items-center px-2 py-2 text-sm text-red-600 dark:text-red-400`}
                                >
                                    Delete
                                </button>
                            )}
                        </MenuItem>
                    </MenuItems>
                </Menu>
            </div>

            {isExpanded && (
                <div className="ml-4 space-y-1">
                    {/* Render folders first */}
                    {collection.folders.map((folder) => (
                        <FolderItem
                            key={folder.id}
                            folder={folder}
                            collectionId={collection.id}
                            onSelectRequest={onSelectRequest}
                            onAddRequest={onAddRequest}
                            onAddFolder={onAddFolder}
                            onRenameItem={onRenameItem}
                            onDeleteItem={onDeleteItem}
                            onDuplicateRequest={onDuplicateRequest}
                        />
                    ))}
                    
                    {/* Then render direct requests */}
                    {collection.requests.map((request) => (
                        <RequestItem 
                            key={request.id}
                            request={request}
                            onSelectRequest={onSelectRequest}
                            onRenameItem={onRenameItem}
                            onDeleteItem={onDeleteItem}
                            onDuplicateRequest={onDuplicateRequest}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CollectionItem;