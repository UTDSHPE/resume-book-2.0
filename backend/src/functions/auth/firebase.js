// backend/src/functions/auth/firebase.js
import admin from "firebase-admin";

// Only initialize once per cold start
if (!admin.apps.length) {
    try {
        console.log("[FB] Initializing Firebase Admin…");

        // Parse FIREBASE_PRIVATE_KEY from env
        const serviceAccount = JSON.parse(process.env.FIREBASE_PRIVATE_KEY);

        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: serviceAccount.project_id,
                clientEmail: serviceAccount.client_email,
                privateKey: serviceAccount.private_key.replace(/\\n/g, "\n"), // fix newline issue
            }),
        });
    } catch (err) {
        console.error("[FB] Failed to initialize Firebase Admin:", err);
        throw err; // hard fail so you notice misconfig immediately
    }
} else {
    console.log("[FB] Reusing existing Firebase Admin app (warm start).");
}

// define these as constants so they’re never undefined
const auth = admin.auth();
const db = admin.firestore();

export { admin, auth, db };

// ---------- helpers ----------
export async function createCustomToken(uid, claims = {}) {
    return auth.createCustomToken(uid, claims);
}

export async function ensureAuthUser(
    uid,
    { email, displayName, photoURL } = {}
) {
    try {
        await auth.getUser(uid);
    } catch (err) {
        if (err.code === "auth/user-not-found") {
            await auth.createUser({ uid, email, displayName, photoURL });
        } else {
            throw err;
        }
    }
}

export async function upsertProfile(collection, uid, data) {
    const docRef = db.collection(collection).doc(uid);
    await docRef.set(
        {
            ...data,
            uid,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
    );
}

export async function getProfile(collection, uid) {
    const snap = await db.collection(collection).doc(uid);
    return snap.exists ? snap.data() : null;
}
