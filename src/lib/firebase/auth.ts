import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    AuthError,
    updateProfile,
    setPersistence,
    browserSessionPersistence,
    browserLocalPersistence,
    sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { User } from '@/types/User';
import { auth, db } from './client';
import { generateRandomString } from '@/lib/utils/utils';
import { UserData } from '@/types/User';

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

// Utility to validate username format
const validateUsername = (username: string): { isValid: boolean; error?: string } => {
    // Remove @ if user includes it
    const cleanUsername = username.startsWith('@') ? username.slice(1) : username;
    
    // Check length (3-20 characters)
    if (cleanUsername.length < 3 || cleanUsername.length > 20) {
        return { isValid: false, error: 'Username must be between 3-20 characters' };
    }
    
    // Check format: only letters, numbers, underscores, dots
    const usernameRegex = /^[a-zA-Z0-9._]+$/;
    if (!usernameRegex.test(cleanUsername)) {
        return { isValid: false, error: 'Username can only contain letters, numbers, dots, and underscores' };
    }
    
    // Check if starts/ends with dot or underscore
    if (cleanUsername.startsWith('.') || cleanUsername.startsWith('_') || 
        cleanUsername.endsWith('.') || cleanUsername.endsWith('_')) {
        return { isValid: false, error: 'Username cannot start or end with dots or underscores' };
    }
    
    return { isValid: true };
};

// Check if username is available
export const checkUsernameAvailability = async (username: string): Promise<{ isAvailable: boolean; error?: string }> => {
    try {
        const validation = validateUsername(username);
        if (!validation.isValid) {
            return { isAvailable: false, error: validation.error };
        }
        
        const cleanUsername = username.startsWith('@') ? username.slice(1) : username;
        const lowercaseUsername = cleanUsername.toLowerCase();
        
        // Check in usernames collection
        const usernameDoc = await getDoc(doc(db, 'usernames', lowercaseUsername));
        
        if (usernameDoc.exists()) {
            return { isAvailable: false, error: 'Username is already taken' };
        }
        
        return { isAvailable: true };
    } catch (error) {
        console.error('Error checking username availability:', error);
        return { isAvailable: false, error: 'Failed to check username availability' };
    }
};

// Reserve a username for a user
const reserveUsername = async (username: string, uid: string): Promise<boolean> => {
    try {
        const cleanUsername = username.startsWith('@') ? username.slice(1) : username;
        const lowercaseUsername = cleanUsername.toLowerCase();
        
        // Store username mapping
        await setDoc(doc(db, 'usernames', lowercaseUsername), {
            uid: uid,
            username: cleanUsername, // Store original case
            createdAt: new Date()
        });
        
        return true;
    } catch (error) {
        console.error('Error reserving username:', error);
        return false;
    }
};

// Get user by username
export const getUserByUsername = async (username: string): Promise<{ user: UserData | null; error?: string }> => {
    try {
        const cleanUsername = username.startsWith('@') ? username.slice(1) : username;
        const lowercaseUsername = cleanUsername.toLowerCase();
        
        // Get UID from username mapping
        const usernameDoc = await getDoc(doc(db, 'usernames', lowercaseUsername));
        
        if (!usernameDoc.exists()) {
            return { user: null, error: 'User not found' };
        }
        
        const { uid } = usernameDoc.data();
        
        // Get user data
        const userDoc = await getDoc(doc(db, 'users', uid));
        
        if (!userDoc.exists()) {
            return { user: null, error: 'User data not found' };
        }
        
        return { user: userDoc.data() as UserData };
    } catch (error) {
        console.error('Error getting user by username:', error);
        return { user: null, error: 'Failed to get user' };
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

// Enhanced function to store user data both locally and in Firestore
const storeUserData = async (user: any, additionalData?: Partial<UserData>) => {
    try {
        const userData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            emailVerified: user.emailVerified,
            username: additionalData?.username || null,
            ...additionalData
        };

        // Store in localStorage for quick access
        const userJson = JSON.stringify(userData);
        try {
            localStorage.setItem('currentUser', userJson);
            localStorage.setItem('userId', user.uid);
            if (userData.username) {
                localStorage.setItem('username', userData.username);
            }
        } catch (storageError) {
            console.warn('Could not save to localStorage:', storageError);
        }

        // Update user document in Firestore
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, {
            uid: user.uid,
            name: user.displayName || additionalData?.name || '',
            email: user.email,
            photoURL: user.photoURL || null,
            emailVerified: user.emailVerified,
            username: additionalData?.username || null,
            lastLoginAt: new Date(),
            updatedAt: new Date(),
            ...additionalData
        }, { merge: true });

        return userData;
    } catch (error) {
        console.error('Error storing user data:', error);
        throw error;
    }
};

// Updated login function
export const loginWithEmail = async (email: string, password: string) => {
    try {
        await setAuthPersistence(true);
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        // Get existing user data to preserve username
        const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
        const existingUserData = userDoc.exists() ? userDoc.data() : {};

        // Store user data in local storage
        localStorage.setItem('currentUser', JSON.stringify({
            uid: userCredential.user.uid,
            email: userCredential.user.email,
            displayName: userCredential.user.displayName,
            username: existingUserData.username || null
            // add other user properties you need
        }));
        
        // Store user data with existing username
        await storeUserData(userCredential.user, {
            username: existingUserData.username || null
        });

        return { 
            success: true, 
            user: userCredential.user,
            userId: userCredential.user.uid,
            username: existingUserData.username || null
        };
    } catch (error) {
        return { success: false, error: getAuthErrorMessage(error as AuthError) };
    }
};

// Updated signup function with optional username
export const signUpWithEmail = async (email: string, password: string, name: string, username: string | undefined | null) => {
    try {
        await setAuthPersistence(true);

        // 1. Check username availability if provided
        if (username) {
            const availability = await checkUsernameAvailability(username);
            if (!availability.isAvailable) {
                return { success: false, error: availability.error };
            }
        }

        // 2. Create user with email/password
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 3. Update display name
        await updateProfile(user, {
            displayName: name
        });

        // 4. Reserve username if provided
        let finalUsername = null;
        if (username) {
            const reserved = await reserveUsername(username, user.uid);
            if (!reserved) {
                // Username reservation failed, but user is already created
                console.error('Failed to reserve username');
            } else {
                finalUsername = username.startsWith('@') ? username.slice(1) : username;
            }
        }

        // 5. Store user data
        await storeUserData(user, {
            name: name,
            username: finalUsername,
            createdAt: new Date(),
            isNewUser: true
        });

        // Store user data in local storage
        localStorage.setItem('currentUser', JSON.stringify({
            uid: userCredential.user.uid,
            email: userCredential.user.email,
            displayName: userCredential.user.displayName,
            username: finalUsername || null
            // add other user properties you need
        }));

        return { 
            success: true, 
            user: user,
            userId: user.uid,
            username: finalUsername
        };
    } catch (error) {
        return { success: false, error: getAuthErrorMessage(error as AuthError) };
    }
};

// Function to set/update username for existing user
export const setUsername = async (username: string): Promise<{ success: boolean; error?: string }> => {
    try {
        const currentUser = getCurrentUser();
        if (!currentUser) {
            return { success: false, error: 'No user logged in' };
        }

        // Check availability
        const availability = await checkUsernameAvailability(username);
        if (!availability.isAvailable) {
            return { success: false, error: availability.error };
        }

        const cleanUsername = username.startsWith('@') ? username.slice(1) : username;

        // Get current username to remove old mapping
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        const currentUsername = userDoc.exists() ? userDoc.data().username : null;

        // Remove old username mapping if exists
        if (currentUsername) {
            await deleteDoc(doc(db, 'usernames', currentUsername.toLowerCase()));
        }

        // Reserve new username
        const reserved = await reserveUsername(cleanUsername, currentUser.uid);
        if (!reserved) {
            return { success: false, error: 'Failed to reserve username' };
        }

        // Update user document
        await updateDoc(doc(db, 'users', currentUser.uid), {
            username: cleanUsername,
            updatedAt: new Date()
        });

        // Update localStorage
        const updatedUser = { ...currentUser, username: cleanUsername };
        try {
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            localStorage.setItem('username', cleanUsername);
        } catch (storageError) {
            console.warn('Could not update localStorage:', storageError);
        }

        return { success: true };
    } catch (error) {
        console.error('Error setting username:', error);
        return { success: false, error: 'Failed to set username' };
    }
};

// Updated logout function
export const logout = async () => {
    try {
        await signOut(auth);
        
        // Clear localStorage
        try {
            localStorage.removeItem('currentUser');
            localStorage.removeItem('userId');
            localStorage.removeItem('username');
        } catch (storageError) {
            console.warn('Could not clear localStorage:', storageError);
        }
        
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed to logout' };
    }
};

export const sendPasswordResetOTP = async (email: string) => {
    try {
        await sendPasswordResetEmail(auth, email);
        return { success: true };
    } catch (error: any) {
        return {
            success: false,
            error: error.code === 'auth/user-not-found'
                ? 'No account found with this email'
                : 'Failed to send password reset email'
        };
    }
};

export const verifyPasswordResetOTP = async (email: string, otp: string) => {
    try {
        const otpDocRef = doc(db, 'passwordResetOTPs', email);
        const otpDoc = await getDoc(otpDocRef);

        if (!otpDoc.exists()) {
            return { success: false, error: 'Invalid or expired OTP' };
        }

        const otpData = otpDoc.data();

        if (otpData.expiry < Date.now()) {
            await deleteDoc(otpDocRef);
            return { success: false, error: 'OTP has expired' };
        }

        if (otpData.attempts >= 3) {
            await deleteDoc(otpDocRef);
            return { success: false, error: 'Too many attempts. Please request a new OTP.' };
        }

        await setDoc(otpDocRef, { attempts: otpData.attempts + 1 }, { merge: true });

        if (otpData.otp !== otp) {
            return { success: false, error: 'Invalid OTP' };
        }

        const resetToken = generateRandomString(32);
        await setDoc(otpDocRef, {
            verified: true,
            resetToken,
            tokenExpiry: Date.now() + 15 * 60 * 1000
        }, { merge: true });

        return { success: true, resetToken };
    } catch (error) {
        return { success: false, error: 'Failed to verify OTP' };
    }
};

export const resetPasswordWithToken = async (email: string, token: string, newPassword: string) => {
    try {
        const otpDocRef = doc(db, 'passwordResetOTPs', email);
        const otpDoc = await getDoc(otpDocRef);

        if (!otpDoc.exists()) {
            return { success: false, error: 'Invalid or expired token' };
        }

        const otpData = otpDoc.data();

        if (!otpData.verified || otpData.resetToken !== token || otpData.tokenExpiry < Date.now()) {
            await deleteDoc(otpDocRef);
            return { success: false, error: 'Invalid or expired token' };
        }

        await sendPasswordResetEmail(auth, email);
        await deleteDoc(otpDocRef);

        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed to reset password' };
    }
};

// Get current user from localStorage
export const getCurrentUser = (): User | null => {
    try {
        const userJson = localStorage.getItem('currentUser');
        return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
};

// Get current username
export const getCurrentUsername = (): string | null => {
    try {
        return localStorage.getItem('username');
    } catch (error) {
        console.error('Error getting current username:', error);
        const user = getCurrentUser();
        return user?.username || null;
    }
};

export const getUserDetails = async (): Promise<{
    user: User | null;
    userData: UserData | null;
}> => {
    try {
        const user = getCurrentUser();
        if (!user) return { user: null, userData: null };

        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.exists() ? (userDoc.data() as UserData) : null;

        return { user, userData };
    } catch (error) {
        console.error("Error fetching user details:", error);
        return { user: null, userData: null };
    }
};

export const getInitials = (name: string | undefined): string => {
    if (!name || typeof name !== 'string') return '';

    const words = name.trim().split(/\s+/);

    if (words.length === 0) return '';

    if (words.length === 1) {
        return words[0].slice(0, 3).toUpperCase();
    }

    if (words.length === 2) {
        return (words[0][0] + words[1][0]).toUpperCase();
    }

    return (words[0][0] + words[1][0] + words[words.length - 1][0]).toUpperCase();
};