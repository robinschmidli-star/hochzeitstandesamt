# Media ingestion pipeline

## IST, weaknesses, target and migrations

- **IST:** Canonical UUIDs live in PostgreSQL; generated Office/Venue TypeScript feeds the website;
  `safe-media.ts` gates publication. Typed `venue_office_assignments` already separates administrative
  responsibility from venues. Generic `media_assets`, `media_entity_links`, `media_rights`,
  `match_candidates` and `review_queue` tables already exist.
- **Weaknesses:** the former audit used one coarse folder confidence, did not score candidate margins,
  and had no independent photo match, subject, quality or duplicate state.
- **Target:** folder matching is only a photo context prior. Every photo has its own identity, match,
  verification, subject, quality, duplicate and publication fields. Offices and venues remain separate;
  `registry_office_venue` is reserved as an additional entity classification, not inferred.
- Administrative links reuse `venue_office_assignments`; its `kind` represents `responsible_for`,
  `performs_ceremonies_at` or `official_ceremony_venue` without embedding an office into a venue name.
- **Migration:** Alembic `0009` extends the existing media tables additively with typed assets,
  entity links and image-level rights. Conservative defaults are `needs_review` and
  `copyright_review`. `web_public_media` exposes only approved assets with unambiguous allowed rights;
  conditioned rights additionally require attribution text. Gmail bodies remain in Gmail and are
  referenced internally through `communications`.
  Canonical UUIDs, TL references and slugs remain unchanged.

## Status and scope

This document specifies a future ingestion path. The current website flow remains unchanged:

`Canonical PostgreSQL -> sync-canonical-database.mjs -> generated TypeScript -> safe-media.ts -> website`

`safe-media.ts` remains the publication gate. An image is public only when `imageStatus` is exactly
`approved`. The inventory audit never sets this value, changes the database, or moves/downloads files.

## Read-only inventory

Run from the website directory:

```powershell
node scripts/audit-media-inventory.mjs --root "..\Standesaemter_Fotos"
```

Optional inputs:

- `--drive-root-id`: records the known root folder ID; individual Drive IDs remain `UNKNOWN` until a
  future Drive API inventory is implemented.
- `--gmail-evidence <json>`: consumes a previously reviewed, structured evidence summary. The script
  does not search, download, send, label, or otherwise change Gmail.
- `--report-dir`: changes only the report output directory.

The output is `reports/media-inventory-audit.json` plus a compact Markdown view. Exact canonical
matches may carry a `canonicalId`; fuzzy, duplicate, and ambiguous matches contain candidate IDs only.
The same run also writes `media-canonical-crosswalk.json`, `.csv`, and `.md`. These files contain
proposal-only decisions; every newly proposed match still requires explicit approval before import.
Matching thresholds and weights come from `config/matching_rules/default.yaml`. Candidate score and
runner-up margin are stored separately. A high folder score never sets a photo score.

## Proposed canonical model

Existing PostgreSQL remains the sole source of truth. Extend the existing media tables instead of
creating another master database.

### MediaAsset

- stable UUID
- storage provider and immutable provider file ID
- original filename, MIME type, byte size and checksum
- source URL/reference
- created/imported timestamps
- technical metadata (dimensions, orientation)

### MediaEntityLink

- media asset UUID
- exactly one canonical entity type (`OFFICE` or `VENUE`) and entity UUID
- primary-image flag
- sort order
- alt text / locale where needed

### MediaRights

- media asset UUID
- permission status: `UNKNOWN`, `REVIEW_REQUIRED`, `GRANTED`,
  `GRANTED_WITH_CONDITIONS`, `REJECTED`, `EXPIRED`
- source, licence, attribution and rights holder
- permission evidence reference and optional Gmail message reference
- verification timestamp and verifier

Public export additionally requires an explicit approved publication decision. A rights grant alone
must never automatically publish an asset.

## Future Gmail-assisted flow

1. Search only relevant threads for an already matched Office/Venue.
2. Classify MIME parts; ignore signatures, logos, tracking pixels and unrelated PDFs.
3. Record message/attachment identifiers and evidence without downloading by default.
4. Compare filename, size and checksum against Drive to avoid duplicates.
5. Propose a target entity and Drive destination.
6. Route ambiguity, conflicting rights, third-party ownership and expiring transfer links to review.
7. Only after explicit approval: copy an attachment, create canonical Media/MediaRights records, and
   separately approve publication.

No Gmail write operation is needed for ingestion. Import must be idempotent using provider attachment
ID plus checksum.

## Safe implementation phases

1. Keep this inventory dry-run and resolve entity mapping conflicts.
2. Inspect/extend the existing media schema with an Alembic migration; no legacy import yet.
3. Backfill metadata and rights into staging, preserving paths and IDs.
4. Add approved-only canonical media export to `sync-canonical-database.mjs` while retaining
   `safe-media.ts` and current generated files.
5. Add Gmail attachment ingestion behind explicit dry-run/approved-only commands.
6. Switch public media only after report review, tests and preview approval.

## Known limitations

- Mounted Drive paths do not expose stable Drive file/folder IDs.
- Empty `rechte.txt` templates are not permission evidence.
- `nutzung_erlaubt` and `cms_import_ready` in the authoritative master data still require inspection.
- Similar venue names can represent duplicates, rooms, or separate entities; fuzzy matches are never
  auto-approved.
- Transfer links may expire and do not prove that files were safely archived.
