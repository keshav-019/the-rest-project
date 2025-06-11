// Updated RequestBuilder component with tab system
'use client'
import React, { useState, useEffect, useCallback } from "react";
import { useClipboard } from "@/hooks/useClipboard";
import { saveAs } from 'file-saver';
import { Auth, Collection, Folder, Header, Param, RequestType, ResponseData, TabType } from "@/types/Collections";
import { Request } from "@/types/Collections";
import { getCurrentUser, getInitials, getUserDetails } from "@/lib/firebase/auth";
import { useRouter } from "next/navigation";
import MainContent from "@/components/RequestBuilder/MainContent";
import { savePersonalCollections } from "@/lib/firebase/collections";
import HeaderComponent from "@/components/Common/Header";
import { Environment, Team } from "@/types/User";
import { getUserTeams } from "@/lib/firebase/teams";

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable  @typescript-eslint/no-unused-expressions */

export default function RequestBuilder() {
    const [activeRequestTab, setActiveRequestTab] = useState<TabType>('Params');
    const [activeResponseTab, setActiveResponseTab] = useState<'Response' | 'Headers' | 'Cookies' | 'Timeline'>('Response');
    const [method, setMethod] = useState<RequestType>(RequestType.GET);
    const [url, setUrl] = useState<string>();
    const [activeTabs, setActiveTabs] = useState<{ id: string; request: Request }[]>([]);
    const [isStarred, setIsStarred] = useState(false);
    const [collections, setCollections] = useState<Collection[]>();
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
    const [user, setUser] = useState(getCurrentUser());
    const [initials, setInitials] = useState<string>(getInitials(user?.displayName));
    const [username, setUsername] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [displayName, setDisplayName] = useState<string>('');
    const [userId, setUserId] = useState<string>('');
    const [environments, setEnvironments] = useState<Environment[]>();
    const [teams, setTeams] = useState<Team[]>();
    const [autoSave, setAutoSave] = useState<boolean>(true);
    const router = useRouter();

    // Load active tab request when activeTabId changes
    useEffect(() => {
        if (activeTabId) {
            const activeTab = activeTabs.find(tab => tab.id === activeTabId);
            if (activeTab) {
                const { request } = activeTab;
                setMethod(request.method as RequestType);
                setUrl(request.url);
                setParams(request.params || [{ enabled: false, key: '', value: '' }]);
                setHeaders(request.headers || [
                    { enabled: true, key: 'Content-Type', value: 'application/json' },
                    { enabled: true, key: 'Accept', value: 'application/json' },
                    { enabled: false, key: '', value: '' }
                ]);
                setBody(request.body || '{\n  "key": "value"\n}');
                setAuth(request.auth || { type: 'none', credentials: {} });
                setPreRequestScript(request.preRequestScript || '// Add your pre-request script here');
                setTests(request.tests || '// Add your tests here');
            }
        }

        const getActiveTeams = async () => {
            const teams = await getUserTeams(user?.uid || '');
            setTeams(teams);
        }

        getActiveTeams();

        setUser(getCurrentUser());

        const populateCollections = async () => {
            const userDetails = await getUserDetails();
            setCollections(userDetails.userData?.personalCollections);
            setEnvironments(userDetails.userData?.personalEnvironments);
            setAutoSave(userDetails.userData?.autoSave || true);
        }

        populateCollections();
        
        if (user === null) {
            router.push('/login')
        }
        setUserId(user?.uid || '');
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
            reader.onload = async (event) => {
                try {
                    const importedData = JSON.parse(event.target?.result as string);

                    // Validate the imported data structure
                    if (Array.isArray(importedData) && importedData.every(isValidCollection)) {
                        // Replace current collections with imported ones
                        setCollections(importedData);
                        collections !== undefined ? await savePersonalCollections(userId, collections) : null;
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

    const handleAddCollection = async (name: string) => {
        if (!collections) {
            console.error('Collections is undefined');
            return;
        }
        
        const newCollection: Collection = {
            id: `${Date.now()}`,
            name,
            description: '',
            variables: [],
            folders: [],
            requests: []
        };
        const updatedCollections = [...collections, newCollection]

        setCollections(updatedCollections);
        savePersonalCollections(userId, updatedCollections);
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
                requestUrl += ((requestUrl || '').includes('?') ? '&' : '?') + queryString;
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
                    requestUrl += ((requestUrl || '').includes('?') ? '&' : '?') +
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
            const response = await fetch((requestUrl || ''), {
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

    // Save current request data to collections
    const saveCurrentRequest = useCallback(async () => {
        if (!activeTabId || !collections) return;
    
        // First find the current tab to get the name and description
        const currentTab = activeTabs.find(tab => tab.id === activeTabId);
        if (!currentTab) return;
    
        // Create the updated request object outside the map
        const updatedRequest = {
            id: activeTabId,
            method,
            url: url || '',
            name: currentTab.request.name || 'New Request',
            description: currentTab.request.description || '',
            params,
            headers,
            body,
            auth,
            preRequestScript,
            tests
        };
    
        const updatedCollections = collections.map(collection => {
            // Update request in collections
            const updatedRequests = collection.requests.map(req => 
                req.id === activeTabId ? updatedRequest : req
            );
    
            // Update requests in folders
            const updatedFolders = collection.folders.map(folder => ({
                ...folder,
                requests: folder.requests.map(req => 
                    req.id === activeTabId ? updatedRequest : req
                )
            }));
    
            return {
                ...collection,
                requests: updatedRequests,
                folders: updatedFolders
            };
        });
    
        setCollections(updatedCollections);
        await savePersonalCollections(userId, updatedCollections);
    
        // Update active tabs to mark as saved
        setActiveTabs(prev => prev.map(tab => 
            tab.id === activeTabId ? { ...tab, request: updatedRequest, unsavedChanges: false } : tab
        ));
    }, [activeTabId, collections, method, url, params, headers, body, auth, preRequestScript, tests, userId, activeTabs]);

    // Auto-save when changes occur
    useEffect(() => {
        if (!autoSave || !activeTabId) return;

        const timer = setTimeout(() => {
            saveCurrentRequest();
        }, 1000); // Debounce for 1 second

        return () => clearTimeout(timer);
    }, [method, url, params, headers, body, auth, preRequestScript, tests, autoSave, activeTabId, saveCurrentRequest]);

    // Mark tab as having unsaved changes when fields change
    const markUnsavedChanges = useCallback(() => {
        if (!autoSave && activeTabId) {
            setActiveTabs(prev => prev.map(tab => 
                tab.id === activeTabId ? { ...tab, unsavedChanges: true } : tab
            ));
        }
    }, [autoSave, activeTabId]);

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
            url: '',
            auth: {type: 'none', credentials: {}},
            body: '',
            headers: [{enabled: false, key: '', value: ''}],
            params: [{enabled: false, key: '', value: ''}],
            preRequestScript: '',
            tests: ''
        };

        if(collections === undefined) throw new Error('Collections is undefined');

        setCollections(prev => {
            if (!prev) {
                console.error('Previous collections state is undefined');
                return [];
            }
            
            return prev.map(collection => {
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
            });
        });

        // Open the new request in a tab
        openRequestInTab(newRequest);
    };

    const handleAddFolder = (collectionId: string) => {
        setCollections(prev => {
            if (!prev) {
                console.error('Previous collections state is undefined');
                return [];
            }
            
            prev.map(collection => {
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
            }
        )});
    };

    const renameItem = (id: string, newName: string) => {
        setCollections(prev => {
            if (!prev) {
                console.error('Previous collections state is undefined');
                return [];
            }
            prev.map(collection => {
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
            }
        )});
    };

    const deleteItem = (id: string) => {
        setCollections(prev =>{
            if (!prev) {
                console.error('Previous collections state is undefined');
                return [];
            }
            prev
                // Remove collection if it matches ID
                .filter(collection => collection.id !== id)
                // Otherwise filter out folders/requests with matching ID
                .map(collection => ({
                    ...collection,
                    folders: collection.folders.filter(folder => folder.id !== id),
                    requests: collection.requests.filter(request => request.id !== id)
                }))
        });

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

    // Update method and mark as unsaved if needed
    const updateMethod = (newMethod: RequestType) => {
        setMethod(newMethod);
        markUnsavedChanges();
    };

    // Update URL and mark as unsaved if needed
    const updateUrl = (newUrl: string) => {
        setUrl(newUrl);
        markUnsavedChanges();
    };

    // Update body and mark as unsaved if needed
    const updateBody = (newBody: string) => {
        setBody(newBody);
        markUnsavedChanges();
    };

    // Update auth and mark as unsaved if needed
    const updateAuth = (newAuth: Auth) => {
        setAuth(newAuth);
        markUnsavedChanges();
    };

    // Update pre-request script and mark as unsaved if needed
    const updatePreRequestScript = (newScript: string) => {
        setPreRequestScript(newScript);
        markUnsavedChanges();
    };

    // Update tests and mark as unsaved if needed
    const updateTests = (newTests: string) => {
        setTests(newTests);
        markUnsavedChanges();
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
            {/* Top Header */}
            <HeaderComponent toSearch={false} parentComponent={'Request Builder'} onAddCollection={handleAddCollection} environments={environments} initials={initials} username={username} email={email} displayName={displayName} teams={teams} autoSave={autoSave} setAutoSave={setAutoSave} />

            {/* Main Content Area */}
            {collections !== undefined ? 
                <MainContent 
                    activeRequestTab={activeRequestTab} 
                    activeResponseTab={activeResponseTab}
                    activeTabId={activeTabId} 
                    activeTabs={activeTabs} 
                    auth={auth} 
                    body={body} 
                    closeTab={closeTab} 
                    collections={collections} 
                    cookies={cookies} 
                    copyToClipboard={copyToClipboard} 
                    deleteItem={deleteItem} 
                    error={error} 
                    handleAddCollection={handleAddCollection} 
                    handleAddFolder={handleAddFolder} 
                    handleAddHeader={handleAddHeader} 
                    handleAddParam={handleAddParam} 
                    handleAddRequest={handleAddRequest} 
                    handleCopyResponse={handleCopyResponse} 
                    handleDownloadResponse={handleDownloadResponse} 
                    handleExportCollections={handleExportCollections} 
                    handleImportCollections={handleImportCollections} 
                    handleRemoveHeader={handleRemoveHeader} 
                    handleRemoveParam={handleRemoveParam} 
                    handleSendRequest={handleSendRequest} 
                    handleShareRequest={handleShareRequest} 
                    handleUpdateHeader={handleUpdateHeader} 
                    handleUpdateParam={handleUpdateParam} 
                    headers={headers} 
                    isLoading={isLoading} 
                    isStarred={isStarred} 
                    method={method} 
                    openRequestInTab={openRequestInTab} 
                    params={params} 
                    preRequestScript={preRequestScript} 
                    renameItem={renameItem} 
                    response={response} 
                    responseHeaders={responseHeaders} 
                    setActiveRequestTab={setActiveRequestTab} 
                    setActiveResponseTab={setActiveResponseTab} 
                    setActiveTabId={setActiveTabId} 
                    setAuth={setAuth} 
                    setBody={setBody} 
                    setIsStarred={setIsStarred} 
                    setMethod={setMethod} 
                    setPreRequestScript={setPreRequestScript} 
                    setTests={setTests} 
                    setUrl={setUrl} 
                    tests={tests} 
                    timeline={timeline} 
                    url={url || ''} 
                /> : <></>}
        </div>
    );
}