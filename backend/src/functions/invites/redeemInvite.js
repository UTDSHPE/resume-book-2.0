// backend/src/functions/invites/redeemInvite.js
import crypto from 'crypto';
import { auth, db } from '../auth/firebase.js';

/* 
Summary / Purpose of Redeem Function:
The purpose of `redeemInvite` is to allow a signed-in Firebase user to redeem an 
invite code and receive an upgraded role (e.g., student → recruiter/admin).  

Process:
  1. Validate the caller's Firebase ID token (proves who they are).
  2. Parse the invite code from the request body.
  3. Hash the raw code and look up the matching invite in Firestore.
  4. Validate that the invite exists, is not used, and is not expired.
  5. Update the user's custom claims with the new role (persistent).
  6. Mark the invite document as used (single-use enforcement).
  7. Mirror the role assignment in `/users/{uid}` for UI convenience.
  8. Return the upgraded role to the caller.

Security Considerations:
- Only hashed codes are stored in Firestore; raw code is never saved.
- Custom claims are merged (`...current`) to avoid wiping out other claims.
- Tokens are revoked so that role change is enforced immediately on next refresh.
- Firestore Security Rules should enforce access by role.
*/

/**
 * Redeem an invite code and assign a role to the user.
 * @param {Object} params - parameters for redeeming the invite
 * @param {string} params.idToken - Firebase ID token of the caller (proves identity)
 * @param {string} params.code - raw invite code string provided by the user
 * @returns {Promise<{ role: string }>} - the role assigned to the user
 */
export async function redeemInvite({ idToken, code }) {
    // 1) Verify caller's ID token (ensures request is from a valid signed-in user)
    const decoded = await auth.verifyIdToken(idToken);
    if (!decoded?.uid) {
        throw new Error('Unauthorized: invalid or missing Firebase ID token');
    }

    // 2) Validate input: must have a raw code
    if (!code) {
        throw new Error('Missing invite code');
    }

    // 3) Hash the raw code so it can be compared against stored hashes in Firestore
    const codeHash = crypto.createHash('sha256').update(code).digest('hex');

    // 4) Look up invite by its hashed code
    const snap = await db
        .collection('admin')
        .doc('roleInvites')
        .collection('invites')
        .where('codeHash', '==', codeHash)
        .limit(1)
        .get();

    if (snap.empty) {
        throw new Error('Invalid code: no matching invite found');
    }

    const doc = snap.docs[0];       // Firestore query always returns an array, even with .limit(1)
    const invite = doc.data();      // Extract all fields from the invite document

    // 5) Validate invite status
    if (invite.used) {
        throw new Error('Code already used');
    }
    const now = new Date();
    const expiry = invite.expiresAt?.toDate?.()
        ? invite.expiresAt.toDate()   // Firestore Timestamp objects use .toDate()
        : new Date(invite.expiresAt); // fallback if plain Date is stored
    if (expiry < now) {
        throw new Error('Code expired');
    }

    // 6) Apply role to the user via custom claims
    const uid = decoded.uid;               // Firebase user ID from the ID token
    const role = invite.role;              // Target role stored on the invite
    const fbUser = await auth.getUser(uid); // Get full user record from Firebase Auth
    const current = fbUser.customClaims || {}; // Preserve existing claims

    if (current.role !== role) {
        // Merge role into current claims so we don't overwrite other values (like roleExp, flags, etc.)
        await auth.setCustomUserClaims(uid, { ...current, role });
        // Force refresh so new role appears in the user's next ID token
        await auth.revokeRefreshTokens(uid);
    }

    // 7) Mark invite as used (single-use enforcement)
    await doc.ref.update({
        used: true,
        usedBy: uid,
        usedAt: now,
    });

    // 8) Mirror into /users collection for UI convenience (e.g., profile display)
    await db.doc(`users/${uid}`).set(
        { role, updatedAt: now },
        { merge: true } // merge = don't overwrite other profile fields
    );

    // 9) Return role back to caller (useful for frontend routing/UX)
    return { role };
}
