#!/usr/bin/env python3
"""
Generate live conversion-stats.json from leads + prototypes + outreach.

Output:
  - Total counts: leads, prototypes, emails drafted, sent, replied, won
  - By industry breakdown
  - By email angle (from outreach logs)
  - By lead score bucket
  - By source (discovery method)

Usage:
    python3 update_conversion_stats.py
"""

import json
import os
from datetime import datetime, timezone
from collections import defaultdict

LEADS_PATH = "data/leads.json"
PROTOS_PATH = "data/prototypes.json"
OUTREACH_PATH = "data/outreach_logs.json"
CONVERSIONS_PATH = "data/conversion-stats.json"


def load_json(path, default):
    if not os.path.exists(path):
        return default
    with open(path) as f:
        return json.load(f)


def score_bucket(score):
    if score >= 80:
        return "80-100"
    elif score >= 65:
        return "65-79"
    elif score >= 50:
        return "50-64"
    elif score >= 35:
        return "35-49"
    else:
        return "0-34"


def main():
    leads = load_json(LEADS_PATH, [])
    prototypes = load_json(PROTOS_PATH, [])
    outreach_log = load_json(OUTREACH_PATH, {"logs": []})
    # Some pipelines store outreach as a bare list; normalize to list of records.
    if isinstance(outreach_log, list):
        outreach_records = outreach_log
    else:
        outreach_records = outreach_log.get("logs", [])

    # Lead -> prototype count map
    protos_by_lead = defaultdict(list)
    for p in prototypes:
        protos_by_lead[p["lead_id"]].append(p)

    # Lead -> outreach records map
    outreach_by_lead = defaultdict(list)
    for r in outreach_records:
        outreach_by_lead[r["lead_id"]].append(r)

    # Aggregate
    by_industry = defaultdict(lambda: {"leads": 0, "prototypes": 0, "emails_sent": 0, "replies": 0, "won": 0})
    by_score = defaultdict(lambda: {"sent": 0, "replied": 0, "won": 0})
    by_source = defaultdict(lambda: {"leads": 0, "avg_score": 0})
    by_angle = defaultdict(lambda: {"sent": 0, "replied": 0, "won": 0})

    won_count = 0
    replied_count = 0
    sent_count = 0
    drafts_count = 0

    for lead in leads:
        industry = lead.get("industry", "unknown")
        source = (lead.get("source_urls") or ["unknown"])[0] if lead.get("source_urls") else "unknown"
        score = lead.get("lead_score", 0)

        by_industry[industry]["leads"] += 1
        by_source[source]["leads"] += 1

        if protos_by_lead.get(lead["id"]):
            by_industry[industry]["prototypes"] += 1

        # Outreach metrics
        records = outreach_by_lead.get(lead["id"], [])
        for r in records:
            if r.get("status") == "drafted":
                drafts_count += 1
            if r.get("status") == "sent":
                sent_count += 1
                by_industry[industry]["emails_sent"] += 1
                bucket = score_bucket(score)
                by_score[bucket]["sent"] += 1
                angle = r.get("angle", "unknown")
                by_angle[angle]["sent"] += 1
            elif r.get("status") == "replied":
                replied_count += 1
                by_industry[industry]["replies"] += 1
            elif r.get("status") == "won":
                won_count += 1
                by_industry[industry]["won"] += 1

    # Average lead score by source
    for source in by_source:
        source_leads = [l for l in leads if (l.get("source_urls") or ["unknown"])[0] == source]
        if source_leads:
            avg = sum(l.get("lead_score", 0) for l in source_leads) / len(source_leads)
            by_source[source]["avg_score"] = round(avg, 1)

    # Build output
    output = {
        "_meta": {
            "generated_at": datetime.now(timezone.utc).isoformat() + "Z",
            "data_sources": [LEADS_PATH, PROTOS_PATH, OUTREACH_PATH],
        },
        "total_leads": len(leads),
        "total_prototypes": len(prototypes),
        "total_emails_drafted": drafts_count,
        "total_emails_sent": sent_count,
        "total_replies": replied_count,
        "total_conversions": won_count,
        "by_industry": dict(by_industry),
        "by_email_angle": dict(by_angle),
        "by_lead_score_bucket": dict(by_score),
        "by_source": dict(by_source),
    }

    with open(CONVERSIONS_PATH, "w") as f:
        json.dump(output, f, indent=2)
    print(f"Updated {CONVERSIONS_PATH}")
    print(f"  leads: {len(leads)} | prototypes: {len(prototypes)} | emails drafted: {drafts_count} | sent: {sent_count} | replied: {replied_count} | won: {won_count}")


if __name__ == "__main__":
    main()