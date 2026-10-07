import { z } from "zod";

/**
 * Three distinct translation lifecycle states as defined in ARCHITECTURE.md & AGENTS.md.
 */
export const TranslationStatusSchema = z.enum([
  "DRAFT",
  "AI-PROPOSED",
  "HUMAN-APPROVED",
]);

export type TranslationStatus = z.infer<typeof TranslationStatusSchema>;

/**
 * Supported ISO locale identifiers.
 */
export const LocaleCodeSchema = z.enum(["en", "vi", "ko"]);
export type LocaleCode = z.infer<typeof LocaleCodeSchema>;

/**
 * Single localized text entry with metadata tracking translation approval.
 */
export const LocalizedTextEntrySchema = z.object({
  text: z.string().min(1, "Text content cannot be empty"),
  status: TranslationStatusSchema,
  updated_at: z.string().datetime({ message: "Must be a valid ISO 8601 UTC timestamp" }),
  reviewed_by: z.string().optional(),
});

export type LocalizedTextEntry = z.infer<typeof LocalizedTextEntrySchema>;

/**
 * Multi-locale field structure ensuring the primary language exists
 * and tracking translation status for secondary languages.
 */
export const LocalizedFieldSchema = z.object({
  en: LocalizedTextEntrySchema,
  vi: LocalizedTextEntrySchema.optional(),
  ko: LocalizedTextEntrySchema.optional(),
});

export type LocalizedField = z.infer<typeof LocalizedFieldSchema>;
