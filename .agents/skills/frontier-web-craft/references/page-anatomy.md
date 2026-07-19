# Page anatomy & build recipes

How to assemble the page: global rules first (they apply to every section), then the hero
archetypes, then per-section recipes. Build top to bottom; finish each section — including its
mobile behavior — before starting the next, so problems surface one at a time.

## Contents

1. [Global skeleton rules](#global)
2. [Page composition & rhythm](#composition)
3. [Hero archetypes A / B / C](#heroes)
4. [Section recipes](#sections)
5. [Responsive pass](#responsive)
6. [Motion budget](#motion)

<a name="global"></a>
## Global skeleton rules

Start from `assets/skeleton.html`. These rules hold everywhere:

**Document.** `<!DOCTYPE html>`, `lang` attribute, viewport meta, real `<title>`
("{Business} — {what/where}"), meta description. For demo/preview pages add
`<meta name="robots" content="noindex,nofollow">`.

**Reset.** `*,*::before,*::after{box-sizing:border-box}`, zeroed body margin,
`img{display:block;max-width:100%}`, `button,input,select{font:inherit}`.

**Container.** `width: min(1180px, calc(100% - 48px)); margin-inline: auto;` — one container
class, used by every section's inner wrapper. Full-bleed backgrounds go on the section, content
in the container.

**Spacing scale.** Everything vertical comes from one scale — e.g. 8 / 16 / 24 / 40 / 64 / 96.
Section padding is one clamp for the whole page: `padding-block: clamp(64px, 9vw, 120px)`
(Porcelain goes up to ~150px, Ledger can go down). If you're typing a margin that isn't on the
scale, you're improvising — stop.

**Type scale.** One clamp per role, defined once:
hero `clamp(44px, 6vw, 88px)` · h2 `clamp(34px, 4.5vw, 60px)` · h3 20–24px ·
body 16–17px/1.6–1.75 · caption 10–12px caps, tracked per direction. Display line-height ≤ 1.05,
negative letter-spacing per direction. Never let a heading default.

**Background rhythm.** Adjacent sections never share a background token. Typical light-page
run: paper → white → paper-deep → **dark inversion** → paper → dark footer. Exactly one
full inversion (dark section on a light page; light on a dark page), placed in the middle
third — it's the page's chorus. Dark directions invert this logic.

**Section head pattern.** Every section on a page opens with the same three-part head —
within one page that consistency is what reads as one designer's hand:

```html
<div class="section-head">
  <p class="eyebrow">Services</p>
  <h2>Cuts, color, and <em>slow Saturdays</em></h2>
  <p class="lede">One or two sentences max. Concrete, not throat-clearing.</p>
</div>
```

But the *treatment* of each part is a per-site choice from the device menu below — the same
head pattern styled the same way across different sites is a template tell.

**Device menu.** These are the visible atoms that make sites recognizable; choose each one
per site (guided by the direction), never inherit it:

- *Eyebrow*: leading rule (32px dash) · boxed tag (1px border chip) · index number ("01 —") ·
  plain wide-tracked caps · dot marker · conceit vocabulary ("BATCH 12", "PL. 04").
- *Heading accent* (1–3 words in the h2): italic in accent color · solid accent color ·
  hand-underline (thick offset `text-decoration` or an SVG stroke) · outlined text
  (`-webkit-text-stroke`) · highlighter block behind the word.
- *Button shape*: pill (radius 999) · square/blunt (direction radius) · underline-link CTA
  (no box at all — Porcelain, editorial) · stamped border (2px, no fill until hover).
  Button case: tracked caps *or* sentence case at 14–15px — the caps-pill is one option,
  not the default.
- *Section-head alignment*: left · centered · split two-column (eyebrow+h2 left, lede right).

One combination per site, used everywhere on that site. Two sites from the same batch should
never share the full combination.

**Buttons.** One `.btn` base (min-height 46–48px, inline-flex, caps 12px 700–800, tracked,
radius per direction) with `-primary` (accent bg, accent-tinted shadow) and `-ghost` (1px line
border) variants. Hover: translateY(−2px) + shadow deepen (or instant swap for still
directions). That's the whole button system — resist a third variant.

**Images.** `object-fit: cover` with a *chosen* `object-position` (faces and focal points are
never centered by accident). Wherever text overlays an image, a scrim:

```css
background: linear-gradient(180deg, transparent 54%, rgba(24,21,19,.45)),
            url('./images/hero.jpg') center/cover;
```

Frame device from the direction (arch, border, duotone). Specific `alt` on content images;
`alt=""` on decorative.

**Never simulate a photograph.** A CSS-gradient panel captioned as if it showed something real
("the blue door on the corner") is fabricated evidence — the visual twin of an invented
testimonial. With no real imagery available, design honestly without it: typographic hero,
graphic panels that read as graphics, no photo-implying captions. Ask for real photos in the
handoff instead; even phone snapshots beat a painted stand-in.

**When the pipeline generates or supplies imagery, art-direct the brief.** A generated image
is only as good as its prompt, and a cheap prompt ("professional photo of a mechanic shop")
produces the stock-photo look that reads as template. Write each image brief from the design
plan: **subject** = one fact-sheet noun in its real setting ("a torque wrench on a steel
bench, service bay behind"); **light and mood** = the direction's world (Midnight Counter:
low warm tungsten; Porcelain: diffuse morning); **palette** = name the direction's two
dominant token colors so the image lands in the system; **composition** = where the focal
point sits, leaving copy space per the hero archetype; **exclusions** = no text, no logos,
no watermarks, no faces unless the brief supplies real people. One brief per image, distinct
subjects across the page, one consistent grade. Then verify every generated file is a real
image (>5KB, opens) — a broken generated image fails harder than no image.

**Line-art illustration — the honest imagery that always works.** Single-weight stroke SVG
drawings of the business's objects (the coffee bag, a stem, the drafting square, a cleat),
drawn inline at 1.5–2px stroke in `--ink` or the accent, deliberately simple — 10–25 paths,
not clip-art realism. Frame one as the direction's device (label card, plate, polaroid tag)
and it carries a hero or feature panel with total honesty. This is the highest-craft
replacement for missing photography; a page that pairs one good line-art set with strong type
routinely outsells a page with mediocre stock photos.

**Icons.** Inline SVG only, one grid (24px viewBox), consistent stroke width (1.5–2),
`stroke="currentColor"` so they inherit token colors. Three sizes max (15/18/24). Never emoji,
never icon fonts.

**Accessibility floor.** `:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }`,
`prefers-reduced-motion` kills animations/transitions, tap targets ≥ 44px, one `h1`, heading
levels don't skip, contrast AA (4.5:1 body, 3:1 large).

**CSS discipline.** Tokens at `:root` only — zero hex below it. Order: reset → tokens → base →
utilities → sections top-to-bottom. Watch specificity collisions: a `.section` padding rule and
a `.cta` padding rule fighting each other is the classic self-inflicted bug; keep section
spacing on one class.

<a name="composition"></a>
## Page composition & rhythm

A one-page site is **7–10 sections**. Fewer reads thin; more reads unfocused. Choose from the
menu for the page job:

- **Book / call / quote** (local business): announcement ribbon* → nav → hero → proof or ticker
  strip → services → **signature moment** → gallery or menu → about/story → CTA band →
  contact + hours → footer.
- **Sign up / buy** (product): nav → hero → social proof strip → problem/solution → features →
  **signature moment** → pricing → FAQ → CTA band → footer.

\* ribbon only if there's something true to announce (demo notice, seasonal hours).

**The signature moment** is the direction's signature element given a full-width section
mid-page (Fieldstone's number strip, Midnight Counter's menu, Ledger's table…). One section
gets the boldness budget; its neighbors stay quiet. Two showpiece sections next to each other
cancel each other out.

**The conceit — give the page a world, not just a look.** The strongest sell-on-sight pages
have an organizing metaphor drawn from the business's own paper artifacts, and let it name
things site-wide: the roaster's *log sheet* (eyebrows become "BATCH 12 · WASHED"), the
florist's *coolroom tag*, the contractor's *job ticket*, the architect's *plate numbering*
("PL. 04"), the bar's *printed menu card*, the shop's *daily board*. Choose one conceit in the
design plan and let every label, eyebrow, and index number speak its vocabulary — that
consistency is what makes a page feel commissioned rather than assembled. Two limits: the
conceit must be honest (no ® symbols, no "EST. 2018", no "VOL. XI" implying eleven real years
— stylistic numbering must be transparently stylistic or derived from real facts), and it
stays in the labels — body copy still talks like a person.

**The signature carries content the page hasn't said yet.** Restating the headline inside a
fancier container is decoration wearing the signature's clothes — the reader gets nothing new
at the page's boldest moment. Give it information: the menu, the process, the week's arrivals,
the service areas, the one stat that matters. If you can delete the signature section without
losing a fact, it isn't a signature yet.

**Nav — pick one of three patterns** (a batch of sites must not all use the first):

- *Standard*: sticky, translucent page-background (`rgba` of paper at ~.92) +
  `backdrop-filter: blur(18px)` + 1px bottom `--line`. Left: brand mark + name (+ small caps
  tagline). Right: 3–5 anchor links + one primary CTA. Link hover: underline grows from left
  (`::after` transitioning `right: 100% → 0`).
- *Masthead*: department-store style, for editorial directions (Heritage Wine, Market Fresh,
  Porcelain) — announcement line on top, brand set large and centered like a wordmark, nav row
  beneath between hairlines. Stately; costs vertical space, so the hero clamp shrinks a step.
- *Minimal*: brand left, single primary CTA right, nothing else — for one-job pages and
  Porcelain. The anchor links move to the footer.

**Ticker recipe** (optional, one per page): a `width: max-content` flex track, content
duplicated once, `@keyframes ticker { to { transform: translateX(-50%); } }` at 22–30s linear
infinite, caps micro-type with a small separator glyph, bordered top and bottom with `--line`.
Pause it under `prefers-reduced-motion`.

<a name="heroes"></a>
## Hero archetypes

Pick the archetype the assets can honestly support. Whichever you pick, one rule is
non-negotiable: **the hero contains the page job's primary CTA** (usually with its ghost
secondary), and the first viewport — check ~1440×900 and ~390×844 — shows headline, lede, and
that CTA together. If the display type pushes them below the fold, shrink the clamp or cut a
headline line; the words lose gracefully to the job.

### A — Editorial split (default when there's one strong image)

Asymmetric grid — `grid-template-columns: .92fr 1.08fr` (never 50/50; the asymmetry is what
looks designed), gap 60–70px, aligned center. Text column: eyebrow → h1 (≤ 9 words, `<em>`
accent) → lede (≤ 2 sentences, max-width ~560px) → two CTAs (primary + ghost) → proof strip
(border-top `--line`, 3 items of *real* facts — hours, service area, offer count — each a
display-type value over a caps label). Image column: the direction's shaped image treatment +
one overlapping secondary element (rotated small frame, floating note card, ghost ornament).
Stack order on mobile: text first, image second.

### B — Full-bleed immersion (when the image is spectacular)

Section min-height 78–92vh, image as background with the scrim **mandatory**, content
bottom-left inside the container: eyebrow → h1 → lede → CTAs, all in the light-on-dark palette.
A stat/proof strip sits directly below the hero as its own thin section. Nav can start
transparent over the image if it gains a solid background on scroll — otherwise keep it solid.

### C — Typographic (when imagery is weak or absent)

No hero image. Display type at `clamp(64px, 11vw, 128px)` — capped, because at four stacked
lines the max sizes eat the whole first screen — 2–3 stacked lines mixing solid and outlined
text (`-webkit-text-stroke`), rules or a ticker between; then the lede, the CTA pair, and a
small metadata row (place, year, offer) in caps, all inside the first viewport. **If the available imagery is mediocre, choose C — a bad photo
costs more trust than no photo.** Images can still appear later in the page at small,
controlled sizes.

<a name="sections"></a>
## Section recipes

Each: job → layout → the detail inventory that separates rich from flat → classic failure.

**Services / features.** Grid of 3 (or 2×2); each card: index number or SVG icon → name (2–3
words, the real service name) → 12–18 word description → optional price. Hover lift or border
swap. *Failure:* six-plus cards of two words each — merge to the 3–4 that matter and give them
real descriptions. Cards are `--card`/`--white` on the alternate background, or bordered cells
in Ledger.

**Menu / pricing.** The printed-card pattern: centered column (max-width ~720px) or two
columns desktop; item rows are flex with a dotted-leader spacer
(`flex: 1; border-bottom: 1px dotted var(--line); margin: 0 8px 4px;`), price right-aligned
in tabular numerals. Group by real categories with eyebrow-style subheads. *Failure:* dumping a
`<table>`; inventing prices the brief didn't supply (omit prices instead).

**Gallery.** Irregular grid, not a uniform 3×3: one 2×2 feature cell + 3–4 satellites
(`grid-template-columns: repeat(4, 1fr)` with `grid-column/row: span 2` on the feature). Subtle
hover `scale(1.03)` inside `overflow: hidden`. Real `alt` per image. *Failure:* identical
squares wall-to-wall; captions restating the obvious.

**About / story.** Split: treated portrait/interior image + two short paragraphs + one
pull-quote in display type (the owner's actual line if the brief has one). 90–120 words total.
*Failure:* the corporate bio ("with a passion for excellence…") — write it as "what we do every
morning" instead.

**Proof.** Only real data, ever. With reviews/years/counts supplied: stat strip or one
well-set quote (display type, source line). With nothing: **process proof** — the 01/02/03 of
how working together goes, guarantees the brief states, service areas, hours. *Failure:*
invented five-star cards with stock names. An honest process beats a fake testimonial.

**CTA band.** The inversion section or an accent-washed band: h2 echoing the visual thesis'
promise → one primary CTA → a plain-text alternative (phone number as text if real, "or drop
by — {address}"). *Failure:* three competing CTAs; a second pitch's worth of new copy.

**Contact / hours.** Two columns: hours as a definition-list-style table (real hours, or "Call
to confirm seasonal hours" — never invented), address, area; other column a map *treatment*
(styled panel or static frame — a live embed only in framework mode) or a locked/functional
form per project rules. *Failure:* a form that goes nowhere without saying so.

**Footer.** Brand mark + one-line identity, anchor nav echo, hours/area, small print
(© year, demo notice if applicable). Social icons only if the brief supplies real URLs —
otherwise omit them entirely. *Failure:* five dead icons.

<a name="responsive"></a>
## Responsive pass

Mobile-first: write base styles for ~390px, layer desktop with
`@media (min-width: 768px)` and `(min-width: 1024px)`.

- Grids collapse to one column; source order = reading order (hero text before hero image).
- Display type: the clamps handle scale, but re-check line breaks at 390px — a 9-word headline
  may need a `<br>` strategy or shorter wording, not a smaller font.
- Nav on mobile: brand + primary CTA visible; 3–5 anchor links can inline-wrap under the brand
  or collapse into a native `<details>` menu — don't build a JS hamburger for a one-pager.
- Proof strips wrap (`flex-wrap`), min-width per item. Three-up stat/proof grids collapse
  below ~480px — three boxes at 110px each read as clutter, not confidence.
- Tap targets ≥ 44px; gaps ≥ 12px between adjacent tappables.
- Kill horizontal scroll: no fixed widths above ~360px on non-media elements; any wide element
  (table, code) scrolls inside its own `overflow-x: auto` wrapper.
- Verify at **390×844 and 1440×900** before calling the page done.

<a name="motion"></a>
## Motion budget — a floor and a ceiling

The direction's stated motion set is **mandatory, like its tokens** — the most common failure
here is not excess but omission: a cautious build ships hover transitions only, drops the
direction's ticker or reveals, and the page reads embalmed. Build exactly what the direction
names.

The ceiling: beyond the direction's set, choose **either** a page-load hero sequence **or**
scroll-reveals on section heads — not both — plus at most one ambient element (ticker, slow
orb drift). Every direction that isn't deliberately still (Fieldstone, Ledger are; the rest
aren't) gets **one orchestrated moment** — the hero sequence or the reveals — not zero.
Durations 150–600ms per direction; one easing curve site-wide. Hover states on everything
interactive, subtle (translate/underline/shadow/inversion — no spins, no bounces).

The reveal recipe (required pattern for scroll reveals — not optional garnish): an
`IntersectionObserver` adds `.in` (opacity 0→1, translateY 14px→0, transition 500–600ms,
stagger siblings ~80ms); elements default to visible when JS is absent, and everything is
instant under `prefers-reduced-motion`. The hero load sequence is the same idea on page load:
eyebrow → headline lines → lede → CTAs, staggered 60–90ms.

## Generating a set — anti-convergence rules

When one session (or one pipeline) produces multiple sites, each page competes with its
siblings: a prospect who visits two of your demos and sees the same skeleton twice stops
believing either was made for them. Sameness that is invisible in one page is glaring in
twelve. So vary deliberately across the set, and track it:

- **No two sites share** direction + hero archetype + nav pattern. With nine directions, three
  archetypes, and three navs, a large batch never needs a repeat of the full combination.
- **Same direction twice?** Diverge everything the adaptation rules allow: re-hue toward each
  brand, different conceit, different hero archetype, different signature configuration —
  siblings in palette must be strangers in structure.
- **Headline formulas rotate.** The fragment pair ("Wood fire. Slow dough.") is the strongest
  formula and therefore the first to become a tic — cap it at roughly a third of any set and
  pull the others from the full list in copywriting.md.
- **Section-head alignment varies**: left-aligned is the default; use the centered variant and
  the split two-column head (eyebrow+h2 left, lede right) on some sites.
- **The announcement ribbon is not a uniform.** It appears on at most half the set — it needs
  something true to announce, and twelve sites all opening with a ribbon is its own template
  tell. The others open straight into the nav.
- Keep a one-line ledger per site (direction / archetype / nav / conceit / headline formula)
  and check a new site against it before building.
