/**
 * Constant-time byte equality check to protect against timing attacks.
 */
export function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}

/**
 * Computes an HMAC-SHA256 signature for a message given a secret key.
 */
export async function computeHmacSha256(
  message: string,
  secretKey: string
): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secretKey),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Verifies that a client-provided derived password hash matches the server's expected HMAC in constant time.
 */
export async function verifyPasswordHash(
  clientDerivedHash: string,
  storedHmac: string,
  serverSecret: string
): Promise<boolean> {
  const expectedHmac = await computeHmacSha256(clientDerivedHash, serverSecret);

  const enc = new TextEncoder();
  const a = enc.encode(expectedHmac);
  const b = enc.encode(storedHmac);

  return timingSafeEqual(a, b);
}

export interface SessionPayload {
  userId: string;
  username: string;
  role: "viewer" | "editor" | "reviewer" | "administrator";
  facilityId: string;
  exp: number; // Unix timestamp in seconds
}

/**
 * Creates a signed session token: "<base64Payload>.<hmacSignature>"
 */
export async function createSessionToken(
  payload: SessionPayload,
  serverSecret: string
): Promise<string> {
  const jsonStr = JSON.stringify(payload);
  const base64Payload = btoa(jsonStr);
  const signature = await computeHmacSha256(base64Payload, serverSecret);
  return `${base64Payload}.${signature}`;
}

/**
 * Verifies and decodes a signed session token. Returns null if invalid or expired.
 */
export async function verifySessionToken(
  token: string,
  serverSecret: string
): Promise<SessionPayload | null> {
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [base64Payload, signature] = parts;
  const expectedSig = await computeHmacSha256(base64Payload, serverSecret);

  const enc = new TextEncoder();
  if (!timingSafeEqual(enc.encode(signature), enc.encode(expectedSig))) {
    return null;
  }

  try {
    const jsonStr = atob(base64Payload);
    const payload = JSON.parse(jsonStr) as SessionPayload;

    // Check expiration
    const nowSec = Math.floor(Date.now() / 1000);
    if (payload.exp < nowSec) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
