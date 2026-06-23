import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

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

  const filePath = path.join(process.cwd(), 'data', 'prototypes', slug, 'images', file);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: 'Image not found' }, { status: 404 });
  }

  const buffer = fs.readFileSync(filePath);
  const ext = path.extname(file).slice(1).toLowerCase();
  const contentType = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'application/octet-stream';

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

export const dynamic = 'force-dynamic';