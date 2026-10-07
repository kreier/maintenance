# ROADMAP.md — Phased Development Plan

This document details the step-by-step development roadmap for `kreier/maintenance`. In accordance with our guiding principle (*"Keep it small. Build thin vertical slices and prefer real-world evidence over premature abstraction"*), implementation advances phase by phase.

---

## 🧭 Overview of Phases

| Phase | Title | Focus Area | Status |
| :--- | :--- | :--- | :--- |
| **Phase 1** | **Foundation** | Repository layout, schema definitions, synthetic fixture, seed script, CI | 🟡 **In Progress** |
| **Phase 2** | **Objects** | Physical facilities, rooms, equipment records, stable IDs, relationships | ⚪ Pending |
| **Phase 3** | **Maintenance** | Events, service intervals, age calculation, overdue alerts, dashboard UI | ⚪ Pending |
| **Phase 4** | **Worker & Auth** | Cloudflare Worker, Turnstile, session cookies, roles, private R2 proxy | ⚪ Pending |
| **Phase 5** | **Documents** | File upload/download streaming, metadata tracking, versioned history | ⚪ Pending |
| **Phase 6** | **Translations** | Locale fields (EN/VI/KO), review workflow (`HUMAN-APPROVED`), stale check | ⚪ Pending |
| **Phase 7** | **Audit & Backup** | Append-only audit records, R2 manifests, admin Google Drive backup | ⚪ Pending |
| **Phase 8** | **Setup & Forks** | One-time `workflow_dispatch` provisioning, setup page, fork guide | ⚪ Pending |
| **Phase 9** | **Hardening** | Rate limits, security audit, weak-device optimization, recovery drill | ⚪ Pending |

---

## 📌 Detailed Phase Specifications

### Phase 1 — Foundation (Current Target)
**Goal**: Establish a robust, reproducible development environment and canonical data contracts.
- [x] Operational agent guidelines ([AGENTS.md](file:///home/mk/AI-Agents/antigravity/maintenance/AGENTS.md))
- [x] Architecture design specification ([ARCHITECTURE.md](file:///home/mk/AI-Agents/antigravity/maintenance/ARCHITECTURE.md))
- [x] Phased roadmap ([ROADMAP.md](file:///home/mk/AI-Agents/antigravity/maintenance/ROADMAP.md))
- [ ] Core directory structure (`app/`, `worker/`, `schema/`, `data/example/`, `scripts/`)
- [ ] Canonical Zod schemas for Facility, Room, Equipment, Maintenance, and Translations
- [ ] Synthetic example dataset (`data/example/`) serving as public demo and CI test fixture
- [ ] Validation and seed script (`scripts/seed.ts` / `scripts/validate.ts`)
- [ ] GitHub Actions CI workflow to validate schemas and synthetic data on PRs

### Phase 2 — Objects
**Goal**: Model physical assets deterministically with stable IDs.
- Define hierarchical relationship: `Facility` → `Building/Area` → `Room` → `Equipment`.
- Create data views in the static web application to browse facilities and equipment.
- Implement search and filtering across categories (HVAC, Electrical, Plumbing, Structural).
- Provide stable deep links to individual object IDs (e.g. `#/objects/HVAC-ROOM2-001`).

### Phase 3 — Maintenance
**Goal**: Compute ages, schedules, and maintenance statuses dynamically from raw dates.
- Implement date calculation engine (calculates precise equipment age, next maintenance date, and days overdue).
- Implement maintenance event logging data structure (inspection, service, repair, replacement).
- Build the maintenance dashboard:
  - Overdue items highlighted in warning/danger states.
  - Upcoming maintenance calendar / list for the next 30/60/90 days.
  - Interactive graphs (e.g., equipment age distribution, service history).

### Phase 4 — Cloudflare Worker & Authentication
**Goal**: Establish the authoritative security layer and connect to Cloudflare R2.
- Scaffold Cloudflare Worker with `wrangler.toml`.
- Implement client-side key derivation (PBKDF2 / Argon2id WASM) and server-side HMAC validation.
- Integrate Cloudflare Turnstile token verification on login.
- Issue secure, HttpOnly session cookies.
- Implement role-based authorization (`viewer`, `editor`, `reviewer`, `administrator`).
- Implement R2 read/write endpoints with strict server-side schema validation.

### Phase 5 — Documents & Media
**Goal**: Enable document and media archiving through the Worker proxy into R2.
- Implement streaming file upload and download endpoints in the Worker (avoiding 128MB memory buffer limit).
- Attach document metadata (title, category, upload date, file size, SHA-256) to equipment objects.
- Ensure immutable file storage: updates archive the previous file version under `history/`.

### Phase 6 — Multilingual Translation Workflow
**Goal**: Enable high-integrity translations in English, Vietnamese, and Korean.
- Store multi-locale text structures with state tracking (`DRAFT`, `AI-PROPOSED`, `HUMAN-APPROVED`).
- Build reviewer UI allowing authorized bilingual reviewers to approve translations.
- Implement automatic stale-translation detection (marks translations outdated when source changes).
- Establish shared terminology glossary (`schema/glossary.json`).

### Phase 7 — Audit Trail & Off-Platform Backup
**Goal**: Provide accountability and disaster recovery.
- Append-only audit logger in Worker writing to `history/audit.jsonl`.
- Manifest generation service creating SHA-256 checksums of all active R2 objects.
- Admin-initiated Google Drive backup module:
  - Uses `drive.file` OAuth scope in the admin's browser.
  - Compares local R2 manifest against Drive contents.
  - Non-destructive sync: moves missing items to `removed/` rather than deleting.
  - Emits synchronized backup log entries.

### Phase 8 — Setup Workflow & Forking
**Goal**: Make the product completely turnkey for new facility deployments.
- Build GitHub Actions `workflow_dispatch` provisioning workflow using `wrangler` and Cloudflare API.
- Automated creation of R2 bucket, Turnstile widget, and Worker secrets from repository secrets.
- Initial schema and admin user seed.
- Setup checklist page verifying installation health.
- Comprehensive step-by-step fork documentation.

### Phase 9 — Hardening & Operational Review
**Goal**: Production-readiness and resiliency.
- Rate limiting and abuse prevention on the Cloudflare Worker.
- Performance optimization on weak client devices (Web Worker offloading, IndexedDB caching).
- Disaster recovery drill and restoration testing.
- Security review and dependency auditing.
