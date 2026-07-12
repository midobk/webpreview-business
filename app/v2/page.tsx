import type { Metadata } from 'next';
import V2Landing from './_components/V2Landing';
import './v2.css';

export const metadata: Metadata = {
  title: 'SiteSprint — Your website already exists',
  description:
    'Watch a complete, personalized website preview assemble itself in 90 seconds. Free for Canadian small businesses — no credit card, no sales call.',
  openGraph: {
    title: 'SiteSprint — Your website already exists.',
    description:
      'A complete website preview in 90 seconds, before you pay a dollar. Built for Canadian small businesses.',
    type: 'website',
  },
};

export default function V2Page() {
  return <V2Landing />;
}
