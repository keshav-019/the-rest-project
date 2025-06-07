// @/services/collectionService.ts
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Collection, Request, Folder } from '@/types/Collections';
import { getCurrentUser, getUserDetails } from '@/lib/firebase/auth';

/* eslint-disable @typescript-eslint/no-unused-expressions */

// Helper function to get user document reference
const getUserDocRef = async () => {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    return doc(db, 'users', user.uid);
};

export const addCollection = async (collection: Collection, teamId?: string) => {
    const userDocRef = await getUserDocRef();
    const fieldPath = teamId ? `teams.${teamId}.collections` : 'personalCollections';

    await updateDoc(userDocRef, {
            [fieldPath]: arrayUnion(collection),
            recentActivity: arrayUnion({
            type: 'collection_created',
            id: collection.id,
            name: collection.name,
            timestamp: new Date(),
            teamId
        })
    });
};

export const removeCollection = async (collectionId: string, teamId?: string) => {
    const userDocRef = await getUserDocRef();
    const { userData } = await getUserDetails();
    if (!userData) throw new Error('User data not found');

    const fieldPath = teamId ? `teams.${teamId}.collections` : 'personalCollections';
    const collections = teamId 
        ? userData.teams?.[teamId]?.collections || []
        : userData.personalCollections || [];

    const collectionToRemove = collections.find(c => c.id === collectionId);
    if (!collectionToRemove) throw new Error('Collection not found');

    await updateDoc(userDocRef, {
        [fieldPath]: arrayRemove(collectionToRemove)
    });
};

export const addFolder = async (collectionId: string, folder: Folder, teamId?: string) => {
    const userDocRef = await getUserDocRef();
    const { userData } = await getUserDetails();
    if (!userData) throw new Error('User data not found');

    const fieldPath = teamId ? `teams.${teamId}.collections` : 'personalCollections';
    const collections = teamId 
        ? userData.teams?.[teamId]?.collections || []
        : userData.personalCollections || [];

    const collectionIndex = collections.findIndex(c => c.id === collectionId);
    if (collectionIndex === -1) throw new Error('Collection not found');

    const updatedCollections = [...collections];
    updatedCollections[collectionIndex] = {
        ...updatedCollections[collectionIndex],
        folders: [...updatedCollections[collectionIndex].folders, folder]
    };

    await updateDoc(userDocRef, {
        [fieldPath]: updatedCollections,
        recentActivity: arrayUnion({
        type: 'folder_created',
        id: folder.id,
        name: folder.name,
        timestamp: new Date(),
        teamId
        })
    });
};

export const removeFolder = async (collectionId: string, folderId: string, teamId?: string) => {
    const userDocRef = await getUserDocRef();
    const { userData } = await getUserDetails();
    if (!userData) throw new Error('User data not found');

    const fieldPath = teamId ? `teams.${teamId}.collections` : 'personalCollections';
    const collections = teamId 
        ? userData.teams?.[teamId]?.collections || []
        : userData.personalCollections || [];

    const collectionIndex = collections.findIndex(c => c.id === collectionId);
    if (collectionIndex === -1) throw new Error('Collection not found');

    const updatedCollections = [...collections];
    updatedCollections[collectionIndex] = {
        ...updatedCollections[collectionIndex],
        folders: updatedCollections[collectionIndex].folders.filter(f => f.id !== folderId)
    };

    await updateDoc(userDocRef, {
        [fieldPath]: updatedCollections
    });
};

export const addRequest = async (collectionId: string, folderId: string, request: Request, teamId?: string) => {
    const userDocRef = await getUserDocRef();

    const {userData} = await getUserDetails();

    if(!userData) throw new Error('User Data Not Found');

    const fieldPath = teamId ? `teams.${teamId}.collections` : 'personalCollections';
    const collections = teamId ? userData.teams?.[teamId]?.collections || [] : userData.personalCollections || [];

    const collectionIndex = collections.findIndex(c => c.id === collectionId);
    if(collectionIndex === -1) throw new Error('Collection not found');

    const updatedCollections = [...collections];
    const folderIndex = updatedCollections[collectionIndex].folders.findIndex(c => c.id === folderId);
    folderIndex === -1 ? updatedCollections[collectionIndex].requests.push(request) : updatedCollections[collectionIndex].folders[folderIndex].requests.push(request);

    updatedCollections[collectionIndex] = {
        ...updatedCollections[collectionIndex],
        requests: folderIndex === -1 ? updatedCollections[collectionIndex].requests : updatedCollections[collectionIndex].folders[folderIndex].requests
    }

    await updateDoc(userDocRef, {
        [fieldPath]: updatedCollections
    })
}

export const removeRequest = async (collectionId: string, folderId: string, requestId: string, teamId?: string) => {
    const userDocRef = await getUserDocRef();

    const {userData} = await getUserDetails();

    if(!userData) throw new Error('User Data Not Found');

    const fieldPath = teamId ? `teams.${teamId}.collections` : 'personalCollections';
    const collections = teamId ? userData.teams?.[teamId]?.collections || [] : userData.personalCollections || [];

    const collectionIndex = collections.findIndex(c => c.id === collectionId);
    if(collectionIndex === -1) throw new Error('Collection not found');

    const updatedCollections = [...collections];
    const folderIndex = updatedCollections[collectionIndex].folders.findIndex(c => c.id === folderId);

    updatedCollections[collectionIndex] = {
        ...updatedCollections[collectionIndex],
        requests: folderIndex === -1 ? updatedCollections[collectionIndex].requests.filter(c => c.id === requestId) : updatedCollections[collectionIndex].folders[folderIndex].requests.filter(c => c.id === requestId)
    }

    await updateDoc(userDocRef, {
        [fieldPath]: updatedCollections
    })
}

export const updateCollection = async (collectionId: string, collection: Collection, teamId?: string) => {
    const userDocRef = await getUserDocRef();
    const { userData } = await getUserDetails();
    if (!userData) throw new Error('User data not found');

    const fieldPath = teamId ? `teams.${teamId}.collections` : 'personalCollections';
    const collections = teamId 
        ? userData.teams?.[teamId]?.collections || []
        : userData.personalCollections || [];

    const collectionToUpdateIndex = collections.findIndex(c => c.id === collectionId);
    if (!collectionToUpdateIndex) throw new Error('Collection not found');

    collections[collectionToUpdateIndex] = collection;

    await updateDoc(userDocRef, {
        [fieldPath]: collections
    });
};

export const updateFolder = async (collectionId: string, folder: Folder, folderId: string, teamId?: string) => {
    const userDocRef = await getUserDocRef();
    const { userData } = await getUserDetails();
    if (!userData) throw new Error('User data not found');

    const fieldPath = teamId ? `teams.${teamId}.collections` : 'personalCollections';
    const collections = teamId 
        ? userData.teams?.[teamId]?.collections || []
        : userData.personalCollections || [];

    const collectionIndex = collections.findIndex(c => c.id === collectionId);
    if (collectionIndex === -1) throw new Error('Collection not found');

    const updatedCollections = [...collections];

    const findIndex = updatedCollections[collectionIndex].folders.findIndex(element => element.id === folderId);

    updatedCollections[collectionIndex].folders[findIndex] = folder;

    updatedCollections[collectionIndex] = {
        ...updatedCollections[collectionIndex],
        folders: updatedCollections[collectionIndex].folders
    };

    await updateDoc(userDocRef, {
        [fieldPath]: updatedCollections
    });
};


export const updateRequest = async (collectionId: string, folderId: string, request: Request, requestId: string, teamId?: string) => {
    const userDocRef = await getUserDocRef();

    const {userData} = await getUserDetails();

    if(!userData) throw new Error('User Data Not Found');

    const fieldPath = teamId ? `teams.${teamId}.collections` : 'personalCollections';
    const collections = teamId ? userData.teams?.[teamId]?.collections || [] : userData.personalCollections || [];

    const collectionIndex = collections.findIndex(c => c.id === collectionId);
    if(collectionIndex === -1) throw new Error('Collection not found');

    const updatedCollections = [...collections];
    const folderIndex = updatedCollections[collectionIndex].folders.findIndex(c => c.id === folderId);
    const requestIndex = folderIndex === -1 ? updatedCollections[collectionIndex].requests.findIndex(element => element.id === requestId) : updatedCollections[collectionIndex].folders[folderIndex].requests.findIndex(element => element.id === requestId);

    if(folderIndex === -1) {
        updatedCollections[collectionIndex].requests[requestIndex] = request;
    } else {
        updatedCollections[collectionIndex].folders[folderIndex].requests[requestIndex] = request;
    }

    updatedCollections[collectionIndex] = {
        ...updatedCollections[collectionIndex],
        requests: folderIndex === -1 ? updatedCollections[collectionIndex].requests : updatedCollections[collectionIndex].folders[folderIndex].requests
    }

    await updateDoc(userDocRef, {
        [fieldPath]: updatedCollections
    })
}
