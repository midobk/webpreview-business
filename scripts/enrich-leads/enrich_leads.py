#!/usr/bin/env python3
"""
Browser-based lead enrichment.

Uses the OpenClaw browser tool to visit each lead's Google Maps page and
extract: business website URL, email addresses, social profiles, review count.

This is the layer on top of Google Places API (which gives us the basics)
that produces the contact info we need for outreach.

Usage:
    python3 enrich_leads.py [--limit N] [--dry-run]

When run via the agent, the agent uses the browser tool to do the actual
fetching (Python itself can't open a browser without the tool). The script
defines the data structure + scoring updates.
"""

import argparse
import json
import os
import re
from datetime import datetime, timezone

# Regex patterns for contact extraction
EMAIL_RE = re.compile(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}")
PHONE_RE = re.compile(r"\+?1?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}")

# Social profile patterns
SOCIAL_PATTERNS = {
    "facebook": re.compile(r"facebook\.com/[A-Za-z0-9._-]+"),
    "instagram": re.compile(r"instagram\.com/[A-Za-z0-9._-]+"),
    "twitter": re.compile(r"twitter\.com/[A-Za-z0-9._-]+"),
    "linkedin": re.compile(r"linkedin\.com/(?:company|in)/[A-Za-z0-9._-]+"),
    "yelp": re.compile(r"yelp\.com/biz/[A-Za-z0-9._-]+"),
}


def extract_contacts(text: str) -> dict:
    """Pull emails, phones, and social profiles from a text blob."""
    emails = list(set(EMAIL_RE.findall(text)))
    # Filter out obvious garbage
    emails = [e for e in emails if not any(
        kw in e.lower() for kw in ["example.com", "domain.com", "your-email", "noreply"]
    )]
    phones = list(set(PHONE_RE.findall(text)))
    socials = {}
    for platform, pattern in SOCIAL_PATTERNS.items():
        matches = pattern.findall(text)
        if matches:
            socials[platform] = matches[0]
    return {"emails": emails, "phones": phones, "socials": socials}


def merge_enrichment(lead: dict, enrichment: dict) -> dict:
    """Merge enrichment data into a lead, keeping first-non-empty wins."""
    out = dict(lead)
    out["email"] = out.get("email") or (enrichment.get("emails") or [None])[0]
    out["email_source_url"] = out.get("email_source_url") or enrichment.get("email_source_url")
    out["social_urls"] = list(set(
        (out.get("social_urls") or []) + list(enrichment.get("socials", {}).values())
    ))
    if enrichment.get("review_count") is not None:
        out["review_count"] = enrichment["review_count"]
    if enrichment.get("rating") is not None:
        out["rating"] = enrichment["rating"]
    out["enriched_at"] = datetime.now(timezone.utc).isoformat() + "Z"
    out["updated_at"] = out["enriched_at"]
    return out


def main():
    parser = argparse.ArgumentParser(description="Enrich leads with contact data")
    parser.add_argument("--limit", type=int, default=50, help="Max leads to enrich per run")
    parser.add_argument("--dry-run", action="store_true", help="Don't write changes")
    parser.add_argument("--only-unenriched", action="store_true", default=True, help="Skip already-enriched leads")
    args = parser.parse_args()

    leads_path = "data/leads.json"
    if not os.path.exists(leads_path):
        print(f"No {leads_path} found", flush=True)
        return

    with open(leads_path) as f:
        leads = json.load(f)

    targets = [
        l for l in leads
        if l.get("google_maps_url") and not l.get("enriched_at")
    ][:args.limit]

    print(f"Enriching {len(targets)} leads (out of {len(leads)} total)", flush=True)
    print(f"Enrichment is done by the browser tool — this script is the data layer.", flush=True)
    print(f"Agent instructions: visit each lead's google_maps_url, extract email/phone/social/review_count,", flush=True)
    print(f"then merge via merge_enrichment() and write back to {leads_path}.", flush=True)


if __name__ == "__main__":
    main()