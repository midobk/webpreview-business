---
name: frontend-craft
description: Use when writing or cleaning the HTML/CSS for a local-business landing-page prototype (single self-contained index.html) and when running the pre-push technical gate. Covers semantic structure, a self-contained CSS token system, responsive layout, fluid type, accessible markup, restrained motion, image handling, and the HTML-cleanliness checks that stop leaked model text or broken assets from shipping.
---

# Frontend Craft

The implementation half of the prototype standard; pair it with `premium-web-design` (art direction) and the gates in `docs/PROTOTYPE_QA.md`. A prototype is a **single self-contained `data/prototypes/<slug>/index.html`** with inline `<style>` and local images under `images/` — no build step, no external CSS/JS/font CDNs, no framework. It renders inside a sandboxed iframe (`sandbox="allow-scripts"`), so it must stand entirely on its own.

## Document skeleton

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{Business Name} — Demo Preview</title>
  <meta name="description" content="Unofficial preview concept for {Business} — {industry} in {city}.">
  <meta name="robots" content="noindex,nofollow">
  <style>/* reset + tokens + components, all inline */</style>
</head>
<body><!-- semantic sections --></body>
</html>
```

Always: `lang`, viewport, `noindex,nofollow` (a preview must never get indexed), a reset (`*,*::before,*::after{box-sizing:border-box}`, zeroed body margin, `img{max-width:100%;height:auto}`).

## Self-contained CSS token system

Declare the brand palette and scale once at `:root`, then reference tokens everywhere — this is what makes a page read as designed rather than generated:

```css
:root{
  --ink:#181513; --paper:#f7f2ec; --accent:#743c48; --accent-2:#b9935f;
  --line:rgba(24,21,19,.14); --shadow:0 28px 80px rgba(43,33,29,.15);
  --serif:Georgia,"Times New Roman",serif;
  --sans:Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
}
```

Rules: no stray hex values outside `:root`; system/web-safe font stacks only (no `@import`/CDN fonts — they violate the iframe CSP and cause FOIT); one display face + one text face; a deliberate type scale rather than random px.

## Layout & responsiveness

- Mobile-first: base styles target ~390px, then layer desktop with `@media (min-width:768px)` / `(min-width:1024px)`.
- Use flexbox/grid for structure; never fixed pixel widths that overflow small screens. Any wide element (tables, wide media) scrolls inside its own `overflow-x:auto` container — the page body must never scroll horizontally.
- Fluid type with `clamp()` for hero headings, e.g. `font-size:clamp(2rem,5vw+1rem,3.5rem)`.
- Section padding scales: generous on desktop (64–120px), tighter but breathing on mobile.
- Tap targets ≥44px; verify no overflow at 390×844 and 1440×900.

## Imagery

- Reference local files only: `./images/hero.jpg`, `./images/section_1.jpg` (the preview route rewrites these to the authorized image endpoint).
- Every image is real (>5KB, valid JPEG/PNG/WebP) — **never** a 1×1 placeholder (this shipped once; see `PROTOTYPE_QA.md` §The Incident).
- Specific, useful `alt` on every content image; `alt=""` only for purely decorative ones.
- Gradient scrim over hero/section imagery so overlaid text meets contrast: `background:linear-gradient(180deg,transparent 54%,rgba(24,21,19,.42)),url('./images/hero.jpg') center/cover;`.

## Accessibility (non-negotiable)

- One `<h1>`, then a correct heading order — no skipped levels, no headings used for sizing.
- Semantic landmarks: `<header> <main> <section> <footer>`; label sections via `aria-labelledby` where useful.
- Text/background contrast ≥ 4.5:1 for body, ≥ 3:1 for large text — check against the tokens.
- Visible `:focus-visible` styles on every interactive element; real `<button>`/`<a>`, not clickable `<div>`s.
- `prefers-reduced-motion: reduce` disables/《snaps》 all animation.
- Decorative looping animation carries no `aria-live` and no semantic meaning.

## Motion

Inline CSS animations/transitions only; keep them few and purposeful (hero reveal, hover lift, one scroll cue). Wrap non-trivial motion so reduced-motion users get the final state immediately:

```css
@media (prefers-reduced-motion: reduce){ *{animation:none!important;transition:none!important} }
```

## Demo lock (every prototype)

Per `PROTOTYPE_RULES` §Watermark + Demo Lock: a fixed demo banner, a soft corner watermark (`{Brand} Preview`), all forms disabled, all CTAs intercepted to a "claim this website" message, no real `tel:`/`mailto:` links, no functioning booking. CTAs use `onclick="alert(...);return false;"` or a locked modal — never a live destination.

## HTML-cleanliness gate (before any push)

The model can leak its own reasoning or prompt text into the output. Before saving/pushing, confirm:

- The first element inside `<body>` is real page content — **no** model commentary, "Here is…", "Certainly", thinking blocks, or `prompt:` text.
- No markdown fences (```), no leftover instruction text, no placeholder copy (`lorem`, `TODO`, `xxx`, "placeholder").
- Every referenced asset exists and is a valid image >5KB.
- Renders clean at 1440×900 and 390×844 — no overflow, broken images, or dead primary actions.
- Desktop + mobile Playwright screenshots captured, each >10KB.
- If app/TS files changed too: `tsc --noEmit` clean and `next build` succeeds.

If any check fails: strip/clean, or regenerate, then rerun the whole gate. **Fail closed** — never publish a generic fallback or placeholder because a dependency timed out (`PROTOTYPE_QA.md` §What NOT to do).
