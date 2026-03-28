import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase"; // adjust if needed
import { getAuth } from "firebase/auth";

export async function enableTwoFactor(secret: string) {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) throw new Error("User not authenticated");

    await setDoc(
        doc(db, "users", user.uid),
        {
            twoFactorEnabled: true,
            twoFactorSecret: secret,
        },
        { merge: true }
    );
}