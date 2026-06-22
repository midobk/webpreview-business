import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-server';
import { getLeads, getPrototypes, getOutreachLog, DATA_GENERATED_AT } from '@/lib/data-source';

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
    return NextResponse.json({ error: 'Failed to fetch leads', detail: String(error), bundle_generated_at: DATA_GENERATED_AT }, { status: 500 });
  }
}

// PATCH /api/admin/leads - Update a lead's status or notes
// Phase 1 (hacky): write attempts only persist on local filesystem; on Vercel
// changes live in memory for the request but don't persist (Patches work locally
// for testing, Supabase replaces this in Phase 2).
export async function PATCH(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  try {
    const fs = await import('fs/promises');
    const path = await import('path');

    const body = await request.json();
    const { id, status, notes } = body;

    const leadsPath = path.join(process.cwd(), 'data', 'leads.json');

    if (!(await fsAccess(leadsPath))) {
      return NextResponse.json({ error: 'No leads found (Phase 1: build-bundle only — use Supabase for writes)' }, { status: 404 });
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
      // Vercel read-only filesystem — Phase 2 (Supabase) will fix this
      return NextResponse.json({
        success: false,
        message: 'Phase 1 hacky build: writes not persisted on Vercel. Use local dev or wait for Supabase.',
      });
    }

    return NextResponse.json({ success: true, lead: leads[leadIndex] });
  } catch (error) {
    console.error('Error updating lead:', error);
    return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 });
  }
}

async function fsAccess(p: string): Promise<boolean> {
  const fs = await import('fs/promises');
  try { await fs.access(p); return true; } catch { return false; }
}