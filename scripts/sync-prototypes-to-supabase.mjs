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

const COMPARED_COLUMNS = [
  'lead_id',
  'industry',
  'prototype_url',
  'screenshot_url',
  'title',
  'design_summary',
  'prototype_score',
  'generation_status',
  'watermark_enabled',
  'demo_locked',
  'showcase_eligible',
  'showcase_approved',
  'showcase_score',
  'showcase_issues',
  'anonymized',
  'showcase_anonymized_html_path',
];

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

function selectAllowedColumns(row) {
  return Object.fromEntries(
    PROTOTYPE_COLUMNS.filter((column) => Object.hasOwn(row, column)).map((column) => [column, row[column]])
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

async function verifyNoDrift(supabase, prototypes) {
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

  console.log(`✓ No Supabase drift: ${prototypes.length} records match; ${visibleIds.length} are showcase-visible.`);
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

  if (mode === 'sync' || (mode === 'auto' && isProductionBuild)) {
    await upsertPrototypes(supabase, prototypes);
  }

  await verifyNoDrift(supabase, prototypes);
}

main().catch((error) => {
  console.error(`✗ ${error.message}`);
  process.exit(1);
});
