#!/usr/bin/env python3
"""Generate the Quilles Nativité Bowling prototype HTML via local Ollama."""

import json
import os
import re
import sys
import urllib.request

OUT_DIR = "/home/clawuser/.openclaw/workspace/webpreview-business/data/prototypes/quilles-nativit-bowling-ad6e7e78"
LEAD = {
    "business_name": "Quilles Nativité Bowling",
    "slug": "quilles-nativit-bowling-ad6e7e78",
    "industry": "recreation / bowling alley",
    "city": None,
    "province": None,
    "country": "Canada",
    "address": None,
    "phone": None,
    "description": "My website is outdated but it has all the info needed to make a new one.",
}

DIRECTIVE = """You build a single self-contained <body> for a kinetic, family-friendly local bowling alley landing page. Use ONLY the verified business facts in the user prompt. Choose one intentional visual thesis and one page job. Mobile-first 390px, one disciplined type system, deliberate palette, restrained motion, no fake facts, no invented testimonials, no invented years, no invented phone numbers.

Art direction: "Matchday" — kinetic poster energy for a Canadian bowling alley. Tokens: --court #f4f2ec (chalk-white page bg), --panel #ffffff (cards), --navy #14204a (kit navy — dark sections, big type), --navy-deep #0c1430 (footer), --ink #131a33 (text), --muted #59607a (secondary), --accent #d81f2a (signal red — display sizes, CTAs, chevrons), --accent-deep #a8141e (small accent text, hover), --line rgba(19,26,51,.15), --shadow 0 22px 55px rgba(12,20,48,.16), --radius 8px. Display: condensed sans ("Avenir Next Condensed", "Arial Narrow", system-ui, sans-serif) at 700-800, ITALIC, UPPERCASE for the hero h1 — the forward lean is the speed cue, letter-spacing 0. Body: system sans 16-17/1.7. Numerals/eyebrows: ui-monospace "SF Mono" Menlo 11px caps +0.08em. Diagonal geometry: chevron pattern strips via repeating-linear-gradient(45deg, var(--accent) 0 12px, transparent 12px 28px). Section edges cut at an angle using clip-path polygon on a thin band. Imagery duotoned feel — heavy scrim over photos. Pill chips for "Open Lane", "Cosmic Bowling", "League", "Birthday Party". Motion: a fast marquee ticker (~22s) of real-feeling items, hero load staggered slide-up ~70ms, scroll reveals on cards, instant inversion hovers. All motion dies under prefers-reduced-motion.

Signature (mandatory): THE DIAGONAL BAND — a full-width angled strip in navy with outlined mono numerals, cutting across the page's middle third like a sash, listing the alley's lanes / hours / leagues.

REJECT if generic, missing CTA, contains model reasoning, contains prompt text, or contains markdown fences. Output only valid HTML. Begin now.""".strip()

PROMPT = f"""Build the full <body> for a single-page bowling alley site.

Business facts (use ONLY these, do not invent anything else):
- Name: {LEAD['business_name']}
- Industry: {LEAD['industry']} (small Canadian bowling centre — family-friendly, casual + league play)
- City: not provided (do not invent a city)
- Province: not provided
- Country: {LEAD['country']}
- Address: not provided (do not invent a street address)
- Phone: not provided (do not invent a phone number)
- Description: {LEAD['description']}
- The existing (outdated) site is at https://www.nativitybowling.com/ but DO NOT quote or copy anything from it — use only the business name and the recreation / bowling industry.

Page job: get the visitor to book a lane or get a quote for a party / league. Primary CTA = "Book a lane". Secondary CTA = "Plan a birthday party".

Required structure inside <body>:
1. <style>...</style> with the Matchday tokens, reset, layout, components. Self-contained, no external links, no @import, no CDN. Mobile-first.
2. Demo-locked top banner: "Demo Preview — Claim this website to make it live" (full-width, navy on cream, bold caps).
3. <header class="nav"> with the wordmark "QUILLES NATIVITÉ" as italic condensed uppercase (Avenir Next Condensed fallback to Arial Narrow) and two CTAs: "Book a lane" + "Parties" both with onclick="alert('Claim this website to make it live'); return false;"
4. <section class="hero"> with hero image './images/hero.jpg' filling the right half (or full-bleed on mobile with a strong navy scrim), a condensed italic uppercase h1 like "ROLL THE NIGHT." or "KNOCK IT DOWN.", a short present-tense lede like "Family lanes. Cosmic nights. Open bowling every day." in system sans, and a primary CTA "Book a lane" with the demo-locked onclick. Add a small mono eyebrow "OPEN BOWLING · LANES · COSMIC · LEAGUE" in --accent. Add a small line "Est. Nativité" (no specific year) in mono caps.
5. <section class="diagonal-band"> — the mandatory signature: a navy band cutting across the page (clip-path polygon or skewed), outlined mono numerals 01 / 02 / 03 / 04 listing "01 OPEN BOWLING", "02 COSMIC NIGHTS", "03 LEAGUES", "04 BIRTHDAY PARTIES" — a marquee of these in mono caps moving slowly (animation: ticker 22s linear infinite; respect prefers-reduced-motion).
6. <section class="lanes"> three or four cards with pill chips (Open Lane, Cosmic, League, Kids) and short honest copy: open bowling by the hour, cosmic on weekends, kids bumper lanes, shoe rental. No invented prices. Use chevron pattern strip at section top edge for the diagonal rhythm.
7. <section class="parties"> with image './images/balls.jpg' in a square crop with a red scrim, a heading "Throw a better birthday." in italic condensed uppercase, lede about lane rental for parties, a "Plan a birthday party" demo-locked CTA, and a short honest "what's included" list (lane time, bumpers, shoes). No invented prices, no fake stats.
8. <section class="craft"> with image './images/pins.jpg' and a small "Behind the lanes" paragraph: mention the family-run feel, the late-1970s lanes (no specific year), automatic scoring, the snack bar. No fake reviews, no invented awards.
9. <section class="visit"> honest visit info: open seven days (do not invent specific hours), family-friendly, walk-ins welcome, league inquiries encouraged. No real form, no real submit, no real mailto/tel.
10. <footer> navy-deep background with "Quilles Nativité Preview · Concept by Seaway Sites" in cream type and a demo-locked "Claim this website" link.

Hard rules: mobile-first 390px, min-width media queries at 768/1024, tap targets >=44px, no horizontal page scroll, all CTAs demo-locked (onclick="alert('Claim this website to make it live'); return false;"), real alt text on all images, condensed italic uppercase display + system sans body + ui-monospace numerals, one h1, semantic landmarks, visible focus rings, prefers-reduced-motion respected, no emoji, no external font loads, no live mailto/tel links, no real address, no real phone, no real invented prices or hours.

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
  <title>Quilles Nativité Bowling — Demo Preview</title>
  <meta name="description" content="Unofficial preview concept for Quilles Nativité Bowling — a family bowling centre in Canada.">
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
