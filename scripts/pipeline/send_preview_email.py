#!/usr/bin/env python3
"""
Send prospect emails via Resend.

Sends a personalized 'your free website preview is ready' email to a lead
once their prototype is completed.

Usage:
    python3 send_preview_email.py --lead-id <id> --proto-id <id> [--preview-url <url>]

Reads lead + prototype from Supabase, builds a personalized email, sends via Resend API.
"""

import argparse
import json
import os
import sys
import urllib.request
import urllib.error
from datetime import datetime, timezone

# ─── Config ───

def _load_env():
    env_path = os.path.join(os.path.dirname(__file__), "..", "..", ".env.local")
    if os.path.exists(env_path):
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if line.startswith("#") or "=" not in line:
                    continue
                key, _, val = line.partition("=")
                os.environ.setdefault(key.strip(), val.strip())

_load_env()

RESEND_API_KEY = os.environ.get("RESEND_API_KEY")
RESEND_FROM = os.environ.get("RESEND_FROM_EMAIL", "hello@seawaysites.com")
SUPABASE_URL = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

SITE_URL = "https://seawaysites.com"


# ─── Supabase helpers ───

def _supabase_headers():
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
    }


def get_lead(lead_id):
    """Fetch a lead from Supabase."""
    url = f"{SUPABASE_URL}/rest/v1/leads?id=eq.{lead_id}&limit=1"
    req = urllib.request.Request(url, headers=_supabase_headers())
    with urllib.request.urlopen(req, timeout=15) as resp:
        data = json.loads(resp.read())
    return data[0] if data else None


def get_prototype(proto_id):
    """Fetch a prototype from Supabase."""
    url = f"{SUPABASE_URL}/rest/v1/prototypes?id=eq.{proto_id}&limit=1"
    req = urllib.request.Request(url, headers=_supabase_headers())
    with urllib.request.urlopen(req, timeout=15) as resp:
        data = json.loads(resp.read())
    return data[0] if data else None


def mark_email_sent(lead_id, proto_id):
    """Record that the preview email was sent."""
    now = datetime.now(timezone.utc).isoformat()
    # Update lead status to email_sent
    url = f"{SUPABASE_URL}/rest/v1/leads?id=eq.{lead_id}"
    body = {"status": "email_sent", "updated_at": now}
    req = urllib.request.Request(url, data=json.dumps(body).encode(), method="PATCH", headers=_supabase_headers())
    urllib.request.urlopen(req, timeout=15)

    # Insert outreach log entry
    log_url = f"{SUPABASE_URL}/rest/v1/outreach_logs"
    log_body = {
        "lead_id": lead_id,
        "prototype_id": proto_id,
        "channel": "email",
        "status": "sent",
        "subject": f"Your free website preview for {get_lead(lead_id).get('business_name', 'your business')}",
        "sent_at": now,
        "created_at": now,
        "updated_at": now,
    }
    log_req = urllib.request.Request(log_url, data=json.dumps(log_body).encode(), method="POST", headers=_supabase_headers())
    try:
        urllib.request.urlopen(log_req, timeout=15)
    except urllib.error.HTTPError as e:
        # Outreach log table might not exist or have different schema — don't fail the send
        print(f"  ⚠ Could not log outreach (non-critical): {e}", file=sys.stderr)


# ─── Email builder ───

def build_email_html(lead, prototype):
    """Build a personalized HTML email for the prospect."""
    business_name = lead.get("business_name", "your business")
    first_name = business_name.split()[0] if business_name else "there"
    industry = lead.get("industry", "service")
    city = lead.get("city", "your area")
    slug = lead.get("slug", "")
    preview_url = f"{SITE_URL}/preview/{slug}"

    return f"""\
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f7f5f2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a2e;">

  <div style="max-width:560px;margin:0 auto;padding:32px 20px;">

    <!-- Logo / Brand -->
    <div style="text-align:center;margin-bottom:32px;">
      <span style="font-size:22px;font-weight:700;letter-spacing:-0.5px;color:#1a1a2e;">Seaway Sites</span>
    </div>

    <!-- Hero -->
    <h1 style="font-size:28px;line-height:1.2;font-weight:700;margin:0 0 16px;text-align:center;">
      Your free website preview is ready, {first_name}
    </h1>

    <p style="font-size:17px;line-height:1.6;color:#444;margin:0 0 28px;text-align:center;">
      We built a custom website concept for <strong>{business_name}</strong>{f' in {city}' if city and city != 'your area' else ''}.
      No strings attached — take a look and tell us what you think.
    </p>

    <!-- CTA Button -->
    <div style="text-align:center;margin:32px 0;">
      <a href="{preview_url}"
         style="display:inline-block;background:#1a1a2e;color:#fff;font-size:17px;font-weight:600;padding:16px 36px;border-radius:8px;text-decoration:none;">
        See my free preview →
      </a>
    </div>

    <!-- What you get -->
    <div style="background:#fff;border-radius:12px;padding:28px;margin:28px 0;">
      <h2 style="font-size:18px;margin:0 0 12px;">What's in your preview:</h2>
      <ul style="font-size:15px;line-height:1.8;color:#444;margin:0;padding-left:20px;">
        <li>A complete, industry-specific landing page designed for {industry.replace('_', ' ')}</li>
        <li>Professional photography and a polished color palette</li>
        <li>Mobile-responsive — looks great on any phone</li>
        <li>Ready to go live on your domain in days, not months</li>
      </ul>
    </div>

    <!-- Pricing -->
    <div style="text-align:center;margin:32px 0;">
      <p style="font-size:15px;color:#666;margin:0 0 8px;">This preview is <strong>100% free</strong>. If you like it:</p>
      <p style="font-size:15px;color:#666;margin:0;">
        Setup from <strong>$299</strong> · Then <strong>$49/month</strong> hosting &amp; support
      </p>
    </div>

    <!-- Footer -->
    <hr style="border:none;border-top:1px solid #e5e0dc;margin:32px 0;">
    <p style="font-size:13px;color:#999;text-align:center;line-height:1.6;">
      Seaway Sites · Cornwall, Ontario<br>
      This preview was created for {business_name}. Not interested? Just ignore this email.
    </p>

  </div>
</body>
</html>"""


def build_email_text(lead, prototype):
    """Plain-text fallback."""
    business_name = lead.get("business_name", "your business")
    first_name = business_name.split()[0] if business_name else "there"
    slug = lead.get("slug", "")
    preview_url = f"{SITE_URL}/preview/{slug}"
    industry = lead.get("industry", "service")

    return f"""\
Hi {first_name},

Your free website preview for {business_name} is ready.

We built a custom website concept designed for your industry — professional, mobile-responsive, and ready to go live.

See it here: {preview_url}

This preview is 100% free. If you like it, setup is from $299 + $49/month for hosting and support.

— Seaway Sites
seawaysites.com"""


# ─── Resend API ───

def send_email(to_email, subject, html, text):
    """Send an email via Resend API."""
    if not RESEND_API_KEY:
        raise RuntimeError("RESEND_API_KEY not set")

    import http.client, ssl

    payload = json.dumps({
        "from": RESEND_FROM,
        "to": [to_email],
        "subject": subject,
        "html": html,
        "text": text,
    })

    ctx = ssl.create_default_context()
    conn = http.client.HTTPSConnection("api.resend.com", timeout=30, context=ctx)
    try:
        conn.request("POST", "/emails", payload, {
            "Authorization": f"Bearer {RESEND_API_KEY}",
            "Content-Type": "application/json",
        })
        resp = conn.getresponse()
        body = resp.read().decode()
        if resp.status == 200:
            return json.loads(body).get("id", "unknown")
        else:
            print(f"Resend API error {resp.status}: {body}", file=sys.stderr)
            raise RuntimeError(f"Resend API error {resp.status}: {body}")
    finally:
        conn.close()


# ─── Main ───

def main():
    if not RESEND_API_KEY:
        print("ERROR: RESEND_API_KEY not set in env", file=sys.stderr)
        sys.exit(1)
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required", file=sys.stderr)
        sys.exit(1)

    parser = argparse.ArgumentParser(description="Send preview email to a lead")
    parser.add_argument("--lead-id", required=True, help="Lead ID in Supabase")
    parser.add_argument("--proto-id", help="Prototype ID (optional, for logging)")
    parser.add_argument("--preview-url", help="Override preview URL")
    parser.add_argument("--dry-run", action="store_true", help="Print email without sending")
    args = parser.parse_args()

    # Fetch lead
    lead = get_lead(args.lead_id)
    if not lead:
        print(f"ERROR: Lead {args.lead_id} not found", file=sys.stderr)
        sys.exit(1)

    if not lead.get("email"):
        print(f"ERROR: Lead {args.lead_id} has no email address", file=sys.stderr)
        sys.exit(1)

    # Fetch prototype if provided
    prototype = None
    if args.proto_id:
        prototype = get_prototype(args.proto_id)

    # Build email
    business_name = lead.get("business_name", "your business")
    html = build_email_html(lead, prototype)
    text = build_email_text(lead, prototype)
    subject = f"Your free website preview for {business_name}"

    if args.dry_run:
        print(f"=== DRY RUN ===")
        print(f"To: {lead['email']}")
        print(f"Subject: {subject}")
        print(f"Preview URL: {SITE_URL}/preview/{lead.get('slug', '')}")
        print(f"\n--- HTML ---\n{html[:500]}...")
        print(f"\n--- Text ---\n{text}")
        return

    # Send
    print(f"Sending preview email to {lead['email']} for {business_name}...")
    email_id = send_email(lead["email"], subject, html, text)
    print(f"  ✓ Email sent! Resend ID: {email_id}")

    # Log
    mark_email_sent(args.lead_id, args.proto_id or "")
    print(f"  ✓ Lead status updated to 'email_sent'")


if __name__ == "__main__":
    main()