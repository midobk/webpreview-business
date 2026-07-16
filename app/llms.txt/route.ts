import { FAQS, PRICING } from '../_landing/content';

export const dynamic = 'force-static';

const SITE = 'https://seawaysites.com';

function buildLlmsTxt(): string {
  const pricing = PRICING.map(
    (tier) =>
      `- **${tier.name}** — ${tier.price}${tier.cadence ? ` (${tier.cadence})` : ''}: ${tier.blurb} Includes: ${tier.features.join(', ')}.`
  ).join('\n');

  const faq = FAQS.map((item) => `### ${item.q}\n\n${item.a}`).join('\n\n');

  return `# Seaway Sites

> Seaway Sites prepares personalized website drafts and finished one-page websites for Canadian small businesses. Prospects can request one free initial draft before choosing either a managed monthly service or a one-time source-file handoff.

Key facts:

- Audience: Canadian small businesses, including local trades and service businesses
- Offer: one free personalized first draft; no credit card and no sales call
- Timing: most eligible requests are delivered within the hour during service hours, subject to complete submission details and current request volume
- Process: business research, conversion planning, website copy, visual direction, responsive preparation, local-search structure, production checks and delivery
- Ownership: clients always own their domain, business content, branding and customer data; source files are included with the one-time ownership plan
- Privacy: operated by a Canadian business with privacy-conscious infrastructure; current handling details are published in the privacy policy
- Contact: hello@seawaysites.com
- Website: ${SITE}

## Pricing (CAD)

${pricing}

## FAQ

${faq}

## Pages

- [Home](${SITE}/): service overview, condensed production demonstration, pricing and draft-request form
- [Showcase](${SITE}/showcase): examples of website drafts
- [Privacy](${SITE}/privacy): current privacy and data-handling information
`;
}

export function GET() {
  return new Response(buildLlmsTxt(), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
