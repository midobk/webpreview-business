import type { Metadata } from 'next';
import V2Landing from './_components/V2Landing';
import './v2.css';

export const metadata: Metadata = {
  title: 'SiteSprint — Your website already exists',
  description:
    'A personalized first draft of your website, machine-fast and human-finished. Free draft the same day for Canadian small businesses — no credit card, no sales call.',
  openGraph: {
    title: 'SiteSprint — Your website already exists.',
    description:
      'A real first draft of your website, free and same-day — then finished by hand when you say yes. Built for Canadian small businesses.',
    type: 'website',
  },
};

export default function V2Page() {
  return <V2Landing />;
}
