import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { zodToJsonSchema } from "zod-to-json-schema";
import { FacilitySchema } from "./facility.js";
import { RoomSchema } from "./room.js";
import { FacilityObjectSchema } from "./object.js";
import { MaintenanceEventSchema } from "./maintenance.js";
import { LocalizedFieldSchema } from "./translation.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.resolve(__dirname, "../../schema/json");

async function main() {
  await fs.mkdir(outputDir, { recursive: true });

  const schemas = [
    { name: "facility.schema.json", schema: FacilitySchema, title: "Facility" },
    { name: "room.schema.json", schema: RoomSchema, title: "Room" },
    { name: "object.schema.json", schema: FacilityObjectSchema, title: "FacilityObject" },
    { name: "maintenance-event.schema.json", schema: MaintenanceEventSchema, title: "MaintenanceEvent" },
    { name: "localized-field.schema.json", schema: LocalizedFieldSchema, title: "LocalizedField" },
  ];

  for (const { name, schema, title } of schemas) {
    const jsonSchema = zodToJsonSchema(schema, title);
    const dest = path.join(outputDir, name);
    await fs.writeFile(dest, JSON.stringify(jsonSchema, null, 2) + "\n", "utf-8");
    console.log(`Generated: ${dest}`);
  }
}

main().catch((err) => {
  console.error("Failed to export JSON schemas:", err);
  process.exit(1);
});
