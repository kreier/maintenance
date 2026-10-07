# AGENTS.md — AI Agent Guidelines & Architecture Guardrails

Welcome to `kreier/maintenance`. This document is the primary operational manual and constraint system for all AI coding agents (such as Antigravity, Claude, Codex, Copilot, etc.) and human contributors working on this codebase.

Every agent working on this repository **must read and adhere strictly** to the rules, security boundaries, and architectural principles detailed below.

---

## 1. Project Mission & Identity

- **The Product**: `kreier/maintenance` is an open-source, multilingual (EN / VI / KO) facility documentation and maintenance tracking system.
- **The Distinction**:
  - `kreier/maintenance` is the **product** (software, schemas, synthetic fixtures, workflows, documentation).
  - A real facility is an **installation** (private data, physical equipment records, real documents, private users).
- **Core Principle**: Real facilities run by forking this repository or deploying against their own independent Cloudflare resources. The public codebase must remain strictly generic, modular, and reusable.

---

## 2. Immutable Architecture Guardrails (DO NOT BREAK)

### 🔴 Security & Privacy Boundary
1. **NEVER commit private facility data to Git**:
   - Real equipment records, private manuals, architectural blueprints, facility photos, real usernames, passwords, sessions, or access logs belong **exclusively in Cloudflare R2**, never in Git.
   - Public forks cannot be made private on GitHub; any data in Git is world-readable.
2. **NEVER commit secrets**:
   - Cloudflare API tokens, Worker secrets, Turnstile secrets, or Google OAuth keys must only live in repository secrets or Cloudflare Worker bindings.
3. **Public GitHub Actions logs are world-readable**:
   - Workflows must never echo private installation data or tokens.
   - Scripts running in CI or Actions must output generic error codes and report IDs, never detailed data payloads.

### 🔴 Architectural Boundaries
4. **No standalone backend servers to operate**:
   - Do **NOT** introduce a FastAPI, Express, Django, or Dockerized backend server.
   - The frontend is a static web app deployed on GitHub Pages (or Cloudflare Pages).
   - The only backend logic is a single **Cloudflare Worker** per installation.
5. **The Browser is UNTRUSTED for writes**:
   - The browser is responsible for UI, dashboards, search, data visualizations, and heavy read-only computations (via Web Workers and IndexedDB cache).
   - The browser is **never trusted** for writes, authentication state, role authorization, schema validation, or audit timestamps. The Cloudflare Worker is the sole authoritative security boundary.
6. **Cloudflare R2 is the primary data store**:
   - All private structured data, history versions, summaries, and documents reside in the installation's R2 bucket.
   - R2 credentials are never passed to the browser; the Worker proxies all authorized R2 access.
7. **Google Drive is ONLY an admin-controlled backup target**:
   - Do **NOT** make Google Drive a primary operational database or dependency for regular users.
   - Google Drive is used strictly for administrator-initiated backups (`drive.file` scope) with manifest comparisons and non-destructive moves to `removed/`.

### 🔴 Data Modeling & Integrity
8. **Facts are raw data, never prose**:
   - Store: `installed: "2024-06-15"`, never `"about two years old"`.
   - The application computes current age, next maintenance date, and overdue flags dynamically.
9. **Stable Object IDs**:
   - Every physical entity (room, equipment, sub-assembly) must have a deterministic, stable ID (e.g. `HVAC-ROOM2-001`).
10. **Preserve History (Append-Only)**:
    - Never overwrite original uploaded documents or destroy past state.
    - Updates create a new record and archive the previous version under `history/` with an append-only audit log entry (who, when, what, previous version).
11. **Three Translation States**:
    - Multilingual texts (`en`, `vi`, `ko`) must explicitly track their status:
      - `DRAFT`
      - `AI-PROPOSED`
      - `HUMAN-APPROVED`
    - AI may suggest translations, but only authorized human reviewers can promote them to `HUMAN-APPROVED`.
    - Modifying the source text marks all dependent translations as **outdated**.

---

## 3. Repository Structure & Conventions

```text
kreier/maintenance/
├── AGENTS.md                  # This file (AI instructions & constraints)
├── ARCHITECTURE.md            # In-depth architectural design
├── ROADMAP.md                 # 9-phase step-by-step roadmap
├── README.md                  # User & developer entry point
│
├── app/                       # Static web application (Vite + React + TS)
│   ├── src/
│   │   ├── components/        # UI components & dashboards
│   │   ├── workers/           # Web Workers for heavy compute
│   │   ├── services/          # Worker API client & IndexedDB cache
│   │   └── locales/           # App UI translations (en, vi, ko)
│   └── public/
│
├── worker/                    # Cloudflare Worker (Auth, API, R2 proxy)
│   ├── src/
│   │   ├── auth/              # Sessions, Turnstile, password verification
│   │   ├── routes/            # R2 data endpoints & file proxy
│   │   └── audit/             # Append-only audit logger
│   └── wrangler.toml          # Worker configuration template
│
├── schema/                    # Canonical schemas (Zod / JSON Schema)
│   ├── object.ts              # Equipment, room, facility schema
│   ├── maintenance.ts         # Maintenance schedule & event schema
│   └── translation.ts         # Multilingual text & glossary schema
│
├── data/
│   └── example/               # Synthetic public demo facility (CI fixture)
│       ├── objects/           # Example equipment & rooms
│       ├── maintenance/       # Example service history
│       └── documents/         # Sample placeholder files
│
├── docs/                      # Extended technical documentation & guides
└── scripts/                   # Seed generators, validators, migration tools
```

---

## 4. Development Workflow for Agents

### Step-by-Step Rule
Develop incrementally according to [ROADMAP.md](file:///home/mk/AI-Agents/antigravity/maintenance/ROADMAP.md). Never attempt to implement all phases in a single massive dump. Build small, verified slices:
1. **Foundation First**: Define the schema, seed the synthetic example data, ensure tests pass.
2. **Verify with Synthetic Data**: Every feature (views, age calculations, translation flags) must be verified against `data/example/`.
3. **Keep the Code Small & Maintainable**: Prefer clean, standard Web APIs and battle-tested libraries over heavy abstractions.

### Testing & Verification
- Unit and schema tests must run in GitHub Actions on every pull request.
- The example dataset in `data/example/` is the primary test fixture. Any schema change must update both the schema definition and the example dataset.
- Always run automated checks (linting, type checking, test suites) before completing a task.

---

## 5. Guidance for Specific Subsystems

### Multilingual Documentation
- Keep shared glossaries in `schema/glossary.json` (or `.ts`) to ensure uniform terminology (e.g., `air_conditioner` → `en: air conditioner`, `vi: máy lạnh`, `ko: 에어컨`).
- When introducing new text fields, always structure them to support locale objects `{ en: string, vi?: string, ko?: string }` with metadata `{ status: "DRAFT" | "AI-PROPOSED" | "HUMAN-APPROVED", updated_at: string }`.

### Cloudflare Worker & Free Tier Limits
- Worker CPU limits on the Cloudflare free tier are modest (~10ms CPU per request).
- Stream large file uploads and downloads directly to/from R2 rather than buffering in Worker memory (128MB limit).
- Avoid performing heavy cryptographic password derivation inside the Worker; verify pre-derived client values via fast server HMAC/constant-time comparison.

---

## 6. Checklist Before Every Commit / PR
- [ ] No hardcoded secrets or environment variables.
- [ ] No private facility data or unvetted binary files in Git.
- [ ] Conforms to the `ARCHITECTURE.md` component boundaries.
- [ ] All schema modifications are reflected in `data/example/`.
- [ ] Automated tests and linters pass cleanly.
