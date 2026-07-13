#!/usr/bin/env python3
"""
Prototype generator (real implementation).

Per audit 2026-06-22: the previous generate.py only simulated image
generation and HTML assembly. This version actually:
1. Calls image_generate (OpenAI gpt-image-1-mini) for hero + section images
2. Calls MiniMax M3 (ollama/minimax-m3:cloud) for HTML body
3. Assembles a complete prototype.html with watermark + demo lock
4. Injects Cal.com booking snippet
5. Saves HTML + images to data/prototypes/<slug>/
6. Updates data/prototypes.json with the new record

Usage:
    python3 generate.py <slug> [--variant N]
    python3 generate.py --top-scored [--limit 5]
"""

import argparse
import json
import os
import re
import sys
import urllib.request
import urllib.error
from datetime import datetime, timezone
from pathlib import Path

LEADS_PATH = "data/leads.json"
PROTOS_PATH = "data/prototypes.json"
PROTOTYPES_DIR = "data/prototypes"

GENERATION_DIRECTIVE = """
You are the senior art director, brand strategist, UX writer, and front-end designer for a premium local-business landing page.
Use the verified business facts only. Before writing markup, choose one intentional visual thesis and one clear page job for the first ten seconds. Build a complete, industry-specific composition with a strong first viewport, proof/story, services, process or differentiator, and final CTA. Make mobile a first-class layout at 390px. Use one disciplined type system, a deliberate palette, real-looking image direction, restrained motion, accessible headings/alt text, and no fake testimonials, awards, reviews, pricing, guarantees, or invented facts.
The output will be rejected if it is generic, card-heavy, visually incoherent, missing the conversion path, contains model reasoning, or contains prompt text.
""".strip()

INDUSTRY_HERO_PROMPTS = {
    "cleaning": "Modern, bright office interior being professionally cleaned, sparkling surfaces, eco-friendly supplies visible, soft natural light, clean composition, photographic, 4k",
    "salon": "Modern hair salon interior, stylish chairs, large mirrors, professional lighting, warm wood tones, clean welcoming atmosphere, photographic, 4k",
    "restaurant": "Modern restaurant interior, elegant dining setup, warm ambient lighting, professional plating visible, photographic, 4k",
    "auto_repair": "Modern auto repair shop, professional mechanic working on car, clean garage, organized tools, photographic, 4k",
    "barber": "Traditional-modern barber shop, vintage chairs, leather seats, mirrors, professional grooming atmosphere, photographic, 4k",
    "landscaping": "Beautifully landscaped front yard, manicured lawn, fresh garden, professional result, golden hour, photographic, 4k",
    "contractor": "Professional home renovation, before/after of clean finished work, modern kitchen or bathroom, photographic, 4k",
    "plumber": "Modern bathroom installation, clean copper pipes, professional plumbing work, bright tile, photographic, 4k",
    "electrician": "Modern electrical panel installation, clean wiring, professional work in new home, photographic, 4k",
    "tutor": "Friendly tutor helping student one-on-one at clean desk, books and laptop visible, bright room, photographic, 4k",
}

INDUSTRY_SECTION_PROMPTS = {
    "cleaning": [
        "Professional cleaning team at work, modern equipment, organized supplies, photographic, 4k",
        "Spotless living room after deep clean, fresh flowers on table, photographic, 4k",
    ],
    "salon": [
        "Stylist carefully cutting client's hair, professional technique, mirror reflection, photographic, 4k",
        "Premium hair care products on marble counter, soft lighting, photographic, 4k",
    ],
    "restaurant": [
        "Beautifully plated signature dish, restaurant-quality presentation, shallow depth of field, photographic, 4k",
        "Chef preparing food in clean professional kitchen, photographic, 4k",
    ],
    "default": [
        "Professional service in action, clean composition, photographic, 4k",
        "Quality work showcase, professional result, photographic, 4k",
    ],
}


def http_post_json(url, payload, headers=None):
    """POST JSON to URL, return parsed JSON response."""
    data = json.dumps(payload).encode()
    req = urllib.request.Request(url, data=data, method="POST",
                                  headers={"Content-Type": "application/json", **(headers or {})})
    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            return resp.status, json.loads(resp.read())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read() or "{}")


def http_get(url, headers=None):
    req = urllib.request.Request(url, headers=headers or {})
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            return resp.status, resp.read()
    except urllib.error.HTTPError as e:
        return e.code, e.read()


def generate_image_openai(prompt: str, out_path: str, openai_api_key: str = None) -> bool:
    """Call OpenAI image generation API."""
    if not openai_api_key:
        # Try to read from env
        openai_api_key = os.environ.get("OPENAI_API_KEY")

    if not openai_api_key:
        raise RuntimeError("OPENAI_API_KEY is required; refusing to create a placeholder image")

    status, data = http_post_json(
        "https://api.openai.com/v1/images/generations",
        {"model": "gpt-image-1-mini", "prompt": prompt, "size": "1024x1024", "n": 1},
        headers={"Authorization": f"Bearer {openai_api_key}"},
    )
    if status != 200 or not data.get("data"):
        raise RuntimeError(f"OpenAI image API failed ({status})")

    # gpt-image-1 returns base64 directly
    import base64
    b64 = data["data"][0].get("b64_json")
    if b64:
        with open(out_path, "wb") as f:
            f.write(base64.b64decode(b64))
        return True

    # Some models return a URL
    url = data["data"][0].get("url")
    if url:
        s, content = http_get(url)
        if s == 200:
            with open(out_path, "wb") as f:
                f.write(content)
            return True

    raise RuntimeError("OpenAI image API returned no usable image")


def write_placeholder_image(out_path: str):
    """Retained for compatibility, but placeholder assets are forbidden."""
    raise RuntimeError(f"Placeholder images are disabled: {out_path}")


def generate_html_minimax(lead: dict, hero_filename: str, section_filenames: list) -> str:
    """Generate the HTML body via local Ollama MiniMax M3."""
    industry = lead.get("industry", "service")
    business_name = lead.get("business_name", "Your Business")
    city = lead.get("city", "your area")
    description = lead.get("description", f"A trusted local {industry} business in {city}.")

    prompt = f"""{GENERATION_DIRECTIVE}

Generate only the HTML <body> content (no <html>, <head>, <style>) for this business:

Business: {business_name}
Industry: {industry}
City: {city}
Description: {description}

Required structure, in order (you may add purposeful supporting sections):
1. <header> with watermark banner "Demo Preview — Claim this website to make it live"
2. <section class="hero"> using hero image: {hero_filename}, h1 with business name, tagline, primary CTA button "Claim this website to unlock"
3. <section class="services"> with 3-4 service cards (use placeholder service names from industry)
4. <section class="about"> short paragraph based on description
5. <section class="book-call"> Cal.com booking embed with heading "Want to chat?" and CTA "Book a 5-min call"
6. <footer> with "Concept by Seaway Sites · Demo Preview"

Style: use a coherent art direction rather than a generic template. Mobile-responsive via CSS grid/flexbox. Use inline CSS or a <style> tag in body. Use semantic landmarks, useful alt text, visible focus states, and `prefers-reduced-motion`.

Each form/CTA must have onclick="alert('Claim this website to unlock the live version'); return false;" — demo locked.
Reference images as: ./images/{hero_filename} for hero, ./images/{section_filenames[0]} and ./images/{section_filenames[1]} for services.

Return ONLY the HTML body, no explanation, no markdown fences, and no invented business facts."""

    payload = json.dumps({
        "model": "minimax-m3:cloud",
        "system": GENERATION_DIRECTIVE,
        "prompt": prompt,
        "stream": False,
        "options": {"num_ctx": 16000, "temperature": 0.7}
    }).encode()

    req = urllib.request.Request(
        "http://172.31.87.51:11434/api/generate",
        data=payload,
        headers={"Content-Type": "application/json"}
    )

    try:
        with urllib.request.urlopen(req, timeout=180) as resp:
            result = json.loads(resp.read())
            body = result.get("response", "").strip()
            # Strip any markdown code fences the LLM might wrap it in
            body = re.sub(r"^```html?\s*\n?", "", body)
            body = re.sub(r"\n?```\s*$", "", body)
            return body
    except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError) as e:
        raise RuntimeError(f"Ollama generation failed: {e}") from e


def validate_generated_html(body: str):
    """Fail closed when model output is empty, generic commentary, or prompt leakage."""
    if not body or not re.search(r"<(header|main|section|footer)\b", body, re.I):
        raise RuntimeError("Generated HTML did not contain the required semantic page structure")
    leaked = re.search(r"(as an ai|here is|certainly|thinking process|prompt:|```)", body, re.I)
    if leaked:
        raise RuntimeError(f"Generated HTML contains model/commentary text near: {leaked.group(0)!r}")


def validate_image(path: Path):
    """Reject missing, tiny, or non-image files before they can enter a prototype."""
    if not path.exists() or path.stat().st_size <= 5 * 1024:
        raise RuntimeError(f"Image failed quality gate: {path} (must be larger than 5KB)")
    header = path.read_bytes()[:12]
    valid = header.startswith(b"\xff\xd8\xff") or header.startswith(b"\x89PNG\r\n\x1a\n") or header[:4] == b"RIFF" and header[8:12] == b"WEBP"
    if not valid:
        raise RuntimeError(f"Image failed format gate: {path}")


def fallback_html(lead, hero_filename, section_filenames):
    """Deterministic HTML fallback if Ollama fails."""
    business_name = lead.get("business_name", "Your Business")
    city = lead.get("city", "your area")
    industry = lead.get("industry", "service")
    description = lead.get("description", f"A trusted local {industry} business in {city}.")

    return f"""
<header class="demo-banner" style="position:fixed;top:0;left:0;right:0;background:#0f3a2e;color:white;padding:12px;text-align:center;font-size:14px;z-index:100;">
  Demo Preview — Claim this website to make it live
</header>

<section class="hero" style="margin-top:42px;padding:120px 20px 80px;background:linear-gradient(135deg,#f0fdf4 0%,#ecfdf5 100%);text-align:center;">
  <img src="./images/{hero_filename}" alt="Hero" style="max-width:600px;width:100%;border-radius:16px;margin-bottom:32px;box-shadow:0 20px 60px rgba(0,0,0,0.1);">
  <h1 style="font-size:48px;font-weight:800;color:#0f3a2e;margin-bottom:16px;">{business_name}</h1>
  <p style="font-size:18px;color:#4a5e5a;max-width:600px;margin:0 auto 32px;">{description}</p>
  <a href="#" class="cta" onclick="alert('Claim this website to unlock the live version.'); return false;" style="display:inline-block;background:#10b981;color:white;padding:16px 32px;border-radius:8px;text-decoration:none;font-weight:600;">
    Claim this website
  </a>
</section>

<section class="services" style="padding:80px 20px;max-width:1000px;margin:0 auto;">
  <h2 style="font-size:32px;text-align:center;color:#0f3a2e;margin-bottom:48px;">Our Services</h2>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:24px;">
    <div style="background:white;padding:32px;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.06);">
      <h3 style="color:#0f3a2e;">Service 1</h3>
      <p style="color:#4a5e5a;">Professional {industry} work, done right.</p>
    </div>
    <div style="background:white;padding:32px;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.06);">
      <h3 style="color:#0f3a2e;">Service 2</h3>
      <p style="color:#4a5e5a;">Quality you can count on.</p>
    </div>
    <div style="background:white;padding:32px;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.06);">
      <h3 style="color:#0f3a2e;">Service 3</h3>
      <p style="color:#4a5e5a;">Local and trusted in {city}.</p>
    </div>
  </div>
</section>

<section class="book-call" style="padding:60px 20px;text-align:center;background:linear-gradient(135deg,#f0f9ff 0%,#e0f2fe 100%);border-radius:12px;margin:40px auto;max-width:600px;">
  <h3 style="font-size:24px;margin-bottom:12px;color:#0c4a6e;">Want to chat?</h3>
  <p style="font-size:16px;color:#475569;margin-bottom:24px;">Book a 5-minute call to see the live version and talk through any tweaks.</p>
  <a href="#" onclick="alert('Demo preview — booking link locked until you claim the website.'); return false;" style="display:inline-block;background:#0284c7;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;">
    Book a 5-min call →
  </a>
</section>

<footer style="padding:40px 20px;text-align:center;background:#0f3a2e;color:white;font-size:14px;">
  <p>Concept by Seaway Sites · Demo Preview · {business_name}</p>
</footer>
"""


def assemble_prototype(lead, hero_filename, section_filenames):
    """Assemble full HTML document from body + meta."""
    business_name = lead.get("business_name", "Your Business")
    industry = lead.get("industry", "service")
    city = lead.get("city", "your area")

    body = generate_html_minimax(lead, hero_filename, section_filenames)

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{business_name} — Demo Preview</title>
  <meta name="description" content="Unofficial preview concept for {business_name} — {industry} in {city}.">
  <meta name="robots" content="noindex,nofollow">
  <style>
    *,*::before,*::after {{ box-sizing: border-box; }}
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; color: #1a1a1a; }}
    a {{ color: inherit; }}
    img {{ max-width: 100%; height: auto; }}
    .demo-banner {{ position: fixed; top: 0; left: 0; right: 0; z-index: 100; }}
  </style>
</head>
<body>
{body}
<div style="position:fixed;bottom:20px;right:20px;background:rgba(255,255,255,0.95);padding:8px 16px;border-radius:4px;font-size:12px;color:#666;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
  Seaway Sites Preview · {business_name}
</div>
</body>
</html>"""
    return html


def generate_prototype(slug: str, variant: int = 1):
    leads = json.load(open(LEADS_PATH))
    lead = next((l for l in leads if l["slug"] == slug), None)
    if not lead:
        print(f"No lead with slug '{slug}'")
        return False

    industry = lead.get("industry", "default")
    hero_prompt = INDUSTRY_HERO_PROMPTS.get(industry, INDUSTRY_HERO_PROMPTS.get("default", "")) or f"Professional {industry} business in action, photographic, 4k"
    section_prompts = INDUSTRY_SECTION_PROMPTS.get(industry, INDUSTRY_SECTION_PROMPTS["default"])

    out_dir = Path(PROTOTYPES_DIR) / (slug if variant == 1 else f"{slug}-v{variant}")
    images_dir = out_dir / "images"
    images_dir.mkdir(parents=True, exist_ok=True)

    print(f"\n[{slug}] variant {variant} — {lead.get('business_name')}")
    print(f"  Industry: {industry}")

    # Generate images
    hero_filename = "hero.jpg"
    print(f"  Generating hero image...")
    generate_image_openai(hero_prompt, str(images_dir / hero_filename))
    validate_image(images_dir / hero_filename)

    section_filenames = []
    for i, prompt in enumerate(section_prompts[:2]):
        filename = f"section_{i+1}.jpg"
        print(f"  Generating section image {i+1}...")
        generate_image_openai(prompt, str(images_dir / filename))
        validate_image(images_dir / filename)
        section_filenames.append(filename)

    # Generate HTML
    print(f"  Generating HTML body via MiniMax M3...")
    html = assemble_prototype(lead, hero_filename, section_filenames)
    validate_generated_html(html)

    html_path = out_dir / "index.html"
    with open(html_path, "w") as f:
        f.write(html)
    print(f"  ✓ HTML saved to {html_path}")

    # Update prototypes.json
    prototypes = json.load(open(PROTOS_PATH)) if os.path.exists(PROTOS_PATH) else []
    record = {
        "id": f"proto-{slug}-v{variant}" if variant > 1 else f"proto-{slug}",
        "lead_id": lead["id"],
        "variant": variant,
        "prototype_url": f"data/prototypes/{out_dir.name}/index.html",
        "screenshot_url": None,
        "title": f"{lead.get('business_name', '')} — Preview",
        "design_summary": f"Generated v{variant} for {lead.get('business_name', '')} ({industry})",
        "prototype_score": None,
        "generation_model": "minimax-m3:cloud + gpt-image-1-mini",
        # Browser screenshots and an operator review are required before this
        # can become completed/showcase-eligible. See docs/PROTOTYPE_QA.md.
        "generation_status": "pending_review",
        "watermark_enabled": True,
        "demo_locked": True,
        "showcase_eligible": False,
        "showcase_approved": False,
        "anonymized": False,
        "created_at": datetime.now(timezone.utc).isoformat() + "Z",
        "updated_at": datetime.now(timezone.utc).isoformat() + "Z",
    }
    # Replace if exists
    prototypes = [p for p in prototypes if p.get("id") != record["id"]]
    prototypes.append(record)
    with open(PROTOS_PATH, "w") as f:
        json.dump(prototypes, f, indent=2)

    print(f"  ✓ Prototype record added: {record['id']}")
    return True


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("slug", nargs="?")
    parser.add_argument("--variant", type=int, default=1)
    parser.add_argument("--top-scored", action="store_true", help="Generate for top-scored leads without prototypes")
    parser.add_argument("--limit", type=int, default=5)
    args = parser.parse_args()

    if args.slug:
        generate_prototype(args.slug, args.variant)
    elif args.top_scored:
        leads = json.load(open(LEADS_PATH))
        prototypes = json.load(open(PROTOS_PATH)) if os.path.exists(PROTOS_PATH) else []
        existing_slugs = {p.get("prototype_url", "").split("/")[2] for p in prototypes if p.get("prototype_url")}

        candidates = [
            l for l in leads
            if l["slug"] not in existing_slugs and l.get("status") != "ignore"
        ]
        candidates.sort(key=lambda l: l.get("lead_score", 0), reverse=True)
        candidates = candidates[:args.limit]

        print(f"Generating for top {len(candidates)} leads without prototypes")
        for lead in candidates:
            generate_prototype(lead["slug"])
    else:
        print("Specify slug or --top-scored")
        return


if __name__ == "__main__":
    main()
