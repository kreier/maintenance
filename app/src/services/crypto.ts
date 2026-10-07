/**
 * Derives a cryptographic key from a user password using browser-native Web Crypto PBKDF2.
 * This offloads expensive derivation from the Cloudflare Worker to preserve its CPU limits (~10ms).
 */
export async function deriveClientPasswordHash(
  password: string,
  username: string
): Promise<string> {
  const enc = new TextEncoder();
  const salt = enc.encode(`kreier-maintenance:${username.toLowerCase().trim()}`);

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    256 // 256 bits = 32 bytes
  );

  return Array.from(new Uint8Array(derivedBits))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
