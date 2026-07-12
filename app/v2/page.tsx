import type { Metadata } from 'next';
import V2Landing from './_components/V2Landing';
import './v2.css';

export const metadata: Metadata = {
  title: 'SiteSprint — Your website already exists',
  description:
    'A personalized first draft of your website in minutes, not months — human-finished when you say yes. Free draft within the hour for Canadian small businesses. No credit card, no sales call.',
  openGraph: {
    title: 'SiteSprint — Your website already exists.',
    description:
      'A real first draft of your website, free and within the hour — then finished by hand when you say yes. Built for Canadian small businesses.',
    type: 'website',
  },
};

export default function V2Page() {
  return <V2Landing />;
}
