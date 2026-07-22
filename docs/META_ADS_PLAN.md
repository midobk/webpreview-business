# Meta Ads Plan — Seaway Sites

> Operational plan for the first paid-acquisition channel: Meta (Facebook + Instagram) lead-gen ads,
> created and managed by an agent via the Meta MCP. Companion to AGENT_PLAN.md.
> Status (2026-07-21): decisions locked (§8). Code gates G3/G4/G7 done + merged to `main` (PR #15). **G5 done** — account/payment/spending-limit created, `seawaysites.com` Meta-verified. Email provider is now **Resend** (key provided). **Remaining blockers: G6 (connect Meta MCP) and provisioning the Pixel ID/CAPI token; G2 needs the send-path code swapped to Resend.** No spend until all gates green.

## Decisions locked (2026-07-20)
- **Budget:** Tier A — $20/day, 4-week test flight (~$600 CAD).
- **Pacing:** 2-day warm-up (no edits, pixel + algorithm calibration), then daily optimization from day 3. See §3.1 for the honest expectation on how fast "results" stabilize at this budget.
- **Lead capture:** website form → existing `/api/leads` → Supabase pipeline.
- **Geo:** all-Canada, English placements.
- **Pricing:** live landing is the source of truth (Free Draft / Managed $399 + $69/mo / Own $899). Drift resolved; §3 of AGENT_PLAN + MEMORY.md C4 updated to match.

---

## 0. Campaign overview

- **Campaign name:** Free Preview — CA Lead Gen v1
- **One-liner:** Show small Canadian business owners a real website preview offer — "see your website before you pay anything" — and capture leads into the existing preview → sale funnel.
- **Primary objective:** Website leads (form submits on seawaysites.com) at **CPL ≤ $20 CAD** within the first 4-week flight.
- **Secondary objectives:** Seed the Meta Pixel with conversion data for future retargeting/lookalikes; learn which industry angle (trades / salons / restaurants / home services) converts cheapest.
- **Why this fits the business:** The cold-email pipeline is outbound-push; ads add inbound-pull. The free preview is a genuinely strong lead magnet — total risk reversal, and it feeds the exact asset (personalized prototype) the pipeline already produces.

**Core message:** "Get a free preview of your new website before you pay a cent — built for you by a Canadian team, live in days."

**Supporting messages:**
1. *Risk reversal:* You see the finished design first. Pay only if you love it.
2. *Done-for-you:* No builders, no DIY, no tech skills. We handle everything, including updates.
3. *Local trust:* Canadian, for small businesses — plumbers, salons, cafés, contractors.
4. *Speed:* Preview in days, not months.

**Copy rules (non-negotiable):**
- **No AI positioning.** Never "AI-built," "AI-generated," "automated." Frame as fast human service. (MEMORY.md rule.)
- Match landing tone; brand palette = warm spruce + oxblood for creative.
- No income/guarantee claims ("get more customers guaranteed" = Meta policy + credibility risk). "More calls, more customers" as aspiration is fine; guarantees are not.
- Pricing in ads only once landing pricing is fixed (see §2.1) — then transparency is a differentiator.

---

## 1. Audience & targeting

**Primary audience:** Owner-operators of small Canadian service businesses (1–10 staff) with no website or an outdated one. They buy on trust and simplicity, not features. They discover services on Facebook/Instagram (heavy FB usage in trades/local-service demographics, 30–60 age band).

**Targeting approach (Meta's detailed targeting for "small business owners" is weak — let creative do the selecting):**
- **Ad set A — Broad + Advantage:** Canada, 25–60, Advantage+ audience, no interest stack. Creative speaks directly to business owners ("Run a business without a website?") so the algorithm finds them.
- **Ad set B — Interest stack:** Canada, 25–60, interests: Facebook Business Page admins / small business / entrepreneurship stack. Tests whether narrowing beats broad.
- **Geo:** Start all-Canada English placements; if CPMs are high, narrow to Ontario + Alberta + BC. French (Quebec) creative is a later, separate flight — do not mix languages in one ad set.
- **Placements:** Advantage+ placements (let Meta optimize). Revisit after data.
- **Later (after ~500 site visitors):** retargeting ad set (site visitors 30d, no lead). After first customers: 1% lookalike on converted list.

**Lead capture method — decision needed (§8):**
- **Recommended: website form** (seawaysites.com → existing `/api/leads` → Supabase). Higher intent, lands directly in the existing pipeline, seeds the Pixel.
- Alternative: Meta Instant Forms — cheaper CPL, notoriously lower quality, and requires new plumbing to pull leads into Supabase. Keep as a test cell for later, not v1.

---

## 2. BEFORE — pre-launch (gates, setup, creative)

### 2.1 Launch gates — spend nothing until ALL are green

| # | Gate | Status | Why it blocks launch |
|---|------|--------|----------------------|
| G1 | **Pricing drift fixed** | ✅ DONE 2026-07-20 | Resolved: live landing = source of truth. AGENT_PLAN §3 + MEMORY.md C4 rewritten to match ($399 + $69/mo / $899). No landing change needed. |
| G2 | **Lead follow-up works end-to-end** — email provider is **Resend** (key provided 2026-07-21). Send-path code still targets AgentMail. | 🟡 PARTIAL — key in hand, code swap + Resend domain-verify pending | Paying for leads that never get a reply is the fastest way to waste the budget. Speed-to-lead (reply within minutes) is the single biggest conversion lever, and ties to the 2-day warm-up. **To finish:** verify `seawaysites.com` in Resend (DKIM/SPF), set `RESEND_API_KEY` in Vercel, swap `scripts/send-outreach` from AgentMail to the Resend API. |
| G3 | **Meta Pixel + Lead event live**, firing on form submit + server-side Conversions API (deduped by shared event_id) | ✅ CODE DONE — needs Pixel ID | `components/MetaPixel.tsx` (pixel), `lib/attribution.ts` (browser Lead event), `lib/meta-capi.ts` (server CAPI), wired into `app/layout.tsx`, `LeadForm.tsx`, `app/api/leads/route.ts`. Dormant until `NEXT_PUBLIC_META_PIXEL_ID` / `META_CAPI_ACCESS_TOKEN` are set. Build + typecheck pass. |
| G4 | **UTM + fbclid attribution stored** on the Supabase lead row | ✅ DONE | Migration `20260720130000_add_lead_attribution` applied (6 columns live, verified). Captured first-touch on the landing page, written on insert. Supabase — not Ads Manager — is the CPL/CAC source of truth. |
| G5 | **Business infrastructure** — Business Manager, FB Page, ad account, payment method, domain verified, **account-level spending limit set** | ✅ DONE 2026-07-21 | All created by Mehdi. `seawaysites.com` verified to the Business Portfolio (meta-tag shipped in PR #15, live on prod). The account spending limit is the hard safety cap under the agent. |
| G6 | **Meta MCP connected**, tools verified (list/create paused campaign, read insights) | ⛔ IN PROGRESS — Mehdi connecting | The management agent needs its hands. Being set up for both Claude Code (`.mcp.json` / `claude mcp add`) and Codex (`~/.codex/config.toml`). Token carries `ads_management` (can spend) — keep the human-approval gate. Last blocker gating campaign build. |
| G7 | **Privacy page** pixel/advertising disclosure | ✅ DONE | `/privacy` now discloses the Meta Pixel and hashed-email sharing for ad measurement; "Last updated" bumped to 2026-07-20. |
| G8 | **Landing conversion pass** — form is the obvious primary CTA, clean thank-you state, mobile speed | ◻️ TODO — agent | Ad clicks are wasted on a page that doesn't convert. Landing already has a working form + success state; do a focused mobile/CTA pass once G5/G6 unblock and creative is set.

### 2.2 Creative production (agent drafts, Mehdi approves)

Three angles × two formats (1080×1080 feed, 1080×1920 story/reel). 9 ads total for launch, 3 per angle. Real prototype screenshots from `prototype-screenshots/` / the showcase are the creative goldmine — real work beats stock.

**Angle A — Risk reversal ("see it first"):**
- Primary text: "Most website companies ask for money before you see anything. We do it backwards: we design your website first, you look at it, and you only pay if you want it. Built for Canadian small businesses — plumbers, salons, cafés, contractors."
- Headline: "See your website before you pay"
- CTA button: Learn More → seawaysites.com (with UTMs)

**Angle B — Before/after (visual proof):**
- Creative: split-screen — outdated/no site vs. a polished prototype (use anonymized prototypes, e.g. the meridian-auto-works / nocturne-hair-studio sets, or get permission from a real client).
- Primary text: "Your business is great. Your website should say so. One page, built for you, live in days — and you preview it free before paying anything."
- Headline: "Your business deserves better than no website"

**Angle C — Owner empathy (no-tech, done-for-you):**
- Primary text: "You didn't start your business to fight with website builders at 11pm. Send us your business name — we'll show you a finished design, free. Like it? We make it live and keep it running. Don't? You owe nothing."
- Headline: "A website, handled. Preview free."

Video variant (highest-leverage single asset): 15–20s screen recording scrolling a beautiful prototype on a phone mockup, text overlay "Built free as a preview for a local barber shop → yours could be next." Can be produced from existing screenshot/render tooling.

### 2.3 Campaign structure (built via MCP, all in PAUSED state)

```
Campaign: Free Preview — CA Lead Gen v1  (objective: Leads / website conversions on Lead event)
├── Ad set A: Broad Advantage+ — $10/day
│   ├── Ad A1 (risk reversal, feed image)
│   ├── Ad B1 (before/after, feed image)
│   └── Ad C1 (owner empathy, video)
└── Ad set B: Interest stack — $10/day
    ├── Ad A2, B2, C2 (same creatives)
```

### 2.4 Budget

| Tier | Daily | 4-week flight | Use when |
|------|-------|---------------|----------|
| **A — Test (recommended)** | $20/day | ~$600 CAD | First flight: learn CPL + lead quality |
| B — Growth | $50/day | ~$1,500 CAD | After CPL ≤ $20 proven AND leads convert to replies/sales |

Unit economics guardrail: Managed Starter ≈ $399 + $69/mo → ~$1,227 first-year value. At $20 CPL, a 10% lead→sale rate = $200 CAC (healthy); a 2% rate = $1,000 CAC (channel fails even with "good" CPL). **Lead quality > CPL** — which is why attribution through to sale (G4) matters more than the Ads Manager dashboard.

---

## 3. DURING — agent-managed operation

### 3.1 Launch protocol & the 2-day warm-up
1. Agent builds the full structure **paused**, via Meta MCP.
2. Mehdi reviews in Ads Manager (creative, targeting, budgets, tracking).
3. **Explicit go from Mehdi in chat → agent activates.** Activation, any budget change, and any new campaign each require fresh explicit approval — spend is never turned on or up autonomously.
4. **Days 1–2 = warm-up (no edits).** The agent watches and reports but changes nothing. Every edit resets Meta's learning, so we let the pixel season and the algorithm calibrate first. Daily reporting starts on **day 1** so you see live numbers immediately, even though no action is taken yet.
5. **Day 3 onward = optimization.** The pause-only rules in §3.2 go live: kill dead ads, flag expensive ad sets, propose reallocations.

**Honest expectation on "seeing results" (important):** at $20/day split across two ad sets, expect roughly 1–3 leads/day once creative is landing. That's enough to *see the funnel working* within the 2-day warm-up (clicks, CPMs, first form submits) and to start acting on day 3 — but it is **not** enough volume for Meta's formal "learning phase" to exit (that needs ~50 conversions per ad set, unreachable at this budget in a week). So:
- **By end of day 2:** you'll see whether ads are approved, CPMs are sane ($8–15), CTR is healthy (≥1%), and leads are arriving + landing in Supabase. That's the day-2 "results" checkpoint.
- **Stable CPL** (the number worth making scale decisions on) takes ~**7–14 days**. Judging the channel dead on 2 days of a $40 spend would be a mistake — the plan reports early but *decides* at the §4 end-of-flight review.
- If you want faster statistical signal, the lever is budget (Tier B $50/day reaches confidence sooner), not time. Flagged as an option, not a recommendation — Tier A first is the right risk posture.

### 3.2 Daily routine (scheduled agent, ~9:00 ET)
1. Pull per-ad and per-ad-set: spend, impressions, CPM, CTR, clicks, leads, CPL (via MCP insights).
2. Cross-check Supabase: did each Meta-attributed lead actually land as a row, and did the follow-up email fire? (Ads Manager counts are not the source of truth.)
3. Apply **pause-only** rules (agent may pause, never spend more):
   - Ad: spend ≥ 2× target CPL ($40) with 0 leads → pause, log reason.
   - Ad: CTR < 0.5% after 2,000+ impressions → pause, log.
   - Ad set: CPL > target for 3 consecutive days (post-learning) → flag to Mehdi with recommendation.
   - Anomaly (overnight spend spike, disapproved ad, account flag) → notify immediately.
4. Log every action + metric snapshot to `logs/` and append a one-line daily note.

### 3.3 Weekly routine
- Weekly report: spend, leads, CPL, best/worst ad, lead quality signal (reply rate on ad-sourced leads), recommendation.
- Creative fatigue check: frequency > ~2.5–3 or CTR decaying → draft refreshed variants for approval (creative refresh every 2–4 weeks is expected on a small geo).
- Proposals (budget shifts between ad sets, new angles, retargeting ad set once traffic allows) — **proposed, never self-approved.**

### 3.4 Guardrails (hard rules for the managing agent)
- Account-level spending limit set by Mehdi in Meta = the ceiling no software can cross.
- Agent MAY: read insights, pause ads/ad sets, draft creatives, report.
- Agent MUST ASK before: activating anything, raising any budget, creating campaigns/ad sets, changing targeting, publishing new creative.
- Kill switch: "pause all ads" → agent pauses the campaign immediately, confirms, reports state.

---

## 4. AFTER — measure, learn, decide (end of 4-week flight)

### 4.1 End-of-flight report
- Funnel: impressions → clicks → form leads → replies → previews claimed → sales, **per angle and per ad set**.
- True CAC from Supabase attribution (not Ads Manager), vs. ~$1,227 first-year value.
- Lead-quality comparison: ad-sourced leads vs. cold-email leads (reply rate, close rate).

### 4.2 Decision matrix
| Outcome | Action |
|---------|--------|
| CPL ≤ $20 AND leads convert ≥ ~8% to sale | Scale to Tier B, add retargeting ad set, start lookalike from customer list |
| CPL fine, conversion poor | Fix funnel (follow-up speed, landing copy, qualifying question on form) before more spend |
| CPL > $30, CTR healthy | Landing/offer problem — iterate page, keep winning creative |
| CTR < 0.5% across all angles | Creative/message problem — new angles before more spend |
| Everything poor after $600 | Pause channel; document learnings; cold email remains primary |

### 4.3 Assets that persist regardless of outcome
- Seasoned Pixel + site-visitor audiences (retargeting gets cheaper over time).
- Creative library with performance data (winning angle informs cold-email copy too).
- Leads that didn't buy → nurture list (consented via form = CASL-clean).
- This playbook updated with actuals; AGENT_PLAN.md §status gets a Meta-ads row.

---

## 5. Success metrics

| Metric | Target | Source |
|--------|--------|--------|
| **Leads (primary)** | ≥ 30 in flight 1 | Supabase (UTM-attributed) |
| CPL | ≤ $20 CAD (stretch $12) | Spend ÷ Supabase leads |
| CTR (link) | ≥ 1.0% | Meta insights |
| CPM | $8–15 CAD sanity band | Meta insights |
| Landing conversion | ≥ 10% of clicks → lead | Supabase ÷ clicks |
| Lead → reply rate | ≥ 40% (they filled a form; follow-up must land) | Pipeline logs |
| Sales from ads | ≥ 2 in flight 1 (≈ breakeven at Tier A) | Supabase |

Reporting cadence: daily one-liner (agent), weekly report (agent), end-of-flight review (agent + Mehdi decision).

---

## 6. Risks & mitigations

1. **Wasted spend on broken follow-up** (highest risk today — AGENTMAIL key missing): hard launch gate G2; daily Supabase cross-check.
2. **Low lead quality from broad targeting:** creative self-selection, optional qualifying field ("Do you currently have a website?"), judge on close rate not CPL.
3. **New-ad-account friction** (disapprovals, spending limits, occasional false-positive bans): start small, conservative claims, no engagement bait; appeal via Ads Manager if flagged; don't create multiple accounts.
4. **Ad fatigue in a small market:** 2–4 week creative refresh cadence baked into §3.3.
5. **Pricing/positioning mismatch** (G1): fixed before any spend.

---

## 7. Content assets needed (production checklist)

| Asset | Type | Priority | Owner |
|-------|------|----------|-------|
| 6 feed images (3 angles × 2 variants) | 1080×1080 | Must | Agent drafts (Canva MCP available but needs auth) → Mehdi approves |
| 3 story/reel versions | 1080×1920 | Must | Agent |
| 1 prototype scroll video | 15–20s MP4 | Must (best expected performer) | Agent (screen-record prototype) |
| Ad copy: 3 primary texts × 3 headlines | Text | Must | Drafted in §2.2 — refine on approval |
| Landing conversion pass | Code | Must | Agent |
| Pixel + CAPI + UTM capture | Code | Must | Agent |
| Privacy page tracking disclosure | Code | Must | Agent |
| FB Page cover/avatar (page must not look empty — prospects will click through) | Design | Should | Agent drafts |
| French (QC) creative set | Design/copy | Later | — |

---

## 8. Decisions — status

1. ~~**Budget tier**~~ → **Tier A, $20/day, 4 weeks (~$600 CAD).** ✅
2. ~~**Pricing truth**~~ → **live landing wins** ($399 + $69/mo / $899). ✅ G1 + J.3 closed.
3. ~~**Lead method**~~ → **website form** into the existing pipeline. ✅
4. ~~**Geo**~~ → **all-Canada, English.** ✅

### Progress 2026-07-21
5. ~~**Account setup**~~ → **DONE.** Business Manager, FB Page, ad account + payment method, account spending limit, and `seawaysites.com` domain verification all complete. ✅
6. ~~**Email provider**~~ → **Resend** chosen (replaces AgentMail); `RESEND_API_KEY` provided. Remaining email work: verify domain in Resend, set the key in Vercel, swap the send-path code (G2). 🟡

### Still needed from Mehdi (blockers to launch)
7. **Meta MCP** — connect it for both Claude Code and Codex (see the setup section at the end of this doc / chat). The agent maps its tools on connection and verifies read/insights + create-paused-campaign before building anything. **Last blocker gating campaign build.**
8. **Pixel ID + Conversions API token** — from Meta Events Manager; then set `NEXT_PUBLIC_META_PIXEL_ID` / `META_CAPI_ACCESS_TOKEN` in Vercel.

### Once Mehdi provides the above, the agent will (all reversible, nothing spends):
- Set `NEXT_PUBLIC_META_PIXEL_ID` + `META_CAPI_ACCESS_TOKEN` (Vercel env) and confirm the pixel fires a test Lead event end-to-end (browser + CAPI dedup).
- Draft the 3-angle creative set (§2.2) for approval.
- Build the campaign → 2 ad sets → 6–9 ads **paused** via the MCP for review.
- Nothing activates until Mehdi says go in chat (§3.1).
