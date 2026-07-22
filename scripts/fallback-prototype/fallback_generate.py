#!/usr/bin/env python3
"""
Fallback prototype generator — used when OPENAI_API_KEY is unavailable.

Produces a clean, industry-templated HTML prototype (no AI-generated images)
per lead, with the standard watermark + demo lock and a record in
data/prototypes.json so the rest of the pipeline (showcase scoring, supabase
sync) can run.
"""
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

LEADS_PATH = "data/leads.json"
PROTOS_PATH = "data/prototypes.json"
PROTOTYPES_DIR = Path("data/prototypes")

# Industry palette + theme (kept simple — we're not faking imagery)
INDUSTRY_THEME = {
    "restaurant": {"accent": "#b54a2c", "accent_deep": "#7a2f1c", "bg": "#faf6f1", "ink": "#1c1612"},
    "default":    {"accent": "#1f3a8a", "accent_deep": "#0f1f4d", "bg": "#f4f6fa", "ink": "#0f172a"},
}


def render_html(lead: dict, theme: dict) -> str:
    name = lead.get("business_name", "Local Business")
    city = lead.get("city") or "Ontario"
    province = lead.get("province") or "ON"
    phone = lead.get("phone") or "(call for details)"
    industry = lead.get("industry", "business")
    accent = theme["accent"]
    accent_deep = theme["accent_deep"]
    bg = theme["bg"]
    ink = theme["ink"]

    # Honest placeholder image (no fake imagery)
    img_svg = f"""<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 720'>
  <defs>
    <linearGradient id='g' x1='0' x2='0' y1='0' y2='1'>
      <stop offset='0%' stop-color='{accent}'/>
      <stop offset='100%' stop-color='{accent_deep}'/>
    </linearGradient>
  </defs>
  <rect width='1200' height='720' fill='url(#g)'/>
  <g fill='rgba(255,255,255,0.85)' font-family='Georgia,serif' text-anchor='middle'>
    <text x='600' y='340' font-size='68' font-weight='700'>{name}</text>
    <text x='600' y='400' font-size='28' opacity='0.85'>{city}, {province}</text>
    <text x='600' y='460' font-size='18' opacity='0.7' letter-spacing='6'>PREVIEW CONCEPT</text>
  </g>
</svg>"""
    img_data_uri = "data:image/svg+xml;utf8," + img_svg.replace("\n", "").replace("  ", "")

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{name} — Demo Preview</title>
<meta name="description" content="Demo preview concept for {name} in {city}, {province}. Not an official website.">
<meta name="robots" content="noindex,nofollow">
<style>
*,*::before,*::after{{box-sizing:border-box}}
:root{{--accent:{accent};--accent-deep:{accent_deep};--bg:{bg};--ink:{ink};--line:rgba(28,22,18,.12)}}
body{{margin:0;font-family:Inter,system-ui,-apple-system,Segoe UI,sans-serif;color:var(--ink);background:var(--bg);line-height:1.55;-webkit-font-smoothing:antialiased}}
a{{color:inherit;text-decoration:none}}
img{{display:block;width:100%;height:100%;object-fit:cover}}
.container{{width:min(1200px,calc(100% - 40px));margin:0 auto}}
.demo-ribbon{{min-height:38px;padding:10px 24px;background:var(--ink);color:rgba(255,255,255,.82);display:flex;align-items:center;justify-content:center;gap:10px;font-size:11px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;text-align:center}}
.demo-ribbon span{{width:6px;height:6px;border-radius:50%;background:var(--accent)}}
.nav{{position:sticky;top:0;z-index:50;border-bottom:1px solid var(--line);background:rgba(255,255,255,.85);backdrop-filter:blur(14px)}}
.nav-inner{{height:72px;display:flex;align-items:center;justify-content:space-between;gap:24px}}
.brand{{font-weight:800;letter-spacing:-.02em;font-size:18px}}
.nav-cta{{padding:10px 18px;border-radius:999px;background:var(--ink);color:#fff;font-weight:600;font-size:13px}}
.hero{{position:relative;min-height:560px;display:grid;grid-template-columns:1.1fr 1fr;gap:0;align-items:stretch;overflow:hidden}}
@media(max-width:860px){{.hero{{grid-template-columns:1fr;min-height:0}}}}
.hero-img{{position:relative;min-height:320px}}
.hero-img .placeholder{{position:absolute;inset:0}}
.hero-copy{{padding:64px 56px;display:flex;flex-direction:column;justify-content:center;gap:18px}}
@media(max-width:860px){{.hero-copy{{padding:40px 24px}}}}
.kicker{{display:inline-block;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--accent-deep);font-weight:700}}
h1{{font-family:Georgia,serif;font-size:clamp(34px,5vw,56px);line-height:1.05;margin:0;letter-spacing:-.02em}}
.lede{{font-size:18px;color:#3d352e;max-width:46ch}}
.actions{{display:flex;gap:12px;flex-wrap:wrap;margin-top:8px}}
.btn-primary{{padding:14px 22px;border-radius:999px;background:var(--ink);color:#fff;font-weight:600}}
.btn-ghost{{padding:14px 22px;border-radius:999px;border:1px solid var(--ink);color:var(--ink);font-weight:600}}
section{{padding:72px 0}}
@media(max-width:860px){{section{{padding:48px 0}}}}
h2{{font-family:Georgia,serif;font-size:clamp(26px,3.4vw,38px);margin:0 0 18px}}
.cards{{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:24px}}
@media(max-width:860px){{.cards{{grid-template-columns:1fr}}}}
.card{{background:#fff;border:1px solid var(--line);border-radius:18px;padding:24px}}
.card h3{{margin:0 0 8px;font-size:18px}}
.card p{{margin:0;color:#3d352e;font-size:14px}}
.split{{display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center}}
@media(max-width:860px){{.split{{grid-template-columns:1fr;gap:24px}}}}
.facts{{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:18px}}
.fact{{background:#fff;border:1px solid var(--line);border-radius:14px;padding:18px;text-align:center}}
.fact strong{{display:block;font-family:Georgia,serif;font-size:26px}}
.cta{{background:linear-gradient(135deg,var(--accent),var(--accent-deep));color:#fff;border-radius:24px;padding:56px 40px;text-align:center}}
.cta h2{{color:#fff}}
.cta p{{color:rgba(255,255,255,.88);max-width:56ch;margin:0 auto 20px}}
footer{{border-top:1px solid var(--line);padding:36px 0;color:#6b6258;font-size:13px;text-align:center}}
.demo-lock{{position:fixed;right:18px;bottom:18px;background:rgba(28,22,18,.92);color:#fff;padding:10px 14px;border-radius:999px;font-size:12px;font-weight:600;letter-spacing:.04em;z-index:60}}
</style>
</head>
<body>

<div class="demo-ribbon">
  <span></span> Demo preview — concept only, not an official website
</div>

<nav class="nav">
  <div class="container nav-inner">
    <div class="brand">{name}</div>
    <a class="nav-cta" href="#contact">Claim this preview</a>
  </div>
</nav>

<header class="hero">
  <div class="hero-img">
    <div class="placeholder"><img src="{img_data_uri}" alt=""></div>
  </div>
  <div class="hero-copy">
    <span class="kicker">{industry.title()} · {city}</span>
    <h1>{name} deserves a website as good as the work.</h1>
    <p class="lede">This is an unofficial preview concept built from public info. Imagine it with your real photos, menu, and reviews — and a fast, mobile-first design that actually converts.</p>
    <div class="actions">
      <a class="btn-primary" href="#contact">Make it live</a>
      <a class="btn-ghost" href="#preview">See the concept</a>
    </div>
  </div>
</header>

<section id="preview">
  <div class="container">
    <h2>What this concept does for you</h2>
    <div class="cards">
      <div class="card"><h3>Loads in under a second</h3><p>Mobile-first, lean code, real Core Web Vitals. Most small-business sites take 4–8s — this doesn't.</p></div>
      <div class="card"><h3>Shows up locally</h3><p>Structured for Google "near me" searches in {city} so the people already looking for you can find you.</p></div>
      <div class="card"><h3>Converts calls &amp; bookings</h3><p>One job per page: get the visitor to call {phone} or book. No clutter, no scrolling forever.</p></div>
    </div>
  </div>
</section>

<section style="background:#fff">
  <div class="container split">
    <div>
      <span class="kicker">Honest preview</span>
      <h2>No fake reviews, no invented facts.</h2>
      <p>This demo uses placeholder visuals. Once you claim it, we swap in your real photos, your real services, and your real story. Nothing is made up here — and nothing on the final site will be either.</p>
    </div>
    <div>
      <div class="facts">
        <div class="fact"><strong>{phone.split(' ')[0] if phone else 'Call'}</strong>Click-to-call</div>
        <div class="fact"><strong>1s</strong>Target load time</div>
        <div class="fact"><strong>{city}</strong>Local SEO ready</div>
      </div>
    </div>
  </div>
</section>

<section id="contact" class="cta">
  <div class="container">
    <h2>Claim this preview for {name}</h2>
    <p>Reply to the email this came from and we'll turn this concept into your real website — photos, copy, domain, hosting, the lot. 7-day turnaround, flat fee, no surprises.</p>
    <a class="btn-primary" style="background:#fff;color:var(--ink)" href="mailto:hello@seawaysites.com?subject=Claim preview: {name}">Reply to claim</a>
  </div>
</section>

<footer>
  <div class="container">
    Unofficial preview concept · Built as a sample for {name} ({city}, {province}) · © Seaway Sites
  </div>
</footer>

<div class="demo-lock">Demo · Not Live</div>

</body>
</html>
"""
    return html


def main():
    if len(sys.argv) < 2:
        print("Usage: fallback_generate.py <slug> [<slug>...]")
        return 1

    leads = json.load(open(LEADS_PATH))
    prototypes = json.load(open(PROTOS_PATH)) if Path(PROTOS_PATH).exists() else []

    results = []
    for slug in sys.argv[1:]:
        lead = next((l for l in leads if l["slug"] == slug), None)
        if not lead:
            print(f"  ✗ {slug}: no lead found")
            results.append((slug, False))
            continue

        industry = lead.get("industry", "default")
        theme = INDUSTRY_THEME.get(industry, INDUSTRY_THEME["default"])
        out_dir = PROTOTYPES_DIR / slug
        out_dir.mkdir(parents=True, exist_ok=True)

        html_path = out_dir / "index.html"
        html = render_html(lead, theme)
        html_path.write_text(html, encoding="utf-8")
        print(f"  ✓ {slug}: HTML written to {html_path}")

        now = datetime.now(timezone.utc).isoformat() + "Z"
        record = {
            "id": f"proto-{slug}",
            "lead_id": lead["id"],
            "variant": 1,
            "variant_name": "fallback-v1",
            "prototype_url": f"data/prototypes/{slug}/index.html",
            "screenshot_url": None,
            "title": f"{lead.get('business_name', '')} — Demo Preview",
            "design_summary": (
                f"Fallback HTML prototype for {lead.get('business_name', '')} "
                f"({industry}, {lead.get('city','')}). No AI imagery — clean template "
                f"with watermark + demo lock, ready for showcase scoring."
            ),
            "prototype_score": None,
            "generation_model": "fallback-template-v1",
            "generation_prompt": None,
            "generation_status": "pending_review",
            "watermark_enabled": True,
            "demo_locked": True,
            "showcase_eligible": False,
            "showcase_approved": False,
            "showcase_score": None,
            "showcase_issues": None,
            "anonymized": False,
            "showcase_anonymized_html_path": None,
            "created_at": now,
            "updated_at": now,
        }

        prototypes = [p for p in prototypes if p.get("id") != record["id"]]
        prototypes.append(record)

        # Also update lead status
        lead["status"] = "prototype_generated"
        results.append((slug, True))

    Path(PROTOS_PATH).write_text(json.dumps(prototypes, indent=2), encoding="utf-8")
    Path(LEADS_PATH).write_text(json.dumps(leads, indent=2), encoding="utf-8")

    ok = sum(1 for _, s in results if s)
    print(f"\nFallback prototype generation complete: {ok}/{len(results)} succeeded")
    return 0 if ok == len(results) else 1


if __name__ == "__main__":
    sys.exit(main())
