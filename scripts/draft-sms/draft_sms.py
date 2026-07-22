#!/usr/bin/env python3
"""
Telnyx SMS drafter.

Generates a short, conservative SMS draft for a high-score lead that didn't
reply to email after a configurable delay. Drafts only — no sending.

SMS rules:
- Max 160 chars
- No links in the first message (cold SMS rules)
- One SMS only, ever
- Only for leads with score >= 70
- Only after email has been drafted (per outreach_logs.json)

Output: data/outreach/<slug>/sms.json + append to outreach_logs.json.

Usage:
    python3 draft_sms.py [--limit 20]
"""

import argparse
import json
import os
from datetime import datetime, timezone
from pathlib import Path

LEADS_PATH = "data/leads.json"
OUTREACH_LOG = "data/outreach_logs.json"
OUTREACH_DIR = "data/outreach"


def load_json(path, default):
    if not os.path.exists(path):
        return default
    with open(path) as f:
        return json.load(f)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=20)
    args = parser.parse_args()

    leads = load_json(LEADS_PATH, [])
    log = load_json(OUTREACH_LOG, [])
    # Normalize: accept flat array or legacy dict wrapper
    if isinstance(log, dict):
        log = log.get("logs", [])

    # Find leads that: have email drafted, score >= 70, no SMS sent yet
    targets = []
    for lead in leads:
        if lead.get("lead_score", 0) < 70:
            continue
        slug = lead.get("slug")
        if not slug:
            continue
        # Already have an SMS drafted or sent?
        already_sms = any(
            r.get("lead_id") == lead["id"] and r.get("channel") == "sms"
            for r in log
        )
        if already_sms:
            continue
        # Has email drafted?
        has_email = any(
            r.get("lead_id") == lead["id"] and r.get("channel") == "email"
            for r in log
        )
        if not has_email:
            continue
        targets.append(lead)

    targets = targets[:args.limit]
    print(f"Drafting SMS for {len(targets)} high-score leads (no auto-send)")

    drafted = 0
    for lead in targets:
        business_name = lead.get("business_name", "your business")
        owner_name = lead.get("contact_name")  # None if not enriched
        slug = lead["slug"]

        # Two variants: with owner name, without
        if owner_name:
            msg = (
                f"Hi {owner_name}, I sent a website preview for {business_name} "
                f"to your email a few days ago. Want me to resend? — Mehdi, Seaway Sites"
            )
        else:
            msg = (
                f"Hi, I sent a website preview for {business_name} "
                f"to your email a few days ago. Want me to resend? — Mehdi, Seaway Sites"
            )

        # Truncate to 160 chars (SMS standard)
        if len(msg) > 160:
            msg = msg[:157] + "..."

        sms = {
            "lead_slug": slug,
            "lead_id": lead["id"],
            "business_name": business_name,
            "to_phone": lead.get("phone", ""),
            "from_number": "+18253953636",  # Telnyx
            "message": msg,
            "char_count": len(msg),
            "provider": "telnyx",
            "created_at": datetime.now(timezone.utc).isoformat() + "Z",
        }

        out_dir = Path(OUTREACH_DIR) / slug
        out_dir.mkdir(parents=True, exist_ok=True)
        with open(out_dir / "sms.json", "w") as f:
            json.dump(sms, f, indent=2)

        log_entry = {
            "id": f"sms-{sum(1 for r in log if r.get('channel') == 'sms') + 1:04d}",
            "lead_id": lead["id"],
            "lead_slug": slug,
            "channel": "sms",
            "status": "drafted",
            "subject": None,
            "to_phone": sms["to_phone"],
            "from_number": sms["from_number"],
            "message": msg,
            "char_count": len(msg),
            "provider": "telnyx",
            "created_at": sms["created_at"],
            "sent_at": None,
            "replied_at": None,
            "outcome": None,
        }
        log.append(log_entry)
        drafted += 1
        print(f"  ✓ {business_name}: {len(msg)} chars -> {sms['to_phone']}")

    with open(OUTREACH_LOG, "w") as f:
        json.dump(log, f, indent=2)

    print(f"\nDrafted {drafted} SMS messages. Logged to {OUTREACH_LOG}.")


if __name__ == "__main__":
    main()