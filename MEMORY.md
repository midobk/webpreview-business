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

- Brand name: SiteSprint (working name, final TBC with user)
- Domain: sitesprint.ca (not yet registered)
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