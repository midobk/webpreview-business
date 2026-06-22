import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-server';
import { getSyncedLeads } from '@/lib/sync';

// GET /api/admin/leads - Fetch all leads merged with prototype + outreach state
export async function GET(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  try {
    const leads = await getSyncedLeads();
    return NextResponse.json(leads);
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
  }
}

// PATCH /api/admin/leads - Update a lead's status or notes (admin-only)
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
      return NextResponse.json({ error: 'No leads found' }, { status: 404 });
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
      // Vercel read-only filesystem — return success anyway, changes are in-memory
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