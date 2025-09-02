// backend/src/handler.js
import admin from "firebase-admin";
import { linkedInRedirectURL, handleLinkedInCallback } from "./functions/auth/linkedin.js";
import { createInvite } from "./functions/invites/createInvite.js"
import { redeemInvite } from "./functions/invites/redeemInvite.js";

// Initialize Firebase Admin once, shared across routes
if (!admin.apps.length) {
    console.log("[INIT] Initializing Firebase Admin...");
    admin.initializeApp({
        credential: admin.credential.applicationDefault(),
    });
}
//
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
};

export async function main(event) {
    const { path = "", httpMethod: method, headers = {} } = event;
    console.log("[ROUTER] Incoming", { path, method });

    try {
        // ---------- AUTH ----------
        if (path.endsWith("/auth/linkedin") && method === "GET") {
            return await linkedInRedirectURL(event);
        }
        if (path.endsWith("/auth/linkedin/callback") && method === "GET") {
            return await handleLinkedInCallback({
                headers,
                queryStringParameters: event.queryStringParameters,
            });
        }

        // ---------- STUDENT ----------
        if (path.endsWith("/student/create-invite") && method === "POST") {
            const { expiresInDays, accessTermMonths } = JSON.parse(event.body || "{}");
            const idToken = headers.Authorization?.replace("Bearer ", "");
            const result = await createInvite({ idToken, role: "student", expiresInDays, accessTermMonths });
            return { statusCode: 200, headers: corsHeaders, body: JSON.stringify(result) };
        }
        if (path.endsWith("/student/redeem-invite") && method === "POST") {
            const { code } = JSON.parse(event.body || "{}");
            const idToken = headers.Authorization?.replace("Bearer ", "");
            const result = await redeemInvite({ idToken, code });
            return { statusCode: 200, headers: corsHeaders, body: JSON.stringify(result) };
        }

        // ---------- ADMIN ----------
        if (path.endsWith("/admin/create-invite") && method === "POST") {
            const { role, expiresInDays, accessTermMonths } = JSON.parse(event.body || "{}");
            const idToken = headers.Authorization?.replace("Bearer ", "");
            const result = await createInvite({ idToken, role, expiresInDays, accessTermMonths });
            return { statusCode: 200, headers: corsHeaders, body: JSON.stringify(result) };
        }
        if (path.endsWith("/admin/redeem-invite") && method === "POST") {
            const { code } = JSON.parse(event.body || "{}");
            const idToken = headers.Authorization?.replace("Bearer ", "");
            const result = await redeemInvite({ idToken, code });
            return { statusCode: 200, headers: corsHeaders, body: JSON.stringify(result) };
        }

        // ---------- NOT FOUND ----------
        return { statusCode: 404, headers: corsHeaders, body: JSON.stringify({ error: "Not Found" }) };
    } catch (err) {
        console.error("[ROUTER] Handler error:", err);
        return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: err.message || "Internal Server Error" }) };
    }
}
