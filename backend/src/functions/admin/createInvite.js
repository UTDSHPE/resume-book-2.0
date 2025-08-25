// backend/src/functions/admin/createInvite.js
import crypto from 'crypto';
import { auth, db } from '../firebase.js';

/*Summary/Purpose of Tokens: The whole point of having the tokens is so that admins can generate
tokens that will be either for recruiter or admin accounts while when the students generate a code it's only
for themselves, just to simplify allocating roles pretty much

Functionality/Implementation: Whenever we generate a token it'll have an associated role and other data like 
when redeem access will expire and when use access will expire(Recruiter companies may only meet sponsorship requirements for 1 semester or 1 year)
so we delegate tokens on a timed basis for recruiters  */

export async function createInvite(event) {
    // 1) verify caller is admin
    const idToken = event.headers.Authorization?.replace('Bearer ', '');
    //When an ID token is used as a bearer token, it is included in the Authorization header of an HTTP request, typically in the format: Authorization: Bearer <ID_Token_String>
    //Authorization: Bearer < ID_Token_String >
    const decoded = await auth.verifyIdToken(idToken);//check w firebase that the token in payload is valid
    if (decoded.role !== 'admin') return { statusCode: 403, body: 'Forbidden' };//If they aren't an admin they cannot generate the tokens that will make you an admin or recruiter!

    // 2) input, these values are default if not explicitly included and defined w a value in the POST body   
    const { role, expiresInDays = 7, accessTermMonths = 6 } = JSON.parse(event.body || '{}');//This is expiry after initial invite
    if (!['recruiter', 'admin'].includes(role)) return { statusCode: 400, body: 'Bad role' };//Generate codes only for admin and recruiter roles, students can automatically generate a student code!
    //make sure generated code is either a recruiter or admin code

    // 3) generate code and hash it
    const code = crypto.randomBytes(32).toString('hex'); // 256-bit/32 byte code
    const codeHash = crypto.createHash('sha256').update(code).digest('hex');//hash it so we dont store it in plain text in firebase

    // 4) write to Firestore so we can verify validity of code when they try and redeem it
    const inviteRef = db.collection('admin').doc('roleInvites').collection('invites').doc();
    const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);
    await inviteRef.set({
        role,
        accessTermMonths,
        codeHash,
        createdBy: decoded.uid,
        createdAt: new Date(),
        expiresAt: new Date(),
        expiresAt: new Date(Date.now + expiresInDays),//DateTime for expiry
        used: false,//codes are single use per user
        usedBy: null,
    });

    // 5) return the raw code ONCE (never store it in plaintext)
    return {
        statusCode: 200,
        body: JSON.stringify({ code, role, expiresAt,accessInMonths }),
    };
}
