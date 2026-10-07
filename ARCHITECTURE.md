# System Architecture — kreier/maintenance

**Status**: Active Architecture Specification (October 2026)  
**Reference**: [Brainstorming Gist](https://gist.github.com/kreier/bfde5cdc13e94460630d7a4a5d393b01)

---

## 1. High-Level Summary

`kreier/maintenance` is an open-source, multilingual (EN/VI/KO) facility documentation and maintenance platform designed for community facilities, conference halls, and shared buildings.

### The Core Distiction: Product vs. Installation

| Concern | Product (`kreier/maintenance`) | Installation (e.g. forked deployment) |
| :--- | :--- | :--- |
| **Location** | Public GitHub repository | Independent Cloudflare account + R2 bucket |
| **Contents** | App code, Worker code, schemas, tests, synthetic example data, setup workflows | Real equipment facts, real photos, architectural plans, users, sessions, audit records |
| **Hosting** | GitHub Pages (public demo) | GitHub Pages (or Cloudflare Pages) |
| **Visibility** | Public (Open Source) | Private authenticated data in R2 |

> **Guiding Rule**: If it defines *how* Maintenance works, it belongs in Git. If it records *what happened* at a real facility, it belongs in that facility's R2 bucket. Large binary files live in R2, never in Git.

---

## 2. System Topology

```text
                          Public GitHub Repository
                     ┌──────────────────────────────┐
                     │ Static Web Application (Vite) │
                     │ Cloudflare Worker API code   │
                     │ Schemas (Zod / JSON Schema)  │
                     │ Synthetic Example Fixture    │
                     │ Setup / Deployment Workflows │
                     └──────────────┬───────────────┘
                                    │  Continuous Deployment
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Client Browser (Public Static Web App)                                 │
│                                                                        │
│ • Public Mode: Browses synthetic "Example" facility data               │
│ • Authenticated Mode: Accesses private facility data                   │
│ • Client-side computation: Dashboards, age calculation, overdue items  │
│ • Heavy background tasks: Web Worker with progress bar                 │
│ • Performance: Local caching in IndexedDB                              │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    │ HTTPS (Session Cookie + Turnstile)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Cloudflare Worker (Authoritative Security & API Gateway)               │
│                                                                        │
│ • Turnstile verification & rate limiting                               │
│ • Authentication & HttpOnly session management                         │
│ • Role-based authorization (Viewer, Editor, Reviewer, Administrator)   │
│ • Schema validation on all incoming writes                             │
│ • Private Cloudflare R2 proxy (streaming uploads & downloads)          │
│ • Append-only audit record creation (user, timestamp, action, diff)   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    │ Cloudflare Bindings
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Cloudflare R2 (Installation Private Storage)                           │
│                                                                        │
│ • data/       Current facility state (objects, maintenance records)   │
│ • history/    Archived previous versions of updated records           │
│ • summaries/  Precomputed small JSON summaries for instant dashboards  │
│ • documents/  PDFs, architectural blueprints, photos, scans, manuals   │
│ • manifests/  Versioned file lists for integrity & backup comparison   │
└────────────────────────────────────────────────────────────────────────┘

     Administrator Browser ───────► Google Drive (drive.file scope)
                                     Optional manual, non-destructive backup
```

---

## 3. Storage Model & Cloudflare R2 Layout

Cloudflare R2 provides S3-compatible object storage without egress fees. The data in R2 is partitioned as follows:

```text
r2-bucket/
├── data/
│   ├── facility.json              # Facility metadata and global configuration
│   ├── users.json                 # User accounts, hashed credentials, roles
│   ├── objects/
│   │   ├── HVAC-ROOM2-001.json    # Individual object records
│   │   └── ...
│   └── maintenance/
│       ├── EVT-2026-0001.json     # Individual maintenance event records
│       └── ...
│
├── history/
│   ├── objects/
│   │   └── HVAC-ROOM2-001/
│   │       ├── 2026-08-15T10-00-00Z.json
│   │       └── ...
│   └── audit.jsonl                # Append-only chronological audit log
│
├── summaries/
│   ├── dashboard.json             # Precomputed counts, upcoming maintenance, alerts
│   └── equipment-index.json       # Lightweight index for instant client search
│
├── documents/
│   ├── manuals/
│   │   └── DOC-MAN-001.pdf
│   ├── plans/
│   │   └── PLAN-LVL1-ELEC.pdf
│   └── photos/
│       └── PHO-HVAC-001-INSTALL.jpg
│
└── manifests/
    ├── manifest-latest.json       # Current keys, sizes, and SHA-256 hashes
    └── backup-log.json            # History of backup executions
```

---

## 4. Physical Object & Maintenance Data Model

### Stable Object IDs
Every documented entity has a stable, deterministic ID:
- Format: `[CATEGORY]-[LOCATION/ROOM]-[SEQUENCE]`
- Example: `HVAC-ROOM2-001`, `ELEC-MAIN-PANEL`, `DOOR-HALL-EAST`

### Principle: Facts are Raw Data, Never Prose
- We record raw dates and measurable parameters (`installed: "2024-06-15"`, `maintenance.interval_months: 6`).
- We never store computed prose like `"the AC is roughly two years old"`.
- The application computes:
  - Exact age (years / months).
  - Next scheduled maintenance date.
  - Overdue status (days overdue, urgency indicator).

### Object Schema Example
```yaml
id: HVAC-ROOM2-001
type: equipment
category: hvac
location_id: ROOM-002
name:
  en: Secondary Room Air Conditioner
  vi: Máy lạnh phòng thứ hai
  ko: 보조실 에어컨
manufacturer: Daikin
model: FTKF35
serial_number: J019284-B
installed: "2024-06-15"
status: active
maintenance:
  interval_months: 6
  last_serviced: "2026-08-15"
documents:
  - id: DOC-MAN-001
    title: User & Service Manual
    filename: daikin_ftkf35_manual.pdf
```

---

## 5. Multilingual Documentation Strategy

The platform natively supports English (`en`), Vietnamese (`vi`), and optionally Korean (`ko`).

### Three Translation States
Descriptive fields store locale entries with an explicit verification status:
1. `DRAFT`: Written draft or untranslated placeholder.
2. `AI-PROPOSED`: Generated by an LLM or translation engine.
3. `HUMAN-APPROVED`: Reviewed and approved by a qualified bilingual reviewer.

### Stale Translation Invalidation
When source text (e.g. `en`) is modified, any dependent translations (`vi`, `ko`) are automatically flagged as **stale/outdated**, requiring re-review by a human reviewer.

### Terminology Glossary
A shared vocabulary dictionary (`schema/glossary.json`) ensures consistency across equipment categories and maintenance operations.

---

## 6. Authentication, Security & Permissions

### Client-Side Key Derivation + Server HMAC
To avoid exhausting the Cloudflare Worker free tier CPU limits (~10ms CPU per request):
1. The browser runs an initial cryptographic KDF (such as PBKDF2 or Argon2id via WASM).
2. The browser sends the derived value + Cloudflare Turnstile token over HTTPS.
3. The Worker verifies Turnstile, then verifies the derived credential using HMAC with a server-side secret and constant-time comparison (`crypto.subtle`).
4. On success, the Worker sets a secure `HttpOnly`, `SameSite=Strict`, `Secure` session cookie.

### Roles and Permissions
Permissions are location-scoped:
- `viewer`: Can browse objects, maintenance histories, and view documents.
- `editor`: Can create/update object data, log maintenance events, and upload documents.
- `reviewer`: Can review and mark translations as `HUMAN-APPROVED`.
- `administrator`: Can manage users, trigger backups, and alter facility configuration.

---

## 7. Backup and Recovery

1. **R2 is NOT a backup**: R2 is the primary storage system. A backup must reside in an independent failure domain.
2. **Admin-Initiated Google Drive Backup**:
   - Performed from the administrator's browser with the narrow `drive.file` OAuth scope.
   - Compares the R2 manifest against the Google Drive backup folder.
   - Non-destructive: missing files in R2 are moved to `removed/` in Drive, never permanently erased automatically.
   - Produces a mutual audit record on both R2 and Google Drive.
3. **Automated Secondary Bucket Copy (Future Option)**:
   - A scheduled Cloudflare Worker can mirror R2 to an independent S3/B2 bucket without browser interaction.
