# TOOL_RESEARCH.md — Phase 0 Findings

## Summary
Tool research completed 2026-06-22. See AGENT_PLAN.md §16 for the full findings table.

## Key Findings

### What We Have (ready now)
- **MiniMax M3** via ollama for prototype generation ✅
- **Google Gemini image generation** via image_generate tool ✅
- **OpenAI image generation** (gpt-image-2) via image_generate ✅
- **Playwright v1.61.0** for screenshots ✅
- **Browser tool** for web scraping/directory browsing ✅
- **AgentMail** skill for email outreach ✅
- **Telnyx** (+18253953636) for SMS follow-up ✅
- **GitHub CLI** authenticated as midobk ✅
- **Vercel** CLI available via npx ✅
- **diagram-maker** skill for visual assets ✅
- **ffmpeg** skill for image processing ✅

### What We Need (free API keys)
- **Yelp Fusion API** — free signup, 5,000 calls/day. Primary discovery source.
- **Google Places API** — $200/mo free credit. Optional, for photos + better discovery.

### What We Need to Create
- AgentMail inbox for outreach (e.g. `sitesprint@agentmail.to`)
- GitHub repo: `midobk/webpreview-business`
- Vercel project linked to repo
- Domain registration (name TBC)

### MVP Tool Stack
| Layer | Tool | Cost |
|-------|------|------|
| Discovery | Yelp Fusion + browser scraping | Free |
| Scoring | DeepSeek V4 Flash (ollama) | Free (ollama) |
| Prototypes | MiniMax M3 (ollama) | Free (ollama) |
| Images | Google Gemini (image_generate) | Free tier |
| Screenshots | Playwright | Free |
| Email | AgentMail | Usage-based |
| SMS | Telnyx | Usage-based |
| Hosting | Vercel | Free tier |
| Data | JSON files → Supabase later | Free → paid |

### Google Maps API Free Alternatives
| Alternative | Free Tier | Data Quality | Key Needed |
|------------|-----------|-------------|-----------|
| OpenStreetMap/Overpass | Unlimited | Location/category only, no emails | No |
| Yelp Fusion | 5,000/day | Good: name, phone, reviews, categories | Yes (free) |
| Foursquare Places | Free tier | Good: name, location, category | Yes (free) |
| Bing Maps | 125K/yr | Good: geocoding, search | Yes (free) |
| HERE Places | Free tier | Good: search, details | Yes (free) |

**Recommendation:** Start with Yelp Fusion (free, richest business data), add Google Places later if budget allows.