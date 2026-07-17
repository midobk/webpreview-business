# Design directions

Nine complete art directions. Each is a coherent world: tokens, type, shape, texture, motion,
voice, and one mandatory signature element. Pick one with the selection table, take its tokens
verbatim, and stay inside it — a page that commits fully to one modest direction beats a page
that samples three ambitious ones.

**Why a menu:** inventing a distinctive direction from scratch is the single hardest part of
design, and the place where output regresses to the generic default. Selection is reliable;
origination is not. These nine cover the aesthetic territory of most real briefs. The craft
you still supply is *fit* — re-huing toward the brand's real colors, choosing what the imagery
depicts, writing copy in the direction's voice.

## Contents

1. [Selection table](#selection)
2. [Heritage Wine](#1-heritage-wine) — warm editorial luxury
3. [Fieldstone](#2-fieldstone) — rugged trade competence
4. [Porcelain](#3-porcelain) — hushed minimal calm
5. [Midnight Counter](#4-midnight-counter) — dark hospitality
6. [Blueprint](#5-blueprint) — drafted precision
7. [Market Fresh](#6-market-fresh) — daytime appetite
8. [Ledger](#7-ledger) — industrial matter-of-fact
9. [Tidewater](#8-tidewater) — soft coastal trust
10. [Matchday](#9-matchday) — kinetic poster energy
11. [Adaptation rules](#adaptation)

<a name="selection"></a>
## Selection table

| Business | First look | Second look |
|---|---|---|
| Restaurant / bar (evening, premium) | Midnight Counter | Heritage Wine |
| Café / bakery / diner / daytime food | Market Fresh | Heritage Wine |
| Salon / spa / beauty | Heritage Wine | Porcelain |
| Barber shop | Midnight Counter | Matchday |
| Contractor / roofing / landscaping / auto | Fieldstone | Ledger |
| Cleaning / home services | Tidewater | Fieldstone |
| Clinic / dental / wellness / yoga | Porcelain | Tidewater |
| SaaS / software / IT / engineering | Blueprint | Ledger |
| Logistics / manufacturing / wholesale / B2B | Ledger | Blueprint |
| Boutique retail / florist / jeweler | Heritage Wine | Market Fresh |
| Sports retail / sneakers / streetwear | Matchday | Ledger |
| Gym / martial arts / dance / athletics | Matchday | Fieldstone |
| Venue / events / festival / e-sports | Matchday | Midnight Counter |
| Fast-casual / food truck / late-night counter | Market Fresh | Matchday |
| Insurance / accounting / legal (local) | Tidewater | Blueprint |
| Community org / nonprofit | Tidewater | Market Fresh |

**Tiebreakers**, in order:
1. *Does the business sell energy?* Speed, sweat, crowds, youth, the event, the drop — if the
   brand's core promise is kinetic, route to **Matchday regardless of category**: a bakery
   hyping a weekend drop, a barber with street energy, a product launch. Conversely, never
   Matchday when the trust cue is calm (medical, legal, luxury-quiet) — energy reads as noise
   there. This is a register question, not an industry question; the table's industry rows are
   only the default answer to it.
2. *Evening or daytime business?* Evening → the dark direction of the pair.
3. *Premium or value positioning?* Premium → the more restrained direction (Porcelain,
   Heritage Wine, Midnight Counter). Value → the sturdier one (Fieldstone, Ledger, Market Fresh).
4. *Heritage or modern self-image?* Heritage → serif-led (Heritage Wine, Midnight Counter).
   Modern → sans/mono-led (Blueprint, Ledger, Porcelain, Matchday).

If the brief names an aesthetic ("make it feel like a 1950s diner"), the brief wins — use the
nearest direction as the scaffolding and bend it.

---

<a name="1-heritage-wine"></a>
## 1. Heritage Wine

*A well-kept establishment with history. Cream paper, dark wood, one glass of good red.*

**Use for:** salons, bistros, bakeries, boutiques, florists, B&Bs, anything family-run and
proud of it. **Avoid for:** tech, logistics, anything that should feel fast or clinical.
**Voice:** warm and assured; first person plural used sparingly; sentences that could be said
across a counter.

### Tokens

```css
:root {
  --paper: #f7f2ec;        /* page background */
  --paper-deep: #eee4da;   /* alternate section background */
  --white: #fffdfb;        /* cards, raised surfaces */
  --ink: #181513;          /* primary text */
  --espresso: #2b211d;     /* dark inversion section bg */
  --accent: #743c48;       /* wine — CTAs, em-accents, eyebrows */
  --accent-deep: #572832;  /* hover, small accent text */
  --rose: #c89083;         /* graphics/washes only, never text */
  --gold: #b9935f;         /* stars, thin borders only, never body text */
  --muted: #675a53;        /* secondary text */
  --line: rgba(24, 21, 19, 0.14);
  --shadow: 0 28px 80px rgba(43, 33, 29, 0.15);
  --radius-s: 12px; --radius-m: 20px;
  --radius-arch: 190px 190px 24px 24px;  /* the arch crop */
}
```

Contrast: `--ink`/`--muted` on `--paper` and `--accent` on `--paper` all pass AA for body text.
`--rose` and `--gold` do not — keep them decorative.

### Type

Display: `Georgia, "Iowan Old Style", "Times New Roman", serif` at **weight 400, never bold**,
letter-spacing −0.04 to −0.05em, line-height ≤ 1.0 at hero size. Italic `<em>` on 1–3 words per
display heading, colored `--accent`. Text: system sans stack, 16–17px, line-height 1.7.
Caption/eyebrow: 10–11px, 700–800, letter-spacing 0.15–0.19em, uppercase.

### Shape & texture

Hairline rules (`--line`), generous whitespace, one radial blush orb
(`radial-gradient(circle, rgba(200,144,131,.26), transparent 66%)`) bleeding off a corner.
Images cropped in arches or soft rectangles, thick paper-colored borders on inset photos,
a slight −3° rotation on one small frame. Ghost monogram: the brand initial in Georgia italic
at ~110px, `--accent` at 13% opacity, floated behind content.

### Motion

Soft: 250ms ease hovers (translateY(−2px) + shadow deepen), one slow marquee ticker,
underline-grow on nav links. Nothing bounces.

### Signature (mandatory)

The **arched hero portrait + ghost monogram**: main hero image in the arch crop with a bottom
scrim, brand initial ghosted behind, one small rotated polaroid-style secondary image overlapping
the arch's corner.

---

<a name="2-fieldstone"></a>
## 2. Fieldstone

*Rugged competence. A crew that shows up on time with the right tools.*

**Use for:** contractors, roofing, excavation, landscaping, auto repair, moving, welding,
gyms. **Avoid for:** spas, fine dining, bridal, anything delicate.
**Voice:** short declaratives. Numbers over adjectives. "We pour, grade, and finish." No
exclamation points.

### Tokens

```css
:root {
  --bone: #f1ede4;         /* page background */
  --card: #faf8f2;         /* raised surfaces */
  --spruce: #1c2b25;       /* dark sections, image duotone overlay */
  --spruce-deep: #12201b;  /* footer, deepest inversion */
  --ink: #161a17;          /* primary text */
  --muted: #5c6259;        /* secondary text */
  --accent: #b4531d;       /* ember orange — large text, buttons, marks */
  --accent-deep: #8a3c12;  /* small accent text, hover */
  --line: rgba(22, 26, 23, 0.16);
  --rule: #161a17;         /* heavy 3px structural rules */
  --shadow: 0 20px 50px rgba(18, 32, 27, 0.16);
  --radius: 6px;
}
```

Contrast: use `--accent-deep` (not `--accent`) for accent text under ~24px on `--bone`.

### Type

Display: `"Avenir Next Condensed", "Arial Narrow", "Helvetica Neue", sans-serif` at 700–800,
uppercase, letter-spacing 0 to +0.01em, tight leading. Text: system sans. Numerals and specs in
`ui-monospace, "SF Mono", Menlo, Consolas, monospace`. Webfont upgrade (framework mode):
Archivo Expanded / Barlow Condensed.

### Shape & texture

3px solid `--rule` borders as structure (top of cards, under section heads). Stat badges:
2px-bordered boxes, mono numerals. Photography duotoned by a
`linear-gradient(rgba(28,43,37,.35), rgba(28,43,37,.35))` overlay so every image sits in the
palette. Minimal radius. One diagonal-cut section edge or hazard-stripe rule used exactly once.

### Motion

Almost none. Instant hover state swaps (background/border), no floating, no parallax. The
stillness *is* the trustworthiness.

### Signature (mandatory)

**Outlined process numbers over a spec strip**: a 01 / 02 / 03 process row where the numerals
are huge (80px+) outlined type (`-webkit-text-stroke: 2px var(--ink); color: transparent;`
with a solid fallback), sitting above a full-width bordered strip of real facts (services,
service area, hours).

---

<a name="3-porcelain"></a>
## 3. Porcelain

*A quiet room. Nothing on the counter that doesn't belong there.*

**Use for:** spas, clinics, dental, physio, yoga/pilates, aesthetic medicine, high-end studios,
minimal portfolios. **Avoid for:** value trades, fast food, anything loud.
**Voice:** quiet second person. "You arrive. We take it from there." No exclamation points,
no superlatives.

### Tokens

```css
:root {
  --porcelain: #fbfaf8;    /* page background */
  --mist: #f1efeb;         /* alternate section background */
  --ink: #2a2d2c;          /* primary text */
  --muted: #70756f;        /* secondary text */
  --accent: #5f7a6a;       /* eucalyptus — headings-scale text, buttons */
  --accent-deep: #42594c;  /* small accent text, hover */
  --line: rgba(42, 45, 44, 0.10);
  --shadow: 0 30px 90px rgba(42, 45, 44, 0.10);
  --radius: 24px;
}
```

Contrast: `--accent` is fine at 18px+; use `--accent-deep` for smaller accent text.

### Type

Display: `"Avenir Next", "Helvetica Neue", system-ui, sans-serif` at **weight 300–400,
lowercase**, generous size, letter-spacing −0.01em, line-height 1.15. Text: same family at 400 —
this is the one direction where display and text may share a family; contrast comes from weight
and scale. Eyebrows: 10px, 600, +0.22em tracking, uppercase — the only uppercase on the page.

### Shape & texture

Whitespace is the texture: section padding at the top of the scale (clamp to ~150px), content
width capped near 1040px, one image per section at most. Hairline rules. Images float off-grid
with the large radius and enormous margin. No borders on cards — separation by background shift
(`--porcelain` ↔ `--mist`) only.

### Motion

Slow and few: 600ms opacity + 12px rise reveals, one per section, staggered ~80ms. Nothing on
hover except underlines and a gentle shadow.

### Signature (mandatory)

The **one-word hero**: a single lowercase word or 3–4 word phrase set huge
(clamp(64px, 11vw, 150px)) against emptiness, one serene image floating beside or below it,
off-center. The restraint is the statement.

---

<a name="4-midnight-counter"></a>
## 4. Midnight Counter

*Low light, brass fittings, the menu handed to you like a secret.*

**Use for:** bars, steakhouses, evening restaurants, barber shops, tattoo studios, jazz venues,
whisky/wine retail. **Avoid for:** daycare-adjacent, medical, budget services.
**Voice:** fewer words, all of them chosen. Menu-card cadence: "Cast-iron ribeye. Bone marrow
butter."

### Tokens

```css
:root {
  --char: #171310;         /* page background */
  --char-lift: #211b17;    /* cards, raised surfaces */
  --cream: #f2e8da;        /* primary text */
  --cream-dim: rgba(242, 232, 218, 0.66);  /* secondary text */
  --accent: #d9a441;       /* candle amber — accents, prices, rules */
  --accent-deep: #b3822a;  /* hover */
  --brass: rgba(217, 164, 65, 0.34);       /* hairline borders */
  --line: rgba(242, 232, 218, 0.14);
  --shadow: 0 30px 80px rgba(0, 0, 0, 0.5);
  --radius: 10px;
}
```

Contrast: `--cream` and `--accent` on `--char` both pass AA. Never set long body copy in
`--accent`.

### Type

Display: `Georgia, "Iowan Old Style", Didot, serif`, weight 400, with italic amber `<em>`
accents. Text: system sans in `--cream-dim`, 16px/1.7. Prices and small labels:
`font-variant-numeric: tabular-nums`, letter-spaced caps in `--accent`.

### Shape & texture

Brass hairlines (`--brass`) as dividers. The menu set like a printed card: centered column,
dotted leaders between item and price (`border-bottom: 1px dotted var(--brass)` on a flex
spacer). Photography dark and warm; scrim
`linear-gradient(180deg, rgba(23,19,16,.2), rgba(23,19,16,.75))` so images melt into the page.
A faint radial amber glow behind the hero
(`radial-gradient(ellipse at 30% 20%, rgba(217,164,65,.12), transparent 60%)`).

### Motion

Slow fades (400–600ms). Amber underline grows on hover. Nothing fast, nothing that bounces.

### Signature (mandatory)

**The menu as centerpiece**: a mid-page section where the actual offer (menu, services + prices,
pour list) is set as beautiful typography — serif item names, dotted leaders, amber prices —
treated as the hero of the page, not a table dumped in.

---

<a name="5-blueprint"></a>
## 5. Blueprint

*A drafting table: everything measured, labeled, and to scale.*

**Use for:** SaaS, software, IT services, engineering firms, architects, technical consultancies,
precision manufacturing. **Avoid for:** food, beauty, anything sensory-first.
**Voice:** spec-sheet precision, present tense. "Deploys in 40 seconds. Rolls back in one."

### Tokens

```css
:root {
  --paper: #f6f7f4;        /* page background */
  --panel: #ffffff;        /* cards */
  --grid: rgba(39, 73, 200, 0.07);  /* background grid lines */
  --ink: #182031;          /* primary text */
  --muted: #5b6472;        /* secondary text */
  --accent: #2749c8;       /* drafting blue — links, marks, CTAs */
  --accent-deep: #1c3697;  /* hover */
  --line: rgba(24, 32, 49, 0.14);
  --shadow: 0 18px 44px rgba(24, 32, 49, 0.10);
  --radius: 4px;
}
```

Grid background:
`background-image: linear-gradient(var(--grid) 1px, transparent 1px), linear-gradient(90deg, var(--grid) 1px, transparent 1px); background-size: 32px 32px;`
— apply to the page or hero only, not every section.

### Type

Display: `system-ui, "Helvetica Neue", sans-serif` at 700, letter-spacing −0.03em. Text: system
sans. Labels, captions, figure numbers: `ui-monospace, "SF Mono", Menlo, Consolas, monospace`,
11px, uppercase, +0.08em — the mono is what sells the drafting-table feel. Webfont upgrade:
Space Grotesk display + IBM Plex Mono.

### Shape & texture

Dimension-line annotations: a thin `--line` rule with short perpendicular end ticks and a
centered mono label (pure CSS: borders + a positioned span). Figure numbering ("FIG. 01 —
DASHBOARD") as mono eyebrows. Crosshair/plus marks at grid intersections near the hero. Corners
square-ish; panels get the 4px radius and a 1px `--line` border.

### Motion

Precise and quick: 150ms linear state changes, lines that draw in (scaleX from 0) on reveal.
No easing theatrics.

### Signature (mandatory)

**The annotated artifact**: the hero image/screenshot/diagram framed with dimension lines and
mono labels calling out 2–3 real capabilities, like a technical drawing of the product.

---

<a name="6-market-fresh"></a>
## 6. Market Fresh

*Morning market: crates, chalkboards, paper tags, things picked today.*

**Use for:** cafés, bakeries, delis, farm-to-table, grocers, juice bars, breakfast spots,
food trucks. **Avoid for:** law firms, evening fine dining (that's Midnight Counter).
**Voice:** first-name friendly, sensory nouns. "Sourdough out at 7. Gone by 10."

### Tokens

```css
:root {
  --flour: #faf5ec;        /* page background */
  --crate: #f0e6d4;        /* alternate section background */
  --board: #27302a;        /* chalkboard panel bg + dark inversion */
  --ink: #232620;          /* primary text */
  --muted: #6a6d60;        /* secondary text */
  --accent: #b3402f;       /* tomato — or swap family for leaf #3f6b35 */
  --accent-deep: #8c2f22;
  --line: rgba(35, 38, 32, 0.15);
  --shadow: 0 18px 46px rgba(35, 38, 32, 0.14);
  --radius: 14px;
}
```

Pick ONE accent family per build — tomato **or** leaf, never both.

### Type

Display: `Georgia, "Iowan Old Style", serif` at **700** (the chunky cousin of Heritage Wine's
400 — weight changes the character completely), tight leading. Text: system sans. Tags and
prices: 11px caps, 800, wide tracking, or mono.

### Shape & texture

Ticket/tag chips: dashed 1px borders (`border: 1px dashed var(--line)`), tiny rotation (−2° to
2°) on one or two price tags. A chalkboard panel: `--board` background, `--flour` text, used
once. Dashed section dividers. Hand-placed feel: one element per section allowed to break the
grid slightly.

### Motion

Playful but small: hover straightens a rotated tag (rotate to 0), 250ms. A slow item ticker
("today: sourdough ✕ rye ✕ morning buns") if the offer rotates daily.

### Signature (mandatory)

**The board**: a chalkboard-styled panel listing today's real offer (menu, hours, seasonal
items) in cream type on `--board`, set mid-page like the shop's actual A-frame sign.

---

<a name="7-ledger"></a>
## 7. Ledger

*A well-kept ledger: ruled lines, real numbers, no ornament.*

**Use for:** logistics, manufacturing, wholesale, B2B services, industrial suppliers,
commercial real estate. **Avoid for:** anything warm/sensory; weak-data businesses (this
direction runs on real specifics — with nothing to tabulate it collapses into the generic
"broadsheet" look).
**Voice:** verbs, capacities, tolerances. "40,000 sq ft. Same-day dispatch. Two borders daily."

### Tokens

```css
:root {
  --bone: #f4f2ed;         /* page background */
  --panel: #fbfaf7;        /* raised surfaces */
  --ink: #151515;          /* text AND borders — structure is drawn in ink */
  --muted: #585858;
  --accent: #c14a10;       /* signal orange — sparingly: marks, key numbers */
  --accent-deep: #963807;  /* small accent text */
  --line: #151515;         /* 1px solid ink borders */
  --soft-line: rgba(21, 21, 21, 0.16);
  --shadow: none;          /* flatness is the point */
  --radius: 0;
}
```

### Type

Display: `system-ui, "Helvetica Neue", Arial, sans-serif` at 800, uppercase or tight sentence
case, −0.02em. All numerals: `ui-monospace, "SF Mono", Menlo, monospace` with tabular figures.
Text: system sans. Webfont upgrade: Söhne/Inter Tight + a duplexed mono.

### Shape & texture

Visible 1px `--line` borders forming the layout — cells, not cards. Zero radius, zero shadow.
Index numbers (001, 002) on rows *only where the content is really enumerable*. Full-width
ink-on-bone inversion for one section. Generous cell padding keeps it from feeling like a
spreadsheet.

### Motion

None beyond instant hover inversions (bone↔ink). This direction is still.

### Signature (mandatory)

**The spec table**: capabilities/fleet/capacity presented as a beautifully set table — mono
numerals, ruled lines, right-aligned figures — positioned as the page's proof centerpiece.
Real data only; if the brief gives no numbers, choose a different direction.

---

<a name="8-tidewater"></a>
## 8. Tidewater

*Clean water, soft light, someone dependable looking after things.*

**Use for:** cleaning services, home care, insurance/accounting (local), childcare-adjacent,
wellness-lite, community orgs, coastal anything. **Avoid for:** nightlife, heavy industry.
**Voice:** reassuring and concrete. Promises with edges: "In and out by noon. Same team every
visit."

### Tokens

```css
:root {
  --foam: #f4f8f6;         /* page background */
  --foam-deep: #e6efeb;    /* alternate section background */
  --sea: #16352f;          /* dark sections, footer */
  --ink: #1b2a26;          /* primary text */
  --muted: #5f6f6a;        /* secondary text */
  --accent: #2c5c52;       /* deep sea green — CTAs, accent text */
  --accent-warm: #c9a15c;  /* sparing warm counterpoint: stars, one badge */
  --line: rgba(27, 42, 38, 0.12);
  --shadow: 0 24px 60px rgba(22, 53, 47, 0.12);
  --radius: 22px;
}
```

Contrast: `--accent` passes AA on `--foam` for text; `--accent-warm` is decorative only.

### Type

Display: `"Avenir Next", "Trebuchet MS", system-ui, sans-serif` at 600, sentence case, normal
tracking — friendly, not corporate. Text: system sans 16–17px/1.7. Eyebrows: 10–11px caps in
`--accent`.

### Shape & texture

Layered soft bands: 2–3 stacked full-width washes
(`linear-gradient(180deg, var(--foam), var(--foam-deep))`) like a shoreline. Generous radii,
pill-shaped chips for service areas ("Cornwall · Long Sault · Ingleside"). One single-curve SVG
wave divider used once, subtle. Checklist rows with inline SVG checks in `--accent`.

### Motion

Gentle 400ms rise-and-fade reveals; pills that lift 2px on hover. Calm, never bouncy.

### Signature (mandatory)

**The shoreline stack + area pills**: hero built from layered soft gradient bands with a
cluster of pill badges naming the real service areas — the page literally shows "we cover your
neighborhood."

---

<a name="9-matchday"></a>
## 9. Matchday

*Kickoff in ten minutes. The page leans forward.*

**Use for:** any brief whose promise is **energy** — sports retail, gyms, martial arts, dance
studios, sneaker/streetwear shops, venues, festivals, e-sports, product drops and launch pages,
late-night counters, a barber with street energy. This is a register, not an industry: the
question is "does this brand sell motion?", and any category can answer yes.
**Avoid for:** medical, legal, finance, luxury-quiet — anywhere the trust cue is calm.
**Voice:** present tense, second person, short. "Dimanche, tu joues." Urgency only from real
facts (real hours, real dates, real drops) — a fake countdown is an invented claim.

### Tokens

```css
:root {
  --court: #f4f2ec;        /* chalk-white page background */
  --panel: #ffffff;        /* cards */
  --navy: #14204a;         /* kit navy — dark sections, big type */
  --navy-deep: #0c1430;    /* footer, deepest inversion */
  --ink: #131a33;          /* primary text */
  --muted: #59607a;        /* secondary text */
  --accent: #d81f2a;       /* signal red — display sizes, buttons, chevrons */
  --accent-deep: #a8141e;  /* small accent text, hover */
  --line: rgba(19, 26, 51, 0.15);
  --shadow: 0 22px 55px rgba(12, 20, 48, 0.16);
  --radius: 8px;
}
```

Contrast: `--accent` on `--court` sits right at the AA line — display sizes only; small accent
text uses `--accent-deep` (6.7:1). White on `--accent` passes for buttons; everything on
`--navy` is easy. Re-hue toward the club's real colors freely — kit colors are exactly the
brand colors this direction wants.

### Type

Display: `"Avenir Next Condensed", "Arial Narrow", "Helvetica Neue", sans-serif` at 700–800,
**italic, uppercase** — the forward lean is the speed cue. Tight leading, letter-spacing 0.
Numerals: `ui-monospace, "SF Mono", Menlo, Consolas, monospace` with tabular figures — the
scoreboard voice for stats, hours, prices. Body: system sans. Webfont upgrade: Archivo
Expanded or Barlow Condensed italic.

### Shape & texture

Diagonal geometry everywhere the palette allows: chevron pattern strips built from
`repeating-linear-gradient(45deg, var(--accent) 0 12px, transparent 12px 28px)`, section
edges cut at an angle (a skewed divider or `clip-path` polygon — one device, reused),
oversized numerals or the brand mark cropped and bleeding off the dark section's edge.
Imagery duotoned toward `--navy` with a red glow accent so photos join the kit. Badge/pill
chips for disciplines, sizes, dates.

### Motion (this direction's floor is high — ship all of it)

A fast marquee ticker (18–24s) of real items — disciplines, brands, this week's drop. A hero
load sequence: headline lines slide up staggered ~70ms. Scroll reveals on cards, staggered.
Hover: instant inversion (court↔navy or accent fill) with a 2px translate — snappy, never
floaty. All of it dies under `prefers-reduced-motion`.

### Signature (mandatory)

**The diagonal band**: a full-width angled strip — chevron-patterned or navy with outlined
mono numerals — carrying content the page hasn't said yet (this week's arrivals, the
disciplines stocked, the real match-day hours), cutting across the page's middle third like
a sash. It moves (marquee or reveal) unless reduced-motion says otherwise.

---

<a name="adaptation"></a>
## Adaptation rules

1. **Re-hue, don't restructure.** If the brief supplies brand colors, keep the direction's
   token *roles* (paper/ink/accent/line/shadow) and swap hue families. Keep lightness
   relationships: a light paper stays within ±5% of the original's lightness, the accent stays
   dark enough for AA text or gets a `--accent-deep` partner.
2. **Check contrast after any change.** Body text ≥ 4.5:1 against its background; large display
   text ≥ 3:1. When in doubt, darken the accent, never lighten the ink.
3. **The signature survives adaptation.** Whatever else the brief changes, build the
   direction's signature element — that's where the memorability lives.
4. **Imagery obeys the direction.** Warm directions get warm-graded images; Fieldstone duotones;
   Midnight Counter darkens. An off-palette image breaks the world — fix it with the
   direction's overlay/scrim before considering new imagery.
5. **When two directions both fit, pick the one whose signature the business can honestly
   fill.** Ledger needs real numbers; Midnight Counter needs a real menu; Tidewater needs real
   service areas. The signature that would require inventing facts is the wrong signature.
6. **Type stacks are part of the direction — copy them verbatim, in order.** The first family
   carries the intended cut: Fieldstone's display is condensed because "Avenir Next Condensed"
   comes first; put a regular-width family ahead of it and every heading silently un-condenses.
   `font-stretch` does not rescue a stack whose first family has no condensed cut.
7. **The motion character is part of the direction — a floor, not just a ceiling.** Shipping
   Heritage Wine without its ticker, or Matchday without its marquee and staggered reveals, is
   the same drift as swapping the palette. Equally, adding motion to a still direction
   (Fieldstone, Ledger) breaks it — their stillness is the choice. Build exactly the motion
   the direction names.
8. **An accent-colored background changes the contrast math.** Light paper/bone text on a
   mid-value accent (`--accent`) usually passes only at display sizes; body-size and caption
   text on an accent wash goes in `--ink` or sits on the `--accent-deep` variant instead.
   Re-check 4.5:1 whenever text lands on anything that isn't the direction's paper or dark
   surface.
