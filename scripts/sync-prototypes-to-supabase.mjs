#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { createClient } from '@supabase/supabase-js';

const PROTOTYPES_PATH = path.join(process.cwd(), 'data', 'prototypes.json');
const PROTOTYPE_COLUMNS = [
  'id',
  'lead_id',
  'industry',
  'variant',
  'variant_name',
  'prototype_url',
  'screenshot_url',
  'title',
  'design_summary',
  'prototype_score',
  'generation_model',
  'generation_prompt',
  'generation_status',
  'watermark_enabled',
  'demo_locked',
  'showcase_eligible',
  'showcase_approved',
  'showcase_score',
  'showcase_issues',
  'anonymized',
  'showcase_anonymized_html_path',
  'showcase_scored_at',
  'created_at',
  'updated_at',
];

const TIMESTAMP_COLUMNS = new Set(['showcase_scored_at', 'created_at', 'updated_at']);

// Columns that are owned by the repository / generator and should be kept in
// sync between local JSON and Supabase. Admin-controlled approval fields are
// excluded so that `--auto` never overwrites a live approval decision.
const METADATA_COLUMNS = [
  'lead_id',
  'industry',
  'variant',
  'variant_name',
  'prototype_url',
  'screenshot_url',
  'title',
  'design_summary',
  'prototype_score',
  'generation_model',
  'generation_prompt',
  'generation_status',
  'watermark_enabled',
  'demo_locked',
  'anonymized',
  'showcase_anonymized_html_path',
];

// Columns that are admin-controlled. `--auto` must never overwrite these.
const ADMIN_OWNED_COLUMNS = [
  'showcase_eligible',
  'showcase_approved',
  'showcase_score',
  'showcase_issues',
  'showcase_scored_at',
];

// Drift checks compare metadata columns only (not admin-owned fields).
const COMPARED_COLUMNS = METADATA_COLUMNS;

const args = new Set(process.argv.slice(2));
const mode = args.has('--check')
  ? 'check'
  : args.has('--local')
    ? 'local'
    : args.has('--sync')
      ? 'sync'
      : 'auto';

function isVisibleShowcasePrototype(row) {
  return (
    row.showcase_approved === true &&
    row.showcase_eligible === true &&
    row.anonymized === true &&
    row.generation_status === 'completed'
  );
}

function normalizeComparable(value) {
  if (value === undefined) return null;
  if (Array.isArray(value)) return [...value].sort();
  return value;
}

function sameValue(left, right) {
  return JSON.stringify(normalizeComparable(left)) === JSON.stringify(normalizeComparable(right));
}

function normalizeTimestamp(value) {
  if (!value || typeof value !== 'string') return value;

  // Some legacy JSON records were serialized with both an explicit UTC offset
  // and a trailing Z, for example `2026-06-22T21:33:15+00:00Z`. PostgreSQL
  // correctly rejects that as two timezone designators. Keep the explicit
  // offset and remove only the redundant trailing Z.
  return value
    .replace(/([+-]\d{2}:\d{2})Z$/i, '$1')
    .replace(/([+-]\d{4})Z$/i, '$1');
}

function selectAllowedColumns(row) {
  return Object.fromEntries(
    PROTOTYPE_COLUMNS.filter((column) => Object.hasOwn(row, column)).map((column) => [
      column,
      TIMESTAMP_COLUMNS.has(column) ? normalizeTimestamp(row[column]) : row[column],
    ])
  );
}

async function loadAndValidateLocalPrototypes() {
  const raw = await fs.readFile(PROTOTYPES_PATH, 'utf8');
  const prototypes = JSON.parse(raw);

  if (!Array.isArray(prototypes)) {
    throw new Error('data/prototypes.json must contain a JSON array.');
  }

  const seen = new Set();
  const errors = [];

  for (const [index, prototype] of prototypes.entries()) {
    const label = prototype?.id || `record ${index + 1}`;

    if (!prototype || typeof prototype !== 'object' || Array.isArray(prototype)) {
      errors.push(`Record ${index + 1} is not an object.`);
      continue;
    }
    if (!prototype.id || typeof prototype.id !== 'string') {
      errors.push(`Record ${index + 1} is missing a string id.`);
      continue;
    }
    if (seen.has(prototype.id)) errors.push(`${label}: duplicate id.`);
    seen.add(prototype.id);

    if (isVisibleShowcasePrototype(prototype)) {
      if (!prototype.prototype_url) errors.push(`${label}: visible showcase record needs prototype_url.`);
      if (!prototype.screenshot_url) errors.push(`${label}: visible showcase record needs screenshot_url.`);
      if (!prototype.title) errors.push(`${label}: visible showcase record needs title.`);
      if (!prototype.industry && !prototype.lead_id) {
        errors.push(`${label}: orphan showcase record needs industry because it has no lead_id.`);
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(`Prototype metadata validation failed:\n- ${errors.join('\n- ')}`);
  }

  const visibleCount = prototypes.filter(isVisibleShowcasePrototype).length;
  console.log(`✓ Local metadata valid: ${prototypes.length} prototypes, ${visibleCount} showcase-visible.`);
  return prototypes;
}

function getSupabaseClient({ required }) {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    if (required) {
      throw new Error(
        'SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY are required.'
      );
    }
    return null;
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function upsertPrototypes(supabase, prototypes) {
  const rows = prototypes.map(selectAllowedColumns);
  const batchSize = 100;

  for (let offset = 0; offset < rows.length; offset += batchSize) {
    const batch = rows.slice(offset, offset + batchSize);
    const { error } = await supabase.from('prototypes').upsert(batch, { onConflict: 'id' });
    if (error) throw new Error(`Supabase prototype upsert failed: ${error.message}`);
  }

  console.log(`✓ Synced ${rows.length} prototype records to Supabase.`);
}

// Upsert only metadata columns, preserving remote admin-owned fields.
// Used in `--auto` so newly generated prototypes appear in Supabase without
// overwriting live approval decisions.
async function upsertMetadataOnly(supabase, prototypes) {
  const rows = prototypes.map((row) => {
    const filtered = { id: row.id };
    for (const col of METADATA_COLUMNS) {
      if (Object.hasOwn(row, col)) {
        filtered[col] = TIMESTAMP_COLUMNS.has(col) ? normalizeTimestamp(row[col]) : row[col];
      }
    }
    // Include timestamps so new records get created_at.
    if (Object.hasOwn(row, 'created_at')) {
      filtered.created_at = normalizeTimestamp(row.created_at);
    }
    return filtered;
  });

  const batchSize = 100;
  for (let offset = 0; offset < rows.length; offset += batchSize) {
    const batch = rows.slice(offset, offset + batchSize);
    const { error } = await supabase.from('prototypes').upsert(batch, { onConflict: 'id' });
    if (error) throw new Error(`Supabase metadata upsert failed: ${error.message}`);
  }

  console.log(`✓ Upserted ${rows.length} prototype metadata records (preserving admin fields).`);
}

// `checkVisibility` controls the showcase visibility count check, which
// asserts that the set of locally-approved showcase prototypes matches the
// remote count. This is only valid when the caller has just written the
// admin-owned approval fields from the local snapshot (i.e. `--sync`), or is
// explicitly asserting full parity (`--check`). `--auto` upserts metadata
// only and deliberately preserves remote admin-owned approval state, so it
// must pass `checkVisibility: false` — otherwise any admin approval/unpublish
// made in Supabase since `data/prototypes.json` was last updated would fail
// the build on a visibility mismatch even though the intended remote state
// was preserved.
async function verifyNoDrift(supabase, prototypes, { checkVisibility = true } = {}) {
  const ids = prototypes.map((prototype) => prototype.id);
  const selectColumns = ['id', ...COMPARED_COLUMNS].join(',');
  const { data, error } = await supabase.from('prototypes').select(selectColumns).in('id', ids);

  if (error) throw new Error(`Supabase drift query failed: ${error.message}`);

  const remoteById = new Map((data || []).map((row) => [row.id, row]));
  const problems = [];

  for (const local of prototypes) {
    const remote = remoteById.get(local.id);
    if (!remote) {
      problems.push(`${local.id}: missing from Supabase`);
      continue;
    }

    for (const column of COMPARED_COLUMNS) {
      if (!sameValue(local[column], remote[column])) {
        problems.push(
          `${local.id}.${column}: local=${JSON.stringify(normalizeComparable(local[column]))} remote=${JSON.stringify(normalizeComparable(remote[column]))}`
        );
      }
    }
  }

  if (problems.length > 0) {
    throw new Error(`Showcase Supabase drift detected:\n- ${problems.join('\n- ')}`);
  }

  let visibleCount = null;
  if (checkVisibility) {
    const visibleIds = prototypes.filter(isVisibleShowcasePrototype).map((prototype) => prototype.id);
    const { count, error: countError } = await supabase
      .from('prototypes')
      .select('id', { count: 'exact', head: true })
      .in('id', visibleIds)
      .eq('showcase_approved', true)
      .eq('showcase_eligible', true)
      .eq('anonymized', true)
      .eq('generation_status', 'completed');

    if (countError) throw new Error(`Supabase showcase count check failed: ${countError.message}`);
    if (count !== visibleIds.length) {
      throw new Error(
        `Showcase visibility mismatch: local has ${visibleIds.length}, Supabase has ${count ?? 0}.`
      );
    }
    visibleCount = visibleIds.length;
  }

  const visibilityNote = checkVisibility ? `; ${visibleCount} are showcase-visible` : ' (visibility check skipped: remote admin-owned)';
  console.log(`✓ No Supabase drift: ${prototypes.length} records match${visibilityNote}.`);
}

async function main() {
  const prototypes = await loadAndValidateLocalPrototypes();
  if (mode === 'local') return;

  const isProductionBuild = process.env.VERCEL_ENV === 'production';
  const remoteRequired = mode === 'sync' || mode === 'check' || isProductionBuild;
  const supabase = getSupabaseClient({ required: remoteRequired });

  if (!supabase) {
    console.log('ℹ Supabase credentials are not available; remote sync check skipped for this non-production build.');
    return;
  }

  if (mode === 'sync') {
    // Full sync: upsert all columns including admin-owned fields, then verify
    // full parity (including visibility) against the just-written remote state.
    await upsertPrototypes(supabase, prototypes);
    await verifyNoDrift(supabase, prototypes);
  } else if (mode === 'check') {
    // Drift check only: no writes. Asserts full parity including visibility.
    await verifyNoDrift(supabase, prototypes);
  } else if (mode === 'auto') {
    // `--auto` runs from `prebuild` on every build — production AND Vercel
    // preview builds (and any local build that happens to have production
    // Supabase env vars). Only the production build may write to Supabase;
    // preview/local builds are read-only so they never upsert metadata into
    // the live table.
    if (!isProductionBuild) {
      console.log('ℹ Non-production build: Supabase metadata sync skipped (preview/local builds are read-only).');
      return;
    }

    // Production prebuild: upsert metadata only (preserve admin-owned fields),
    // then verify metadata drift only. The visibility/count check is skipped
    // (`checkVisibility: false`) because admin approval state lives in
    // Supabase and is deliberately not overwritten from the local JSON
    // snapshot — asserting local == remote approval counts would fail every
    // build after any admin approval or unpublish made since the snapshot.
    await upsertMetadataOnly(supabase, prototypes);
    await verifyNoDrift(supabase, prototypes, { checkVisibility: false });
  }
}

main().catch((error) => {
  console.error(`✗ ${error.message}`);
  process.exit(1);
});
