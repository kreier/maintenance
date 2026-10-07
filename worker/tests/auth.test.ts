import { describe, it, expect } from "vitest";
import {
  computeHmacSha256,
  verifyPasswordHash,
  createSessionToken,
  verifySessionToken,
  type SessionPayload,
} from "../src/auth/crypto.js";
import { permissions, hasMinimumRole } from "../src/auth/roles.js";

describe("Worker Authentication Cryptography", () => {
  const secretKey = "test-secret-key-for-worker-32b";

  it("verifies matching password hashes with HMAC in constant time", async () => {
    const clientDerivedHash = "a1b2c3d4e5f6g7h8";
    const storedHmac = await computeHmacSha256(clientDerivedHash, secretKey);

    const isValid = await verifyPasswordHash(clientDerivedHash, storedHmac, secretKey);
    expect(isValid).toBe(true);

    const isWrong = await verifyPasswordHash("wrong-client-hash", storedHmac, secretKey);
    expect(isWrong).toBe(false);
  });

  it("creates and verifies tamper-evident signed session tokens", async () => {
    const payload: SessionPayload = {
      userId: "USR-001",
      username: "admin",
      role: "administrator",
      facilityId: "FAC-DEMO-001",
      exp: Math.floor(Date.now() / 1000) + 3600, // +1 hour
    };

    const token = await createSessionToken(payload, secretKey);
    expect(token).toContain(".");

    const decoded = await verifySessionToken(token, secretKey);
    expect(decoded).not.toBeNull();
    expect(decoded?.username).toBe("admin");
    expect(decoded?.role).toBe("administrator");
  });

  it("rejects tampered session tokens", async () => {
    const payload: SessionPayload = {
      userId: "USR-002",
      username: "editor",
      role: "editor",
      facilityId: "FAC-DEMO-001",
      exp: Math.floor(Date.now() / 1000) + 3600,
    };

    const token = await createSessionToken(payload, secretKey);
    const [payloadB64, sig] = token.split(".");

    // Tamper with payload (e.g. elevating role to administrator)
    const tamperedPayload = btoa(JSON.stringify({ ...payload, role: "administrator" }));
    const tamperedToken = `${tamperedPayload}.${sig}`;

    const result = await verifySessionToken(tamperedToken, secretKey);
    expect(result).toBeNull();
  });

  it("rejects expired session tokens", async () => {
    const payload: SessionPayload = {
      userId: "USR-001",
      username: "admin",
      role: "administrator",
      facilityId: "FAC-DEMO-001",
      exp: Math.floor(Date.now() / 1000) - 10, // expired 10 seconds ago
    };

    const token = await createSessionToken(payload, secretKey);
    const result = await verifySessionToken(token, secretKey);
    expect(result).toBeNull();
  });
});

describe("Role-Based Access Control", () => {
  it("enforces role hierarchy", () => {
    expect(hasMinimumRole("administrator", "viewer")).toBe(true);
    expect(hasMinimumRole("administrator", "editor")).toBe(true);
    expect(hasMinimumRole("editor", "administrator")).toBe(false);
    expect(hasMinimumRole("viewer", "editor")).toBe(false);
  });

  it("checks specific permission capabilities", () => {
    expect(permissions.canView("viewer")).toBe(true);
    expect(permissions.canEdit("viewer")).toBe(false);

    expect(permissions.canEdit("editor")).toBe(true);
    expect(permissions.canAdminister("editor")).toBe(false);

    expect(permissions.canReviewTranslations("reviewer")).toBe(true);
    expect(permissions.canAdminister("administrator")).toBe(true);
  });
});
