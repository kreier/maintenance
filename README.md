# Maintenance (`kreier/maintenance`)

> **Open-source, multilingual facility documentation and maintenance tracking platform.**

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-active%20development-green.svg)](ROADMAP.md)

---

## 🏢 Overview

`kreier/maintenance` is built to document physical facilities, track equipment facts (install dates, maintenance intervals, service history), archive construction blueprints and manuals, and provide clean dashboards and reports.

The initial installation serves a multi-group community conference hall with documentation primarily in **English (`en`)**, **Vietnamese (`vi`)**, and **Korean (`ko`)**.

### Product vs. Installation

This project separates the software product from actual facility data:
- **The Product (`kreier/maintenance`)**: Lives here in this public GitHub repository (source code, schemas, documentation, CI workflows, synthetic test fixtures).
- **The Installation**: A physical facility deploys its own private installation by forking this repository and connecting to its own private **Cloudflare R2** bucket and **Cloudflare Worker**.

Real facility data (blueprints, real equipment serial numbers, private photos, user accounts) **never** enters the public Git history.

---

## ⚡ Architectural Principles

1. **No Standalone Server to Operate**: The web interface is a static web application hosted on GitHub Pages. The only backend logic is a lightweight Cloudflare Worker.
2. **Browser Untrusted for Writes**: The browser handles presentation, dashboards, and client-side calculations (using Web Workers and IndexedDB). The Cloudflare Worker is the authoritative security boundary enforcing authentication, permissions, schema validation, and audit logs.
3. **Facts are Data, Not Prose**: Store raw dates (`installed: 2024-06-15`, `interval_months: 6`). The system computes current equipment age and overdue statuses on the fly.
4. **Stable Object IDs**: Every asset has a deterministic identifier (e.g., `HVAC-ROOM2-001`).
5. **High-Integrity Multilingual Review**: Texts transition through `DRAFT` → `AI-PROPOSED` → `HUMAN-APPROVED`. Changes to source text flag translations as outdated.
6. **Immutable History**: Previous revisions are retained under `history/` in R2.
7. **External Backups**: R2 is the primary store. An administrator can trigger manual non-destructive backups to Google Drive using manifest comparison.

---

## 📂 Project Documentation

- 🤖 **[AGENTS.md](AGENTS.md)**: AI agent instructions, immutable guardrails, and conventions for AI-assisted pair programming.
- 🏛️ **[ARCHITECTURE.md](ARCHITECTURE.md)**: Comprehensive architectural specification, security topology, data flow, and R2 layout.
- 🗺️ **[ROADMAP.md](ROADMAP.md)**: The 9-phase step-by-step roadmap and development milestones.

---

## 🚀 Repository Layout

```text
kreier/maintenance/
├── app/                       # Static web app (Vite + React + TypeScript)
├── worker/                    # Cloudflare Worker API & R2 proxy gateway
├── schema/                    # Canonical data schemas (Zod / JSON Schema)
├── data/
│   └── example/               # Synthetic example facility (CI test fixture & demo)
├── docs/                      # Technical documentation & guides
└── scripts/                   # Validation, seed generation, and migration tools
```

---

## 🛠️ Getting Started

*(Development environment setup instructions will be updated as Phase 1 scaffolding proceeds.)*

---

## 📄 License

This project is open-source software licensed under the [Apache License 2.0](LICENSE).
