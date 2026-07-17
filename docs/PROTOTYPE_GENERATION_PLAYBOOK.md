# Prototype Generation Playbook

This is the durable creative and technical brief for every future prototype agent. The goal is simple: new prototypes must be as strong as, or stronger than, the best approved prototypes already in `data/prototypes/` and on `/showcase`.

## Required operating mode

Before generating anything, read:

- `docs/PROTOTYPE_QA.md`
- `docs/PROTOTYPE_RULES.md`
- `docs/SHOWCASE_RULES.md`
- `.agents/skills/premium-saas-design/SKILL.md` — the define→build→review→refine framework, visual thesis, composition, showcase-grade craft (repo-specific application at the end)
- `.agents/skills/frontend-design/SKILL.md` — distinctive art direction + the self-contained HTML/CSS build contract, responsive, accessibility, and the pre-push cleanliness gate (repo-specific application at the end)
- `.agents/skills/color-expert/SKILL.md` — palette/ramp construction and contrast when building the per-brand token system

These skills are vendored into the repo so every agent — local, container, or CI — has them; do not rely on machine-specific skill paths.

Use the strongest approved prototypes as visual references for craft, not as templates to copy. Inspect their hierarchy, spacing, typography, imagery, responsive behavior, and conversion path before choosing a direction.

## Creative brief for each prototype

1. Define one clear visual thesis before writing code: editorial, cinematic, tactile, architectural, playful, or another intentional direction that fits the industry and lead.
2. Define the page job in one sentence: what should a visitor understand, feel, and do within the first ten seconds?
3. Build a complete landing page, not a card collection: announcement or brand cue, hero, proof or trust, services, process or story, and a decisive final CTA.
4. Personalize from verified lead data only. Never invent testimonials, awards, reviews, years in business, addresses, phone numbers, pricing, guarantees, or service claims.
5. Use real-looking, industry-specific imagery. Prefer a small number of strong images with useful alt text over a gallery of generic stock-like placeholders.
6. Use a disciplined type system: one display face plus one readable text face at most, a deliberate color system, clear contrast, and generous whitespace.
7. Add restrained motion only when it improves comprehension: a reveal, a subtle hover, or a focused scroll transition. Respect `prefers-reduced-motion`.
8. Make mobile a first-class composition at 390px, not a desktop layout squeezed into a narrow screen.
9. Keep the demo conversion path obvious. Every locked CTA should explain the next step and use the same safe demo behavior.

## Recommended MiniMax brief

The generation prompt should explicitly ask MiniMax M3 to act as a senior art director, brand strategist, UX writer, and front-end designer. Include the lead's verified facts, the visual thesis, the page job, the image filenames, and the required sections. Ask for only clean HTML, with no reasoning, markdown fences, prompt text, or invented facts. Mention that the output will be rejected if it looks generic, uses fake proof, or does not have a coherent responsive layout.

The short prompt may be reused, but it must not omit the visual thesis and page job. A concise structured brief is more useful than asking for “an amazing website” alone.

## Quality gate

Generation is not completion. A prototype remains `pending_review` until all gates pass:

- No model commentary, reasoning, prompt text, markdown fences, or placeholder copy is visible.
- Every referenced asset exists, is a valid image, and is larger than 5KB.
- The page renders cleanly at 1440×900 and 390×844, with no overflow, broken images, or dead primary actions.
- The page has a clear first viewport, industry-specific copy, accessible headings/labels/alt text, and a useful mobile layout.
- Desktop and mobile Playwright screenshots are captured and each is larger than 10KB.
- `tsc --noEmit` and the relevant build/lint checks pass.
- An operator has visually reviewed the screenshots before `showcase_eligible` or `generation_status: completed` is set.

Score the page from 0–5 for visual hierarchy, industry specificity, copy quality, imagery, responsive behavior, accessibility, interaction polish, and technical cleanliness. Any blocker fails the review; otherwise target at least 32/40 before showcase eligibility.

## Failure policy

Fail closed. Never silently replace a missing image with a 1×1 pixel, never mark a generated page completed before browser QA, and never publish a generic fallback just because the model or image API timed out. Record the failure, fix or regenerate it, and rerun the full gate.

## Handoff record

For each generated prototype, retain the model name, compact generation brief, image prompts, QA date, screenshot paths, score, reviewer decision, and any follow-up revision request. This makes the best work reusable by the next agent without copying brittle HTML.
