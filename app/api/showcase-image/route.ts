import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// GET /api/showcase-image?path=data/prototypes/<slug>/screenshot.png
// Serves anonymized screenshots from the data/ directory.
// Path is constrained to data/prototypes/<slug>/<file> only.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const requested = searchParams.get('path');

  if (!requested) {
    return NextResponse.json({ error: 'Missing path' }, { status: 400 });
  }

  // Normalize and resolve the path; ensure it stays within data/prototypes/
  const repoRoot = process.cwd();
  const candidates = [
    path.resolve(repoRoot, requested),
    path.resolve(repoRoot, 'data', 'prototypes', requested),
  ];

  const allowedRoot = path.resolve(repoRoot, 'data', 'prototypes');
  const resolved = candidates.find((c) => c.startsWith(allowedRoot + path.sep));
  if (!resolved) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 403 });
  }

  try {
    const buffer = await fs.readFile(resolved);
    const ext = path.extname(resolved).toLowerCase();
    const mime =
      ext === '.png'
        ? 'image/png'
        : ext === '.jpg' || ext === '.jpeg'
        ? 'image/jpeg'
        : ext === '.webp'
        ? 'image/webp'
        : ext === '.svg'
        ? 'image/svg+xml'
        : 'application/octet-stream';

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': mime,
        'Cache-Control': 'public, max-age=300',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
