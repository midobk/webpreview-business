#!/usr/bin/env python3
"""Tier-1 mechanical quality gate for generated web pages.

Usage:
    python3 review_page.py path/to/index.html [--self-contained]

Checks the hard rules from frontier-web-craft (token discipline, copy bans,
accessibility floor, portability). Prints FAIL/WARN/PASS lines; exits 1 if any
FAIL. Standard library only. --self-contained upgrades external-resource WARNs
to FAILs (single-file output mode).
"""

import html as htmllib
import re
import sys

BANNED_PHRASES = [
    r"welcome to",
    r"one[- ]stop shop",
    r"look no further",
    r"nestled",
    r"hidden gem",
    r"committed to excellence",
    r"exceed(?:ing)? your expectations",
    r"state[- ]of[- ]the[- ]art",
    r"top[- ]notch",
    r"unparalleled",
    r"we pride ourselves",
    r"your satisfaction is our",
    r"solutions for all your",
    r"elevate your",
    r"unleash",
    r"seamless experience",
    r"passion for (?:excellence|quality)",
    r"quality you can trust",
    r"best[- ]in[- ]class",
    r"dedicated professionals",
    r"in today's fast[- ]paced world",
    r"lorem ipsum",
    r"\bTODO\b",
    r"\bplaceholder\b",
]

WEAK_CTA = [r"learn more", r"click here", r"\bsubmit\b"]

MODEL_LEAK = [
    r"^\s*(?:Here(?:'s| is)\b|Certainly\b|Sure[,!]|Of course\b|I(?:'ve| have) (?:created|built))",
    r"```",
]

# Proper emoji block only — typographic ornaments (star, dingbats) stay legal.
EMOJI_RE = re.compile("[\U0001F000-\U0001FAFF\U00002700-\U000027BF\U0001F900-\U0001F9FF]")
ORNAMENT_OK = set("✦✧★☆✕·")  # common legitimate glyphs inside the dingbat range

results = []  # (level, code, message)


def report(level, code, message):
    results.append((level, code, message))


def visible_text(markup):
    """Strip style/script/comments and tags; return the human-visible text."""
    t = re.sub(r"<!--.*?-->", " ", markup, flags=re.S)
    t = re.sub(r"<(style|script)\b.*?</\1>", " ", t, flags=re.S | re.I)
    t = re.sub(r"<[^>]+>", " ", t)
    return htmllib.unescape(t)


def css_of(markup):
    return "\n".join(m.group(1) for m in re.finditer(r"<style\b[^>]*>(.*?)</style>", markup, re.S | re.I))


def strip_root_blocks(css):
    """Remove every `:root { ... }` block (including inside media queries)."""
    out, i = [], 0
    for m in re.finditer(r":root\s*{", css):
        start = m.start()
        depth, j = 1, m.end()
        while j < len(css) and depth:
            depth += {"{": 1, "}": -1}.get(css[j], 0)
            j += 1
        out.append(css[i:start])
        i = j
    out.append(css[i:])
    return "".join(out)


def line_of(text, pos):
    return text.count("\n", 0, pos) + 1


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    self_contained = "--self-contained" in sys.argv
    if len(args) != 1:
        print(__doc__)
        sys.exit(2)
    path = args[0]
    try:
        markup = open(path, encoding="utf-8", errors="replace").read()
    except OSError as e:
        print(f"cannot read {path}: {e}")
        sys.exit(2)

    css = css_of(markup)
    text = visible_text(markup)
    ext_level = "FAIL" if self_contained else "WARN"

    # --- document structure -------------------------------------------------
    if not re.match(r"\s*<!doctype html>", markup, re.I):
        report("FAIL", "doctype", "missing <!DOCTYPE html> at top of file")
    if not re.search(r"<html[^>]*\blang\s*=", markup, re.I):
        report("FAIL", "lang", "<html> has no lang attribute")
    if not re.search(r'<meta[^>]+name=["\']viewport["\']', markup, re.I):
        report("FAIL", "viewport", "missing viewport meta tag")
    m = re.search(r"<title>(.*?)</title>", markup, re.S | re.I)
    if not m or not m.group(1).strip() or "REPLACE" in m.group(1):
        report("FAIL", "title", "missing, empty, or unreplaced <title>")
    if not re.search(r'<meta[^>]+name=["\']description["\']', markup, re.I):
        report("WARN", "description", "no meta description")

    h1s = re.findall(r"<h1[\s>]", markup, re.I)
    if len(h1s) != 1:
        report("FAIL", "h1", f"expected exactly one <h1>, found {len(h1s)}")

    # --- token discipline ---------------------------------------------------
    if re.search(r"skeleton-sentinel", markup, re.I):
        report("FAIL", "skeleton-shipped",
               "skeleton-sentinel marker still present — the starter palette/devices were never replaced with chosen ones")
    if ":root" not in css:
        report("FAIL", "tokens", "no :root token block in CSS")
    else:
        stray = [
            (m.group(0), line_of(css, m.start()))
            for m in re.finditer(r"#[0-9a-fA-F]{3,8}\b", strip_root_blocks(css))
        ]
        if stray:
            sample = ", ".join(f"{h} (css line ~{ln})" for h, ln in stray[:5])
            report("FAIL", "hex-outside-root",
                   f"{len(stray)} hex color(s) outside :root — every color must be a token: {sample}")

    triples = {}
    for m2 in re.finditer(r"rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)", strip_root_blocks(css)):
        key = ",".join(m2.groups())
        triples[key] = triples.get(key, 0) + 1
    for key, n in sorted(triples.items(), key=lambda kv: -kv[1]):
        if n >= 3:
            report("WARN", "untokenized-tint",
                   f"rgb({key}) hand-mixed {n}x outside :root — define alpha tokens (e.g. --bone-70) instead")

    families = set()
    for decl in re.findall(r"font-family\s*:\s*([^;}{]+)", css, re.I):
        first = decl.split(",")[0].strip().strip("'\"").lower()
        if first not in ("inherit", "initial", "unset"):
            families.add(first)
    if len(families) > 3:
        report("FAIL", "fonts", f"{len(families)} font families ({', '.join(sorted(families))}) — max is display + text + optional mono")
    elif len(families) == 0 and css:
        report("WARN", "fonts", "no font-family declarations — typography is defaulting")

    # --- copy ---------------------------------------------------------------
    for pat in BANNED_PHRASES:
        hits = re.findall(pat, text, re.I)
        if hits:
            report("FAIL", "banned-copy", f"banned phrase {pat!r} appears {len(hits)}x — fix with a fact, not a synonym")

    emojis = [ch for ch in set(EMOJI_RE.findall(text)) if ch not in ORNAMENT_OK]
    if emojis:
        report("FAIL", "emoji", f"emoji in visible text: {' '.join(emojis[:8])} — replace with inline SVG icons")

    for pat in MODEL_LEAK:
        body_m = re.search(r"<body[^>]*>(.*?)</body>", markup, re.S | re.I)
        body_txt = visible_text(body_m.group(1)) if body_m else text
        if re.search(pat, body_txt.strip(), re.I):
            report("FAIL", "model-leak", f"model/leftover text matches {pat!r} in body")

    for pat in WEAK_CTA:
        for m2 in re.finditer(r"<(?:a|button)\b[^>]*>(.*?)</(?:a|button)>", markup, re.S | re.I):
            if re.search(pat, visible_text(m2.group(1)), re.I):
                report("WARN", "weak-cta", f"control labeled like {pat!r} — say what happens instead")
                break

    # --- images & external resources ---------------------------------------
    for m2 in re.finditer(r"<img\b[^>]*>", markup, re.I):
        tag = m2.group(0)
        if not re.search(r"\balt\s*=", tag):
            report("FAIL", "img-alt", f"<img> without alt near line {line_of(markup, m2.start())}")
        src = re.search(r'\bsrc\s*=\s*["\']([^"\']+)', tag)
        if src and re.match(r"https?://", src.group(1)):
            report(ext_level, "external-img", f"external image {src.group(1)[:60]}")

    for pat, what in [
        (r'<link[^>]+href=["\'](https?://[^"\']+)', "external stylesheet/font"),
        (r'<script[^>]+src=["\'](https?://[^"\']+)', "external script"),
        (r'@import\s+(?:url\()?["\']?(https?://[^"\')\s]+)', "CSS @import"),
        (r'url\(\s*["\']?(https?://[^"\')\s]+)', "external url() in CSS"),
    ]:
        for m2 in re.finditer(pat, markup, re.I):
            report(ext_level, "external", f"{what}: {m2.group(1)[:70]}")

    # --- motion & focus accessibility ---------------------------------------
    has_motion = bool(re.search(r"@keyframes|animation\s*:|transition\s*:", css))
    if has_motion and "prefers-reduced-motion" not in css:
        report("FAIL", "reduced-motion", "animations/transitions present but no prefers-reduced-motion block")
    if css and ":focus" not in css:
        report("WARN", "focus", "no :focus/:focus-visible styles — keyboard users get browser defaults at best")

    # --- overflow risk -------------------------------------------------------
    for m2 in re.finditer(r"(?<!(?:min|max)-)width\s*:\s*(\d{3,})px", css):
        if int(m2.group(1)) > 600:
            report("WARN", "fixed-width", f"width:{m2.group(1)}px (css line ~{line_of(css, m2.start())}) — overflow risk at 390px")

    # --- facts audit (informational — feed the Tier-3 facts ledger) ----------
    numbers = []
    for m2 in re.finditer(r"\+?\d[\d\s.,:/hH×x–—-]{0,16}\d|\b\d{4}\b|\b\d+\b", text):
        v = re.sub(r"\s+", " ", m2.group(0)).strip(" .,-–—")
        if len(v) > 1 or v.isdigit():
            numbers.append(v)
    seen, uniq = set(), []
    for v in numbers:
        if v not in seen:
            seen.add(v)
            uniq.append(v)
    if uniq:
        print("AUDIT [facts-ledger] numbers in visible text — verify each against the brief, delete any it can't back:")
        print("      " + " | ".join(uniq[:30]) + (" …" if len(uniq) > 30 else ""))
    quotes = re.findall(r"[«\"“][^»\"”]{10,200}[»\"”]\s*[—–-]?\s*[A-ZÀ-Ý][^\n]{2,60}", text)
    for q in quotes[:5]:
        print(f"AUDIT [facts-ledger] attributed quote — real, or strip the quote marks + attribution: {q[:100].strip()}…")

    # --- report --------------------------------------------------------------
    fails = [r for r in results if r[0] == "FAIL"]
    warns = [r for r in results if r[0] == "WARN"]
    for level, code, msg in results:
        print(f"{level:4}  [{code}] {msg}")
    if not results:
        print("PASS  all mechanical checks clean")
    print(f"\n{len(fails)} FAIL, {len(warns)} WARN "
          f"({'self-contained' if self_contained else 'page'} mode)")
    if fails:
        print("Fix every FAIL, justify or fix every WARN, then re-run.")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    main()
