'use client';
import React from 'react';
import { Request } from '@/types/Collections';
import RequestBuilder from './RequestBuilder';

interface RequestTabsProps {
    tabs: { id: string; request: Request }[];
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
        <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-800">
            <div className="flex bg-white dark:bg-gray-800">
                {tabs.map(tab => (
                    <div
                        key={tab.id}
                        className={`flex items-center px-4 py-3 cursor-pointer transition-colors ${activeTabId === tab.id
                            ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                        onClick={() => onTabChange(tab.id)}
                    >
                        <span className="truncate max-w-xs">{tab.request.name}</span>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onCloseTab(tab.id);
                            }}
                            className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full p-1 hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                            &times;
                        </button>
                    </div>
                ))}
            </div>

            <div className="flex-1 overflow-auto p-4">
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