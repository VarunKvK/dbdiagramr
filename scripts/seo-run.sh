#!/usr/bin/env bash
# seo-run.sh — dbdiagramr SEO / content pipeline orchestrator.
#
#   npm run seo:run                 -> all  (gsc -> underperformers -> audit -> jsonld -> devto notify -> report)
#   npm run seo:run audit           -> A1 only
#   npm run seo:run gsc             -> GSC fetch only
#   npm run seo:run underperformers -> A2 only
#   npm run seo:run jsonld          -> A5 structured-data validation only
#   npm run seo:run devto           -> A3 notify only
#   npm run seo:run devto-schedule  -> A3 schedule (sync local drafts to dev.to + assign slots)
#   npm run seo:run report          -> aggregate weekly report only
#   npm run seo:run schedule        -> alias for devto-schedule
#
# Exits non-zero if any step failed (so it can gate a deploy).

set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VAULT="${VAULT:-/home/varunkrishnan/Odyssey}"
CONTENT="$VAULT/Content"
GSC_DIR="$CONTENT/scripts/gsc"
DEVTO_DIR="$CONTENT/scripts/devto"
INBOX_WEEKLY="$CONTENT/Inbox/weekly"
GSC_ENV="$GSC_DIR/.env"
SCRIPTS_ENV="/home/varunkrishnan/NothingImp/Dev/Scripts/.env"

LOG() { echo "[seo-run] $*"; }
FAIL=0
GSC_ST=ok; UP_ST=ok; AUDIT_ST=ok; DEVTO_ST=ok; JSONLD_ST=ok

# --- env ---
if [ -f "$GSC_ENV" ]; then
  set -a; # shellcheck disable=SC1091
  source "$GSC_ENV"; set +a
fi
if [ -f "$SCRIPTS_ENV" ]; then
  set -a; # shellcheck disable=SC1091
  source "$SCRIPTS_ENV"; set +a
fi

usage() {
  grep '^#   npm run' "$0" | sed 's/^#   //'
  exit 0
}

step_gsc() {
  LOG "A0 gsc-fetch"
  if (cd "$GSC_DIR" && ./run.sh --days 28); then GSC_ST=ok; else LOG "gsc failed"; GSC_ST=FAIL; FAIL=1; fi
}

step_underperformers() {
  LOG "A2 underperformers"
  if python3 "$GSC_DIR/gsc_underperformers.py"; then UP_ST=ok; else LOG "underperformers failed"; UP_ST=FAIL; FAIL=1; fi
}

step_audit() {
  LOG "A1 seo-audit"
  if node "$ROOT/scripts/seo-audit.mjs"; then AUDIT_ST=ok; else LOG "audit failed (see report)"; AUDIT_ST=FAIL; FAIL=1; fi
}

step_jsonld() {
  LOG "A5 validate-jsonld"
  if node "$ROOT/scripts/validate-jsonld.mjs"; then JSONLD_ST=ok; else LOG "jsonld validation failed (see report)"; JSONLD_ST=FAIL; FAIL=1; fi
}

step_devto_notify() {
  LOG "A3 devto notify"
  if python3 "$DEVTO_DIR/devto_schedule.py" notify; then DEVTO_ST=ok; else LOG "devto notify failed"; DEVTO_ST=FAIL; FAIL=1; fi
}

step_devto_schedule() {
  LOG "A3 devto schedule"
  python3 "$DEVTO_DIR/devto_schedule.py" schedule || { LOG "devto schedule failed"; FAIL=1; }
}

step_report() {
  LOG "A4 weekly report"
  STAMP="$(date +%Y%m%d)"
  mkdir -p "$INBOX_WEEKLY"
  OUT="$INBOX_WEEKLY/$STAMP-seo-report.md"
  {
    echo "# SEO weekly report — $(date '+%Y-%m-%d %H:%M')"
    echo
    echo "Status: gsc=$GSC_ST | audit=$AUDIT_ST | jsonld=$JSONLD_ST | underperformers=$UP_ST | devto=$DEVTO_ST"
    echo
    echo "## dev.to queue"
    python3 "$DEVTO_DIR/devto_schedule.py" status 2>/dev/null || echo "(devto status unavailable)"
  } > "$OUT"
  LOG "report -> $OUT"
}

cmd="${1:-all}"
case "$cmd" in
  all)
    step_gsc
    step_underperformers
    step_audit
    step_jsonld
    step_devto_notify
    step_report
    ;;
  audit) step_audit ;;
  gsc) step_gsc ;;
  underperformers) step_underperformers ;;
  jsonld) step_jsonld ;;
  devto) step_devto_notify ;;
  devto-schedule|schedule) step_devto_schedule ;;
  report) step_report ;;
  *) usage ;;
esac

if [ "$FAIL" -ne 0 ]; then
  LOG "one or more steps failed"
  exit 1
fi
exit 0
