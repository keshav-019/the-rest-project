// components/FolderItem.tsx
'use client';
import { useEffect, useState } from 'react';
import { Folder, Request } from '@/types/Collections';
import RequestItem from '../RequestBuilder/RequestItem';
import { Menu } from '@headlessui/react';
import { EllipsisHorizontalIcon } from '@heroicons/react/24/outline';
import { ChevronIcon } from '../Common/Icons';

interface FolderItemProps {
  folder: Folder;
  collectionId: string;
  onSelectRequest: (request: Request) => void;
  onAddRequest?: (collectionId: string, folderId: string) => void;
  onAddFolder?: (collectionId: string, parentFolderId: string) => void;
  onRenameItem: (id: string, newName: string) => void;
  onDeleteItem: (id: string) => void;
  onDuplicateRequest: (request: Request) => void;
}

export default function FolderItem({ 
  folder, 
  collectionId,
  onSelectRequest,
  onAddRequest,
  onAddFolder,
  onRenameItem,
  onDeleteItem,
  onDuplicateRequest
}: FolderItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Add this useEffect to auto-expand when new items are added
  useEffect(() => {
    setIsExpanded(true);
  }, [folder.requests.length]);

  return (
    <div className="relative">
      <div className="flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer">
        <div 
          className="flex items-center flex-1 min-w-0"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <ChevronIcon expanded={isExpanded} />
          <span className="ml-2 text-gray-700 dark:text-gray-300">{folder.name}</span>
        </div>
        
        <Menu as="div" className="relative">
          <Menu.Button
            onClick={(e) => e.stopPropagation()}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            <EllipsisHorizontalIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </Menu.Button>
          <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right divide-y divide-gray-100 dark:divide-gray-700 rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => onAddFolder?.(collectionId, folder.id)}
                  className={`${active ? 'bg-blue-500 text-white' : 'text-gray-900 dark:text-gray-100'} group flex w-full items-center px-2 py-2 text-sm`}
                >
                  Add Subfolder
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => onAddRequest?.(collectionId, folder.id)}
                  className={`${active ? 'bg-blue-500 text-white' : 'text-gray-900 dark:text-gray-100'} group flex w-full items-center px-2 py-2 text-sm`}
                >
                  Add Request
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => {
                    const newName = prompt('Enter new name:', folder.name);
                    if (newName) onRenameItem(folder.id, newName);
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
                  onClick={() => onDeleteItem(folder.id)}
                  className={`${active ? 'bg-blue-500 text-white' : 'text-gray-900 dark:text-gray-100'} group flex w-full items-center px-2 py-2 text-sm text-red-600 dark:text-red-400`}
                >
                  Delete
                </button>
              )}
            </Menu.Item>
          </Menu.Items>
        </Menu>
      </div>
      
      {isExpanded && (
        <div className="ml-4 space-y-1">
          {folder.requests.map((request) => (
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
}