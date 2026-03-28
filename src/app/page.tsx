// Updated RequestBuilder component with tab system
'use client'
import React, { useState, useEffect } from "react";
import { useClipboard } from "@/hooks/useClipboard";
import { saveAs } from 'file-saver';
import { Auth, Collection, Folder, Header, Param, RequestType, ResponseData, TabType } from "@/types/Collections";
import { Request } from "@/types/Collections";
import { getCurrentUser, getInitials, getUserDetails } from "@/lib/firebase/auth";
import { useRouter } from "next/navigation";
import MainContent from "@/components/RequestBuilder/MainContent";
import { savePersonalCollections } from "@/lib/firebase/collections";
import { Environment, Team, User } from "@/types/User";
import { getTeamById, getUserTeams, updateTeamCollections } from "@/lib/firebase/teams";
import TeamModeWelcome from "@/components/RequestBuilder/TeamModeWelcome";
import HeaderComponent from "@/components/Common/Header";

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable  @typescript-eslint/no-unused-expressions */

export default function RequestBuilder() {
    const [activeRequestTab, setActiveRequestTab] = useState<TabType>('Params');
    const [teamMode, setTeamMode] = useState<Team | null>(null);
    const [activeResponseTab, setActiveResponseTab] = useState<'Response' | 'Headers' | 'Cookies' | 'Timeline'>('Response');
    const [method, setMethod] = useState<RequestType>(RequestType.GET);
    const [url, setUrl] = useState<string>('');
    const [activeTabs, setActiveTabs] = useState<{ id: string; request: Request }[]>([]);
    const [isStarred, setIsStarred] = useState(false);
    const [localCollections, setLocalCollections] = useState<Collection[]>([]);
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
    const [user, setUser] = useState<User | null>(null);
    const [initials, setInitials] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [photoURL, setPhotoURL] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [displayName, setDisplayName] = useState<string>('');
    const [userId, setUserId] = useState<string>('');
    const [environments, setEnvironments] = useState<Environment[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [autoSave, setAutoSave] = useState<boolean>(true);
    const [showTeamsDropdown, setShowTeamsDropdown] = useState(false);
    const [activeEnvironmentId, setActiveEnvironmentId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const router = useRouter();

    // Initialize user and team mode from localStorage
    useEffect(() => {
        const currentUser = getCurrentUser();
        setUser(currentUser);
        if (!currentUser) router.push('/login');
        setInitials(currentUser?.name || '');

        const savedTeamMode = localStorage.getItem('teamMode');
        const savedEnvironmentId = localStorage.getItem('activeEnvironmentId');

        if (savedTeamMode) {
            try {
                const parsedTeam = JSON.parse(savedTeamMode);
                if (parsedTeam && parsedTeam.teamId) {
                    setTeamMode(parsedTeam);
                }
            } catch (e) {
                console.error('Failed to parse teamMode from localStorage', e);
            }
        }

        if (savedEnvironmentId) {
            setActiveEnvironmentId(savedEnvironmentId);
        }
    }, [router]);

    // Load teams and collections
    useEffect(() => {
        const loadData = async () => {
            if (!user?.uid) return;

            try {
                const [teams, userDetails] = await Promise.all([
                    getUserTeams(user.uid),
                    getUserDetails()
                ]);

                setTeams(teams);
                setUserId(user.uid);
                setInitials(getInitials(user.displayName));
                setUsername(user.username || '');
                setPhotoURL(user.photoURL)
                setEmail(user.email || '');
                setDisplayName(user.displayName || '');
                setAutoSave(userDetails.userData?.autoSave || true);

                if (teamMode) {
                    const teamData = await getTeamById(teamMode.teamId);
                    setLocalCollections(teamData.collections || []);
                    setEnvironments(teamData.environments || []);
                } else {
                    setLocalCollections(userDetails.userData?.personalCollections || []);
                    setEnvironments(userDetails.userData?.personalEnvironments || []);
                }
            } catch (error) {
                console.error('Failed to load data:', error);
            }
        };

        loadData();
    }, [user?.uid, teamMode?.teamId, user?.displayName, user?.username, user?.email, teamMode]);

    const handleImportCollections = async (file: File) => {
        try {
            const importedData = JSON.parse(await file.text());
            
            if (!Array.isArray(importedData)) {
                throw new Error('Invalid format: Expected array');
            }

            setLocalCollections(importedData);
            
            if (userId) {
                setIsSaving(true);
                await (teamMode 
                    ? updateTeamCollections(teamMode.teamId, importedData)
                    : savePersonalCollections(userId, importedData)
                );
            }
        } catch (error) {
            console.error('Import error:', error);
            alert('Error importing collections: Invalid file format');
        } finally {
            setIsSaving(false);
        }
    };

    const handleExportCollections = () => {
        const dataStr = JSON.stringify(localCollections, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        saveAs(blob, 'collections-export.json');
    };

    const handleAddCollection = async (name: string) => {
        if (!name.trim()) return;

        const newCollection: Collection = {
            id: `${Date.now()}`,
            name,
            description: '',
            variables: [],
            folders: [],
            requests: []
        };

        const updatedCollections = [...localCollections, newCollection];
        setLocalCollections(updatedCollections);

        try {
            setIsSaving(true);
            await (teamMode
                ? updateTeamCollections(teamMode.teamId, updatedCollections)
                : savePersonalCollections(userId, updatedCollections)
            );
        } catch (error) {
            console.error('Failed to save collection:', error);
            setLocalCollections(localCollections); // Revert on error
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddRequest = async (collectionId: string, folderId?: string) => {
        const newRequest: Request = {
            id: `${folderId || collectionId}-${Date.now()}`,
            method: 'GET',
            name: `New Request ${Date.now().toString().slice(-4)}`,
            description: '',
            url: '',
            auth: { type: 'none', credentials: {} },
            body: '',
            headers: [{ enabled: false, key: '', value: '' }],
            params: [{ enabled: false, key: '', value: '' }],
            preRequestScript: '',
            tests: ''
        };

        const updatedCollections = localCollections.map(collection => {
            if (collection.id === collectionId) {
                if (folderId) {
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
                }
                return {
                    ...collection,
                    requests: [...collection.requests, newRequest]
                };
            }
            return collection;
        });

        setLocalCollections(updatedCollections);
        openRequestInTab(newRequest);

        try {
            setIsSaving(true);
            await (teamMode
                ? updateTeamCollections(teamMode.teamId, updatedCollections)
                : savePersonalCollections(userId, updatedCollections)
            );
        } catch (error) {
            console.error('Failed to save request:', error);
            setLocalCollections(localCollections); // Revert on error
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddFolder = async (collectionId: string) => {
        const newFolder: Folder = {
            id: `${collectionId}-${Date.now()}`,
            name: `New Folder ${localCollections
                .find(c => c.id === collectionId)?.folders.length || 0 + 1}`,
            requests: []
        };

        const updatedCollections = localCollections.map(collection => 
            collection.id === collectionId
                ? { ...collection, folders: [...collection.folders, newFolder] }
                : collection
        );

        setLocalCollections(updatedCollections);

        try {
            setIsSaving(true);
            await (teamMode
                ? updateTeamCollections(teamMode.teamId, updatedCollections)
                : savePersonalCollections(userId, updatedCollections)
            );
        } catch (error) {
            console.error('Failed to save folder:', error);
            setLocalCollections(localCollections); // Revert on error
        } finally {
            setIsSaving(false);
        }
    };

    const renameItem = async (id: string, newName: string) => {
        if (!newName.trim()) return;

        const updatedCollections = localCollections.map(collection => {
            if (collection.id === id) return { ...collection, name: newName };
            return {
                ...collection,
                folders: collection.folders.map(folder =>
                    folder.id === id ? { ...folder, name: newName } : folder
                ),
                requests: collection.requests.map(request =>
                    request.id === id ? { ...request, name: newName } : request
                )
            };
        });

        setLocalCollections(updatedCollections);

        try {
            setIsSaving(true);
            await (teamMode
                ? updateTeamCollections(teamMode.teamId, updatedCollections)
                : savePersonalCollections(userId, updatedCollections)
            );
        } catch (error) {
            console.error('Failed to rename item:', error);
            setLocalCollections(localCollections); // Revert on error
        } finally {
            setIsSaving(false);
        }
    };

    const deleteItem = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;

        const updatedCollections = localCollections
            .filter(collection => collection.id !== id)
            .map(collection => ({
                ...collection,
                folders: collection.folders.filter(folder => folder.id !== id),
                requests: collection.requests.filter(request => request.id !== id)
            }));

        setLocalCollections(updatedCollections);
        closeTab(id);

        try {
            setIsSaving(true);
            await (teamMode
                ? updateTeamCollections(teamMode.teamId, updatedCollections)
                : savePersonalCollections(userId, updatedCollections)
            );
        } catch (error) {
            console.error('Failed to delete item:', error);
            setLocalCollections(localCollections); // Revert on error
        } finally {
            setIsSaving(false);
        }
    };

    const openRequestInTab = (request: Request) => {
        setActiveTabs(prev => {
            const existingTab = prev.find(tab => tab.id === request.id);
            if (existingTab) {
                setActiveTabId(request.id);
                return prev;
            }
            const newTabs = [...prev, { id: request.id, request }];
            setActiveTabId(request.id);
            return newTabs;
        });
    };

    const closeTab = (id: string) => {
        setActiveTabs(prev => {
            const newTabs = prev.filter(tab => tab.id !== id);
            setActiveTabId(newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null);
            return newTabs;
        });
    };

    const handleTeamSelect = (team: Team | null) => {
        setTeamMode(team);
        if (team) {
            localStorage.setItem('teamMode', JSON.stringify(team));
        } else {
            localStorage.removeItem('teamMode');
        }
        setShowTeamsDropdown(false);
        setActiveEnvironmentId(null);
        localStorage.removeItem('activeEnvironmentId');
    };

    const handleEnvironmentSelect = (environmentId: string) => {
        setActiveEnvironmentId(environmentId);
        localStorage.setItem('activeEnvironmentId', environmentId);
    };

    const handleSendRequest = async () => {
        console.log("The Handle Send Request function called");

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

    const handleAddParam = () => {
        console.log("The Console Add Param Function Called");
        setParams([...params, { enabled: false, key: '', value: '' }]);
    };

    const handleUpdateParam = (index: number, field: keyof Param, value: string | boolean) => {
        console.log("The Handle Update Param Function called");
        const newParams = [...params];
        if (field === 'enabled') {
            newParams[index][field] = value as boolean;
        } else {
            newParams[index][field] = value as string;
        }
        setParams(newParams);
    };

    const handleRemoveParam = (index: number) => {
        console.log("The Handle Remove Param function called");
        const newParams = [...params];
        newParams.splice(index, 1);
        setParams(newParams);
    };

    const handleAddHeader = () => {
        console.log("The handle Add Header function called");
        setHeaders([...headers, { enabled: false, key: '', value: '' }]);
    };

    const handleUpdateHeader = (index: number, field: keyof Header, value: string | boolean) => {
        console.log("The handle Update Header function called");
        const newHeaders = [...headers];
        if (field === 'enabled') {
            newHeaders[index][field] = value as boolean;
        } else {
            newHeaders[index][field] = value as string;
        }
        setHeaders(newHeaders);
    };

    const handleRemoveHeader = (index: number) => {
        console.log("The function Handle Remove Header called");
        const newHeaders = [...headers];
        newHeaders.splice(index, 1);
        setHeaders(newHeaders);
    };

    const handleCopyResponse = () => {
        console.log("The function Handle Copy Response called");
        if (response) {
            copyToClipboard(JSON.stringify(response.data, null, 2));
        }
    };

    const handleDownloadResponse = () => {
        console.log("The function Handle Download Response function called");
        if (response) {
            const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
            saveAs(blob, 'response.json');
        }
    };

    const handleShareRequest = () => {
        console.log("The function Handle Share Request called");
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

    // Add this handler for exiting team mode
    const handleExitTeamMode = () => {
        console.log("The function handle Exit Team Mode called");
        setTeamMode(null);
        localStorage.removeItem('teamMode');

        // Reset environment when exiting team mode
        setActiveEnvironmentId(null);
        localStorage.removeItem('activeEnvironmentId');

        // Refresh the page to reset all states
        window.location.reload();
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
            {/* Top Header */}
            <HeaderComponent
                toSearch={false}
                parentComponent={'Request Builder'}
                onAddCollection={handleAddCollection}
                environments={environments}
                initials={initials}
                username={username}
                email={email}
                displayName={displayName}
                teams={teams}
                autoSave={autoSave}
                setAutoSave={setAutoSave}
                teamMode={teamMode}
                onTeamSelect={handleTeamSelect}
                onExitTeamMode={handleExitTeamMode}
                showTeams={showTeamsDropdown}
                setShowTeams={setShowTeamsDropdown}
                activeEnvironmentId={activeEnvironmentId}
                onEnvironmentSelect={handleEnvironmentSelect}
                photoURL={photoURL}
            />

            {/* Main Content Area */}
            {localCollections !== undefined ?
                <MainContent
                    activeRequestTab={activeRequestTab}
                    activeResponseTab={activeResponseTab}
                    activeTabId={activeTabId}
                    activeTabs={activeTabs}
                    auth={auth}
                    body={body}
                    closeTab={closeTab}
                    collections={localCollections}
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
                    teamMode={teamMode}
                    environments={environments}
                    activeEnvironmentId={activeEnvironmentId}
                /> : <></>}

            {teamMode && <TeamModeWelcome team={teamMode} />}
        </div>
    );
}