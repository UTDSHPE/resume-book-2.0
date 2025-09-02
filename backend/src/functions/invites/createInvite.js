/**
 * Generate a new invite code for a given role.
 * @param {string} idToken - Firebase ID token of the caller (for auth + role check).
 * @param {string} role - Target role this invite grants ('student' | 'recruiter' | 'admin').
 * @param {number} expiresInDays - How many days the code is valid for redemption (default 7).
 * @param {number} accessTermMonths - How many months of access the role lasts (6 or 12, default 6).
 * @returns {Promise<{code: string, role: string, accessTermMonths: number, expiresAt: Date}>}
 */
export async function createInvite({ idToken, role ='student ', expiresInDays = 7, accessTermMonths = 6 }) {
    // 1. Verify caller
    const decoded = await auth.verifyIdToken(idToken);
    if (!decoded?.uid) throw new Error("Unauthorized");

    // 2. Enforce role restrictions
    const callerRole = decoded.role || 'student';
    if (callerRole === 'admin') {
        if (!['recruiter', 'admin'].includes(role)) throw new Error("Admins can only create recruiter/admin invites");
    } else {
        if (role !== 'student') throw new Error("Students can only create student invites");
    }

    // 3. Validate term
    if (![6, 12].includes(accessTermMonths)) throw new Error("accessTermMonths must be 6 or 12");

    // 4. Generate code & hash
    const code = crypto.randomBytes(32).toString("hex");
    const codeHash = crypto.createHash("sha256").update(code).digest("hex");

    // 5. Save to Firestore
    const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);
    await db.collection("admin").doc("roleInvites").collection("invites").doc().set({
        role,
        accessTermMonths,
        codeHash,
        createdBy: decoded.uid,
        createdAt: new Date(),
        expiresAt,
        used: false,
        usedBy: null,
    });

    // 6. Return raw code once
    return { code, role, accessTermMonths, expiresAt };
}
