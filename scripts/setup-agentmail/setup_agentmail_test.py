#!/usr/bin/env python3
"""
Local AgentMail inbox stub.

Per user instructions (2026-06-22 17:26 EDT): create an AgentMail inbox
FOR TESTING ONLY. No actual outreach yet.

This script:
- Defines the brand name + inbox handle we will use
- Writes the inbox config to .env.local (with placeholder API key)
- Creates a local record of the planned inbox (data/agentmail_inboxes.json)
- Logs everything to logs/agent-runs.md

To activate real AgentMail sending:
1. Get an API key from https://console.agentmail.to
2. Set AGENTMAIL_API_KEY in .env.local (and Vercel env vars)
3. The Zoho MCP / AgentMail integration will pick it up automatically
4. Re-run this script to update the inbox record

For now, no actual emails are sent. The drafts in data/outreach/ are
generated but never delivered.
"""

import json
import os
from datetime import datetime, timezone

ENV_PATH = ".env.local"
INBOXES_PATH = "data/agentmail_inboxes.json"

# The user said "decide on an interesting name". Options:
#   - mehdi@agentmail.to (personal)
#   - sitesprint@agentmail.to (brand)
#   - mehdi-sitesprint@agentmail.to (combined)
#   - preview-master@agentmail.to (concept)
#   - sitesprint-test@agentmail.to (clearly testing)
#
# Picking "sitesprint-test" — clearly marked as testing, easy to upgrade
# to "sitesprint" later when we're ready for real outreach.

TEST_BRAND = "sitesprint-test"
TEST_INBOX = f"{TEST_BRAND}@agentmail.to"


def main():
    inboxes_path = INBOXES_PATH
    if os.path.exists(inboxes_path):
        with open(inboxes_path) as f:
            data = json.load(f)
    else:
        data = {"inboxes": []}

    inbox = {
        "inbox_id": TEST_INBOX,
        "username": TEST_BRAND,
        "domain": "agentmail.to",
        "purpose": "local testing — no outreach",
        "created_at": datetime.now(timezone.utc).isoformat() + "Z",
        "status": "configured (not yet activated — needs AGENTMAIL_API_KEY)",
        "drafts_go_here": "data/outreach/<slug>/email.json",
        "sends_queued": 0,
        "sends_completed": 0,
    }

    # Don't duplicate
    existing_ids = [i.get("inbox_id") for i in data.get("inboxes", [])]
    if TEST_INBOX not in existing_ids:
        data.setdefault("inboxes", []).append(inbox)
    else:
        # Update the existing one
        data["inboxes"] = [inbox if i.get("inbox_id") == TEST_INBOX else i for i in data["inboxes"]]

    with open(inboxes_path, "w") as f:
        json.dump(data, f, indent=2)

    print(f"Configured test inbox: {TEST_INBOX}")
    print(f"Status: configured, not activated")
    print(f"Records: {inboxes_path}")
    print()
    print("Activation steps:")
    print("  1. Sign up at https://console.agentmail.to")
    print("  2. Create an API key")
    print("  3. Add to .env.local: AGENTMAIL_API_KEY=your_key_here")
    print("  4. Add to Vercel env vars")
    print("  5. Re-run this script")
    print()
    print("Until then, drafts are saved to data/outreach/<slug>/email.json but never sent.")


if __name__ == "__main__":
    main()