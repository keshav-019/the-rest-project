// components/Terminal/ConnectionModal.tsx
'use client'
import { useState, useEffect } from 'react';
import ModalBackdrop from '../Common/ModalBackdrop';
import { TerminalConnection } from '@/types/Terminal';

interface ConnectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (connection: TerminalConnection) => void;
    connection?: TerminalConnection | null;
}

export default function ConnectionModal({ isOpen, onClose, onSubmit, connection }: ConnectionModalProps) {
    const [name, setName] = useState('');
    const [host, setHost] = useState('');
    const [port, setPort] = useState('22');
    const [username, setUsername] = useState('');
    const [authMethod, setAuthMethod] = useState<'password' | 'key'>('password');
    const [password, setPassword] = useState('');
    const [keyPath, setKeyPath] = useState('');
    const [passphrase, setPassphrase] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (connection) {
            setName(connection.name);
            setHost(connection.host);
            setPort(connection.port.toString());
            setUsername(connection.username);
            setAuthMethod(connection.authMethod);
            setPassword(connection.password || '');
            setKeyPath(connection.keyPath || '');
            setPassphrase(connection.passphrase || '');
        } else {
            resetForm();
        }
    }, [connection]);

    const resetForm = () => {
        setName('');
        setHost('');
        setPort('22');
        setUsername('');
        setAuthMethod('password');
        setPassword('');
        setKeyPath('');
        setPassphrase('');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const newConnection: TerminalConnection = {
            id: connection?.id || Date.now().toString(),
            name,
            host,
            port: parseInt(port) || 22,
            username,
            authMethod,
            password: authMethod === 'password' ? password : undefined,
            keyPath: authMethod === 'key' ? keyPath : undefined,
            passphrase: authMethod === 'key' ? passphrase : undefined,
            createdAt: new Date().toISOString()
        };

        onSubmit(newConnection);
        setIsLoading(false);
    };

    if (!isOpen) return null;

    return (
        <ModalBackdrop onClose={onClose}>
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-2xl border border-slate-200 dark:border-gray-700 transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full relative z-50">
                <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 sm:mx-0 sm:h-10 sm:w-10">
                            <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                            </svg>
                        </div>
                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                                {connection ? 'Edit Connection' : 'Add New Connection'}
                            </h3>
                            <div className="mt-4">
                                <form onSubmit={handleSubmit}>
                                    <div className="space-y-4">
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Connection Name*
                                            </label>
                                            <input
                                                type="text"
                                                id="name"
                                                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                placeholder="My Server"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor="host" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Host*
                                                </label>
                                                <input
                                                    type="text"
                                                    id="host"
                                                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                    placeholder="example.com"
                                                    value={host}
                                                    onChange={(e) => setHost(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="port" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Port
                                                </label>
                                                <input
                                                    type="number"
                                                    id="port"
                                                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                    placeholder="22"
                                                    value={port}
                                                    onChange={(e) => setPort(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Username*
                                            </label>
                                            <input
                                                type="text"
                                                id="username"
                                                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                placeholder="user"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Authentication Method*
                                            </label>
                                            <div className="mt-2 space-y-2">
                                                <div className="flex items-center">
                                                    <input
                                                        id="auth-password"
                                                        name="auth-method"
                                                        type="radio"
                                                        checked={authMethod === 'password'}
                                                        onChange={() => setAuthMethod('password')}
                                                        className="h-4 w-4 text-blue-600 dark:text-blue-500 border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                                                    />
                                                    <label htmlFor="auth-password" className="ml-3 block text-sm text-gray-700 dark:text-gray-300">
                                                        Password
                                                    </label>
                                                </div>
                                                <div className="flex items-center">
                                                    <input
                                                        id="auth-key"
                                                        name="auth-method"
                                                        type="radio"
                                                        checked={authMethod === 'key'}
                                                        onChange={() => setAuthMethod('key')}
                                                        className="h-4 w-4 text-blue-600 dark:text-blue-500 border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                                                    />
                                                    <label htmlFor="auth-key" className="ml-3 block text-sm text-gray-700 dark:text-gray-300">
                                                        SSH Key
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        {authMethod === 'password' && (
                                            <div>
                                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Password*
                                                </label>
                                                <input
                                                    type="password"
                                                    id="password"
                                                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                    placeholder="••••••••"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    required={authMethod === 'password'}
                                                />
                                            </div>
                                        )}

                                        {authMethod === 'key' && (
                                            <>
                                                <div>
                                                    <label htmlFor="key-path" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Private Key Path*
                                                    </label>
                                                    <div className="mt-1 flex rounded-md shadow-sm">
                                                        <input
                                                            type="text"
                                                            id="key-path"
                                                            className="flex-1 min-w-0 block w-full border border-gray-300 dark:border-gray-600 rounded-l-md py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                            placeholder="/path/to/private/key"
                                                            value={keyPath}
                                                            onChange={(e) => setKeyPath(e.target.value)}
                                                            required={authMethod === 'key'}
                                                        />
                                                        <button
                                                            type="button"
                                                            className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-300 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                                                            onClick={() => {
                                                                if (window.electronAPI) {
                                                                    window.electronAPI.openFileDialog().then((path) => {
                                                                        if (path) setKeyPath(path);
                                                                    });
                                                                }
                                                            }}
                                                        >
                                                            Browse
                                                        </button>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label htmlFor="passphrase" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Key Passphrase (optional)
                                                    </label>
                                                    <input
                                                        type="password"
                                                        id="passphrase"
                                                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                        placeholder="••••••••"
                                                        value={passphrase}
                                                        onChange={(e) => setPassphrase(e.target.value)}
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                                        <button
                                            type="submit"
                                            className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-auto sm:text-sm ${isLoading ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'}`}
                                            disabled={isLoading}
                                        >
                                            {isLoading ? 'Saving...' : 'Save Connection'}
                                        </button>
                                        <button
                                            type="button"
                                            className="w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-auto sm:text-sm cursor-pointer"
                                            onClick={onClose}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ModalBackdrop>
    );
}
