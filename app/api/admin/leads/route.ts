import { NextResponse } from 'next/server';
import { requireAdmin, requireSameOrigin } from '@/lib/auth-server';
import {
  getLeads,
  getPrototypes,
  getOutreachLog,
  DATA_GENERATED_AT,
  DATA_SOURCE,
} from '@/lib/data-source';
import { getSupabase } from '@/lib/supabase';

// GET /api/admin/leads - Fetch all leads merged with prototype + outreach state
export async function GET(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  try {
    const [leads, prototypes, outreachLog] = await Promise.all([
      getLeads(),
      getPrototypes(),
      getOutreachLog(),
    ]);

    const outreachRecords = outreachLog?.logs ?? outreachLog ?? [];

    // Map prototypes to leads
    const prototypeByLead = new Map<string, any[]>();
    for (const p of prototypes) {
      const list = prototypeByLead.get(p.lead_id) ?? [];
      list.push(p);
      prototypeByLead.set(p.lead_id, list);
    }

    // Map outreach to leads
    const outreachByLead = new Map<string, any[]>();
    for (const r of outreachRecords) {
      const list = outreachByLead.get(r.lead_id) ?? [];
      list.push(r);
      outreachByLead.set(r.lead_id, list);
    }

    const synced = leads.map((lead: any) => {
      const protos = prototypeByLead.get(lead.id) ?? [];
      const completedProto = protos.find((p) => p.generation_status === "completed");
      const lastProto = protos[protos.length - 1];
      const records = outreachByLead.get(lead.id) ?? [];

      const sorted = [...records].sort((a, b) =>
        (b.created_at || "").localeCompare(a.created_at || "")
      );
      const lastRecord = sorted[0];

      return {
        ...lead,
        has_prototype: protos.length > 0,
        variant_count: protos.length,
        prototype_id: lastProto?.id ?? null,
        prototype_url: completedProto?.prototype_url ?? null,
        prototype_score: completedProto?.prototype_score ?? null,
        prototype_status: completedProto?.generation_status ?? "none",
        prototype_anonymized: completedProto?.anonymized ?? false,
        outreach_status: lastRecord?.status ?? "none",
        outreach_id: lastRecord?.id ?? null,
      };
    });

    return NextResponse.json(synced);
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json({
      error: 'Failed to fetch leads',
      detail: String(error),
      data_source: DATA_SOURCE,
      bundle_generated_at: DATA_GENERATED_AT,
    }, { status: 500 });
  }
}

// PATCH /api/admin/leads - Update a lead's status or notes
// Phase 1 (hacky): writes only persist on local filesystem.
// Phase 2 (Supabase): writes go to Supabase + local JSON.
export async function PATCH(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const originDenied = requireSameOrigin(request);
  if (originDenied) return originDenied;
  try {
    if (Number(request.headers.get('content-length') || 0) > 16_000) {
      return NextResponse.json({ error: 'Request is too large.' }, { status: 413 });
    }
    const body = await request.json();
    const { id, status, notes } = body;
    const unknownKeys = Object.keys(body).filter((key) => !['id', 'status', 'notes'].includes(key));
    if (unknownKeys.length || typeof id !== 'string' || !id.trim() || id.length > 200 ||
      (status !== undefined && (typeof status !== 'string' || status.length > 80)) ||
      (notes !== undefined && (typeof notes !== 'string' || notes.length > 20_000)) ||
      (status === undefined && notes === undefined)) {
      return NextResponse.json({ error: 'Lead id and a valid update are required.' }, { status: 400 });
    }

    const supabase = getSupabase();
    if (supabase) {
      const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (status) updates.status = status;
      if (notes !== undefined) updates.notes = notes;
      const { error } = await supabase
        .from("leads")
        .update(updates)
        .eq("id", id);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, data_source: "supabase" });
    }

    // Phase 1 fallback: write to local filesystem only (Vercel will fail)
    const fs = await import('fs/promises');
    const path = await import('path');
    const leadsPath = path.join(process.cwd(), 'data', 'leads.json');

    if (!(await fsAccess(leadsPath))) {
      return NextResponse.json({ error: 'No leads found (Phase 1: build-bundle only — set SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY for writes)' }, { status: 404 });
    }

    const leadsData = await fs.readFile(leadsPath, 'utf8');
    const leads = JSON.parse(leadsData);

    const leadIndex = leads.findIndex((l: any) => l.id === id);
    if (leadIndex === -1) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    if (status) leads[leadIndex].status = status;
    if (notes !== undefined) leads[leadIndex].notes = notes;
    leads[leadIndex].updated_at = new Date().toISOString();

    try {
      await fs.writeFile(leadsPath, JSON.stringify(leads, null, 2));
    } catch (e) {
      return NextResponse.json({
        success: false,
        message: 'Phase 1 hacky build: writes not persisted on Vercel. Set SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY for live writes.',
      }, { status: 503 });
    }

    return NextResponse.json({ success: true, lead: leads[leadIndex], data_source: "filesystem" });
  } catch (error) {
    console.error('Error updating lead:', error);
    return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 });
  }
}

async function fsAccess(p: string): Promise<boolean> {
  const fs = await import('fs/promises');
  try { await fs.access(p); return true; } catch { return false; }
}
