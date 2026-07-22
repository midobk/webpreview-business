# Graph Report - webpreview-business  (2026-07-21)

## Corpus Check
- 195 files · ~2,931,743 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1353 nodes · 1760 edges · 133 communities (113 shown, 20 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 9 edges (avg confidence: 0.53)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `df40d489`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- icons.tsx
- page.tsx
- compilerOptions
- draft_personalized_emails.py
- dependencies
- templates.ts
- devDependencies
- V2Landing.tsx
- migrate_to_supabase.py
- generate.py
- build-data-bundle.js
- auth.ts
- discover_places.py
- variants.ts
- Showcase Sync and Supabase Operations Runbook
- score.py
- layout.tsx
- playground.mjs
- sync.ts
- screenshot-prototype.js
- sync_to_supabase.py
- Color Expert
- 19. Follow-Up Work (Queued, Not Started)
- discover.py
- discover_browser.py
- middleware.ts
- enrich_leads.py
- score_showcase.py
- page.tsx
- 13. Progress Tracker
- AGENT_PLAN.md — AI Website Preview Business Agent
- capture.js
- capture-page.js
- 3. Offer and Pricing
- sync-prototypes-to-supabase.mjs
- dependencies
- update-conversion-stats.py
- Checkmark.tsx
- Findings
- GridStagger.tsx
- generate_variant.py
- Premium SaaS Design Framework
- route.ts
- Meta Ads Plan — Seaway Sites
- eslint.config.mjs
- next.config.ts
- postcss.config.mjs
- cal-booking.ts
- Industry Templates
- MEMORY.md — Seaway Sites Agent Memory
- PROTOTYPE_QA.md — Prototype Generation Quality Protocol
- SiteSprint Agent — System Prompt
- ROADMAP.md
- 21. Weekly Planning — 2026-07-06 (Mon, Week 2)
- scripts
- Seaway Sites — AI Website Preview Business Agent
- 12. Implementation Phases (compressed)
- 16. Tool Research Findings (Phase 0)
- 6. Lead Discovery and Scoring
- Key Findings
- 5. Outreach Strategy
- OUTREACH_RULES.md
- 0. Project Identity
- 11. Data Model (MVP simplified)
- 17. User-Reported Issues — 2026-06-23 (Live Verification)
- 20. Weekly Planning — 2026-06-29 (Mon, Week 1)
- 4. Prototype Strategy
- IMAGE_ASSET_RULES.md (MVP — simplified)
- Outreach Email Templates
- 4A. Image Asset Pipeline
- 9. Enhanced Features (added to impress)
- DASHBOARD_SPEC.md (MVP)
- SHOWCASE_RULES.md
- 2. Business Scope
- 7. Architecture
- LEAD_SCORING.md
- IDENTITY.md — SiteSprint Agent
- regenerate_images.py
- package.json
- layout.tsx
- opengraph-image.tsx
- draft_sms.py
- ScrollParallax.tsx
- AGENTS.md
- supabase_client.py
- agent-runs.md
- decisions.md
- @types/react-dom
- auth-server.ts
- send_preview_email.py
- Seaway Sites application (repo-specific)
- 18. UX Audit + Fix Pass — 2026-06-23 (Live Verification)
- LeadForm.tsx
- Copywriting
- Page anatomy & build recipes
- Frontier Web Craft
- Quality gate
- site-config.ts
- page.tsx
- page.tsx
- review_page.py
- route.ts
- supabase.ts
- meta-ads
- Design directions
- 1. Heritage Wine
- 2. Fieldstone
- 3. Porcelain
- 4. Midnight Counter
- 5. Blueprint
- 6. Market Fresh
- 7. Ledger
- 8. Tidewater
- 9. Matchday
- ProductionDemo.tsx
- render_check.py
- CountUp.tsx
- Session: 2026-07-13 22:11:39 EDT
- 2026-07-13-2231.md
- run-with-env.sh

## God Nodes (most connected - your core abstractions)
1. `AGENT_PLAN.md — AI Website Preview Business Agent` - 29 edges
2. `19. Follow-Up Work (Queued, Not Started)` - 22 edges
3. `base()` - 21 edges
4. `getSupabase()` - 18 edges
5. `getPrototypes()` - 16 edges
6. `compilerOptions` - 16 edges
7. `Design directions` - 14 edges
8. `Showcase Sync and Supabase Operations Runbook` - 14 edges
9. `POST()` - 13 edges
10. `Color Expert` - 13 edges

## Surprising Connections (you probably didn't know these)
- `loadShowcase()` --indirect_call--> `isShowcaseVisible()`  [INFERRED]
  app/showcase/page.tsx → lib/showcase-policy.ts
- `GET()` --calls--> `requireAdmin()`  [EXTRACTED]
  app/api/admin/leads/route.ts → lib/auth-server.ts
- `PATCH()` --calls--> `requireAdmin()`  [EXTRACTED]
  app/api/admin/leads/route.ts → lib/auth-server.ts
- `PATCH()` --calls--> `requireSameOrigin()`  [EXTRACTED]
  app/api/admin/leads/route.ts → lib/auth-server.ts
- `GET()` --calls--> `getPrototypes()`  [EXTRACTED]
  app/api/admin/prototypes/route.ts → lib/data-source.ts

## Import Cycles
- None detected.

## Communities (133 total, 20 thin omitted)

### Community 0 - "icons.tsx"
Cohesion: 0.06
Nodes (50): AdminShell(), NAV, NavItem, AuthShell(), base(), IconBolt(), IconBuilding(), IconCheck() (+42 more)

### Community 1 - "page.tsx"
Cohesion: 0.47
Nodes (11): fsAccess(), GET(), PATCH(), fromFilesystem(), fromSupabase(), getAgentmailInboxes(), getConversionStats(), getLeads() (+3 more)

### Community 2 - "compilerOptions"
Cohesion: 0.06
Nodes (30): ./*, dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts (+22 more)

### Community 3 - "draft_personalized_emails.py"
Cohesion: 0.23
Nodes (14): generate_email_deterministic(), generate_email_via_ollama(), get_prototype_for_lead(), lead_has_draft(), lead_has_prototype(), load_leads(), load_outreach_log(), load_prototypes() (+6 more)

### Community 4 - "dependencies"
Cohesion: 0.12
Nodes (17): bcrypt, @emotion/is-prop-valid, motion, next, dependencies, bcrypt, @emotion/is-prop-valid, motion (+9 more)

### Community 5 - "templates.ts"
Cohesion: 0.09
Nodes (27): ANGLE_TEMPLATES, AngleKey, AngleTemplate, AVOIDED_INDUSTRIES, AvoidedIndustry, BuildOptions, buildOutreach(), BuiltEmail (+19 more)

### Community 6 - "devDependencies"
Cohesion: 0.12
Nodes (17): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/bcrypt (+9 more)

### Community 7 - "V2Landing.tsx"
Cohesion: 0.11
Nodes (11): ease, ProductionProcess(), STEPS, COPY_LINES, ease, ProductionDemo, STATS, TESTIMONIALS (+3 more)

### Community 8 - "migrate_to_supabase.py"
Cohesion: 0.30
Nodes (16): Client, get_client(), load_json(), main(), migrate_conversion_stats(), migrate_inboxes(), migrate_leads(), migrate_outreach() (+8 more)

### Community 9 - "generate.py"
Cohesion: 0.14
Nodes (20): assemble_prototype(), fallback_html(), generate_html_minimax(), generate_image_openai(), generate_prototype(), http_get(), http_post_json(), main() (+12 more)

### Community 10 - "build-data-bundle.js"
Cohesion: 0.14
Nodes (11): agentmailInboxes, conversionStats, DATA_DIR, fs, generatedAt, leads, OUT_FILE, outreachLog (+3 more)

### Community 11 - "auth.ts"
Cohesion: 0.14
Nodes (22): POST(), POST(), ATTRIBUTION_KEYS, LIMITS, POST(), readString(), slugify(), getPasswordHash() (+14 more)

### Community 12 - "discover_places.py"
Cohesion: 0.21
Nodes (14): collect_businesses(), filter_no_website(), get_api_key(), load_existing_leads(), main(), place_to_lead(), Text Search via Places API (New)., Paginate through search results. (+6 more)

### Community 13 - "variants.ts"
Cohesion: 0.06
Nodes (26): getPreviewSlug(), INDUSTRY_LABELS, Item, ShowcaseCard(), ShowcaseHero(), CornerStampProps, HeaderScrollProps, MagneticButtonProps (+18 more)

### Community 14 - "Showcase Sync and Supabase Operations Runbook"
Cohesion: 0.07
Nodes (29): 2026-07-10, 2026-07-16, A committed prototype is missing from `/showcase`, Build the local data bundle only, Change history, Check for repository-to-Supabase drift, Commands, Drift verification fails (+21 more)

### Community 15 - "score.py"
Cohesion: 0.24
Nodes (11): determine_status(), load_leads(), log_decision(), main(), Determine the lead status based on score.      Thresholds (lowered 2026-06-22 si, Save leads to data/leads.json, Log the scoring decision to logs/decisions.md, Score a lead based on the LEAD_SCORING.md rules     Returns a tuple of (score, r (+3 more)

### Community 16 - "layout.tsx"
Cohesion: 0.19
Nodes (8): ThemeScript(), fraunces, geistMono, geistSans, jakarta, metadata, Providers(), MetaPixel()

### Community 17 - "playground.mjs"
Cohesion: 0.24
Nodes (10): captureOne(), DEFAULT_SLUGS, __dirname, main(), OUT_DIR, parseArgs(), printHelp(), PROJECT_ROOT (+2 more)

### Community 18 - "sync.ts"
Cohesion: 0.36
Nodes (9): fsExists(), getSyncedLead(), getSyncedLeads(), Lead, loadAllLeads(), loadOutreach(), loadPrototypes(), OutreachRecord (+1 more)

### Community 19 - "screenshot-prototype.js"
Cohesion: 0.22
Nodes (9): captureOne(), { chromium }, fs, main(), OUT_DIR, path, PROJECT_ROOT, PROTOS_DIR (+1 more)

### Community 20 - "sync_to_supabase.py"
Cohesion: 0.56
Nodes (9): get_client(), load_json(), main(), normalize_dt(), strip_extra(), sync_leads(), sync_outreach(), sync_prototypes() (+1 more)

### Community 21 - "Color Expert"
Cohesion: 0.07
Nodes (26): Accessibility — Key Numbers, Character-first harmony works (Ellen Divers' research), Color Expert, Color Harmony — What Actually Works, Color Libraries (code), Color Naming — Multiple Systems for Different Registers, Color Spaces — What to Use When, Color Temperature (+18 more)

### Community 22 - "19. Follow-Up Work (Queued, Not Started)"
Cohesion: 0.08
Nodes (25): 19. Follow-Up Work (Queued, Not Started), 2026-06-23 15:48-16:14 EDT — C1-C4 fixes + daily AGENT_PLAN.md maintenance cron (Main, Dexter), 2026-06-24 15:24 EDT — Daily AGENT_PLAN.md audit (sitesprint cron), 2026-06-24 15:31 EDT — §19-I cron-job gap: closed (Main, Dexter), 2026-06-24 17:10 EDT — PR review of 4a94ef4-sibling work (Main, Dexter), 2026-06-24 23:06 EDT — Correction: PR1 showcase cards ARE fine (Main, Dexter), 2026-06-24 23:25 EDT — Bug fixes pushed to PR #1 + PR #2 branches (Main, Dexter), 2026-06-24 23:35 EDT — Honest correction: PR #1 "fix" overstated (Main, Dexter) (+17 more)

### Community 23 - "discover.py"
Cohesion: 0.36
Nodes (7): load_existing_leads(), log_run(), main(), Save leads to data/leads.json, Log the discovery run to logs/agent-runs.md, Load existing leads from data/leads.json, save_leads()

### Community 24 - "discover_browser.py"
Cohesion: 0.36
Nodes (7): load_existing_leads(), log_run(), main(), Load existing leads from data/leads.json, Save leads to data/leads.json, Log the discovery run to logs/agent-runs.md, save_leads()

### Community 25 - "middleware.ts"
Cohesion: 0.32
Nodes (9): base64UrlToBytes(), isPasswordSet(), isValidAdminSession(), checkPasswordSet(), config, envSessionSecretAvailable(), proxy(), trustedRequestOrigin() (+1 more)

### Community 26 - "enrich_leads.py"
Cohesion: 0.33
Nodes (4): extract_contacts(), merge_enrichment(), Pull emails, phones, and social profiles from a text blob., Merge enrichment data into a lead, keeping first-non-empty wins.

### Community 27 - "score_showcase.py"
Cohesion: 0.47
Nodes (5): anonymize_html(), check_quality(), main(), Replace identifying info with generic labels. Returns cleaned HTML., Return (score 0-100, list of issues).

### Community 28 - "page.tsx"
Cohesion: 0.16
Nodes (16): anonymizeSourceHtml(), escapeRegExp(), LeadRecord, loadPrototypeRecord(), loadSourceOverrides(), PreviewPage(), PreviewPageProps, PrototypeRecord (+8 more)

### Community 29 - "13. Progress Tracker"
Cohesion: 0.08
Nodes (24): 13. Progress Tracker, A. Public-site wiring (C1 + H1) — DONE, Agent Run Log, Agent Run Log (continued), B. Admin hardening (C2, C3, H4, H5, H6) — DONE, C. Admin-only content (H2) — DONE, Current Status — What Actually Works, D. Showcase polish (H3, L2, L3) — DONE (+16 more)

### Community 30 - "AGENT_PLAN.md — AI Website Preview Business Agent"
Cohesion: 0.12
Nodes (15): 10. Project File Structure, 13. Progress Tracker — DRIFT CORRECTION 2026-06-29 10:08 EDT, 14. Approval Checkpoints, 15. Success Metrics, 1. Agent Philosophy, 22. Prototype quality contract, revision capture, and showcase operations — 2026-07-13, 23. PR10 review-watcher cron — 2026-07-16 10:53 ET, 24. PR10 review-watcher cron — 2026-07-16 11:03 ET (+7 more)

### Community 31 - "capture.js"
Cohesion: 0.40
Nodes (5): captureScreenshots(), { chromium }, ensureDevServer(), fs, path

### Community 32 - "capture-page.js"
Cohesion: 0.40
Nodes (3): { chromium }, fs, path

### Community 33 - "3. Offer and Pricing"
Cohesion: 0.50
Nodes (4): 3. Offer and Pricing, First Email Rule, Packages (after prospect replies), Principle

### Community 34 - "sync-prototypes-to-supabase.mjs"
Cohesion: 0.21
Nodes (17): ADMIN_OWNED_COLUMNS, args, getSupabaseClient(), isVisibleShowcasePrototype(), loadAndValidateLocalPrototypes(), main(), METADATA_COLUMNS, normalizeComparable() (+9 more)

### Community 35 - "dependencies"
Cohesion: 0.50
Nodes (3): dependencies, playwright, playwright

### Community 36 - "update-conversion-stats.py"
Cohesion: 0.83
Nodes (3): load_json(), main(), score_bucket()

### Community 38 - "Findings"
Cohesion: 0.13
Nodes (14): Auth model after this PR, 🔴 CRITICAL-1: Admin API routes have no authentication check, Files changed in this PR, Findings, ℹ️ INFO-1: `.password` correctly gitignored, ℹ️ INFO-2: `.env*` correctly gitignored, ℹ️ INFO-3: No passwords, API keys, or secrets in client code, 🟢 LOW-1: Public `isPasswordSet` boolean leaks admin state (+6 more)

### Community 43 - "Premium SaaS Design Framework"
Cohesion: 0.06
Nodes (31): 1. Project Brief, 1. Section Isolation, 21st.dev, 2. Commit Per Section, 2. Content Files (One Per Section), 3. General Vibe Mood Board, 3. Include Reference Images, 4. Include Component Code (+23 more)

### Community 44 - "route.ts"
Cohesion: 0.25
Nodes (10): GET(), slugFromAssetUrl(), GET(), slugFromAssetUrl(), createDraftPreviewToken(), DraftPreviewPayload, isValidDraftPreviewToken(), previewSecret() (+2 more)

### Community 45 - "Meta Ads Plan — Seaway Sites"
Cohesion: 0.08
Nodes (25): 0. Campaign overview, 1. Audience & targeting, 2.1 Launch gates — spend nothing until ALL are green, 2.2 Creative production (agent drafts, Mehdi approves), 2.3 Campaign structure (built via MCP, all in PAUSED state), 2.4 Budget, 2. BEFORE — pre-launch (gates, setup, creative), 3.1 Launch protocol & the 2-day warm-up (+17 more)

### Community 52 - "Industry Templates"
Cohesion: 0.14
Nodes (12): Auto Repair, Cleaning, Contractor/Trade, Generation Pipeline, Generic, Industry Templates, Mobile Responsive, No False Claims (+4 more)

### Community 53 - "MEMORY.md — Seaway Sites Agent Memory"
Cohesion: 0.13
Nodes (14): 2026-06-22 — Prototype Quality Incident (Craftmans Cafe), 2026-07-19 — Supabase is the source of truth, NOT local JSON files, C1. Showcase approve → visibility gap (PARTIAL BUG), C2. Showcase link from landing page (EXISTS, WEAK), C3. Screenshots not working (REAL BUG), C4. Pricing — $49 only, no first-payment tier (RE-OPENED 2026-07-20), Critical Lessons, Infrastructure Status (as of 2026-06-22) (+6 more)

### Community 54 - "PROTOTYPE_QA.md — Prototype Generation Quality Protocol"
Cohesion: 0.10
Nodes (19): Creative brief for each prototype, Failure policy, Handoff record, Prototype Generation Playbook, Quality gate, Recommended MiniMax brief, Required operating mode, File Structure (standard for every prototype) (+11 more)

### Community 55 - "SiteSprint Agent — System Prompt"
Cohesion: 0.15
Nodes (12): 10. Task Lifecycle (one task per run), 11. Tone Reminders, 1. Who You Are, 2. Operating Rules, 3. Model Assignment, 4. Project Quick Reference, 5. Decision Modes (Lead Scoring), 6. Contact-Safety Gate (MUST pass before any email send) (+4 more)

### Community 56 - "ROADMAP.md"
Cohesion: 0.17
Nodes (10): Deferred / Future, Phase 0+1+2 — Tool Research + Scaffolding + Data Model [IN PROGRESS], Phase 10 — Outreach, Phase 11 — Showcase, Phase 12 — Review, Phase 3 — Lead Discovery, Phase 4 — Lead Scoring, Phase 5 — Prototype Generation (+2 more)

### Community 57 - "21. Weekly Planning — 2026-07-06 (Mon, Week 2)"
Cohesion: 0.18
Nodes (11): 21. Weekly Planning — 2026-07-06 (Mon, Week 2), Credit estimate (corrected), Cron management this turn, Files touched this session, Honest state of the project (delta vs. Week 1), 🚨 NEW FINDING — `GOOGLE_PLACES_API_KEY` is a placeholder, not a real key, Next week's prioritized lever list (in strict order), Pre-existing build issue (not mine) (+3 more)

### Community 58 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, build:data, check:showcase-metadata, check:showcase-sync, dev, lint, prebuild (+3 more)

### Community 59 - "Seaway Sites — AI Website Preview Business Agent"
Cohesion: 0.18
Nodes (10): Agent Operations, Current Status, How It Works, License, Operating Manual, Project Structure, Seaway Sites — AI Website Preview Business Agent, Setup (+2 more)

### Community 60 - "12. Implementation Phases (compressed)"
Cohesion: 0.20
Nodes (10): 12. Implementation Phases (compressed), Phase 0+1+2 — Tool Research + Scaffolding + Lead Data MVP, Phase 10 — Outreach MVP, Phase 11 — Showcase, Phase 12 — Review + Iterate, Phase 3 — Lead Discovery MVP, Phase 4 — Lead Scoring MVP, Phase 5 — Prototype Generation MVP (+2 more)

### Community 61 - "16. Tool Research Findings (Phase 0)"
Cohesion: 0.20
Nodes (10): 16. Tool Research Findings (Phase 0), 2026-06-22 07:35 EDT — Polish homepage (cron run), 2026-06-22 08:35 EDT — Agent registration (cron run), 2026-06-22 12:35 EDT — Status check (cron run), 2026-06-22 18:00 EDT — Audit + 12-item pipeline rebuild + push to GitHub (Main, Dexter), Available Now (no setup needed), MVP Tool Stack Recommendation, Needs API Key (free tier available) (+2 more)

### Community 62 - "6. Lead Discovery and Scoring"
Cohesion: 0.22
Nodes (9): 6. Lead Discovery and Scoring, Available Now (Free), Available with API Key, Decision Modes, Discovery Sources (researched), Google Maps API Free Alternatives (researched), Lead Score (out of 100), Leniency (+1 more)

### Community 63 - "Key Findings"
Cohesion: 0.22
Nodes (8): Google Maps API Free Alternatives, Key Findings, MVP Tool Stack, Summary, TOOL_RESEARCH.md — Phase 0 Findings, What We Have (ready now), What We Need (free API keys), What We Need to Create

### Community 64 - "5. Outreach Strategy"
Cohesion: 0.25
Nodes (8): 5. Outreach Strategy, A/B Testing (added enhancement), Autonomy, Contact-Safety Gate, Email Provider, First Email Format, Follow-Up Rules, SMS Follow-Up

### Community 65 - "OUTREACH_RULES.md"
Cohesion: 0.25
Nodes (6): A/B Email Angles, Contact-Safety Gate (must pass before every send), Email Provider, First Email Structure, Follow-Up Rules, SMS Rules (Telnyx +18253953636)

### Community 66 - "0. Project Identity"
Cohesion: 0.29
Nodes (7): 0. Project Identity, Business Concept, Core Offer, Default Target, Name Rationale, Non-Goals, Working Project Name

### Community 67 - "11. Data Model (MVP simplified)"
Cohesion: 0.29
Nodes (7): 11. Data Model (MVP simplified), agent_runs, decisions, image_assets (simplified for MVP), leads, outreach_logs, prototypes

### Community 68 - "17. User-Reported Issues — 2026-06-23 (Live Verification)"
Cohesion: 0.29
Nodes (7): 17. User-Reported Issues — 2026-06-23 (Live Verification), Action Items, C1. Showcase approve → visibility (PARTIAL BUG), C2. Showcase link from landing page (EXISTS, WEAK), C3. Screenshots not working (REAL BUG), C4. Pricing — only $49 shown, no setup fee (BUG), New cron job

### Community 69 - "20. Weekly Planning — 2026-06-29 (Mon, Week 1)"
Cohesion: 0.29
Nodes (7): 20. Weekly Planning — 2026-06-29 (Mon, Week 1), Credit estimate (Google Places API), Cron actions taken this turn, CRON DRIFT — the live scheduler disagrees with §13, Files touched, Honest state of the project, This week's product decision: no product change

### Community 70 - "4. Prototype Strategy"
Cohesion: 0.29
Nodes (7): 4. Prototype Strategy, Demo-Locked Features (shown but disabled), Demo Text Examples, Generation Model, Goal, Protection (every preview), Time/Budget

### Community 71 - "IMAGE_ASSET_RULES.md (MVP — simplified)"
Cohesion: 0.29
Nodes (6): Full Tracking (later phase), IMAGE_ASSET_RULES.md (MVP — simplified), Image Sources, MVP Principle, MVP Workflow, Rules

### Community 72 - "Outreach Email Templates"
Cohesion: 0.25
Nodes (7): Angles, Contact-Safety Gate, Files, Outreach Email Templates, Quick usage, Required environment, Rules encoded here

### Community 73 - "4A. Image Asset Pipeline"
Cohesion: 0.33
Nodes (6): 4A. Image Asset Pipeline, Available Tools, Full Tracking (Phase 5A — later), Image Rules (simplified for MVP), Image Source Priority, MVP Approach (simplified from original plan)

### Community 74 - "9. Enhanced Features (added to impress)"
Cohesion: 0.33
Nodes (6): 9. Enhanced Features (added to impress), A/B Email Testing, Auto-Regeneration, Demo Page Call Booking, Industry-Specific Templates, SMS Follow-Up

### Community 75 - "DASHBOARD_SPEC.md (MVP)"
Cohesion: 0.33
Nodes (5): Access, Actions, DASHBOARD_SPEC.md (MVP), Future (not MVP), Lead Table

### Community 76 - "SHOWCASE_RULES.md"
Cohesion: 0.33
Nodes (4): Anonymization Rules, Eligibility, Layout, Showcase Cards

### Community 77 - "2. Business Scope"
Cohesion: 0.40
Nodes (5): 2. Business Scope, Avoid Completely, Good-Fit, Ideal Lead, Lower Priority (careful copy)

### Community 78 - "7. Architecture"
Cohesion: 0.40
Nodes (5): 7. Architecture, Dashboard Data Fields, Dashboard (MVP), Tech Stack, URL Structure

### Community 79 - "LEAD_SCORING.md"
Cohesion: 0.40
Nodes (3): Decision Thresholds, Leniency Rule, Score Dimensions (100 total)

### Community 80 - "IDENTITY.md — SiteSprint Agent"
Cohesion: 0.40
Nodes (4): IDENTITY.md — SiteSprint Agent, Notes, Operating Principles, Stack Quick Reference

### Community 81 - "regenerate_images.py"
Cohesion: 0.26
Nodes (11): find_lead_for_slug(), gradient_fallback(), http_post_json(), main(), openai_generate(), Path, Regenerate broken images for one prototype slug. Returns summary., Look up the lead record to get industry, name, etc. (+3 more)

### Community 82 - "package.json"
Cohesion: 0.50
Nodes (3): name, private, version

### Community 90 - "supabase_client.py"
Cohesion: 0.15
Nodes (22): _api(), classify_industry(), enrich_lead(), get_new_leads(), get_ready_leads_without_prototypes(), _headers(), insert_prototype(), _load_env() (+14 more)

### Community 96 - "auth-server.ts"
Cohesion: 0.21
Nodes (15): GET(), canPublish(), fsAccess(), GET(), PATCH(), prototypeSlug(), isValidAdminSession(), isValidAdminSessionWithSecret() (+7 more)

### Community 97 - "send_preview_email.py"
Cohesion: 0.21
Nodes (15): build_email_html(), build_email_text(), create_draft_preview_token(), get_lead(), get_prototype(), main(), mark_email_sent(), Build a personalized HTML email for the prospect. (+7 more)

### Community 98 - "Seaway Sites application (repo-specific)"
Cohesion: 0.13
Nodes (14): Demo lock (every prototype), Design principles, Frontend Design, Ground it in the subject, HTML-cleanliness gate (before any push), Imagery, Layout & responsiveness, More on writing in design (+6 more)

### Community 99 - "18. UX Audit + Fix Pass — 2026-06-23 (Live Verification)"
Cohesion: 0.50
Nodes (4): 18. UX Audit + Fix Pass — 2026-06-23 (Live Verification), Bonus fixes included while in code, Findings (16 total, all addressed or accepted), Verification

### Community 100 - "LeadForm.tsx"
Cohesion: 0.23
Nodes (10): FormState, initialForm, LeadForm(), Attribution, ATTRIBUTION_KEYS, captureAttribution(), getAttribution(), newEventId() (+2 more)

### Community 101 - "Copywriting"
Cohesion: 0.15
Nodes (12): About / story, Banned list, Copywriting, CTA labels, Headline formulas, Ledes, Microcopy, Numbers & proof — the honesty rules (+4 more)

### Community 102 - "Page anatomy & build recipes"
Cohesion: 0.15
Nodes (12): A — Editorial split (default when there's one strong image), B — Full-bleed immersion (when the image is spectacular), C — Typographic (when imagery is weak or absent), Contents, Generating a set — anti-convergence rules, Global skeleton rules, Hero archetypes, Motion budget — a floor and a ceiling (+4 more)

### Community 103 - "Frontier Web Craft"
Cohesion: 0.17
Nodes (11): Frontier Web Craft, Output modes, Precedence, Step 0 — Extract the fact sheet, Step 1 — Choose a direction; do not invent one, Step 2 — Write the copy deck before any layout, Step 3 — Build on the skeleton, Step 4 — Run the gate; you are done when it passes (+3 more)

### Community 104 - "Quality gate"
Cohesion: 0.18
Nodes (10): Contents, Fix table, Quality gate, The Chanel pass, The facts ledger, The genericism interrogation, The rubric, Tier 1 — Mechanical checks (run the script) (+2 more)

### Community 105 - "site-config.ts"
Cohesion: 0.24
Nodes (3): metadata, AI_CRAWLERS, SITE_URL

### Community 106 - "page.tsx"
Cohesion: 0.24
Nodes (10): anonymizeTitle(), INDUSTRY_LABELS, INDUSTRY_TAGLINES, Lead, loadShowcase(), metadata, Prototype, SHOWCASE_THUMBNAIL_OVERRIDES (+2 more)

### Community 107 - "page.tsx"
Cohesion: 0.31
Nodes (6): FAQS, PRICING, buildLlmsTxt(), GET(), jsonLd, metadata

### Community 108 - "review_page.py"
Cohesion: 0.36
Nodes (8): css_of(), line_of(), main(), Strip style/script/comments and tags; return the human-visible text., Remove every `:root { ... }` block (including inside media queries)., report(), strip_root_blocks(), visible_text()

### Community 109 - "route.ts"
Cohesion: 0.44
Nodes (8): appendNote(), findLeadForSlug(), isEmail(), LeadLookup, POST(), resolveVariantBase(), revisionKey(), slugMatchesLead()

### Community 110 - "supabase.ts"
Cohesion: 0.36
Nodes (6): GET(), PAGE(), isSupabaseConfigured(), signingSecret(), signUnsubscribeToken(), verifyUnsubscribeToken()

### Community 111 - "meta-ads"
Cohesion: 0.29
Nodes (6): META_ACCESS_TOKEN, /Users/mehdibakkalimaassom/.local/bin/graphify-mcp, uvx, graphify, meta-ads, meta-ads-mcp

### Community 112 - "Design directions"
Cohesion: 0.33
Nodes (5): Adaptation rules, Contents, Design directions, Expressive display stacks — the second gear, Selection table

### Community 113 - "1. Heritage Wine"
Cohesion: 0.33
Nodes (6): 1. Heritage Wine, Motion, Shape & texture, Signature (mandatory), Tokens, Type

### Community 114 - "2. Fieldstone"
Cohesion: 0.33
Nodes (6): 2. Fieldstone, Motion, Shape & texture, Signature (mandatory), Tokens, Type

### Community 115 - "3. Porcelain"
Cohesion: 0.33
Nodes (6): 3. Porcelain, Motion, Shape & texture, Signature (mandatory), Tokens, Type

### Community 116 - "4. Midnight Counter"
Cohesion: 0.33
Nodes (6): 4. Midnight Counter, Motion, Shape & texture, Signature (mandatory), Tokens, Type

### Community 117 - "5. Blueprint"
Cohesion: 0.33
Nodes (6): 5. Blueprint, Motion, Shape & texture, Signature (mandatory), Tokens, Type

### Community 118 - "6. Market Fresh"
Cohesion: 0.33
Nodes (6): 6. Market Fresh, Motion, Shape & texture, Signature (mandatory), Tokens, Type

### Community 119 - "7. Ledger"
Cohesion: 0.33
Nodes (6): 7. Ledger, Motion, Shape & texture, Signature (mandatory), Tokens, Type

### Community 120 - "8. Tidewater"
Cohesion: 0.33
Nodes (6): 8. Tidewater, Motion, Shape & texture, Signature (mandatory), Tokens, Type

### Community 121 - "9. Matchday"
Cohesion: 0.33
Nodes (6): 9. Matchday, Motion (this direction's floor is high — ship all of it), Shape & texture, Signature (mandatory), Tokens, Type

### Community 122 - "ProductionDemo.tsx"
Cohesion: 0.40
Nodes (4): Business, BUSINESSES, ProductionDemo(), WORK_STEPS

## Knowledge Gaps
- **652 isolated node(s):** `/Users/mehdibakkalimaassom/.local/bin/graphify-mcp`, `uvx`, `meta-ads-mcp`, `META_ACCESS_TOKEN`, `FormState` (+647 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **20 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `SITE_URL` connect `site-config.ts` to `page.tsx`, `page.tsx`, `auth.ts`, `layout.tsx`, `middleware.ts`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Why does `ThemeScript()` connect `layout.tsx` to `icons.tsx`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **Why does `AGENT_PLAN.md — AI Website Preview Business Agent` connect `AGENT_PLAN.md — AI Website Preview Business Agent` to `5. Outreach Strategy`, `3. Offer and Pricing`, `0. Project Identity`, `11. Data Model (MVP simplified)`, `17. User-Reported Issues — 2026-06-23 (Live Verification)`, `18. UX Audit + Fix Pass — 2026-06-23 (Live Verification)`, `20. Weekly Planning — 2026-06-29 (Mon, Week 1)`, `4. Prototype Strategy`, `4A. Image Asset Pipeline`, `9. Enhanced Features (added to impress)`, `2. Business Scope`, `7. Architecture`, `13. Progress Tracker`, `19. Follow-Up Work (Queued, Not Started)`, `21. Weekly Planning — 2026-07-06 (Mon, Week 2)`, `12. Implementation Phases (compressed)`, `16. Tool Research Findings (Phase 0)`, `6. Lead Discovery and Scoring`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **What connects `/Users/mehdibakkalimaassom/.local/bin/graphify-mcp`, `uvx`, `meta-ads-mcp` to the rest of the system?**
  _652 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `icons.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05945945945945946 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.06451612903225806 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._