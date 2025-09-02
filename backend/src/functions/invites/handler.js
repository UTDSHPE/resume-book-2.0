// backend/src/functions/invites/handler.js
import { createInvite } from "./createInvite.js";
import { redeemInvite } from "./redeemInvite.js";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
};

export async function main(event) {
    try {
        console.log("[INVITES] Event:", event.httpMethod, event.path);

        const { path = "", httpMethod: method } = event;
        const idToken = event.headers.Authorization?.replace("Bearer ", "");

        // Parse request body once
        let body = {};
        try {
            body = JSON.parse(event.body || "{}");
        } catch (_) { }

        // --- STUDENT ROUTES ---
        if (path.endsWith("/student/create-invite") && method === "POST") {
            const { expiresInDays, accessTermMonths } = body;
            const result = await createInvite({
                idToken,
                role: "student", // force role
                expiresInDays,
                accessTermMonths,
            });
            return { statusCode: 200, headers: corsHeaders, body: JSON.stringify(result) };
        }

        if (path.endsWith("/student/redeem-invite") && method === "POST") {
            const result = await redeemInvite({ idToken, code: body.code });
            return { statusCode: 200, headers: corsHeaders, body: JSON.stringify(result) };
        }

        // --- ADMIN ROUTES ---
        if (path.endsWith("/admin/create-invite") && method === "POST") {
            const { role, expiresInDays, accessTermMonths } = body;
            const result = await createInvite({
                idToken,
                role, // admin can set recruiter/admin
                expiresInDays,
                accessTermMonths,
            });
            return { statusCode: 200, headers: corsHeaders, body: JSON.stringify(result) };
        }

        if (path.endsWith("/admin/redeem-invite") && method === "POST") {
            const result = await redeemInvite({ idToken, code: body.code });
            return { statusCode: 200, headers: corsHeaders, body: JSON.stringify(result) };
        }

        return {
            statusCode: 404,
            headers: corsHeaders,
            body: JSON.stringify({ error: "Not Found" }),
        };
    } catch (err) {
        console.error("[INVITES] Handler error:", err);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ error: err.message || "Internal Server Error" }),
        };
    }
}
