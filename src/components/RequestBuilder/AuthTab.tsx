import { Auth } from "@/types/Collections";
import { AuthType } from "@/types/User";

export default function AuthTab({auth, setAuth}: {auth: Auth, setAuth: (value: React.SetStateAction<Auth>) => void}) {
    return (
        <div className="space-y-4">
            <div className="relative">
                <select
                    className="w-full h-10 pl-3 pr-10 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                    value={auth.type}
                    onChange={(e) => setAuth({ ...auth, type: e.target.value as AuthType })}
                >
                    <option value="none">No Auth</option>
                    <option value="bearer">Bearer Token</option>
                    <option value="basic">Basic Auth</option>
                    <option value="apiKey">API Key</option>
                    <option value="oauth2">OAuth 2.0</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </div>
            </div>

            {auth.type === 'bearer' && (
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Token</label>
                    <input
                        type="text"
                        className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your bearer token"
                        value={auth.credentials.token || ''}
                        onChange={(e) => setAuth({ ...auth, credentials: { ...auth.credentials, token: e.target.value } })}
                    />
                </div>
            )}

            {auth.type === 'basic' && (
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
                    <input
                        type="text"
                        className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter username"
                        value={auth.credentials.username || ''}
                        onChange={(e) => setAuth({ ...auth, credentials: { ...auth.credentials, username: e.target.value } })}
                    />
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                    <input
                        type="password"
                        className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter password"
                        value={auth.credentials.password || ''}
                        onChange={(e) => setAuth({ ...auth, credentials: { ...auth.credentials, password: e.target.value } })}
                    />
                </div>
            )}

            {auth.type === 'apiKey' && (
                <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Key</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter key"
                                value={auth.credentials.key || ''}
                                onChange={(e) => setAuth({ ...auth, credentials: { ...auth.credentials, key: e.target.value } })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Value</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter value"
                                value={auth.credentials.value || ''}
                                onChange={(e) => setAuth({ ...auth, credentials: { ...auth.credentials, value: e.target.value } })}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Add to</label>
                        <select
                            className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={auth.credentials.addTo || 'header'}
                            onChange={(e) => setAuth({ ...auth, credentials: { ...auth.credentials, addTo: e.target.value as "header" | "query" | undefined } })}
                        >
                            <option value="header">Header</option>
                            <option value="query">Query Params</option>
                        </select>
                    </div>
                </div>
            )}

            {auth.type === 'oauth2' && (
                <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Client ID</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter client ID"
                                value={auth.credentials.clientId || ''}
                                onChange={(e) => setAuth({ ...auth, credentials: { ...auth.credentials, clientId: e.target.value } })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Client Secret</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter client secret"
                                value={auth.credentials.clientSecret || ''}
                                onChange={(e) => setAuth({ ...auth, credentials: { ...auth.credentials, clientSecret: e.target.value } })}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Access Token URL</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter access token URL"
                            value={auth.credentials.tokenUrl || ''}
                            onChange={(e) => setAuth({ ...auth, credentials: { ...auth.credentials, tokenUrl: e.target.value } })}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}