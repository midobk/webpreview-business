import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site-config';

// AI/answer-engine crawlers are explicitly welcomed (GEO): being
// citable by ChatGPT, Claude, Perplexity and AI Overviews is lead
// generation for a business like this, not a content-theft concern.
const AI_CRAWLERS = [
  'GPTBot',
  'ChatGPT-User',
  'OAI-SearchBot',
  'ClaudeBot',
  'Claude-User',
  'Claude-SearchBot',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
  'meta-externalagent',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/', '/classic', '/preview/'],
      },
      ...AI_CRAWLERS.map((userAgent) => ({
        userAgent,
        allow: '/',
        disallow: ['/admin', '/api/', '/classic', '/preview/'],
      })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
