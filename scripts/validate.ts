import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  FacilitySchema,
  RoomSchema,
  FacilityObjectSchema,
  MaintenanceEventSchema,
} from "../schema/src/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, "../data/example");

interface ValidationStats {
  filesChecked: number;
  errors: string[];
}

async function validateJSON<T>(
  filePath: string,
  schema: { parse: (data: unknown) => T },
  stats: ValidationStats
): Promise<T | null> {
  stats.filesChecked++;
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    const parsed = JSON.parse(raw);
    const result = schema.parse(parsed);
    return result;
  } catch (err: any) {
    const relPath = path.relative(dataDir, filePath);
    stats.errors.push(`[${relPath}]: ${err.message || String(err)}`);
    return null;
  }
}

async function getJsonFiles(dir: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    return entries
      .filter((e) => e.isFile() && e.name.endsWith(".json"))
      .map((e) => path.join(dir, e.name));
  } catch {
    return [];
  }
}

export async function runValidation(): Promise<{ success: boolean; stats: ValidationStats }> {
  const stats: ValidationStats = { filesChecked: 0, errors: [] };

  console.log(`🔍 Validating synthetic data in ${dataDir}...`);

  // 1. Validate facility.json
  const facilityPath = path.join(dataDir, "facility.json");
  const facility = await validateJSON(facilityPath, FacilitySchema, stats);

  // 2. Validate all rooms
  const roomsDir = path.join(dataDir, "rooms");
  const roomFiles = await getJsonFiles(roomsDir);
  const roomIds = new Set<string>();

  for (const file of roomFiles) {
    const room = await validateJSON(file, RoomSchema, stats);
    if (room) {
      if (facility && room.facility_id !== facility.id) {
        stats.errors.push(`[rooms/${path.basename(file)}]: facility_id "${room.facility_id}" does not match facility "${facility.id}"`);
      }
      roomIds.add(room.id);
    }
  }

  // 3. Validate all objects
  const objectsDir = path.join(dataDir, "objects");
  const objectFiles = await getJsonFiles(objectsDir);
  const objectIds = new Set<string>();

  for (const file of objectFiles) {
    const obj = await validateJSON(file, FacilityObjectSchema, stats);
    if (obj) {
      if (facility && obj.facility_id !== facility.id) {
        stats.errors.push(`[objects/${path.basename(file)}]: facility_id "${obj.facility_id}" does not match facility "${facility.id}"`);
      }
      if (!roomIds.has(obj.room_id)) {
        stats.errors.push(`[objects/${path.basename(file)}]: references unknown room_id "${obj.room_id}"`);
      }
      objectIds.add(obj.id);
    }
  }

  // 4. Validate all maintenance events
  const maintenanceDir = path.join(dataDir, "maintenance");
  const maintenanceFiles = await getJsonFiles(maintenanceDir);

  for (const file of maintenanceFiles) {
    const event = await validateJSON(file, MaintenanceEventSchema, stats);
    if (event) {
      if (facility && event.facility_id !== facility.id) {
        stats.errors.push(`[maintenance/${path.basename(file)}]: facility_id "${event.facility_id}" does not match facility "${facility.id}"`);
      }
      if (!objectIds.has(event.object_id)) {
        stats.errors.push(`[maintenance/${path.basename(file)}]: references unknown object_id "${event.object_id}"`);
      }
    }
  }

  return { success: stats.errors.length === 0, stats };
}

// Run if directly executed
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runValidation().then(({ success, stats }) => {
    console.log(`\nResults: ${stats.filesChecked} files checked.`);
    if (success) {
      console.log("✅ All fixtures conform strictly to schema and pass referential integrity checks.");
      process.exit(0);
    } else {
      console.error(`❌ Validation failed with ${stats.errors.length} error(s):`);
      for (const err of stats.errors) {
        console.error(`  - ${err}`);
      }
      process.exit(1);
    }
  });
}
