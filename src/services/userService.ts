// services/userService.ts
import { db, doc, setDoc, getDoc, updateDoc, arrayUnion } from '@/lib/firebase/client';
import { UserData } from '../types/User';
import { Collection } from '@/types/Collections';

export const getUserData = async (userId: string): Promise<UserData | null> => {
  const userRef = doc(db, 'users', userId);
  const docSnap = await getDoc(userRef);
  
  if (docSnap.exists()) {
    return docSnap.data() as UserData;
  }
  return null;
};

export const updateUserData = async (userId: string, data: Partial<UserData>) => {
  const userRef = doc(db, 'users', userId);
  await setDoc(userRef, data, { merge: true });
};

export const addCollection = async (userId: string, collection: Collection, teamId?: string) => {
  const userRef = doc(db, 'users', userId);
  
  if (teamId) {
    await updateDoc(userRef, {
      [`teams.${teamId}.collections`]: arrayUnion(collection),
      recentActivity: arrayUnion({
        type: 'collection_created',
        id: collection.id,
        name: collection.name,
        timestamp: new Date(),
        teamId
      })
    });
  } else {
    await updateDoc(userRef, {
      personalCollections: arrayUnion(collection),
      recentActivity: arrayUnion({
        type: 'collection_created',
        id: collection.id,
        name: collection.name,
        timestamp: new Date()
      })
    });
  }
};

export const addTeam = async (userId: string, teamId: string) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    [`teams.${teamId}`]: {
      collections: [],
      environments: [],
      lastSynced: new Date()
    }
  });
};

export const cleanOldActivity = async (userId: string) => {
  const userData = await getUserData(userId);
  if (!userData) return;

  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentActivity = userData.recentActivity !== undefined ? userData.recentActivity.filter(
    activity => new Date(activity.timestamp) > twentyFourHoursAgo
  ) : [];

  if (recentActivity.length !== (userData.recentActivity !== undefined ? userData.recentActivity.length : 0)) {
    await updateDoc(doc(db, 'users', userId), {
      recentActivity
    });
  }
};