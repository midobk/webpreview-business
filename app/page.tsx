'use client';

import { useEffect, useRef, useState } from 'react';
import CornerStamp from '@/components/motion/CornerStamp';
import HeaderScroll from '@/components/motion/HeaderScroll';
import MagneticButton from '@/components/motion/MagneticButton';
import MouseBlobs from '@/components/motion/MouseBlobs';
import TiltMockBrowser from '@/components/motion/TiltMockBrowser';
import CountUp from '@/components/motion/CountUp';
import Checkmark from '@/components/motion/Checkmark';
import SuccessCheck from '@/components/motion/SuccessCheck';
import ScrollParallax from '@/components/motion/ScrollParallax';

/* Hero blobs drift toward the cursor (MouseBlobs). Warm-print palette —
   spruce + clay — replacing the old cool violet/pink blobs. */
const heroBlobs = [
  { className: 'absolute -top-32 -left-20 w-[420px] h-[420px] rounded-full bg-paint/25 blur-3xl', range: 22 },
  { className: 'absolute top-20 right-0 w-[380px] h-[380px] rounded-full bg-signal/25 blur-3xl', range: 28 },
  { className: 'absolute bottom-0 left-1/3 w-[460px] h-[460px] rounded-full bg-paint/30 blur-3xl', range: 18 },
];

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
    body: 'We draft your copy from your business details and public info — so the preview reads like you, not a template.',
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
    mark: '✉',
    title: 'Tell us about your business',
    body: '60-second form: name, what you do, where you operate. The more you share, the better the preview.',
  },
  {
    n: '2',
    mark: '✦',
    title: 'We build your live preview',
    body: 'We read your public listings, reviews, and description to draft the copy and design a personalized one-pager.',
  },
  {
    n: '3',
    mark: '✓',
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
      'Complete website preview',
      'Mobile + desktop design',
      'Personalized to your business',
      'No credit card',
      'Yours to keep or walk away from',
    ],
    cta: 'Get my preview',
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
    cta: 'Start the managed plan',
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
    accent: 'from-[#1F4D3A] to-[#2E6A53]',
  },
  {
    quote:
      "I'm a solo hairstylist in Kits. I don't have time to learn Squarespace for the third time. SiteSprint gave me something I was actually proud to text my clients — and the price was less than a single colour service.",
    name: 'Jenna T.',
    role: 'Jenna T. Hair Studio',
    location: 'Vancouver, BC',
    initials: 'JT',
    accent: 'from-[#E8743B] to-[#B5532A]',
  },
  {
    quote:
      "My shop's old site still had my ex-wife's cell number on it. SiteSprint built a new one in my coffee break, and I got three bookings the first week. The fact that it's hosted in Canada mattered to me.",
    name: 'Dave R.',
    role: 'North Hill Auto',
    location: 'Calgary, AB',
    initials: 'DR',
    accent: 'from-[#4A5468] to-[#2E3A4A]',
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
  { value: '90s', label: 'Average preview ready' },
  { value: 'PIPEDA', label: 'Aligned data handling' },
  { value: '0', label: 'Long-term contracts' },
  { value: '100%', label: 'Owned by you on final' },
];

const trustBadges = [
  {
    label: 'Data hosted in Montréal',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]" aria-hidden="true">
        <path d="M12 2l1.2 3.4 2.6-1.6-1 3 2.8.8-2.4 1.6 2.4 2.6-3.4.4 1.2 3.2-2.8-1.4L12 22l-.6-7.6-2.8 1.4 1.2-3.2-3.4-.4 2.4-2.6-2.4-1.6 2.8-.8-1-3 2.6 1.6z" />
      </svg>
    ),
  },
  {
    label: 'PIPEDA compliant',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]" aria-hidden="true">
        <path d="M12 3l7 3v5c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6l7-3z" />
        <path d="M9 11.5l2 2 4-4" />
      </svg>
    ),
  },
  {
    label: 'Average 87s preview',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]" aria-hidden="true">
        <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" />
      </svg>
    ),
  },
  {
    label: '30-day money back',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]" aria-hidden="true">
        <path d="M3 9a9 9 0 1 1-2.2 6" />
        <path d="M3 4v5h5" />
      </svg>
    ),
  },
];

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */
export default function Home() {
  useReveal();
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [urlTouched, setUrlTouched] = useState(false);
  const formRef = useRef<HTMLDivElement | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  const urlValid =
    form.website === '' || /^https?:\/\/.+\..+/.test(form.website);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailValid || !urlValid || !form.businessName.trim()) {
      setSubmitError('Please fix the highlighted fields and try again.');
      return;
    }
    setIsSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: form.businessName.trim(),
          email: form.email.trim(),
          website: form.website.trim(),
          message: form.message.trim(),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setSubmitError(data.error || 'Something went wrong. Please try again.');
        return;
      }
      setSubmitted(true);
      setForm(initialForm);
      setEmailTouched(false);
      setUrlTouched(false);
      setTimeout(() => setSubmitted(false), 8000);
    } catch {
      setSubmitError('Network error — check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-paper">
      {/* ============================== HEADER ============================== */}
      <HeaderScroll className="site-header fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <a href="#top" className="flex items-center gap-2.5">
              <div className="relative w-9 h-9 rounded-lg bg-warm-gradient flex items-center justify-center text-white font-extrabold text-lg shadow-lg shadow-paint/30">
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
            <MagneticButton
              href="#request-preview"
              className="items-center gap-1.5 bg-white text-ink px-4 py-2 rounded-full text-sm font-semibold hover:bg-white/90 transition-colors shadow-lg shadow-black/20"
            >
              Get my preview
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
            </MagneticButton>
          </div>
        </div>
      </HeaderScroll>

      {/* ============================== HERO ============================== */}
      <section
        id="top"
        className="relative isolate overflow-hidden text-white"
      >
        {/* Deep-ink base — warmer than indigo, signals "serious Canadian shop" */}
        <div className="absolute inset-0 bg-ink" aria-hidden="true" />
        {/* Print-shop grid texture — denser than the cool bg-dot-grid */}
        <div className="absolute inset-0 bg-print-grid opacity-40" aria-hidden="true" />
        {/* Drifting blobs — follow the cursor with a gentle spring (MouseBlobs) */}
        <MouseBlobs blobs={heroBlobs} />
        {/* Noise grain overlay */}
        <div className="absolute inset-0 noise-overlay pointer-events-none" aria-hidden="true" />
        {/* Vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(ellipse at center, transparent 50%, rgba(11, 15, 30, 0.6) 100%)',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 md:pt-40 md:pb-32">
          <div className="text-center stagger-children">
            {/* Eyebrow pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-paper/20 bg-paper/5 backdrop-blur-sm text-xs font-semibold tracking-wider uppercase text-paper/90 mb-8">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-signal" aria-hidden="true">
                <path d="M12 2l1.2 3.4 2.6-1.6-1 3 2.8.8-2.4 1.6 2.4 2.6-3.4.4 1.2 3.2-2.8-1.4L12 22l-.6-7.6-2.8 1.4 1.2-3.2-3.4-.4 2.4-2.6-2.4-1.6 2.8-.8-1-3 2.6 1.6z" />
              </svg>
              <span>Built for Canadian small business</span>
            </div>

            {/* Headline — Fraunces display serif, the second signature */}
            <h1
              className="tracking-tight text-balance"
              style={{
                fontFamily: 'var(--font-fraunces), Georgia, serif',
                fontSize: 'clamp(2.6rem, 6.4vw, 5.2rem)',
                lineHeight: 1.04,
                letterSpacing: '-0.025em',
                fontWeight: 500,
                fontVariationSettings: '"opsz" 96',
              }}
            >
              See your new website
              <br />
              <em
                className="not-italic"
                style={{
                  fontStyle: 'italic',
                  fontWeight: 500,
                  backgroundImage:
                    'linear-gradient(135deg, #E8743B 0%, #C84B7A 58%, #7A2E52 100%)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                  fontVariationSettings: '"opsz" 144',
                }}
              >
                before you pay a dollar.
              </em>
            </h1>

            {/* Subhead */}
            <p className="mt-7 text-lg md:text-xl text-paper/75 max-w-2xl mx-auto leading-relaxed">
              SiteSprint generates a complete, on-brand website preview for your business in 90 seconds.
              No credit card. No sales call. Just your future site, right now.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
              <MagneticButton
                href="#request-preview"
                className="items-center gap-2 bg-action text-white font-semibold text-base px-7 py-3.5 rounded-full hover:bg-action-deep transition-colors shadow-xl shadow-black/40"
              >
                Generate my free preview
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
              </MagneticButton>
              <a
                href="/showcase"
                className="inline-flex items-center gap-2 border border-paper/25 bg-paper/5 backdrop-blur-sm text-paper font-medium text-base px-6 py-3.5 rounded-full hover:bg-paper/10 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" /></svg>
                See real examples
              </a>
            </div>
          </div>

          {/* Mock browser preview — cursor-tracked 3D tilt + float (TiltMockBrowser) */}
          <TiltMockBrowser className="relative mt-20 max-w-5xl mx-auto">
            <div className="browser-mock rounded-2xl overflow-hidden">
              {/* Window chrome */}
              <div className="flex items-center gap-2 px-4 py-3 bg-black/30 border-b border-white/10">
                <span className="w-3 h-3 rounded-full bg-red-400/80" />
                <span className="w-3 h-3 rounded-full bg-amber-400/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-400/80" />
                <div className="flex-1 flex justify-center">
                  <div className="px-3 py-1 rounded-md bg-white/10 text-xs text-white/70 font-mono">
                    preview.sitesprint.ca/seaway-cleaning
                  </div>
                </div>
              </div>
              {/* Fake site content — same cleaning business, palette matches paper/ink */}
              <div className="grid grid-cols-1 md:grid-cols-5">
                <div
                  className="md:col-span-2 p-8 text-white flex flex-col justify-between min-h-[280px]"
                  style={{
                    background:
                      'linear-gradient(160deg, #1C5440 0%, #163E2D 100%)',
                  }}
                >
                  <div>
                    <div className="text-xs uppercase tracking-widest opacity-80 mb-3" style={{ fontFamily: 'var(--font-jakarta)' }}>
                      Sparkling clean, every visit
                    </div>
                    <div
                      className="text-2xl leading-tight"
                      style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontWeight: 500, letterSpacing: '-0.01em' }}
                    >
                      Seaway
                      <br />
                      Cleaning
                      <br />
                      Services
                    </div>
                  </div>
                  <button
                    type="button"
                    className="mt-6 self-start bg-paper text-paint text-sm font-semibold px-4 py-2 rounded-full opacity-95 cursor-not-allowed"
                    aria-disabled="true"
                  >
                    Book a clean →
                  </button>
                </div>
                <div className="md:col-span-3 bg-paper text-ink p-8 grid grid-cols-2 gap-4 content-between">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-steel">Services</div>
                    <div className="mt-2 space-y-1 text-sm">
                      <div className="h-2.5 rounded-full bg-mist w-3/4" />
                      <div className="h-2.5 rounded-full bg-mist w-2/3" />
                      <div className="h-2.5 rounded-full bg-mist w-4/5" />
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-steel">Reviews</div>
                    <div className="mt-2 flex gap-0.5 text-signal text-base">
                      {'★★★★★'.split('').map((s, i) => (<span key={i}>{s}</span>))}
                    </div>
                    <div className="mt-1 text-xs text-steel">4.9 / 5 · 187 reviews</div>
                  </div>
                  <div className="col-span-2 mt-2">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="aspect-square rounded-lg bg-gradient-to-br from-[#E6F1ED] to-[#ECECE6]" />
                      <div className="aspect-square rounded-lg bg-gradient-to-br from-[#ECECE6] to-[#E6F1ED]" />
                      <div className="aspect-square rounded-lg bg-gradient-to-br from-[#FBE4D2] to-[#E6F1ED]" />
                    </div>
                  </div>
                </div>
              </div>
              {/* Demo lock banner — kept signal-clay to draw the eye */}
              <div className="bg-signal/95 text-white text-center text-xs font-semibold py-2 px-4 border-t border-signal">
                ✦ Unofficial preview concept · Demo buttons locked · Claim this website to make it live
              </div>
            </div>
            {/* Glow under mock — spruce, not violet */}
            <div className="absolute -inset-x-12 -bottom-12 h-32 bg-paint/40 blur-3xl -z-10" aria-hidden="true" />
          </TiltMockBrowser>

          {/* Trust strip — moved BELOW the mock. The mock is the proof; stats validate. */}
          <dl className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-y-8 gap-x-4 max-w-3xl mx-auto reveal">
            {trustStats.map((stat, i) => (
              <div key={stat.label} className="text-center relative">
                {i > 0 && (
                  <span className="hidden sm:block absolute left-0 top-1/2 -translate-y-1/2 h-12 w-px bg-paper/15" aria-hidden="true" />
                )}
                <dt
                  className="text-3xl md:text-4xl text-white"
                  style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontWeight: 500, letterSpacing: '-0.02em', fontVariationSettings: '"opsz" 96' }}
                >
                  <CountUp to={stat.value} duration={1.4} />
                </dt>
                <dd className="mt-1 text-xs md:text-sm uppercase tracking-wider text-paper/55">
                  {stat.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ============================== TRUST BADGES ============================== */}
      <section className="relative -mt-12 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="reveal bg-paper rounded-2xl shadow-xl shadow-ink/10 border border-[color-mix(in_oklab,var(--paint)_10%,transparent)] px-6 py-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {trustBadges.map((b) => (
              <div key={b.label} className="flex items-center gap-2 text-sm font-medium text-steel">
                <span className="text-paint" aria-hidden="true">{b.icon}</span>
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest text-paint bg-[#E6F1ED]">
              <span className="w-1.5 h-1.5 rounded-full bg-paint" /> Why SiteSprint
            </div>
            <h2
              className="mt-5 text-4xl md:text-5xl text-ink tracking-tight"
              style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontWeight: 500, letterSpacing: '-0.02em', fontVariationSettings: '"opsz" 96' }}
            >
              Built for the trades you actually run.
            </h2>
            <p className="mt-5 text-lg text-steel">
              Cleaning crews, salons, mechanics, contractors — every preview is tailored to the kind
              of business you actually run, not a generic SaaS template.
            </p>
          </div>

          {/* Hero features — 3-up with vertical hairlines between columns */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 md:divide-x divide-[color-mix(in_oklab,var(--paint)_10%,transparent)]">
            {features.slice(0, 3).map((f) => (
              <div key={f.title} className="reveal px-6 md:px-8 first:pl-0 last:pr-0 py-4 md:py-2">
                <div
                  className="w-14 h-14 rounded-2xl bg-paint text-paper flex items-center justify-center mb-6 shadow-md shadow-paint/30"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {f.icon}
                  </svg>
                </div>
                <h3
                  className="text-2xl text-ink"
                  style={{ fontFamily: 'var(--font-fraunces), Georgia, serif', fontWeight: 500, letterSpacing: '-0.01em', fontVariationSettings: '"opsz" 36' }}
                >
                  {f.title}
                </h3>
                <p className="mt-3 text-base text-steel leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>

          {/* Secondary features — single horizontal band, quieter treatment */}
          <div className="mt-12 reveal panel-quiet rounded-2xl px-6 py-6 md:px-8 md:py-7">
            <ul className="grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-10">
              {features.slice(3).map((f) => (
                <li key={f.title} className="flex items-start gap-3">
                  <div
                    className="w-9 h-9 rounded-lg bg-paper text-paint flex-none flex items-center justify-center border border-[color-mix(in_oklab,var(--paint)_15%,transparent)]"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {f.icon}
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-ink">{f.title}</h3>
                    <p className="mt-1 text-sm text-steel leading-relaxed">{f.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ============================== HOW IT WORKS ============================== */}
      <section id="how-it-works" className="py-24 md:py-32 bg-mist bg-print-grid relative border-y border-[color-mix(in_oklab,var(--paint)_9%,transparent)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center reveal">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest text-paint bg-[#E6F1ED]">
              <span className="w-1.5 h-1.5 rounded-full bg-paint" /> How it works
            </div>
            <h2
              className="mt-5 text-4xl md:text-5xl font-medium tracking-tight text-ink"
              style={{ fontFamily: 'var(--font-fraunces)', letterSpacing: '-0.02em', fontVariationSettings: '"opsz" 96' }}
            >
              From &ldquo;I should get a website&rdquo; to live in a coffee break.
            </h2>
            <p className="mt-5 text-lg text-steel">
              Three steps. No contract. No &ldquo;discovery call&rdquo;. No &ldquo;let me check with my manager&rdquo;.
            </p>
          </div>

          <div className="mt-20 relative">
            {/* Connector line (desktop only) — spruce → clay */}
            <div className="hidden md:block absolute top-9 left-[16%] right-[16%] connector-spruce" aria-hidden="true" />

            <ol className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 relative">
              {steps.map((s) => (
                <li key={s.n} className="reveal text-center relative">
                  <div
                    className="mx-auto w-[72px] h-[72px] rounded-full bg-paint text-paper flex items-center justify-center text-3xl shadow-lg shadow-paint/25 ring-4 ring-paper relative z-10"
                    style={{ fontFamily: 'var(--font-fraunces)', fontVariationSettings: '"opsz" 144', letterSpacing: '-0.02em' }}
                    aria-hidden="true"
                  >
                    0{s.n}
                  </div>
                  <h3
                    className="mt-6 text-xl font-medium text-ink"
                    style={{ fontFamily: 'var(--font-fraunces)', fontVariationSettings: '"opsz" 36' }}
                  >
                    {s.title}
                  </h3>
                  <p className="mt-3 text-steel max-w-xs mx-auto">{s.body}</p>
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest text-paint bg-[#E6F1ED]">
              <span className="w-1.5 h-1.5 rounded-full bg-paint" /> Real customers
            </div>
            <h2
              className="mt-5 text-4xl md:text-5xl font-medium tracking-tight text-ink"
              style={{ fontFamily: 'var(--font-fraunces)', letterSpacing: '-0.02em', fontVariationSettings: '"opsz" 96' }}
            >
              The trades are talking.
            </h2>
            <p className="mt-5 text-lg text-steel">
              Three owners. Three provinces. One shared &ldquo;I should&rsquo;ve done this years ago.&rdquo;
            </p>
          </div>

          <ScrollParallax amount={20} className="mt-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <figure
                key={t.name}
                className="reveal lift bg-paper rounded-2xl p-7 border border-paint/10 shadow-sm flex flex-col"
              >
                {/* Quote mark — spruce at 30% */}
                <svg className="w-8 h-8 text-paint/30 mb-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M7.17 17q-1.66 0-2.91-1.16-1.25-1.17-1.25-2.84 0-1.67 1.25-2.84Q5.51 9 7.17 9q.41 0 .83.09.42.09.83.25-.09-1.99-.92-3.46-.83-1.46-2.16-2.46L7.42 2q1.83 1.16 2.91 3.16Q11.42 7.17 11.42 10q0 3.16-1.83 5.08Q7.75 17 7.17 17Zm10 0q-1.66 0-2.91-1.16-1.25-1.17-1.25-2.84 0-1.67 1.25-2.84Q15.51 9 17.17 9q.41 0 .83.09.42.09.83.25-.09-1.99-.92-3.46-.83-1.46-2.16-2.46L17.42 2q1.83 1.16 2.91 3.16 1.09 2.01 1.09 4.84 0 3.16-1.83 5.08Q17.75 17 17.17 17Z" />
                </svg>
                <blockquote className="text-steel leading-relaxed flex-1">
                  {/* Em-dash in Fraunces italic — print-press feel */}
                  <span
                    aria-hidden="true"
                    className="text-paint mr-1"
                    style={{ fontFamily: 'var(--font-fraunces)', fontStyle: 'italic', fontVariationSettings: '"opsz" 36' }}
                  >
                    —
                  </span>
                  {t.quote}
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <span className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.accent} text-white font-bold flex items-center justify-center text-sm shadow-md`}>
                    {t.initials}
                  </span>
                  <div>
                    <div className="font-semibold text-ink text-sm">{t.name}</div>
                    <div className="text-xs text-steel/70">
                      {t.role} · {t.location}
                    </div>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
          </ScrollParallax>
        </div>
      </section>

      {/* ============================== PRICING ============================== */}
      <section id="pricing" className="py-24 md:py-32 bg-mist bg-print-grid border-y border-[color-mix(in_oklab,var(--paint)_9%,transparent)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center reveal">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest text-paint bg-[#E6F1ED]">
              <span className="w-1.5 h-1.5 rounded-full bg-paint" /> Pricing
            </div>
            <h2
              className="mt-5 text-4xl md:text-5xl font-medium tracking-tight text-ink"
              style={{ fontFamily: 'var(--font-fraunces)', letterSpacing: '-0.02em', fontVariationSettings: '"opsz" 96' }}
            >
              Honest pricing. Pick what fits.
            </h2>
            <p className="mt-5 text-lg text-steel">
              Free to look. Pay only when you decide to keep it. Cancel anytime on managed.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-7xl mx-auto items-stretch">
            {pricingTiers.map((tier, i) => (
              <div
                key={tier.name}
                className={`reveal relative rounded-2xl p-6 lg:p-7 flex flex-col ${
                  tier.featured
                    ? 'pricing-featured lg:-translate-y-3 bg-ink text-white shadow-2xl shadow-ink/30'
                    : 'bg-paper border border-paint/10 shadow-sm'
                }`}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                {tier.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-signal text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-lg shadow-signal/30">
                    Most popular
                  </div>
                )}
                <h3
                  className={`text-lg font-medium ${tier.featured ? 'text-paper' : 'text-ink'}`}
                  style={{ fontFamily: 'var(--font-fraunces)', fontVariationSettings: '"opsz" 36' }}
                >
                  {tier.name}
                </h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span
                    className={`text-4xl font-medium ${tier.featured ? 'text-paper' : 'text-ink'}`}
                    style={{ fontFamily: 'var(--font-fraunces)', fontVariationSettings: '"opsz" 96' }}
                  >
                    {tier.price}
                  </span>
                  <span className={`text-sm ${tier.featured ? 'text-white/60' : 'text-steel/70'}`}>
                    {tier.cadence}
                  </span>
                </div>
                <p className={`mt-2 text-sm ${tier.featured ? 'text-white/75' : 'text-steel'}`}>
                  {tier.description}
                </p>
                <ul className="mt-6 space-y-3 flex-1">
                  {tier.features.map((feat, idx) => (
                    <li
                      key={feat}
                      className={`flex items-start gap-2 text-sm ${tier.featured ? 'text-white/85' : 'text-ink'}`}
                    >
                      <Checkmark
                        drawOnView
                        delay={idx * 0.08 + 0.1}
                        className={`w-5 h-5 flex-none mt-0.5 ${tier.featured ? 'text-signal' : 'text-paint'}`}
                      />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
                {tier.featured ? (
                  <MagneticButton
                    href={tier.ctaHref}
                    className="mt-8 items-center justify-center gap-1.5 px-5 py-3 rounded-full font-semibold text-sm bg-action text-white shadow-lg shadow-action/40 hover:bg-action-deep transition-colors"
                  >
                    {tier.cta}
                    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                  </MagneticButton>
                ) : (
                  <a
                    href={tier.ctaHref}
                    className="mt-8 inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-full font-semibold text-sm transition-all bg-ink text-paper hover:bg-ink/90"
                  >
                    {tier.cta}
                    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                  </a>
                )}
              </div>
            ))}
          </div>

          <p className="mt-8 text-center text-sm text-steel/70">
            All prices in CAD. Taxes added at checkout. No setup fees, ever.
          </p>
        </div>
      </section>

      {/* ============================== FAQ ============================== */}
      <section id="faq" className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16">
            {/* Left: heading + accordion */}
            <div className="md:col-span-7 reveal">
              <div className="text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest text-paint bg-[#E6F1ED]">
                  <span className="w-1.5 h-1.5 rounded-full bg-paint" /> FAQ
                </div>
                <h2
                  className="mt-5 text-4xl md:text-5xl font-medium tracking-tight text-ink"
                  style={{ fontFamily: 'var(--font-fraunces)', letterSpacing: '-0.02em', fontVariationSettings: '"opsz" 96' }}
                >
                  Questions, answered straight.
                </h2>
              </div>

              <div className="mt-10 divide-y divide-paint/10 border-y border-paint/10">
                {faqs.map((item) => (
                  <details key={item.q} className="group py-2">
                    <summary className="flex items-center justify-between gap-6 py-5 cursor-pointer text-left">
                      <span className="text-base md:text-lg font-semibold text-ink">{item.q}</span>
                      <svg
                        className="faq-chevron w-5 h-5 flex-none text-steel group-hover:text-paint"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </summary>
                    <div className="pb-5 pr-12 text-steel leading-relaxed">
                      {item.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>

            {/* Right: still have questions? */}
            <aside className="md:col-span-5 reveal">
              <div className="bg-paper border border-paint/10 rounded-2xl p-8 md:p-10 h-full flex flex-col">
                <div className="text-xs font-semibold uppercase tracking-widest text-paint">
                  Still curious?
                </div>
                <h3
                  className="mt-3 text-2xl md:text-3xl font-medium text-ink leading-tight"
                  style={{ fontFamily: 'var(--font-fraunces)', fontVariationSettings: '"opsz" 36' }}
                >
                  Still have questions?
                </h3>
                <p className="mt-4 text-steel leading-relaxed">
                  Real person, real answer — usually within a couple of hours during business days. We&rsquo;re a small team that picks up its own email.
                </p>
                <a
                  href="mailto:hello@sitesprint.ca"
                  className="mt-6 inline-flex items-center gap-2 self-start text-paint font-semibold hover:text-signal transition-colors"
                >
                  <span
                    className="text-xl"
                    style={{ fontFamily: 'var(--font-fraunces)', fontStyle: 'italic', fontVariationSettings: '"opsz" 36' }}
                    aria-hidden="true"
                  >
                    →
                  </span>
                  hello@sitesprint.ca
                </a>
                <div className="mt-8 pt-6 border-t border-paint/10 text-sm text-steel/80">
                  <p>
                    <span className="font-semibold text-ink">Phone:</span> +1 (437) 555-0142
                  </p>
                  <p className="mt-1">
                    <span className="font-semibold text-ink">Hours:</span> Mon&ndash;Fri, 9am&ndash;6pm ET
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ============================== REQUEST PREVIEW FORM ============================== */}
      <section
        id="request-preview"
        ref={formRef}
        className="relative py-24 md:py-32 overflow-hidden text-white"
      >
        {/* Warm-print canvas — deep ink base + spruce/clay radial haze.
           Replaces the indigo→violet→pink SaaS gradient with the
           SiteSprint signature palette. */}
        <div className="absolute inset-0 bg-ink" aria-hidden="true" />
        <div
          className="absolute inset-0 pointer-events-none opacity-90"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(circle at 82% 18%, rgba(232, 116, 59, 0.45), transparent 55%), radial-gradient(circle at 18% 82%, rgba(31, 77, 58, 0.65), transparent 55%)',
          }}
        />
        <div className="absolute inset-0 noise-overlay pointer-events-none opacity-50" aria-hidden="true" />
        {/* Print-shop stamp in upper-right */}
        <div className="absolute top-10 right-6 md:right-16 pointer-events-none" style={{ ['--stamp-size' as never]: '90px' }}>
          <CornerStamp text="PROOF · DRAFT 01" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2
            className="text-4xl md:text-5xl font-medium tracking-tight text-white"
            style={{ fontFamily: 'var(--font-fraunces)', letterSpacing: '-0.02em', fontVariationSettings: '"opsz" 96' }}
          >
            Ready to see your future site?
          </h2>
          <p className="mt-4 text-lg text-white/80 max-w-2xl mx-auto">
            Free preview in 90 seconds. No credit card. We&rsquo;ll email you the link.
          </p>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="mt-10 bg-white text-slate-900 rounded-2xl shadow-2xl shadow-black/30 p-7 md:p-9 text-left"
          >
            {submitted && (
              <div className="mb-6 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 text-sm font-medium flex items-start gap-2" role="status">
                <SuccessCheck trigger={submitted} className="w-5 h-5 flex-none mt-0.5 text-emerald-600" />
                <span>Request received — check your inbox at <span className="font-semibold">{form.email || 'your email'}</span> for your preview link within a few minutes.</span>
              </div>
            )}
            {submitError && (
              <div className="mb-6 rounded-xl bg-red-50 border border-red-200 text-red-800 px-4 py-3 text-sm font-medium" role="alert">
                {submitError}
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
                  aria-invalid={!form.businessName.trim() && emailTouched ? true : undefined}
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
                  onBlur={() => setEmailTouched(true)}
                  required
                  aria-invalid={emailTouched && !emailValid ? true : undefined}
                  className={`brand-focus w-full px-4 py-3 border rounded-xl bg-white ${
                    emailTouched && !emailValid
                      ? 'border-red-400'
                      : emailTouched && emailValid
                      ? 'border-emerald-400'
                      : 'border-slate-300'
                  }`}
                  placeholder="you@business.ca"
                />
                {emailTouched && !emailValid && (
                  <p className="mt-1 text-xs text-red-600">Enter a valid email address.</p>
                )}
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
                onBlur={() => setUrlTouched(true)}
                aria-invalid={urlTouched && !urlValid ? true : undefined}
                className={`brand-focus w-full px-4 py-3 border rounded-xl bg-white ${
                  urlTouched && !urlValid ? 'border-red-400' : 'border-slate-300'
                }`}
                placeholder="https://yourbusiness.ca"
              />
              {urlTouched && !urlValid && (
                <p className="mt-1 text-xs text-red-600">Use a full URL like https://yourbusiness.ca</p>
              )}
              <p className="mt-1 text-xs text-slate-500">
                We&rsquo;ll use it to compare your current site against the preview.
              </p>
            </div>
            <div className="mt-5">
              <label htmlFor="message" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Tell us about your business
                <span className="ml-2 text-xs font-normal text-slate-400">
                  {form.message.length}/500
                </span>
              </label>
              <textarea
                id="message"
                name="message"
                value={form.message}
                onChange={handleChange}
                rows={4}
                maxLength={500}
                className="brand-focus w-full px-4 py-3 border border-slate-300 rounded-xl bg-white resize-none"
                placeholder="What services do you offer? What city? What makes you different?"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 w-full bg-action text-white font-semibold py-3.5 px-6 rounded-xl hover:bg-action-deep transition-all shadow-lg shadow-action/40 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {isSubmitting ? 'Generating…' : 'Generate my free preview →'}
            </button>
            <p className="mt-3 text-center text-xs text-slate-500">
              No credit card. We never share your details. PIPEDA-compliant.
            </p>
          </form>
        </div>
      </section>

      {/* ============================== FOOTER ============================== */}
      <footer className="bg-ink text-white/70 py-16 relative overflow-hidden">
        {/* Maple-leaf SVG mark next to SiteSprint */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-signal flex items-center justify-center text-white font-extrabold text-lg relative">
                  S
                  {/* Tiny maple-leaf SVG — Canadian signature */}
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 text-paper"
                  >
                    <path d="M12 2l1.2 3.4 2.6-1.6-1 3 2.8.8-2.4 1.6 2.4 2.6-3.4.4 1.2 3.2-2.8-1.4L12 22l-.6-7.6-2.8 1.4 1.2-3.2-3.4-.4 2.4-2.6-2.4-1.6 2.8-.8-1-3 2.6 1.6z" />
                  </svg>
                </div>
                <span
                  className="text-xl font-medium tracking-tight text-white"
                  style={{ fontFamily: 'var(--font-fraunces)', fontVariationSettings: '"opsz" 36' }}
                >
                  SiteSprint
                </span>
              </div>
              <p className="mt-4 text-sm text-white/55 max-w-md leading-relaxed">
                Fast website previews for Canadian small businesses. Hosted in Montréal,
                built for the trades, friendly to your wallet.
              </p>
              <p className="mt-4 text-xs text-white/40">© {new Date().getFullYear()} SiteSprint. All rights reserved.</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-widest">Product</h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li><a href="#features" className="hover:text-signal transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-signal transition-colors">How it works</a></li>
                <li><a href="#pricing" className="hover:text-signal transition-colors">Pricing</a></li>
                <li><a href="/showcase" className="hover:text-signal transition-colors">Examples</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-widest">Company</h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li><a href="#faq" className="hover:text-signal transition-colors">FAQ</a></li>
                <li><a href="#request-preview" className="hover:text-signal transition-colors">Request a preview</a></li>
              </ul>
            </div>
          </div>
          {/* PIPEDA notice line */}
          <div className="mt-12 pt-6 border-t border-white/10 text-xs text-white/40">
            SiteSprint complies with the Personal Information Protection and Electronic Documents Act (PIPEDA).
            Data hosted in Canada. Read our{' '}
            <a href="/privacy" className="underline hover:text-white/60 transition-colors">privacy policy</a>.
          </div>
        </div>
      </footer>
    </div>
  );
}