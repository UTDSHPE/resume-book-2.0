const admin = require('firebase-admin');
const crypto = require('crypto');

const {
    LINKEDIN_CLIENT_SECRET,
    LINKEDIN_CLIENT_ID,
    LINKEDIN_REDIRECT_URI,
    FIREBASE_PRIVATE_KEY,
    FRONTEND_REDIRECT_URL, // optional if you redirect later
} = process.env;

// Initialize Admin here (you can also import from shared/firebase if you prefer)
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
        console.error('[LI] postForm error', { url, status: res.status, text });
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
        console.error('[LI] getJson error', { url, status: res.status, text });
        throw new Error(`GET ${url} failed: ${res.status} ${text}`);
    }
    return res.json();
}

// ---------- 1) Build redirect URL & state cookie ----------
exports.linkedInRedirectURL = () => {
    const state = generateState();
    const params = new URLSearchParams({
        response_type: 'code',
        client_id: LINKEDIN_CLIENT_ID,
        redirect_uri: LINKEDIN_REDIRECT_URI,
        state,
        scope: 'r_liteprofile r_emailaddress',
    });

    const url = `https://www.linkedin.com/oauth/v2/authorization?${params}`;
    console.log('[LI] Redirecting to LinkedIn auth', { redirect_uri: LINKEDIN_REDIRECT_URI, state });
    return {
        url,
        stateCookie: setCookie('li_oauth_state', state, { maxAge: 600 }),
    };
};

// ---------- 2) Callback handler ----------
exports.handleLinkedInCallback = async (event) => {
    console.log('[LI] Callback hit.');
    try {
        const headers = event.headers || {};
        const cookieHeader = headers.cookie || headers.Cookie || '';
        const cookies = parseCookies(cookieHeader);
        const cookieState = cookies['li_oauth_state'] || null;

        const { code, state, format } = event.queryStringParameters || {};
        console.log('[LI] Query received', { hasCode: !!code, hasState: !!state, hasCookieState: !!cookieState });

        if (!code || !state || !cookieState || state !== cookieState) {
            console.warn('[LI] State/Code invalid', { codePresent: !!code, state, cookieState });
            return { statusCode: 400, body: 'Invalid or missing state/code' };
        }
        const clearStateCookie = clearCookie('li_oauth_state');
        console.log('[LI] State OK. Exchanging code for token…');

        const tokenData = await postForm('https://www.linkedin.com/oauth/v2/accessToken', {
            grant_type: 'authorization_code',
            code,
            client_id: LINKEDIN_CLIENT_ID,
            client_secret: LINKEDIN_CLIENT_SECRET,
            redirect_uri: LINKEDIN_REDIRECT_URI,
        });
        const accessToken = tokenData.access_token;
        console.log('[LI] Token OK:', !!accessToken);

        console.log('[LI] Fetching LinkedIn profile…');
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
        console.log('[LI] Profile OK:', { linkedinId, firstName, lastName, hasPhoto: !!profilePhoto });

        console.log('[LI] Fetching email…');
        const emailObj = await getJson(
            'https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))',
            accessToken
        );
        const email = emailObj?.elements?.[0]?.['handle~']?.emailAddress || null;
        console.log('[LI] Email OK:', !!email);

        console.log('[LI] Ensuring Firebase Auth user…');
        try {
            await auth.getUser(linkedinId);
            console.log('[LI] Auth user exists:', linkedinId);
        } catch (e) {
            if (e.code === 'auth/user-not-found') {
                console.log('[LI] Creating Auth user…');
                await auth.createUser({
                    uid: linkedinId,
                    email: email || undefined,
                    displayName: [firstName, lastName].filter(Boolean).join(' ') || undefined,
                    photoURL: profilePhoto || undefined,
                });
                console.log('[LI] Auth user created:', linkedinId);
            } else {
                console.error('[LI] getUser error:', e);
                throw e;
            }
        }

        console.log('[LI] Upserting Firestore profile…');
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
        console.log('[LI] Firestore write OK');

        console.log('[LI] Creating Firebase custom token…');
        const customToken = await auth.createCustomToken(linkedinId, {
            provider: 'linkedin',
            emailVerified: !!email,
        });
        console.log('[LI] Custom token created. Length:', customToken?.length);

        // Debug JSON mode to avoid blank page while testing
        if (format === 'json') {
            console.log('[LI] Returning JSON (debug mode).');
            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json', 'Set-Cookie': clearStateCookie },
                body: JSON.stringify({
                    ok: true,
                    customToken,
                    profile: { uid: linkedinId, firstName, lastName, email, profilePhoto },
                }),
            };
        }

        // Default: return JSON (you can switch to a 302 redirect to FRONTEND_REDIRECT_URL when ready)
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json', 'Set-Cookie': clearStateCookie },
            body: JSON.stringify({
                customToken,
                profile: { uid: linkedinId, firstName, lastName, email, profilePhoto },
            }),
        };
    } catch (error) {
        console.error('[LI] Callback failed:', error);
        return { statusCode: 500, body: 'Internal Server Error' };
    }
};
