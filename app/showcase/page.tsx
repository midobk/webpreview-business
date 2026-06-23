import { getLeads, getPrototypes } from '@/lib/data-source';
import Link from 'next/link';

export const metadata = {
  title: 'Showcase — SiteSprint',
  description: 'See sample website concepts we create for small businesses. All examples are anonymized demo concepts.',
};

// Industry → generic anonymized label
const INDUSTRY_LABELS: Record<string, string> = {
  cleaning: 'Modern Cleaning Service',
  salon: 'Modern Hair Salon',
  auto_repair: 'Local Auto Repair Shop',
  restaurant: 'Local Restaurant & Café',
  contractor: 'Home Contractor Service',
  barber: 'Barber Shop',
  landscaper: 'Landscaping Service',
  tutor: 'Private Tutor Service',
  retail: 'Local Retail Store',
  default: 'Local Service Business',
};

// Industry → tagline / one-liner used on the card
const INDUSTRY_TAGLINES: Record<string, string> = {
  cleaning: 'One-page website with services, before/after gallery, instant quote CTA.',
  salon: 'Stylist profiles, services grid, online booking CTA.',
  auto_repair: 'Service list, certifications, contact + map, quote CTA.',
  restaurant: 'Menu highlights, reservation CTA, photo gallery.',
  contractor: 'Project gallery, quote request, before/after showcase.',
  barber: 'Barber profiles, service menu, walk-in CTA.',
  landscaper: 'Seasonal services, before/after gallery, free estimate CTA.',
  tutor: 'Subjects, tutor profile, booking CTA.',
  retail: 'Featured products, story, visit-us CTA.',
  default: 'Clean one-page website with services, contact, and CTA.',
};

interface Prototype {
  id: string;
  lead_id: string;
  prototype_url: string | null;
  screenshot_url: string | null;
  title: string;
  design_summary: string;
  prototype_score: number | null;
  generation_status: string;
  showcase_approved: boolean;
  showcase_eligible?: boolean;
  anonymized?: boolean;
  created_at: string;
}

interface Lead {
  id: string;
  business_name: string;
  slug: string;
  industry: string;
  city: string;
  province: string;
}

function anonymizeTitle(prototype: Prototype, lead?: Lead): string {
  const industry = lead?.industry ?? 'default';
  const baseLabel = INDUSTRY_LABELS[industry] || INDUSTRY_LABELS.default;
  return `${baseLabel} Landing Page`;
}

function taglineFor(prototype: Prototype, lead?: Lead): string {
  const industry = lead?.industry ?? 'default';
  return INDUSTRY_TAGLINES[industry] || INDUSTRY_TAGLINES.default;
}

async function loadShowcase(): Promise<
  Array<{
    id: string;
    anonymizedTitle: string;
    tagline: string;
    industry: string;
    prototypeUrl: string | null;
    screenshotUrl: string | null;
    prototypeScore: number | null;
    createdAt: string;
  }>
> {
  // Use the Supabase-aware data accessor so the showcase shows the latest
  // approved prototypes (not the frozen build bundle).
  // Falls back to the embedded bundle when Supabase is not configured.
  const [allPrototypes, allLeads] = await Promise.all([
    getPrototypes(),
    getLeads(),
  ]);

  const leadsById = new Map(allLeads.map((l) => [l.id, l]));

  // Only show: approved + completed + showcase_eligible (passed the scoring gate)
  // The scoring gate (score_showcase.py) ensures quality + proper anonymization
  const visible = allPrototypes.filter(
    (p) =>
      p.showcase_approved === true &&
      p.generation_status === 'completed' &&
      p.showcase_eligible === true &&
      p.anonymized === true
  );

  return visible.map((p) => {
    const lead = leadsById.get(p.lead_id);
    return {
      id: p.id,
      anonymizedTitle: anonymizeTitle(p, lead),
      tagline: taglineFor(p, lead),
      industry: lead?.industry ?? 'default',
      prototypeUrl: p.prototype_url,
      screenshotUrl: p.screenshot_url,
      prototypeScore: p.prototype_score,
      createdAt: p.created_at,
    };
  });
}

export default async function ShowcasePage() {
  const items = await loadShowcase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-indigo-600 text-white font-bold text-xl w-9 h-9 rounded-lg flex items-center justify-center">
              S
            </div>
            <span className="text-xl font-bold text-slate-900">SiteSprint</span>
          </Link>
          <nav className="hidden md:flex gap-8 text-sm font-medium text-slate-600">
            <Link href="/#features" className="hover:text-slate-900">
              Features
            </Link>
            <Link href="/#how-it-works" className="hover:text-slate-900">
              How It Works
            </Link>
            <Link href="/showcase" className="text-indigo-600">
              Showcase
            </Link>
          </nav>
          <Link
            href="/#request-preview"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block mb-4 px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
            Anonymized demo concepts
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Showcase of website concepts
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Every preview below is a concept designed for a real local business. Names,
            locations, and contact details have been removed. These are design demos only —
            not live sites.
          </p>
        </div>
      </section>

      {/* Empty state */}
      {items.length === 0 && (
        <section className="pb-24">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="border border-dashed border-slate-300 rounded-2xl bg-white p-12 text-center">
              <div className="text-5xl mb-4">🎨</div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Examples coming soon
              </h2>
              <p className="text-slate-600 mb-6">
                We're polishing our first round of prototypes. Approved concepts will appear
                here with anonymized screenshots.
              </p>
              <Link
                href="/#request-preview"
                className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Request a Preview
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Grid */}
      {items.length > 0 && (
        <section className="pb-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {items.map((item) => (
                <ShowcaseCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Want a website like this for your business?
          </h2>
          <p className="text-lg text-slate-300 mb-8">
            Tell us about your business and we'll generate an unofficial preview concept for
            you to review.
          </p>
          <Link
            href="/#request-preview"
            className="inline-block bg-indigo-500 hover:bg-indigo-400 text-white px-8 py-4 rounded-lg font-medium text-lg transition-colors"
          >
            Request My Preview
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} SiteSprint. All showcase examples are anonymized demo
            concepts.
          </p>
          <div className="flex gap-6 text-sm text-slate-500">
            <Link href="/" className="hover:text-slate-900">
              Home
            </Link>
            <Link href="/showcase" className="hover:text-slate-900">
              Showcase
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ShowcaseCard({
  item,
}: {
  item: {
    id: string;
    anonymizedTitle: string;
    tagline: string;
    industry: string;
    prototypeUrl: string | null;
    screenshotUrl: string | null;
    prototypeScore: number | null;
    createdAt: string;
  };
}) {
  // Resolve screenshot path to a public URL.
  // - If the URL is already a public path (/prototype-screenshots/...) or http(s),
  //   use it directly.
  // - Otherwise, proxy through /api/showcase-image (for data/... paths).
  const screenshotSrc = item.screenshotUrl
    ? item.screenshotUrl.startsWith('/') && !item.screenshotUrl.startsWith('/data/')
      ? item.screenshotUrl
      : item.screenshotUrl.startsWith('http')
      ? item.screenshotUrl
      : `/api/showcase-image?path=${encodeURIComponent(item.screenshotUrl)}`
    : null;

  return (
    <article className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="aspect-[4/3] bg-gradient-to-br from-slate-100 to-slate-200 relative overflow-hidden">
        {screenshotSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={screenshotSrc}
            alt={`${item.anonymizedTitle} — screenshot preview`}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            <span className="text-5xl">🖼️</span>
          </div>
        )}
        {item.prototypeScore !== null && (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-full text-xs font-semibold text-slate-700">
            ★ {item.prototypeScore}
          </div>
        )}
        <div className="absolute top-3 left-3 bg-indigo-600/90 backdrop-blur px-2.5 py-1 rounded-full text-xs font-semibold text-white uppercase tracking-wide">
          Demo
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-2">{item.anonymizedTitle}</h3>
        <p className="text-sm text-slate-600 mb-4 leading-relaxed">{item.tagline}</p>
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="capitalize">{item.industry.replace('_', ' ')}</span>
          {item.prototypeUrl && (
            <a
              href={`/preview/${encodeURIComponent(item.prototypeUrl.split('/').slice(-2, -1)[0] || '')}`}
              className="text-indigo-600 font-medium hover:text-indigo-700"
            >
              View concept →
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
