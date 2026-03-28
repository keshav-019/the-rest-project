// components/Collections.tsx
'use client'
import React, { useState, useEffect } from 'react';
import CollectionsTree from '@/components/RequestBuilder/CollectionsTree';
import CollectionDetails from '@/components/Collections/CollectionDetails';
import RequestTabs from '@/components/RequestBuilder/RequestTabs';
import NewCollectionModal from '@/components/Collections/NewCollectionModal';
import { getUserData, cleanOldActivity } from '@/services/userService';
import { Collection, Request, Folder } from '@/types/Collections';
import { Team, User, UserData } from '@/types/User';
import { getInitials, getUserDetails } from '@/lib/firebase/auth';
import HeaderComponent from '@/components/Common/Header';
import { savePersonalCollections } from '@/lib/firebase/collections';
import { getTeamById, getTeamMode, getUserTeams } from '@/lib/firebase/teams';

/* eslint-disable @typescript-eslint/no-unused-vars */

const Collections: React.FC = () => {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
    const [showNewCollectionModal, setShowNewCollectionModal] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [activeTabs, setActiveTabs] = useState<{ id: string; request: Request }[]>([]);
    const [activeTabId, setActiveTabId] = useState<string | null>(null);
    const [userid, setUserid] = useState<string | undefined>(undefined);
    const [photoURL, setPhotoURL] = useState<string>('');
    const [autoSave, setAutoSave] = useState<boolean>(true);
    const [displayName, setDisplayName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [initials, setInitials] = useState<string>('');
    const [teams, setTeams] = useState<Team[]>([]);
    const [teamMode, setTeamMode] = useState<Team | null>(null);
    const [showTeamsDropdown, setShowTeamsDropdown] = useState(false);

    // Add this useEffect to initialize team mode and environment from localStorage
    useEffect(() => {
        const savedTeamMode = localStorage.getItem('teamMode');

        if (savedTeamMode) {
            setTeamMode(JSON.parse(savedTeamMode));
        }
    }, []);

    // Fetch user data
    useEffect(() => {
        const fetchUserData = async () => {
            const { user, userData } = (await getUserDetails());
            setUser(user);
            const teams = await getUserTeams(user?.uid || '');
            setUserid(user?.uid);
            setEmail(user?.email || '');
            setAutoSave(userData?.autoSave || true);
            setDisplayName(user?.displayName || '');
            setPhotoURL(user?.photoURL || '');
            setUsername(user?.username || '');
            setInitials(getInitials(user?.displayName || ''));
            setTeams(teams);

            const intermediateTeamMode = getTeamMode();

            if(intermediateTeamMode){              
                const getTeamDetails = await getTeamById(intermediateTeamMode.teamId);  
                setCollections(getTeamDetails.collections);
            }

            if (user && !intermediateTeamMode) {
                const data = await getUserData(user.uid);
                if (data) {
                    setUserData(data);
                    console.log("The personal collections is: ", data.personalCollections);
                    const allCollections = [
                        ...(data.personalCollections || [])
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
            id: `${Date.now()}`,
            name,
            description: '',
            variables: [],
            folders: [],
            requests: []
        };
    
        const updatedCollections = [...collections, newCollection];
    
        setCollections(updatedCollections);
        setSelectedCollection(newCollection);
    
        console.log("The new collection is: ", newCollection, " and the user is: ", user, " and the collections is: ", updatedCollections);
    
        if (!user?.uid) throw new Error('No users logged in right now');
    
        savePersonalCollections(user.uid, updatedCollections); // ✅ now correct
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
        if(user?.uid === undefined) throw new Error('No users logged in right now');
        savePersonalCollections(user?.uid, collections);
    };

    const handleAddRequest = (collectionId: string, folderId?: string) => {
        if (!user?.uid) throw new Error('No users logged in right now');
    
        const newRequest: Request = {
            id: `${folderId || collectionId}-${Date.now()}`,
            method: 'GET',
            name: 'New Request',
            description: '',
            url: '',
            auth: {credentials: {}, type: 'none'},
            body: '',
            headers: [{enabled: false, key: '', value: ''}],
            params: [{enabled: false, key: '', value: ''}],
            preRequestScript: '',
            tests: ''
        };
    
        const updatedCollections = collections.map(collection => {
            if (collection.id !== collectionId) return collection;
    
            if (folderId) {
                // Add to a folder
                return {
                    ...collection,
                    folders: collection.folders.map(folder =>
                        folder.id === folderId
                            ? { ...folder, requests: [...folder.requests, newRequest] }
                            : folder
                    )
                };
            } else {
                // Add directly to collection
                return {
                    ...collection,
                    requests: [...collection.requests, newRequest]
                };
            }
        });
    
        setCollections(updatedCollections);
        openRequestInTab(newRequest);
        savePersonalCollections(user.uid, updatedCollections); // ✅ Save the right state
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
        if(user?.uid === undefined) throw new Error('No users logged in right now');
        savePersonalCollections(user?.uid, collections);
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
        if(user?.uid === undefined) throw new Error('No users logged in right now');
        savePersonalCollections(user?.uid, collections);
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
        if(user?.uid === undefined) throw new Error('No users logged in right now');
        savePersonalCollections(user?.uid, collections);

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
                        if(user?.uid === undefined) throw new Error('No users logged in right now');
                        savePersonalCollections(user?.uid, collections);
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

    // Add this handler for exiting team mode
    const handleExitTeamMode = () => {
        setTeamMode(null);
        localStorage.removeItem('teamMode');
        localStorage.removeItem('activeEnvironmentId');

        // Refresh the page to reset all states
        window.location.reload();
    };

    // Add this handler for team selection
    const handleTeamSelect = (team: Team | null) => {
        setTeamMode(team);
        localStorage.setItem('teamMode', JSON.stringify(team));
        setShowTeamsDropdown(false);
        localStorage.removeItem('activeEnvironmentId');
    };

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
            <div className="flex-1 flex flex-col overflow-hidden">
                <HeaderComponent
                    onAddCollection={() => handleAddCollection('New Collection')}
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