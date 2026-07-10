import type { ReactNode } from 'react';

// The showcase is backed by Supabase and must not be frozen at build time.
export const dynamic = 'force-dynamic';

export default function ShowcaseLayout({ children }: { children: ReactNode }) {
  return children;
}
