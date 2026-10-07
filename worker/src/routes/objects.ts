import { FacilityObjectSchema, type FacilityObject } from "@maintenance/schema";
import type { SessionPayload } from "../auth/crypto.js";
import { permissions } from "../auth/roles.js";
import type { Env } from "./auth.js";

/**
 * Lists or gets equipment objects from R2.
 */
export async function handleGetObjects(
  id: string | null,
  env: Env
): Promise<Response> {
  if (!env.BUCKET) {
    return new Response(JSON.stringify({ error: "R2 Bucket not configured" }), { status: 503 });
  }

  if (id) {
    const objectKey = `data/objects/${id}.json`;
    const r2Object = await env.BUCKET.get(objectKey);
    if (!r2Object) {
      return new Response(JSON.stringify({ error: "Object not found" }), { status: 404 });
    }

    const data = await r2Object.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  // List all objects
  const listResult = await env.BUCKET.list({ prefix: "data/objects/" });
  const objects: FacilityObject[] = [];

  for (const objMeta of listResult.objects) {
    const file = await env.BUCKET.get(objMeta.key);
    if (file) {
      const parsed = await file.json();
      objects.push(parsed as FacilityObject);
    }
  }

  return new Response(JSON.stringify(objects), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Updates an equipment object in R2.
 * Enforces role authorization, validates schema, archives old version to history/, and logs audit record.
 */
export async function handleSaveObject(
  id: string,
  request: Request,
  session: SessionPayload,
  env: Env
): Promise<Response> {
  if (!permissions.canEdit(session.role)) {
    return new Response(JSON.stringify({ error: "Unauthorized: Editor role required" }), { status: 403 });
  }

  if (!env.BUCKET) {
    return new Response(JSON.stringify({ error: "R2 Bucket not configured" }), { status: 503 });
  }

  try {
    const body = await request.json();
    const validated = FacilityObjectSchema.parse(body);

    if (validated.id !== id) {
      return new Response(
        JSON.stringify({ error: `Payload ID (${validated.id}) does not match URL (${id})` }),
        { status: 400 }
      );
    }

    const currentKey = `data/objects/${id}.json`;
    const existing = await env.BUCKET.get(currentKey);

    // 1. Archive prior version under history/
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    if (existing) {
      const historyKey = `history/objects/${id}/${timestamp}.json`;
      const oldContent = await existing.text();
      await env.BUCKET.put(historyKey, oldContent, {
        customMetadata: { archived_by: session.username, archived_at: new Date().toISOString() },
      });
    }

    // 2. Write new version
    const newContent = JSON.stringify(validated, null, 2);
    await env.BUCKET.put(currentKey, newContent, {
      customMetadata: {
        updated_by: session.username,
        updated_at: new Date().toISOString(),
      },
    });

    // 3. Append to history/audit.jsonl
    const auditRecord = JSON.stringify({
      id: `AUD-${Date.now()}`,
      action: existing ? "OBJECT_UPDATE" : "OBJECT_CREATE",
      object_id: id,
      user_id: session.userId,
      username: session.username,
      timestamp: new Date().toISOString(),
    }) + "\n";

    // Read and append or create audit file
    const existingAudit = await env.BUCKET.get("history/audit.jsonl");
    const existingText = existingAudit ? await existingAudit.text() : "";
    await env.BUCKET.put("history/audit.jsonl", existingText + auditRecord);

    return new Response(JSON.stringify({ success: true, object: validated }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: "Validation or persistence error", details: err.message }),
      { status: 400 }
    );
  }
}
