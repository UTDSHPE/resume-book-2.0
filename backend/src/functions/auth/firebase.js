const admin = require('firebase-admin');

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
} catch (e) {
    console.error('[FB] Failed to initialize Firebase Admin:', e);
    throw e;
}

const auth = admin.auth();
const db = admin.firestore();
console.log('[FB] Firestore + Auth ready.');

async function createCustomToken(uid, claims = {}) {
    console.log('[FB] createCustomToken for uid:', uid);
    return auth.createCustomToken(uid, claims);
}

async function ensureAuthUser(uid, { email, displayName, photoURL } = {}) {
    console.log('[FB] ensureAuthUser for uid:', uid);
    try {
        await auth.getUser(uid);
        console.log('[FB] Auth user exists:', uid);
    } catch (err) {
        if (err.code === 'auth/user-not-found') {
            console.log('[FB] Creating Auth user:', { uid, email, displayName, photoURL });
            await auth.createUser({ uid, email, displayName, photoURL });
        } else {
            console.error('[FB] getUser failed:', err);
            throw err;
        }
    }
}

async function upsertProfile(collection, uid, data) {
    console.log('[FB] upsertProfile', { collection, uid });
    const docRef = db.collection(collection).doc(uid);
    await docRef.set(
        {
            ...data,
            uid,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
    );
    console.log('[FB] upsertProfile OK:', { collection, uid });
}

async function getProfile(collection, uid) {
    console.log('[FB] getProfile', { collection, uid });
    const snap = await db.collection(collection).doc(uid).get();
    return snap.exists ? snap.data() : null;
}

module.exports = {
    admin,
    auth,
    db,
    createCustomToken,
    ensureAuthUser,
    upsertProfile,
    getProfile,
};
