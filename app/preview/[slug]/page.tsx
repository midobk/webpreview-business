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
  phone?: string;
  email?: string | null;
  address?: string;
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
  // Do NOT fall through to the raw source HTML. Source files contain the
  // real business name, phone, email and address; serving them without
  // anonymization exposes lead PII at a guessable slug. Source HTML is only
  // public via an explicit override (above), which anonymizes at render time.
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

  // Strip the remaining PII the lead record carries. The business name alone
  // is not enough — phone, email and address are also embedded in the source
  // HTML (contact sections, tel:/mailto: links, footer addresses) and would
  // leak the real business on a shareable preview link.
  const phone = lead?.phone?.trim();
  if (phone) {
    anonymized = anonymized.replace(new RegExp(escapeRegExp(phone), 'gi'), '');
  }
  const email = lead?.email?.trim();
  if (email) {
    anonymized = anonymized.replace(new RegExp(escapeRegExp(email), 'gi'), '');
  }
  const address = lead?.address?.trim();
  if (address) {
    anonymized = anonymized.replace(new RegExp(escapeRegExp(address), 'gi'), '');
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
  // Pre-render only the anonymized prototypes. Enumerating data/prototypes
  // (the raw source) would pre-render every lead's un-anonymized HTML —
  // exposing real business PII at a guessable slug before the lead has opted
  // in to a showcase. Raw-source slugs that are intentionally public via a
  // showcase-source-overrides entry are rendered on demand (with runtime
  // anonymization) and do not need to be in this list.
  const dir = path.join(process.cwd(), 'data', 'prototypes-anonymized');
  const slugs = new Set<string>();
  if (fs.existsSync(dir)) {
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
