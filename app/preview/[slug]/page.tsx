import { notFound } from 'next/navigation';
import path from 'path';
import fs from 'fs';
import { readdir } from 'fs/promises';
import { RevisionRequest } from './RevisionRequest';

interface PreviewPageProps {
  params: Promise<{ slug: string }>;
}

type ShowcaseSourceOverride = {
  useSourcePrototype?: boolean;
  genericTitle?: string;
  genericShortName?: string;
};

type ShowcaseSourceOverrides = Record<string, ShowcaseSourceOverride>;

type LeadRecord = {
  slug?: string;
  business_name?: string;
};

function readJsonFile<T>(filePath: string, fallback: T): T {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T;
  } catch {
    return fallback;
  }
}

function loadSourceOverrides(): ShowcaseSourceOverrides {
  return readJsonFile<ShowcaseSourceOverrides>(
    path.join(process.cwd(), 'data', 'showcase-source-overrides.json'),
    {}
  );
}

/**
 * Most public previews use their pre-generated anonymized HTML. A small number
 * of upgraded legacy prototypes may explicitly use the current source HTML;
 * those are anonymized at render time using their lead metadata.
 */
function resolvePrototypePath(
  slug: string,
  override?: ShowcaseSourceOverride
): { filePath: string; requiresRuntimeAnonymization: boolean } | null {
  const anonymizedPath = path.join(
    process.cwd(),
    'data',
    'prototypes-anonymized',
    slug,
    'index.html'
  );
  const sourcePath = path.join(process.cwd(), 'data', 'prototypes', slug, 'index.html');

  if (override?.useSourcePrototype && fs.existsSync(sourcePath)) {
    return { filePath: sourcePath, requiresRuntimeAnonymization: true };
  }
  if (fs.existsSync(anonymizedPath)) {
    return { filePath: anonymizedPath, requiresRuntimeAnonymization: false };
  }
  if (fs.existsSync(sourcePath)) {
    return { filePath: sourcePath, requiresRuntimeAnonymization: false };
  }
  return null;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function anonymizeSourceHtml(
  html: string,
  slug: string,
  override: ShowcaseSourceOverride
): string {
  const leads = readJsonFile<LeadRecord[]>(path.join(process.cwd(), 'data', 'leads.json'), []);
  const lead = leads.find((candidate) => candidate.slug === slug);
  const businessName = lead?.business_name;
  const genericTitle = override.genericTitle || 'Local Business';
  const genericShortName = override.genericShortName || 'The Studio';

  if (!businessName) return html;

  const shortName = businessName
    .replace(/\s+(hair\s+studio|hair\s+salon|salon|studio)$/i, '')
    .trim();

  let anonymized = html;

  if (shortName && shortName !== businessName) {
    const escapedShortName = escapeRegExp(shortName);
    anonymized = anonymized
      .replace(
        new RegExp(`The\\s+${escapedShortName}\\s+experience`, 'gi'),
        'The studio experience'
      )
      .replace(
        new RegExp(`${escapedShortName}\\s+latest`, 'gi'),
        "the studio's latest"
      );
  }

  anonymized = anonymized.replace(
    new RegExp(escapeRegExp(businessName), 'gi'),
    genericTitle
  );

  if (shortName && shortName !== businessName) {
    anonymized = anonymized.replace(
      new RegExp(escapeRegExp(shortName), 'gi'),
      genericShortName
    );
  }

  return anonymized;
}

/**
 * Prototype HTML is embedded with srcDoc, so relative image URLs otherwise
 * resolve against /preview/... instead of the prototype directory. Route all
 * local prototype images through the path-constrained image endpoint.
 */
function rewriteLocalPrototypeAssets(html: string, slug: string, publicShowcasePreview: boolean): string {
  const imagesDirectory = path.join(process.cwd(), 'data', 'prototypes', slug, 'images');
  if (!fs.existsSync(imagesDirectory)) return html;

  const publicImageUrl = (filename: string) => publicShowcasePreview
    ? `/api/showcase-image?path=${encodeURIComponent(
        path.posix.join('data', 'prototypes', slug, 'images', filename)
      )}`
    : `/api/preview-image?slug=${encodeURIComponent(slug)}&file=${encodeURIComponent(filename)}`;

  return html
    .replace(
      /src=(['"])\.\/images\/([^'"]+)\1/gi,
      (_match, quote: string, filename: string) =>
        `src=${quote}${publicImageUrl(filename)}${quote}`
    )
    .replace(
      /url\((['"]?)\.\/images\/([^)'"\s]+)\1\)/gi,
      (_match, _quote: string, filename: string) => `url('${publicImageUrl(filename)}')`
    );
}

export default async function PreviewPage({ params }: PreviewPageProps) {
  const { slug } = await params;
  const override = loadSourceOverrides()[slug];
  const resolved = resolvePrototypePath(slug, override);

  if (!resolved) {
    notFound();
  }

  const publicShowcasePreview = Boolean(override?.useSourcePrototype) ||
    resolved.filePath.includes(`${path.sep}prototypes-anonymized${path.sep}`);

  let htmlContent = fs.readFileSync(resolved.filePath, 'utf8');

  if (resolved.requiresRuntimeAnonymization && override) {
    htmlContent = anonymizeSourceHtml(htmlContent, slug, override);
  }
  htmlContent = rewriteLocalPrototypeAssets(htmlContent, slug, publicShowcasePreview);

  const titleMatch = htmlContent.match(/<title>(.*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1] : `Preview for ${slug}`;

  return (
    <div className="relative w-full h-screen">
      <iframe
        srcDoc={htmlContent}
        title={title}
        className="w-full h-full border-0"
        // Keep the generated HTML in an opaque origin. Generated scripts can
        // animate the draft, but cannot reach the parent app or its cookies.
        sandbox="allow-scripts"
      />
      {!publicShowcasePreview && <RevisionRequest slug={slug} />}
    </div>
  );
}

export async function generateStaticParams() {
  // Enumerate both directories so production builds pre-render every slug
  // referenced by the showcase. Deduplicate slugs present in both locations.
  const dirs = [
    path.join(process.cwd(), 'data', 'prototypes-anonymized'),
    path.join(process.cwd(), 'data', 'prototypes'),
  ];
  const slugs = new Set<string>();
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    try {
      const entries = await readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) slugs.add(entry.name);
      }
    } catch {
      // Ignore unreadable directories.
    }
  }
  return Array.from(slugs).map((slug) => ({ slug }));
}
