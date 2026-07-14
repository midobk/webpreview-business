#!/usr/bin/env bash
# scripts/run-with-env.sh — load .env.local into the environment, then exec the given command.
#
# Why this exists: the discovery cron's agentTurn payload inline-encodes env vars like
# GOOGLE_PLACES_API_KEY, and the previous inline value was a broken placeholder that
# crashed every run. Instead of hard-coding the real key in the cron payload (where it
# would be visible in agent logs / Telegram delivery), we source the local .env.local
# file and let the actual command pick up real values via os.environ.
#
# Usage:
#   scripts/run-with-env.sh python3 scripts/discover-leads/discover_places.py --all --tier 1
#   scripts/run-with-env.sh python3 scripts/score-leads/score.py
#
# Notes:
#   - .env.local must be present at the workspace root.
#   - Variables already in the shell environment take precedence over .env.local.
#   - Does NOT log key values in full. For verification, prints only the first 4 chars
#     of any *_KEY / *_TOKEN var that looks like a placeholder (length < 8 or contains
#     the unicode ellipsis or a sentinel literal).

set -eu
WORKSPACE_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$WORKSPACE_ROOT/.env.local"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "[run-with-env] FATAL: $ENV_FILE not found" >&2
  exit 2
fi

ELLIPSIS="..."   # the literal "..." string we want to detect as a placeholder
PLACEHOLDER_SENTINEL="XXX-CHANGEME-XXX"

# Load .env.local into the shell environment. We use a manual parse loop instead of
# `set -a; source ...` to avoid bash's interactive-mode quirks with values that
# contain '=' or '$' (e.g. the bcrypt PASSWORD_HASH uses $2b$10$...).
while IFS= read -r line || [[ -n "$line" ]]; do
  # Skip blank lines and comments
  [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue
  # Only process lines that look like VAR=value
  [[ "$line" =~ ^[A-Za-z_][A-Za-z0-9_]*= ]] || continue
  key="${line%%=*}"
  # Don't overwrite anything the caller already set explicitly
  if [[ -z "${!key+x}" ]]; then
    # Strip optional surrounding quotes from the value
    val="${line#*=}"
    case "$val" in
      \"*\") val="${val#\"}"; val="${val%\"}" ;;
      \'*\') val="${val#\'}"; val="${val%\'}" ;;
    esac
    export "$key=$val"
  fi
done < "$ENV_FILE"

# Sanity-check the critical keys without logging them in full
for k in GOOGLE_PLACES_API_KEY PASSWORD_HASH SUPABASE_SERVICE_ROLE_KEY AGENTMAIL_API_KEY; do
  if [[ -n "${!k:-}" ]]; then
    v="${!k}"
    if [[ "${#v}" -lt 8 || "$v" == *"$ELLIPSIS"* || "$v" == "$PLACEHOLDER_SENTINEL"* ]]; then
      echo "[run-with-env] WARN: $k looks like a placeholder (len=${#v}), downstream command may fail" >&2
    fi
  else
    # Only warn about the most important one — Places key is required for discovery
    if [[ "$k" == "GOOGLE_PLACES_API_KEY" ]]; then
      echo "[run-with-env] WARN: GOOGLE_PLACES_API_KEY is empty" >&2
    fi
  fi
done

# Exec the rest of the command line, replacing this shell process
exec "$@"
