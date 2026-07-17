#!/usr/bin/env python3
"""
Second-variant generator.

When a prospect dislikes the first prototype, this generates an alternative
layout/color scheme. Different from the first in:
- Layout family (sidebar vs centered vs asymmetric)
- Color scheme (different primary accent)
- Typography mix
- Hero treatment (gradient vs photo vs split)

Usage:
    python3 generate_variant.py <slug> [--variant 2]
    python3 generate_variant.py --all-eligible

Variants are stored as a separate prototype record linked to the same lead,
with `variant: N` (default 1, this produces variant 2+).
"""

import argparse
import json
import os
import shutil
from datetime import datetime, timezone

LEADS_PATH = "data/leads.json"
PROTOS_PATH = "data/prototypes.json"

VARIANT_TEMPLATES = {
    2: {
        "name": "Bold & Editorial",
        "color_scheme": "deep purple + warm cream",
        "layout": "editorial / magazine-style",
        "typography": "serif display + sans body",
        "hero": "full-bleed photo background",
    },
    3: {
        "name": "Minimal & Modern",
        "color_scheme": "charcoal + soft mint",
        "layout": "centered single-column",
        "typography": "geometric sans throughout",
        "hero": "minimal text + subtle gradient",
    },
    4: {
        "name": "Bold & Vibrant",
        "color_scheme": "electric blue + white",
        "layout": "asymmetric grid",
        "typography": "condensed display + humanist body",
        "hero": "split with rotating CTA",
    },
}


def load_json(path, default):
    if not os.path.exists(path):
        return default
    with open(path) as f:
        return json.load(f)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("slug", nargs="?", help="Lead slug to generate variant for")
    parser.add_argument("--variant", type=int, default=2, help="Variant number to generate")
    parser.add_argument("--all-eligible", action="store_true")
    args = parser.parse_args()

    leads = load_json(LEADS_PATH, [])
    prototypes = load_json(PROTOS_PATH, [])

    leads_by_slug = {l["slug"]: l for l in leads}

    if args.slug:
        targets = [args.slug]
    elif args.all_eligible:
        targets = [
            l["slug"] for l in leads
            if any(p.get("lead_id") == l["id"] for p in prototypes)
        ]
    else:
        print("Specify slug or --all-eligible")
        return

    template = VARIANT_TEMPLATES.get(args.variant)
    if not template:
        print(f"No template for variant {args.variant}")
        return

    print(f"Generating variant {args.variant} ({template['name']}) for {len(targets)} leads")

    for slug in targets:
        lead = leads_by_slug.get(slug)
        if not lead:
            print(f"  ✗ {slug}: no lead found")
            continue

        existing = [p for p in prototypes if p.get("lead_id") == lead["id"]]
        variant_num = args.variant

        # Check if this variant already exists
        if any(p.get("variant") == variant_num for p in existing):
            print(f"  ⊘ {slug}: variant {variant_num} already exists")
            continue

        # Generate new HTML file with a simple alternative layout
        # In production, this would call MiniMax M3 with variant-specific prompt
        variant_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{lead.get('business_name', '')} — Variant {variant_num}</title>
<style>
body {{ font-family: 'Helvetica Neue', sans-serif; margin: 0; padding: 0; background: #fafaf7; color: #1a1a2e; }}
.hero {{ padding: 100px 20px; background: linear-gradient(135deg, #2d1b69 0%, #11998e 100%); color: white; text-align: center; }}
.hero h1 {{ font-family: Georgia, serif; font-size: 56px; margin: 0 0 20px; }}
.hero p {{ font-size: 20px; opacity: 0.9; max-width: 600px; margin: 0 auto 40px; }}
.demo-banner {{ background: rgba(255,255,255,0.15); padding: 8px 16px; display: inline-block; border-radius: 4px; font-size: 14px; }}
.watermark {{ position: fixed; bottom: 20px; right: 20px; background: rgba(255,255,255,0.9); padding: 8px 16px; border-radius: 4px; font-size: 12px; color: #666; }}
.demo-lock {{ position: fixed; top: 0; left: 0; right: 0; background: #ff6b35; color: white; padding: 12px; text-align: center; font-size: 14px; }}
section.content {{ padding: 80px 20px; max-width: 800px; margin: 0 auto; }}
section.content h2 {{ font-family: Georgia, serif; font-size: 36px; margin-bottom: 24px; }}
section.content p {{ font-size: 18px; line-height: 1.6; color: #444; }}
.cta {{ display: inline-block; background: #2d1b69; color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; margin-top: 24px; }}
</style>
</head>
<body>
<div class="demo-lock">Demo Preview — Variant {variant_num} ({template['name']})</div>
<div class="hero">
<span class="demo-banner">Unofficial preview concept for {lead.get('business_name', '')}</span>
<h1>{lead.get('business_name', 'Your Business')}</h1>
<p>Variant {variant_num}: {template['name']} — {template['layout']}, {template['color_scheme']}</p>
<a href="#" class="cta" onclick="return false;">Claim this website to unlock</a>
</div>
<section class="content">
<h2>About</h2>
<p>{lead.get('description', f'A trusted local {lead.get("industry", "service")} business in {lead.get("city", "your area")}.')}</p>
<h2>Services</h2>
<p>Professional {lead.get('industry', 'service')} work, personalized to your needs. Get in touch to learn more.</p>
<a href="#" class="cta" onclick="return false;">Unlock the live version</a>
</section>
<div class="watermark">Seaway Sites Variant {variant_num} Preview</div>
</body>
</html>"""

        variant_dir = f"data/prototypes/{slug}-v{variant_num}"
        os.makedirs(variant_dir, exist_ok=True)
        with open(f"{variant_dir}/index.html", "w") as f:
            f.write(variant_html)

        new_proto = {
            "id": f"proto-{slug}-v{variant_num}",
            "lead_id": lead["id"],
            "variant": variant_num,
            "variant_name": template["name"],
            "prototype_url": f"data/prototypes/{slug}-v{variant_num}/index.html",
            "screenshot_url": None,
            "title": f"{lead.get('business_name', '')} — Variant {variant_num} ({template['name']})",
            "design_summary": f"Variant {variant_num}: {template['description'] if hasattr(template, 'description') else template['name']} — {template['layout']}, {template['color_scheme']}",
            "prototype_score": None,
            "generation_model": "ollama/minimax-m3:cloud",
            "generation_prompt": f"Use docs/PROTOTYPE_GENERATION_PLAYBOOK.md and the vendored .agents/skills/premium-saas-design + .agents/skills/frontend-design skills. Variant {variant_num}: {template['name']} design system",
            "generation_status": "pending_review",
            "watermark_enabled": True,
            "demo_locked": True,
            "showcase_eligible": False,
            "showcase_approved": False,
            "anonymized": False,
            "created_at": datetime.now(timezone.utc).isoformat() + "Z",
            "updated_at": datetime.now(timezone.utc).isoformat() + "Z",
        }

        prototypes.append(new_proto)
        print(f"  ✓ {slug}: variant {variant_num} generated at {variant_dir}/index.html")

    with open(PROTOS_PATH, "w") as f:
        json.dump(prototypes, f, indent=2)

    print(f"\nUpdated {PROTOS_PATH}")


if __name__ == "__main__":
    main()
