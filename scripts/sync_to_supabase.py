#!/usr/bin/env python3
"""
Sync local JSON files to Supabase.

Run this after any pipeline operation (discovery, scoring, prototyping, 
email drafting) to push local changes to the live Supabase database that
the Vercel dashboard reads from.

Usage:
    export SUPABASE_URL="https://xxx.supabase.co"
    export SUPABASE_SERVICE_ROLE_KEY="***"
    python3 sync_to_supabase.py              # sync everything
    python3 sync_to_supabase.py --only leads # sync just leads
    python3 sync_to_supabase.py --only leads,prototypes
"""

import argparse
import json
import os
import re
import sys
from datetime import datetime, timezone

try:
    from supabase import create_client
except ImportError:
    os.system(f"{sys.executable} -m pip install supabase --break-system-packages --quiet")
    from supabase import create_client

LEADS_PATH = "data/leads.json"
PROTOS_PATH = "data/prototypes.json"
OUTREACH_PATH = "data/outreach_logs.json"
STATS_PATH = "data/conversion-stats.json"
INBOXES_PATH = "data/agentmail_inboxes.json"

LEAD_COLUMNS = {
    "id", "business_name", "slug", "industry", "city", "province", "country",
    "address", "phone", "email", "email_source_url", "website_url", "website_status",
    "google_maps_url", "social_urls", "source_urls", "place_id", "types", "description",
    "services", "lead_score", "score_reasoning", "complexity_level",
    "contact_safety_status", "contact_safety_reasoning", "status", "notes",
    "review_count", "rating", "enriched_at", "created_at", "updated_at",
}

PROTOTYPE_COLUMNS = {
    "id", "lead_id", "variant", "variant_name", "prototype_url", "screenshot_url",
    "title", "design_summary", "prototype_score", "generation_model", "generation_prompt",
    "generation_status", "watermark_enabled", "demo_locked", "showcase_eligible",
    "showcase_approved", "showcase_score", "showcase_issues", "anonymized",
    "showcase_anonymized_html_path", "showcase_scored_at", "created_at", "updated_at",
}

OUTREACH_COLUMNS = {
    "id", "lead_id", "lead_slug", "channel", "status", "subject", "message",
    "angle", "to_email", "to_phone", "from_address", "from_number",
    "char_count", "provider", "created_at", "sent_at", "replied_at", "outcome",
}


def normalize_dt(value):
    if not value:
        return None
    if isinstance(value, str):
        cleaned = re.sub(r"(\+[\d:]+)Z$", r"\1", value)
        cleaned = re.sub(r"(\+0000)Z$", r"Z", cleaned)
        has_offset = bool(re.search(r"[Zz]$|[+\-]\d{2}:?\d{2}$", cleaned))
        if not has_offset:
            cleaned = cleaned + "Z" if "T" in cleaned else cleaned
        return cleaned
    return value


def strip_extra(row, allowed):
    return {k: v for k, v in row.items() if k in allowed}


def load_json(path, fallback):
    if not os.path.exists(path):
        return fallback
    with open(path) as f:
        return json.load(f)


def get_client():
    url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        print("ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set", file=sys.stderr)
        print("  export SUPABASE_URL=https://xxx.supabase.co", file=sys.stderr)
        print("  export SUPABASE_SERVICE_ROLE_KEY=***", file=sys.stderr)
        sys.exit(1)
    return create_client(url, key)


def sync_leads(sb):
    leads = load_json(LEADS_PATH, [])
    print(f"[leads] {len(leads)} records", end=" ")
    rows = []
    for l in leads:
        row = dict(l)
        for k in ("created_at", "updated_at", "enriched_at"):
            if k in row:
                row[k] = normalize_dt(row[k])
        for k in ("social_urls", "source_urls", "types", "services"):
            if k in row and not isinstance(row[k], list):
                row[k] = []
        rows.append(strip_extra(row, LEAD_COLUMNS))
    for i in range(0, len(rows), 100):
        sb.table("leads").upsert(rows[i:i+100]).execute()
    print("✓")


def sync_prototypes(sb):
    protos = load_json(PROTOS_PATH, [])
    print(f"[prototypes] {len(protos)} records", end=" ")
    rows = []
    for p in protos:
        row = dict(p)
        for k in ("created_at", "updated_at", "showcase_scored_at"):
            if k in row:
                row[k] = normalize_dt(row[k])
        for k in ("showcase_issues",):
            if k in row and not isinstance(row[k], list):
                row[k] = []
        rows.append(strip_extra(row, PROTOTYPE_COLUMNS))
    for i in range(0, len(rows), 100):
        sb.table("prototypes").upsert(rows[i:i+100]).execute()
    print("✓")


def sync_outreach(sb):
    log = load_json(OUTREACH_PATH, {"logs": []})
    records = log.get("logs", [])
    print(f"[outreach_logs] {len(records)} records", end=" ")
    rows = []
    for r in records:
        row = dict(r)
        for k in ("created_at", "sent_at", "replied_at"):
            if k in row:
                row[k] = normalize_dt(row[k])
        rows.append(strip_extra(row, OUTREACH_COLUMNS))
    for i in range(0, len(rows), 100):
        sb.table("outreach_logs").upsert(rows[i:i+100]).execute()
    print("✓")


def sync_stats(sb):
    stats = load_json(STATS_PATH, {})
    print(f"[conversion_stats] snapshot", end=" ")
    row = {
        "id": 1,
        "generated_at": normalize_dt(stats.get("_meta", {}).get("generated_at") or datetime.now(timezone.utc).isoformat()),
        "total_leads": stats.get("total_leads", 0),
        "total_prototypes": stats.get("total_prototypes", 0),
        "total_emails_drafted": stats.get("total_emails_drafted", 0),
        "total_emails_sent": stats.get("total_emails_sent", 0),
        "total_replies": stats.get("total_replies", 0),
        "total_conversions": stats.get("total_conversions", 0),
        "by_industry": stats.get("by_industry", {}),
        "by_email_angle": stats.get("by_email_angle", {}),
        "by_lead_score_bucket": stats.get("by_lead_score_bucket", {}),
        "by_source": stats.get("by_source", {}),
    }
    sb.table("conversion_stats").upsert(row).execute()
    print("✓")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--only", default=None, help="Comma-separated list of tables to sync")
    args = parser.parse_args()

    sb = get_client()

    tables = {
        "leads": sync_leads,
        "prototypes": sync_prototypes,
        "outreach": sync_outreach,
        "stats": sync_stats,
    }

    if args.only:
        selected = args.only.split(",")
    else:
        selected = list(tables.keys())

    print("Syncing to Supabase...")
    for name in selected:
        if name in tables:
            tables[name](sb)
    print("Done!")


if __name__ == "__main__":
    main()