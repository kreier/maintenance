import { z } from "zod";
import { DocumentReferenceSchema, ISODateStringSchema } from "./object.js";
import { LocalizedFieldSchema } from "./translation.js";

export const MaintenanceEventTypeSchema = z.enum([
  "inspection",
  "service",
  "repair",
  "replacement",
]);
export type MaintenanceEventType = z.infer<typeof MaintenanceEventTypeSchema>;

export const MaintenanceEventSchema = z.object({
  id: z
    .string()
    .regex(/^EVT-\d{4}-\d{4}$/, "Maintenance Event ID must match format EVT-YYYY-XXXX e.g. EVT-2026-0001"),
  facility_id: z.string().regex(/^FAC-[A-Z0-9_-]+$/),
  object_id: z
    .string()
    .regex(/^[A-Z0-9]+-[A-Z0-9]+-[A-Z0-9]+$/, "Must reference a valid stable Object ID"),
  date: ISODateStringSchema,
  type: MaintenanceEventTypeSchema,
  performed_by: z.string().min(1, "Technician or vendor name is required"),
  summary: LocalizedFieldSchema,
  notes: z.string().optional(),
  cost: z
    .object({
      amount: z.number().nonnegative(),
      currency: z.string().length(3), // ISO 4217, e.g. USD, VND
    })
    .optional(),
  documents: z.array(DocumentReferenceSchema).default([]),
  created_at: z.string().datetime(),
});

export type MaintenanceEvent = z.infer<typeof MaintenanceEventSchema>;
