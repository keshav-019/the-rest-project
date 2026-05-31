import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

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
};

// ✅ Prevent duplicate initialization
const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApp();

const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
