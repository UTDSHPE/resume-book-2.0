/**
 * LinkedIn OAuth 2.0 Authentication Handler
 * 
 * This file handles the complete LinkedIn OAuth flow:
 * 1. Step 1: Redirect user to LinkedIn login (linkedInRedirectURL)
 * 2. Step 2: Handle callback from LinkedIn with auth code (handleLinkedInCallback)
 * 
 * Flow Overview:
 * - User clicks "Login with LinkedIn" → redirects to LinkedIn
 * - User authorizes on LinkedIn → LinkedIn redirects back with code
 * - We exchange code for tokens → get user info → create Firebase user → redirect to frontend
 */

import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { auth, createCustomToken, ensureAuthUser, upsertProfile } from './firebase.js';


// Load LinkedIn OAuth credentials and redirect URLs from environment variables
const { LINKEDIN_CLIENT_SECRET,LINKEDIN_CLIENT_ID,FRONTEND_URL,LAMBDA_URL} = process.env;
const LINKEDIN_REDIRECT_URL = FRONTEND_URL + "/auth/linkedin/callback"//

const isLocal = process.env.IS_OFFLINE ==='true'?"";
/**
 * JWKS (JSON Web Key Set) Client for verifying LinkedIn's JWT tokens
 * LinkedIn publishes public keys here that we use to verify their ID tokens are legitimate
 * Caching improves performance by avoiding repeated key fetches
 */

const client = jwksClient({
    jwksUri: 'https://www.linkedin.com/oauth/openid/jwks',
    cache: true,
    cacheMaxEntries: 5,
    cacheMaxAge: 10 * 60 * 1000, // Cache keys for 10 minutes
});

/**
 * Helper function to get the public key from LinkedIn's JWKS
 * Used for verifying JWT tokens (currently not used but available for token verification)
 */
function getKey(header, callback) {
    client.getSigningKey(header.kid, (err, key) => {
        if (err) return callback(err);
        callback(null, key.getPublicKey());
    });
}

// ========== HELPER FUNCTIONS ==========

/**
 * Generates a random state token for OAuth security
 * State prevents CSRF attacks by ensuring the callback request matches the original request
 * Returns a 32-character hex string (16 random bytes)
 */
function generateState() {
    return crypto.randomBytes(16).toString('hex');
}

/**
 * Parses a cookie header string into a JavaScript object
 * Converts "key1=value1; key2=value2" into { key1: "value1", key2: "value2" }
 * Handles URL decoding and edge cases (missing values, etc.)
 */
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

/**
 * Creates a cookie header string that clears/deletes a cookie
 * Sets Max-Age=0 to expire it immediately
 */
function clearCookie(name) {
    return `${name}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`;
}

/**
 * Sends a POST request with form-encoded data (application/x-www-form-urlencoded)
 * Used for OAuth token exchange which requires this specific content type
 * Throws an error if the request fails
 */
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

// ========== STEP 1: INITIATE LINKEDIN OAUTH ==========

/**
 * Step 1 of OAuth Flow: Redirect user to LinkedIn's login page
 * 
 * This function is called when user clicks "Login with LinkedIn"
 * It:
 * 1. Generates a random state token for security (prevents CSRF attacks)
 * 2. Builds the LinkedIn OAuth authorization URL with our app credentials
 * 3. Stores the state in a cookie so we can verify it later
 * 4. Returns a 302 redirect to send the user to LinkedIn
 * 
 * After user logs in on LinkedIn, LinkedIn will redirect them back to LINKEDIN_REDIRECT_URI
 * with an authorization code and the state we sent.
 * 
 * @returns {Object} Lambda response with 302 redirect to LinkedIn
 */
export const linkedInRedirectURL = async () => {
    // Generate random state token - we'll verify this matches when LinkedIn sends it back
    const state = generateState();
    
    // Build OAuth authorization URL parameters
    // LinkedIn will use these to identify our app and know where to redirect back
    const params = new URLSearchParams({
        response_type: 'code',              // We want an authorization code (standard OAuth flow)
        client_id: LINKEDIN_CLIENT_ID,       // Our LinkedIn app's client ID
        redirect_uri: LINKEDIN_REDIRECT_URL, // Where LinkedIn should send user after auth
        state,                               // Security token to prevent CSRF
        scope: 'openid profile email',       // What user info we're requesting
    });

    // Construct the full LinkedIn OAuth URL
    const url = `https://www.linkedin.com/oauth/v2/authorization?${params}`;
    console.log('[LI] Redirecting to LinkedIn auth', { redirect_uri: LINKEDIN_REDIRECT_URL, state });

    // Return 302 redirect response
    // Also set a cookie with the state so we can verify it in the callback
    return {
        statusCode: 302, // HTTP redirect status
        headers: {
            Location: url, // Where to redirect the browser
            // Store state in secure cookie (expires in 10 minutes = 600 seconds)
            'Set-Cookie': `li_oauth_state=${state}; Path=/; HttpOnly; Secure; Max-Age=600; SameSite=Lax`,
        },
        body: '',
    };
};

// ========== STEP 2: HANDLE LINKEDIN CALLBACK ==========

/**
 * Step 2 of OAuth Flow: Process the callback from LinkedIn
 * 
 * This function is called when LinkedIn redirects the user back to our server
 * after they've authorized our app. LinkedIn sends:
 * - code: Authorization code we exchange for tokens
 * - state: The state token we sent (we verify it matches)
 * 
 * Process:
 * 1. Verify the state token matches what we stored (security check)
 * 2. Exchange the authorization code for access token and ID token
 * 3. Decode the ID token to get user info (email, name, LinkedIn ID)
 * 4. Create/update the user in Firebase Auth
 * 5. Save user profile to Firestore
 * 6. Generate a Firebase custom token for the frontend
 * 7. Redirect user to frontend with the token
 * 
 * @param {Object} event - Lambda event object with headers and query parameters
 * @returns {Object} Lambda response with redirect to frontend
 */
export const handleLinkedInCallback = async (event) => {
    try {
        // Extract cookies from request headers
        const headers = event.headers || {};
        const cookies = parseCookies(headers.cookie || headers.Cookie || '');
        const cookieState = cookies['li_oauth_state'] || null; // State we stored in cookie

        // Get the authorization code and state from LinkedIn's redirect URL
        // Example: ?code=abc123&state=xyz789
        const { code, state } = event.queryStringParameters || {};
        
        // Security check: Verify state matches what we sent
        // This prevents CSRF attacks - if state doesn't match, someone might be trying to hijack the flow
        if (!code || !state || !cookieState || state !== cookieState) {
            return { statusCode: 400, body: 'Invalid or missing state/code' };
        }
        
        // Prepare to clear the state cookie (we're done with it)
        const clearStateCookie = clearCookie('li_oauth_state');

        // Exchange the authorization code for actual tokens
        // This is the OAuth 2.0 "token exchange" step
        // We send the code + our client secret to LinkedIn, they send back tokens
        const tokenData = await postForm('https://www.linkedin.com/oauth/v2/accessToken', {
            grant_type: 'authorization_code',  // Standard OAuth grant type
            code,                                // The code LinkedIn gave us
            client_id: LINKEDIN_CLIENT_ID,      // Our app ID
            client_secret: LINKEDIN_CLIENT_SECRET, // Our app secret (proves we're the real app)
            redirect_uri: LINKEDIN_REDIRECT_URL,   // Must match what we sent in step 1
        });

        // Extract tokens from LinkedIn's response
        const { access_token, id_token } = tokenData;
        if (!id_token) return { statusCode: 500, body: 'Missing id_token from LinkedIn' };

        // Decode the ID token (JWT) to get user information
        // The ID token contains: user's LinkedIn ID, email, name, etc.
        // Note: We're just decoding here, not verifying (for production you'd verify with JWKS)
        const decoded = jwt.decode(id_token);
        const linkedinId = decoded.sub;              // LinkedIn's unique user ID (we use this as Firebase UID)
        const email = decoded.email || null;          // User's email (may be null if not provided)
        const firstName = decoded.given_name || null;
        const lastName = decoded.family_name || null;
        const fullName = decoded.name || [firstName, lastName].filter(Boolean).join(' ');

        // Create or update the user in Firebase Authentication
        // Uses LinkedIn ID as the UID so same LinkedIn account = same Firebase user
        await ensureAuthUser(linkedinId, {
            email: email || undefined,
            displayName: fullName || undefined,
        });

        // Save/update user profile in Firestore database
        // This stores additional user info beyond what Firebase Auth stores
        await upsertProfile('users', linkedinId, {
            firstName,
            lastName,
            email,
            provider: 'linkedin',  // Track that they logged in via LinkedIn
            linkedinId,
        });

        // Generate a Firebase custom token
        // The frontend will use this token to sign the user into Firebase
        // This is how we bridge LinkedIn auth → Firebase auth
        const customToken = await createCustomToken(linkedinId, {
            provider: 'linkedin',
            emailVerified: !!email, // Mark email as verified if we got one
        });

        // Redirect user back to frontend with the Firebase token
        // Frontend will extract token from URL and sign user in
        const redirectUrl = `${LINKEDIN_REDIRECT_URL}?token=${encodeURIComponent(customToken)}`;
        return {
            statusCode: 302, // Redirect
            headers: { 
                Location: redirectUrl, 
                'Set-Cookie': clearStateCookie // Clear the state cookie we're done with
            },
        };
    } catch (err) {
        console.error('[LI] Callback failed:', err);
        return { statusCode: 500, body: 'Internal Server Error' };
    }
};
