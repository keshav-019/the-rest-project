// Updated RequestBuilder component with tab system
'use client';
import React, { useState, useEffect } from "react";
import { useClipboard } from "@/hooks/useClipboard";
import { saveAs } from 'file-saver';
import { Auth, Collection, Folder, Header, Param, RequestType, ResponseData, TabType } from "@/types/Collections";
import { Request } from "@/types/Collections";
import CollectionsTree from "@/components/RequestBuilder/CollectionsTree";
import RequestURLBar from "@/components/RequestBuilder/RequestUrlBar";
import RequestsNavBar from "@/components/RequestBuilder/RequestsNavbar";
import ResponseTab from "@/components/RequestBuilder/ResponseTab";
import ReturnedResponseTab from "@/components/RequestBuilder/ReturnedResponseTab";
import UserDropdown from "@/components/Common/UserDropdown";
import RequestTabContent from "@/components/RequestBuilder/RequestTabContent";
import { getCurrentUser, getInitials } from "@/lib/firebase/auth";
import { useRouter } from "next/navigation";

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

// Sample collections data
const sampleCollections: Collection[] = [
    {
        id: "col-1",
        name: "Sample Collection",
        description: "A sample collection for testing",
        variables: [],
        folders: [
            {
                id: "folder-1",
                name: "User Endpoints",
                requests: [
                    {
                        id: "req-1",
                        method: "GET",
                        name: "Get User",
                        description: "Get user details",
                        url: "https://jsonplaceholder.typicode.com/users/1"
                    },
                    {
                        id: "req-2",
                        method: "POST",
                        name: "Create User",
                        description: "Create a new user",
                        url: "https://jsonplaceholder.typicode.com/users"
                    }
                ]
            }
        ],
        requests: [
            {
                id: "req-3",
                method: "GET",
                name: "Get Posts",
                description: "Get all posts",
                url: "https://jsonplaceholder.typicode.com/posts"
            }
        ]
    },
    {
        id: "col-2",
        name: "Another Collection",
        description: "Another sample collection",
        variables: [],
        folders: [],
        requests: [
            {
                id: "req-4",
                method: "GET",
                name: "Get Comments",
                description: "Get all comments",
                url: "https://jsonplaceholder.typicode.com/comments"
            }
        ]
    }
];

export default function RequestBuilder() {
    const [activeRequestTab, setActiveRequestTab] = useState<TabType>('Params');
    const [activeResponseTab, setActiveResponseTab] = useState<'Response' | 'Headers' | 'Cookies' | 'Timeline'>('Response');
    const [method, setMethod] = useState<RequestType>(RequestType.GET);
    const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/posts/1');
    const [activeTabs, setActiveTabs] = useState<{ id: string; request: Request }[]>([]);
    const [isStarred, setIsStarred] = useState(false);
    const [collections, setCollections] = useState<Collection[]>(sampleCollections);
    const [params, setParams] = useState<Param[]>([
        { enabled: false, key: '', value: '' }
    ]);
    const [headers, setHeaders] = useState<Header[]>([
        { enabled: true, key: 'Content-Type', value: 'application/json' },
        { enabled: true, key: 'Accept', value: 'application/json' },
        { enabled: false, key: '', value: '' }
    ]);
    const [body, setBody] = useState('{\n  "key": "value"\n}');
    const [auth, setAuth] = useState<Auth>({ type: 'none', credentials: {} });
    const [preRequestScript, setPreRequestScript] = useState('// Add your pre-request script here');
    const [tests, setTests] = useState('// Add your tests here');
    const [response, setResponse] = useState<ResponseData | null>(null);
    const [responseHeaders, setResponseHeaders] = useState<Array<{ key: string; value: string }>>([]);
    const [cookies, setCookies] = useState<Array<{ name: string; value: string; domain: string; path: string }>>([]);
    const [timeline, setTimeline] = useState<Array<{ name: string; duration: number }>>([]);
    const [activeTabId, setActiveTabId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { copyToClipboard } = useClipboard();
    const [initials, setInitials] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [displayName, setDisplayName] = useState<string>('');
    const router = useRouter();

    // Load active tab request when activeTabId changes
    useEffect(() => {
        if (activeTabId) {
            const activeTab = activeTabs.find(tab => tab.id === activeTabId);
            if (activeTab) {
                const { request } = activeTab;
                setMethod(request.method as RequestType);
                setUrl(request.url);
                // In a real app, you'd load all the saved params, headers, etc. for this request
            }
        }

        const user = getCurrentUser();
        console.log("The user is: ", user);
        if (user === null) {
            router.push('/login')
        }
        setInitials(getInitials(user?.displayName));
        setUsername(user?.username || '');
        setEmail(user?.email || '');
        setDisplayName(user?.displayName || '');
    }, [activeTabId]);

    const handleImportCollections = () => {
        // Create file input element
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.onchange = (e: Event) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const importedData = JSON.parse(event.target?.result as string);

                    // Validate the imported data structure
                    if (Array.isArray(importedData) && importedData.every(isValidCollection)) {
                        // Replace current collections with imported ones
                        setCollections(importedData);
                        alert('Collections imported successfully!');
                    } else {
                        throw new Error('Invalid collections format');
                    }
                } catch (error) {
                    alert('Error importing collections: Invalid file format');
                    console.error('Import error:', error);
                }
            };
            reader.readAsText(file);
        };

        input.click();
    };

    // Helper function to validate collection structure
    const isValidCollection = (obj: any): obj is Collection => {
        return obj &&
            typeof obj.id === 'string' &&
            typeof obj.name === 'string' &&
            Array.isArray(obj.folders) &&
            Array.isArray(obj.requests);
    };

    const handleExportCollections = () => {
        // Convert collections to JSON string
        const dataStr = JSON.stringify(collections, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        // Create download link
        const exportFileDefaultName = 'collections-export.json';
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    const handleAddCollection = (name: string) => {
        const newCollection: Collection = {
            id: `${Date.now()}`, // Use timestamp for unique ID
            name,
            description: '',
            variables: [],
            folders: [],
            requests: []
        };
        setCollections([...collections, newCollection]);
    };

    const handleSendRequest = async () => {
        setIsLoading(true);
        setError(null);
        const startTime = Date.now();

        try {
            // Construct URL with query params
            let requestUrl = url;
            const enabledParams = params.filter(p => p.enabled && p.key);
            if (enabledParams.length > 0) {
                const queryString = enabledParams
                    .map(p => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
                    .join('&');
                requestUrl += (requestUrl.includes('?') ? '&' : '?') + queryString;
            }

            // Prepare headers
            const requestHeaders: Record<string, string> = {};
            headers
                .filter(h => h.enabled && h.key)
                .forEach(h => {
                    requestHeaders[h.key] = h.value;
                });

            // Handle authentication
            if (auth.type === 'bearer' && auth.credentials.token) {
                requestHeaders['Authorization'] = `Bearer ${auth.credentials.token}`;
            } else if (auth.type === 'basic' && auth.credentials.username && auth.credentials.password) {
                const basicAuth = btoa(`${auth.credentials.username}:${auth.credentials.password}`);
                requestHeaders['Authorization'] = `Basic ${basicAuth}`;
            } else if (auth.type === 'apiKey') {
                if (auth.credentials.addTo === 'header') {
                    requestHeaders[auth.credentials.key || 'X-API-KEY'] = auth.credentials.value || '';
                } else if (auth.credentials.addTo === 'query') {
                    requestUrl += (requestUrl.includes('?') ? '&' : '?') +
                        `${encodeURIComponent(auth.credentials.key || 'api_key')}=${encodeURIComponent(auth.credentials.value || '')}`;
                }
            }

            // Prepare body
            let requestBody: any = null;
            if (['POST', 'PUT', 'PATCH'].includes(method)) {
                try {
                    requestBody = body ? JSON.parse(body) : {};
                } catch (e) {
                    throw new Error('Invalid JSON body');
                }
            }

            // Execute request
            const response = await fetch(requestUrl, {
                method,
                headers: requestHeaders,
                body: method !== 'GET' && method !== 'HEAD' ? JSON.stringify(requestBody) : undefined
            });

            const endTime = Date.now();
            const duration = endTime - startTime;

            // Process response
            let responseData;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                responseData = await response.json();
            } else {
                responseData = await response.text();
            }

            // Extract headers
            const responseHeaders: Array<{ key: string; value: string }> = [];
            response.headers.forEach((value, key) => {
                responseHeaders.push({ key, value });
            });

            // Create timing phases (simplified for demo)
            const timingPhases = [
                { name: 'DNS Lookup', duration: Math.round(duration * 0.1) },
                { name: 'TCP Handshake', duration: Math.round(duration * 0.2) },
                { name: 'SSL Handshake', duration: Math.round(duration * 0.3) },
                { name: 'Request Sent', duration: Math.round(duration * 0.05) },
                { name: 'Waiting (TTFB)', duration: Math.round(duration * 0.25) },
                { name: 'Content Download', duration: Math.round(duration * 0.1) }
            ];

            const result: ResponseData = {
                status: response.status,
                statusText: response.statusText,
                data: responseData,
                headers: Object.fromEntries(response.headers.entries()),
                cookies: [], // Would need to parse Set-Cookie headers
                timing: {
                    start: startTime,
                    end: endTime,
                    phases: timingPhases
                }
            };

            setResponse(result);
            setResponseHeaders(responseHeaders);
            setCookies([]); // In a real app, parse cookies from response
            setTimeline(timingPhases);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
            setResponse(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddParam = () => {
        setParams([...params, { enabled: false, key: '', value: '' }]);
    };

    const handleUpdateParam = (index: number, field: keyof Param, value: string | boolean) => {
        const newParams = [...params];
        if (field === 'enabled') {
            newParams[index][field] = value as boolean;
        } else {
            newParams[index][field] = value as string;
        }
        setParams(newParams);
    };

    const handleRemoveParam = (index: number) => {
        const newParams = [...params];
        newParams.splice(index, 1);
        setParams(newParams);
    };

    const handleAddHeader = () => {
        setHeaders([...headers, { enabled: false, key: '', value: '' }]);
    };

    const handleUpdateHeader = (index: number, field: keyof Header, value: string | boolean) => {
        const newHeaders = [...headers];
        if (field === 'enabled') {
            newHeaders[index][field] = value as boolean;
        } else {
            newHeaders[index][field] = value as string;
        }
        setHeaders(newHeaders);
    };

    const handleRemoveHeader = (index: number) => {
        const newHeaders = [...headers];
        newHeaders.splice(index, 1);
        setHeaders(newHeaders);
    };

    const handleCopyResponse = () => {
        if (response) {
            copyToClipboard(JSON.stringify(response.data, null, 2));
        }
    };

    const handleDownloadResponse = () => {
        if (response) {
            const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
            saveAs(blob, 'response.json');
        }
    };

    const handleShareRequest = () => {
        const requestData = {
            method,
            url,
            params: params.filter(p => p.enabled && p.key),
            headers: headers.filter(h => h.enabled && h.key),
            body: body,
            auth,
            preRequestScript,
            tests
        };

        copyToClipboard(JSON.stringify(requestData, null, 2));
        alert('Request configuration copied to clipboard!');
    };

    const handleAddRequest = (collectionId: string, folderId?: string) => {
        const newRequest: Request = {
            id: `${folderId || collectionId}-${Date.now()}`, // folderId/collectionId-timestamp
            method: 'GET',
            name: `New Request ${Date.now().toString().slice(-4)}`, // Add some uniqueness
            description: '',
            url: ''
        };

        setCollections(prev => prev.map(collection => {
            if (collection.id === collectionId) {
                if (folderId) {
                    // Add to folder
                    return {
                        ...collection,
                        folders: collection.folders.map(folder => {
                            if (folder.id === folderId) {
                                return {
                                    ...folder,
                                    requests: [...folder.requests, newRequest]
                                };
                            }
                            return folder;
                        })
                    };
                } else {
                    // Add directly to collection
                    return {
                        ...collection,
                        requests: [...collection.requests, newRequest]
                    };
                }
            }
            return collection;
        }));

        // Open the new request in a tab
        openRequestInTab(newRequest);
    };

    const handleAddFolder = (collectionId: string) => {
        setCollections(prev => prev.map(collection => {
            if (collection.id === collectionId) {
                const newFolder: Folder = {
                    id: `${collectionId}-${Date.now()}`, // collectionId-timestamp
                    name: `New Folder ${collection.folders.length + 1}`,
                    requests: []
                };
                return {
                    ...collection,
                    folders: [...collection.folders, newFolder]
                };
            }
            return collection;
        }));
    };

    const renameItem = (id: string, newName: string) => {
        setCollections(prev => prev.map(collection => {
            if (collection.id === id) {
                return { ...collection, name: newName };
            }
            return {
                ...collection,
                folders: collection.folders.map(folder =>
                    folder.id === id ? { ...folder, name: newName } : folder
                ),
                requests: collection.requests.map(request =>
                    request.id === id ? { ...request, name: newName } : request
                )
            };
        }));
    };

    const deleteItem = (id: string) => {
        setCollections(prev =>
            prev
                // Remove collection if it matches ID
                .filter(collection => collection.id !== id)
                // Otherwise filter out folders/requests with matching ID
                .map(collection => ({
                    ...collection,
                    folders: collection.folders.filter(folder => folder.id !== id),
                    requests: collection.requests.filter(request => request.id !== id)
                }))
        );

        // Close tab if the deleted item was open
        closeTab(id);
    };

    const openRequestInTab = (request: Request) => {
        setActiveTabs(prev => {
            // Switch to existing tab if already open
            const existingTab = prev.find(tab => tab.id === request.id);
            if (existingTab) {
                setActiveTabId(request.id);
                return prev;
            }

            // Otherwise add new tab
            const newTabs = [...prev, { id: request.id, request }];
            setActiveTabId(request.id);
            return newTabs;
        });
    };

    const closeTab = (id: string) => {
        // Check if there are unsaved changes
        const hasUnsavedChanges = false; // Implement your own logic here

        if (hasUnsavedChanges) {
            const confirmClose = window.confirm('You have unsaved changes. Are you sure you want to close this tab?');
            if (!confirmClose) return;
        }

        setActiveTabs(prev => {
            const newTabs = prev.filter(tab => tab.id !== id);

            // If we're closing the active tab, activate another one
            if (id === activeTabId) {
                setActiveTabId(newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null);
            }

            return newTabs;
        });
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
            {/* Top Header */}
            <header className="w-full h-16 bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between h-full px-6">
                    {/* Left side - Logo */}
                    <div className="flex items-center space-x-8">
                        <div className="w-50 items-center justify-center">
                            <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">API Nexus</h1>
                        </div>

                        {/* Environment dropdown moved here */}
                        <div className="relative">
                            <select className="h-10 pl-3 pr-10 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer">
                                <option>Default Environment</option>
                                <option>Development</option>
                                <option>Staging</option>
                                <option>Production</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Right side - Actions and user dropdown */}
                    <div className="flex items-center space-x-4">
                        <UserDropdown initials={initials} displayName={displayName} email={email} username={username} />
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <div className="flex flex-1 overflow-hidden">
                {/* Collections Tree Sidebar */}
                <CollectionsTree
                    collections={collections} // Make sure this is your state variable
                    onAddRequest={handleAddRequest}
                    onAddFolder={handleAddFolder}
                    onRenameItem={renameItem}
                    onDeleteItem={deleteItem}
                    onDuplicateRequest={(request) => {
                        const [collectionId, folderId] = request.id.split('-');
                        handleAddRequest(collectionId, folderId === 'root' ? undefined : folderId);
                    }}
                    onSelectRequest={openRequestInTab}
                    onAddCollection={handleAddCollection}
                    onExportCollections={handleExportCollections}
                    onImportCollections={handleImportCollections}
                />

                {/* Main Content */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Tabs Bar */}
                    <div className="flex items-center bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
                        {activeTabs.map(tab => (
                            <div
                                key={tab.id}
                                className={`flex items-center px-4 py-2 border-r border-gray-200 dark:border-gray-700 cursor-pointer ${activeTabId === tab.id ? 'bg-blue-50 dark:bg-gray-700' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                                onClick={() => setActiveTabId(tab.id)}
                            >
                                <span className="mr-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {tab.request.name}
                                </span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        closeTab(tab.id);
                                    }}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Request Builder Content */}
                    <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
                        {activeTabId ? (
                            <>
                                <RequestURLBar
                                    handleShareRequest={handleShareRequest}
                                    handleSendRequest={handleSendRequest}
                                    isLoading={isLoading}
                                    isStarred={isStarred ?? false}
                                    method={method}
                                    setIsStarred={setIsStarred}
                                    setMethod={setMethod}
                                    setUrl={setUrl}
                                    url={url}
                                />

                                <div className="flex flex-col md:flex-row h-[calc(100%-4rem)]">
                                    {/* Request Configuration */}
                                    <div className="w-full md:w-1/2 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
                                        <div className="bg-white dark:bg-gray-800">
                                            <RequestsNavBar
                                                activeRequestTab={activeRequestTab}
                                                setActiveRequestTab={setActiveRequestTab}
                                            />

                                            <RequestTabContent
                                                activeRequestTab={activeRequestTab}
                                                auth={auth}
                                                body={body}
                                                handleAddHeader={handleAddHeader}
                                                handleAddParam={handleAddParam}
                                                handleRemoveHeader={handleRemoveHeader}
                                                handleRemoveParam={handleRemoveParam}
                                                handleUpdateHeader={handleUpdateHeader}
                                                handleUpdateParam={handleUpdateParam}
                                                headers={headers}
                                                params={params}
                                                preRequestScript={preRequestScript}
                                                setActiveRequestTab={setActiveRequestTab}
                                                setAuth={setAuth}
                                                setBody={setBody}
                                                setPreRequestScript={setPreRequestScript}
                                                setTests={setTests}
                                                tests={tests}
                                            />
                                        </div>
                                    </div>

                                    {/* Response Viewer */}
                                    <div className="w-full md:w-1/2 overflow-y-auto">
                                        <div className="bg-white dark:bg-gray-800 h-full">
                                            <ResponseTab
                                                activeResponseTab={activeResponseTab}
                                                setActiveResponseTab={setActiveResponseTab}
                                            />

                                            <ReturnedResponseTab
                                                activeResponseTab={activeResponseTab}
                                                cookies={cookies}
                                                copyToClipboard={copyToClipboard}
                                                error={error}
                                                handleCopyResponse={handleCopyResponse}
                                                handleDownloadResponse={handleDownloadResponse}
                                                isLoading={isLoading}
                                                response={response}
                                                responseHeaders={responseHeaders}
                                                timeline={timeline}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center p-6 max-w-md">
                                    <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                    </svg>
                                    <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">No Request Selected</h3>
                                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                        Select a request from the sidebar or create a new one to get started.
                                    </p>
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}