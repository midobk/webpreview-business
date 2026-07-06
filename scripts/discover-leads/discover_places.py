#!/usr/bin/env python3
"""
Google Places API (New) lead discovery for SiteSprint.

Uses the Places API (New) Text Search + Place Details endpoints to find
local businesses without websites in a given city/region.

Environment:
    GOOGLE_PLACES_API_KEY — required (from GCP console)
    GOOGLE_PLACES_REGION  — optional, default "ca" (ISO 3166-1 alpha-2 lowercase)

Usage:
    python3 discover_places.py [--city "Cornwall, ON"] [--industry "cleaning service"]
    python3 discover_places.py --all   # runs all default industries
"""

import argparse
import json
import os
import sys
import time
import urllib.request
import urllib.error
from datetime import datetime, timezone

# Force UTF-8 stdout so em-dashes / non-ASCII place names don't crash on latin-1 consoles.
try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

API_BASE = "https://places.googleapis.com/v1/places:searchText"
DETAILS_BASE = "https://places.googleapis.com/v1/places/{place_id}"

DEFAULT_INDUSTRIES = [
    "cleaning service",
    "hair salon",
    "auto repair",
    "landscaping",
    "restaurant",
    "barber",
    "plumber",
    "electrician",
    "contractor",
    "tutor",
    "dentist",
    "chiropractor",
    "real estate agency",
    "insurance broker",
    "accounting firm",
    "lawyer",
    "florist",
    "bakery",
    "gym",
    "photographer",
]

TIER1_CITIES = [
    "Cornwall, Ontario",
    "Ottawa, Ontario",
    "Kingston, Ontario",
    "Belleville, Ontario",
    "Peterborough, Ontario",
    "Brockville, Ontario",
    "Hawkesbury, Ontario",
    "Pembroke, Ontario",
    "Smiths Falls, Ontario",
    "Gatineau, Quebec",
]

TIER2_CITIES = [
    "Montreal, Quebec",
    "Toronto, Ontario",
    "Hamilton, Ontario",
    "London, Ontario",
    "Kitchener, Ontario",
    "Windsor, Ontario",
    "Sudbury, Ontario",
    "Thunder Bay, Ontario",
    "Barrie, Ontario",
    "Oshawa, Ontario",
]

TIER3_CITIES = [
    "Sherbrooke, Quebec",
    "Trois-Rivieres, Quebec",
    "Saguenay, Quebec",
    "Levis, Quebec",
    "Saint-Jean-sur-Richelieu, Quebec",
    "Granby, Quebec",
    "Drummondville, Quebec",
    "Sorel-Tracy, Quebec",
    "Joliette, Quebec",
    "Val-d'Or, Quebec",
]

DEFAULT_CITIES = TIER1_CITIES


def get_api_key():
    key = os.environ.get("GOOGLE_PLACES_API_KEY")
    if not key:
        print("ERROR: GOOGLE_PLACES_API_KEY env var is not set.", file=sys.stderr)
        sys.exit(1)
    # Guard against placeholder/display values like "AIzaSy…Xezg" — the unicode
    # ellipsis (…) is not valid in a real key and would crash urllib on the
    # first request with a misleading 'latin-1 codec' error.
    if "…" in key or "..." in key or len(key) < 20 or not key.startswith("AIza"):
        print(
            "ERROR: GOOGLE_PLACES_API_KEY looks like a placeholder/display value, not a real key.\n"
            f"  Got: {key[:6]}…{key[-4:]} (len={len(key)})\n"
            "  Expected: an AIzaSy… string of ~39 characters from the Google Cloud Console.\n"
            "  → Open https://console.cloud.google.com/apis/credentials, copy the FULL key, "
            "and update .env.local (then re-source it).",
            file=sys.stderr,
        )
        sys.exit(2)
    return key


def search_places(api_key, query, region="ca", page_token=None):
    """Text Search via Places API (New)."""
    payload = {
        "textQuery": query,
        "languageCode": "en",
        "regionCode": region,
        "pageSize": 20,
    }
    if page_token:
        payload["pageToken"] = page_token

    body = json.dumps(payload).encode()
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": api_key,
        "X-Goog-FieldMask": (
            "places.id,places.displayName,places.formattedAddress,"
            "places.internationalPhoneNumber,places.websiteUri,"
            "places.googleMapsUri,places.types,nextPageToken"
        ),
    }
    req = urllib.request.Request(API_BASE, data=body, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read())
    except urllib.error.HTTPError as e:
        err_body = e.read().decode() if e.fp else ""
        print(f"HTTP {e.code}: {err_body}", file=sys.stderr)
        if e.code == 429:
            print("Rate limited — waiting 2s and retrying...", file=sys.stderr)
            time.sleep(2)
            return search_places(api_key, query, region, page_token)
        raise
    return data


def collect_businesses(api_key, query, region="ca", max_pages=3):
    """Paginate through search results."""
    all_places = []
    token = None
    for page in range(max_pages):
        result = search_places(api_key, query, region, token)
        places = result.get("places", [])
        all_places.extend(places)
        token = result.get("nextPageToken")
        if not token:
            break
        time.sleep(1.5)  # token needs a moment to activate
    return all_places


def filter_no_website(places):
    """Keep only places without a website — prime SiteSprint leads."""
    return [p for p in places if not p.get("websiteUri")]


def place_to_lead(place, industry, city, province, existing_count):
    """Convert a Google Place to SiteSprint lead format."""
    display_name = place.get("displayName", {}).get("text", "Unknown")
    slug = display_name.lower().replace(" ", "-").replace("'", "").replace("&", "and")
    return {
        "id": f"lead-{existing_count + 1:03d}",
        "business_name": display_name,
        "slug": slug,
        "industry": industry,
        "city": city,
        "province": province,
        "country": "Canada",
        "address": place.get("formattedAddress", ""),
        "phone": place.get("internationalPhoneNumber", ""),
        "email": None,
        "email_source_url": None,
        "website_url": place.get("websiteUri"),
        "website_status": "none" if not place.get("websiteUri") else "unknown",
        "google_maps_url": place.get("googleMapsUri"),
        "social_urls": [],
        "source_urls": [place.get("googleMapsUri", "")],
        "place_id": place.get("id"),
        "types": place.get("types", []),
        "description": f"Local {industry} business in {city}, {province}.",
        "services": [],
        "lead_score": 0,
        "score_reasoning": None,
        "complexity_level": "unknown",
        "contact_safety_status": "pending",
        "contact_safety_reasoning": None,
        "status": "discovered",
        "created_at": datetime.now(timezone.utc).isoformat() + "Z",
        "updated_at": datetime.now(timezone.utc).isoformat() + "Z",
    }


def load_existing_leads():
    project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    leads_file = os.path.join(project_root, "data", "leads.json")
    if os.path.exists(leads_file):
        with open(leads_file, "r") as f:
            return json.load(f)
    return []


def save_leads(leads):
    project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    leads_file = os.path.join(project_root, "data", "leads.json")
    os.makedirs(os.path.dirname(leads_file), exist_ok=True)
    with open(leads_file, "w") as f:
        json.dump(leads, f, indent=2)


def main():
    parser = argparse.ArgumentParser(description="Discover leads via Google Places API")
    parser.add_argument("--city", default=None, help="City to search in (default: all 10 cities)")
    parser.add_argument("--industry", default=None, help="Single industry to search")
    parser.add_argument("--tier", type=int, default=1, choices=[1,2,3], help="City tier to search (1=local, 2=major, 3=quebec)")
    parser.add_argument("--all", action="store_true", help="Run all default industries across default cities")
    parser.add_argument("--all-tiers", action="store_true", help="Run all industries across all 3 city tiers")
    parser.add_argument("--test", action="store_true", help="Single query test mode")
    args = parser.parse_args()

    api_key = get_api_key()
    region = os.environ.get("GOOGLE_PLACES_REGION", "ca").lower()

    city = None
    province = ""
    if args.city:
        city = args.city.split(",")[0].strip()
        province = args.city.split(",")[1].strip() if "," in args.city else ""

    if args.test:
        industries = ["coffee shop"]
        cities = ["Cornwall, Ontario"]
    elif args.industry:
        industries = [args.industry]
        cities = [args.city] if args.city else ["Cornwall, Ontario"]
    elif args.all_tiers:
        industries = DEFAULT_INDUSTRIES
        cities = TIER1_CITIES + TIER2_CITIES + TIER3_CITIES
    elif args.all:
        if args.tier == 1:
            cities = TIER1_CITIES
        elif args.tier == 2:
            cities = TIER2_CITIES
        elif args.tier == 3:
            cities = TIER3_CITIES
        industries = DEFAULT_INDUSTRIES
    elif args.city:
        industries = DEFAULT_INDUSTRIES
        cities = [args.city]
    else:
        print("Specify --city <name>, --all [--tier 1|2|3], --all-tiers, --industry <name>, or --test")
        sys.exit(1)

    existing_leads = load_existing_leads()
    existing_names = {l["business_name"] for l in existing_leads}
    new_leads = []
    total_requests = 0

    for city_query in cities:
        city = city_query.split(",")[0].strip()
        province = city_query.split(",")[1].strip() if "," in city_query else ""
        print(f"\n{'='*60}")
        print(f"City: {city}, {province}")
        print(f"{'='*60}")

        for industry in industries:
            query = f"{industry} in {city_query}"
            print(f"\nSearching: {query}")
            try:
                places = collect_businesses(api_key, query, region)
                total_requests += min(3, (len(places) + 19) // 20)
            except Exception as e:
                print(f"  ERROR for '{industry}': {e}", file=sys.stderr)
                continue

            no_site = filter_no_website(places)
            print(f"  Found {len(places)} places, {len(no_site)} without websites")

            for place in no_site:
                name = place.get("displayName", {}).get("text", "")
                if name in existing_names:
                    continue
                lead = place_to_lead(place, industry, city, province, len(existing_leads) + len(new_leads))
                new_leads.append(lead)
                existing_names.add(name)
                print(f"  + {name} — {place.get('formattedAddress', '')}")

            time.sleep(0.5)

    est_cost = total_requests * 0.032
    print(f"\n{'='*60}")
    print(f"SUMMARY")
    print(f"{'='*60}")
    print(f"API requests used: {total_requests}")
    print(f"Estimated cost: ${est_cost:.2f}")

    if new_leads:
        all_leads = existing_leads + new_leads
        save_leads(all_leads)
        print(f"Saved {len(new_leads)} new leads to data/leads.json")
    else:
        print("No new leads found (all may already exist).")

    total = len(existing_leads) + len(new_leads)
    print(f"Total leads in database: {total}")
    print(f"Monthly budget: ~${est_cost:.2f} of $10.00 target")


if __name__ == "__main__":
    main()