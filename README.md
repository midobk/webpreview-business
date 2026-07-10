# SiteSprint — AI Website Preview Business Agent

Autonomous AI pipeline that finds Canadian small businesses with no/ugly/broken websites, generates beautiful personalized website previews, and reaches out via email + SMS to sell them a simple one-page website.

## How It Works
1. **Discover** — Find businesses via Yelp Fusion API + directory scraping
2. **Score** — Rate leads on 10 dimensions (website status, email availability, info richness, etc.)
3. **Generate** — MiniMax M3 creates a beautiful, watermarked, demo-locked one-page preview
4. **Screenshot** — Playwright captures desktop + mobile screenshots
5. **Outreach** — AgentMail sends personalized email with screenshot + preview link
6. **Follow Up** — Telnyx SMS for high-score no-replies
7. **Dashboard** — Track everything in a private admin panel

## Tech Stack
- **Agent runtime:** OpenClaw
- **Prototype generation:** MiniMax M3 (ollama)
- **Images:** Google Gemini via image_generate
- **Screenshots:** Playwright
- **Email:** AgentMail
- **SMS:** Telnyx
- **Frontend:** Next.js + Vercel
- **Data:** Version-controlled JSON for agent workflows, synchronized to Supabase for production runtime data

## Project Structure
See `AGENT_PLAN.md` for the full living project plan.

For the public showcase data flow, deployment gate, Supabase synchronization, visibility rules, incident history, security hardening, and troubleshooting procedures, see `docs/SHOWCASE_SYNC_AND_SUPABASE_RUNBOOK.md`.

## Current Status
Phases 0-12 complete:
- ✅ Tool research and scaffolding
- ✅ Lead discovery and scoring
- ✅ Prototype generation
- ✅ Preview hosting and screenshots
- ✅ Public brand website
- ✅ Private admin dashboard
- ✅ Phase 10 outreach templates + A/B angles + contact-safety gate
- ✅ Phase 11 public showcase (anonymized, path-traversal-safe image proxy)
- ✅ Phase 12 security review (auth gates + logout + PII removal)
- ✅ Homepage polish (gradient hero, features, testimonials, FAQ, pricing, MetaSEO)
- ✅ `.env.example` with all 8 sections + comments
- ✅ SiteSprint isolated agent registered (`openclaw agents list`)
- ✅ Production showcase sync gate: repository validation → Supabase upsert → zero-drift verification
- ✅ Showcase metadata regression workflow and industry-specific showcase copy
- ✅ Supabase prototype-industry migration and helper-function security hardening

## Operating Manual
- `AGENT_PLAN.md` — living project plan, Progress Tracker, Agent Run Log
- `docs/SHOWCASE_SYNC_AND_SUPABASE_RUNBOOK.md` — canonical showcase/Supabase operations, deployment safeguards, incident record, and troubleshooting
- `SYSTEM.md` — agent system prompt (loaded by the `sitesprint` OpenClaw agent)
- `IDENTITY.md` — agent identity (name, emoji 🚀, theme)
- `docs/SECURITY_REVIEW.md` — Phase 12 findings + remediation

## Showcase Integrity Commands

```bash
npm run check:showcase-metadata
npm run check:showcase-sync
npm run sync:showcase
```

Production Vercel builds automatically validate prototype metadata, synchronize `data/prototypes.json` to Supabase, verify zero drift, and block deployment when the expected showcase state cannot be confirmed.

## Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` → `.env.local` and fill in `PASSWORD_HASH` (REQUIRED). Other vars optional until their features are activated.
4. Start the development server: `npm run dev`

## Agent Operations
The `sitesprint` isolated agent is registered with OpenClaw (`openclaw agents list`).
- Workspace: `~/.openclaw/workspace/webpreview-business`
- Model: `ollama/glm-5.2:cloud` (overridable per task — MiniMax M3 for prototypes, DeepSeek V4 Flash for cheap classification)
- Routing: none (cron-only; manual task invocations via `openclaw sessions send`)

## License
Private — not for redistribution.
