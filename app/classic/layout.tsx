import type { Metadata } from 'next';

// The retired warm-print homepage, kept for reference. noindex so it
// never competes with the real landing page in search.
export const metadata: Metadata = {
  title: 'Classic homepage — Seaway Sites',
  robots: { index: false, follow: false },
  alternates: { canonical: '/' },
};

export default function ClassicLayout({ children }: { children: React.ReactNode }) {
  return children;
}
