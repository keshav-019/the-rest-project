'use client'
import React, { Suspense, useEffect, useMemo, useState } from 'react';
import CollectionsTree from '@/components/RequestBuilder/CollectionsTree';
import CollectionDetails from '@/components/Collections/CollectionDetails';
import { Collection, Request } from '@/types/Collections';
import { Team, User } from '@/types/User';
import { getInitials, getUserDetails } from '@/lib/firebase/auth';
import HeaderComponent from '@/components/Common/Header';
import { savePersonalCollections } from '@/lib/firebase/collections';
import { getTeamById, getTeamMode, getUserTeams, updateTeamCollections } from '@/lib/firebase/teams';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    buildCollectionShareUrl,
    createDefaultCollection,
    createDefaultFolder,
    createDefaultRequest,
    ensureCollectionDefaults,
    ensureRequestDefaults,
    findRequest,
    normalizeCollections,
    parseImportedCollections,
    withCollectionShareId,
} from '@/lib/collections-utils';

function CollectionsPageContent() {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);

    const [user, setUser] = useState<User | null>(null);
    const [photoURL, setPhotoURL] = useState<string>('');
    const [autoSave, setAutoSave] = useState<boolean>(true);
    const [displayName, setDisplayName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [initials, setInitials] = useState<string>('');
    const [teams, setTeams] = useState<Team[]>([]);
    const [teamMode, setTeamMode] = useState<Team | null>(null);
    const [showTeamsDropdown, setShowTeamsDropdown] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();

    const collectionIdFromQuery = searchParams.get('collectionId');

    const selectedCollection = useMemo(
        () => collections.find((collection) => collection.id === selectedCollectionId) || null,
        [collections, selectedCollectionId]
    );

    useEffect(() => {
        const savedTeamMode = localStorage.getItem('teamMode');
        if (savedTeamMode) {
            try {
                const parsed = JSON.parse(savedTeamMode) as Team;
                if (parsed.teamId) {
                    setTeamMode(parsed);
                }
            } catch (error) {
                console.error('Failed to parse team mode from localStorage:', error);
            }
        }
    }, []);

    useEffect(() => {
        const loadData = async () => {
            const { user: currentUser, userData } = await getUserDetails();
            if (!currentUser) {
                router.push('/login');
                return;
            }

            const userTeams = await getUserTeams(currentUser.uid);
            setUser(currentUser);
            setEmail(currentUser.email || '');
            setAutoSave(userData?.autoSave ?? true);
            setDisplayName(currentUser.displayName || '');
            setPhotoURL(currentUser.photoURL || '');
            setUsername(currentUser.username || '');
            setInitials(getInitials(currentUser.displayName || ''));
            setTeams(userTeams);

            const persistedTeamMode = getTeamMode();
            if (persistedTeamMode) {
                const teamDetails = await getTeamById(persistedTeamMode.teamId);
                setCollections(normalizeCollections(teamDetails.collections || [], persistedTeamMode.teamId));
                return;
            }

            setCollections(normalizeCollections(userData?.personalCollections || []));
        };

        loadData();
    }, [router]);

    useEffect(() => {
        if (collectionIdFromQuery) {
            setSelectedCollectionId(collectionIdFromQuery);
        }
    }, [collectionIdFromQuery]);

    useEffect(() => {
        if (selectedCollectionId && !collections.some((collection) => collection.id === selectedCollectionId)) {
            setSelectedCollectionId(null);
        }
    }, [collections, selectedCollectionId]);

    const persistCollections = async (nextCollections: Collection[]) => {
        if (!user?.uid) {
            return;
        }

        const normalized = normalizeCollections(nextCollections, teamMode?.teamId);
        setCollections(normalized);

        setIsSaving(true);
        try {
            if (teamMode?.teamId) {
                await updateTeamCollections(teamMode.teamId, normalized);
            } else {
                await savePersonalCollections(user.uid, normalized);
            }
        } catch (error) {
            console.error('Failed to persist collections:', error);
            alert('Failed to save collections. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddCollection = async (name: string) => {
        const collectionName = name.trim() || 'New Collection';
        const nextCollection = createDefaultCollection(collectionName, teamMode?.teamId);
        const nextCollections = [...collections, nextCollection];

        await persistCollections(nextCollections);
        setSelectedCollectionId(nextCollection.id);
    };

    const handleAddFolder = async (collectionId: string) => {
        const collection = collections.find((entry) => entry.id === collectionId);
        const folder = createDefaultFolder(collectionId, (collection?.folders.length || 0) + 1);

        const nextCollections = collections.map((entry) =>
            entry.id === collectionId
                ? {
                      ...entry,
                      folders: [...entry.folders, folder],
                      updatedAt: new Date().toISOString(),
                  }
                : entry
        );

        await persistCollections(nextCollections);
    };

    const handleAddRequest = async (collectionId: string, folderId?: string) => {
        const request = createDefaultRequest(folderId || collectionId, 'http');

        const nextCollections = collections.map((collection) => {
            if (collection.id !== collectionId) {
                return collection;
            }

            if (folderId) {
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
            }

            return {
                ...collection,
                requests: [...collection.requests, request],
                updatedAt: new Date().toISOString(),
            };
        });

        await persistCollections(nextCollections);
        openRequestInTab(request);
    };

    const openRequestInTab = (request: Request) => {
        const normalizedRequest = ensureRequestDefaults(request);

        const reference = findRequest(collections, normalizedRequest.id);
        if (reference) {
            setSelectedCollectionId(reference.collection.id);
        }

        router.push(`/?requestId=${encodeURIComponent(normalizedRequest.id)}`);
    };

    const renameItem = async (id: string, newName: string) => {
        if (!newName.trim()) {
            return;
        }

        const nextCollections = collections.map((collection) => {
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
                    request.id === id
                        ? {
                              ...request,
                              name: newName,
                              updatedAt: new Date().toISOString(),
                          }
                        : request
                ),
            };
        });

        await persistCollections(nextCollections);
    };

    const deleteItem = async (id: string) => {
        const nextCollections = collections
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

        await persistCollections(nextCollections);
    };

    const handleDuplicateRequest = async (request: Request) => {
        const reference = findRequest(collections, request.id);
        if (!reference) {
            return;
        }

        const duplicatedRequest = ensureRequestDefaults({
            ...request,
            id: `${reference.folder?.id || reference.collection.id}-${Date.now()}`,
            name: `${request.name} Copy`,
            updatedAt: new Date().toISOString(),
        });

        const nextCollections = collections.map((collection) => {
            if (collection.id !== reference.collection.id) {
                return collection;
            }

            if (reference.folder) {
                return {
                    ...collection,
                    folders: collection.folders.map((folder) =>
                        folder.id === reference.folder?.id
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

    const handleExportCollections = () => {
        const dataStr = JSON.stringify(collections, null, 2);
        const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', 'collections-export.json');
        linkElement.click();
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
                const importedCollections = parseImportedCollections(await file.text(), teamMode?.teamId);
                const mergedCollections = normalizeCollections([
                    ...collections,
                    ...importedCollections,
                ], teamMode?.teamId);

                await persistCollections(mergedCollections);
                alert(`Imported ${importedCollections.length} collection(s).`);
            } catch (error) {
                console.error('Import error:', error);
                alert(
                    error instanceof Error
                        ? error.message
                        : 'Error importing collections: invalid file format.'
                );
            }
        };

        input.click();
    };

    const handleShareCollection = async (collection: Collection) => {
        const ownerTeamId = teamMode?.teamId || collection.teamId;
        if (!ownerTeamId) {
            alert('Sharing is available only for team collections.');
            return;
        }

        const sharedCollection = withCollectionShareId({
            ...ensureCollectionDefaults(collection, ownerTeamId),
            teamId: ownerTeamId,
        });

        const nextCollections = collections.map((entry) =>
            entry.id === collection.id ? sharedCollection : entry
        );

        await persistCollections(nextCollections);
        const shareId = sharedCollection.shareId;
        if (!shareId) {
            alert('Unable to generate share link. Please try again.');
            return;
        }

        const link = buildCollectionShareUrl(window.location.origin, shareId);
        try {
            await navigator.clipboard.writeText(link);
        } catch (error) {
            console.error('Clipboard write failed:', error);
            alert(`Share link created: ${link}`);
        }
        router.push(`/collections/shared/${shareId}`);
    };

    const handleDeleteCollection = async (collection: Collection) => {
        if (!window.confirm(`Delete "${collection.name}"? This cannot be undone.`)) {
            return;
        }

        await deleteItem(collection.id);
        if (selectedCollectionId === collection.id) {
            setSelectedCollectionId(null);
        }
    };

    const handleExitTeamMode = () => {
        setTeamMode(null);
        localStorage.removeItem('teamMode');
        localStorage.removeItem('activeEnvironmentId');
        window.location.reload();
    };

    const handleTeamSelect = (team: Team | null) => {
        setTeamMode(team);
        if (team) {
            localStorage.setItem('teamMode', JSON.stringify(team));
        } else {
            localStorage.removeItem('teamMode');
        }
        setShowTeamsDropdown(false);
        localStorage.removeItem('activeEnvironmentId');
    };

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
            <div className="flex-1 flex flex-col overflow-hidden">
                <HeaderComponent
                    onAddCollection={() => {
                        void handleAddCollection('New Collection');
                    }}
                    toSearch={true}
                    parentComponent="Collections"
                    environments={[]}
                    autoSave={autoSave}
                    displayName={displayName}
                    email={email}
                    initials={initials}
                    setAutoSave={setAutoSave}
                    username={username}
                    teams={teams}
                    teamMode={teamMode}
                    activeEnvironmentId={''}
                    onEnvironmentSelect={() => {}}
                    onExitTeamMode={handleExitTeamMode}
                    onTeamSelect={handleTeamSelect}
                    setShowTeams={setShowTeamsDropdown}
                    showTeams={showTeamsDropdown}
                    photoURL={photoURL}
                />

                <div className="flex-1 flex overflow-hidden">
                    <CollectionsTree
                        collections={collections}
                        onAddRequest={(collectionId, folderId) => {
                            void handleAddRequest(collectionId, folderId);
                        }}
                        onAddFolder={(collectionId) => {
                            void handleAddFolder(collectionId);
                        }}
                        onRenameItem={(id, newName) => {
                            void renameItem(id, newName);
                        }}
                        onDeleteItem={(id) => {
                            void deleteItem(id);
                        }}
                        onDuplicateRequest={(request) => {
                            void handleDuplicateRequest(request);
                        }}
                        onSelectRequest={openRequestInTab}
                        onAddCollection={(name) => {
                            void handleAddCollection(name);
                        }}
                        onExportCollections={handleExportCollections}
                        onImportCollections={handleImportCollections}
                        onSelectCollection={(collection) => setSelectedCollectionId(collection.id)}
                        selectedCollectionId={selectedCollectionId}
                    />

                    <div className="flex-1 flex flex-col overflow-hidden">
                        {selectedCollection ? (
                            <CollectionDetails
                                collection={selectedCollection}
                                onEditCollection={(updated) => {
                                    if ('variables' in updated) {
                                        const nextCollections = collections.map((collection) =>
                                            collection.id === updated.id
                                                ? ensureCollectionDefaults({
                                                      ...updated,
                                                      updatedAt: new Date().toISOString(),
                                                  }, teamMode?.teamId)
                                                : collection
                                        );
                                        void persistCollections(nextCollections);
                                    } else {
                                        openRequestInTab(updated as Request);
                                    }
                                }}
                                onShareCollection={(collection) => {
                                    void handleShareCollection(collection);
                                }}
                                onDeleteCollection={(collection) => {
                                    void handleDeleteCollection(collection);
                                }}
                            />
                        ) : (
                            <div className="grid h-full place-items-center bg-slate-50 p-6 dark:bg-gray-900">
                                <div className="max-w-xl space-y-4 rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
                                    <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                                        {collections.length === 0 ? 'Start Your API Workspace' : 'Select A Collection'}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        {collections.length === 0
                                            ? 'Create a collection or import from Postman, Hoppscotch, or other tools to continue.'
                                            : 'Pick a collection from the sidebar to view variables, requests, and sharing options.'}
                                    </p>
                                    <div className="flex flex-wrap justify-center gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                void handleAddCollection('New Collection');
                                            }}
                                            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm"
                                        >
                                            Create Collection
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleImportCollections}
                                            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        >
                                            Import Collections
                                        </button>
                                    </div>
                                    {isSaving ? (
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Saving changes...
                                        </p>
                                    ) : null}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function CollectionsPageFallback() {
    return <div className="h-screen bg-gray-50 dark:bg-gray-900" />;
}

export default function CollectionsPage() {
    return (
        <Suspense fallback={<CollectionsPageFallback />}>
            <CollectionsPageContent />
        </Suspense>
    );
}
