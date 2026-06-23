#!/usr/bin/env python3
"""
Regenerate prototype images that are broken (1x1 placeholders).

Scans data/prototypes/<slug>/images/*.jpg and re-generates any that are
smaller than 5KB. Two strategies:

  1. OpenAI (preferred) — uses OPENAI_API_KEY if set. Calls gpt-image-1-mini
     with industry-specific prompts.
  2. Local gradient fallback — if OpenAI is unavailable, writes a proper
     industry-themed gradient JPEG (~50-200KB) using PIL. NEVER writes a
     1x1 placeholder.

This enforces the QA rule in MEMORY.md (no <5KB images allowed on
prototypes that hit the live site).

Usage:
  python3 regenerate_images.py [--all]            # scan all prototypes
  python3 regenerate_images.py <slug>             # one prototype
  python3 regenerate_images.py --dry-run          # report only
"""

import argparse
import base64
import json
import os
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PROTOS_DIR = ROOT / "data" / "prototypes"
MIN_VALID_BYTES = 5_000  # anything smaller is a placeholder

INDUSTRY_THEMES = {
    "cleaning": {"colors": ["#0ea5e9", "#06b6d4", "#10b981"], "label": "Cleaning"},
    "salon":    {"colors": ["#ec4899", "#a855f7", "#f43f5e"], "label": "Salon"},
    "barber":   {"colors": ["#1e3a8a", "#dc2626", "#f59e0b"], "label": "Barber"},
    "auto_repair": {"colors": ["#dc2626", "#1f2937", "#f59e0b"], "label": "Auto Repair"},
    "restaurant": {"colors": ["#f59e0b", "#dc2626", "#7c2d12"], "label": "Restaurant"},
    "landscaping": {"colors": ["#16a34a", "#65a30d", "#ca8a04"], "label": "Landscaping"},
    "contractor": {"colors": ["#92400e", "#1c1917", "#a8a29e"], "label": "Contractor"},
    "plumber":   {"colors": ["#0284c7", "#0c4a6e", "#22d3ee"], "label": "Plumber"},
    "electrician": {"colors": ["#eab308", "#1c1917", "#facc15"], "label": "Electrician"},
    "tutor":     {"colors": ["#7c3aed", "#2563eb", "#06b6d4"], "label": "Tutor"},
    "default":   {"colors": ["#6366f1", "#8b5cf6", "#ec4899"], "label": "Business"},
}


def http_post_json(url, payload, headers=None):
    data = json.dumps(payload).encode()
    req = urllib.request.Request(
        url, data=data, method="POST",
        headers={"Content-Type": "application/json", **(headers or {})},
    )
    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            return resp.status, json.loads(resp.read())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read() or "{}")


def find_lead_for_slug(slug: str):
    """Look up the lead record to get industry, name, etc."""
    leads_path = ROOT / "data" / "leads.json"
    if not leads_path.exists():
        return None
    with open(leads_path) as f:
        leads = json.load(f)
    for lead in leads:
        if lead.get("slug") == slug:
            return lead
    return None


def openai_generate(prompt: str, out_path: Path, api_key: str) -> bool:
    """Call OpenAI gpt-image-1-mini and write image to disk."""
    status, data = http_post_json(
        "https://api.openai.com/v1/images/generations",
        {"model": "gpt-image-1-mini", "prompt": prompt, "size": "1024x1024", "n": 1},
        headers={"Authorization": f"Bearer {api_key}"},
    )
    if status != 200 or not data.get("data"):
        return False
    b64 = data["data"][0].get("b64_json")
    if b64:
        out_path.write_bytes(base64.b64decode(b64))
        return out_path.stat().st_size > MIN_VALID_BYTES
    return False


def gradient_fallback(out_path: Path, theme: dict, label: str, size: tuple = (1024, 1024)) -> int:
    """Write a real gradient JPEG using PIL. Never a 1x1 placeholder."""
    try:
        from PIL import Image, ImageDraw, ImageFont
    except ImportError:
        print("  ! PIL not available; using numpy fallback")
        import numpy as np
        w, h = size
        c1, c2, c3 = [tuple(int(theme["colors"][i].lstrip("#")[j:j+2], 16) for j in (0, 2, 4)) for i in range(3)]
        arr = np.zeros((h, w, 3), dtype=np.uint8)
        for y in range(h):
            t = y / h
            if t < 0.5:
                arr[y, :] = [int(c1[i] * (1 - 2*t) + c2[i] * 2*t) for i in range(3)]
            else:
                arr[y, :] = [int(c2[i] * (1 - 2*(t-0.5)) + c3[i] * 2*(t-0.5)) for i in range(3)]
        Image.fromarray(arr).save(out_path, "JPEG", quality=85)
        return out_path.stat().st_size

    w, h = size
    c1, c2, c3 = [tuple(int(theme["colors"][i].lstrip("#")[j:j+2], 16) for j in (0, 2, 4)) for i in range(3)]
    img = Image.new("RGB", (w, h), c1)
    draw = ImageDraw.Draw(img)
    # Vertical gradient with two stops
    for y in range(h):
        t = y / h
        if t < 0.5:
            color = tuple(int(c1[i] * (1 - 2*t) + c2[i] * 2*t) for i in range(3))
        else:
            color = tuple(int(c2[i] * (1 - 2*(t-0.5)) + c3[i] * 2*(t-0.5)) for i in range(3))
        draw.line([(0, y), (w, y)], fill=color)
    # Overlay a soft radial highlight
    overlay = Image.new("RGBA", (w, h), (255, 255, 255, 0))
    odraw = ImageDraw.Draw(overlay)
    for r in range(400, 0, -20):
        alpha = int(30 * (1 - r/400))
        odraw.ellipse([w//2 - r, h//3 - r, w//2 + r, h//3 + r], fill=(255, 255, 255, alpha))
    img = Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")
    # Add subtle label
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 48)
    except Exception:
        font = ImageFont.load_default()
    draw = ImageDraw.Draw(img)
    text = label
    bbox = draw.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    draw.text(((w - tw) / 2, h - th - 60), text, fill=(255, 255, 255, 230), font=font)
    img.save(out_path, "JPEG", quality=85)
    return out_path.stat().st_size


def regenerate_for_slug(slug: str, dry_run: bool = False) -> dict:
    """Regenerate broken images for one prototype slug. Returns summary."""
    proto_dir = PROTOS_DIR / slug
    if not proto_dir.is_dir():
        return {"slug": slug, "error": "directory not found"}

    lead = find_lead_for_slug(slug) or {}
    industry = lead.get("industry", "default")
    business = lead.get("business_name", slug.replace("-", " ").title())
    theme = INDUSTRY_THEMES.get(industry, INDUSTRY_THEMES["default"])

    images_dir = proto_dir / "images"
    if not images_dir.is_dir():
        return {"slug": slug, "error": "no images/ dir"}

    summary = {"slug": slug, "industry": industry, "files": []}
    image_files = sorted(images_dir.glob("*.jpg")) + sorted(images_dir.glob("*.png"))

    openai_key = os.environ.get("OPENAI_API_KEY", "").strip()
    use_openai = bool(openai_key) and not dry_run

    for i, img_path in enumerate(image_files):
        size = img_path.stat().st_size
        if size >= MIN_VALID_BYTES:
            summary["files"].append({"name": img_path.name, "status": "ok", "size": size})
            continue

        # Determine role
        role = "hero" if "hero" in img_path.name else f"section_{i}"
        prompt = (
            f"Professional {theme['label'].lower()} business photo, "
            f"clean modern composition, soft natural lighting, photographic, 4k. "
            f"For {business}."
        )
        if not dry_run:
            if use_openai:
                ok = openai_generate(prompt, img_path, openai_key)
                if not ok:
                    new_size = gradient_fallback(img_path, theme, theme["label"])
                    summary["files"].append({"name": img_path.name, "status": "gradient", "size": new_size})
                else:
                    summary["files"].append({"name": img_path.name, "status": "openai", "size": img_path.stat().st_size})
            else:
                new_size = gradient_fallback(img_path, theme, theme["label"])
                summary["files"].append({"name": img_path.name, "status": "gradient", "size": new_size})
        else:
            summary["files"].append({"name": img_path.name, "status": "would_regen", "size": size})

    return summary


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("slug", nargs="?")
    parser.add_argument("--all", action="store_true")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    if not args.slug and not args.all:
        parser.print_help()
        sys.exit(1)

    slugs = []
    if args.all:
        slugs = [p.name for p in sorted(PROTOS_DIR.iterdir()) if p.is_dir()]
    else:
        slugs = [args.slug]

    print(f"Scanning {len(slugs)} prototype(s) for broken images (<{MIN_VALID_BYTES} bytes)...\n")
    fixed = 0
    for slug in slugs:
        result = regenerate_for_slug(slug, dry_run=args.dry_run)
        if "error" in result:
            print(f"  ✗ {slug}: {result['error']}")
            continue
        print(f"  → {slug} ({result['industry']})")
        for f in result["files"]:
            if f["status"] in ("gradient", "openai", "would_regen"):
                fixed += 1
                print(f"     {f['name']}: {f['status']} ({f['size']} bytes)")
            else:
                print(f"     {f['name']}: ok ({f['size']} bytes)")
    print(f"\n{fixed} image(s) {'would be ' if args.dry_run else ''}regenerated.")


if __name__ == "__main__":
    main()
