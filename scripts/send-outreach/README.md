# Outreach Email Templates

**Phase 10 — Outreach MVP**

This folder contains the *generation* side of outreach only. **Nothing in here sends email.** A separate future script (or AgentMail-backed API route) is the only thing that should ever POST a BuiltEmail.

## Files

- `templates.ts` — 4 A/B email angle templates, contact-safety gate, and email-body generator.

## Angles

Each lead gets one angle, picked deterministically by `pickAngle(slug)` so we can A/B-test cleanly:

| Key | Label | Best for |
|-----|-------|----------|
| `preview_made` | Preview made | No-website leads, design-strong industries |
| `deserves_better` | Deserves better | Outdated/ugly sites, professional services |
| `helped_neighbors` | Helped neighbors | Trades, home services |
| `noticed_gap` | Noticed a gap | Broken or missing sites, observation-first tone |

Use `rotateAngle(i)` instead if you want round-robin distribution across a batch.

## Contact-Safety Gate

Before any email is built, the lead + prototype must pass `contactSafetyGate(lead, prototype)`. It enforces the AGENT_PLAN.md §5 checklist:

1. Public business email present + valid format
2. Email source URL recorded
3. Lead status is not `do_not_contact` / `unsubscribed` / `lost`
4. Industry is not in `AVOIDED_INDUSTRIES` (cannabis / alcohol / adult / political / gambling / crypto)
5. Country is Canada
6. `lead_score >= 60`
7. Prototype exists, watermarked, demo-locked

A failed gate does NOT throw — it returns `{ ok: false, failed: [...] }` so the caller can log the decision.

## Quick usage

```ts
import {
  buildOutreach,
  contactSafetyGate,
  ANGLE_TEMPLATES,
  pickAngle,
} from "./templates";

const safety = contactSafetyGate(lead, prototype);
if (!safety.ok) {
  console.warn("skipping lead", lead.slug, safety.failed);
} else {
  const angle = pickAngle(lead.slug);
  const email = buildOutreach({ lead, prototype, angle });
  // log email to data/outreach_logs.json, never send without review
}
```

## Rules encoded here

Mirrors `docs/OUTREACH_RULES.md` and `AGENT_PLAN.md §5`:

- No exact pricing in first cold email
- Preview link + optional screenshot
- Watermarked + demo-locked prototype referenced
- Opt-out / unsubscribe URL in footer
- Sender identity present
- Industry-avoidance list enforced
- Conservative `firstNameGuess` falls back to `"there"` rather than guessing
- Outreach angle recorded in footer so we can attribute replies later
