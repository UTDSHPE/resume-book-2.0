// lib/uploads.ts
import { auth, db, storage } from "./firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";

type UploadOpts = {
    path: string;
    file: File;
    onProgress?: (pct: number) => void;
    saveField?: { field: "profilePhotoUrl" | "resumeUrl" | string };
};

/**
 * Generic uploader for user files into Firebase Storage.
 * - Streams the file to Storage
 * - Tracks progress (optional callback)
 * - Writes Firestore doc field if saveField is provided
 */
export async function uploadToUserBucket({ path, file, onProgress, saveField }: UploadOpts) {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error("Not signed in");

    const storageRef = ref(storage, path);
    const task = uploadBytesResumable(storageRef, file);

    await new Promise<void>((resolve, reject) => {
        task.on(
            "state_changed",
            (snap) => {
                const pct = (snap.bytesTransferred / snap.totalBytes) * 100;
                onProgress?.(pct);
            },
            reject,
            () => resolve()
        );
    });

    const url = await getDownloadURL(task.snapshot.ref);

    if (saveField) {
        await setDoc(doc(db, "users", uid), { [saveField.field]: url }, { merge: true });
    }

    return url;
}

/**
 * Uploads a profile photo and updates the user's built-in Firebase Auth photoURL.
 * Also mirrors it into Firestore's /users/{uid}/profilePhotoUrl for consistency.
 */
export async function uploadProfilePhoto(file: File, onProgress?: (p: number) => void) {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error("User not signed in");

    const ext = file.type === "image/png" ? "png" : "jpg";
    const path = `users/${uid}/profile.${ext}`;
    const storageRef = ref(storage, path);

    const task = uploadBytesResumable(storageRef, file);
    task.on("state_changed", (snap) => {
        if (onProgress) {
            const percent = (snap.bytesTransferred / snap.totalBytes) * 100;
            onProgress(percent);
        }
    });

    await task;

    const downloadUrl = await getDownloadURL(storageRef);

    // ✅ Update built-in Firebase Auth profile field
    if (!auth.currentUser) throw new Error("No user is logged in");
    await updateProfile(auth.currentUser, { photoURL: downloadUrl });

    // ✅ Also mirror to Firestore (optional, but handy for backend / queries)
    await setDoc(doc(db, "users", uid), { profilePhotoUrl: downloadUrl }, { merge: true });

    return downloadUrl;
}

/**
 * Uploads a resume PDF and saves URL in Firestore.
 */
export function uploadResume(file: File, onProgress?: (p: number) => void) {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error("Not signed in");

    return uploadToUserBucket({
        path: `users/${uid}/resume.pdf`,
        file,
        onProgress,
        saveField: { field: "resumeUrl" },
    });
}
