import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getPrototypes } from '@/lib/data-source';
import { isShowcaseVisible } from '@/lib/showcase-policy';

// Extract the slug from a stored prototype_url / screenshot_url so we can
// match the request slug to a prototype record. Mirrors the helper in
// showcase-image/route.ts.
const SLUG_FROM_URL = /(?:data\/prototypes(?:-anonymized)?|\/preview)\/([^/?#]+)/i;
function slugFromAssetUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const match = value.match(SLUG_FROM_URL);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');
  const file = searchParams.get('file');

  if (!slug || !file) {
    return NextResponse.json({ error: 'Missing slug or file' }, { status: 400 });
  }

  // Sanitize inputs to prevent path traversal
  if (slug.includes('..') || slug.includes('/') || file.includes('..') || file.includes('/')) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 403 });
  }

  // Preview links are shareable, so a bare slug is not sufficient authorization.
  // Only serve images for prototypes that are already public on the showcase
  // (approved + anonymized + eligible + completed) — the same gate as
  // /api/showcase-image. Unapproved/raw draft images are never exposed here.
  const prototypes = await getPrototypes();
  const isVisible = prototypes.some(
    (prototype) =>
      isShowcaseVisible(prototype) &&
      [prototype.prototype_url, prototype.screenshot_url].some((url) => slugFromAssetUrl(url) === slug)
  );
  if (!isVisible) {
    return NextResponse.json({ error: 'Image not available' }, { status: 404 });
  }

  const ext = path.extname(file).slice(1).toLowerCase();
  const contentType = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : null;
  if (!contentType) {
    return NextResponse.json({ error: 'Unsupported image type' }, { status: 400 });
  }

  const prototypeRoot = path.resolve(process.cwd(), 'data', 'prototypes');
  const filePath = path.resolve(prototypeRoot, slug, 'images', file);
  if (!filePath.startsWith(`${prototypeRoot}${path.sep}`)) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 403 });
  }

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: 'Image not found' }, { status: 404 });
  }

  try {
    const realRoot = fs.realpathSync(prototypeRoot);
    const realFile = fs.realpathSync(filePath);
    if (!realFile.startsWith(`${realRoot}${path.sep}`) || !fs.statSync(realFile).isFile()) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 403 });
    }
    const buffer = fs.readFileSync(realFile);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Image not found' }, { status: 404 });
  }
}

export const dynamic = 'force-dynamic';
