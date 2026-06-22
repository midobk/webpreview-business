import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { requireAdmin } from '@/lib/auth-server';

// GET /api/admin/prototypes - Fetch all prototypes (admin-only)
export async function GET(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  try {
    const protoPath = path.join(process.cwd(), 'data', 'prototypes.json');
    
    if (!fs.existsSync(protoPath)) {
      return NextResponse.json([]);
    }
    
    const data = fs.readFileSync(protoPath, 'utf8');
    const prototypes = JSON.parse(data);
    
    // Also check for screenshot files
    const prototypesDir = path.join(process.cwd(), 'data', 'prototypes');
    for (const proto of prototypes) {
      const slug = proto.lead_id || proto.id;
      const screenshotPath = path.join(prototypesDir, slug, 'screenshot.png');
      if (fs.existsSync(screenshotPath) && !proto.screenshot_url) {
        proto.screenshot_url = `/data/prototypes/${slug}/screenshot.png`;
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
export async function PATCH(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  try {
    const body = await request.json();
    const { id, showcase_approved, showcase_eligible } = body;
    
    const protoPath = path.join(process.cwd(), 'data', 'prototypes.json');
    
    if (!fs.existsSync(protoPath)) {
      return NextResponse.json({ error: 'No prototypes found' }, { status: 404 });
    }
    
    const data = fs.readFileSync(protoPath, 'utf8');
    const prototypes = JSON.parse(data);
    
    const index = prototypes.findIndex((p: any) => p.id === id);
    if (index === -1) {
      return NextResponse.json({ error: 'Prototype not found' }, { status: 404 });
    }
    
    if (showcase_approved !== undefined) prototypes[index].showcase_approved = showcase_approved;
    if (showcase_eligible !== undefined) prototypes[index].showcase_eligible = showcase_eligible;
    prototypes[index].updated_at = new Date().toISOString();
    
    try {
      fs.writeFileSync(protoPath, JSON.stringify(prototypes, null, 2));
    } catch (e) {
      // Vercel read-only
    }
    
    return NextResponse.json({ success: true, prototype: prototypes[index] });
  } catch (error) {
    console.error('Error updating prototype:', error);
    return NextResponse.json({ error: 'Failed to update prototype' }, { status: 500 });
  }
}