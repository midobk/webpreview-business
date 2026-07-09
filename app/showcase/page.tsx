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
            Get my preview
          </Link>
        </div>
      </header>

      {/* Hero */}
      <ShowcaseHero />

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

