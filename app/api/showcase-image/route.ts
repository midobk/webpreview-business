import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// GET /api/showcase-image?path=data/prototypes/<slug>/screenshot.png
// Serves approved prototype screenshots only. HTML, package files and
// arbitrary files in a prototype directory are intentionally not public.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const requested = searchParams.get('path');

  if (!requested) {
    return NextResponse.json({ error: 'Missing path' }, { status: 400 });
  }

  const normalized = requested.replace(/^\/+/, '');
  const relative = normalized.startsWith('data/prototypes/')
    ? normalized.slice('data/prototypes/'.length)
    : normalized;
  const segments = relative.split('/');
  const [slug, filename] = segments;

  if (
    segments.length !== 2 ||
    !/^[a-z0-9][a-z0-9&_-]*$/i.test(slug || '') ||
    !/^screenshot(?:-[a-z0-9-]+)?\.(?:png|jpe?g|webp)$/i.test(filename || '')
  ) {
    return NextResponse.json({ error: 'Invalid image path' }, { status: 403 });
  }

  // Normalize and resolve the path; ensure it stays within data/prototypes/.
  // turbopackIgnore: true — these reads only happen at request time on the server,
  // not during build, so it's safe to scope to process.cwd() here.
  const repoRoot = /*turbopackIgnore: true*/ process.cwd();
  const allowedRoot = /*turbopackIgnore: true*/ path.resolve(repoRoot, 'data', 'prototypes');
  const candidate = path.resolve(allowedRoot, slug, filename);
  if (!candidate.startsWith(allowedRoot + path.sep)) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 403 });
  }

  try {
    const resolved = await fs.realpath(candidate);
    if (!resolved.startsWith(allowedRoot + path.sep)) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 403 });
    }
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
        'Cache-Control': 'public, max-age=3600, s-maxage=86400, immutable',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
