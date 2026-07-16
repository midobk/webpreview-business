import { notFound } from 'next/navigation';
import path from 'path';
import fs from 'fs';
import { readdir } from 'fs/promises';
import { cookies } from 'next/headers';
import { isValidDraftPreviewToken } from '@/lib/draft-preview-token';
import { isShowcaseVisible } from '@/lib/showcase-policy';
import { isValidAdminSession } from '@/lib/auth-server';
import { getPrototypes } from '@/lib/data-source';
import { RevisionRequest } from './RevisionRequest';

interface PreviewPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ token?: string | string[] }>;
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

const SLUG_PATTERN = /^[a-z0-9][a-z0-9&_-]{0,159}$/i;

type PrototypeRecord = {
  id?: string;
  prototype_url?: string;
  screenshot_url?: string;
  generation_status?: string;
  showcase_approved?: boolean;
  showcase_eligible?: boolean;
  anonymized?: boolean;
};

type ResolvedPrototype = {
  filePath: string;
  requiresRuntimeAnonymization: boolean;
  access: 'private' | 'showcase';
};

function readJsonFile<T>(filePath: string, fallback: T): T {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T;
  } catch {
    return fallback;
  }
}

async function loadPrototypeRecord(slug: string): Promise<PrototypeRecord | null> {
  // Use the live data source (Supabase when configured, build-bundle fallback)
  // so that admin approvals made after deploy are reflected here.
  const prototypes = await getPrototypes();
  return prototypes.find((p) => {
    if (p.id === slug) return true;
    const urlSlug = slugFromAssetUrl(p.prototype_url) || slugFromAssetUrl(p.screenshot_url);
    return urlSlug === slug;
  }) || null;
}

function slugFromAssetUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const match = value.match(/(?:data\/prototypes(?:-anonymized)?|\/preview)\/([^/?#]+)/i);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

function loadSourceOverrides(): ShowcaseSourceOverrides {
  return readJsonFile<ShowcaseSourceOverrides>(
    path.join(process.cwd(), 'data', 'showcase-source-overrides.json'),
    {}
  );
}

/**
 * Customer drafts use the raw source HTML, but only when the URL carries a
 * valid signed token for that exact slug. Public showcase previews continue to
 * use pre-generated anonymized HTML, or an explicitly approved source override
 * that is anonymized at render time.
 */
async function resolvePrototypePath(
  slug: string,
  token: string | undefined,
  override?: ShowcaseSourceOverride
): Promise<ResolvedPrototype | null> {
  const anonymizedPath = path.join(
    process.cwd(),
    'data',
    'prototypes-anonymized',
    slug,
    'index.html'
  );
  const sourcePath = path.join(process.cwd(), 'data', 'prototypes', slug, 'index.html');

  // A valid signed private link grants access to the raw source HTML.
  if (fs.existsSync(sourcePath) && isValidDraftPreviewToken(slug, token)) {
    return {
      filePath: sourcePath,
      requiresRuntimeAnonymization: false,
      access: 'private',
    };
  }

  // An authenticated admin session also grants private access, so the admin
  // dashboard's bare /preview/<slug> links work for pending/review prototypes
  // without requiring a signed token. This page runs in the Node runtime, so
  // use the .password-aware validator — the edge variant only reads env
  // secrets and rejects sessions in the file-only local setup.
  const adminCookie = await cookies();
  const adminSession = adminCookie.get('admin_session')?.value;
  const isAdmin = isValidAdminSession(adminSession);
  if (isAdmin && fs.existsSync(sourcePath)) {
    return {
      filePath: sourcePath,
      requiresRuntimeAnonymization: false,
      access: 'private',
    };
  }

  // Public showcase access requires the prototype record to pass the shared
  // showcase visibility policy (approved, eligible, anonymized, completed).
  // Uses the live data source so post-deploy approvals are reflected.
  const record = await loadPrototypeRecord(slug);
  const showcaseAuthorized = record ? isShowcaseVisible(record) : false;

  if (showcaseAuthorized && override?.useSourcePrototype && fs.existsSync(sourcePath)) {
    return {
      filePath: sourcePath,
      requiresRuntimeAnonymization: true,
      access: 'showcase',
    };
  }

  if (showcaseAuthorized && fs.existsSync(anonymizedPath)) {
    return {
      filePath: anonymizedPath,
      requiresRuntimeAnonymization: false,
      access: 'showcase',
    };
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
): string | null {
  const leads = readJsonFile<LeadRecord[]>(path.join(process.cwd(), 'data', 'leads.json'), []);
  const lead = leads.find((candidate) => candidate.slug === slug);
  const businessName = lead?.business_name;
  const genericTitle = override.genericTitle || 'Local Business';
  const genericShortName = override.genericShortName || 'The Studio';

  if (!businessName) return null;

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
 * local prototype images through a path-constrained endpoint. Private draft
 * assets carry the same signed token as the parent preview URL.
 */
function rewriteLocalPrototypeAssets(
  html: string,
  slug: string,
  publicShowcasePreview: boolean,
  token?: string
): string {
  const imagesDirectory = path.join(process.cwd(), 'data', 'prototypes', slug, 'images');
  if (!fs.existsSync(imagesDirectory)) return html;

  const publicImageUrl = (filename: string) => {
    if (publicShowcasePreview) {
      return `/api/showcase-image?path=${encodeURIComponent(
        path.posix.join('data', 'prototypes', slug, 'images', filename)
      )}`;
    }

    const params = new URLSearchParams({ slug, file: filename });
    if (token) params.set('token', token);
    return `/api/preview-image?${params.toString()}`;
  };

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

export default async function PreviewPage({ params, searchParams }: PreviewPageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  if (!SLUG_PATTERN.test(slug)) notFound();
  const rawToken = query.token;
  const token = Array.isArray(rawToken) ? rawToken[0] : rawToken;
  const override = loadSourceOverrides()[slug];
  const resolved = await resolvePrototypePath(slug, token, override);

  if (!resolved) {
    notFound();
  }

  const publicShowcasePreview = resolved.access === 'showcase';

  let htmlContent = fs.readFileSync(resolved.filePath, 'utf8');

  if (resolved.requiresRuntimeAnonymization && override) {
    const anonymized = anonymizeSourceHtml(htmlContent, slug, override);
    if (!anonymized) notFound();
    htmlContent = anonymized;
  }
  htmlContent = rewriteLocalPrototypeAssets(
    htmlContent,
    slug,
    publicShowcasePreview,
    token
  );

  const titleMatch = htmlContent.match(/<title>(.*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1] : `Preview for ${slug}`;

  return (
    <div className="relative w-full h-screen">
      <iframe
        srcDoc={htmlContent}
        title={title}
        className="w-full h-full border-0"
        // Generated scripts can animate the draft, but cannot reach the parent
        // app or its cookies. no-referrer also prevents a signed token in the
        // parent URL from leaking to third-party resources inside the draft.
        sandbox="allow-scripts"
        referrerPolicy="no-referrer"
      />
      {!publicShowcasePreview && <RevisionRequest slug={slug} token={token} />}
    </div>
  );
}

export async function generateStaticParams() {
  // Pre-render only the anonymized prototypes. Raw customer drafts require a
  // signed token and are rendered on demand, so they must never be emitted as
  // public static pages during a build.
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

export const dynamic = 'force-dynamic';
