// src/functions/shared/firebase.js
const admin = require('firebase-admin');
//private_key has pretty much all the credentials needed for using firebase
//Located in the shpe gmail bitwarden account!
const serviceAccount = JSON.parse(process.env.FIREBASE_PRIVATE_KEY);

// Initialize once per cold start
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: serviceAccount.project_id,
            clientEmail: serviceAccount.client_email,
            privateKey: serviceAccount.private_key.replace(/\\n/g, '\n'),
        }),
    });
}
//
const auth = admin.auth();
const db = admin.firestore();

/** Create a Firebase custom token for client sign in */
async function createCustomToken(uid, claims = {}) {
    return auth.createCustomToken(uid, claims);
}

/** Ensure a Firebase Auth user exists (optional but handy) */
async function ensureAuthUser(uid, { email, displayName, photoURL } = {}) {
    try {
        // Will throw if not found
        await auth.getUser(uid);
    } catch (err) {
        if (err.code === 'auth/user-not-found') {
            await auth.createUser({ uid, email, displayName, photoURL });
        } else {
            throw err;
        }
    }
}

/**
 * Update or insert a profile document into Firestore
 * @param {'students'|'recruiters'|'users'} collection
 * @param {string} uid
 * @param {object} data
 */
async function upsertProfile(collection, uid, data) {
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
}

/** Fetch a profile (useful for debugging) */
async function getProfile(collection, uid) {
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
