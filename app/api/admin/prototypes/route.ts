import { NextResponse } from 'next/server';
import { requireAdmin, requireSameOrigin } from '@/lib/auth-server';
import { getPrototypes, DATA_SOURCE } from '@/lib/data-source';
import { getSupabase } from '@/lib/supabase';
import { isShowcaseGenerationComplete } from '@/lib/showcase-policy';

function prototypeSlug(proto: any): string {
  const url = typeof proto.prototype_url === 'string' ? proto.prototype_url : '';
  const previewMatch = url.match(/\/preview\/([^/?#]+)/);
  if (previewMatch) return previewMatch[1];
  const dataMatch = url.match(/data\/prototypes(?:-anonymized)?\/([^/]+)/);
  return dataMatch?.[1] || proto.lead_id || proto.id;
}

function canPublish(proto: any) {
  return isShowcaseGenerationComplete(proto.generation_status) &&
    proto.showcase_eligible === true &&
    proto.anonymized === true &&
    Boolean(proto.prototype_url) &&
    Boolean(proto.screenshot_url);
}

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
        const slug = prototypeSlug(proto);
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
  const originDenied = requireSameOrigin(request);
  if (originDenied) return originDenied;
  try {
    if (Number(request.headers.get('content-length') || 0) > 16_000) {
      return NextResponse.json({ error: 'Request is too large.' }, { status: 413 });
    }
    const body = await request.json();
    const { id, showcase_approved, showcase_eligible } = body;
    const unknownKeys = Object.keys(body).filter((key) => !['id', 'showcase_approved', 'showcase_eligible'].includes(key));
    if (unknownKeys.length || typeof id !== 'string' || !id.trim() || id.length > 200 ||
      (showcase_approved !== undefined && typeof showcase_approved !== 'boolean') ||
      (showcase_eligible !== undefined && typeof showcase_eligible !== 'boolean') ||
      (showcase_approved === undefined && showcase_eligible === undefined)) {
      return NextResponse.json({ error: 'Prototype id and an update are required.' }, { status: 400 });
    }

    const supabase = getSupabase();
    if (supabase) {
      const current = await supabase.from('prototypes').select('*').eq('id', id).maybeSingle();
      if (current.error) return NextResponse.json({ error: current.error.message }, { status: 500 });
      if (!current.data) return NextResponse.json({ error: 'Prototype not found' }, { status: 404 });

      // Build `next` from the current row + only the fields the caller
      // actually provided. Spreading both `showcase_approved` and
      // `showcase_eligible` unconditionally would clobber the
      // pre-existing `showcase_eligible` with `undefined` on a normal
      // approve request (which only sends `showcase_approved`), making
      // the `canPublish(next)` check fail with 409 every time.
      const next: Record<string, unknown> = { ...current.data };
      if (showcase_approved !== undefined) next.showcase_approved = showcase_approved;
      if (showcase_eligible !== undefined) next.showcase_eligible = showcase_eligible;
      if (showcase_approved === true && !canPublish(next)) {
        return NextResponse.json({ error: 'Prototype must be completed, eligible, anonymized, and have both preview URLs before approval.' }, { status: 409 });
      }
      const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (showcase_approved !== undefined) updates.showcase_approved = showcase_approved;
      if (showcase_eligible !== undefined) {
        updates.showcase_eligible = showcase_eligible;
        if (showcase_eligible === false) updates.showcase_approved = false;
      }
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

    // Build `next` from the current row + only the fields the caller
    // actually provided (same P1 fix as the Supabase branch above).
    const next: Record<string, unknown> = { ...prototypes[index] };
    if (showcase_approved !== undefined) next.showcase_approved = showcase_approved;
    if (showcase_eligible !== undefined) next.showcase_eligible = showcase_eligible;
    if (showcase_approved === true && !canPublish(next)) {
      return NextResponse.json({ error: 'Prototype must be completed, eligible, anonymized, and have both preview URLs before approval.' }, { status: 409 });
    }
    if (showcase_approved !== undefined) prototypes[index].showcase_approved = showcase_approved;
    if (showcase_eligible !== undefined) {
      prototypes[index].showcase_eligible = showcase_eligible;
      if (showcase_eligible === false) prototypes[index].showcase_approved = false;
    }
    prototypes[index].updated_at = new Date().toISOString();

    try {
      await fs.writeFile(protoPath, JSON.stringify(prototypes, null, 2));
    } catch (e) {
      return NextResponse.json({
        success: false,
        message: 'Phase 1 hacky build: writes not persisted on Vercel. Set SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY for live writes.',
      }, { status: 503 });
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
