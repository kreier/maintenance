# Cloudflare R2 Layout Specification

This document defines the key layout for the private Cloudflare R2 bucket provisioned for each real facility installation.

```text
<bucket-root>/
│
├── data/
│   ├── facility.json              # Facility configuration & locale settings
│   ├── users.json                 # User accounts, hashed credentials, roles
│   ├── objects/                   # Active object records
│   │   ├── <OBJECT-ID>.json       # e.g., HVAC-ROOM2-001.json
│   │   └── ...
│   └── maintenance/               # Maintenance events
│       ├── <EVENT-ID>.json        # e.g., EVT-2026-0001.json
│       └── ...
│
├── history/
│   ├── objects/
│   │   └── <OBJECT-ID>/
│   │       ├── <ISO-TIMESTAMP>.json
│   │       └── ...
│   └── audit.jsonl                # Append-only audit events log
│
├── summaries/
│   ├── dashboard.json             # Pre-aggregated stats, upcoming tasks, overdue count
│   └── equipment-index.json       # Minimal index for instant client-side search
│
├── documents/
│   ├── manuals/
│   ├── plans/
│   └── photos/
│
└── manifests/
    ├── manifest-latest.json       # Snapshot of all keys, sizes, and SHA-256 hashes
    └── backup-log.json            # Mutual log of admin Google Drive backups
```

## Security & Access
- The browser **never** connects directly to R2 and does not possess R2 credentials.
- All R2 read and write operations are proxied and validated by the installation's Cloudflare Worker.
