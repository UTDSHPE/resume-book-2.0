// src/functions/auth/linkedin.js
const admin = require('firebase-admin');
const crypto = require('crypto');
const axios = require('axios');

const {
    LINKEDIN_CLIENT_SECRET,
    LINKEDIN_CLIENT_ID,
    LINKEDIN_REDIRECT_URI,
    FIREBASE_PRIVATE_KEY, // entire service account JSON string
} = process.env;
//
//Firebase Admin (init once per cold start) 
const serviceAccount = JSON.parse(FIREBASE_PRIVATE_KEY);
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: serviceAccount.project_id,
            clientEmail: serviceAccount.client_email,
            privateKey: serviceAccount.private_key.replace(/\\n/g, '\n'),
        }),
    });
}
const auth = admin.auth();
const db = admin.firestore();//db connection

// Helpers 
function generateState() {
    return crypto.randomBytes(16).toString('hex');
}
function parseCookies(header = '') {
    // works for both 'Cookie' and 'cookie'
    return Object.fromEntries(
        header.split(';').map(v => v.trim()).filter(Boolean).map(kv => {
            const idx = kv.indexOf('=');
            return idx === -1 ? [kv, ''] : [kv.slice(0, idx), decodeURIComponent(kv.slice(idx + 1))];
        })
    );
}
function setCookie(name, value, { maxAge = 600, path = '/', secure = true, httpOnly = true, sameSite = 'Lax' } = {}) {
    const parts = [`${name}=${encodeURIComponent(value)}`, `Path=${path}`, `Max-Age=${maxAge}`];
    if (secure) parts.push('Secure');
    if (httpOnly) parts.push('HttpOnly');
    if (sameSite) parts.push(`SameSite=${sameSite}`);
    return parts.join('; ');
}
function clearCookie(name) {
    return `${name}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`;
}

// ---------- 1) Redirect to LinkedIn (sets state cookie) ----------
exports.linkedInRedirectURL = async () => {
    const state = generateState(); // random nonce
    const params = new URLSearchParams({
        response_type: 'code',
        client_id: LINKEDIN_CLIENT_ID,
        redirect_uri: LINKEDIN_REDIRECT_URI,
        state,
        scope: 'r_liteprofile r_emailaddress',
    });

    return {
        statusCode: 302,
        headers: {
            Location: `https://www.linkedin.com/oauth/v2/authorization?${params}`,
            // 10‑minute HttpOnly cookie storing the state, use it to verify users identity during login process
            'Set-Cookie': setCookie('li_oauth_state', state, { maxAge: 600 }),
        },
        body: '',
    };
};

//  2) Callback: verify state from cookie, then finish login 
exports.handleLinkedInCallback = async (event) => {
    // API Gateway v1/v2 both: prefer lower-case, fallback to capitalized
    const headers = event.headers || {};
    const cookieHeader = headers.cookie || headers.Cookie || '';
    const cookies = parseCookies(cookieHeader);
    const cookieState = cookies['li_oauth_state'] || null;

    const { code, state } = (event.queryStringParameters || {});
    if (!code || !state || !cookieState || state !== cookieState) {
        return { statusCode: 400, body: 'Invalid or missing state/code' };
    }

    // one-time: clear cookie after user authenticates with linkedin
    const clearStateCookie = clearCookie('li_oauth_state');

    // Exchange code for access token to their profile info
    const tokenResp = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', null, {
        params: {
            grant_type: 'authorization_code',
            code,
            client_id: LINKEDIN_CLIENT_ID,
            client_secret: LINKEDIN_CLIENT_SECRET,
            redirect_uri: LINKEDIN_REDIRECT_URI, // must exactly match
        },
    });
    const accessToken = tokenResp.data.access_token;

    // 2) Fetch name & photo
    const meResp = await axios.get(
        'https://api.linkedin.com/v2/me?projection=(id,localizedFirstName,localizedLastName,profilePicture(displayImage~:playableStreams))',
        { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const linkedinId = meResp.data.id;
    const firstName = meResp.data.localizedFirstName || null;
    const lastName = meResp.data.localizedLastName || null;
    const photoElems = meResp.data.profilePicture?.['displayImage~']?.elements || [];
    const profilePhoto = photoElems.length
        ? photoElems[photoElems.length - 1]?.identifiers?.[0]?.identifier || null
        : null;

    // 3) Fetch email
    const emailResp = await axios.get(
        'https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))',
        { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const email = emailResp.data.elements?.[0]?.['handle~']?.emailAddress || null;

    // 4) (Optional) ensure an Auth user exists
    try {
        await auth.getUser(linkedinId);
    } catch (e) {
        if (e.code === 'auth/user-not-found') {
            await auth.createUser({
                uid: linkedinId,
                email: email || undefined,
                displayName: [firstName, lastName].filter(Boolean).join(' ') || undefined,
                photoURL: profilePhoto || undefined,
            });
        } else {
            throw e;
        }
    }

    // Insert Firestore student profile
    await db.collection('students').doc(linkedinId).set(
        {
            uid: linkedinId,
            firstName,
            lastName,
            email: email || null,
            profilePhoto: profilePhoto || null,
            provider: 'linkedin',
            linkedinId,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
    );

    // Create custom token using their linkedin id
    const customToken = await auth.createCustomToken(linkedinId, {
        provider: 'linkedin',
        emailVerified: !!email,
    });

    // Return JSON (or redirect to your frontend and pass token in a fragment)
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
            'Set-Cookie': clearStateCookie, // clear it now that we used it
        },
        body: JSON.stringify({
            customToken,
            profile: { uid: linkedinId, firstName, lastName, email, profilePhoto },
        }),
    };
};
