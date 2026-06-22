/**
 * lib/data-source.ts
 *
 * Unified data accessor. Multi-phase:
 *
 * Phase 1 (hacky): read from build-bundle (works on Vercel's read-only fs).
 *   Used when Supabase isn't configured.
 *
 * Phase 2 (proper): read from Supabase when configured. Falls back to bundle.
 *   Writes (PATCH/POST) work in Phase 2.
 *
 * Writes (Phase 1): only work on local filesystem. Returns helpful error on Vercel.
 * Writes (Phase 2): write to Supabase, sync to local JSON for local dev.
 */

import { promises as fs } from "fs";
import path from "path";
import {
  leads as bundleLeads,
  prototypes as bundlePrototypes,
  outreachLog as bundleOutreachLog,
  conversionStats as bundleConversionStats,
  agentmailInboxes as bundleInboxes,
  BUNDLE_GENERATED_AT,
} from "./data-bundle/bundle";
import { getSupabase, isSupabaseConfigured } from "./supabase";

export const DATA_SOURCE = isSupabaseConfigured()
  ? "supabase"
  : "build-bundle";
export const DATA_GENERATED_AT = isSupabaseConfigured()
  ? "live"
  : BUNDLE_GENERATED_AT;

async function fromSupabase<T>(table: string, fallback: T): Promise<T> {
  const supabase = getSupabase();
  if (!supabase) return fallback;
  const { data, error } = await supabase.from(table).select("*");
  if (error) {
    console.error(`Supabase ${table} fetch error:`, error.message);
    return fallback;
  }
  return (data as T) ?? fallback;
}

async function fromFilesystem<T>(path_: string, fallback: T): Promise<T> {
  if (process.env.NODE_ENV === "production") return fallback;
  try {
    const raw = await fs.readFile(path_, "utf8");
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export async function getLeads() {
  const supabase = getSupabase();
  if (supabase) {
    return fromSupabase("leads", bundleLeads);
  }
  return fromFilesystem(path.join(process.cwd(), "data", "leads.json"), bundleLeads);
}

export async function getPrototypes() {
  const supabase = getSupabase();
  if (supabase) {
    return fromSupabase("prototypes", bundlePrototypes);
  }
  return fromFilesystem(path.join(process.cwd(), "data", "prototypes.json"), bundlePrototypes);
}

export async function getOutreachLog() {
  const supabase = getSupabase();
  if (supabase) {
    const data = await fromSupabase("outreach_logs", bundleOutreachLog.logs ?? []);
    return { logs: data as any[] };
  }
  const fallback = fromFilesystem(
    path.join(process.cwd(), "data", "outreach_logs.json"),
    bundleOutreachLog
  );
  return fallback;
}

export async function getConversionStats() {
  const supabase = getSupabase();
  if (supabase) {
    const data = await fromSupabase("conversion_stats", bundleConversionStats);
    return (data as any[])[0] ?? bundleConversionStats;
  }
  return fromFilesystem(
    path.join(process.cwd(), "data", "conversion-stats.json"),
    bundleConversionStats
  );
}

export async function getAgentmailInboxes() {
  const supabase = getSupabase();
  if (supabase) {
    const data = await fromSupabase("agentmail_inboxes", bundleInboxes.inboxes ?? []);
    return { inboxes: data as any[] };
  }
  return fromFilesystem(
    path.join(process.cwd(), "data", "agentmail_inboxes.json"),
    bundleInboxes
  );
}