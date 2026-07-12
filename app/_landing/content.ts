/* Shared landing-page content — plain module (no 'use client') so the
   server page can build JSON-LD from the same source the UI renders. */

export const PRICING = [
  {
    name: 'Preview',
    price: 'Free',
    cadence: 'no card required',
    blurb: 'A personalized first draft — see the direction before you commit.',
    features: ['Complete one-page first draft', 'Mobile + desktop design', 'Personalized copy & palette', 'Human-reviewed before it’s sent', 'Keep iterating or walk away'],
    cta: 'Get my draft',
    featured: false,
  },
  {
    name: 'Managed',
    price: '$299',
    cadence: 'setup + $49/mo',
    blurb: 'Most popular. Finished by hand, live on your domain, fully managed.',
    features: ['Your draft, refined to production-ready', 'Custom domain + SSL', 'Hosting + maintenance included', 'Unlimited small edits', 'Cancel anytime'],
    cta: 'Start managed',
    featured: true,
  },
  {
    name: 'Standard',
    price: '$500',
    cadence: 'paid once',
    blurb: 'Finalized site, handed off. Host it yourself.',
    features: ['Finalized one-page website', 'Contact form + mobile responsive', 'Deployment help included', '30 days of edits'],
    cta: 'Buy standard',
    featured: false,
  },
  {
    name: 'Full Handoff',
    price: '$799',
    cadence: 'paid once, source included',
    blurb: 'Source files + handoff. Zero recurring anything.',
    features: ['Full source files', 'Domain + hosting guidance', '30 days of bug-fix edits', 'For developers & agencies'],
    cta: 'Buy handoff',
    featured: false,
  },
];

export const FAQS = [
  {
    q: 'How fast will I see my first draft?',
    a: "Within the hour, usually. The build agent assembles the draft in minutes, then a person reviews it before it's sent — we'd rather be a little slower than send you something broken.",
  },
  {
    q: 'Is the preview my finished website?',
    a: "No — and we're up-front about that. It's a working first draft: real copy, real design, personalized to your business. If you decide to keep it, we refine it together — your photos, final wording, booking links, the details — until it's production-ready on your domain.",
  },
  {
    q: 'Is this just AI-generated?',
    a: "The first draft is machine-assembled — that's how it can be fast and free — but nothing ships without a person reviewing, editing and finishing it. You'll never be handed raw robot output, and the final site is finished by hand.",
  },
  {
    q: "Do I own the website when it's done?",
    a: 'On the Managed plan, we host and maintain it for you (you can cancel any time). On the one-time plans, source files are yours — host them anywhere, edit them yourself, no lock-in.',
  },
  {
    q: 'Can I edit the preview after I see it?',
    a: 'Yes. Reply to your preview email with what you want changed — colours, copy, layout. We iterate until you love it, included in the final package.',
  },
  {
    q: 'Is my business data stored in Canada?',
    a: "Yes. Our infrastructure runs in Montréal and Toronto. We're PIPEDA-aligned and never sell or share your business data with third parties.",
  },
  {
    q: "What if I don't like the preview?",
    a: "Walk away. No invoice, no follow-up spam. We'll ask one quick 'what was wrong?' so we can do better next time, but you don't owe us anything.",
  },
  {
    q: 'Do you handle the domain and email?',
    a: "We register and configure your domain as part of the final package, and can set up a business email (hello@yourbusiness.ca) on request. Existing domain? We'll point it for you.",
  },
];
