import type { Metadata } from 'next';
import V2Landing from './_landing/V2Landing';
import { FAQS, PRICING } from './_landing/content';
import './_landing/v2.css';
import { SITE_URL } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Seaway Sites — Website drafts for Canadian small businesses',
  description:
    'Request a free, personalized first draft of your website. Most eligible requests are delivered within the hour during service hours. Built for Canadian small businesses — no credit card and no sales call.',
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
      'A personalized first draft of your website, free. Most eligible requests are delivered within the hour during service hours.',
    url: '/',
    siteName: 'Seaway Sites',
    locale: 'en_CA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Seaway Sites — Your website already exists.',
    description:
      'Request a free, personalized first draft for your Canadian small business.',
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
        'Personalized website drafts and managed one-page websites for Canadian small businesses.',
      areaServed: { '@type': 'Country', name: 'Canada' },
      priceRange: '$0–$899 CAD',
      makesOffer: PRICING.map((tier) => ({
        '@type': 'Offer',
        name: tier.name,
        description: `${tier.blurb} ${tier.cadence}.`,
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
      mainEntity: FAQS.map((faq) => ({
        '@type': 'Question',
        name: faq.q,
        acceptedAnswer: { '@type': 'Answer', text: faq.a },
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
