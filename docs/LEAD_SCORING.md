# LEAD_SCORING.md

## Score Dimensions (100 total)

| Category | Max | What to check |
|----------|----:|---------------|
| No/ugly/broken website | 20 | No website = 20, broken = 15, ugly/outdated = 10, decent = 0 |
| Public business email | 20 | Found = 20, contact form only = 10, none = 0 |
| Enough info for copy | 15 | Rich description + services = 15, basic = 8, minimal = 0 |
| Clear services | 10 | Listed services = 10, vague = 5, unclear = 0 |
| Landing-page fit | 15 | Simple service = 15, moderate = 8, complex = 0 |
| Visual potential | 15 | Strong industry visuals = 15, moderate = 8, weak = 0 |
| Canada-based | 10 | Yes = 10, no = 0 |
| Small business | 10 | Solo/small = 10, medium = 5, chain = 0 |
| Social activity | 5 | Active social profiles = 5, present = 3, absent = 0 |
| Reviews/ratings | 5 | Rich reviews = 5, some = 3, none = 0 |

## Decision Thresholds

| Score | Action |
|-------|--------|
| 80+ | Auto-generate prototype |
| 65-79 | Generate if agent believes in it (log reasoning) |
| 50-64 | Flag for manual review |
| 35-49 | Save for later |
| <35 | Ignore |

## Leniency Rule
Agent may proceed on imperfect scores when:
- Industry has strong visual appeal (food, beauty, trades)
- No website at all (high need)
- Active social media with good photos
- Clear service offering despite limited copy

Log reasoning: "Score: 72/100, but prototype generated because [reason]."