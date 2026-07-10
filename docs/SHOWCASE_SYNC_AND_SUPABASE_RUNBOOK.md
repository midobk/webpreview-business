# Showcase Sync and Supabase Operations Runbook

**Last updated:** 2026-07-10  
**Status:** Production implementation complete  
**Related pull requests:** #4 and #5  
**Production deployment verified:** commit `3072f8c332b4dd33c10ff844e02b6758b419a431`

## Purpose

This document is the durable operational reference for the SiteSprint public showcase, its prototype metadata, Supabase synchronization, deployment safeguards, and the Supabase security hardening completed on July 10, 2026.

It exists to prevent a repeat of the incident where prototype files and preview routes were deployed successfully, but newly approved showcase cards did not appear because production was reading stale Supabase records instead of the committed JSON bundle.

## Source-of-truth model

The project has two representations of prototype metadata:

- `data/prototypes.json` is the version-controlled source used by agents, review workflows, and build-time validation.
- Supabase `public.prototypes` is the production runtime source read by the public showcase.

The deployment pipeline keeps these representations synchronized. A production deployment must not succeed when the repository and Supabase disagree.

The public `/showcase` route is dynamic and reads current Supabase data on each request. It does not rely on a stale prerendered snapshot.

## Production deployment flow

`npm run build` invokes the following `prebuild` sequence:

```bash
node scripts/sync-prototypes-to-supabase.mjs --auto
node scripts/build-data-bundle.js
```

For a Vercel **production** build, the sync script:

1. Loads and validates `data/prototypes.json`.
2. Rejects duplicate IDs and incomplete showcase-visible records.
3. Normalizes legacy timestamp values that contain both a numeric UTC offset and a trailing `Z`.
4. Upserts all allowed prototype fields into Supabase using `id` as the conflict key.
5. Reads the records back from Supabase.
6. Compares the repository and database values for drift.
7. Confirms that the expected number of records pass the public showcase filter.
8. Exits non-zero and blocks deployment when any validation, upsert, drift, or count check fails.

For preview and local builds, the script validates local metadata but does not mutate production Supabase unless an explicit sync command is used.

## Commands

### Validate repository metadata only

```bash
npm run check:showcase-metadata
```

This command does not require Supabase credentials and does not make remote changes.

### Check for repository-to-Supabase drift

```bash
npm run check:showcase-sync
```

Required environment variables:

```bash
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

`NEXT_PUBLIC_SUPABASE_URL` may be used instead of `SUPABASE_URL`, but the service-role key is still required.

### Explicitly synchronize prototypes

```bash
npm run sync:showcase
```

This validates, upserts, and verifies the records. Use it for controlled operational repair or local administration with production credentials.

### Build the local data bundle only

```bash
npm run build:data
```

This does not synchronize Supabase.

## Showcase visibility rules

A prototype appears publicly only when all four conditions are true:

```text
showcase_approved = true
showcase_eligible = true
anonymized = true
generation_status = "completed"
```

For showcase-visible records, the repository validator also requires:

- `prototype_url`
- `screenshot_url`
- `title`
- `industry` when `lead_id` is null

The industry may otherwise be inherited from the associated lead.

## Fields synchronized to Supabase

The sync script allow-lists prototype columns. Important fields include:

- identity: `id`, `lead_id`, `industry`
- generation: `variant`, `variant_name`, `generation_model`, `generation_prompt`, `generation_status`
- assets: `prototype_url`, `screenshot_url`, `showcase_anonymized_html_path`
- display: `title`, `design_summary`, `prototype_score`
- protection: `watermark_enabled`, `demo_locked`
- showcase review: `showcase_eligible`, `showcase_approved`, `showcase_score`, `showcase_issues`, `anonymized`, `showcase_scored_at`
- timestamps: `created_at`, `updated_at`

When a new database column must be used by the showcase, complete all three updates together:

1. Add a tracked Supabase migration.
2. Add the column to the sync script's allow-list and drift comparison when appropriate.
3. Add or update the TypeScript interface used by the showcase.

## GitHub Actions regression check

Workflow: `.github/workflows/showcase-integrity.yml`

The workflow runs when relevant prototype, showcase, sync, or package files change. It always performs local metadata validation.

The remote drift step runs only when these repository Actions secrets exist:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

At the time this runbook was written, the GitHub Actions secrets were not configured, so the workflow explains that the remote check was skipped. Production Vercel builds still enforce the required remote sync-and-verify gate because the production environment has the credentials.

Do not weaken the production deployment gate merely because the optional GitHub Actions remote check is unavailable.

## Showcase copy behavior

`app/showcase/page.tsx` includes industry-specific card descriptions for the supported demo industries, including:

- SaaS
- real estate
- dental clinics
- fitness gyms
- law firms
- home services
- ecommerce
- online courses

When adding a new showcase industry, add a useful label, visual treatment where applicable, and a tailored description. Do not silently fall back to generic copy for a deliberately supported showcase category.

## Supabase schema changes completed

### Prototype industry

The `public.prototypes` table now includes:

```sql
industry text
```

The migration is tracked in the repository. The sync scripts preserve the value rather than stripping it.

### Function security hardening

The production database was hardened by:

- setting an explicit `search_path` on `public.touch_updated_at()`;
- revoking execution of the internal `SECURITY DEFINER` helper `public.rls_auto_enable()` from `PUBLIC`, `anon`, and `authenticated`;
- limiting its execution to `service_role`.

The migration is tracked at:

```text
supabase/migrations/20260710234500_harden_public_helper_functions.sql
```

After the change, the Supabase security advisor reported no warning-level function findings.

The remaining `RLS Enabled No Policy` entries are informational for server-managed tables and produce deny-by-default behavior for anonymous and authenticated clients. Do not add broad public policies merely to remove an informational advisor message.

## Incident record: missing showcase prototypes

### Symptoms

- Nine approved prototype directories and metadata records were committed.
- Vercel successfully built the preview routes.
- Direct `/preview/<slug>` pages returned HTTP 200.
- The public showcase still displayed only two cards.

### Root cause

Production had Supabase configured, so `getPrototypes()` preferred the Supabase table over the committed bundle. The repository contained 24 records, but Supabase contained only 15 records and only two passed the showcase filter. The existing build process generated the JSON bundle but did not synchronize Supabase.

A secondary issue was that the showcase had previously been statically generated, which could preserve stale build-time database results.

### Repair

- Added `industry` to `public.prototypes`.
- Synchronized the nine missing records.
- Preserved industry in the Python and Node synchronization allow-lists.
- Made `/showcase` dynamic.
- Added production sync and zero-drift verification.
- Added GitHub Actions metadata validation.
- Added tailored showcase copy.
- Hardened the flagged Supabase helper functions.
- Added legacy timestamp normalization after the first production gate correctly rejected malformed historical timestamps such as `2026-06-22T21:33:15+00:00Z`.

### Verified final state

The successful production deployment reported:

```text
Local metadata valid: 24 prototypes, 11 showcase-visible.
Synced 24 prototype records to Supabase.
No Supabase drift: 24 records match; 11 are showcase-visible.
```

The production `/showcase` route returned HTTP 200 and displayed `All (11)` with the tailored industry copy.

## Troubleshooting

### A committed prototype is missing from `/showcase`

1. Run `npm run check:showcase-metadata`.
2. Confirm all four visibility flags are correct.
3. Confirm required URL, screenshot, title, and orphan-industry fields exist.
4. Run `npm run check:showcase-sync` with production credentials.
5. Inspect the latest Vercel production build logs for the local validation, sync, and no-drift messages.
6. Confirm the direct `/preview/<slug>` route returns HTTP 200.
7. Query Supabase for the record and the four visibility fields.

Do not repair this by merging the JSON bundle into Supabase results at runtime. That would recreate competing runtime sources and could expose records that were intentionally removed or disabled in production.

### Production deployment fails during prototype upsert

- Read the exact Supabase error in the Vercel build log.
- Check schema/allow-list compatibility.
- Check timestamp serialization.
- Check value types and nullability.
- Apply any required schema change through a tracked migration.
- Fix the data or normalization logic rather than bypassing the deployment gate.

### Drift verification fails

Treat drift as a real deployment blocker. Determine whether the repository or the database contains the intended state, then repair the upstream workflow. Do not disable comparison fields just to make the build green unless the field is genuinely database-owned and intentionally excluded from repository control.

## Rules for future agents

- Never declare a prototype "published to showcase" based only on a Git commit or a working preview route.
- A publish operation is complete only after Supabase synchronization and visibility verification succeed.
- Never expose the service-role key to browser code or commit it to the repository.
- Never allow preview builds to mutate production automatically.
- Keep migrations, sync allow-lists, TypeScript interfaces, and operational documentation aligned.
- After changing showcase metadata behavior, verify both the Vercel build log and the live production route.
- Update this runbook whenever the source-of-truth model, visibility rules, environment variables, migration behavior, or operational commands change.

## Change history

### 2026-07-10

- Restored nine missing public showcase entries.
- Added production synchronization and drift verification.
- Added metadata integrity CI.
- Added industry-specific showcase descriptions.
- Added and tracked Supabase function hardening.
- Added legacy timestamp normalization.
- Verified 24 synchronized records and 11 public showcase entries.
