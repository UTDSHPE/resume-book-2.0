// backend/src/functions/student/handler.js
import { createInvite } from "../invites/createInvite.js";
import { redeemInvite } from "../invites/redeemInvite.js";

const corsHeaders = {
    "Access-Control-Allow-Origin": "http://localhost:3000", // or "*" in prod
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
};

export async function main(event) {
    try {
        console.log("[STUDENT] Event:", event.httpMethod, event.path);

        const path = event.path || "";
        const method = event.httpMethod;
        const idToken = event.headers.Authorization?.replace("Bearer ", "");

        // Routing table
        if (path.endsWith("/student/create-invite") && method === "POST") {
            // Students can only create student invites → force role = "student"
            const { expiresInDays, accessTermMonths } = JSON.parse(event.body || "{}");

            const result = await createInvite({ idToken, role: "student", expiresInDays, accessTermMonths });
            return { statusCode: 200, 
                headers: corsHeaders, body: JSON.stringify(result) };
        }

        if (path.endsWith("/student/redeem-invite") && method === "POST") {
            const { code } = JSON.parse(event.body || "{}");

            const result = await redeemInvite({ idToken, code });
            return { statusCode: 200, 
                headers: corsHeaders, body: JSON.stringify(result) };
        }

        return { statusCode: 404, headers:corsHeaders,body: JSON.stringify({ error: "Not Found" }) };
    } catch (err) {
        console.error("[STUDENT] Handler error:", err);
        return { statusCode: 500,headers:corsHeaders, body: JSON.stringify({ error: err.message || "Internal Server Error" }) };
    }
}
