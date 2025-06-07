// components/RequestTabs.tsx
'use client';
import React from 'react';
import { Request } from '@/types/Collections';
import RequestBuilder from './RequestBuilder';

interface RequestTabsProps {
  tabs: {id: string; request: Request}[];
  activeTabId: string | null;
  onTabChange: (id: string) => void;
  onCloseTab: (id: string) => void;
  onSaveRequest: (id: string, request: Request) => void;
}

const RequestTabs: React.FC<RequestTabsProps> = ({
  tabs,
  activeTabId,
  onTabChange,
  onCloseTab,
  onSaveRequest,
}) => {
  const activeTab = tabs.find(tab => tab.id === activeTabId) || tabs[0];

  return (
    <div className="flex flex-col h-full">
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {tabs.map(tab => (
          <div
            key={tab.id}
            className={`flex items-center px-4 py-2 cursor-pointer ${
              activeTabId === tab.id
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400'
            }`}
            onClick={() => onTabChange(tab.id)}
          >
            <span className="truncate max-w-xs">{tab.request.name}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCloseTab(tab.id);
              }}
              className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
      
      <div className="flex-1 overflow-auto">
        {activeTab && (
          <RequestBuilder
            request={activeTab.request}
            onSave={(updatedRequest: Request) => onSaveRequest(activeTab.id, updatedRequest)}
          />
        )}
      </div>
    </div>
  );
};

export default RequestTabs;