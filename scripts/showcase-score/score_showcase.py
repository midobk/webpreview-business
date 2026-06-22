#!/usr/bin/env python3
"""
Prototype showcase scoring + auto-anonymization.

Decides whether a generated prototype is good enough for the public /showcase
page. Two gates:

1. Quality gate — the prototype must meet minimum visual/content standards:
   - Has a hero section
   - Has at least one image
   - No placeholders / "TODO" / "lorem ipsum"
   - Mobile-responsive meta tag
   - Watermark + demo lock present
   - Renders without console errors (browser check, run by agent)

2. Anonymization gate — strip identifying info before public showcase:
   - Real business name → industry label (e.g. "Modern Cleaning Service")
   - Real address → city only
   - Real phone → removed
   - Real email → removed
   - Specific street names / landmarks → removed

Output: marks prototype's `showcase_eligible`, `showcase_approved`,
`anonymized`, `anonymized_html_path` fields.

Usage:
    python3 score_showcase.py [prototype_id_or_slug]
    python3 score_showcase.py --all-pending
"""

import argparse
import json
import os
import re
import shutil
from datetime import datetime, timezone

INDUSTRY_LABELS = {
    "cleaning": "Modern Cleaning Service",
    "salon": "Modern Hair Salon",
    "auto_repair": "Local Auto Repair Shop",
    "restaurant": "Local Restaurant & Café",
    "contractor": "Home Contractor Service",
    "barber": "Barber Shop",
    "landscaper": "Landscaping Service",
    "landscaping": "Landscaping Service",
    "tutor": "Private Tutor Service",
    "plumber": "Plumbing Service",
    "electrician": "Electrical Service",
    "retail": "Local Retail Store",
    "default": "Local Service Business",
}

INDUSTRY_TAGLINES = {
    "cleaning": "One-page website with services, before/after gallery, instant quote CTA.",
    "salon": "Stylist profiles, services grid, online booking CTA.",
    "auto_repair": "Service list, certifications, contact + map, quote CTA.",
    "restaurant": "Menu highlights, reservation CTA, photo gallery.",
    "contractor": "Project gallery, quote request, before/after showcase.",
    "barber": "Services grid, booking CTA, stylist profiles.",
    "landscaping": "Service packages, seasonal care, quote request CTA.",
    "tutor": "Subject offerings, tutor profiles, booking CTA.",
    "plumber": "Service list, emergency CTA, coverage map.",
    "electrician": "Residential + commercial services, quote CTA, certifications.",
    "default": "Modern one-page website with services, gallery, contact CTA.",
}


def check_quality(html_path: str) -> tuple[int, list[str]]:
    """Return (score 0-100, list of issues)."""
    issues = []
    score = 0

    if not os.path.exists(html_path):
        return 0, ["HTML file does not exist"]

    with open(html_path) as f:
        html = f.read()

    # Hero section — 20
    if re.search(r"<section[^>]*hero|hero-section|<h1", html, re.IGNORECASE):
        score += 20
    else:
        issues.append("Missing hero section / h1")

    # Image presence — 20 (counts <img> tags AND background-image CSS)
    has_img = bool(re.search(r"<img[^>]+src=", html))
    has_bg = bool(re.search(r"background-image[^;]*url\(", html))
    # Also accept CSS gradients as a hero image substitute (legit design choice)
    has_gradient_hero = bool(re.search(r"background\s*:[^;]*gradient", html))
    if has_img or has_bg:
        score += 20
    elif has_gradient_hero:
        # Gradient backgrounds are an acceptable visual design — partial credit
        score += 12
        issues.append("Uses CSS gradient backgrounds instead of real images (acceptable but lower visual richness)")
    else:
        issues.append("No images")

    # Mobile responsive — 15
    if re.search(r"viewport", html, re.IGNORECASE):
        score += 15
    else:
        issues.append("Missing viewport meta tag (not mobile-responsive)")

    # Demo lock + watermark — 25
    has_watermark = bool(re.search(r"watermark|preview|siteSprint|demo", html, re.IGNORECASE))
    has_lock = bool(re.search(r"claim|unlock|disabled|demo-locked", html, re.IGNORECASE))
    if has_watermark and has_lock:
        score += 25
    elif has_watermark or has_lock:
        score += 12
        issues.append("Only one of watermark / lock present")
    else:
        issues.append("Missing watermark and demo lock")

    # No placeholders — 10
    if re.search(r"\b(TODO|lorem|ipsum|placeholder text|fixme|xxx)\b", html, re.IGNORECASE):
        score -= 10
        issues.append("Contains placeholder text (lorem/TODO)")
    else:
        score += 10

    # Has CTA — 10
    if re.search(r"cta|call.to.action|contact|quote|book", html, re.IGNORECASE):
        score += 10
    else:
        issues.append("No call-to-action section")

    return min(score, 100), issues


def anonymize_html(html: str, lead: dict) -> str:
    """Replace identifying info with generic labels. Returns cleaned HTML."""
    industry = lead.get("industry", "default")
    label = INDUSTRY_LABELS.get(industry, INDUSTRY_LABELS["default"])
    tagline = INDUSTRY_TAGLINES.get(industry, INDUSTRY_TAGLINES["default"])

    business_name = lead.get("business_name", "")
    city = lead.get("city", "your area")
    province = lead.get("province", "")
    address = lead.get("address", "")
    phone = lead.get("phone", "")
    email = lead.get("email", "")

    # Replace business name (case-insensitive, also try with apostrophes stripped)
    if business_name:
        # Escape special regex chars
        safe_name = re.escape(business_name)
        # Also try a "loose" version (e.g. "Tony's" → "Tonys")
        loose_name = re.escape(business_name.replace("'", "").replace("'", ""))
        html = re.sub(safe_name, label, html, flags=re.IGNORECASE)
        if loose_name != safe_name:
            html = re.sub(loose_name, label, html, flags=re.IGNORECASE)

    # Replace specific street address patterns
    if address:
        # Match "<number> <street name> <street type>" e.g. "35 Second St E"
        html = re.sub(
            r"\d+\s+[A-Z][a-z]+\s+(?:St|Ave|Rd|Blvd|Dr|Lane|Way|Cres|Court|Pl)\.?\s*[A-Z]?",
            f"[Service Area], {city}",
            html,
            flags=re.IGNORECASE,
        )

    # Replace phone numbers
    if phone:
        html = re.sub(re.escape(phone), "[Contact via SiteSprint]", html)

    # Replace any other phone-like patterns
    html = re.sub(
        r"\+?1?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}",
        "[Contact via SiteSprint]",
        html,
    )

    # Replace email
    if email:
        html = re.sub(re.escape(email), "[Contact via SiteSprint]", html)
    # Replace any other email-like patterns
    html = re.sub(
        r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}",
        "[Contact via SiteSprint]",
        html,
    )

    # Replace city/province if it's specific enough to identify the business
    if city and city not in ["Cornwall", "Ottawa", "Toronto", "Montreal"]:
        # Small cities — replace with generic
        html = re.sub(re.escape(city), "your area", html, flags=re.IGNORECASE)

    # Add "Concept by SiteSprint" credit if not present
    if "siteSprint" not in html.lower() and "sitesprint" not in html.lower():
        html = html.replace("</body>", '<footer class="showcase-credit">Concept by SiteSprint</footer></body>')

    # Replace tagline-style copy that mentions the real industry specifically
    html = re.sub(
        rf"family-owned since \d+ years? in {re.escape(city)}",
        f"a {label.lower()} serving {city}",
        html,
        flags=re.IGNORECASE,
    )

    return html


def main():
    parser = argparse.ArgumentParser(description="Score + anonymize prototypes")
    parser.add_argument("slug", nargs="?", help="Prototype slug to process")
    parser.add_argument("--all-pending", action="store_true", help="Process all pending")
    parser.add_argument("--anonymize-dir", default="data/prototypes-anonymized", help="Output dir for anonymized copies")
    args = parser.parse_args()

    leads_path = "data/leads.json"
    proto_path = "data/prototypes.json"

    if not os.path.exists(leads_path) or not os.path.exists(proto_path):
        print("Need data/leads.json and data/prototypes.json")
        return

    with open(leads_path) as f:
        leads = {l["id"]: l for l in json.load(f)}
    with open(proto_path) as f:
        prototypes = json.load(f)

    os.makedirs(args.anonymize_dir, exist_ok=True)

    targets = []
    if args.slug:
        targets = [p for p in prototypes if p.get("lead_id", "").endswith(args.slug) or p.get("id") == args.slug]
    elif args.all_pending:
        targets = [p for p in prototypes if not p.get("showcase_scored_at")]
    else:
        print("Specify a slug or --all-pending")
        return

    print(f"Processing {len(targets)} prototype(s)")

    for proto in targets:
        lead = leads.get(proto["lead_id"])
        if not lead:
            print(f"  {proto['id']}: no matching lead")
            continue

        html_path = proto.get("prototype_url", "")
        if html_path and html_path.startswith("data/prototypes/"):
            html_path = html_path.replace("data/prototypes/", "")
        else:
            html_path = f"{lead['slug']}/index.html"
        if not os.path.exists(f"data/prototypes/{html_path}"):
            print(f"  {proto['id']}: HTML not found at data/prototypes/{html_path}")
            continue

        # Quality score
        quality_score, issues = check_quality(f"data/prototypes/{html_path}")

        # Anonymize
        with open(f"data/prototypes/{html_path}") as f:
            html = f.read()
        clean_html = anonymize_html(html, lead)

        # Write anonymized copy
        anonymized_path = f"{args.anonymize_dir}/{lead['slug']}/index.html"
        os.makedirs(os.path.dirname(anonymized_path), exist_ok=True)
        with open(anonymized_path, "w") as f:
            f.write(clean_html)

        # Update prototype record
        # Eligibility: score >= 70 AND no critical issues (placeholder text, no demo lock, no watermark)
        critical_issues = [i for i in issues if "lorem" in i.lower() or "TODO" in i or "watermark" in i.lower() or "demo lock" in i.lower()]
        proto["showcase_eligible"] = quality_score >= 70 and not critical_issues
        proto["showcase_score"] = quality_score
        proto["showcase_issues"] = issues
        proto["showcase_anonymized_html_path"] = anonymized_path
        proto["anonymized"] = True
        proto["showcase_scored_at"] = datetime.now(timezone.utc).isoformat() + "Z"

        status = "ELIGIBLE" if proto["showcase_eligible"] else f"NOT ELIGIBLE (score={quality_score}, critical={len(critical_issues)}, total_issues={len(issues)})"
        print(f"  {proto['id']} ({lead['business_name']}): {status}")

    # Save updated prototypes
    if not args.slug or len(targets) > 1:
        with open(proto_path, "w") as f:
            json.dump(prototypes, f, indent=2)
        print(f"\nUpdated {proto_path}")


if __name__ == "__main__":
    main()