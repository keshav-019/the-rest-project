// components/Collections.tsx
'use client';
import React, { useState, useEffect } from 'react';
import Header from '@/components/Common/Header';
import CollectionsTree from '@/components/RequestBuilder/CollectionsTree';
import CollectionDetails from '@/components/Collections/CollectionDetails';
import RequestTabs from '@/components/RequestBuilder/RequestTabs';
import NewCollectionModal from '@/components/Collections/NewCollectionModal';
import { getUserData, cleanOldActivity } from '@/services/userService';
import { Collection, Request, Folder } from '@/types/Collections';
import { UserData } from '@/types/User';
import { getUserDetails } from '@/lib/firebase/auth';

/* eslint-disable @typescript-eslint/no-unused-vars */

const Collections: React.FC = () => {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
    const [showNewCollectionModal, setShowNewCollectionModal] = useState(false);
    const [user, setUserData] = useState<UserData | null>(null);
    const [activeTabs, setActiveTabs] = useState<{ id: string; request: Request }[]>([]);
    const [activeTabId, setActiveTabId] = useState<string | null>(null);

    // Fetch user data
    useEffect(() => {
        const fetchUserData = async () => {
            const { user } = await getUserDetails();
            if (user) {
                const data = await getUserData(user.uid);
                if (data) {
                    setUserData(data);
                    const allCollections = [
                        ...(data.personalCollections || []),
                        ...Object.values(data.teams || {}).flatMap(team => team.collections || [])
                    ];
                    setCollections(allCollections);
                    if (allCollections.length > 0) {
                        setSelectedCollection(allCollections[0]);
                    }
                }
                await cleanOldActivity(user.uid);
            }
        };
        fetchUserData();
    }, []);

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
        setSelectedCollection(newCollection);
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

    const handleAddRequest = (collectionId: string, folderId?: string) => {
        setCollections(prev => prev.map(collection => {
            if (collection.id === collectionId) {
                const newRequest: Request = {
                    id: `${folderId || collectionId}-${Date.now()}`, // folderId/collectionId-timestamp
                    method: 'GET',
                    name: 'New Request',
                    description: '',
                    url: ''
                };

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
        const newRequest: Request = {
            id: `${folderId || collectionId}-${Date.now()}`,
            method: 'GET',
            name: 'New Request',
            description: '',
            url: ''
        };
        openRequestInTab(newRequest);
    };

    const openRequestInTab = (request: Request) => {
        setActiveTabs(prev => {
            // Don't open duplicate tabs
            if (prev.some(tab => tab.id === request.id)) {
                return prev;
            }
            return [...prev, { id: request.id, request }];
        });
        setActiveTabId(request.id);
    };

    const closeTab = (id: string) => {
        setActiveTabs(prev => prev.filter(tab => tab.id !== id));
        setActiveTabId(prev => prev === id ? null : prev);
    };

    const updateRequest = (id: string, updatedRequest: Request) => {
        // Update in collections state
        setCollections(prev => prev.map(collection => ({
            ...collection,
            folders: collection.folders.map(folder => ({
                ...folder,
                requests: folder.requests.map(req =>
                    req.id === id ? updatedRequest : req
                )
            })),
            requests: collection.requests.map(req =>
                req.id === id ? updatedRequest : req
            )
        })));

        // Update in active tabs
        setActiveTabs(prev => prev.map(tab =>
            tab.id === id ? { ...tab, request: updatedRequest } : tab
        ));
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

    const handleExportCollections = () => {
        // Convert collections to JSON string
        const dataStr = JSON.stringify(collections, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

        // Create download link
        const exportFileDefaultName = 'collections-export.json';
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

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
    const isValidCollection = (obj: Collection): obj is Collection => {
        return obj &&
            typeof obj.id === 'string' &&
            typeof obj.name === 'string' &&
            Array.isArray(obj.folders) &&
            Array.isArray(obj.requests);
    };

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header onNewCollection={() => setShowNewCollectionModal(true)} />

                <div className="flex-1 flex overflow-hidden">
                    <CollectionsTree
                        collections={collections}
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

                    <div className="flex-1 flex flex-col overflow-hidden">
                        {activeTabs.length > 0 ? (
                            <RequestTabs
                                tabs={activeTabs}
                                activeTabId={activeTabId}
                                onTabChange={setActiveTabId}
                                onCloseTab={closeTab}
                                onSaveRequest={updateRequest}
                            />
                        ) : selectedCollection ? (
                            <CollectionDetails
                                collection={selectedCollection}
                                onEditCollection={(updated) => {
                                    if ('variables' in updated) {
                                        // This is a collection update
                                        setSelectedCollection(updated);
                                        setCollections(prev => prev.map(c =>
                                            c.id === updated.id ? updated : c
                                        ));
                                    } else {
                                        // This is a request - open in tab
                                        openRequestInTab(updated as Request);
                                    }
                                }}
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-gray-500 dark:text-gray-400">
                                    No collection selected
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <NewCollectionModal
                isOpen={showNewCollectionModal}
                onClose={() => setShowNewCollectionModal(false)}
                onCreate={handleAddCollection}
            />
        </div>
    );
};

export default Collections;