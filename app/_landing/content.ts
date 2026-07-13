/* Shared landing-page content — plain module (no 'use client') so the
   server page can build JSON-LD from the same source the UI renders. */

export const PRICING = [
  {
    name: 'Free Draft',
    price: 'Free',
    cadence: 'one personalized first draft',
    blurb: 'See a real direction for your business before you commit.',
    features: [
      'Complete one-page initial draft',
      'Mobile + desktop direction',
      'Personalized copy and visual palette',
      'Quality-checked before delivery',
      'No card and no obligation',
    ],
    cta: 'Request my draft',
    featured: false,
  },
  {
    name: 'Managed Website',
    price: '$399',
    cadence: 'setup + $69/mo · founding-client pricing',
    blurb: 'We finish, launch, host and maintain the website for you.',
    features: [
      'Draft refined to production-ready',
      'Custom domain connection + SSL',
      'Hosting and technical maintenance',
      'Two small content-update requests per month',
      'Cancel anytime',
    ],
    cta: 'Start managed',
    featured: true,
  },
  {
    name: 'Own Your Website',
    price: '$899',
    cadence: 'paid once · source files included',
    blurb: 'A finished website handed over for you to host and manage.',
    features: [
      'Production-ready one-page website',
      'Full source files',
      'Domain and hosting guidance',
      '30 days of bug-fix support',
      'No recurring Seaway Sites fee',
    ],
    cta: 'Own my website',
    featured: false,
  },
];

export const FAQS = [
  {
    q: 'How fast will I see my first draft?',
    a: 'Most eligible requests are delivered within the hour during service hours. Timing depends on receiving complete business details and on current request volume; if a request needs more time, we will tell you rather than rush the work.',
  },
  {
    q: 'What happens during the hour?',
    a: 'We review your public presence, services, service area and customer language; plan the page around a clear conversion goal; prepare the copy and visual direction; check the mobile layout, contact paths and local-search structure; then package the draft for delivery.',
  },
  {
    q: 'Is the preview my finished website?',
    a: 'No. The free offer includes one personalized initial draft so you can judge the direction before paying. Once you choose a paid package, we refine the wording, photos, links and details with you until the website is ready to launch.',
  },
  {
    q: "Who owns the website when it's done?",
    a: 'You always own your domain, business content, branding and customer data. The Managed Website plan is delivered as an ongoing managed service; the Own Your Website plan also includes the source files so you can host and edit the site independently.',
  },
  {
    q: 'Can I request changes after I see the draft?',
    a: 'Yes. The free draft establishes the direction. Refinement and revision work begins after you choose a paid package. Managed clients also receive two small content-update requests per month.',
  },
  {
    q: 'How do you handle business information?',
    a: 'Seaway Sites is operated by a Canadian business and uses privacy-conscious infrastructure. We collect the details needed to prepare and deliver your draft; current handling, retention and service-provider information is described in our privacy policy.',
  },
  {
    q: "What if I don't like the preview?",
    a: "Walk away. There is no invoice and no sales call. We may send one brief follow-up asking what missed the mark, but you do not owe us a reply or payment.",
  },
  {
    q: 'Do you handle the domain and business email?',
    a: "We can connect an existing domain or help configure a new one as part of a paid package. Business-email setup can be added on request, with any third-party subscription cost shown clearly before work begins.",
  },
];
