import { z } from "zod";
import { LocalizedFieldSchema } from "./translation.js";

export const ObjectTypeSchema = z.enum(["equipment", "structural", "utility"]);
export type ObjectType = z.infer<typeof ObjectTypeSchema>;

export const ObjectCategorySchema = z.enum([
  "hvac",
  "electrical",
  "plumbing",
  "av",
  "safety",
  "other",
]);
export type ObjectCategory = z.infer<typeof ObjectCategorySchema>;

export const ObjectStatusSchema = z.enum([
  "active",
  "maintenance_required",
  "out_of_service",
  "retired",
]);
export type ObjectStatus = z.infer<typeof ObjectStatusSchema>;

/**
 * ISO 8601 Calendar Date format: YYYY-MM-DD
 */
export const ISODateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be a valid calendar date in YYYY-MM-DD format");

export const DocumentReferenceSchema = z.object({
  id: z.string().regex(/^DOC-[A-Z0-9_-]+$/, "Document ID must match format DOC-<CODE>"),
  title: z.string().min(1),
  filename: z.string().min(1),
  content_type: z.string().min(1),
  size_bytes: z.number().int().nonnegative().optional(),
  sha256: z.string().length(64).optional(),
});
export type DocumentReference = z.infer<typeof DocumentReferenceSchema>;

export const MaintenanceScheduleSchema = z.object({
  interval_months: z.number().int().positive("Maintenance interval must be a positive number of months"),
  last_serviced: ISODateStringSchema.optional(),
});
export type MaintenanceSchedule = z.infer<typeof MaintenanceScheduleSchema>;

/**
 * Canonical physical equipment / facility object schema.
 */
export const FacilityObjectSchema = z.object({
  id: z
    .string()
    .regex(/^[A-Z0-9]+-[A-Z0-9]+-[A-Z0-9]+$/, "Stable Object ID must follow format [CAT]-[LOC]-[SEQ] e.g. HVAC-ROOM2-001"),
  type: ObjectTypeSchema,
  category: ObjectCategorySchema,
  facility_id: z.string().regex(/^FAC-[A-Z0-9_-]+$/),
  room_id: z.string().regex(/^ROOM-[A-Z0-9_-]+$/),
  name: LocalizedFieldSchema,
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  serial_number: z.string().optional(),
  installed: ISODateStringSchema,
  status: ObjectStatusSchema,
  maintenance: MaintenanceScheduleSchema.optional(),
  documents: z.array(DocumentReferenceSchema).default([]),
});

export type FacilityObject = z.infer<typeof FacilityObjectSchema>;
