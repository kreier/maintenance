import { MaintenanceEventSchema, FacilityObjectSchema } from "@maintenance/schema";
import type { SessionPayload } from "../auth/crypto.js";
import { permissions } from "../auth/roles.js";
import type { Env } from "./auth.js";

export async function handleCreateEvent(
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
    const event = MaintenanceEventSchema.parse(body);

    // 1. Store maintenance event in data/maintenance/<ID>.json
    const eventKey = `data/maintenance/${event.id}.json`;
    await env.BUCKET.put(eventKey, JSON.stringify(event, null, 2), {
      customMetadata: {
        created_by: session.username,
        created_at: new Date().toISOString(),
      },
    });

    // 2. Fetch target object, update last_serviced fact, and save
    const objectKey = `data/objects/${event.object_id}.json`;
    const targetFile = await env.BUCKET.get(objectKey);

    if (targetFile) {
      const objData = await targetFile.json();
      const obj = FacilityObjectSchema.parse(objData);

      if (obj.maintenance) {
        obj.maintenance.last_serviced = event.date;
      }
      obj.status = "active"; // clear any maintenance_required status

      await env.BUCKET.put(objectKey, JSON.stringify(obj, null, 2), {
        customMetadata: {
          updated_by: session.username,
          updated_at: new Date().toISOString(),
        },
      });
    }

    return new Response(JSON.stringify({ success: true, event }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: "Invalid maintenance event", details: err.message }),
      { status: 400 }
    );
  }
}
