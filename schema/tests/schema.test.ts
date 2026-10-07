import { describe, it, expect } from "vitest";
import {
  FacilityObjectSchema,
  computeAge,
  computeNextMaintenance,
  computeOverdueStatus,
  checkStaleTranslations,
} from "../src/index.js";

describe("Canonical Schemas", () => {
  it("validates a compliant facility object", () => {
    const valid = {
      id: "HVAC-ROOM2-001",
      type: "equipment",
      category: "hvac",
      facility_id: "FAC-DEMO-001",
      room_id: "ROOM-002",
      name: {
        en: {
          text: "Secondary Room Air Conditioner",
          status: "HUMAN-APPROVED",
          updated_at: "2024-06-15T09:00:00Z",
        },
      },
      manufacturer: "Daikin",
      model: "FTKF35",
      installed: "2024-06-15",
      status: "active",
      maintenance: {
        interval_months: 6,
        last_serviced: "2026-08-15",
      },
      documents: [],
    };

    const parsed = FacilityObjectSchema.parse(valid);
    expect(parsed.id).toBe("HVAC-ROOM2-001");
  });

  it("rejects an object with an invalid stable ID format", () => {
    const invalid = {
      id: "invalid_id_format",
      type: "equipment",
      category: "hvac",
      facility_id: "FAC-DEMO-001",
      room_id: "ROOM-002",
      name: {
        en: {
          text: "Test Equipment",
          status: "DRAFT",
          updated_at: "2024-06-15T09:00:00Z",
        },
      },
      installed: "2024-06-15",
      status: "active",
      documents: [],
    };

    expect(() => FacilityObjectSchema.parse(invalid)).toThrow();
  });
});

describe("Calculations Engine (Facts as Data)", () => {
  it("computes accurate equipment age", () => {
    const age = computeAge("2024-06-15", "2026-06-15");
    expect(age.years).toBe(2);
    expect(age.months).toBe(0);
    expect(age.totalMonths).toBe(24);
  });

  it("computes next scheduled maintenance date", () => {
    const nextDate = computeNextMaintenance("2026-08-15", 6);
    expect(nextDate).toBe("2027-02-15");
  });

  it("accurately detects overdue maintenance", () => {
    // Scheduled for 2025-12-01, current date 2026-10-07 -> overdue by >300 days
    const overdue = computeOverdueStatus("2025-12-01", "2026-10-07");
    expect(overdue.isOverdue).toBe(true);
    expect(overdue.daysOverdue).toBeGreaterThan(300);
    expect(overdue.isDueSoon).toBe(false);
  });

  it("detects due soon when within threshold", () => {
    // Scheduled for 2026-10-25, current date 2026-10-07 -> due in 18 days
    const status = computeOverdueStatus("2026-10-25", "2026-10-07", 30);
    expect(status.isOverdue).toBe(false);
    expect(status.isDueSoon).toBe(true);
    expect(status.daysUntilDue).toBe(18);
  });

  it("flags stale translations when source text was modified later", () => {
    const localized = {
      en: {
        text: "New English Title updated in 2026",
        status: "HUMAN-APPROVED" as const,
        updated_at: "2026-05-10T12:00:00Z",
      },
      vi: {
        text: "Tiêu đề tiếng Việt cũ từ 2024",
        status: "HUMAN-APPROVED" as const,
        updated_at: "2024-03-01T10:00:00Z",
      },
      ko: {
        text: "최신 한국어 번역",
        status: "HUMAN-APPROVED" as const,
        updated_at: "2026-05-11T09:00:00Z",
      },
    };

    const staleResult = checkStaleTranslations(localized, "en");
    expect(staleResult.hasStaleTranslations).toBe(true);
    expect(staleResult.staleLocales).toEqual(["vi"]);
  });
});
