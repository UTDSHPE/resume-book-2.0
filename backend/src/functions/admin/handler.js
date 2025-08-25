// backend/src/functions/admin/handler.js
import { createInvite } from "./createInvite.js";
import { redeemInvite } from "./redeemInvite.js";

export async function main(event) {
    try {
        console.log("[ADMIN] Event:", event.httpMethod, event.path);

        // Normalize path (e.g., /admin/create-invite)
        const path = event.path || "";
        const method = event.httpMethod;

        // Routing table
        if (path.endsWith("/admin/create-invite") && method === "POST") {
            return await createInvite(event);
        }

        if (path.endsWith("/admin/redeem-invite") && method === "POST") {
            return await redeemInvite(event);
        }

        // If no route matched
        return {
            statusCode: 404,
            body: JSON.stringify({ error: "Not Found" }),
        };
    } catch (err) {
        console.error("[ADMIN] Handler error:", err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Internal Server Error" }),
        };
    }
}
