import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/', '/classic'],
      },
    ],
    sitemap: 'https://seawaysites.com/sitemap.xml',
  };
}
