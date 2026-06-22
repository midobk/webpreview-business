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
- **Data:** JSON files (MVP) → Supabase (later)

## Project Structure
See `AGENT_PLAN.md` for the full living project plan.

## Current Status
Phases 0-9 complete:
- ✅ Tool research and scaffolding
- ✅ Lead discovery and scoring
- ✅ Prototype generation
- ✅ Preview hosting and screenshots
- ✅ Public brand website
- ✅ Private admin dashboard

## Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up admin password by visiting `/admin/setup`
4. Start the development server: `npm run dev`

## License
Private — not for redistribution.