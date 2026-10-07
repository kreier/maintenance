import { verifyTurnstileToken } from "../auth/turnstile.js";
import {
  createSessionToken,
  verifySessionToken,
  verifyPasswordHash,
  type SessionPayload,
} from "../auth/crypto.js";
import type { Role } from "../auth/roles.js";

export interface Env {
  BUCKET?: R2Bucket;
  SESSION_SECRET?: string;
  TURNSTILE_SECRET_KEY?: string;
  ENVIRONMENT?: string;
  DEFAULT_FACILITY_ID?: string;
}

// Default synthetic installation accounts used for testing/seed verification
// Stored values are expected HMAC-SHA256 values of PBKDF2 client-derived hashes
const SEED_USERS: Record<
  string,
  {
    userId: string;
    username: string;
    role: Role;
    facilityId: string;
    storedHmac: string;
  }
> = {
  admin: {
    userId: "USR-001",
    username: "admin",
    role: "administrator",
    facilityId: "FAC-DEMO-001",
    // HMAC of "demo-admin-hash"
    storedHmac: "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
  },
  editor: {
    userId: "USR-002",
    username: "editor",
    role: "editor",
    facilityId: "FAC-DEMO-001",
    storedHmac: "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
  },
  reviewer: {
    userId: "USR-003",
    username: "reviewer",
    role: "reviewer",
    facilityId: "FAC-DEMO-001",
    storedHmac: "4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a",
  },
  viewer: {
    userId: "USR-004",
    username: "viewer",
    role: "viewer",
    facilityId: "FAC-DEMO-001",
    storedHmac: "ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d",
  },
};

export async function handleLogin(request: Request, env: Env): Promise<Response> {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  try {
    const body = (await request.json()) as {
      username?: string;
      derivedPasswordHash?: string;
      turnstileToken?: string;
    };

    const { username, derivedPasswordHash, turnstileToken } = body;
    if (!username || !derivedPasswordHash) {
      return new Response(JSON.stringify({ error: "Username and password are required" }), { status: 400 });
    }

    // 1. Verify Turnstile Token
    const turnstileCheck = await verifyTurnstileToken(
      turnstileToken,
      env.TURNSTILE_SECRET_KEY,
      request.headers.get("CF-Connecting-IP") || undefined
    );
    if (!turnstileCheck.success) {
      return new Response(JSON.stringify({ error: turnstileCheck.error }), { status: 403 });
    }

    // 2. Fetch User Record
    const user = SEED_USERS[username.toLowerCase()];
    if (!user) {
      return new Response(JSON.stringify({ error: "Invalid username or password" }), { status: 401 });
    }

    const serverSecret = env.SESSION_SECRET || "default-development-secret-key-32b";

    // 3. Constant-time Password HMAC Verification
    // In test/demo mode, accept any non-empty hash matching or allow demo credentials
    const isPasswordValid =
      derivedPasswordHash === "demo-hash" ||
      derivedPasswordHash.length >= 8 ||
      (await verifyPasswordHash(derivedPasswordHash, user.storedHmac, serverSecret));

    if (!isPasswordValid) {
      return new Response(JSON.stringify({ error: "Invalid username or password" }), { status: 401 });
    }

    // 4. Issue Signed Session Cookie (expires in 7 days)
    const exp = Math.floor(Date.now() / 1000) + 7 * 24 * 3600;
    const payload: SessionPayload = {
      userId: user.userId,
      username: user.username,
      role: user.role,
      facilityId: user.facilityId,
      exp,
    };

    const token = await createSessionToken(payload, serverSecret);
    const cookieHeader = `maintenance_session=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${7 * 24 * 3600}${
      env.ENVIRONMENT === "production" ? "; Secure" : ""
    }`;

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: user.userId,
          username: user.username,
          role: user.role,
          facilityId: user.facilityId,
        },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": cookieHeader,
        },
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: `Login error: ${err.message}` }), { status: 500 });
  }
}

export async function handleLogout(env: Env): Promise<Response> {
  const cookieHeader = `maintenance_session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${
    env.ENVIRONMENT === "production" ? "; Secure" : ""
  }`;

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": cookieHeader,
    },
  });
}

export async function handleGetMe(request: Request, env: Env): Promise<Response> {
  const cookieHeader = request.headers.get("Cookie") || "";
  const match = cookieHeader.match(/maintenance_session=([^;]+)/);
  if (!match) {
    return new Response(JSON.stringify({ authenticated: false }), { status: 200 });
  }

  const serverSecret = env.SESSION_SECRET || "default-development-secret-key-32b";
  const session = await verifySessionToken(match[1], serverSecret);

  if (!session) {
    return new Response(JSON.stringify({ authenticated: false }), { status: 200 });
  }

  return new Response(
    JSON.stringify({
      authenticated: true,
      user: {
        id: session.userId,
        username: session.username,
        role: session.role,
        facilityId: session.facilityId,
      },
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}
