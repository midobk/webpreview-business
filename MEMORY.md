# MEMORY.md — SiteSprint Agent Memory

> Persistent memory across sessions. Read on startup. Update on learnings.

---

## Critical Lessons

### 2026-06-22 — Prototype Quality Incident (Craftmans Cafe)
**Source:** docs/PROTOTYPE_QA.md

A prototype (Craftmans Cafe) was pushed to GitHub and deployed to Vercel with:
1. AI model reasoning text leaked into the HTML (visible as a wall of text on the page)
2. 1×1 pixel transparent placeholder images instead of real images
3. No visual QA before pushing

The user saw this on the live dashboard. It was embarrassing and unprofessional.

**Rules now enforced (see docs/PROTOTYPE_QA.md):**
- NEVER push a prototype without seeing it rendered in a browser first
- NEVER use placeholder images — generate real ones with image_generate
- NEVER push HTML containing AI model reasoning/thinking text
- ALWAYS run the 5-step QA protocol: HTML cleanliness → image validation → browser rendering → screenshot → git push gate
- ALWAYS verify file sizes on images (must be >5KB, not 68-byte 1×1 PNGs)
- ALWAYS capture a Playwright screenshot before marking generation_status as "completed"

This applies to ALL future prototype generation, no exceptions.

---

## Key Decisions

- Brand name: **Seaway Sites** (confirmed by Mehdi 2026-07-12 — replaces the SiteSprint working name; he bought the domain)
- Domain: purchased by Mehdi (2026-07-12). Exact domain string not yet confirmed in repo — the /v2 landing page assumes seawaysites.ca; verify before wiring DNS/email. (Old note: sitesprint.ca, never registered)
- NOTE: the classic homepage (/), root layout metadata, showcase, admin UI and docs still say "SiteSprint" — site-wide rename pending. /v2 already says Seaway Sites.
- Email provider: AgentMail (API key needed — user has not yet provided one)
- Image generation: OpenAI confirmed working as of 2026-06-22
- Google Gemini: API key suspended, user will provide a new key later
- Outreach: NOT started. User explicitly said do not send emails yet.

---

## User Preferences

- Mehdi wants prototypes to look professional before they hit the live site
- Mehdi wants things pushed to GitHub and verified before deployment
- Mehdi does not want to see broken or unfinished work on the dashboard
- Mehdi will investigate with the main agent why the Craftmans Cafe prototype was broken
- Communication via Telegram
- Timezone: America/New_York (EDT)
- **ALWAYS use MiniMax M3 for prototype HTML generation** (not just write it myself)
- **ALWAYS use relevant installed skills** (frontend, nextjs-expert, react, typescript-mastery, ia-tailwind-css) as reference for prototype code
- **ALWAYS add target business branding** to prototypes (name, address, phone, logo treatment, color theming) so it feels like theirs, not a generic template

## Skills to Use for Prototypes

When generating a prototype, always consult:
- `frontend` skill for landing page patterns, typography, color systems, mobile-first, accessibility
- `nextjs-expert` if building Next.js components
- `react` for React component patterns
- `typescripts-mastery` for TypeScript
- `ia-tailwind-css` if using Tailwind

Read the relevant skill's SKILL.md before writing prototype code. Apply its rules (mobile-first, dramatic typography, 70-20-10 colors, one memorable element, etc.).

---

## User-Reported Live Issues (2026-06-23) — Persisted from Telegram

User flagged 4 issues. All verified against actual repo state. None were previously in MEMORY.md or AGENT_PLAN.md, which is why they weren't being addressed.

### C1. Showcase approve → visibility gap (PARTIAL BUG)
- **Reported:** "When I click approve on the admin dashboard, are the prototypes going to be shared on my website showcase?"
- **Truth:**
  - Dashboard `toggleShowcase()` PATCHes `showcase_approved` ✅
  - `app/showcase/page.tsx` filters: `showcase_approved === true && generation_status === 'completed' && showcase_eligible === true && anonymized === true` ✅
  - **BUT:** On Vercel, the data is read from the build-time bundle (`lib/data-bundle/bundle.ts`), not live `data/prototypes.json`. So approving in the dashboard updates the host filesystem only; the production `/showcase` page reads the stale bundle until the next deploy.
  - **The 2 currently approved prototypes (Seaway Cleaning, Bella's Hair) DO satisfy all 4 conditions** in the bundle — so they should be visible on `/showcase` right now. If they aren't, the bug is elsewhere (check the build bundle commit).
- **Fix options:**
  - Switch to Supabase (schema ready, awaiting credentials) — `lib/supabase.ts` + `lib/data-source.ts`
  - OR: rebuild bundle + redeploy after every approval (hacky, slow)

### C2. Showcase link from landing page (EXISTS, WEAK)
- **Reported:** "Is there a way to allow the visitors to visit the showcase from the landing page"
- **Truth:** YES — footer link `<a href="/showcase">Examples</a>` exists at `app/page.tsx:829`. Header nav on the showcase page itself also has it. But it's buried in the footer.
- **Fix:** Add a prominent "See real examples" CTA in the hero or features section of `app/page.tsx`.

### C3. Screenshots not working (REAL BUG)
- **Reported:** "Why are there no screenshots working?"
- **Truth:** Of 7 prototype directories:
  - `seaway-cleaning-services` — HAS `screenshot.png`, `screenshot-desktop.png`, `screenshot-mobile.png` ✅
  - `bellas-hair-studio` — HAS all 3 ✅
  - `craftmans-cafe` — HAS `screenshot.png` only (no desktop/mobile split)
  - `ramo-sports` — HAS `screenshot.png` only
  - `clean-&-shine-services`, `cornwall-auto-care`, `the-cutting-edge-salon` — **NO screenshots at all** ❌
- **Root cause:** `scripts/screenshot/capture.js` is the script that does it. It iterates over directories in `data/prototypes/`, calls `page.goto('http://localhost:3000/preview/<slug>')` and screenshots. This:
  1. Requires a **local Next dev server running on :3000** — won't work in cron or Vercel
  2. Doesn't get triggered after the prototype-generation cron completes
  3. The newer prototypes (clean-&-shine, cornwall-auto-care, the-cutting-edge-salon) were generated by the 06-23 cycle and **the screenshot script was never run for them**
- **Why weren't screenshots applied?** Because the cron job `prototype-generation` runs `generate.py` but does NOT run `capture.js` afterwards. The `prebuild` hook runs the bundle script, not screenshots.
- **Fix needed:** Either:
  - Add a `screenshot-prototype.js` step that uses Playwright directly on the local HTML file (file:// URL — no server needed), OR
  - Wire `capture.js` into the prototype-generation cron as a second step

### C4. Pricing — $49 only, no first-payment tier (BUG)
- **Reported:** "Why am I seeing only the $49 with no 1st payment of (200-300$)??"
- **Truth:** `app/page.tsx` lines 115-156 define `pricingTiers`:
  - **Preview** — Free
  - **Managed** — `$49` per month (featured)
  - **One-time** — `$599` (no setup fee mentioned anywhere)
- **Compared to AGENT_PLAN.md §3 ("Packages"):**
  - Managed Starter: $299–399 CAD **+ $49/mo** (one-time setup fee + recurring)
  - Standard: $500 one-time
  - Full Handoff: $700–900 one-time
- **The pricing page in `app/page.tsx` does NOT match AGENT_PLAN.md.** The plan clearly says $299–399 first payment + $49/mo, but the homepage only shows $49/mo with no setup fee and a $599 one-time alternative.
- **Why wasn't this applied?** Because `app/page.tsx` was last polished by the 2026-06-22 07:35 EDT cron run (GLM 5.2), and that pass rewrote the marketing page based on different assumptions than what's in AGENT_PLAN.md. The two docs diverged silently.
- **Fix needed:** Update `pricingTiers` in `app/page.tsx` to match AGENT_PLAN.md §3:
  - Managed Starter: $299–$399 CAD setup + $49/mo (recommended)
  - Standard: $500 one-time
  - Full Handoff: $700–$900 one-time
  - Plus keep Preview = Free (lead gen)

---

## Rules Going Forward

- Whenever pricing, showcase behavior, or screenshot pipeline changes are discussed, BOTH `MEMORY.md` and `AGENT_PLAN.md` must be updated together. Drift is the bug.
- When user reports an issue, FIRST persist it, THEN fix it. Memory comes first.
- Always check the actual file/code state, not the docs, before claiming something works.
- **AGENT_PLAN.md is the single source of truth for open work, decisions, blockers, and the user's stated requirements/instructions.** While in implementation phase, the file must always reflect: (1) what's done, (2) what's in progress, (3) what's open, (4) the user's latest instructions, and (5) any drift between docs and code. A daily cron (`sitesprint-agent-plan-maintenance`, 08:00 America/Toronto) audits and updates the file. If the user gives a new instruction in chat, it MUST be added to AGENT_PLAN.md as a tracked item before the next operational cron runs — do not rely on chat history to survive across sessions.

---

## Infrastructure Status (as of 2026-06-22)

| Item | Status |
|------|--------|
| OpenAI image generation | ✅ Working |
| Google Gemini images | ❌ API key suspended |
| OpenRouter images | ❌ Out of credits |
| AgentMail inbox | ❌ Needs API key from user |
| Google Places API | ❌ Needs billing account |
| Domain registration | ❌ Not yet done |
| Telnyx SMS | ❌ Needs API key in env |
| Vercel deploy | ✅ Live at webpreview-business.vercel.app |
| GitHub repo | ✅ midobk/webpreview-business |