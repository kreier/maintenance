/**
 * Verifies a Cloudflare Turnstile token with the Cloudflare API.
 * In development or when TURNSTILE_SECRET_KEY is empty/test-key, allows testing bypass.
 */
export async function verifyTurnstileToken(
  token: string | undefined,
  secretKey: string | undefined,
  clientIp?: string
): Promise<{ success: boolean; error?: string }> {
  // Allow test bypass if no secret configured or explicit dummy key
  if (!secretKey || secretKey === "test-key" || secretKey === "dummy") {
    return { success: true };
  }

  if (!token) {
    return { success: false, error: "Turnstile challenge token is missing" };
  }

  try {
    const formData = new FormData();
    formData.append("secret", secretKey);
    formData.append("response", token);
    if (clientIp) {
      formData.append("remoteip", clientIp);
    }

    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: formData,
    });

    const outcome = (await res.json()) as { success: boolean; "error-codes"?: string[] };
    if (!outcome.success) {
      return {
        success: false,
        error: `Turnstile validation failed: ${(outcome["error-codes"] || []).join(", ")}`,
      };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: `Turnstile verification error: ${err.message}` };
  }
}
