#!/usr/bin/env python3
"""
Supabase client for the lead-to-prototype pipeline.

Reads env from .env.local (or process env). Provides:
  - get_new_leads()          → leads with status='new' (form submissions)
  - enrich_lead(lead_id, industry, city, province, score)  → update lead
  - mark_lead_status(lead_id, status)  → transition status
  - get_ready_leads_without_prototypes()  → leads ready for generation
  - insert_prototype(record)  → add prototype row
  - update_prototype(proto_id, fields)  → update prototype row
  - lead_has_prototype(lead_id)  → check if lead already has a prototype

Usage:
    python3 supabase_client.py new-leads
    python3 supabase_client.py ready-without-protos
    python3 supabase_client.py enrich <lead_id> --industry <industry> --city <city> --province <province> --score <n>
    python3 supabase_client.py set-status <lead_id> <status>
    python3 supabase_client.py insert-proto --lead-id <id> --proto-id <id> --url <path> --title <title> --model <model>
    python3 supabase_client.py update-proto <proto_id> --status <status> [--screenshot <url>] [--score <n>]
"""

import argparse
import json
import os
import sys
import urllib.request
import urllib.error
from datetime import datetime, timezone

SUPABASE_URL = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")


def _load_env():
    """Load .env.local if env vars aren't set."""
    global SUPABASE_URL, SUPABASE_KEY
    if SUPABASE_URL and SUPABASE_KEY:
        return
    env_path = os.path.join(os.path.dirname(__file__), "..", "..", ".env.local")
    if os.path.exists(env_path):
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if line.startswith("SUPABASE_URL=") and not SUPABASE_URL:
                    SUPABASE_URL = line.split("=", 1)[1].strip()
                elif line.startswith("NEXT_PUBLIC_SUPABASE_URL=") and not SUPABASE_URL:
                    SUPABASE_URL = line.split("=", 1)[1].strip()
                elif line.startswith("SUPABASE_SERVICE_ROLE_KEY=") and not SUPABASE_KEY:
                    SUPABASE_KEY = line.split("=", 1)[1].strip()


def _headers():
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
    }


def _api(method, path, body=None):
    """Make a Supabase REST API call."""
    url = f"{SUPABASE_URL}/rest/v1/{path}"
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(url, data=data, method=method, headers=_headers())
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            text = resp.read()
            return json.loads(text) if text else []
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        print(f"Supabase API error {e.code}: {body}", file=sys.stderr)
        raise


def get_new_leads():
    """Get all leads with status='new' (form submissions awaiting enrichment)."""
    return _api("GET", "leads?select=*&status=eq.new&order=created_at.asc&limit=50")


def get_ready_leads_without_prototypes():
    """Get leads with status='ready_for_prototype' that don't have a prototype yet."""
    ready = _api("GET", "leads?select=*&status=eq.ready_for_prototype&order=lead_score.desc&limit=50")
    if not ready:
        return []
    # Check which ones already have prototypes
    lead_ids = [l["id"] for l in ready]
    # Fetch in batches (URL length limit)
    existing = set()
    for i in range(0, len(lead_ids), 20):
        batch = lead_ids[i:i+20]
        ids_param = ",".join(batch)
        protos = _api("GET", f"prototypes?select=lead_id&lead_id=in.({ids_param})")
        for p in protos:
            if p.get("lead_id"):
                existing.add(p["lead_id"])
    return [l for l in ready if l["id"] not in existing]


def enrich_lead(lead_id, industry, city=None, province=None, score=None, reasoning=None):
    """Enrich a lead with industry, location, and score."""
    updates = {
        "industry": industry,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    if city:
        updates["city"] = city
    if province:
        updates["province"] = province
    if score is not None:
        updates["lead_score"] = score
    if reasoning:
        updates["score_reasoning"] = reasoning
    updates["enriched_at"] = datetime.now(timezone.utc).isoformat()

    _api("PATCH", f"leads?id=eq.{lead_id}", updates)
    print(f"  ✓ Enriched {lead_id}: industry={industry}, score={score}")


def mark_lead_status(lead_id, status):
    """Transition a lead's status."""
    updates = {
        "status": status,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    _api("PATCH", f"leads?id=eq.{lead_id}", updates)
    print(f"  ✓ Lead {lead_id} → status={status}")


def insert_prototype(lead_id, proto_id, prototype_url, title, model, design_summary=None, industry=None):
    """Insert a new prototype record."""
    now = datetime.now(timezone.utc).isoformat()
    record = {
        "id": proto_id,
        "lead_id": lead_id,
        "variant": 1,
        "prototype_url": prototype_url,
        "screenshot_url": None,
        "title": title,
        "design_summary": design_summary or f"Generated for lead {lead_id}",
        "prototype_score": None,
        "generation_model": model,
        "generation_prompt": None,
        "generation_status": "pending_review",
        "watermark_enabled": True,
        "demo_locked": True,
        "showcase_eligible": False,
        "showcase_approved": False,
        "anonymized": False,
        "industry": industry,
        "created_at": now,
        "updated_at": now,
    }
    _api("POST", "prototypes", record)
    print(f"  ✓ Prototype inserted: {proto_id}")


def update_prototype(proto_id, status=None, screenshot_url=None, score=None, showcase_eligible=None):
    """Update a prototype record."""
    updates = {"updated_at": datetime.now(timezone.utc).isoformat()}
    if status:
        updates["generation_status"] = status
    if screenshot_url:
        updates["screenshot_url"] = screenshot_url
    if score is not None:
        updates["prototype_score"] = score
    if showcase_eligible is not None:
        updates["showcase_eligible"] = showcase_eligible
    _api("PATCH", f"prototypes?id=eq.{proto_id}", updates)
    print(f"  ✓ Prototype {proto_id} updated: {updates}")


# ─── Industry classification ───

INDUSTRY_KEYWORDS = {
    "barber": ["barber", "haircut", "fade", "clipper", "shave", "grooming"],
    "salon": ["salon", "hair", "stylist", "beauty", "cosmetology", "hairstyling"],
    "restaurant": ["restaurant", "dining", "food", "eat", "grill", "kitchen", "bistro", "cafe", "diner"],
    "pizza": ["pizza", "pizzeria", "italian"],
    "pub": ["pub", "bar", "tavern", "brewery", "tap"],
    "cleaning": ["cleaning", "clean", "janitorial", "maid"],
    "auto_repair": ["auto", "mechanic", "car repair", "garage", "automotive"],
    "plumber": ["plumb", "pipe", "drain", "leak"],
    "electrician": ["electric", "wiring", "electrical"],
    "landscaping": ["landscap", "lawn", "garden", "yard", "grounds"],
    "contractor": ["contractor", "renovation", "remodel", "construction", "builder"],
    "dental": ["dental", "dentist", "teeth", "orthodont"],
    "fitness": ["gym", "fitness", "workout", "training", "crossfit"],
    "legal": ["law", "legal", "attorney", "lawyer", "notary"],
    "real_estate": ["real estate", "realty", "property", "realtor"],
    "accounting": ["account", "tax", "bookkeeping", "finance"],
    "veterinary": ["vet", "veterinary", "animal", "pet"],
    "pharmacy": ["pharmacy", "drug", "medication"],
    "photography": ["photo", "photography", "portrait", "studio"],
    "tutor": ["tutor", "learning", "education", "teaching"],
    "ecommerce": ["shop", "store", "retail", "ecommerce", "boutique"],
}


def classify_industry(business_name, description=None, website_url=None):
    """Classify industry from business name and description using keyword matching."""
    text = f"{business_name} {description or ''} {website_url or ''}".lower()
    scores = {}
    for industry, keywords in INDUSTRY_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in text)
        if score > 0:
            scores[industry] = score
    if scores:
        return max(scores, key=scores.get)
    return "service"  # default


def score_lead(lead):
    """Simple scoring for form-submitted leads (0-100)."""
    score = 0
    # Has website to reference
    if lead.get("website_url"):
        score += 15
    # Has description/message
    if lead.get("description"):
        score += 10
    # Has email (required, but confirm)
    if lead.get("email"):
        score += 5
    # Industry classified
    if lead.get("industry") and lead["industry"] != "service":
        score += 10
    # Form submission = high intent (they asked for a preview)
    score += 40
    return min(score, 100)


def main():
    _load_env()
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required", file=sys.stderr)
        sys.exit(1)

    parser = argparse.ArgumentParser(description="Supabase pipeline client")
    sub = parser.add_subparsers(dest="command")

    sub.add_parser("new-leads", help="Get leads with status=new")
    sub.add_parser("ready-without-protos", help="Get ready leads without prototypes")

    enrich_p = sub.add_parser("enrich", help="Enrich a lead")
    enrich_p.add_argument("lead_id")
    enrich_p.add_argument("--industry", required=True)
    enrich_p.add_argument("--city")
    enrich_p.add_argument("--province")
    enrich_p.add_argument("--score", type=int)
    enrich_p.add_argument("--reasoning")

    status_p = sub.add_parser("set-status", help="Change lead status")
    status_p.add_argument("lead_id")
    status_p.add_argument("status")

    insert_p = sub.add_parser("insert-proto", help="Insert prototype record")
    insert_p.add_argument("--lead-id", required=True)
    insert_p.add_argument("--proto-id", required=True)
    insert_p.add_argument("--url", required=True)
    insert_p.add_argument("--title", required=True)
    insert_p.add_argument("--model", default="minimax-m3:cloud")
    insert_p.add_argument("--summary")
    insert_p.add_argument("--industry")

    update_p = sub.add_parser("update-proto", help="Update prototype record")
    update_p.add_argument("proto_id")
    update_p.add_argument("--status")
    update_p.add_argument("--screenshot")
    update_p.add_argument("--score", type=int)
    update_p.add_argument("--showcase-eligible", type=bool)

    # Convenience: enrich all new leads automatically
    auto_p = sub.add_parser("auto-enrich", help="Auto-enrich all new leads and mark ready_for_prototype")

    args = parser.parse_args()

    if args.command == "new-leads":
        leads = get_new_leads()
        print(json.dumps(leads, indent=2, default=str))

    elif args.command == "ready-without-protos":
        leads = get_ready_leads_without_prototypes()
        print(json.dumps(leads, indent=2, default=str))

    elif args.command == "enrich":
        enrich_lead(args.lead_id, args.industry, args.city, args.province, args.score, args.reasoning)

    elif args.command == "set-status":
        mark_lead_status(args.lead_id, args.status)

    elif args.command == "insert-proto":
        insert_prototype(args.lead_id, args.proto_id, args.url, args.title, args.model, args.summary, args.industry)

    elif args.command == "update-proto":
        update_prototype(args.proto_id, args.status, args.screenshot, args.score)

    elif args.command == "auto-enrich":
        leads = get_new_leads()
        if not leads:
            print("No new leads to enrich.")
            return
        print(f"Enriching {len(leads)} new leads...")
        for lead in leads:
            industry = classify_industry(
                lead.get("business_name", ""),
                lead.get("description"),
                lead.get("website_url"),
            )
            score = score_lead({**lead, "industry": industry})
            reasoning = f"Form submission. Industry={industry} (keyword match). Score={score}."
            enrich_lead(lead["id"], industry, lead.get("city"), lead.get("province"), score, reasoning)
            mark_lead_status(lead["id"], "ready_for_prototype")
        print(f"Done. {len(leads)} leads enriched and marked ready_for_prototype.")

    else:
        parser.print_help()


if __name__ == "__main__":
    main()