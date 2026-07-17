# Quality gate

The page being rendered is not the finish line; this gate passing is. Run the three tiers in
order. When anything fails, apply the matching fix from the fix table, then **re-run the whole
gate** — fixes have side effects.

## Contents

1. [Tier 1 — mechanical checks](#tier1)
2. [Tier 2 — render scan](#tier2)
3. [Tier 3 — judgment, made mechanical](#tier3)
4. [Fix table](#fixes)

<a name="tier1"></a>
## Tier 1 — Mechanical checks (run the script)

```bash
python3 scripts/review_page.py path/to/index.html            # framework/page mode
python3 scripts/review_page.py path/to/index.html --self-contained   # single-file mode
```

The script needs only the Python standard library. It reports `FAIL` / `WARN` / `PASS` lines
and exits non-zero on any FAIL.

| Check | Level | Why |
|---|---|---|
| doctype, `lang`, viewport, non-empty `<title>` | FAIL | baseline correctness |
| meta description present | WARN | share/SEO hygiene |
| exactly one `h1` | FAIL | hierarchy |
| hex colors outside `:root` | FAIL | token discipline is what keeps 300 decisions coherent |
| > 3 font families | FAIL | two faces + optional mono, remember |
| banned phrases (see copywriting.md) / lorem / TODO / placeholder | FAIL | generic-copy tell |
| emoji in visible text | FAIL | emoji-as-icons is the #1 cheap-page tell |
| `<img>` missing `alt` | FAIL | accessibility floor |
| external images / CSS / JS / fonts | WARN (FAIL with `--self-contained`) | portability contract |
| animation/transition present but no `prefers-reduced-motion` | FAIL | accessibility floor |
| no `:focus` styles | WARN | keyboard users |
| fixed widths > 600px in CSS | WARN | overflow risk at 390px |
| model-leak text ("Here is…", markdown fences) | FAIL | leaked reasoning ships to clients |
| "Learn More" / "Submit" / "Click Here" on controls | WARN | CTA quality |

Every FAIL gets fixed. Every WARN gets fixed or justified in one written line ("external map
embed is intentional — framework mode"). No silent WARNs.

If you cannot run Python, apply the same table manually with grep/reading — the checks are all
literal enough to do by hand.

<a name="tier2"></a>
## Tier 2 — Render scan

Open or screenshot the page at **390×844** and **1440×900** (both, always — pages that were
only seen at desktop width are broken on phones by default). Walk this list top to bottom:

1. No horizontal scrollbar at 390px; nothing clipped at either width.
2. Hero headline: no orphaned single word on its own line; text over imagery legible
   (the scrim is doing its job).
3. Every image loads, has a deliberate crop (no beheaded portraits, no accidental centering),
   and sits in the direction's palette.
4. Spacing rhythm: consistent gaps between sections; nothing cramped against a section edge;
   nothing floating in unexplained emptiness.
5. Adjacent sections have distinct backgrounds; the one inversion section is present and lands
   mid-page.
6. Buttons and links: hover states work; focus ring visible when tabbing; tap targets
   comfortable at 390px.
7. The signature element is present, prominent, and the single most memorable thing on the page.
8. The accent color: count its appearances in one viewport — more than ~6 means it has stopped
   reading as intentional.
9. Footer is finished (no dead icons, no placeholder links).
10. Read every word on the page once, out loud in your head, as the business owner — anything
    you'd be embarrassed to say to a customer gets rewritten.

<a name="tier3"></a>
## Tier 3 — Judgment, made mechanical

### The rubric

Score 0–5 on each dimension. **Pass = total ≥ 32/40 AND no dimension below 3.** Anchors keep
the scoring honest:

| Dimension | 3 (acceptable) | 5 (excellent) |
|---|---|---|
| Visual hierarchy | Clear reading order; heads distinct from body | Eye lands exactly where intended at every scroll stop |
| Distinctiveness | Follows one direction consistently | Signature element is memorable; page couldn't be mistaken for a template |
| Copy | Specific, no banned phrases | Every line passes the portability test; voice matches direction |
| Imagery & art direction | All images treated, cropped, in palette | Imagery feels commissioned for this business |
| Layout & rhythm | One scale, backgrounds alternate, nothing broken | Asymmetry and density deliberately varied; page has a pulse |
| Responsiveness | Clean at 390 and 1440 | Mobile feels designed, not merely collapsed |
| Accessibility | AA contrast, alt, focus, reduced-motion | Semantics, keyboard flow, and touch comfort throughout |
| Technical cleanliness | Tier 1 passes | Tokens/utilities so consistent the CSS reads as a system |

Score dimensions independently; do not let one strong dimension pull up your read of another.
A total in the 26–31 range means specific dimensions need work — fix those, don't polish the
already-strong ones.

### The genericism interrogation

Three questions, answered honestly:

1. **Cover the business name.** Could this page belong to any business in the industry? If yes:
   the fix is *never* more decoration — it's specificity. Swap generic nouns for the fact
   sheet's concrete ones; make one image unmistakably about this business; re-anchor the
   signature element in the offer.
2. **Swap the industry.** Would this design work unchanged for a dentist / a bakery / a SaaS?
   If yes, the direction isn't being executed, only its colors are. Rebuild the signature
   moment.
3. **Direction fidelity.** Open `design-directions.md` at your chosen direction and diff:
   tokens verbatim (or documented re-hue)? Type treatment as specified? Signature present?
   Motion character respected? Any drift, fix toward the direction, not away.

### The Chanel pass

Last step, always: remove one decorative element — the least load-bearing rule, orb, badge, or
flourish. If removing it hurts the page, put it back and you're done; if the page is fine
without it, it was noise, and look for a second one.

<a name="fixes"></a>
## Fix table

| Symptom | Fix |
|---|---|
| Page feels flat / lifeless | Add the one dark-inversion section; give the signature moment full width; vary section density (one dense, one airy) |
| Page feels cluttered | Chanel pass ×2; merge service cards to 3–4; enforce the accent budget |
| Feels like a template | Re-run the genericism interrogation fixes: concrete nouns in, signature rebuilt around the actual offer |
| Hero is weak | Wrong archetype — if the image is mediocre switch to C (typographic); if strong, commit to B with a real scrim |
| Copy reads as brochure | Rewrite failing lines with a fact-sheet noun; delete every adjective that isn't earned by a noun |
| Colors feel random | Hunt hex outside `:root` (script finds them); re-apply the direction's usage notes (accents ≠ body text) |
| Text illegible on image | Scrim formula from page-anatomy.md; or move text off the image entirely |
| Mobile is cramped | Re-check the spacing scale is applied at base styles, not just desktop; stack order = reading order; retest 390px |
| Sections blur together | Alternate background tokens; add the section-head pattern (eyebrow + h2 + lede) uniformly |
| Looks "AI-generated" | Usual culprits, in order: emoji icons, centered-everything, accent overuse, uniform card grids, banned-phrase copy. Fix all five |
| No proof and it shows | Process-proof section (01/02/03), real hours/areas — never invent testimonials |
| Gate keeps failing on re-runs | Stop patching; rebuild the failing section from its recipe in page-anatomy.md — recipes are cheaper than archaeology |
