// backend/src/functions/admin/handler.js
import { createInvite } from "../invites/createInvite.js";
import { redeemInvite } from "../invites/redeemInvite.js";

export async function main(event) {
    try {
        console.log("[ADMIN] Event:", event.httpMethod, event.path);

        const path = event.path || "";
        const method = event.httpMethod;
        const idToken = event.headers.Authorization?.replace("Bearer ", "");

        // Routing table
        if (path.endsWith("/admin/create-invite") && method === "POST") {
            const { role, expiresInDays, accessTermMonths } = JSON.parse(event.body || "{}");

            const result = await createInvite({ idToken, role, expiresInDays, accessTermMonths });
            return { statusCode: 200, body: JSON.stringify(result) };
        }

        if (path.endsWith("/admin/redeem-invite") && method === "POST") {
            const { code } = JSON.parse(event.body || "{}");

            const result = await redeemInvite({ idToken, code });
            return { statusCode: 200, body: JSON.stringify(result) };
        }

        return { statusCode: 404, body: JSON.stringify({ error: "Not Found" }) };
    } catch (err) {
        console.error("[ADMIN] Handler error:", err);
        return { statusCode: 500, body: JSON.stringify({ error: err.message || "Internal Server Error" }) };
    }
}
