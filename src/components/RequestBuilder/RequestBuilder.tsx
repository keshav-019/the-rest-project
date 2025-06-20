'use client'
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
        <div className="h-full flex flex-col space-y-4">
            <div className="flex items-center space-x-3">
                <select title='handlechange'
                    name="method"
                    value={currentRequest.method}
                    onChange={handleChange}
                    className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="flex-1 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <input
                type="text"
                name="url"
                value={currentRequest.url}
                onChange={handleChange}
                placeholder="https://api.example.com/endpoint"
                className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <textarea
                name="description"
                value={currentRequest.description}
                onChange={handleChange}
                placeholder="Request description"
                className="flex-1 w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />

            <button
                onClick={() => onSave(currentRequest)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            >
                Save Request
            </button>
        </div>
    );
};

export default RequestBuilder;