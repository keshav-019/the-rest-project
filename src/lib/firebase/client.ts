import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDH-WTJynf5i-h9oPFyBcuX5aVzdqumQ0I",
    authDomain: "rest-project-8b249.firebaseapp.com",
    projectId: "rest-project-8b249",
    storageBucket: "rest-project-8b249.firebasestorage.app",
    messagingSenderId: "537941387841",
    appId: "1:537941387841:web:2f07ce4a936c3106ce34c0",
    measurementId: "G-V9CXSSEERG"
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