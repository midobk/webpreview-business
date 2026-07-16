import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site-config';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE_URL}/`,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${SITE_URL}/showcase`,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/privacy`,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
  ];
}
