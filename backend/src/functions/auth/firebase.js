// firebase.mjs
import admin from 'firebase-admin';

let auth, db;

try {
    console.log('[FB] Parsing FIREBASE_PRIVATE_KEY JSON…');
    const serviceAccount = JSON.parse(process.env.FIREBASE_PRIVATE_KEY);

    if (!admin.apps.length) {
        console.log('[FB] Initializing Firebase Admin…', {
            projectId: serviceAccount.project_id,
            clientEmail: serviceAccount.client_email,
        });
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: serviceAccount.project_id,
                clientEmail: serviceAccount.client_email,
                privateKey: serviceAccount.private_key.replace(/\\n/g, '\n'),
            }),
        });
    } else {
        console.log('[FB] Reusing existing Firebase Admin app (warm start).');
    }
    auth = admin.auth();
    db = admin.firestore();
} catch (e) {
    console.error('[FB] Failed to initialize Firebase Admin:', e);
    throw e;
}

export { admin, auth, db };

export async function createCustomToken(uid, claims = {}) {
    return auth.createCustomToken(uid, claims);
}

export async function ensureAuthUser(uid, { email, displayName, photoURL } = {}) {
    try {
        await auth.getUser(uid);
    } catch (err) {
        if (err.code === 'auth/user-not-found') {
            await auth.createUser({ uid, email, displayName, photoURL });
        } else throw err;
    }
}

export async function upsertProfile(collection, uid, data) {
    const docRef = db.collection(collection).doc(uid);
    await docRef.set(
        { ...data, uid, updatedAt: admin.firestore.FieldValue.serverTimestamp() },
        { merge: true }
    );
}

export async function getProfile(collection, uid) {
    const snap = await db.collection(collection).doc(uid).get();
    return snap.exists ? snap.data() : null;
}
