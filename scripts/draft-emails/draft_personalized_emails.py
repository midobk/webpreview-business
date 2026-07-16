#!/usr/bin/env python3
"""
Personalized email drafter.

Generates a unique, personalized outreach email for a specific lead + prototype.
Uses MiniMax M3 or GLM 5.2 to write copy that references the actual business
by name, location, and prototype details.

This is NOT template-based. The script sends the lead's context to the LLM
and asks for a fresh, single-shot email draft per lead.

Output: data/outreach/<slug>/email.json with subject, body, angle, lead_id, created_at.
Appends to data/outreach_logs.json.

Usage:
    python3 draft_personalized_emails.py [--limit 10] [--provider anthropic|openai|ollama]

Without --provider, falls back to writing a deterministic but varied draft
based on the lead's data (no LLM call needed). For higher quality, use an
LLM provider via env vars.
"""

import argparse
import json
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

LEADS_PATH = "data/leads.json"
PROTOS_PATH = "data/prototypes.json"
OUTREACH_DIR = "data/outreach"
OUTREACH_LOG = "data/outreach_logs.json"


def load_leads():
    with open(LEADS_PATH) as f:
        return json.load(f)


def load_prototypes():
    with open(PROTOS_PATH) as f:
        return json.load(f)


def load_outreach_log():
    if not os.path.exists(OUTREACH_LOG):
        return {"_schema_version": "1.0", "logs": []}
    with open(OUTREACH_LOG) as f:
        return json.load(f)


def save_outreach_log(log):
    with open(OUTREACH_LOG, "w") as f:
        json.dump(log, f, indent=2)


def lead_has_draft(slug, log):
    return any(
        r.get("lead_slug") == slug and r.get("status") in ("drafted", "sent", "replied", "won")
        for r in log.get("logs", [])
    )


def lead_has_prototype(lead, prototypes):
    return any(p.get("lead_id") == lead["id"] for p in prototypes)


def get_prototype_for_lead(lead, prototypes):
    matches = [p for p in prototypes if p.get("lead_id") == lead["id"]]
    if not matches:
        return None
    # Prefer completed, then highest score
    matches.sort(key=lambda p: (p.get("generation_status") != "completed", -(p.get("prototype_score") or 0)))
    return matches[0]


def generate_email_via_ollama(lead, prototype):
    """Generate a personalized email using a local Ollama model."""
    import urllib.request
    import urllib.error

    industry = lead.get("industry", "service")
    business_name = lead.get("business_name", "your business")
    city = lead.get("city", "your area")
    description = lead.get("description", "")

    prompt = f"""Write a short, friendly cold email to a local Canadian business owner about a website preview I made for them.

Business details:
- Name: {business_name}
- Industry: {industry}
- City: {city}
- Description: {description}

The email must:
- Be under 90 words in the body
- Reference them by name and city naturally
- Mention I made a 1-page website preview concept for them
- NOT include any pricing
- End with a soft CTA: "Want to see it?" or "Should I send the link?"
- Have a subject line that's specific (not generic "Hi from Seaway Sites")
- Sound human, not salesy
- No emojis, no exclamation points

Format:
SUBJECT: <subject line>
BODY:
<email body>
"""

    payload = json.dumps({
        "model": "minimax-m3:cloud",
        "prompt": prompt,
        "stream": False,
        "options": {"num_ctx": 8000, "temperature": 0.8}
    }).encode()

    req = urllib.request.Request(
        "http://172.31.87.51:11434/api/generate",
        data=payload,
        headers={"Content-Type": "application/json"}
    )

    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            result = json.loads(resp.read())
            text = result.get("response", "").strip()
            return parse_email_response(text, lead, prototype)
    except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError) as e:
        print(f"  Ollama error: {e}", file=sys.stderr)
        return None


def parse_email_response(text, lead, prototype):
    """Parse 'SUBJECT: ... BODY: ...' format from LLM."""
    subject_match = re.search(r"SUBJECT:\s*(.+?)(?:\n|$)", text, re.IGNORECASE)
    body_match = re.search(r"BODY:\s*\n?(.*)", text, re.IGNORECASE | re.DOTALL)

    if subject_match and body_match:
        return {
            "subject": subject_match.group(1).strip(),
            "body": body_match.group(1).strip(),
        }
    # Fallback: treat whole text as body, derive subject from first line
    lines = text.split("\n", 1)
    subject = lines[0].strip().rstrip(".")[:80] if lines else f"A quick idea for {lead.get('business_name', 'your business')}"
    body = lines[1].strip() if len(lines) > 1 else text.strip()
    return {"subject": subject, "body": body}


def generate_email_deterministic(lead, prototype):
    """Fallback: deterministic but varied draft based on lead data. No LLM."""
    business_name = lead.get("business_name", "your business")
    city = lead.get("city", "your area")
    industry = lead.get("industry", "service")

    # 4 different angle variations, picked deterministically per slug
    slug_hash = sum(ord(c) for c in lead.get("slug", "")) % 4

    angles = [
        {
            "angle": "preview_made",
            "subject": f"I made a website preview for {business_name}",
            "body": (
                f"Hi,\n\n"
                f"I came across {business_name} in {city} and noticed you don't have a website yet. "
                f"I went ahead and designed a quick 1-page preview concept for your {industry} business — "
                f"with a hero section, services list, and contact form.\n\n"
                f"It's not live anywhere, just a concept to show what's possible. Want to see it?\n\n"
                f"— Mehdi"
            ),
        },
        {
            "angle": "noticed_gap",
            "subject": f"Quick thought for {business_name}",
            "body": (
                f"Hi,\n\n"
                f"I was looking at {industry} businesses in {city} and noticed {business_name} doesn't have a website yet. "
                f"That's usually where customers go first when they're deciding who to call.\n\n"
                f"I sketched a quick preview for you — clean one-pager, mobile-ready, no fluff. "
                f"Happy to send the link if you'd like to see it.\n\n"
                f"— Mehdi"
            ),
        },
        {
            "angle": "deserves_better",
            "subject": f"For {business_name} — a 2-min idea",
            "body": (
                f"Hi,\n\n"
                f"I made a quick website concept for {business_name} — clean, simple, focused on what you do best in {city}. "
                f"Think of it as a 'what if' preview, not a sales pitch.\n\n"
                f"If it resonates, I can finalize it for you. If not, no worries. Want the link?\n\n"
                f"— Mehdi"
            ),
        },
        {
            "angle": "helped_neighbors",
            "subject": f"Working with {industry} businesses in {city}",
            "body": (
                f"Hi,\n\n"
                f"I've been helping {industry} businesses in {city} get online with simple, professional websites. "
                f"I put together a quick concept for {business_name} — one page, fast loading, easy for customers to find you.\n\n"
                f"Curious what you think? Reply and I'll send the preview.\n\n"
                f"— Mehdi"
            ),
        },
    ]

    return angles[slug_hash]


def main():
    parser = argparse.ArgumentParser(description="Draft personalized outreach emails")
    parser.add_argument("--limit", type=int, default=10)
    parser.add_argument("--provider", choices=["ollama", "deterministic"], default="deterministic")
    args = parser.parse_args()

    leads = load_leads()
    prototypes = load_prototypes()
    log = load_outreach_log()

    targets = [
        l for l in leads
        if lead_has_prototype(l, prototypes)
        and l.get("email")
        and not lead_has_draft(l["slug"], log)
    ][:args.limit]

    print(f"Drafting personalized emails for {len(targets)} leads (provider: {args.provider})")

    drafted = 0
    for lead in targets:
        proto = get_prototype_for_lead(lead, prototypes)

        if args.provider == "ollama":
            email = generate_email_via_ollama(lead, proto)
            if not email:
                print(f"  {lead['business_name']}: Ollama failed, falling back to deterministic")
                email = generate_email_deterministic(lead, proto)
        else:
            email = generate_email_deterministic(lead, proto)

        email["lead_slug"] = lead["slug"]
        email["lead_id"] = lead["id"]
        email["business_name"] = lead["business_name"]
        email["industry"] = lead["industry"]
        email["city"] = lead.get("city", "")
        email["provider"] = args.provider
        email["created_at"] = datetime.now(timezone.utc).isoformat() + "Z"

        # Save to per-lead file
        out_dir = Path(OUTREACH_DIR) / lead["slug"]
        out_dir.mkdir(parents=True, exist_ok=True)
        with open(out_dir / "email.json", "w") as f:
            json.dump(email, f, indent=2)

        # Append to log
        log_entry = {
            "id": f"outreach-{len(log.get('logs', [])) + 1:04d}",
            "lead_id": lead["id"],
            "lead_slug": lead["slug"],
            "channel": "email",
            "status": "drafted",
            "subject": email["subject"],
            "angle": email.get("angle", "personalized"),
            "provider": args.provider,
            "created_at": email["created_at"],
            "sent_at": None,
            "replied_at": None,
            "outcome": None,
        }
        log.setdefault("logs", []).append(log_entry)

        # Update lead status
        lead["status"] = "email_drafted"
        lead["updated_at"] = email["created_at"]

        drafted += 1
        print(f"  ✓ {lead['business_name']} ({lead.get('city', '')}): \"{email['subject']}\"")

    save_outreach_log(log)

    # Save updated leads
    with open(LEADS_PATH, "w") as f:
        json.dump(leads, f, indent=2)

    print(f"\nDrafted {drafted} emails. Logged to {OUTREACH_LOG}.")


if __name__ == "__main__":
    main()