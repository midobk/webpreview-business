#!/usr/bin/env python3
"""Tier-2 render gate: loads the page in headless Chromium (Playwright) at 1440x900 and
390x844 and checks what static analysis can't see — horizontal overflow, offscreen elements,
first-viewport CTA, hidden h1, tap-target size — then saves screenshots for the eye pass.

Usage:
    python3 render_check.py path/to/index.html [--shots-dir DIR]

Exit: 0 = pass, 1 = FAILs found, 2 = Playwright unavailable (run Tier 2 manually).
Install once: pip install playwright && playwright install chromium
"""
import pathlib
import sys

try:
    from playwright.sync_api import sync_playwright
except ImportError:
    print("Playwright not installed — run Tier 2 by hand at 390x844 and 1440x900.")
    print("(pip install playwright && playwright install chromium)")
    print("Checklist: references/quality-gate.md § Tier 2")
    sys.exit(2)

JS = """() => {
  const vw = innerWidth, vh = innerHeight, de = document.documentElement;
  const vis = el => { const s = getComputedStyle(el);
    return s.display !== 'none' && s.visibility !== 'hidden' && +s.opacity > 0.05; };
  const transformed = el => { let n = el, hops = 0;
    while (n && n !== document.body && hops < 5) {
      if (getComputedStyle(n).transform !== 'none') return true;
      n = n.parentElement; hops++; }
    return false; };
  const wide = [...document.querySelectorAll('body *')].filter(el => {
    if (!vis(el) || el.closest('[class*="ticker"],[class*="marquee"]')) return false;
    if (transformed(el)) return false;  /* skewed sashes/rotated tags legitimately overhang */
    const r = el.getBoundingClientRect();
    return r.width > 0 && (r.right > vw + 8 || r.left < -8);
  }).slice(0, 6).map(el =>
    el.tagName.toLowerCase() + (el.className ? '.' + String(el.className).trim().split(/\\s+/)[0] : ''));
  const ctas = [...document.querySelectorAll('a,button')].filter(el => {
    if (!vis(el)) return false; const r = el.getBoundingClientRect();
    return r.top >= 0 && r.bottom <= vh && r.height >= 32 && el.textContent.trim().length > 1;
  });
  const h1 = document.querySelector('h1');
  const h1r = h1 ? h1.getBoundingClientRect() : null;
  const smallTap = [...document.querySelectorAll('a,button')].filter(el => {
    if (!vis(el) || el.closest('nav,header,footer')) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && r.height < 32;
  }).length;
  return { hScroll: de.scrollWidth > vw + 1, scrollW: de.scrollWidth,
           wide, ctaCount: ctas.length, smallTap,
           h1Visible: !!(h1 && vis(h1) && h1r.top < vh && h1r.bottom > 0) };
}"""

results = []


def report(level, code, msg):
    results.append(level)
    print(f"{level:4}  [{code}] {msg}")


def main():
    argv = sys.argv[1:]
    shots_dir = None
    if "--shots-dir" in argv:
        i = argv.index("--shots-dir")
        if i + 1 >= len(argv):
            print(__doc__)
            sys.exit(2)
        shots_dir = argv[i + 1]
        del argv[i:i + 2]
    args = [a for a in argv if not a.startswith("--")]
    if len(args) != 1:
        print(__doc__)
        sys.exit(2)
    path = pathlib.Path(args[0]).resolve()
    shots = pathlib.Path(shots_dir) if shots_dir else path.parent / ".shots"
    shots.mkdir(parents=True, exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch()
        for name, w, h in (("desktop", 1440, 900), ("mobile", 390, 844)):
            page = browser.new_page(viewport={"width": w, "height": h})
            page.goto(path.as_uri())
            page.wait_for_timeout(1600)  # let load sequences and reveals finish
            m = page.evaluate(JS)
            if m["hScroll"]:
                report("FAIL", f"overflow-{name}",
                       f"horizontal scroll at {w}px (scrollWidth {m['scrollW']})")
            for sel in m["wide"]:
                report("FAIL" if name == "mobile" else "WARN", f"offscreen-{name}",
                       f"element extends past the viewport: {sel}")
            if m["ctaCount"] == 0:
                report("FAIL", f"first-viewport-{name}",
                       "no visible CTA (a/button ≥32px tall) inside the first viewport")
            if not m["h1Visible"]:
                report("FAIL" if name == "desktop" else "WARN", f"h1-{name}",
                       "h1 missing/invisible in first viewport — oversized hero type or a reveal that never fires")
            if name == "mobile" and m["smallTap"] > 3:
                report("WARN", "tap-targets",
                       f"{m['smallTap']} links/buttons under 32px tall outside nav/footer")
            page.screenshot(path=str(shots / f"{name}.png"), full_page=False)
            page.screenshot(path=str(shots / f"{name}-full.png"), full_page=True)
            page.close()
        browser.close()

    fails = results.count("FAIL")
    print(f"\n{fails} FAIL, {results.count('WARN')} WARN — screenshots in {shots}/")
    if fails:
        print("Fix, then re-run. The screenshots exist for the Tier-2 eye pass — look at them.")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    main()
