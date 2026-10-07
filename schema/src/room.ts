import { z } from "zod";
import { LocaleCodeSchema } from "./translation.js";

/**
 * Room / spatial zone schema.
 */
export const RoomSchema = z.object({
  id: z.string().regex(/^ROOM-[A-Z0-9_-]+$/, "Room ID must match format ROOM-<CODE>"),
  facility_id: z.string().regex(/^FAC-[A-Z0-9_-]+$/),
  name: z.record(LocaleCodeSchema, z.string().min(1)),
  floor: z.string().min(1),
  area_sqm: z.number().positive().optional(),
  description: z.record(LocaleCodeSchema, z.string()).optional(),
});

export type Room = z.infer<typeof RoomSchema>;
