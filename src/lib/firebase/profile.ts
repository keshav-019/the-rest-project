import { auth, db, storage } from "./client";
import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    query,
    where,
    collection,
    getDocs
} from "firebase/firestore";
import {
    updateProfile,
    updateEmail
} from "firebase/auth";
import {
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject
} from "firebase/storage";

/**
 * Check if username is available
 */
export const checkUsernameAvailability = async (username: string) => {
    if (!username) return false;

    const q = query(
        collection(db, "users"),
        where("username", "==", username)
    );

    const snapshot = await getDocs(q);
    return snapshot.empty;
};

/**
 * Update user profile (name, username, bio, email)
 */
export const updateUserProfileData = async ({
    name,
    username,
    bio,
    email,
    photoURL
}: {
    name: string;
    username: string;
    bio: string;
    email: string;
    photoURL: string;
}) => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const userRef = doc(db, "users", user.uid);

    // Update Firestore
    await setDoc(
        userRef,
        {
            name,
            username,
            bio,
            email,
            photoURL
        },
        { merge: true }
    );

    // Update Firebase Auth
    if (user.displayName !== name) {
        await updateProfile(user, { displayName: name });
    }

    if (user.email !== email) {
        await updateEmail(user, email);
    }
};

/**
 * Upload profile picture
 */
export const uploadProfilePicture = async (file: File) => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const storageRef = ref(storage, `avatars/${user.uid}`);
    await uploadBytes(storageRef, file);

    const url = await getDownloadURL(storageRef);

    // Save URL in Firestore
    await updateDoc(doc(db, "users", user.uid), {
        photoURL: url
    });

    // Update auth profile
    await updateProfile(user, {
        photoURL: url
    });

    return url;
};

/**
 * Remove profile picture
 */
export const removeProfilePicture = async () => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const storageRef = ref(storage, `avatars/${user.uid}`);

    try {
        await deleteObject(storageRef);
    } catch (e) {
        console.log("No previous image");
    }

    await updateDoc(doc(db, "users", user.uid), {
        photoURL: ""
    });

    await updateProfile(user, {
        photoURL: ""
    });
};