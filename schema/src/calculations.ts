import type { LocalizedField } from "./translation.js";

/**
 * Calculates the exact age of an equipment object given its installation date.
 *
 * @param installedDate - ISO date string "YYYY-MM-DD"
 * @param asOfDate - ISO date string "YYYY-MM-DD" (defaults to current date)
 */
export function computeAge(
  installedDate: string,
  asOfDate: string = new Date().toISOString().slice(0, 10)
): {
  years: number;
  months: number;
  totalMonths: number;
  totalDays: number;
} {
  const start = new Date(installedDate);
  const end = new Date(asOfDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error("Invalid date passed to computeAge");
  }

  const diffMs = Math.max(0, end.getTime() - start.getTime());
  const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  let years = end.getUTCFullYear() - start.getUTCFullYear();
  let months = end.getUTCMonth() - start.getUTCMonth();

  if (end.getUTCDate() < start.getUTCDate()) {
    months -= 1;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  years = Math.max(0, years);
  months = Math.max(0, months);
  const totalMonths = years * 12 + months;

  return { years, months, totalMonths, totalDays };
}

/**
 * Calculates the next maintenance date given the last service date and interval in months.
 *
 * @param lastServiced - ISO date string "YYYY-MM-DD"
 * @param intervalMonths - Positive integer
 * @returns Next maintenance date in "YYYY-MM-DD" format
 */
export function computeNextMaintenance(
  lastServiced: string,
  intervalMonths: number
): string {
  const date = new Date(lastServiced);
  if (isNaN(date.getTime())) {
    throw new Error("Invalid date passed to computeNextMaintenance");
  }

  const targetMonth = date.getUTCMonth() + intervalMonths;
  const originalDay = date.getUTCDate();

  date.setUTCMonth(targetMonth);

  // Handle month boundary clamping (e.g. Aug 31 + 1 month -> Sep 30, not Oct 1)
  if (date.getUTCDate() < originalDay) {
    date.setUTCDate(0);
  }

  return date.toISOString().slice(0, 10);
}

/**
 * Checks whether maintenance is overdue or due soon.
 *
 * @param nextMaintenanceDate - ISO date string "YYYY-MM-DD"
 * @param asOfDate - ISO date string "YYYY-MM-DD" (defaults to current date)
 * @param dueSoonDaysThreshold - Days threshold for "due soon" warning (default 30 days)
 */
export function computeOverdueStatus(
  nextMaintenanceDate: string,
  asOfDate: string = new Date().toISOString().slice(0, 10),
  dueSoonDaysThreshold: number = 30
): {
  isOverdue: boolean;
  daysOverdue: number;
  isDueSoon: boolean;
  daysUntilDue: number;
} {
  const next = new Date(nextMaintenanceDate);
  const current = new Date(asOfDate);

  if (isNaN(next.getTime()) || isNaN(current.getTime())) {
    throw new Error("Invalid date passed to computeOverdueStatus");
  }

  const diffTime = current.getTime() - next.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  const isOverdue = diffDays > 0;
  const daysOverdue = isOverdue ? diffDays : 0;
  const daysUntilDue = !isOverdue ? Math.abs(diffDays) : 0;
  const isDueSoon = !isOverdue && daysUntilDue <= dueSoonDaysThreshold;

  return {
    isOverdue,
    daysOverdue,
    isDueSoon,
    daysUntilDue,
  };
}

/**
 * Checks if secondary translations in a LocalizedField are stale relative to the source language.
 * A translation is stale if the source was updated AFTER the translation was updated.
 *
 * @param field - The LocalizedField containing translations
 * @param sourceLocale - Primary locale (default "en")
 */
export function checkStaleTranslations(
  field: LocalizedField,
  sourceLocale: "en" = "en"
): {
  hasStaleTranslations: boolean;
  staleLocales: Array<"vi" | "ko">;
} {
  const sourceUpdatedAt = new Date(field[sourceLocale].updated_at).getTime();
  const staleLocales: Array<"vi" | "ko"> = [];

  const secondaryLocales: Array<"vi" | "ko"> = ["vi", "ko"];

  for (const locale of secondaryLocales) {
    const entry = field[locale];
    if (entry) {
      const entryUpdatedAt = new Date(entry.updated_at).getTime();
      if (entryUpdatedAt < sourceUpdatedAt) {
        staleLocales.push(locale);
      }
    }
  }

  return {
    hasStaleTranslations: staleLocales.length > 0,
    staleLocales,
  };
}
