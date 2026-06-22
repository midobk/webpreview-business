#!/usr/bin/env python3
"""
Migrate SiteSprint JSON files to Supabase.

Reads:
- data/leads.json
- data/prototypes.json
- data/outreach_logs.json
- data/conversion-stats.json
- data/agentmail_inboxes.json

Writes to Supabase tables (matching scripts/supabase-schema.sql).

Usage:
    export SUPABASE_URL="https://xxx.supabase.co"
    export SUPABASE_SERVICE_ROLE_KEY="eyJ..."
    python3 migrate_to_supabase.py [--dry-run]

After running, set NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
in Vercel env vars.
"""

import argparse
import json
import os
import sys
from datetime import datetime, timezone

try:
    from supabase import create_client, Client
except ImportError:
    print("Installing supabase-py...")
    os.system(f"{sys.executable} -m pip install supabase")
    from supabase import create_client, Client


SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")


def get_client() -> Client:
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")
        print("  export SUPABASE_URL=https://xxx.supabase.co")
        print("  export SUPABASE_SERVICE_ROLE_KEY=eyJ...")
        sys.exit(1)
    return create_client(SUPABASE_URL, SUPABASE_KEY)


def load_json(path, default):
    if not os.path.exists(path):
        return default
    with open(path) as f:
        return json.load(f)


def normalize_dt(value):
    """Convert date strings to ISO 8601 format that Supabase accepts."""
    if not value:
        return None
    if isinstance(value, str):
        # Try parsing and reformatting
        try:
            # Already ISO-ish
            if "T" in value and ("Z" in value or "+" in value[10:]):
                return value
            # Try various formats
            for fmt in ("%Y-%m-%dT%H:%M:%S.%fZ", "%Y-%m-%dT%H:%M:%SZ", "%Y-%m-%dT%H:%M:%S",
                        "%Y-%m-%d %H:%M:%S", "%Y-%m-%d"):
                try:
                    dt = datetime.strptime(value, fmt)
                    return dt.replace(tzinfo=timezone.utc).isoformat()
                except ValueError:
                    continue
            return value  # give up, return as-is
        except Exception:
            return value
    return value


def prepare_lead(lead):
    """Convert lead dict to Supabase row format."""
    row = dict(lead)
    # JSONB columns
    for key in ("social_urls", "source_urls", "types", "services"):
        if key in row and isinstance(row[key], list):
            row[key] = row[key]
    # Timestamp fields
    for key in ("created_at", "updated_at", "enriched_at"):
        if key in row:
            row[key] = normalize_dt(row[key])
    return row


def prepare_prototype(proto):
    row = dict(proto)
    for key in ("created_at", "updated_at", "showcase_scored_at"):
        if key in row:
            row[key] = normalize_dt(row[key])
    return row


def prepare_outreach(log):
    row = dict(log)
    for key in ("created_at", "sent_at", "replied_at"):
        if key in row:
            row[key] = normalize_dt(row[key])
    return row


def prepare_inbox(inbox):
    row = dict(inbox)
    for key in ("created_at", "updated_at"):
        if key in row:
            row[key] = normalize_dt(row[key])
    return row


def migrate_leads(supabase: Client, dry_run: bool):
    leads = load_json("data/leads.json", [])
    print(f"\n[leads] {len(leads)} records")
    if dry_run:
        print("  (dry run)")
        return

    rows = [prepare_lead(l) for l in leads]
    # Upsert in batches of 100
    for i in range(0, len(rows), 100):
        batch = rows[i:i+100]
        supabase.table("leads").upsert(batch).execute()
        print(f"  ✓ upserted {i+len(batch)}/{len(rows)}")


def migrate_prototypes(supabase: Client, dry_run: bool):
    protos = load_json("data/prototypes.json", [])
    print(f"\n[prototypes] {len(protos)} records")
    if dry_run:
        print("  (dry run)")
        return

    rows = [prepare_prototype(p) for p in protos]
    for i in range(0, len(rows), 100):
        batch = rows[i:i+100]
        supabase.table("prototypes").upsert(batch).execute()
        print(f"  ✓ upserted {i+len(batch)}/{len(rows)}")


def migrate_outreach(supabase: Client, dry_run: bool):
    log = load_json("data/outreach_logs.json", {"logs": []})
    records = log.get("logs", [])
    print(f"\n[outreach_logs] {len(records)} records")
    if dry_run:
        print("  (dry run)")
        return

    rows = [prepare_outreach(r) for r in records]
    for i in range(0, len(rows), 100):
        batch = rows[i:i+100]
        supabase.table("outreach_logs").upsert(batch).execute()
        print(f"  ✓ upserted {i+len(batch)}/{len(rows)}")


def migrate_inboxes(supabase: Client, dry_run: bool):
    data = load_json("data/agentmail_inboxes.json", {"inboxes": []})
    inboxes = data.get("inboxes", [])
    print(f"\n[agentmail_inboxes] {len(inboxes)} records")
    if dry_run:
        print("  (dry run)")
        return

    rows = [prepare_inbox(i) for i in inboxes]
    for i in range(0, len(rows), 100):
        batch = rows[i:i+100]
        supabase.table("agentmail_inboxes").upsert(batch).execute()
        print(f"  ✓ upserted {i+len(batch)}/{len(rows)}")


def migrate_conversion_stats(supabase: Client, dry_run: bool):
    stats = load_json("data/conversion-stats.json", {})
    print(f"\n[conversion_stats] 1 record (snapshot)")
    if dry_run:
        print("  (dry run)")
        return

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
    supabase.table("conversion_stats").upsert(row).execute()
    print(f"  ✓ conversion stats upserted")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    if args.dry_run:
        print("=== DRY RUN (no writes) ===\n")
    else:
        print("=== MIGRATING TO SUPABASE ===\n")

    supabase = get_client() if not args.dry_run else None

    migrate_leads(supabase, args.dry_run)
    migrate_prototypes(supabase, args.dry_run)
    migrate_outreach(supabase, args.dry_run)
    migrate_inboxes(supabase, args.dry_run)
    migrate_conversion_stats(supabase, args.dry_run)

    print("\n✓ Done!")


if __name__ == "__main__":
    main()