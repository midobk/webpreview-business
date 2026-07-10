import { getLeads, getPrototypes } from '@/lib/data-source';
import Link from 'next/link';
import ShowcaseGrid from './_components/ShowcaseGrid';
import ShowcaseHero from './_components/ShowcaseHero';
import ShowcaseCTA from './_components/ShowcaseCTA';

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
  saas: 'Modern SaaS Product',
  real_estate: 'Modern Real Estate Brokerage',
  dental_clinic: 'Modern Dental Studio',
  fitness_gym: 'Modern Fitness Studio',
  law_firm: 'Modern Law Firm',
  home_services: 'Modern Home Services',
  ecommerce_product: 'Modern E-commerce Brand',
  online_course: 'Modern Online Course',
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

function anonymizeTitle(prototype: Prototype, lead?: Lead, industry?: string): string {
  const resolved = industry ?? lead?.industry ?? 'default';
  const baseLabel = INDUSTRY_LABELS[resolved] || INDUSTRY_LABELS.default;
  return `${baseLabel} Landing Page`;
}

function taglineFor(prototype: Prototype, lead?: Lead, industry?: string): string {
  const resolved = industry ?? lead?.industry ?? 'default';
  return INDUSTRY_TAGLINES[resolved] || INDUSTRY_TAGLINES.default;
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
    // Resolve industry from the prototype first (playground / orphan prototypes
    // have lead_id: null), then the lead, then fall back to 'default'.
    const industry: string =
      (p as any).industry ?? lead?.industry ?? 'default';
    return {
      id: p.id,
      anonymizedTitle: anonymizeTitle(p, lead, industry),
      tagline: taglineFor(p, lead, industry),
      industry,
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
    <div className="min-h-screen bg-paper">
      {/* Header — light warm-print, sticky */}
      <header className="border-b border-paint/10 bg-paper/85 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="relative w-9 h-9 rounded-lg bg-warm-gradient flex items-center justify-center text-white font-extrabold text-lg shadow-lg shadow-paint/30">
              S
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="absolute -top-1.5 -right-1.5 w-4 h-4 text-signal">
                <path d="M12 2l1.2 3.4 2.6-1.6-1 3 2.8.8-2.4 1.6 2.4 2.6-3.4.4 1.2 3.2-2.8-1.4L12 22l-.6-7.6-2.8 1.4 1.2-3.2-3.4-.4 2.4-2.6-2.4-1.6 2.8-.8-1-3 2.6 1.6z" />
              </svg>
            </div>
            <span className="text-xl font-extrabold tracking-tight text-ink">SiteSprint</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-steel">
            <Link href="/#features" className="hover:text-ink transition-colors">
              Features
            </Link>
            <Link href="/#how-it-works" className="hover:text-ink transition-colors">
              How it works
            </Link>
            <Link href="/showcase" className="text-paint">
              Examples
            </Link>
            <Link href="/#pricing" className="hover:text-ink transition-colors">
              Pricing
            </Link>
            <Link href="/#faq" className="hover:text-ink transition-colors">
              FAQ
            </Link>
          </nav>
          <Link
            href="/#request-preview"
            className="inline-flex items-center gap-1.5 bg-action text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-action-deep transition-colors shadow-lg shadow-action/20"
          >
            Get my preview
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <ShowcaseHero />

      {/* Empty state */}
      {items.length === 0 && (
        <section className="pb-24">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="border border-dashed border-paint/30 rounded-2xl bg-paper p-12 text-center shadow-sm">
              <h2
                className="text-2xl md:text-3xl font-medium text-ink mb-2"
                style={{ fontFamily: 'var(--font-fraunces)', fontVariationSettings: '"opsz" 96' }}
              >
                Examples coming soon
              </h2>
              <p className="text-steel mb-6 max-w-md mx-auto leading-relaxed">
                We&rsquo;re polishing our first round of concepts. Approved previews will appear
                here with anonymized screenshots.
              </p>
              <Link
                href="/#request-preview"
                className="inline-flex items-center gap-1.5 bg-action text-white px-6 py-3 rounded-full font-semibold hover:bg-action-deep transition-colors shadow-lg shadow-action/20"
              >
                Request a preview →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Grid (client component handles filter chips) */}
      {items.length > 0 && (
        <section className="pb-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ShowcaseGrid items={items} />
          </div>
        </section>
      )}

      {/* CTA */}
      <ShowcaseCTA />

      {/* Footer — warm ink, matches the landing footer */}
      <footer className="py-12 bg-ink text-white/65">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-white/55">
            © {new Date().getFullYear()} SiteSprint. All showcase examples are anonymized demo
            concepts.
          </p>
          <div className="flex gap-6 text-sm">
            <Link href="/" className="hover:text-signal transition-colors">
              Home
            </Link>
            <Link href="/showcase" className="hover:text-signal transition-colors">
              Examples
            </Link>
            <Link href="/#pricing" className="hover:text-signal transition-colors">
              Pricing
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

