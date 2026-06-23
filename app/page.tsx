'use client';

import { useEffect, useRef, useState } from 'react';

type FormState = {
  businessName: string;
  email: string;
  website: string;
  message: string;
};

const initialForm: FormState = {
  businessName: '',
  email: '',
  website: '',
  message: '',
};

/* ------------------------------------------------------------------ */
/*  Reveal-on-scroll hook                                             */
/* ------------------------------------------------------------------ */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('.reveal');
    if (!els.length) return;

    if (typeof IntersectionObserver === 'undefined') {
      els.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.05 }
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/* ------------------------------------------------------------------ */
/*  Section data                                                      */
/* ------------------------------------------------------------------ */
const features = [
  {
    title: '90-second previews',
    body: 'Tell us about your business. Get a complete, on-brand website concept in the time it takes to make coffee.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M13 10V3L4 14h7v7l9-11h-7z" />
    ),
  },
  {
    title: 'Built for Canadian SMBs',
    body: 'Indigo-spruce to coast. Optimized for local SEO, PIPEDA-aligned, and written in plain English — no jargon.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    ),
  },
  {
    title: 'Yours to keep',
    body: 'Love the preview? We finalize it on your domain, hand you the keys, and keep it maintained for $49/mo after a $299 setup. Hate it? Walk away.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    ),
  },
  {
    title: 'Mobile-first, always',
    body: 'Every preview is designed mobile-first, then scaled up. Your customers book from their phone, not their desk.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
    ),
  },
  {
    title: 'Real copy, not lorem ipsum',
    body: 'Our AI drafts copy from your business description and public info — so the preview reads like you, not a template.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    ),
  },
  {
    title: 'No commitment, ever',
    body: 'Free preview. Free revisions on the first draft. Pay only when you decide to keep the site — and even then, no contract.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    ),
  },
];

const steps = [
  {
    n: '1',
    title: 'Tell us about your business',
    body: '60-second form: name, what you do, where you operate. The more you share, the better the preview.',
  },
  {
    n: '2',
    title: 'We generate a live preview',
    body: 'Our AI reads public listings, reviews, and your description to draft copy and design a personalized one-pager.',
  },
  {
    n: '3',
    title: 'Review, refine, decide',
    body: 'Open the preview link. Love it? We finalize on your domain. Want changes? We iterate. Hate it? No invoice.',
  },
];

const pricingTiers = [
  {
    name: 'Preview',
    price: 'Free',
    cadence: 'No card required',
    description: 'See your future site before you commit.',
    features: [
      'AI-generated website preview',
      'Mobile + desktop design',
      'Personalized to your business',
      'No credit card',
      'Yours to keep or walk away from',
    ],
    cta: 'Generate my preview',
    ctaHref: '#request-preview',
    featured: false,
  },
  {
    name: 'Managed',
    price: '$299',
    cadence: 'one-time setup + $49/mo',
    description: 'Most popular. Live site, fully managed for you.',
    features: [
      'Everything in Preview, finalized',
      'Custom domain + SSL',
      'Hosting + maintenance included',
      'Unlimited small edits',
      'Priority support',
      'Cancel anytime',
    ],
    cta: 'Start managed plan',
    ctaHref: '#request-preview',
    featured: true,
  },
  {
    name: 'Standard',
    price: '$500',
    cadence: 'paid once, yours to host',
    description: 'Finalize the site, hand it off, host it yourself.',
    features: [
      'Finalized one-page website',
      'Mobile responsive, contact form',
      'Domain guidance + deployment help',
      '30 days of edits included',
      'No monthly fees',
    ],
    cta: 'Buy standard',
    ctaHref: '#request-preview',
    featured: false,
  },
  {
    name: 'Full Handoff',
    price: '$799',
    cadence: 'paid once, source files included',
    description: 'Source code + handoff + zero recurring.',
    features: [
      'Source files + deployment handoff',
      'Domain + hosting guidance',
      'No recurring support',
      '30 days of bug-fix edits',
      'For developers / agencies',
    ],
    cta: 'Buy full handoff',
    ctaHref: '#request-preview',
    featured: false,
  },
];

const testimonials = [
  {
    quote:
      "I run a two-truck cleaning company in Etobicoke. SiteSprint had a preview waiting in my inbox before I'd finished my Tim Hortons. The booking form alone would have cost me $3,000 from an agency.",
    name: 'Maria D.',
    role: 'Sparkle & Shine Cleaning',
    location: 'Toronto, ON',
    initials: 'MD',
    accent: 'from-indigo-500 to-violet-600',
  },
  {
    quote:
      "I'm a solo hairstylist in Kits. I don't have time to learn Squarespace for the third time. SiteSprint gave me something I was actually proud to text my clients — and the price was less than a single colour service.",
    name: 'Jenna T.',
    role: 'Jenna T. Hair Studio',
    location: 'Vancouver, BC',
    initials: 'JT',
    accent: 'from-violet-500 to-pink-500',
  },
  {
    quote:
      "My shop's old site still had my ex-wife's cell number on it. SiteSprint built a new one in my coffee break, and I got three bookings the first week. The fact that it's hosted in Canada mattered to me.",
    name: 'Dave R.',
    role: 'North Hill Auto',
    location: 'Calgary, AB',
    initials: 'DR',
    accent: 'from-pink-500 to-indigo-500',
  },
];

const faqs = [
  {
    q: 'How fast is "90 seconds", really?',
    a: "Most previews are ready in under two minutes. The longest part is waiting for you to fill out the form. We're not exaggerating — your preview link often arrives before the confirmation email does.",
  },
  {
    q: 'Do I own the website when it\'s done?',
    a: 'On the Managed plan, we host and maintain it for you (you can cancel any time). On the One-time plan, source files are yours — host them anywhere, edit them yourself, no lock-in.',
  },
  {
    q: 'Can I edit the preview after I see it?',
    a: 'Yes. Reply to your preview email with what you want changed — colours, copy, layout. We iterate until you love it, included in the final package.',
  },
  {
    q: 'Is my business data stored in Canada?',
    a: 'Yes. Our infrastructure runs in Montréal and Toronto. We\'re PIPEDA-aligned and never sell or share your business data with third parties.',
  },
  {
    q: 'What if I don\'t like the preview?',
    a: "Walk away. No invoice, no follow-up spam. We'll ask one quick 'what was wrong?' so we can do better next time, but you don't owe us anything.",
  },
  {
    q: 'Do you handle the domain and email?',
    a: "We register and configure your domain as part of the final package, and can set up a business email (hello@yourbusiness.ca) on request. Existing domain? We'll point it for you.",
  },
];

const trustStats = [
  { value: '2,847', label: 'Canadian businesses served' },
  { value: '87s', label: 'Average preview ready' },
  { value: '4.9★', label: 'Post-launch rating' },
  { value: '0', label: 'Long-term contracts' },
];

const trustBadges = [
  { icon: '🇨🇦', label: 'Data hosted in Montréal' },
  { icon: '🛡️', label: 'PIPEDA compliant' },
  { icon: '⚡', label: 'Average 87s preview' },
  { icon: '↩️', label: '30-day money back' },
];

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */
export default function Home() {
  useReveal();
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef<HTMLDivElement | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // NOTE: Form data is collected client-side only in this MVP. The /api/leads
    // POST endpoint exists but is not wired from this UI to avoid uncontrolled
    // public submissions before we add rate-limiting + reCAPTCHA.
    // See docs/SECURITY_REVIEW.md (LOW-2) for details.
    setSubmitted(true);
    setForm(initialForm);
    setTimeout(() => setSubmitted(false), 6000);
  };

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* ============================== HEADER ============================== */}
      <header className="absolute top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <a href="#top" className="flex items-center gap-2.5">
              <div className="relative w-9 h-9 rounded-lg bg-brand-gradient flex items-center justify-center text-white font-extrabold text-lg shadow-lg shadow-violet-500/30">
                S
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                SiteSprint
              </span>
            </a>
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white/80">
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
              <a href="/showcase" className="hover:text-white transition-colors">Examples</a>
              <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
              <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
            </nav>
            <a
              href="#request-preview"
              className="inline-flex items-center gap-1.5 bg-white text-[#1E1B4B] px-4 py-2 rounded-full text-sm font-semibold hover:bg-white/90 transition-colors shadow-lg shadow-black/20"
            >
              Get my preview
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
            </a>
          </div>
        </div>
      </header>

      {/* ============================== HERO ============================== */}
      <section
        id="top"
        className="relative isolate overflow-hidden text-white"
      >
        {/* Animated mesh gradient background */}
        <div className="absolute inset-0 bg-mesh-gradient" aria-hidden="true" />
        {/* Drifting blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div
            className="absolute -top-32 -left-20 w-[420px] h-[420px] rounded-full bg-violet-600/40 blur-3xl"
            style={{ animation: 'blobDrift 22s ease-in-out infinite' }}
          />
          <div
            className="absolute top-20 right-0 w-[380px] h-[380px] rounded-full bg-pink-500/30 blur-3xl"
            style={{ animation: 'blobDrift 26s ease-in-out infinite reverse' }}
          />
          <div
            className="absolute bottom-0 left-1/3 w-[460px] h-[460px] rounded-full bg-indigo-500/40 blur-3xl"
            style={{ animation: 'blobDrift 30s ease-in-out infinite' }}
          />
        </div>
        {/* Noise grain overlay */}
        <div className="absolute inset-0 noise-overlay pointer-events-none" aria-hidden="true" />
        {/* Vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(ellipse at center, transparent 40%, rgba(15, 11, 46, 0.5) 100%)',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 md:pt-40 md:pb-32">
          <div className="text-center stagger-children">
            {/* Eyebrow pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/15 bg-white/5 backdrop-blur-sm text-xs font-semibold tracking-wider uppercase text-white/90 mb-8">
              <span aria-hidden="true">🍁</span>
              <span>Built for Canadian small business</span>
            </div>

            {/* Headline */}
            <h1
              className="font-extrabold tracking-tight text-balance"
              style={{
                fontFamily: 'var(--font-jakarta), system-ui, sans-serif',
                fontSize: 'clamp(2.5rem, 6vw, 5rem)',
                lineHeight: 1.05,
                letterSpacing: '-0.03em',
              }}
            >
              See your new website
              <br className="hidden sm:block" />
              <span className="text-brand-gradient"> before you pay a dollar.</span>
            </h1>

            {/* Subhead */}
            <p className="mt-6 text-lg md:text-xl text-white/75 max-w-2xl mx-auto leading-relaxed">
              SiteSprint generates a complete, on-brand website preview for your business in 90 seconds.
              No credit card. No sales call. Just your future site, right now.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="#request-preview"
                className="inline-flex items-center gap-2 bg-white text-[#1E1B4B] font-semibold text-base px-7 py-3.5 rounded-full hover:bg-white/90 transition-all shadow-xl shadow-black/30 hover:-translate-y-0.5"
              >
                Generate my free preview
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
              </a>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 border border-white/20 bg-white/5 backdrop-blur-sm text-white font-medium text-base px-6 py-3.5 rounded-full hover:bg-white/10 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                Watch 30s demo
              </a>
              <a
                href="/showcase"
                className="inline-flex items-center gap-2 border border-white/20 bg-white/5 backdrop-blur-sm text-white font-medium text-base px-6 py-3.5 rounded-full hover:bg-white/10 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" /></svg>
                See real examples
              </a>
            </div>

            {/* Trust strip */}
            <dl className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-y-8 gap-x-4 max-w-3xl mx-auto">
              {trustStats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <dt className="text-3xl md:text-4xl font-extrabold text-white" style={{ fontFamily: 'var(--font-jakarta)' }}>
                    {stat.value}
                  </dt>
                  <dd className="mt-1 text-xs md:text-sm uppercase tracking-wider text-white/60">
                    {stat.label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Mock browser preview */}
          <div className="relative mt-20 max-w-5xl mx-auto reveal">
            <div
              className="browser-mock rounded-2xl overflow-hidden animate-float"
              style={{ animationDelay: '0.5s' }}
            >
              {/* Window chrome */}
              <div className="flex items-center gap-2 px-4 py-3 bg-black/20 border-b border-white/10">
                <span className="w-3 h-3 rounded-full bg-red-400/80" />
                <span className="w-3 h-3 rounded-full bg-amber-400/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-400/80" />
                <div className="flex-1 flex justify-center">
                  <div className="px-3 py-1 rounded-md bg-white/10 text-xs text-white/70 font-mono">
                    preview.sitesprint.ca/seaway-cleaning
                  </div>
                </div>
              </div>
              {/* Fake site content */}
              <div className="grid grid-cols-1 md:grid-cols-5">
                <div className="md:col-span-2 bg-gradient-to-br from-cyan-500 via-teal-500 to-emerald-600 p-8 text-white flex flex-col justify-between min-h-[280px]">
                  <div>
                    <div className="text-xs uppercase tracking-widest opacity-80 mb-3">Sparkling clean, every visit</div>
                    <div className="text-2xl font-extrabold leading-tight" style={{ fontFamily: 'var(--font-jakarta)' }}>
                      Seaway<br />Cleaning<br />Services
                    </div>
                  </div>
                  <button
                    type="button"
                    className="mt-6 self-start bg-white text-teal-700 text-sm font-semibold px-4 py-2 rounded-full opacity-90 cursor-not-allowed"
                    aria-disabled="true"
                  >
                    Book a clean →
                  </button>
                </div>
                <div className="md:col-span-3 bg-white text-slate-900 p-8 grid grid-cols-2 gap-4 content-between">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-slate-500">Services</div>
                    <div className="mt-2 space-y-1 text-sm">
                      <div className="h-2.5 rounded-full bg-slate-200 w-3/4" />
                      <div className="h-2.5 rounded-full bg-slate-200 w-2/3" />
                      <div className="h-2.5 rounded-full bg-slate-200 w-4/5" />
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-slate-500">Reviews</div>
                    <div className="mt-2 flex gap-0.5 text-amber-400 text-base">
                      {'★★★★★'.split('').map((s, i) => (<span key={i}>{s}</span>))}
                    </div>
                    <div className="mt-1 text-xs text-slate-600">4.9 / 5 · 187 reviews</div>
                  </div>
                  <div className="col-span-2 mt-2">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="aspect-square rounded-lg bg-gradient-to-br from-cyan-100 to-teal-100" />
                      <div className="aspect-square rounded-lg bg-gradient-to-br from-teal-100 to-emerald-100" />
                      <div className="aspect-square rounded-lg bg-gradient-to-br from-emerald-100 to-lime-100" />
                    </div>
                  </div>
                </div>
              </div>
              {/* Demo lock banner */}
              <div className="bg-amber-300/95 text-amber-950 text-center text-xs font-semibold py-2 px-4 border-t border-amber-400">
                ✦ Unofficial preview concept · Demo buttons locked · Claim this website to make it live
              </div>
            </div>
            {/* Glow under mock */}
            <div className="absolute -inset-x-12 -bottom-12 h-32 bg-violet-500/40 blur-3xl -z-10" aria-hidden="true" />
          </div>
        </div>
      </section>

      {/* ============================== TRUST BADGES ============================== */}
      <section className="relative -mt-12 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="reveal bg-white rounded-2xl shadow-xl shadow-slate-900/5 border border-slate-200/60 px-6 py-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {trustBadges.map((b) => (
              <div key={b.label} className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <span className="text-base" aria-hidden="true">{b.icon}</span>
                <span>{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================== FEATURES ============================== */}
      <section id="features" className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center reveal">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest text-violet-700 bg-violet-100">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-600" /> Why SiteSprint
            </div>
            <h2 className="mt-5 text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900" style={{ fontFamily: 'var(--font-jakarta)', letterSpacing: '-0.02em' }}>
              Built for the trades you actually run.
            </h2>
            <p className="mt-5 text-lg text-slate-600">
              Cleaning crews, salons, mechanics, contractors — every preview is tailored to the kind
              of business you actually run, not a generic SaaS template.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="reveal lift bg-white rounded-2xl p-7 border border-slate-200/70 shadow-sm"
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white flex items-center justify-center mb-5 shadow-md shadow-violet-500/30">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {f.icon}
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900" style={{ fontFamily: 'var(--font-jakarta)' }}>
                  {f.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================== HOW IT WORKS ============================== */}
      <section id="how-it-works" className="py-24 md:py-32 bg-bg-subtle bg-dot-grid relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center reveal">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest text-pink-700 bg-pink-100">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-500" /> How it works
            </div>
            <h2 className="mt-5 text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900" style={{ fontFamily: 'var(--font-jakarta)', letterSpacing: '-0.02em' }}>
              From "I should get a website" to live in a coffee break.
            </h2>
            <p className="mt-5 text-lg text-slate-600">
              Three steps. No contract. No "discovery call". No "let me check with my manager".
            </p>
          </div>

          <div className="mt-20 relative">
            {/* Connector line (desktop only) */}
            <div className="hidden md:block absolute top-9 left-[16%] right-[16%] connector" aria-hidden="true" />

            <ol className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 relative">
              {steps.map((s) => (
                <li key={s.n} className="reveal text-center relative">
                  <div className="mx-auto w-[72px] h-[72px] rounded-full bg-white border-2 border-violet-200 flex items-center justify-center text-2xl font-extrabold text-violet-700 shadow-lg shadow-violet-500/10 relative z-10" style={{ fontFamily: 'var(--font-jakarta)' }}>
                    {s.n}
                  </div>
                  <h3 className="mt-6 text-xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-jakarta)' }}>
                    {s.title}
                  </h3>
                  <p className="mt-3 text-slate-600 max-w-xs mx-auto">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ============================== TESTIMONIALS ============================== */}
      <section className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center reveal">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest text-indigo-700 bg-indigo-100">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> Real customers
            </div>
            <h2 className="mt-5 text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900" style={{ fontFamily: 'var(--font-jakarta)', letterSpacing: '-0.02em' }}>
              The trades are talking.
            </h2>
            <p className="mt-5 text-lg text-slate-600">
              Three owners. Three provinces. One shared "I should've done this years ago."
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <figure
                key={t.name}
                className="reveal lift bg-white rounded-2xl p-7 border border-slate-200/70 shadow-sm flex flex-col"
              >
                {/* Quote mark */}
                <svg className="w-8 h-8 text-violet-300 mb-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M7.17 17q-1.66 0-2.91-1.16-1.25-1.17-1.25-2.84 0-1.67 1.25-2.84Q5.51 9 7.17 9q.41 0 .83.09.42.09.83.25-.09-1.99-.92-3.46-.83-1.46-2.16-2.46L7.42 2q1.83 1.16 2.91 3.16Q11.42 7.17 11.42 10q0 3.16-1.83 5.08Q7.75 17 7.17 17Zm10 0q-1.66 0-2.91-1.16-1.25-1.17-1.25-2.84 0-1.67 1.25-2.84Q15.51 9 17.17 9q.41 0 .83.09.42.09.83.25-.09-1.99-.92-3.46-.83-1.46-2.16-2.46L17.42 2q1.83 1.16 2.91 3.16 1.09 2.01 1.09 4.84 0 3.16-1.83 5.08Q17.75 17 17.17 17Z" />
                </svg>
                <blockquote className="text-slate-700 leading-relaxed flex-1">
                  {t.quote}
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <span className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.accent} text-white font-bold flex items-center justify-center text-sm shadow-md`}>
                    {t.initials}
                  </span>
                  <div>
                    <div className="font-semibold text-slate-900 text-sm">{t.name}</div>
                    <div className="text-xs text-slate-500">
                      {t.role} · {t.location}
                    </div>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ============================== PRICING ============================== */}
      <section id="pricing" className="py-24 md:py-32 bg-bg-subtle bg-dot-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center reveal">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest text-emerald-700 bg-emerald-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Pricing
            </div>
            <h2 className="mt-5 text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900" style={{ fontFamily: 'var(--font-jakarta)', letterSpacing: '-0.02em' }}>
              Honest pricing. Pick what fits.
            </h2>
            <p className="mt-5 text-lg text-slate-600">
              Free to look. Pay only when you decide to keep it. Cancel anytime on managed.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">
            {pricingTiers.map((tier, i) => (
              <div
                key={tier.name}
                className={`reveal relative rounded-2xl p-8 flex flex-col ${
                  tier.featured
                    ? 'pricing-featured md:-translate-y-3 shadow-2xl shadow-violet-500/20'
                    : 'bg-white border border-slate-200/70 shadow-sm'
                }`}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                {tier.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-gradient text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-lg shadow-violet-500/30">
                    Most popular
                  </div>
                )}
                <h3 className="text-lg font-bold text-slate-900" style={{ fontFamily: 'var(--font-jakarta)' }}>
                  {tier.name}
                </h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-900" style={{ fontFamily: 'var(--font-jakarta)' }}>
                    {tier.price}
                  </span>
                  <span className="text-sm text-slate-500">{tier.cadence}</span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{tier.description}</p>
                <ul className="mt-6 space-y-3 flex-1">
                  {tier.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2 text-sm text-slate-700">
                      <svg className="w-5 h-5 flex-none text-emerald-500 mt-0.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href={tier.ctaHref}
                  className={`mt-8 inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-full font-semibold text-sm transition-all ${
                    tier.featured
                      ? 'bg-brand-gradient text-white shadow-lg shadow-violet-500/40 hover:shadow-xl hover:-translate-y-0.5'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  {tier.cta}
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                </a>
              </div>
            ))}
          </div>

          <p className="mt-8 text-center text-sm text-slate-500">
            All prices in CAD. Taxes added at checkout. No setup fees, ever.
          </p>
        </div>
      </section>

      {/* ============================== FAQ ============================== */}
      <section id="faq" className="py-24 md:py-32">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center reveal">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest text-violet-700 bg-violet-100">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500" /> FAQ
            </div>
            <h2 className="mt-5 text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900" style={{ fontFamily: 'var(--font-jakarta)', letterSpacing: '-0.02em' }}>
              Questions, answered straight.
            </h2>
          </div>

          <div className="mt-12 divide-y divide-slate-200 border-y border-slate-200 reveal">
            {faqs.map((item) => (
              <details key={item.q} className="group py-2">
                <summary className="flex items-center justify-between gap-6 py-5 cursor-pointer text-left">
                  <span className="text-base md:text-lg font-semibold text-slate-900">{item.q}</span>
                  <svg
                    className="faq-chevron w-5 h-5 flex-none text-slate-400 group-hover:text-violet-600"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </summary>
                <div className="pb-5 pr-12 text-slate-600 leading-relaxed">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ============================== REQUEST PREVIEW FORM ============================== */}
      <section
        id="request-preview"
        ref={formRef}
        className="relative py-24 md:py-32 bg-brand-gradient overflow-hidden text-white"
      >
        <div className="absolute inset-0 noise-overlay pointer-events-none opacity-50" aria-hidden="true" />
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(circle at 80% 20%, rgba(236, 72, 153, 0.4), transparent 50%), radial-gradient(circle at 20% 80%, rgba(79, 70, 229, 0.4), transparent 50%)',
          }}
        />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight" style={{ fontFamily: 'var(--font-jakarta)', letterSpacing: '-0.02em' }}>
            Ready to see your future site?
          </h2>
          <p className="mt-4 text-lg text-white/80 max-w-2xl mx-auto">
            Free preview in 90 seconds. No credit card. We'll email you the link.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-10 bg-white text-slate-900 rounded-2xl shadow-2xl shadow-black/30 p-7 md:p-9 text-left"
          >
            {submitted && (
              <div className="mb-6 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 text-sm font-medium" role="status">
                ✓ Thanks — we'll be in touch within a few minutes.
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="businessName" className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Business name
                </label>
                <input
                  type="text"
                  id="businessName"
                  name="businessName"
                  value={form.businessName}
                  onChange={handleChange}
                  required
                  className="brand-focus w-full px-4 py-3 border border-slate-300 rounded-xl bg-white"
                  placeholder="Seaway Cleaning Services"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="brand-focus w-full px-4 py-3 border border-slate-300 rounded-xl bg-white"
                  placeholder="you@business.ca"
                />
              </div>
            </div>
            <div className="mt-5">
              <label htmlFor="website" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Current website <span className="font-normal text-slate-400">(optional)</span>
              </label>
              <input
                type="url"
                id="website"
                name="website"
                value={form.website}
                onChange={handleChange}
                className="brand-focus w-full px-4 py-3 border border-slate-300 rounded-xl bg-white"
                placeholder="https://yourbusiness.ca"
              />
            </div>
            <div className="mt-5">
              <label htmlFor="message" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Tell us about your business
              </label>
              <textarea
                id="message"
                name="message"
                value={form.message}
                onChange={handleChange}
                rows={4}
                className="brand-focus w-full px-4 py-3 border border-slate-300 rounded-xl bg-white resize-none"
                placeholder="What services do you offer? What city? What makes you different?"
              />
            </div>
            <button
              type="submit"
              className="mt-6 w-full bg-brand-gradient text-white font-semibold py-3.5 px-6 rounded-xl hover:opacity-95 transition-all shadow-lg shadow-violet-500/30 hover:shadow-xl hover:-translate-y-0.5"
            >
              Generate my free preview →
            </button>
            <p className="mt-3 text-center text-xs text-slate-500">
              No credit card. We never share your details. PIPEDA-compliant.
            </p>
          </form>
        </div>
      </section>

      {/* ============================== FOOTER ============================== */}
      <footer className="bg-slate-950 text-slate-300 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-brand-gradient flex items-center justify-center text-white font-extrabold text-lg">
                  S
                </div>
                <span className="text-xl font-extrabold tracking-tight text-white">SiteSprint</span>
              </div>
              <p className="mt-4 text-sm text-slate-400 max-w-md leading-relaxed">
                AI-generated website previews for Canadian small businesses. Hosted in Montréal,
                built for the trades, friendly to your wallet.
              </p>
              <p className="mt-4 text-xs text-slate-500">© {new Date().getFullYear()} SiteSprint. All rights reserved.</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-widest">Product</h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How it works</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="/showcase" className="hover:text-white transition-colors">Examples</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-widest">Company</h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#request-preview" className="hover:text-white transition-colors">Request a preview</a></li>
                <li><a href="/admin" className="hover:text-white transition-colors">Admin</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}