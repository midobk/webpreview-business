#!/usr/bin/env python3
"""Generate the POSH NOSH Pastry Confectionery prototype HTML via local Ollama."""

import json
import os
import re
import sys
import urllib.request

OUT_DIR = "/home/clawuser/.openclaw/workspace/webpreview-business/data/prototypes/posh-nosh-pastry-confectionery-f0d98ed6"
LEAD = {
    "business_name": "POSH NOSH Pastry Confectionery",
    "slug": "posh-nosh-pastry-confectionery-f0d98ed6",
    "industry": "bakery",
    "city": "Cornwall",
    "province": "Ontario",
    "country": "Canada",
    "address": None,
    "phone": None,
    "description": "I make macarons and sweets, in cornwall ontario",
}

DIRECTIVE = """You build a single self-contained <body> for a premium local-business landing page. Use ONLY the verified business facts in the user prompt. Choose one intentional visual thesis and one page job. Industry-appropriate composition, mobile-first 390px, one disciplined type system, deliberate palette, restrained motion, no fake facts.

Art direction: "Heritage Wine" — warm editorial bakery aesthetic. Tokens: --paper #f7f2ec bg, --paper-deep #eee4da alt section, --white #fffdfb cards, --ink #181513 text, --espresso #2b211d dark inversion, --accent #743c48 wine (CTAs, em-accents, eyebrows), --accent-deep #572832 hover, --rose #c89083 graphics only, --gold #b9935f stars/borders only, --muted #675a53 secondary, --line rgba(24,21,19,.14). Display: Georgia/Iowan Old Style serif weight 400, italic <em> on accent words in --accent, letter-spacing -0.04em. Text: system sans 16-17/1.7. Eyebrows: 10-11px caps, letter-spacing 0.15-0.19em, 700-800 weight. Signature: arched hero portrait + ghost monogram "P" floated behind content in Georgia italic at 110px, --accent at 13% opacity, one arched hero image with bottom scrim, one small rotated polaroid-style secondary image overlapping the arch corner. Soft 250ms ease hovers, no bouncing. Generous whitespace, hairline rules.

REJECT if generic, card-heavy, missing CTA, contains model reasoning, contains prompt text, or contains markdown fences. Output only valid HTML. Begin now.""".strip()

PROMPT = f"""Build the full <body> for a single-page local-business site.

Business facts (use ONLY these, do not invent):
- Name: {LEAD['business_name']}
- Industry: {LEAD['industry']} (small home-based pastry / confectionery)
- City: {LEAD['city']}, {LEAD['province']}, {LEAD['country']}
- Address: not provided (do not invent a street address)
- Phone: not provided (do not invent a phone number)
- Description: {LEAD['description']}

Page job: get the visitor to request a custom order / quote. Primary CTA = "Order a custom box".

Required structure inside <body>:
1. <style>...</style> with the Heritage Wine tokens, reset, layout, components. Self-contained, no external links, no @import, no CDN.
2. Demo-locked top banner: "Demo Preview — Claim this website to make it live" (full-width, wine on cream).
3. <header class="nav"> with the wordmark "POSH NOSH" as a Georgia serif italic and a CTA "Order a custom box" with onclick="alert('Claim this website to make it live'); return false;"
4. <section class="hero"> with hero image './images/hero.png' in an arch crop (border-radius 190px 190px 24px 24px) with a soft bottom scrim, a serif h1 "Small-batch macarons, made in Cornwall." with one italic-wine <em> word on "macarons", a short tagline like "Hand-piped shells, real ganache, weekly pickup windows.", and a primary CTA "Order a custom box" with the same demo-locked onclick. Add a small "Cornwall, Ontario" line. Place a ghost "P" monogram in Georgia italic at ~110px in --accent at 13% opacity behind the hero text.
5. <section class="offer"> a chalkboard-style menu panel in dark espresso with cream type listing the small weekly offer: French Macarons (per dozen, seasonal flavours), Tartlets (fruit & chocolate), Bonbons & Truffles, Celebration Boxes. Modest honest prices: Macarons $24/dozen, Tartlets $6 each, Bonbons $18/box of 8, Celebration Box $48. Dotted leaders between item and price, italic <em> in --accent on a word or two.
6. <section class="craft"> with image './images/macarons-assortment.png' in an arch crop and 2-3 sentences about the work: shells rested overnight, ganache made the morning of, the kitchen in Cornwall, weekly batches. No fake stats, no "EST. 20XX" year.
7. <section class="detail"> with image './images/pastry-detail.png' and a small "How to order" list: choose a flavour list, choose a pickup window, message to confirm. No real form, no real submit, no email link.
8. <section class="pickup"> honest pickup logistics: weekly pickup windows, message at least 48 hours ahead, Cornwall pickup only. Address line is generic ("Pickup in Cornwall, Ontario").
9. <footer> with "POSH NOSH Preview · Concept by Seaway Sites" and a demo-locked "Claim this website" link.

Hard rules: mobile-first 390px, min-width media queries at 768/1024, tap targets >=44px, no horizontal page scroll, all CTAs demo-locked (onclick="alert('Claim this website to make it live'); return false;"), real alt text on all images, Georgia + system sans, one h1, semantic landmarks, visible focus rings, prefers-reduced-motion respected, no emoji, no external font loads, no live mailto/tel links, no real address, no real phone.

Output ONLY the body content — start with <style> and end with </footer>. No explanations, no markdown fences, no thinking, no commentary. Begin now."""

payload = json.dumps({
    "model": "minimax-m3:cloud",
    "system": DIRECTIVE,
    "prompt": PROMPT,
    "stream": False,
    "options": {"num_ctx": 8192, "temperature": 0.7}
}).encode()

print("Calling Ollama...", file=sys.stderr)
req = urllib.request.Request(
    "http://172.31.87.51:11434/api/generate",
    data=payload,
    headers={"Content-Type": "application/json"}
)
try:
    with urllib.request.urlopen(req, timeout=600) as resp:
        result = json.loads(resp.read())
        body = result.get("response", "").strip()
        # Strip markdown fences just in case
        body = re.sub(r"^```html?\s*\n?", "", body)
        body = re.sub(r"\n?```\s*$", "", body)
except Exception as e:
    print(f"Ollama call failed: {e}", file=sys.stderr)
    sys.exit(1)

# Wrap in full HTML doc
full_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>POSH NOSH Pastry Confectionery — Demo Preview</title>
  <meta name="description" content="Unofficial preview concept for POSH NOSH Pastry Confectionery — a small-batch macaron and pastry maker in Cornwall, Ontario.">
  <meta name="robots" content="noindex,nofollow">
</head>
<body>
{body}
</body>
</html>
"""

os.makedirs(OUT_DIR, exist_ok=True)
out_path = os.path.join(OUT_DIR, "index.html")
with open(out_path, "w") as f:
    f.write(full_html)

print(f"Wrote {out_path} ({len(full_html)} bytes)", file=sys.stderr)
