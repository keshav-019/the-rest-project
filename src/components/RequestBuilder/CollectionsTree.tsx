// components/CollectionsTree.tsx
'use client'
import React from 'react';
import { Collection, Request } from '@/types/Collections';
import CollectionItem from '../Collections/CollectionItem';
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react';
import { PlusIcon, DocumentArrowUpIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';

interface CollectionsTreeProps {
    collections: Collection[];
    onAddRequest: (collectionId: string, folderId?: string) => void;
    onAddFolder: (collectionId: string, parentFolderId?: string) => void;
    onRenameItem: (id: string, newName: string) => void;
    onDeleteItem: (id: string) => void;
    onDuplicateRequest: (request: Request) => void;
    onSelectRequest: (request: Request) => void;
    onAddCollection: (value: string) => void;
    onExportCollections: () => void;
    onImportCollections?: () => void;
    onSelectCollection?: (collection: Collection) => void;
    selectedCollectionId?: string | null;
}

const CollectionsTree: React.FC<CollectionsTreeProps> = ({
    collections,
    onAddRequest,
    onAddFolder,
    onRenameItem,
    onDeleteItem,
    onDuplicateRequest,
    onSelectRequest,
    onAddCollection,
    onExportCollections,
    onImportCollections,
    onSelectCollection,
    selectedCollectionId,
}) => {
    return (
        <aside className="w-64 shrink-0 overflow-y-auto border-r border-gray-200 bg-slate-50/70 dark:border-gray-700 dark:bg-gray-900">
            <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-md font-semibold text-gray-800 dark:text-white">Collections</h2>
                    <Menu as="div" className="relative">
                        {({ open }) => (
                            <>
                                <MenuButton
                                    className={`p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 ${
                                        open ? 'transform rotate-45' : ''
                                    }`}
                                    aria-label="Add collection"
                                >
                                    <PlusIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                                </MenuButton>
                                <Transition
                                    enter="transition ease-out duration-100"
                                    enterFrom="transform opacity-0 scale-95"
                                    enterTo="transform opacity-100 scale-100"
                                    leave="transition ease-in duration-75"
                                    leaveFrom="transform opacity-100 scale-100"
                                    leaveTo="transform opacity-0 scale-95"
                                >
                                <MenuItems className="absolute right-0 z-[90] mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:divide-gray-700 dark:border-gray-700 dark:bg-gray-800">
                                        <div className="px-1 py-1">
                                            <MenuItem>
                                                {({ active }) => (
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            onAddCollection('New Collection');
                                                        }}
                                                        className={`${
                                                            active ? 'bg-blue-500 text-white' : 'text-gray-900 dark:text-gray-100'
                                                        } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                                    >
                                                        <PlusIcon className="mr-2 h-4 w-4" />
                                                        Add Collection
                                                    </button>
                                                )}
                                            </MenuItem>
                                            {onImportCollections ? (
                                                <MenuItem>
                                                    {({ active }) => (
                                                        <button
                                                            onClick={onImportCollections}
                                                            className={`${
                                                                active
                                                                    ? 'bg-blue-500 text-white'
                                                                    : 'text-gray-900 dark:text-gray-100'
                                                            } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                                        >
                                                            <DocumentArrowDownIcon className="mr-2 h-4 w-4" />
                                                            Import Collections
                                                        </button>
                                                    )}
                                                </MenuItem>
                                            ) : null}
                                        </div>
                                        <div className="px-1 py-1">
                                            <MenuItem>
                                                {({ active }) => (
                                                    <button
                                                        onClick={onExportCollections}
                                                        className={`${
                                                            active ? 'bg-blue-500 text-white' : 'text-gray-900 dark:text-gray-100'
                                                        } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                                    >
                                                        <DocumentArrowUpIcon className="mr-2 h-4 w-4" />
                                                        Export Collections
                                                    </button>
                                                )}
                                            </MenuItem>
                                        </div>
                                    </MenuItems>
                                </Transition>
                            </>
                        )}
                    </Menu>
                </div>
                <div className="space-y-2 text-sm">
                    {collections.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-4 text-xs text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400">
                            No collections yet. Use the + button to create or import one.
                        </div>
                    ) : (
                        collections.map((collection) => (
                            <CollectionItem
                                key={collection.id}
                                collection={collection}
                                onSelectRequest={onSelectRequest}
                                onAddRequest={onAddRequest}
                                onAddFolder={onAddFolder}
                                onRenameItem={onRenameItem}
                                onDeleteItem={onDeleteItem}
                                onDuplicateRequest={onDuplicateRequest}
                                onSelectCollection={onSelectCollection}
                                isSelected={selectedCollectionId === collection.id}
                            />
                        ))
                    )}
                </div>
            </div>
        </aside>
    );
};

export default CollectionsTree;
