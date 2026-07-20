#!/usr/bin/env python3
"""One-off: generate the Gilles' 3rd Gen Barber Shop prototype HTML via local Ollama."""

import json
import os
import re
import sys
import urllib.request

OUT_DIR = "/home/clawuser/.openclaw/workspace/webpreview-business/data/prototypes/gilles-3rd-gen-barber-shop"
LEAD = {
    "business_name": "Gilles' 3rd Gen Barber Shop",
    "slug": "gilles-3rd-gen-barber-shop",
    "industry": "barber",
    "city": "Cornwall",
    "province": "Ontario",
    "country": "Canada",
    "address": "18307 Kilkenny Crescent, Cornwall, ON K6H 5R5",
    "phone": "+1 613-330-4175",
    "description": "Local barber business in Cornwall, Ontario.",
}

DIRECTIVE = """You build a single self-contained <body> for a premium local-business landing page. Use ONLY the verified business facts in the user prompt. Choose one intentional visual thesis and one page job. Industry-appropriate composition, mobile-first 390px, one disciplined type system, deliberate palette, restrained motion, no fake facts.

Art direction: "Midnight Counter" — low-light brass aesthetic. Tokens: --char #171310 bg, --char-lift #211b17 cards, --cream #f2e8da text, --cream-dim rgba(242,232,218,.66) secondary, --accent #d9a441 candle amber, --accent-deep #b3822a hover, --brass rgba(217,164,65,.34) hairlines. Display: Georgia serif 400 with italic <em>. Text: system sans 16/1.7. Prices: tabular-nums caps in --accent. Dotted leaders between item and price. Signature: a service list as centerpiece.

REJECT if generic, card-heavy, missing CTA, contains model reasoning, contains prompt text, or contains markdown fences. Output only valid HTML. Begin now.""".strip()

PROMPT = f"""Build the full <body> for a single-page local-business site.

Business facts (use ONLY these, do not invent):
- Name: {LEAD['business_name']}
- Industry: {LEAD['industry']} (third-generation barber shop)
- City: {LEAD['city']}, {LEAD['province']}, {LEAD['country']}
- Address: {LEAD['address']}
- Phone: {LEAD['phone']}
- Description: {LEAD['description']}

Page job: get the visitor to call or visit the shop. Primary CTA = "Book the chair".

Required structure inside <body>:
1. <style>...</style> with the Midnight Counter tokens, reset, layout, components. Self-contained, no external links, no @import, no CDN.
2. Demo-locked top banner: "Demo Preview — Claim this website to make it live" (full-width, amber on dark).
3. <header class="nav"> with the business name "Gilles'" as a serif wordmark and a CTA "Book the chair" with onclick="alert('Claim this website to make it live'); return false;"
4. <section class="hero"> with hero image './images/hero.jpg', a serif h1 "Three generations of clean lines." with one italic-amber <em> word, a short tagline (no marketing fluff), and a primary CTA "Book the chair" with the same demo-locked onclick. Add a small "18307 Kilkenny Crescent · Cornwall" line.
5. <section class="services"> with the signature service list (item names, dotted leaders, prices). 6 honest service categories: Classic Haircut, Hot-Towel Shave, Beard Trim & Shape, Senior Cut, Father & Son, The Works. Modest honest prices (e.g. $28, $35, $22, $24, $48, $55 — not round). Tabular numerals, brass dotted leaders.
6. <section class="craft"> with image './images/section_about.jpg' and 2-3 sentences about Gilles carrying the shop forward, the same chair, the same straight razor, a new generation of walk-ins. No fake stats, no "EST. 19XX" year.
7. <section class="visit"> with image './images/section_services.jpg', the address, the phone, and "Walk-ins welcome. Call ahead to book." CTA is demo-locked.
8. <section class="hours"> honest hours: Tue–Fri 9:00–17:30, Sat 9:00–15:00, Sun & Mon closed.
9. <footer> with "Gilles' Preview · Concept by Seaway Sites" and a demo-locked "Claim this website" link.

Hard rules: mobile-first 390px, min-width media queries at 768/1024, tap targets >=44px, no horizontal page scroll, all CTAs demo-locked, real alt text, Georgia + system sans + tabular numerals, one h1, semantic landmarks, visible focus rings, prefers-reduced-motion respected, no emoji, no external font loads.

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

# Leak checks
bad_patterns = [
    (r"as an ai", "AI self-reference"),
    (r"thinking process", "thinking leak"),
    (r"prompt:", "prompt label"),
    (r"```", "markdown fence"),
    (r"lorem ipsum", "placeholder text"),
    (r"TODO", "todo placeholder"),
    (r"^Here is\b", "commentary"),
    (r"^Certainly\b", "commentary"),
    (r"^Sure[,!.]", "commentary"),
]
for pat, name in bad_patterns:
    if re.search(pat, body, re.I | re.M):
        print(f"REJECT: {name} found in body", file=sys.stderr)
        print("--- first 500 chars ---", file=sys.stderr)
        print(body[:500], file=sys.stderr)
        sys.exit(2)

if not re.search(r"<(style|header|main|section|footer)\b", body, re.I):
    print("REJECT: no required semantic structure", file=sys.stderr)
    print(body[:500], file=sys.stderr)
    sys.exit(3)

html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{LEAD['business_name']} — Demo Preview</title>
  <meta name="description" content="Unofficial preview concept for {LEAD['business_name']} — a {LEAD['industry']} in {LEAD['city']}, {LEAD['province']}.">
  <meta name="robots" content="noindex,nofollow">
  <style>*,*::before,*::after{{box-sizing:border-box}}
html,body{{margin:0;padding:0}}
img{{max-width:100%;height:auto;display:block}}
a{{color:inherit}}
:root {{
  --char: #171310;
  --char-lift: #211b17;
  --cream: #f2e8da;
  --cream-dim: rgba(242,232,218,0.66);
  --accent: #d9a441;
  --accent-deep: #b3822a;
  --brass: rgba(217,164,65,0.34);
  --line: rgba(242,232,218,0.14);
}}
body{{
  background: radial-gradient(ellipse at 30% 20%, rgba(217,164,65,.10), transparent 60%), var(--char);
  color: var(--cream);
  font-family: system-ui, -apple-system, "Segoe UI", Helvetica, Arial, sans-serif;
  font-size: 16px;
  line-height: 1.7;
  -webkit-font-smoothing: antialiased;
}}
:focus-visible{{outline:2px solid var(--accent); outline-offset:2px}}
@media (prefers-reduced-motion: reduce){{
  *{{animation-duration: 0.001ms !important; transition-duration: 0.001ms !important}}
}}
</style>
</head>
<body>
{body}
</body>
</html>
"""

out_path = os.path.join(OUT_DIR, "index.html")
os.makedirs(OUT_DIR, exist_ok=True)
with open(out_path, "w") as f:
    f.write(html)
print(f"Wrote {out_path} ({len(html)} bytes)", file=sys.stderr)
