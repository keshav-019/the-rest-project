import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    signInWithPopup, 
    GoogleAuthProvider, 
    GithubAuthProvider,
    AuthError,
    updateProfile,
    setPersistence,
    browserSessionPersistence,
    browserLocalPersistence
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './client';

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

// Utility to handle Firebase errors
const getAuthErrorMessage = (error: AuthError): string => {
    switch (error.code) {
        case 'auth/email-already-in-use':
            return 'Email already in use';
        case 'auth/invalid-email':
            return 'Invalid email address';
        case 'auth/weak-password':
            return 'Password should be at least 6 characters';
        case 'auth/user-not-found':
        case 'auth/wrong-password':
            return 'Invalid email or password';
        case 'auth/too-many-requests':
            return 'Too many attempts. Try again later';
        default:
            return 'Authentication failed. Please try again';
    }
};

// Set persistence (optional - Firebase uses localStorage by default)
export const setAuthPersistence = async (persistent: boolean = true) => {
    try {
      await setPersistence(
        auth, 
        persistent ? browserLocalPersistence : browserSessionPersistence
      );
    } catch (error) {
      console.error("Error setting auth persistence:", error);
    }
};
  
export const loginWithEmail = async (email: string, password: string) => {
    console.log("The login with email functionality was called");
    try {
        await setAuthPersistence(true); // Use localStorage for persistence

        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
        return { success: false, error: getAuthErrorMessage(error as AuthError) };
    }
  };
  
  export const signUpWithEmail = async (email: string, password: string, name: string) => {
    try {
      console.log("Signing up user:", email);

      await setAuthPersistence(true); // Use localStorage for persistence
      
      // 1. Create user with email/password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // 2. Update display name in Firebase Auth
      await updateProfile(user, {
        displayName: name
      });
  
      // 3. Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name: name,
        email: email,
        createdAt: new Date(),
        updatedAt: new Date()
      });
  
      console.log("User created successfully:", user.uid);
      return { success: true, user: user };
      
    } catch (error) {
      console.error("Signup error:", error);
      return { success: false, error: getAuthErrorMessage(error as AuthError) };
    }
  };
  
  export const loginWithGoogle = async (): Promise<{ success: boolean; user?: any; error?: string }> => {
    try {
        await setAuthPersistence(true); // Use localStorage for persistence

        const provider = new GoogleAuthProvider();
        const userCredential = await signInWithPopup(auth, provider);
        return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: getAuthErrorMessage(error as AuthError) };
    }
  };
  
  export const logout = async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to logout' };
    }
  };