import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// GET /api/showcase-image?path=data/prototypes/<slug>/screenshot.png
// GET /api/showcase-image?path=data/prototypes/<slug>/images/<filename>
//
// Serves approved prototype assets only:
//   - approved showcase screenshots for the public /showcase grid
//   - preview-page images (hero, section photos) referenced by the
//     rewritten src/url() URLs in embedded prototype HTML
//
// HTML, package files and arbitrary files in a prototype directory are
// intentionally not public. Path traversal is blocked at multiple layers:
//   1. The slug is matched against a strict allowlist of characters.
//   2. The relative path is matched against one of two fixed patterns.
//   3. The resolved path must sit under data/prototypes/.
//   4. fs.realpath() must also resolve under data/prototypes/ (catches
//      symlinks that escape the allowed root).
const SCREENSHOT_PATTERN = /^screenshot(?:-[a-z0-9-]+)?\.(?:png|jpe?g|webp)$/i;
const PREVIEW_IMAGE_PATTERN = /^[a-z0-9][a-z0-9._-]*\.(?:png|jpe?g|webp|gif|svg|avif)$/i;
const SLUG_PATTERN = /^[a-z0-9][a-z0-9&_-]*$/i;

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

  if (!SLUG_PATTERN.test(segments[0] || '')) {
    return NextResponse.json({ error: 'Invalid image path' }, { status: 403 });
  }

  let candidateRelative: string;
  if (segments.length === 2) {
    // Showcase card: <slug>/screenshot[-variant].(png|jpg|jpeg|webp)
    if (!SCREENSHOT_PATTERN.test(segments[1])) {
      return NextResponse.json({ error: 'Invalid image path' }, { status: 403 });
    }
    candidateRelative = segments.join('/');
  } else if (segments.length === 3 && segments[1] === 'images') {
    // Preview asset: <slug>/images/<filename> — referenced by the
    // src/url() rewriter in app/preview/[slug]/page.tsx for HTML
    // embedded via srcDoc.
    if (!PREVIEW_IMAGE_PATTERN.test(segments[2])) {
      return NextResponse.json({ error: 'Invalid image path' }, { status: 403 });
    }
    candidateRelative = segments.join('/');
  } else {
    return NextResponse.json({ error: 'Invalid image path' }, { status: 403 });
  }

  // Normalize and resolve the path; ensure it stays within data/prototypes/.
  // turbopackIgnore: true — these reads only happen at request time on the server,
  // not during build, so it's safe to scope to process.cwd() here.
  const repoRoot = /*turbopackIgnore: true*/ process.cwd();
  const allowedRoot = /*turbopackIgnore: true*/ path.resolve(repoRoot, 'data', 'prototypes');
  const candidate = path.resolve(allowedRoot, candidateRelative);
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
