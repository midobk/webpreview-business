import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-server';
import { getPrototypes } from '@/lib/data-source';

// GET /api/admin/prototypes - Fetch all prototypes (admin-only)
export async function GET(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  try {
    const prototypes = await getPrototypes();

    // Populate screenshot_url + prototype_url from filesystem where missing
    // (works in dev; in production the bundle already has these or they're null)
    const fs = await import('fs');
    const path = await import('path');
    const prototypesDir = path.join(process.cwd(), 'data', 'prototypes');

    for (const proto of prototypes) {
      const slug = proto.lead_id || proto.id;
      try {
        const screenshotPath = path.join(prototypesDir, slug, 'screenshot.png');
        if (fs.existsSync(screenshotPath) && !proto.screenshot_url) {
          proto.screenshot_url = `/data/prototypes/${slug}/screenshot.png`;
        }
      } catch {
        // filesystem not available (Vercel) — that's fine
      }
      if (!proto.prototype_url) {
        proto.prototype_url = `/preview/${slug}`;
      }
    }

    return NextResponse.json(prototypes);
  } catch (error) {
    console.error('Error fetching prototypes:', error);
    return NextResponse.json({ error: 'Failed to fetch prototypes' }, { status: 500 });
  }
}

// PATCH /api/admin/prototypes - Update a prototype (admin-only)
// Phase 1: writes only persist on local filesystem. Phase 2 (Supabase) replaces this.
export async function PATCH(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  try {
    const fs = await import('fs/promises');
    const path = await import('path');

    const body = await request.json();
    const { id, showcase_approved, showcase_eligible } = body;

    const protoPath = path.join(process.cwd(), 'data', 'prototypes.json');

    if (!(await fsAccess(protoPath))) {
      return NextResponse.json({ error: 'No prototypes found (Phase 1: build-bundle only — use Supabase for writes)' }, { status: 404 });
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
      // Vercel read-only filesystem
      return NextResponse.json({
        success: false,
        message: 'Phase 1 hacky build: writes not persisted on Vercel. Use local dev or wait for Supabase.',
      });
    }

    return NextResponse.json({ success: true, prototype: prototypes[index] });
  } catch (error) {
    console.error('Error updating prototype:', error);
    return NextResponse.json({ error: 'Failed to update prototype' }, { status: 500 });
  }
}

async function fsAccess(p: string): Promise<boolean> {
  const fs = await import('fs/promises');
  try { await fs.access(p); return true; } catch { return false; }
}