// lib/admin.ts
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

export type Role = "student" | "recruiter" | "admin";

export async function setUserRole(uid: string, role: Role) {
    await setDoc(doc(db, "users", uid), { role }, { merge: true });
}