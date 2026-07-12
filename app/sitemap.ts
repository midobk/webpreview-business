import type { MetadataRoute } from 'next';

const BASE = 'https://seawaysites.com';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${BASE}/`,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${BASE}/showcase`,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE}/privacy`,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
  ];
}
