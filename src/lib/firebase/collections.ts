import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from './client';
import { Collection } from "@/types/Collections";
import { UserData } from "@/types/User";
import { getUserDetails } from "./auth";
import { updatePersonalCollections } from "./userDataHelpers";

// Example: Update personal collections
export async function savePersonalCollections(userId: string, newCollections: Collection[]) {
    console.log("The save personal collections function is called");
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    console.log("The user doc is: ", userDoc);
    
    if (!userDoc.exists()) {
        console.log("Ran into an error");
        throw new Error('User document not found');
    }

    const currentUserData = userDoc.data() as UserData;
    const updatedData = updatePersonalCollections(currentUserData, newCollections);

    console.log("The output of user details is: ", await getUserDetails());
    
    console.log("Before setting the doc the user reference is: ", userRef, " and the userDoc is: ", userDoc, " and updatedData is: ", updatedData);
    // Use setDoc with merge to preserve other fields
    await setDoc(userRef, updatedData, { merge: true });
}