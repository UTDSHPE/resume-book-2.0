import admin from 'firebase-admin';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { auth, db, createCustomToken, ensureAuthUser, upsertProfile } from './firebase.js';

const {
    LINKEDIN_CLIENT_SECRET,
    LINKEDIN_CLIENT_ID,
    LINKEDIN_REDIRECT_URI,
    FIREBASE_PRIVATE_KEY,
    FRONTEND_REDIRECT_URI,
} = process.env;
//bleh
//for getting LinkedIn Public Key for verification
const client = jwksClient({
    jwksUri: 'https://www.linkedin.com/oauth/openid/jwks',
    cache: true,
    cacheMaxEntries: 5,
    cacheMaxAge: 10 * 60 * 1000, // 10 minutes
});

// Helper to get signing key
function getKey(header, callback) {
    client.getSigningKey(header.kid, (err, key) => {
        if (err) return callback(err);
        callback(null, key.getPublicKey());
    });
}

const verified = await new Promise((resolve, reject) => {
    jwt.verify(
        id_token,
        getKey,
        {
            algorithms: ['RS256'],
            issuer: 'https://www.linkedin.com',   // LinkedIn OIDC issuer
            audience: LINKEDIN_CLIENT_ID,         // app’s client_id
        },
        (err, payload) => (err ? reject(err) : resolve(payload))
    );
});//verify token is from linkedin using the public key

//  Firebase Admin init
try {
    const svc = JSON.parse(FIREBASE_PRIVATE_KEY);
    if (!admin.apps.length) {
        console.log('[LI] Init Firebase Admin for LinkedIn auth…');
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: svc.project_id,
                clientEmail: svc.client_email,
                privateKey: svc.private_key.replace(/\\n/g, '\n'),
            }),
        });
    }
} catch (e) {
    console.error('[LI] Firebase Admin init failed:', e);
    throw e;
}
const auth = admin.auth();
const db = admin.firestore();

// ---------- helpers ----------
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

// fetch helper
async function postForm(url, params) {
    const body = new URLSearchParams(params).toString();
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
    });
    if (!res.ok) {
        const text = await res.text();
        console.error('[LI] postForm error', { url, status: res.status, text });
        throw new Error(`POST ${url} failed: ${res.status} ${text}`);
    }
    return res.json();
}

// ---------- 1) Build redirect URL & state cookie ----------
export const linkedInRedirectURL = async () => {
    const state = generateState();
    const params = new URLSearchParams({
        response_type: 'code',
        client_id: LINKEDIN_CLIENT_ID,
        redirect_uri: LINKEDIN_REDIRECT_URI,
        state,
        scope: 'openid profile email', // <-- OIDC scopes only
    });

    const url = `https://www.linkedin.com/oauth/v2/authorization?${params}`;

    console.log('[LI] Redirecting to LinkedIn auth', {
        redirect_uri: LINKEDIN_REDIRECT_URI,
        state,
    });

    return {
        statusCode: 302,
        headers: {
            Location: url,
            'Set-Cookie': `li_oauth_state=${state}; Path=/; HttpOnly; Secure; Max-Age=600; SameSite=Lax`,
            'Content-Type': 'text/plain',
        },
        body: '',
    };
};

// ---------- 2) Callback handler ----------
export const handleLinkedInCallback = async (event) => {
    console.log('[LI] Callback hit.');
    try {
        const headers = event.headers || {};
        const cookieHeader = headers.cookie || headers.Cookie || '';
        const cookies = parseCookies(cookieHeader);
        const cookieState = cookies['li_oauth_state'] || null;

        const { code, state } = event.queryStringParameters || {};
        console.log('[LI] Query received', { hasCode: !!code, hasState: !!state, hasCookieState: !!cookieState });

        if (!code || !state || !cookieState || state !== cookieState) {
            console.warn('[LI] State/Code invalid', { codePresent: !!code, state, cookieState });
            return { statusCode: 400, body: 'Invalid or missing state/code' };
        }
        const clearStateCookie = clearCookie('li_oauth_state');
        console.log('[LI] State OK. Exchanging code for token…');

        // Exchange code for access & ID token
        const tokenData = await postForm('https://www.linkedin.com/oauth/v2/accessToken', {
            grant_type: 'authorization_code',
            code,
            client_id: LINKEDIN_CLIENT_ID,
            client_secret: LINKEDIN_CLIENT_SECRET,
            redirect_uri: LINKEDIN_REDIRECT_URI,
        });

        const { access_token, id_token } = tokenData;
        console.log('[LI] Token OK:', { hasAccess: !!access_token, hasId: !!id_token });

        if (!id_token) {
            console.error('[LI] No id_token returned:', tokenData);
            return { statusCode: 500, body: 'Missing id_token from LinkedIn' };
        }

        // Decode and verify ID token
        const decoded = jwt.decode(id_token);
        // For production: verify signature using LinkedIn JWKS
        const linkedinId = decoded.sub;
        const email = decoded.email || null;
        const firstName = decoded.given_name || null;
        const lastName = decoded.family_name || null;
        const fullName = decoded.name || [firstName, lastName].filter(Boolean).join(' ');

        console.log('[LI] Decoded ID token', { linkedinId, email, fullName });

        // Ensure Firebase Auth user exists
        try {
            await auth.getUser(linkedinId);
        } catch (e) {
            if (e.code === 'auth/user-not-found') {
                await auth.createUser({
                    uid: linkedinId,
                    email: email || undefined,
                    displayName: fullName || undefined,
                });
            } else {
                throw e;
            }
        }

        // Insert/update Firestore profile
        await db.collection('students').doc(linkedinId).set(
            {
                uid: linkedinId,
                firstName,
                lastName,
                email,
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

        console.log('[LI] Redirecting back to frontend with token…');

        const redirectUrl = `${FRONTEND_REDIRECT_URI}?token=${encodeURIComponent(customToken)}`;

        return {
            statusCode: 302,
            headers: {
                'Location': redirectUrl,
                'Set-Cookie': clearStateCookie,
            },
        };
    } catch (error) {
        console.error('[LI] Callback failed:', error);
        return { statusCode: 500, body: 'Internal Server Error' };
    }
};
