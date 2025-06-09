import { Environment, UserData } from "@/types/User";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./client";
import { updatePersonalEnvironments } from "./userDataHelpers";

// Example: Update team environments
export async function savePersonalEnvironments(userId: string, newEnvironments: Environment[]) {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
        throw new Error('User document not found');
    }
    
    const currentUserData = userDoc.data() as UserData;
    const updatedData = updatePersonalEnvironments(currentUserData, newEnvironments);

    console.log("The new environments are: ", newEnvironments);
    
    // Use setDoc with merge to preserve other fields
    await setDoc(userRef, updatedData, { merge: true });
}