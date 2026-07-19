import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site-config';

// Bump manually when page content changes materially — Google uses <lastmod>
// to decide when to recrawl, and distrusts it if it changes on every deploy.
const LAST_CONTENT_CHANGE = '2026-07-16';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE_URL}/`,
      lastModified: LAST_CONTENT_CHANGE,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${SITE_URL}/showcase`,
      lastModified: LAST_CONTENT_CHANGE,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: LAST_CONTENT_CHANGE,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
  ];
}
