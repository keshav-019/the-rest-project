'use client'
import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { useClipboard } from '@/hooks/useClipboard';
import { saveAs } from 'file-saver';
import {
    ActiveResponseTab,
    Auth,
    Collection,
    Header,
    Param,
    Request,
    RequestProtocol,
    RequestTestCase,
    RequestType,
    ResponseData,
    TabType,
} from '@/types/Collections';
import { getCurrentUser, getInitials, getUserDetails } from '@/lib/firebase/auth';
import { useRouter, useSearchParams } from 'next/navigation';
import MainContent from '@/components/RequestBuilder/MainContent';
import { savePersonalCollections } from '@/lib/firebase/collections';
import { Environment, Team, User } from '@/types/User';
import { getTeamById, getUserTeams, updateTeamCollections } from '@/lib/firebase/teams';
import TeamModeWelcome from '@/components/RequestBuilder/TeamModeWelcome';
import HeaderComponent from '@/components/Common/Header';
import {
    arrayUnion,
    doc,
    updateDoc,
    db,
} from '@/lib/firebase/client';
import {
    createDefaultCollection,
    createDefaultFolder,
    createDefaultRequest,
    ensureRequestDefaults,
    findRequest,
    normalizeCollections,
    parseImportedCollections,
    updateRequestInCollections,
} from '@/lib/collections-utils';
import { executeProtocolRequest } from '@/lib/request-protocols';
import { evaluateRequestTests } from '@/lib/request-tests';

/* eslint-disable @typescript-eslint/no-explicit-any */

const DEFAULT_BODY = '{\n  "key": "value"\n}';
const DEFAULT_PRE_REQUEST_SCRIPT = '// Add your pre-request script here';
const DEFAULT_TEST_SCRIPT = '// Add your tests here';

const defaultParams: Param[] = [{ enabled: false, key: '', value: '' }];
const defaultHeaders: Header[] = [
    { enabled: true, key: 'Content-Type', value: 'application/json' },
    { enabled: true, key: 'Accept', value: 'application/json' },
    { enabled: false, key: '', value: '' },
];

function RequestBuilderContent() {
    const [activeRequestTab, setActiveRequestTab] = useState<TabType>('Params');
    const [teamMode, setTeamMode] = useState<Team | null>(null);
    const [activeResponseTab, setActiveResponseTab] = useState<ActiveResponseTab>('Response');

    const [protocol, setProtocol] = useState<RequestProtocol>('http');
    const [method, setMethod] = useState<RequestType>(RequestType.GET);
    const [url, setUrl] = useState<string>('');

    const [activeTabs, setActiveTabs] = useState<{ id: string; request: Request }[]>([]);
    const [activeTabId, setActiveTabId] = useState<string | null>(null);
    const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);

    const [isStarred, setIsStarred] = useState(false);
    const [localCollections, setLocalCollections] = useState<Collection[]>([]);

    const [params, setParams] = useState<Param[]>(defaultParams);
    const [headers, setHeaders] = useState<Header[]>(defaultHeaders);
    const [body, setBody] = useState(DEFAULT_BODY);
    const [auth, setAuth] = useState<Auth>({ type: 'none', credentials: {} });
    const [preRequestScript, setPreRequestScript] = useState(DEFAULT_PRE_REQUEST_SCRIPT);
    const [tests, setTests] = useState(DEFAULT_TEST_SCRIPT);
    const [testCases, setTestCases] = useState<RequestTestCase[]>([]);

    const [response, setResponse] = useState<ResponseData | null>(null);
    const [responseHeaders, setResponseHeaders] = useState<Array<{ key: string; value: string }>>([]);
    const [cookies, setCookies] = useState<Array<{ name: string; value: string; domain: string; path: string }>>([]);
    const [timeline, setTimeline] = useState<Array<{ name: string; duration: number }>>([]);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const { copyToClipboard } = useClipboard();

    const [user, setUser] = useState<User | null>(null);
    const [initials, setInitials] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [photoURL, setPhotoURL] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [displayName, setDisplayName] = useState<string>('');
    const [environments, setEnvironments] = useState<Environment[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [autoSave, setAutoSave] = useState<boolean>(true);
    const [showTeamsDropdown, setShowTeamsDropdown] = useState(false);
    const [activeEnvironmentId, setActiveEnvironmentId] = useState<string | null>(null);

    const router = useRouter();
    const searchParams = useSearchParams();

    const requestIdFromQuery = searchParams.get('requestId');

    useEffect(() => {
        const currentUser = getCurrentUser();
        setUser(currentUser);

        if (!currentUser) {
            router.push('/login');
            return;
        }

        setInitials(currentUser.name || '');

        const savedTeamMode = localStorage.getItem('teamMode');
        const savedEnvironmentId = localStorage.getItem('activeEnvironmentId');

        if (savedTeamMode) {
            try {
                const parsedTeam = JSON.parse(savedTeamMode) as Team;
                if (parsedTeam && parsedTeam.teamId) {
                    setTeamMode(parsedTeam);
                }
            } catch (parseError) {
                console.error('Failed to parse team mode from localStorage', parseError);
            }
        }

        if (savedEnvironmentId) {
            setActiveEnvironmentId(savedEnvironmentId);
        }
    }, [router]);

    useEffect(() => {
        const loadData = async () => {
            if (!user?.uid) {
                return;
            }

            try {
                const [userTeams, userDetails] = await Promise.all([getUserTeams(user.uid), getUserDetails()]);

                setTeams(userTeams);
                setInitials(getInitials(user.displayName));
                setUsername(user.username || '');
                setPhotoURL(user.photoURL || '');
                setEmail(user.email || '');
                setDisplayName(user.displayName || '');
                setAutoSave(userDetails.userData?.autoSave || true);

                if (teamMode) {
                    const teamData = await getTeamById(teamMode.teamId);
                    setLocalCollections(normalizeCollections(teamData.collections || [], teamMode.teamId));
                    setEnvironments(teamData.environments || []);
                } else {
                    setLocalCollections(normalizeCollections(userDetails.userData?.personalCollections || []));
                    setEnvironments(userDetails.userData?.personalEnvironments || []);
                }
            } catch (loadError) {
                console.error('Failed to load request builder data:', loadError);
            }
        };

        loadData();
    }, [teamMode?.teamId, user?.uid, user?.displayName, user?.username, user?.email, teamMode]);

    useEffect(() => {
        if (!requestIdFromQuery || localCollections.length === 0) {
            return;
        }

        const requestRef = findRequest(localCollections, requestIdFromQuery);
        if (!requestRef) {
            return;
        }

        openRequestInTab(requestRef.request);
        setSelectedCollectionId(requestRef.collection.id);
    }, [requestIdFromQuery, localCollections]);

    useEffect(() => {
        setActiveTabs((previousTabs) =>
            previousTabs
                .map((tab) => {
                    const requestRef = findRequest(localCollections, tab.id);
                    if (!requestRef) {
                        return tab;
                    }

                    return {
                        ...tab,
                        request: ensureRequestDefaults(requestRef.request),
                    };
                })
                .filter((tab) => Boolean(findRequest(localCollections, tab.id)))
        );
    }, [localCollections]);

    useEffect(() => {
        if (!activeTabId) {
            return;
        }

        const activeTab = activeTabs.find((tab) => tab.id === activeTabId);
        if (!activeTab) {
            return;
        }

        const request = ensureRequestDefaults(activeTab.request);

        setProtocol(request.protocol || 'http');
        setMethod(request.method as RequestType);
        setUrl(request.url || '');
        setParams(request.params || defaultParams);
        setHeaders(request.headers || defaultHeaders);
        setBody(request.body || '');
        setAuth(request.auth || { type: 'none', credentials: {} });
        setPreRequestScript(request.preRequestScript || DEFAULT_PRE_REQUEST_SCRIPT);
        setTests(request.tests || DEFAULT_TEST_SCRIPT);
        setTestCases(request.testCases || []);
        setIsStarred(Boolean(request.isFavorite));
    }, [activeTabId, activeTabs]);

    const activeRequest = useMemo(() => {
        if (!activeTabId) {
            return null;
        }
        return activeTabs.find((tab) => tab.id === activeTabId)?.request || null;
    }, [activeTabId, activeTabs]);

    const persistCollections = async (nextCollections: Collection[]) => {
        const normalized = normalizeCollections(nextCollections, teamMode?.teamId);
        setLocalCollections(normalized);

        if (!user?.uid) {
            return;
        }

        setIsSaving(true);
        try {
            if (teamMode) {
                await updateTeamCollections(teamMode.teamId, normalized);
            } else {
                await savePersonalCollections(user.uid, normalized);
            }
        } catch (persistError) {
            console.error('Failed to persist collections:', persistError);
            throw persistError;
        } finally {
            setIsSaving(false);
        }
    };

    const persistActiveRequest = async (overrides: Partial<Request> = {}) => {
        if (!activeTabId || !activeRequest) {
            return null;
        }

        const nextRequest = ensureRequestDefaults({
            ...activeRequest,
            protocol,
            method,
            url,
            params,
            headers,
            body,
            auth,
            preRequestScript,
            tests,
            testCases,
            isFavorite: isStarred,
            updatedAt: new Date().toISOString(),
            ...overrides,
        });

        setActiveTabs((previousTabs) =>
            previousTabs.map((tab) => (tab.id === activeTabId ? { ...tab, request: nextRequest } : tab))
        );

        const nextCollections = updateRequestInCollections(localCollections, activeTabId, () => nextRequest);
        await persistCollections(nextCollections);

        return nextRequest;
    };

    const pushRecentActivity = async (activity: {
        type: 'request_sent' | 'request_created' | 'folder_created' | 'collection_created' | 'collections_updated';
        id: string;
        name: string;
        method?: string;
        url?: string;
        status?: number;
        duration?: number;
        success?: boolean;
        collectionId?: string;
        requestId?: string;
    }) => {
        if (!user?.uid) {
            return;
        }

        const payload = {
            ...activity,
            timestamp: new Date(),
            teamId: teamMode?.teamId,
        };

        try {
            if (teamMode?.teamId) {
                await updateDoc(doc(db, 'teams', teamMode.teamId), {
                    recentActivity: arrayUnion(payload),
                    updatedAt: new Date(),
                });
            } else {
                await updateDoc(doc(db, 'users', user.uid), {
                    recentActivity: arrayUnion(payload),
                });
            }
        } catch (activityError) {
            console.error('Failed to push recent activity:', activityError);
        }
    };

    const handleImportCollections = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.onchange = async (event: Event) => {
            const target = event.target as HTMLInputElement;
            const file = target.files?.[0];
            if (!file) {
                return;
            }

            try {
                const imported = parseImportedCollections(await file.text(), teamMode?.teamId);
                const merged = normalizeCollections([...localCollections, ...imported], teamMode?.teamId);
                await persistCollections(merged);
                alert(`Imported ${imported.length} collection(s) successfully.`);
            } catch (importError) {
                console.error('Collection import failed:', importError);
                alert(importError instanceof Error ? importError.message : 'Failed to import collections');
            }
        };

        input.click();
    };

    const handleExportCollections = () => {
        const dataStr = JSON.stringify(localCollections, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        saveAs(blob, 'collections-export.json');
    };

    const handleAddCollection = async (name: string) => {
        if (!name.trim()) {
            return;
        }

        const nextCollection = createDefaultCollection(name.trim(), teamMode?.teamId);
        const nextCollections = [...localCollections, nextCollection];
        await persistCollections(nextCollections);
        setSelectedCollectionId(nextCollection.id);

        await pushRecentActivity({
            type: 'collection_created',
            id: nextCollection.id,
            name: nextCollection.name,
            collectionId: nextCollection.id,
        });
    };

    const handleAddRequest = async (collectionId: string, folderId?: string) => {
        const request = createDefaultRequest(folderId || collectionId, 'http');

        const nextCollections = localCollections.map((collection) => {
            if (collection.id !== collectionId) {
                return collection;
            }

            if (!folderId) {
                return {
                    ...collection,
                    requests: [...collection.requests, request],
                    updatedAt: new Date().toISOString(),
                };
            }

            return {
                ...collection,
                folders: collection.folders.map((folder) =>
                    folder.id === folderId
                        ? {
                              ...folder,
                              requests: [...folder.requests, request],
                          }
                        : folder
                ),
                updatedAt: new Date().toISOString(),
            };
        });

        await persistCollections(nextCollections);
        openRequestInTab(request);

        await pushRecentActivity({
            type: 'request_created',
            id: request.id,
            name: request.name,
            method: request.method,
            url: request.url,
            collectionId,
            requestId: request.id,
        });
    };

    const handleAddFolder = async (collectionId: string) => {
        const collection = localCollections.find((entry) => entry.id === collectionId);
        const folder = createDefaultFolder(collectionId, (collection?.folders.length || 0) + 1);

        const nextCollections = localCollections.map((entry) =>
            entry.id === collectionId
                ? {
                      ...entry,
                      folders: [...entry.folders, folder],
                      updatedAt: new Date().toISOString(),
                  }
                : entry
        );

        await persistCollections(nextCollections);

        await pushRecentActivity({
            type: 'folder_created',
            id: folder.id,
            name: folder.name,
            collectionId,
        });
    };

    const renameItem = async (id: string, newName: string) => {
        if (!newName.trim()) {
            return;
        }

        const nextCollections = localCollections.map((collection) => {
            if (collection.id === id) {
                return {
                    ...collection,
                    name: newName,
                    updatedAt: new Date().toISOString(),
                };
            }

            return {
                ...collection,
                folders: collection.folders.map((folder) =>
                    folder.id === id
                        ? { ...folder, name: newName }
                        : {
                              ...folder,
                              requests: folder.requests.map((request) =>
                                  request.id === id
                                      ? {
                                            ...request,
                                            name: newName,
                                            updatedAt: new Date().toISOString(),
                                        }
                                      : request
                              ),
                          }
                ),
                requests: collection.requests.map((request) =>
                    request.id === id ? { ...request, name: newName, updatedAt: new Date().toISOString() } : request
                ),
            };
        });

        await persistCollections(nextCollections);
    };

    const deleteItem = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this item?')) {
            return;
        }

        const nextCollections = localCollections
            .filter((collection) => collection.id !== id)
            .map((collection) => ({
                ...collection,
                folders: collection.folders
                    .filter((folder) => folder.id !== id)
                    .map((folder) => ({
                        ...folder,
                        requests: folder.requests.filter((request) => request.id !== id),
                    })),
                requests: collection.requests.filter((request) => request.id !== id),
            }));

        setActiveTabs((previousTabs) => previousTabs.filter((tab) => tab.id !== id));
        if (activeTabId === id) {
            setActiveTabId(null);
        }

        await persistCollections(nextCollections);
    };

    const handleDuplicateRequest = async (request: Request) => {
        const requestReference = findRequest(localCollections, request.id);
        if (!requestReference) {
            return;
        }

        const duplicatedRequest = ensureRequestDefaults({
            ...request,
            id: `${requestReference.folder?.id || requestReference.collection.id}-${Date.now()}`,
            name: `${request.name} Copy`,
            updatedAt: new Date().toISOString(),
        });

        const nextCollections = localCollections.map((collection) => {
            if (collection.id !== requestReference.collection.id) {
                return collection;
            }

            if (requestReference.folder) {
                return {
                    ...collection,
                    folders: collection.folders.map((folder) =>
                        folder.id === requestReference.folder?.id
                            ? {
                                  ...folder,
                                  requests: [...folder.requests, duplicatedRequest],
                              }
                            : folder
                    ),
                    updatedAt: new Date().toISOString(),
                };
            }

            return {
                ...collection,
                requests: [...collection.requests, duplicatedRequest],
                updatedAt: new Date().toISOString(),
            };
        });

        await persistCollections(nextCollections);
        openRequestInTab(duplicatedRequest);
    };

    const openRequestInTab = (request: Request) => {
        const normalizedRequest = ensureRequestDefaults(request);
        setActiveTabs((previousTabs) => {
            const existing = previousTabs.find((tab) => tab.id === normalizedRequest.id);
            if (existing) {
                return previousTabs;
            }
            return [...previousTabs, { id: normalizedRequest.id, request: normalizedRequest }];
        });

        setActiveTabId(normalizedRequest.id);

        const requestReference = findRequest(localCollections, normalizedRequest.id);
        if (requestReference) {
            setSelectedCollectionId(requestReference.collection.id);
        }
    };

    const closeTab = (id: string) => {
        setActiveTabs((previousTabs) => {
            const nextTabs = previousTabs.filter((tab) => tab.id !== id);
            if (activeTabId === id) {
                setActiveTabId(nextTabs.length > 0 ? nextTabs[nextTabs.length - 1].id : null);
            }
            return nextTabs;
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
        setIsLoading(true);
        setError(null);

        try {
            const execution = await executeProtocolRequest({
                protocol,
                method,
                url,
                params,
                headers: headers
                    .filter((header) => header.enabled && header.key)
                    .reduce<Record<string, string>>((accumulator, header) => {
                        accumulator[header.key] = header.value;
                        return accumulator;
                    }, {}),
                body,
                auth,
            });

            setResponse(execution.result);
            setResponseHeaders(execution.responseHeaders);
            setCookies([]);
            setTimeline(execution.timeline);

            const evaluation =
                testCases.length > 0
                    ? evaluateRequestTests(testCases, execution.result, execution.responseHeaders)
                    : null;

            if (evaluation) {
                setTestCases(evaluation.updatedTestCases);
            }

            if (activeRequest) {
                const duration = execution.result.timing.end - execution.result.timing.start;
                const previousUsage = activeRequest.usageCount || 0;
                const nextUsage = previousUsage + 1;
                const success = execution.result.status >= 200 && execution.result.status < 400;
                const previousAverage = activeRequest.avgResponseTime || 0;

                const nextAverage =
                    previousUsage === 0
                        ? duration
                        : Math.round((previousAverage * previousUsage + duration) / nextUsage);

                const updatedTestCases =
                    evaluation?.updatedTestCases || testCases;

                await persistActiveRequest({
                    protocol,
                    method,
                    url,
                    params,
                    headers,
                    body,
                    auth,
                    preRequestScript,
                    tests,
                    testCases: updatedTestCases,
                    isFavorite: isStarred,
                    usageCount: nextUsage,
                    successCount: (activeRequest.successCount || 0) + (success ? 1 : 0),
                    failureCount: (activeRequest.failureCount || 0) + (success ? 0 : 1),
                    avgResponseTime: nextAverage,
                    lastResponseTime: duration,
                    lastStatus: execution.result.status,
                    lastUsedAt: new Date().toISOString(),
                });

                const requestReference = findRequest(localCollections, activeRequest.id);
                await pushRecentActivity({
                    type: 'request_sent',
                    id: activeRequest.id,
                    name: activeRequest.name,
                    method,
                    url,
                    status: execution.result.status,
                    duration,
                    success,
                    collectionId: requestReference?.collection.id,
                    requestId: activeRequest.id,
                });
            }
        } catch (requestError) {
            const message = requestError instanceof Error ? requestError.message : 'An unknown error occurred';
            setError(message);
            setResponse(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddParam = () => {
        setParams((previousParams) => [...previousParams, { enabled: false, key: '', value: '' }]);
    };

    const handleUpdateParam = (index: number, field: keyof Param, value: string | boolean) => {
        setParams((previousParams) => {
            const nextParams = [...previousParams];
            nextParams[index] = {
                ...nextParams[index],
                [field]: value,
            };
            return nextParams;
        });
    };

    const handleRemoveParam = (index: number) => {
        setParams((previousParams) => previousParams.filter((_, paramIndex) => paramIndex !== index));
    };

    const handleAddHeader = () => {
        setHeaders((previousHeaders) => [...previousHeaders, { enabled: false, key: '', value: '' }]);
    };

    const handleUpdateHeader = (index: number, field: keyof Header, value: string | boolean) => {
        setHeaders((previousHeaders) => {
            const nextHeaders = [...previousHeaders];
            nextHeaders[index] = {
                ...nextHeaders[index],
                [field]: value,
            };
            return nextHeaders;
        });
    };

    const handleRemoveHeader = (index: number) => {
        setHeaders((previousHeaders) => previousHeaders.filter((_, headerIndex) => headerIndex !== index));
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

    const handleShareRequest = async () => {
        const requestData = {
            protocol,
            method,
            url,
            params: params.filter((param) => param.enabled && param.key),
            headers: headers.filter((header) => header.enabled && header.key),
            body,
            auth,
            preRequestScript,
            tests,
            testCases,
        };

        await persistActiveRequest({
            protocol,
            method,
            url,
            params,
            headers,
            body,
            auth,
            preRequestScript,
            tests,
            testCases,
            isFavorite: isStarred,
        });

        copyToClipboard(JSON.stringify(requestData, null, 2));
        alert('Request configuration copied to clipboard!');
    };

    const handleStarToggle = async (value: boolean) => {
        setIsStarred(value);

        if (activeRequest) {
            await persistActiveRequest({
                isFavorite: value,
            });
        }
    };

    const handleExitTeamMode = () => {
        setTeamMode(null);
        localStorage.removeItem('teamMode');
        setActiveEnvironmentId(null);
        localStorage.removeItem('activeEnvironmentId');
        window.location.reload();
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
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
                handleDuplicateRequest={handleDuplicateRequest}
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
                isLoading={isLoading || isSaving}
                isStarred={isStarred}
                protocol={protocol}
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
                setIsStarred={handleStarToggle}
                setProtocol={setProtocol}
                setMethod={setMethod}
                setPreRequestScript={setPreRequestScript}
                setTests={setTests}
                setTestCases={setTestCases}
                setUrl={setUrl}
                tests={tests}
                testCases={testCases}
                timeline={timeline}
                url={url || ''}
                teamMode={teamMode}
                environments={environments}
                activeEnvironmentId={activeEnvironmentId}
                onSelectCollection={(collection) => setSelectedCollectionId(collection.id)}
                selectedCollectionId={selectedCollectionId}
            />

            {teamMode && <TeamModeWelcome team={teamMode} />}
        </div>
    );
}

function RequestBuilderFallback() {
    return <div className="h-screen bg-gray-50 dark:bg-gray-900" />;
}

export default function RequestBuilder() {
    return (
        <Suspense fallback={<RequestBuilderFallback />}>
            <RequestBuilderContent />
        </Suspense>
    );
}
