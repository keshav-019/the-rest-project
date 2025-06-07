import { useState } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default // Active Sessions Component
function ActiveSessionsModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void}) {
    const [sessions] = useState([
        {
            id: 1,
            device: 'MacBook Pro',
            browser: 'Chrome',
            location: 'New York, US',
            lastActive: '2 minutes ago',
            current: true,
            ip: '192.168.1.1'
        },
        {
            id: 2,
            device: 'iPhone 14',
            browser: 'Safari',
            location: 'New York, US',
            lastActive: '1 hour ago',
            current: false,
            ip: '192.168.1.2'
        },
        {
            id: 3,
            device: 'Windows PC',
            browser: 'Firefox',
            location: 'California, US',
            lastActive: '2 days ago',
            current: false,
            ip: '10.0.0.1'
        }
    ]);

    const handleRevokeSession = (sessionId: any) => {
        // Handle session revocation
        console.log('Revoking session:', sessionId);
    };

    const handleRevokeAll = () => {
        // Handle revoking all sessions except current
        console.log('Revoking all sessions except current');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-96 overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-800 dark:text-white">Active Sessions</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="space-y-4">
                    {sessions.map((session) => (
                        <div key={session.id} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <h4 className="font-medium text-gray-800 dark:text-white">
                                            {session.device}
                                        </h4>
                                        {session.current && (
                                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                                Current
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                                        <p>{session.browser} • {session.location}</p>
                                        <p>IP: {session.ip}</p>
                                        <p>Last active: {session.lastActive}</p>
                                    </div>
                                </div>
                                {!session.current && (
                                    <button
                                        onClick={() => handleRevokeSession(session.id)}
                                        className="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                    >
                                        Revoke
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-600 mt-6">
                    <button
                        onClick={handleRevokeAll}
                        className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700"
                    >
                        Revoke All Other Sessions
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}