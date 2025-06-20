import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Optional: Enable persistence for Firestore
if (typeof window !== 'undefined') {
    // This ensures we're running in the browser
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