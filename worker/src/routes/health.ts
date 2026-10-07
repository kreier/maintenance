import type { Env } from "./auth.js";

export function handleHealth(env: Env): Response {
  return new Response(
    JSON.stringify({
      status: "healthy",
      service: "kreier-maintenance-worker",
      timestamp: new Date().toISOString(),
      r2Configured: Boolean(env.BUCKET),
      environment: env.ENVIRONMENT || "production",
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}
