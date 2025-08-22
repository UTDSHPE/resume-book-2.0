// lib/uploads.ts
import { auth, db, storage } from "./firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";

type UploadOpts = {
    path: string;
    file: File;
    onProgress?: (pct: number) => void;
    saveField?: { field: "profilePhotoUrl" | "resumeUrl" | string };
};

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

export function uploadProfilePhoto(file: File, onProgress?: (p: number) => void) {
    const uid = auth.currentUser?.uid!;
    const ext = file.type === "image/png" ? "png" : "jpg";
    return uploadToUserBucket({
        path: `users/${uid}/profile.${ext}`,
        file,
        onProgress,
        saveField: { field: "profilePhotoUrl" },
    });
}

export function uploadResume(file: File, onProgress?: (p: number) => void) {
    const uid = auth.currentUser?.uid!;
    return uploadToUserBucket({
        path: `users/${uid}/resume.pdf`,
        file,
        onProgress,
        saveField: { field: "resumeUrl" },
    });
}
