import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-server';
import { getPrototypes, DATA_SOURCE } from '@/lib/data-source';
import { getSupabase } from '@/lib/supabase';

// GET /api/admin/prototypes - Fetch all prototypes (admin-only)
export async function GET(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  try {
    const prototypes = await getPrototypes();

    // Populate screenshot_url + prototype_url where missing
    if (process.env.NODE_ENV !== 'production') {
      const fs = await import('fs');
      const path = await import('path');
      const prototypesDir = path.join(process.cwd(), 'data', 'prototypes');
      const publicScreensDir = path.join(process.cwd(), 'public', 'prototype-screenshots');
      for (const proto of prototypes) {
        const slug = proto.lead_id || proto.id;
        if (!proto.screenshot_url) {
          // Prefer the public screenshot (served on Vercel + dev)
          const publicDesktop = path.join(publicScreensDir, `${slug}-desktop.png`);
          if (fs.existsSync(publicDesktop)) {
            proto.screenshot_url = `/prototype-screenshots/${slug}-desktop.png`;
          } else {
            const screenshotPath = path.join(prototypesDir, slug, 'screenshot.png');
            if (fs.existsSync(screenshotPath)) {
              proto.screenshot_url = `/data/prototypes/${slug}/screenshot.png`;
            }
          }
        }
        if (!proto.prototype_url) {
          proto.prototype_url = `/preview/${slug}`;
        }
      }
    }

    return NextResponse.json(prototypes);
  } catch (error) {
    console.error('Error fetching prototypes:', error);
    return NextResponse.json({ error: 'Failed to fetch prototypes', data_source: DATA_SOURCE }, { status: 500 });
  }
}

// PATCH /api/admin/prototypes - Update a prototype (admin-only)
export async function PATCH(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  try {
    const body = await request.json();
    const { id, showcase_approved, showcase_eligible } = body;

    const supabase = getSupabase();
    if (supabase) {
      const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (showcase_approved !== undefined) updates.showcase_approved = showcase_approved;
      if (showcase_eligible !== undefined) updates.showcase_eligible = showcase_eligible;
      const { error } = await supabase
        .from("prototypes")
        .update(updates)
        .eq("id", id);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, data_source: "supabase" });
    }

    // Phase 1 fallback
    const fs = await import('fs/promises');
    const path = await import('path');
    const protoPath = path.join(process.cwd(), 'data', 'prototypes.json');

    if (!(await fsAccess(protoPath))) {
      return NextResponse.json({ error: 'No prototypes found (Phase 1: build-bundle only — set SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY for writes)' }, { status: 404 });
    }

    const data = await fs.readFile(protoPath, 'utf8');
    const prototypes = JSON.parse(data);

    const index = prototypes.findIndex((p: any) => p.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Prototype not found' }, { status: 404 });
    }

    if (showcase_approved !== undefined) prototypes[index].showcase_approved = showcase_approved;
    if (showcase_eligible !== undefined) prototypes[index].showcase_eligible = showcase_eligible;
    prototypes[index].updated_at = new Date().toISOString();

    try {
      await fs.writeFile(protoPath, JSON.stringify(prototypes, null, 2));
    } catch (e) {
      return NextResponse.json({
        success: false,
        message: 'Phase 1 hacky build: writes not persisted on Vercel. Set SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY for live writes.',
      });
    }

    return NextResponse.json({ success: true, prototype: prototypes[index], data_source: "filesystem" });
  } catch (error) {
    console.error('Error updating prototype:', error);
    return NextResponse.json({ error: 'Failed to update prototype' }, { status: 500 });
  }
}

async function fsAccess(p: string): Promise<boolean> {
  const fs = await import('fs/promises');
  try { await fs.access(p); return true; } catch { return false; }
}