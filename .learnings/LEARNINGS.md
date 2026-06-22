# SiteSprint Learnings

## Email Angles
| Date | Angle | Industry | Lead Score | Replied? | Notes |
|------|-------|----------|------------|----------|-------|

## Prototype Designs
| Date | Industry | Model | Prompt Summary | Visual Score | Images? | Notes |
|------|----------|-------|----------------|-------------|---------|-------|
| 2026-06-22 | cleaning | MiniMax M3 | Full detailed prompt with business info, demo lock, watermark | 8.5/10 | No (CSS gradients) | CSS gradients scored 8.5/10 without photos. Add real images when providers are back up for 9+. |

## Lead Sources
| Date | Source | Industry | Leads Found | Avg Score | Has Email? | Notes |
|------|--------|----------|-------------|-----------|------------|-------|
| 2026-06-22 | Google search | multiple (cleaning, auto, salon, etc.) | 8 | ~78 | 3/8 | Cornwall, ON. Browser scraping works but slow. Yelp API is NOT free (30-day trial). Google Places API ($200/mo free) is the best option. |

## Score Calibration
| Date | Lead | Predicted Score | Actual Outcome | Adjustment Needed? |
|------|------|----------------|----------------|-------------------|

## Industries
| Industry | Leads | Prototypes | Emails Sent | Replies | Conversion | Notes |
|----------|-------|-----------|-------------|---------|------------|-------|
| cleaning | 2 | 1 | 0 | 0 | 0% | Strong visual potential, good fit for landing pages |
| auto_repair | 1 | 0 | 0 | 0 | 0% | No email found — phone-only contact |
| salon | 1 | 1 | 0 | 0 | 0% | Active social media, good visual potential |

---

## Insights (2026-06-22)

### MiniMax M3 for Prototypes
- **Source:** best_practice
- **Insight:** MiniMax M3 generates high-quality HTML/CSS prototypes (8.5/10) when given detailed prompts with business context, industry info, design requirements, and demo lock instructions. CSS gradients are a strong fallback when image providers are down.
- **Action:** Always use MiniMax M3 for prototype generation. Include industry-specific design hints, color palette suggestions, and explicit demo lock + watermark instructions in the prompt.

### Vercel Read-Only Filesystem
- **Source:** knowledge_gap
- **Insight:** Vercel serverless functions have a read-only filesystem. Cannot write .password files or persist data via file writes. Must use environment variables for config and external database (Supabase) for data persistence.
- **Action:** Use env vars for all config. Plan Supabase migration for data persistence before scaling outreach.

### Yelp API Not Free
- **Source:** correction
- **Insight:** Yelp Fusion API is a 30-day free trial, NOT a permanent free tier. After trial it becomes paid (contact sales for pricing). Earlier assumption that it was "5,000 calls/day free forever" was wrong.
- **Action:** Use Google Places API ($200/mo permanent free credit) as primary discovery source. Use browser-based scraping as free fallback.

### Image Provider Failures
- **Source:** insight
- **Insight:** All three image generation providers can fail simultaneously (Google API key suspended, OpenAI at usage limit, OpenRouter out of credits). Need a reliable fallback strategy.
- **Action:** CSS gradients are a solid fallback (8.5/10). When providers are back, generate real images and compare conversion rates. Consider adding a fourth provider (e.g. FAL, Krea) for redundancy.