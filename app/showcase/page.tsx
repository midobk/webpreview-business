import { getLeads, getPrototypes } from '@/lib/data-source';
import Link from 'next/link';
import ShowcaseGrid from './_components/ShowcaseGrid';
import ShowcaseHero from './_components/ShowcaseHero';
import ShowcaseCTA from './_components/ShowcaseCTA';
import '../_landing/v2.css';
import { SITE_URL } from '@/lib/site-config';
import { isShowcaseVisible } from '@/lib/showcase-policy';

export const metadata = {
  title: 'Showcase — Seaway Sites',
  description: 'See sample website concepts we create for small businesses. All examples are anonymized demo concepts.',
  alternates: { canonical: `${SITE_URL}/showcase` },
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
  accounting: 'Local Accounting Firm',
  electrician: 'Licensed Electrician',
  plumber: 'Local Plumbing Company',
  default: 'Local Service Business',
};

// Industry → tagline / one-liner used on the card
const INDUSTRY_TAGLINES: Record<string, string> = {
  cleaning: 'Premium service storytelling, trust cues, before/after results, and a guided quote CTA.',
  salon: 'Editorial lookbook, consultation-led services, booking journey, and luxury brand polish.',
  auto_repair: 'Service list, certifications, contact + map, quote CTA.',
  restaurant: 'Menu highlights, reservation CTA, photo gallery.',
  contractor: 'Project gallery, quote request, before/after showcase.',
  barber: 'Barber profiles, service menu, walk-in CTA.',
  landscaper: 'Seasonal services, before/after gallery, free estimate CTA.',
  tutor: 'Subjects, tutor profile, booking CTA.',
  retail: 'Featured products, story, visit-us CTA.',
  saas: 'Product positioning, feature showcase, social proof, and trial-focused CTA.',
  real_estate: 'Featured listings, property search, agent story, and inquiry CTA.',
  dental_clinic: 'Treatment highlights, trust signals, online booking, and patient testimonials.',
  fitness_gym: 'Programs, challenge offer, member stories, and membership pricing.',
  law_firm: 'Practice areas, attorney profiles, consultation form, and credibility signals.',
  home_services: 'Service selector, instant quote, guarantees, and verified reviews.',
  ecommerce_product: 'Interactive product options, comparison table, reviews, and checkout CTAs.',
  online_course: 'Course outcomes, curriculum timeline, instructor proof, FAQ, and enrollment tiers.',
  accounting: 'Filing-calendar centerpiece, fixed-fee services, plain-answer positioning, and consult CTA.',
  electrician: 'Licence trust strip, written-quote promise, labeled-panel detail, and quote CTA.',
  plumber: 'Route-board sample day, flat-fee promises, service-area pills, and booking CTA.',
  default: 'Clean one-page website with services, contact, and CTA.',
};

interface Prototype {
  id: string;
  lead_id: string | null;
  industry?: string | null;
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
    isShowcaseVisible
  );

  return visible.map((p) => {
    const lead = p.lead_id ? leadsById.get(p.lead_id) : undefined;
    // Resolve industry from the prototype first (playground / orphan prototypes
    // have lead_id: null), then the lead, then fall back to 'default'.
    const industry = p.industry ?? lead?.industry ?? 'default';
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
    <div className="v2-root relative min-h-screen overflow-x-clip">
      <div className="v2-grain" aria-hidden="true" />

      {/* Header — same night-studio shell as the landing page */}
      <header className="v2-header is-scrolled sticky top-0 z-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 sm:px-8 py-4">
          <Link href="/" className="flex items-baseline gap-2">
            <span className="v2-serif text-xl font-semibold tracking-tight">Seaway Sites</span>
            <span className="v2-mono text-[9px] text-[var(--v2-lume)]">the drafting table</span>
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-sm text-[var(--v2-cream-dim)]" aria-label="Site">
            <Link href="/#proof" className="hover:text-[var(--v2-cream)] transition-colors">
              Proof
            </Link>
            <Link href="/#process" className="hover:text-[var(--v2-cream)] transition-colors">
              How it works
            </Link>
            <Link href="/showcase" aria-current="page" className="text-[var(--v2-lume)]">
              Examples
            </Link>
            <Link href="/#pricing" className="hover:text-[var(--v2-cream)] transition-colors">
              Pricing
            </Link>
            <Link href="/#faq" className="hover:text-[var(--v2-cream)] transition-colors">
              FAQ
            </Link>
          </nav>
          <Link href="/#preview" className="v2-btn v2-btn-primary !px-4 !py-2 text-sm">
            Get my preview
          </Link>
        </div>
      </header>

      {/* Hero */}
      <ShowcaseHero />

      {/* Empty state */}
      {items.length === 0 && (
        <section className="pb-24">
          <div className="mx-auto max-w-3xl px-5 sm:px-8">
            <div className="rounded-2xl border border-dashed border-[var(--v2-line-strong)] p-12 text-center">
              <h2 className="v2-serif mb-2 text-2xl font-medium md:text-3xl">
                Examples coming soon
              </h2>
              <p className="mx-auto mb-7 max-w-md leading-relaxed text-[var(--v2-cream-dim)]">
                We&rsquo;re polishing our first round of drafts. Approved previews will appear
                here with anonymized screenshots.
              </p>
              <Link href="/#preview" className="v2-btn v2-btn-primary">
                Request a preview →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Grid (client component handles filter chips) */}
      {items.length > 0 && (
        <section className="pb-24">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <ShowcaseGrid items={items} />
          </div>
        </section>
      )}

      {/* CTA */}
      <ShowcaseCTA />

      {/* Footer — mirrors the landing footer */}
      <footer className="border-t border-[var(--v2-line)] py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-5 sm:px-8 sm:flex-row">
          <div className="flex items-baseline gap-2">
            <span className="v2-serif text-lg font-semibold">Seaway Sites</span>
            <span className="v2-mono text-[9px] text-[var(--v2-cream-faint)]">
              all examples anonymized
            </span>
          </div>
          <nav className="flex items-center gap-6 text-sm text-[var(--v2-cream-dim)]" aria-label="Footer">
            <Link href="/" className="hover:text-[var(--v2-cream)] transition-colors">
              Home
            </Link>
            <Link href="/#pricing" className="hover:text-[var(--v2-cream)] transition-colors">
              Pricing
            </Link>
            <Link href="/privacy" className="hover:text-[var(--v2-cream)] transition-colors">
              Privacy
            </Link>
          </nav>
          <div className="v2-mono text-[9px] text-[var(--v2-cream-faint)]">
            © {new Date().getFullYear()} · made in canada
          </div>
        </div>
      </footer>
    </div>
  );
}
