import { z } from "zod";
import { LocaleCodeSchema } from "./translation.js";

export const MonthlyEnergyRecordSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, "Month must be in YYYY-MM format"),
  kwh: z.number().nonnegative(),
});
export type MonthlyEnergyRecord = z.infer<typeof MonthlyEnergyRecordSchema>;

/**
 * Facility configuration schema.
 */
export const FacilitySchema = z.object({
  id: z.string().regex(/^FAC-[A-Z0-9_-]+$/, "Facility ID must match format FAC-<CODE>"),
  name: z.record(LocaleCodeSchema, z.string().min(1)),
  address: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    country: z.string().min(1),
    postal_code: z.string().optional(),
  }),
  timezone: z.string().min(1, "Timezone is required (e.g. Asia/Ho_Chi_Minh)"),
  locales: z.array(LocaleCodeSchema).min(1, "At least one locale must be configured"),
  default_locale: LocaleCodeSchema,
  energy_consumption: z.array(MonthlyEnergyRecordSchema).optional(),
  created_at: z.string().datetime(),
});

export type Facility = z.infer<typeof FacilitySchema>;
