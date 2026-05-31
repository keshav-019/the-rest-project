import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const readEnv = (value: string | undefined, fallback: string) => {
    const trimmed = value?.trim();
    return trimmed && trimmed.length > 0 ? trimmed : fallback;
};

const firebaseConfig = {
    apiKey: readEnv(process.env.NEXT_PUBLIC_FIREBASE_API_KEY, 'AIzaSyA-LOCAL-BUILD-KEY-PLACEHOLDER'),
    authDomain: readEnv(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, 'localhost'),
    projectId: readEnv(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID, 'local-build-project'),
    storageBucket: readEnv(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET, 'local-build-project.appspot.com'),
    messagingSenderId: readEnv(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID, '000000000000'),
    appId: readEnv(process.env.NEXT_PUBLIC_FIREBASE_APP_ID, '1:000000000000:web:0000000000000000000000'),
    measurementId: readEnv(process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, 'G-LOCALBUILD00')
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

if (typeof window !== 'undefined') {
    import('firebase/firestore').then(({ enableIndexedDbPersistence }) => {
        enableIndexedDbPersistence(db).catch((err) => {
            if (err.code === 'failed-precondition') {
                console.warn(
                    'Multiple tabs open, persistence can only be enabled in one tab at a time.'
                );
            } else if (err.code === 'unimplemented') {
                console.warn(
                    'The current browser does not support all of the features required to enable persistence'
                );
            }
        });
    });
}

export { app, auth, db, storage, doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove };
