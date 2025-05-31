// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);

// Initialize services
const db = getFirestore(app);
const auth = getAuth(app);

export {db, auth};