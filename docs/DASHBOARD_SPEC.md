# DASHBOARD_SPEC.md (MVP)

## Access
- Route: `/admin`
- Protection: Server-side password (env var hash)
- Cookie-based session
- No password in frontend code
- No private data in public bundles

## Lead Table
| Column | Description |
|--------|-------------|
| Business name | — |
| City/Province | — |
| Industry | — |
| Lead score | /100 |
| Website status | none / weak / ugly / broken |
| Email found | yes/no + source |
| Prototype URL | link to preview |
| Screenshot | thumbnail |
| Outreach status | not sent / sent / replied / won / lost |
| Email sent date | — |
| Next action | — |
| Notes | — |

## Actions
- Open prototype (link)
- Open screenshot (image)
- View sent email body
- Mark won/lost/do-not-contact
- Approve/reject for showcase
- Archive/hide
- Add notes
- Regenerate prototype (manual trigger)

## Future (not MVP)
- Image asset review per prototype
- Cost tracking
- Agent reasoning/logs viewer
- A/B test performance dashboard
- Conversion funnel metrics