// backend/src/functions/admin/redeemInvite.js
import crypto from 'crypto';
import { auth, db } from '../firebase.js';

export async function redeemInvite(event) {
    const idToken = event.headers.Authorization?.replace('Bearer ', '');
    const decoded = await auth.verifyIdToken(idToken);//check that caller has a valid firebase ID token
    if (!decoded?.uid) return { statusCode: 401, body: 'Unauthorized' };

    const { code } = JSON.parse(event.body || '{}');
    if (!code) return { statusCode: 400, body: 'Missing code' };

    const codeHash = crypto.createHash('sha256').update(code).digest('hex');
    //code is stored hashed in DB, so we have to hash it again to crossreference it w the stored value

    // Look up invite by hash with a query
    const snap = await db
    .collection('admin')
    .doc('roleInvites')
    .collection('invites')
    .where('codeHash', '==', codeHash)
    .limit(1).get();
    if (snap.empty) return { statusCode: 400, body: 'Invalid code' };//If document cant be found by matching hash it doesnt exist in DB.
    // snap in this case is the invite document

    const doc = snap.docs[0];//firebase returns an array of the queried objects even if there's only one so this is just accessing the doc
    const invite = doc.data();//Get all the key value pairs of the doc

    if (invite.used) return { statusCode: 400, body: 'Code already used' };
    if (invite.expiresAt?.toDate?.() ? invite.expiresAt.toDate() < new Date() : invite.expiresAt < new Date())
        return { statusCode: 400, body: 'Code expired' };

    const uid = decoded.uid;//UID of user will be attached to the auth token 
    const role = invite.role;//Check what the role of the invite is so we can overwrite it if its higher

    // Set persistent custom claim
    const fbUser = await auth.getUser(uid);//get firebase auth user record for this uid
    const current = fbUser.customClaims || {};//customClaims are key value pairs that we attach, so in this case the custom claims are their role and when their access to roles expires.
    if (current.role !== role) {
        await auth.setCustomUserClaims(uid, { ...current, role });
        // we spread the current custom claims so that role only overwrites role, as when you pass a new value itll completely overwrite all of the current custom claims
        await auth.revokeRefreshTokens(uid); // next token refresh carries the new role
    }

    // Mark invite used
    await doc.ref.update({ used: true, usedBy: uid, usedAt: new Date() });

    // Mirror into /users for UI (optional)
    await db.doc(`users/${uid}`).set({ role, updatedAt: new Date() }, { merge: true });

    return { statusCode: 200, body: JSON.stringify({ role }) };
}
