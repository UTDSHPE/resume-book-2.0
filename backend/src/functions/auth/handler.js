/*
  Internal router for auth endpoints.
  NOTE: This file now logs routing decisions and passes the FULL event to the callback,
  so headers/cookies are available.
*/
const { linkedInRedirectURL, handleLinkedInCallback } = require('./linkedin');

exports.handler = async (event) => {
    const { path, queryStringParameters, headers = {} } = event || {};
    console.log('[HANDLER] Incoming request', { path, hasQs: !!queryStringParameters, hasCookies: !!(headers.cookie || headers.Cookie) });

    try {
        if (path && path.endsWith('/auth/linkedin')) {
            console.log('[HANDLER] /auth/linkedin → building redirect URL');
            const { url, stateCookie } = linkedInRedirectURL();
            console.log('[HANDLER] Redirect URL ready. Setting state cookie.');
            return {
                statusCode: 302,
                headers: {
                    Location: url,
                    'Set-Cookie': stateCookie,
                    'Cache-Control': 'no-store',
                },
                body: '',
            };
        }

        if (path && path.endsWith('/auth/linkedin/callback')) {
            console.log('[HANDLER] /auth/linkedin/callback → delegating to callback handler');
            // IMPORTANT: pass the full event so the callback can read headers & params
            const resp = await handleLinkedInCallback({ headers, queryStringParameters });
            console.log('[HANDLER] Callback responded', { status: resp?.statusCode });
            return resp;
        }

        console.warn('[HANDLER] Route not found:', path);
        return { statusCode: 404, body: 'Not found' };
    } catch (error) {
        console.error('[HANDLER] Unhandled error:', error);
        return { statusCode: 500, body: 'Internal Server Error' };
    }
};
