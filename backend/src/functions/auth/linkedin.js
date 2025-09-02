// linkedin.mjs
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { auth, createCustomToken, ensureAuthUser, upsertProfile } from './firebase.js';

const {
    LINKEDIN_CLIENT_SECRET,
    LINKEDIN_CLIENT_ID,
    LINKEDIN_REDIRECT_URI,
    FRONTEND_REDIRECT_URI,
} = process.env;

// LinkedIn JWKS client
const client = jwksClient({
    jwksUri: 'https://www.linkedin.com/oauth/openid/jwks',
    cache: true,
    cacheMaxEntries: 5,
    cacheMaxAge: 10 * 60 * 1000,
});

function getKey(header, callback) {
    client.getSigningKey(header.kid, (err, key) => {
        if (err) return callback(err);
        callback(null, key.getPublicKey());
    });
}

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
                return idx === -1
                    ? [kv, '']
                    : [kv.slice(0, idx), decodeURIComponent(kv.slice(1 + idx))];
            })
    );
}
function clearCookie(name) {
    return `${name}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`;
}
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

// ---------- 1) Redirect ----------
export const linkedInRedirectURL = async () => {
    const state = generateState();//generate state prior to request so we ensure the request info goes back to same user
    const params = new URLSearchParams({//will automatically insert necessary chars to make these valid params for request
        response_type: 'code',
        client_id: LINKEDIN_CLIENT_ID,
        redirect_uri: LINKEDIN_REDIRECT_URI,
        state,
        scope: 'openid profile email',
    });

    const url = `https://www.linkedin.com/oauth/v2/authorization?${params}`;
    console.log('[LI] Redirecting to LinkedIn auth', { redirect_uri: LINKEDIN_REDIRECT_URI, state });

    return {
        statusCode: 302,
        headers: {
            Location: url,
            'Set-Cookie': `li_oauth_state=${state}; Path=/; HttpOnly; Secure; Max-Age=600; SameSite=Lax`,//valid for 10 minutes
        },
        body: '',
    };
};

// ---------- 2) Callback ----------
export const handleLinkedInCallback = async (event) => {
    try {
        const headers = event.headers || {};
        const cookies = parseCookies(headers.cookie || headers.Cookie || '');
        const cookieState = cookies['li_oauth_state'] || null;

        const { code, state } = event.queryStringParameters || {};
        if (!code || !state || !cookieState || state !== cookieState) {
            return { statusCode: 400, body: 'Invalid or missing state/code' };
        }
        const clearStateCookie = clearCookie('li_oauth_state');

        // Exchange code for access & ID token
        const tokenData = await postForm('https://www.linkedin.com/oauth/v2/accessToken', {
            grant_type: 'authorization_code',
            code,
            client_id: LINKEDIN_CLIENT_ID,
            client_secret: LINKEDIN_CLIENT_SECRET,
            redirect_uri: LINKEDIN_REDIRECT_URI,
        });

        const { access_token, id_token } = tokenData;
        if (!id_token) return { statusCode: 500, body: 'Missing id_token from LinkedIn' };

        // Decode (verify with JWKS if needed)
        const decoded = jwt.decode(id_token);
        const linkedinId = decoded.sub;
        const email = decoded.email || null;
        const firstName = decoded.given_name || null;
        const lastName = decoded.family_name || null;
        const fullName = decoded.name || [firstName, lastName].filter(Boolean).join(' ');

        // Ensure Firebase Auth user exists
        await ensureAuthUser(linkedinId, {
            email: email || undefined,
            displayName: fullName || undefined,
        });

        // Upsert Firestore profile
        await upsertProfile('users', linkedinId, {
            firstName,
            lastName,
            email,
            provider: 'linkedin',
            linkedinId,
        });

        // Create Firebase custom token
        const customToken = await createCustomToken(linkedinId, {
            provider: 'linkedin',
            emailVerified: !!email,
        });

        const redirectUrl = `${FRONTEND_REDIRECT_URI}?token=${encodeURIComponent(customToken)}`;
        return {
            statusCode: 302,
            headers: { Location: redirectUrl, 'Set-Cookie': clearStateCookie },
        };
    } catch (err) {
        console.error('[LI] Callback failed:', err);
        return { statusCode: 500, body: 'Internal Server Error' };
    }
};
