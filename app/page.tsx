import type { Metadata } from 'next';
import V2Landing from './_landing/V2Landing';
import { FAQS, PRICING } from './_landing/content';
import './_landing/v2.css';

const SITE_URL = 'https://seawaysites.com';

export const metadata: Metadata = {
  title: 'Seaway Sites — Website drafts for Canadian small business',
  description:
    'See a free, personalized first draft of your website within the hour — machine-drafted, human-finished. Built for Canadian small businesses. No credit card, no sales call.',
  keywords: [
    'small business website Canada',
    'website design Canada',
    'free website preview',
    'website draft',
    'one page website',
    'local business website',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Seaway Sites — Your website already exists.',
    description:
      'A real first draft of your website, free and within the hour — then finished by hand when you say yes. Built for Canadian small businesses.',
    url: '/',
    siteName: 'Seaway Sites',
    locale: 'en_CA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Seaway Sites — Your website already exists.',
    description:
      'A real first draft of your website, free and within the hour. Built for Canadian small businesses.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

/* Structured data: the service + site identity, and the on-page FAQ so
   search engines can surface it as rich results. Prices mirror PRICING. */
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'ProfessionalService',
      '@id': `${SITE_URL}/#business`,
      name: 'Seaway Sites',
      url: SITE_URL,
      email: 'hello@seawaysites.com',
      description:
        'Personalized website drafts for Canadian small businesses — free first draft within the hour, finished by hand when you say yes.',
      areaServed: { '@type': 'Country', name: 'Canada' },
      priceRange: '$0–$799 CAD',
      makesOffer: PRICING.map((tier) => ({
        '@type': 'Offer',
        name: `${tier.name} plan`,
        description: tier.blurb,
        price: tier.price === 'Free' ? '0' : tier.price.replace('$', ''),
        priceCurrency: 'CAD',
      })),
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: 'Seaway Sites',
      publisher: { '@id': `${SITE_URL}/#business` },
      inLanguage: 'en-CA',
    },
    {
      '@type': 'FAQPage',
      '@id': `${SITE_URL}/#faq`,
      mainEntity: FAQS.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <V2Landing />
    </>
  );
}
