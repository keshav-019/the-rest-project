'use client'
import React, { useEffect, useMemo, useState } from 'react';
import { Request } from '@/types/Collections';
import { PROTOCOL_METHOD_OPTIONS, SUPPORTED_PROTOCOLS } from '@/lib/collections-utils';
import { RequestProtocol, RequestType } from '@/types/Collections';

interface RequestBuilderProps {
    request: Request;
    onSave: (updatedRequest: Request) => void;
}

const RequestBuilder: React.FC<RequestBuilderProps> = ({ request, onSave }) => {
    const [currentRequest, setCurrentRequest] = useState<Request>(request);

    useEffect(() => {
        setCurrentRequest(request);
    }, [request]);

    const protocol = (currentRequest.protocol || 'http') as RequestProtocol;
    const allowedMethods = useMemo(() => PROTOCOL_METHOD_OPTIONS[protocol], [protocol]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCurrentRequest((previous) => ({
            ...previous,
            [name]: value,
            updatedAt: new Date().toISOString(),
        }));
    };

    const handleProtocolChange = (value: RequestProtocol) => {
        setCurrentRequest((previous) => {
            const nextProtocolMethods = PROTOCOL_METHOD_OPTIONS[value];
            const nextMethod = nextProtocolMethods.includes(previous.method as RequestType)
                ? (previous.method as RequestType)
                : nextProtocolMethods[0];

            return {
                ...previous,
                protocol: value,
                method: nextMethod,
                updatedAt: new Date().toISOString(),
            };
        });
    };

    return (
        <div className="h-full flex flex-col space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <select
                    name="protocol"
                    value={protocol}
                    onChange={(e) => handleProtocolChange(e.target.value as RequestProtocol)}
                    className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    {SUPPORTED_PROTOCOLS.map((item) => (
                        <option key={item.value} value={item.value}>
                            {item.label}
                        </option>
                    ))}
                </select>

                <select
                    title="handlechange"
                    name="method"
                    value={currentRequest.method}
                    onChange={handleChange}
                    className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    {allowedMethods.map((method) => (
                        <option key={method} value={method}>
                            {method}
                        </option>
                    ))}
                </select>

                <input
                    type="text"
                    name="name"
                    value={currentRequest.name}
                    onChange={handleChange}
                    placeholder="Request name"
                    className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <input
                type="text"
                name="url"
                value={currentRequest.url}
                onChange={handleChange}
                placeholder={
                    protocol === 'http' || protocol === 'graphql'
                        ? 'https://api.example.com/endpoint'
                        : `${protocol.toUpperCase()} endpoint`
                }
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
