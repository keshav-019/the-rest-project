// components/RequestBuilder.tsx
'use client';
import React, { useState } from 'react';
import { Request } from '@/types/Collections';

interface RequestBuilderProps {
    request: Request;
    onSave: (updatedRequest: Request) => void;
}

const RequestBuilder: React.FC<RequestBuilderProps> = ({ request, onSave }) => {
    const [currentRequest, setCurrentRequest] = useState<Request>(request);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCurrentRequest(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="p-4 h-full flex flex-col">
            <div className="flex items-center space-x-4 mb-4">
                <select
                    name="method"
                    value={currentRequest.method}
                    onChange={handleChange}
                    className="px-3 py-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                    <option value="PATCH">PATCH</option>
                </select>

                <input
                    type="text"
                    name="name"
                    value={currentRequest.name}
                    onChange={handleChange}
                    placeholder="Request name"
                    className="flex-1 px-3 py-2 border rounded dark:bg-gray-800 dark:border-gray-700"
                />
            </div>

            <input
                type="text"
                name="url"
                value={currentRequest.url}
                onChange={handleChange}
                placeholder="https://api.example.com/endpoint"
                className="w-full px-3 py-2 mb-4 border rounded dark:bg-gray-800 dark:border-gray-700"
            />

            <textarea
                name="description"
                value={currentRequest.description}
                onChange={handleChange}
                placeholder="Request description"
                className="flex-1 w-full px-3 py-2 mb-4 border rounded dark:bg-gray-800 dark:border-gray-700"
            />

            <button
                onClick={() => onSave(currentRequest)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
                Save Request
            </button>
        </div>
    );
};

export default RequestBuilder;