import { auth, db } from "@/lib/firebase";
import {
    doc, getDoc, setDoc, serverTimestamp,
    type DocumentReference, type WithFieldValue
} from "firebase/firestore";
import type { UserDoc } from "@/lib/types";

/* Firestore path: users/{uid} */
export function userRef(uid: string): DocumentReference<UserDoc> {
    return doc(db, "users", uid) as DocumentReference<UserDoc>;
}

export async function getUserDoc(uid: string): Promise<UserDoc | null> {
    const snap = await getDoc(userRef(uid));
    return snap.exists() ? (snap.data() as UserDoc) : null;
}

export async function upsertUserDoc(
    uid: string,
    data: Partial<WithFieldValue<UserDoc>>
) {
    await setDoc(userRef(uid), { ...data, updatedAt: serverTimestamp() } as any, { merge: true });
}


export async function ensureUserDoc() {
    const uid = auth.currentUser?.uid;
    const email = auth.currentUser?.email ?? undefined;
    if (!uid) return;

    const existing = await getUserDoc(uid);
    if (!existing) {
        await setDoc(userRef(uid), {
            role: "student",
            email,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        } as any, { merge: true });
    } else {
        await upsertUserDoc(uid, {}); // just touches updatedAt
    }
}
