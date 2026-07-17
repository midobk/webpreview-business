---
name: premium-web-design
description: Use before art-directing or generating any local-business landing-page prototype, and when judging whether a generated page reaches showcase quality. Covers visual thesis, layout composition, type systems, color/token systems, imagery direction, spacing, and the difference between a "complete but generic" page and a page as strong as the best approved prototypes in data/prototypes/ and on /showcase.
---

# Premium Web Design

The craft standard for Seaway Sites prototype pages. The bar is set by the strongest approved prototypes already in `data/prototypes/` and on `/showcase` — new work must be **as strong as, or stronger than** those. This skill is the visual/art-direction half; `frontend-craft` is the implementation half. Both sit under the release gates in `docs/PROTOTYPE_QA.md` and the brief in `docs/PROTOTYPE_GENERATION_PLAYBOOK.md`.

## First principle: decide before you build

Two decisions come before a single line of markup, and every later choice serves them:

1. **Visual thesis** — one intentional direction that fits this industry and this lead: editorial, cinematic, tactile, architectural, warm-boutique, clean-clinical, or another. Not "modern and clean" (that is the absence of a thesis). A salon is not a plumber; a fine-dining room is not a taco counter. The thesis dictates type, color, imagery, and pacing.
2. **Page job** — one sentence: what should a visitor *understand*, *feel*, and *do* in the first ten seconds? The hero must deliver all three.

Write both into the handoff record (playbook §Handoff record). If you cannot state them, you are not ready to generate.

## What separates showcase-grade from generic

The approved reference prototypes share concrete traits. Reproduce them:

- **A per-brand token system, not ad-hoc colors.** Define a small palette as CSS custom properties at `:root` and use it everywhere — ink, surface, one or two brand accents, a line color, a shadow. (Reference: `bellas-hair-studio` defines `--ink`, `--paper`, `--wine`, `--gold`, `--taupe`, `--line`, `--shadow` and never hand-codes a stray hex.) A coherent 6–9 token palette reads as "designed"; scattered one-off colors read as "generated."
- **A two-face type system, at most.** One display face for headings (a serif like Georgia gives instant editorial warmth; a strong grotesk gives modern confidence) plus one readable text face (Inter / system sans). Never three. Set a real type scale (e.g. 13 / 15 / 18 / 24 / 36 / 56) and generous line-height on body copy (1.5–1.7).
- **Real imagery with treatment, not raw stock drops.** A small number of strong, industry-specific images beats a gallery of filler. Give hero/section images a gradient scrim (`linear-gradient(180deg, transparent 54%, rgba(24,21,19,.42))`) so overlaid text stays legible and the page feels composed. Every image needs useful, specific alt text.
- **Layered depth.** One considered shadow token (e.g. `0 28px 80px rgba(43,33,29,.15)`) applied consistently to cards/media reads as premium; harsh `0 2px 4px #000` everywhere reads as a template.
- **Generous, rhythmic whitespace.** Section padding in the 64–120px range on desktop, consistent vertical rhythm, and one dominant element per viewport. Cramped, evenly-gray density is the #1 tell of a weak page.

## Composition: a complete page, not a card collection

Build the full narrative arc, in this order, adapted to the industry:

1. **Announcement / brand cue** — a slim bar, kicker, or logo lockup that sets tone immediately.
2. **Hero** — delivers the page job. One dominant image or type statement, a single clear value line, one primary CTA. Not a slider, not five competing elements.
3. **Proof / trust / story** — why this business is credible. Use *only verified facts*; if none exist, tell a real story about the craft or neighborhood, never invent reviews, awards, years, or ratings.
4. **Services** — specific to what the business actually offers, in a scannable but designed layout (not a wall of identical cards).
5. **Process / differentiator** — how they work or what makes them different. This section is where generic pages give up; a strong one earns the sale.
6. **Final CTA** — decisive, single next step, restated value.

Per-industry section patterns (restaurant, salon, contractor, cleaning, auto, generic) live in `docs/PROTOTYPE_RULES.md` — use them as a checklist of expected sections, then art-direct beyond them.

## Mobile is a first-class composition

Design the 390px layout as its own composition, not a desktop grid crushed narrow. Reflow multi-column sections to a single column with intentional order, keep tap targets ≥44px, size hero type for a small screen, and verify no horizontal overflow. A page that is beautiful at 1440 and broken at 390 fails the gate.

## Motion, restrained

Add motion only when it aids comprehension: a single hero reveal, a subtle hover lift, one focused scroll transition. Never animate everything. Always honor `prefers-reduced-motion` (snap to final state). Decorative looping motion must not carry meaning or `aria-live`.

## Personalization discipline (hard rule)

Personalize from **verified lead data only**: business name, industry, city, real services, real description. **Never invent** testimonials, awards, reviews, years-in-business, addresses, phone numbers, pricing, guarantees, ratings, or certifications. Fabricated proof is an automatic reject (playbook §Quality gate, `PROTOTYPE_RULES` §No False Claims). Every page carries the watermark + demo lock from `PROTOTYPE_RULES` §Watermark + Demo Lock, and no CTA performs a real action.

## Self-scoring before handoff

Score 0–5 on each of: visual hierarchy, industry specificity, copy quality, imagery, responsive behavior, accessibility, interaction polish, technical cleanliness. **Any blocker fails outright.** Target **≥32/40** before marking `showcase_eligible`. Be honest — a "complete, not broken" page that scores 24/40 is not showcase-grade, and the automated `scripts/showcase-score/score_showcase.py` gate only checks that a page is *not broken*, never that it is *good*. That judgment is yours.
