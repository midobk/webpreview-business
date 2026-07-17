---
name: frontier-web-craft
description: >-
  Build complete, distinctive, client-ready websites — landing pages, business one-pagers,
  marketing sites, demo previews — at frontier-model quality on any model. Turns design taste
  into procedure: a menu of nine complete art directions with paste-ready design tokens,
  per-section build recipes, copywriting formulas, and a mechanical review gate with a runnable
  checker script. Use whenever asked to build, redesign, restyle, or improve any website,
  landing page, homepage, or demo — especially a "quick", "simple", or "basic" one; routine
  requests are exactly where generic output happens.
---

# Frontier Web Craft

**Premise.** The gap between a frontier model's website and a cheaper model's website is not
design knowledge — every model has read the same advice. The gap is three things: a few hundred
micro-decisions staying coherent, copy staying concrete, and a real review pass happening at
all. All three can be made procedural. This skill replaces "have taste" with "follow the
procedure, then verify." Follow it even when you feel confident — first-draft confidence is
exactly how generic pages ship.

**The enemy has a face.** The default AI page: centered hero on a soft gradient, one system
font everywhere, three feature cards with emoji icons, a purple or teal accent, copy that opens
"Welcome to X, your one-stop shop," a footer with dead social icons. Every step below exists to
make that page impossible to produce by accident.

## The five artifacts

Produce these five things, in order, every time. The first three are short — a few lines each —
but writing them down is what keeps the build coherent. Never skip them because the page seems
simple; simple pages are the highest-risk pages.

1. **Fact sheet** — what is true about this business (Step 0, below)
2. **Design plan** — chosen direction + visual thesis + section list (Step 1)
3. **Copy deck** — every word on the page, written before layout (Step 2)
4. **The page** — built section by section on the skeleton (Step 3)
5. **Gate report** — the checker output + rubric score, with fixes applied (Step 4)

## Step 0 — Extract the fact sheet

Read the brief and write down:

- **Name, industry, offer** — 3–6 real services or products, in the business's own words
- **Place and audience** — where it is, who walks in the door
- **Page job** — exactly ONE: call / book / get a quote / visit / sign up / buy.
  Every section either advances this job or gets cut.
- **Five concrete nouns** from this business's world — tools, materials, dishes, rituals,
  rooms. ("Hoist, torque wrench, winter tires, OBD scanner, service bay" — not "quality,
  service, excellence.") These nouns will seed the copy and the imagery.
- **Proof available** — real reviews, years in business, certifications, counts, *only if the
  brief supplies them*. Otherwise write "none — write around it."
- **Constraints** — tech stack, brand colors, self-contained single file or framework project,
  any project-specific rules.

**The honesty rule (cross-cutting, non-negotiable):** never invent verifiable claims —
testimonials, review counts, star ratings, awards, years in business, addresses, phone numbers,
prices, certifications, guarantees. Missing proof is written around (see
`references/copywriting.md` § Proof), not fabricated. You may invent *texture* (which system
font, what the hero depicts); you may never invent *facts*.

The fact sheet doubles as the **facts ledger**: at the gate you will verify that every digit,
every quotation mark, and every attribution on the finished page traces back to it. So write
down now which numbers and lines the brief actually supplies — plausible specifics invented
during the build ("+2000 items in stock", a punchy line put in the owner's mouth) are the
hardest fabrications to catch later, because they sound exactly like the real thing.

If the brief leaves a field genuinely open (e.g., no audience stated), decide a specific answer
and write it in the fact sheet — a wrong-but-specific choice produces a better page than a
hedge. Never leave a placeholder.

## Step 1 — Choose a direction; do not invent one

Read `references/design-directions.md` and pick ONE of the nine named directions using its
selection table. Then:

- Take the direction's token block **verbatim** as your `:root`. You may re-hue tokens toward
  the business's real brand colors (logo, storefront, vehicle wrap) if the brief supplies them —
  keep the structure, swap the family, re-check contrast. Never drift toward the purple/teal
  defaults.
- The direction's **signature element is mandatory**. It is the one thing the page will be
  remembered by; everything else stays quiet around it.
- If the brief itself specifies an aesthetic, the brief wins — use the nearest direction as
  scaffolding for tokens and structure.
- Never blend two directions. Coherence beats novelty.

Close the step by writing the **visual thesis**, one sentence:

> "When a [specific audience member] lands, this page should feel like [a specific real-world
> place or object], and the first thing they notice is [the signature element]."

If you cannot fill in the blanks with something specific to this business, return to the fact
sheet — you don't know the subject well enough to design for it yet.

## Step 2 — Write the copy deck before any layout

Read `references/copywriting.md` and draft every word: headline, lede, all CTA labels, each
section's heading and body, footer lines. Copy comes before layout because layout-first pages
get filled with filler — when the words exist first, the layout has something to be about.

Run the copy checks (banned-phrase list, specificity tests) on the deck *now*, before the words
get embedded in markup where they're expensive to change.

## Step 3 — Build on the skeleton

Read `references/page-anatomy.md` for the global rules, the section recipes, and the three hero
archetypes. Start from `assets/skeleton.html` rather than a blank file — it already carries the
quality floor (reset, token slot, utilities, focus states, reduced-motion).

The hard rules, always active (the checker enforces most of them):

- Every color comes from a `:root` token. **Zero hex values outside `:root`** — and any
  translucent tint you reach for more than twice (an `rgba()` of paper or ink) becomes a token
  too (`--bone-70`), or the shades drift apart one hand-mix at a time.
- Exactly one display face + one text face (+ optional mono for data). Weights are chosen,
  not defaulted. Take the direction's font stacks **verbatim and in order** — the first family
  is the intended cut; reordering it away quietly changes every heading.
- The hero carries the page job's **primary CTA**, and the first viewport (desktop and phone)
  shows headline, lede, and that CTA together. A hero that fills the whole first screen with
  type alone postpones the very job the page exists to do.
- The direction's stated **motion set ships** — dropping its ticker or reveals is the same
  drift as swapping its palette. Unless the direction is deliberately still, the page gets one
  orchestrated moment (hero load sequence or scroll reveals), not zero.
- All spacing from one scale; section padding from one clamp. No ad-hoc margins.
- One shadow token. One radius scale. The accent color appears at most ~6 times per viewport —
  scarcity is what makes it read as intentional.
- Icons are inline SVG on one size grid, consistent stroke. **Never emoji.**
- Every image is art-directed: `object-position` chosen deliberately, a gradient scrim wherever
  text overlays, frame/radius from the direction's shape language.
- Mobile-first; display type via `clamp()`; tap targets ≥ 44px; no horizontal scroll at 390px.
- Visible `:focus-visible` styles; `prefers-reduced-motion` respected; specific `alt` text on
  content images, `alt=""` on decorative ones; semantic sections; exactly one `h1`.

### Output modes

- **Single self-contained file** (default for demos, prototypes, previews): one `index.html`,
  inline `<style>`, local images, system font stacks, no CDN/`@import`/external anything.
- **Framework project** (Next.js, Vite, etc.): the same token block goes in `globals.css` (or
  the theme config); the same rules apply per component. Webfonts are allowed here if
  self-hosted or the project already loads them — the directions file lists upgrades.

## Step 4 — Run the gate; you are done when it passes

Read `references/quality-gate.md`. Three tiers, in order:

1. **Mechanical** — run `python3 scripts/review_page.py <file>` (add `--self-contained` for
   single-file mode). Fix every FAIL; justify every WARN in one line or fix it.
2. **Render scan** — screenshot or open at 390px and 1440px; run the ten-point visual checklist.
3. **Judgment, made mechanical** — score the 8-dimension rubric (0–5 each; pass is **≥ 32/40
   with no dimension below 3**), run the genericism interrogation, run the **facts ledger**
   (every digit, quote mark, and attribution on the page traces to the fact sheet, or it goes),
   and do one Chanel pass (remove one decorative element).

The page being rendered and pretty is not the finish line; the gate passing is. When a check
fails, apply the matching fix from the gate's fix table and re-run the whole gate — fixes have
side effects.

## Precedence

If the project you're working in defines its own output contract or QA gates (e.g. a
`docs/PROTOTYPE_*.md` set, watermark/demo-lock rules, image pipelines, publication bars), those
are the law of that repo: apply them on top of this skill, and on any conflict the project docs
win. This skill supplies craft; the project supplies contracts.

## Worked micro-example (the level of specificity expected)

Brief: *"Make a site for Cornwall Auto Care, an auto repair shop in Cornwall, Ontario."*

- **Fact sheet:** offer = brakes, diagnostics, seasonal tires, oil service; audience = local
  commuters + winter drivers; job = **call**; nouns = hoist, torque wrench, winter tires, OBD
  scanner, service bay; proof = none supplied — write around; constraints = single file.
- **Direction:** Fieldstone (trade, daytime, value-forward). Signature: outlined step numbers
  over a spec strip.
- **Thesis:** "When a commuter with a check-engine light lands, this page should feel like a
  clean, organized service bay at 8 a.m., and the first thing they notice is the big
  01 Book · 02 Drop off · 03 Drive strip."
- **Headline candidates:** "Winter-ready in one visit." / "Straight answers, torque-spec work."

Notice what specificity looks like: the thesis names a real moment, the headline contains nouns
that couldn't be moved to a bakery's site. That's the bar for every artifact.
