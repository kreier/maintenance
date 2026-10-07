# Schemas Directory (`/schema`)

This directory contains the canonical data schemas for `kreier/maintenance`.

These schemas represent the single source of truth for:
1. Physical facility objects (buildings, rooms, equipment, utilities).
2. Maintenance events and service schedules.
3. Multilingual text structures with translation workflow states (`DRAFT`, `AI-PROPOSED`, `HUMAN-APPROVED`).
4. Terminology glossaries (`glossary.json`).

## Design Rules

- **Facts as Data**: Schemas store raw installation timestamps and intervals. Derived values (e.g. current age, days overdue) are never stored in the schema.
- **Universal Validation**: Schemas are designed to be validated both in the browser (client-side form validation) and in the Cloudflare Worker (server-side gatekeeper before persisting to R2).
- **TypeScript & Zod First**: Schemas are defined in TypeScript using Zod and can be compiled into standard JSON Schema for multi-language compatibility.
