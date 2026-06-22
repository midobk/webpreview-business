/**
 * lib/sync.ts — Reconcile leads.json with prototypes, outreach, etc.
 *
 * The dashboard pulls leads.json directly, but each lead's prototype and
 * outreach status live in separate files. This helper merges them so the
 * dashboard sees a single, accurate view of every lead's pipeline state.
 */

import { promises as fs } from 'fs';
import path from 'path';

export interface Lead {
  id: string;
  business_name: string;
  slug: string;
  industry: string;
  city?: string;
  province?: string;
  status?: string;
  lead_score?: number;
  prototype_url?: string | null;
  prototype_id?: string | null;
  has_prototype?: boolean;
  prototype_score?: number | null;
  prototype_status?: string;
  prototype_anonymized?: boolean;
  outreach_status?: string; // 'none' | 'drafted' | 'sent' | 'replied' | 'bounced'
  outreach_id?: string | null;
  variant_count?: number;
  notes?: string;
  updated_at?: string;
  [key: string]: unknown;
}

export interface Prototype {
  id: string;
  lead_id: string;
  variant?: number;
  generation_status: string;
  prototype_url?: string;
  screenshot_url?: string;
  showcase_eligible?: boolean;
  showcase_approved?: boolean;
  anonymized?: boolean;
  prototype_score?: number | null;
  [key: string]: unknown;
}

export interface OutreachRecord {
  id: string;
  lead_id: string;
  channel: 'email' | 'sms';
  status: 'drafted' | 'sent' | 'replied' | 'bounced' | 'opted_out';
  created_at: string;
  [key: string]: unknown;
}

export async function loadAllLeads(): Promise<Lead[]> {
  const leadsPath = path.join(process.cwd(), 'data', 'leads.json');
  if (!(await fsExists(leadsPath))) return [];
  const data = await fs.readFile(leadsPath, 'utf8');
  return JSON.parse(data);
}

export async function loadPrototypes(): Promise<Prototype[]> {
  const path_ = path.join(process.cwd(), 'data', 'prototypes.json');
  if (!(await fsExists(path_))) return [];
  const data = await fs.readFile(path_, 'utf8');
  return JSON.parse(data);
}

export async function loadOutreach(): Promise<OutreachRecord[]> {
  const path_ = path.join(process.cwd(), 'data', 'outreach_logs.json');
  if (!(await fsExists(path_))) return [];
  const data = await fs.readFile(path_, 'utf8');
  return JSON.parse(data);
}

async function fsExists(p: string): Promise<boolean> {
  try { await fs.access(p); return true; } catch { return false; }
}

/**
 * Sync leads with prototype and outreach data.
 * Returns a new array — does not mutate.
 */
export async function getSyncedLeads(): Promise<Lead[]> {
  const [leads, prototypes, outreach] = await Promise.all([
    loadAllLeads(),
    loadPrototypes(),
    loadOutreach(),
  ]);

  const prototypeByLead = new Map<string, Prototype[]>();
  for (const proto of prototypes) {
    const list = prototypeByLead.get(proto.lead_id) ?? [];
    list.push(proto);
    prototypeByLead.set(proto.lead_id, list);
  }

  const outreachByLead = new Map<string, OutreachRecord[]>();
  for (const record of outreach) {
    const list = outreachByLead.get(record.lead_id) ?? [];
    list.push(record);
    outreachByLead.set(record.lead_id, list);
  }

  return leads.map((lead) => {
    const protos = prototypeByLead.get(lead.id) ?? [];
    const completedProto = protos.find((p) => p.generation_status === 'completed');
    const lastProto = protos[protos.length - 1];
    const records = outreachByLead.get(lead.id) ?? [];

    // Most recent outreach status (sorted by created_at desc)
    const sortedRecords = [...records].sort((a, b) =>
      (b.created_at || '').localeCompare(a.created_at || '')
    );
    const lastRecord = sortedRecords[0];
    const outreachStatus = lastRecord?.status ?? 'none';

    return {
      ...lead,
      has_prototype: protos.length > 0,
      variant_count: protos.length,
      prototype_id: lastProto?.id ?? null,
      prototype_url: completedProto?.prototype_url ?? null,
      prototype_score: completedProto?.prototype_score ?? null,
      prototype_status: completedProto?.generation_status ?? 'none',
      prototype_anonymized: completedProto?.anonymized ?? false,
      outreach_status: outreachStatus,
      outreach_id: lastRecord?.id ?? null,
    };
  });
}

/**
 * Sync one lead by id with its current prototype + outreach state.
 */
export async function getSyncedLead(id: string): Promise<Lead | null> {
  const all = await getSyncedLeads();
  return all.find((l) => l.id === id) ?? null;
}