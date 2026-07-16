import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { cookies } from 'next/headers';
import { getPrototypes } from '@/lib/data-source';
import { isValidDraftPreviewToken } from '@/lib/draft-preview-token';
import { isShowcaseVisible } from '@/lib/showcase-policy';
import { isValidAdminSession } from '@/lib/auth-edge';

const SLUG_PATTERN = /^[a-z0-9][a-z0-9&_-]*$/i;
const FILE_PATTERN = /^[a-z0-9][a-z0-9._-]*\.(?:png|jpe?g|webp)$/i;

// Extract the slug from a stored prototype_url / screenshot_url so a public,
// approved showcase preview can still load through this endpoint if needed.
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
  const token = searchParams.get('token');

  if (!slug || !file) {
    return NextResponse.json({ error: 'Missing slug or file' }, { status: 400 });
  }

  if (!SLUG_PATTERN.test(slug) || !FILE_PATTERN.test(file)) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 403 });
  }

  // Customer draft assets require the signed token carried by the parent
  // /preview/<slug> URL. Public showcase assets remain available only when the
  // prototype passes the same visibility policy as /showcase. An authenticated
  // admin session also unlocks the asset, so dashboard links that open
  // /preview/<slug> without a token still render their local hero/service
  // images instead of 404-ing on every ./images/... reference.
  const privateAuthorized = isValidDraftPreviewToken(slug, token);
  let adminAuthorized = false;
  if (!privateAuthorized) {
    const adminCookie = await cookies();
    const session = adminCookie.get('admin_session')?.value;
    adminAuthorized = await isValidAdminSession(session);
  }
  let publicAuthorized = false;

  if (!privateAuthorized && !adminAuthorized) {
    const prototypes = await getPrototypes();
    publicAuthorized = prototypes.some(
      (prototype) =>
        isShowcaseVisible(prototype) &&
        [prototype.prototype_url, prototype.screenshot_url].some(
          (url) => slugFromAssetUrl(url) === slug
        )
    );
  }

  if (!privateAuthorized && !adminAuthorized && !publicAuthorized) {
    return NextResponse.json({ error: 'Image not available' }, { status: 404 });
  }

  const ext = path.extname(file).slice(1).toLowerCase();
  const contentType =
    ext === 'jpg' || ext === 'jpeg'
      ? 'image/jpeg'
      : ext === 'png'
        ? 'image/png'
        : ext === 'webp'
          ? 'image/webp'
          : null;

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
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': privateAuthorized
          ? 'private, no-store'
          : adminAuthorized
            ? 'private, no-store'
            : 'public, max-age=3600, s-maxage=86400, immutable',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Image not found' }, { status: 404 });
  }
}

export const dynamic = 'force-dynamic';
