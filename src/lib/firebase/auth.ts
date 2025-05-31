import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    signInWithPopup, 
    GoogleAuthProvider, 
    GithubAuthProvider,
    AuthError
  } from 'firebase/auth';
  import { auth } from './client';

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
  
  export const loginWithEmail = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: getAuthErrorMessage(error as AuthError) };
    }
  };
  
  export const signUpWithEmail = async (email: string, password: string, name: string) => {
    try {
        console.log("The function sign up with email was called");
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // You might want to store the name in Firestore here
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: getAuthErrorMessage(error as AuthError) };
    }
  };
  
  export const loginWithGoogle = async (): Promise<{ success: boolean; user?: any; error?: string }> => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: getAuthErrorMessage(error as AuthError) };
    }
  };
  
  export const loginWithGithub = async (): Promise<{ success: boolean; user?: any; error?: string }> => {
    try {
      const provider = new GithubAuthProvider();
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