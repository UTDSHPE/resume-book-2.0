// src/functions/auth/linkedin.js
const admin = require('firebase-admin');
const crypto = require('crypto');

const {
    LINKEDIN_CLIENT_SECRET,
    LINKEDIN_CLIENT_ID,
    LINKEDIN_REDIRECT_URI,
    FIREBASE_PRIVATE_KEY, // entire service account JSON string
} = process.env;

// ----- Firebase Admin (init once per cold start) -----
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
const db = admin.firestore();

// ----- Helpers -----
function generateState() {
    return crypto.randomBytes(16).toString('hex');
}
function parseCookies(header = '') {
    return Object.fromEntries(
        header
            .split(';')
            .map(v => v.trim())
            .filter(Boolean)
            .map(kv => {
                const idx = kv.indexOf('=');
                return idx === -1 ? [kv, ''] : [kv.slice(0, idx), decodeURIComponent(kv.slice(1 + idx))];
            })
    );
}
function setCookie(
    name,
    value,
    { maxAge = 600, path = '/', secure = true, httpOnly = true, sameSite = 'Lax' } = {}
) {
    const parts = [`${name}=${encodeURIComponent(value)}`, `Path=${path}`, `Max-Age=${maxAge}`];
    if (secure) parts.push('Secure');
    if (httpOnly) parts.push('HttpOnly');
    if (sameSite) parts.push(`SameSite=${sameSite}`);
    return parts.join('; ');
}
function clearCookie(name) {
    return `${name}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`;
}

// fetch helpers
async function postForm(url, params) {
    const body = new URLSearchParams(params).toString();
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`POST ${url} failed: ${res.status} ${text}`);
    }
    return res.json();
}
async function getJson(url, accessToken) {
    const res = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`GET ${url} failed: ${res.status} ${text}`);
    }
    return res.json();
}

//  Redirect to LinkedIn (sets state cookie)
// NOTE: Your handler currently expects a *URL string* (not a full response).
// If so, use the STRING version below and set headers in the handler.
// If you prefer this function to return the whole 302 response, keep as-is.
exports.linkedInRedirectURL = () => {
    const state = generateState();
    const params = new URLSearchParams({
        response_type: 'code',
        client_id: LINKEDIN_CLIENT_ID,
        redirect_uri: LINKEDIN_REDIRECT_URI,
        state,
        scope: 'r_liteprofile r_emailaddress',
    });
    // Return ONLY the URL string (so it matches your handler’s usage)
    // and let the handler set the Set-Cookie header.
    return {
        url: `https://www.linkedin.com/oauth/v2/authorization?${params}`,
        stateCookie: setCookie('li_oauth_state', state, { maxAge: 600 }),
    };
};

//  Callback: verify state, exchange code, create token
exports.handleLinkedInCallback = async (event) => {
    try {
        const headers = event.headers || {};
        const cookieHeader = headers.cookie || headers.Cookie || '';
        const cookies = parseCookies(cookieHeader);
        const cookieState = cookies['li_oauth_state'] || null;

        const { code, state } = event.queryStringParameters || {};
        if (!code || !state || !cookieState || state !== cookieState) {
            return { statusCode: 400, body: 'Invalid or missing state/code' };
        }

        // clear the state cookie
        const clearStateCookie = clearCookie('li_oauth_state');

        //  Exchange code for access token
        const tokenData = await postForm('https://www.linkedin.com/oauth/v2/accessToken', {
            grant_type: 'authorization_code',
            code,
            client_id: LINKEDIN_CLIENT_ID,
            client_secret: LINKEDIN_CLIENT_SECRET,
            redirect_uri: LINKEDIN_REDIRECT_URI, // must match exactly
        });
        const accessToken = tokenData.access_token;

        // Fetch profile
        const me = await getJson(
            'https://api.linkedin.com/v2/me?projection=(id,localizedFirstName,localizedLastName,profilePicture(displayImage~:playableStreams))',
            accessToken
        );
        const linkedinId = me.id;
        const firstName = me.localizedFirstName || null;
        const lastName = me.localizedLastName || null;
        const photoElems = me.profilePicture?.['displayImage~']?.elements || [];
        const profilePhoto = photoElems.length
            ? photoElems[photoElems.length - 1]?.identifiers?.[0]?.identifier || null
            : null;

        // Fetch email
        const emailObj = await getJson(
            'https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))',
            accessToken
        );
        const email = emailObj?.elements?.[0]?.['handle~']?.emailAddress || null;

        //  Ensure Firebase Auth user
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

        // Insert Firestore profile
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

        // Create Firebase custom token
        const customToken = await auth.createCustomToken(linkedinId, {
            provider: 'linkedin',
            emailVerified: !!email,
        });

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Set-Cookie': clearStateCookie,
            },
            body: JSON.stringify({
                customToken,
                profile: { uid: linkedinId, firstName, lastName, email, profilePhoto },
            }),
        };
    } catch (error) {
        console.error(error);
        return { statusCode: 500, body: 'Internal Server Error' };
    }
};
