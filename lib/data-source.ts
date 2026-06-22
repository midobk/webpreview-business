/**
 * lib/data-source.ts
 *
 * Unified data accessor. Phase 1: read from the build-bundle (works on
 * Vercel's read-only filesystem). Phase 2: replace with Supabase client.
 *
 * Strategy:
 * - Try the embedded bundle first (always present in production)
 * - Fallback to filesystem read (for local dev where we don't want to
 *   rebuild on every data change)
 * - In Phase 2, the embedded fallback goes away — all reads hit Supabase.
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

export const DATA_SOURCE = "build-bundle";
export const DATA_GENERATED_AT = BUNDLE_GENERATED_AT;

export async function getLeads() {
  // Local dev: prefer fresh filesystem data
  if (process.env.NODE_ENV !== "production") {
    try {
      const p = path.join(process.cwd(), "data", "leads.json");
      const raw = await fs.readFile(p, "utf8");
      return JSON.parse(raw);
    } catch {
      // fall through to bundle
    }
  }
  return bundleLeads;
}

export async function getPrototypes() {
  if (process.env.NODE_ENV !== "production") {
    try {
      const p = path.join(process.cwd(), "data", "prototypes.json");
      const raw = await fs.readFile(p, "utf8");
      return JSON.parse(raw);
    } catch {
      // fall through
    }
  }
  return bundlePrototypes;
}

export async function getOutreachLog() {
  if (process.env.NODE_ENV !== "production") {
    try {
      const p = path.join(process.cwd(), "data", "outreach_logs.json");
      const raw = await fs.readFile(p, "utf8");
      return JSON.parse(raw);
    } catch {
      // fall through
    }
  }
  return bundleOutreachLog;
}

export async function getConversionStats() {
  if (process.env.NODE_ENV !== "production") {
    try {
      const p = path.join(process.cwd(), "data", "conversion-stats.json");
      const raw = await fs.readFile(p, "utf8");
      return JSON.parse(raw);
    } catch {
      // fall through
    }
  }
  return bundleConversionStats;
}

export async function getAgentmailInboxes() {
  if (process.env.NODE_ENV !== "production") {
    try {
      const p = path.join(process.cwd(), "data", "agentmail_inboxes.json");
      const raw = await fs.readFile(p, "utf8");
      return JSON.parse(raw);
    } catch {
      // fall through
    }
  }
  return bundleInboxes;
}