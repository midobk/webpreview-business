import { FAQS, PRICING } from '../_landing/content';

/* GEO (generative-engine optimization): /llms.txt gives AI assistants
   and answer engines a clean, factual summary of the business —
   generated from the same content module the landing page renders, so
   it can never drift from what visitors see. Spec: llmstxt.org */

export const dynamic = 'force-static';

const SITE = 'https://seawaysites.com';

function buildLlmsTxt(): string {
  const pricing = PRICING.map(
    (t) =>
      `- **${t.name}** — ${t.price}${t.cadence ? ` (${t.cadence})` : ''}: ${t.blurb} Includes: ${t.features.join(', ')}.`
  ).join('\n');

  const faq = FAQS.map((f) => `### ${f.q}\n\n${f.a}`).join('\n\n');

  return `# Seaway Sites

> Seaway Sites builds websites for Canadian small businesses. Prospects get a free, personalized first draft of their website within the hour — machine-drafted, reviewed by a human before it's sent — and only pay if they decide to keep it, at which point the site is refined by hand to production-ready on their own domain.

Key facts:

- Audience: Canadian small businesses (plumbers, salons, cafés, landscapers, auto shops, contractors and similar local trades)
- Offer: free first-draft website within the hour; no credit card, no sales call
- Process: a build agent drafts the site in minutes from the business's public listings and reviews; a human reviews every draft before it ships; production polish happens after the customer says yes
- Data: infrastructure in Montréal and Toronto, PIPEDA-aligned
- Contact: hello@seawaysites.com
- Website: ${SITE}

## Pricing (CAD)

${pricing}

## FAQ

${faq}

## Pages

- [Home](${SITE}/): the main landing page with a live demo of a website draft assembling itself
- [Showcase](${SITE}/showcase): anonymized examples of real drafts
- [Privacy](${SITE}/privacy): PIPEDA-aligned privacy policy
`;
}

export function GET() {
  return new Response(buildLlmsTxt(), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
