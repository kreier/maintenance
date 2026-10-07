import { verifySessionToken, type SessionPayload } from "./auth/crypto.js";
import { handleLogin, handleLogout, handleGetMe, type Env } from "./routes/auth.js";
import { handleGetObjects, handleSaveObject } from "./routes/objects.js";
import { handleCreateEvent } from "./routes/events.js";
import { handleHealth } from "./routes/health.js";

/**
 * Adds CORS headers to all responses allowing authorized frontend origins.
 */
function setCorsHeaders(response: Response, request: Request): Response {
  const origin = request.headers.get("Origin") || "*";
  const newHeaders = new Headers(response.headers);
  newHeaders.set("Access-Control-Allow-Origin", origin);
  newHeaders.set("Access-Control-Allow-Credentials", "true");
  newHeaders.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  newHeaders.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      const origin = request.headers.get("Origin") || "*";
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Credentials": "true",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    }

    // Health check
    if (url.pathname === "/api/health") {
      return setCorsHeaders(handleHealth(env), request);
    }

    // Auth endpoints
    if (url.pathname === "/api/auth/login") {
      const res = await handleLogin(request, env);
      return setCorsHeaders(res, request);
    }

    if (url.pathname === "/api/auth/logout") {
      const res = await handleLogout(env);
      return setCorsHeaders(res, request);
    }

    if (url.pathname === "/api/auth/me") {
      const res = await handleGetMe(request, env);
      return setCorsHeaders(res, request);
    }

    // Authenticate session for protected data endpoints
    const cookieHeader = request.headers.get("Cookie") || "";
    const match = cookieHeader.match(/maintenance_session=([^;]+)/);
    let session: SessionPayload | null = null;

    if (match) {
      const serverSecret = env.SESSION_SECRET || "default-development-secret-key-32b";
      session = await verifySessionToken(match[1], serverSecret);
    }

    // Objects endpoints
    if (url.pathname === "/api/objects" || url.pathname.startsWith("/api/objects/")) {
      const objectId = url.pathname.replace(/^\/api\/objects\/?/, "").split("/")[0] || null;

      if (request.method === "GET") {
        const res = await handleGetObjects(objectId, env);
        return setCorsHeaders(res, request);
      }

      if (request.method === "PUT" && objectId) {
        if (!session) {
          return setCorsHeaders(
            new Response(JSON.stringify({ error: "Authentication required" }), { status: 401 }),
            request
          );
        }
        const res = await handleSaveObject(objectId, request, session, env);
        return setCorsHeaders(res, request);
      }
    }

    // Maintenance events endpoint
    if (url.pathname === "/api/maintenance/events" && request.method === "POST") {
      if (!session) {
        return setCorsHeaders(
          new Response(JSON.stringify({ error: "Authentication required" }), { status: 401 }),
          request
        );
      }
      const res = await handleCreateEvent(request, session, env);
      return setCorsHeaders(res, request);
    }

    // 404 fallback
    return setCorsHeaders(
      new Response(JSON.stringify({ error: "Not found", path: url.pathname }), { status: 404 }),
      request
    );
  },
};
