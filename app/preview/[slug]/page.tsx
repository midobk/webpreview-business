import { notFound } from 'next/navigation';
import path from 'path';
import fs from 'fs';
import { readdir } from 'fs/promises';

interface PreviewPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Lookup order — historically the directory was `data/prototypes/`. After the
 * playground-vetting workflow (plan_03446241) we standardised on
 * `data/prototypes-anonymized/` for new prototypes, but older entries still
 * live in the legacy directory. Try both so a slug served by `/showcase`
 * always resolves to a real HTML file.
 */
function resolvePrototypePath(slug: string): string | null {
  const candidates = [
    path.join(process.cwd(), 'data', 'prototypes-anonymized', slug, 'index.html'),
    path.join(process.cwd(), 'data', 'prototypes', slug, 'index.html'),
  ];
  return candidates.find((p) => fs.existsSync(p)) ?? null;
}

export default async function PreviewPage({ params }: PreviewPageProps) {
  const { slug } = await params;

  const prototypePath = resolvePrototypePath(slug);
  if (!prototypePath) {
    notFound();
  }

  const htmlContent = fs.readFileSync(prototypePath, 'utf8');

  const titleMatch = htmlContent.match(/<title>(.*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1] : `Preview for ${slug}`;

  return (
    <div className="w-full h-screen">
      <iframe 
        srcDoc={htmlContent} 
        title={title}
        className="w-full h-full border-0"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
}

export async function generateStaticParams() {
  // Enumerate both directories so production builds pre-render every slug
  // referenced by the showcase. Deduplicate so a slug that lives in both
  // (e.g. seaway-cleaning-services) doesn't get emitted twice.
  const dirs = [
    path.join(process.cwd(), 'data', 'prototypes-anonymized'),
    path.join(process.cwd(), 'data', 'prototypes'),
  ];
  const slugs = new Set<string>();
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    try {
      const entries = await readdir(dir, { withFileTypes: true });
      for (const d of entries) {
        if (d.isDirectory()) slugs.add(d.name);
      }
    } catch {
      // Ignore unreadable dirs.
    }
  }
  return Array.from(slugs).map((slug) => ({ slug }));
}