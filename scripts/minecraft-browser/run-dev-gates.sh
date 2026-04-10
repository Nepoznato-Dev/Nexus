#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
VERSION="${1:-1.12.2}"
PHASE="${2:-all}"

LOG_DIR="$REPO_ROOT/build/minecraft-browser/$VERSION"
GATE_LOG="$LOG_DIR/dev-gates.log"
SUMMARY_FILE="$LOG_DIR/dev-gates.summary"

mkdir -p "$LOG_DIR"
: > "$GATE_LOG"
: > "$SUMMARY_FILE"

log() {
  echo "$1" | tee -a "$GATE_LOG"
}

run_gate() {
  local gate_name="$1"
  shift

  log ""
  log "==> [$gate_name] $*"

  if "$@" >>"$GATE_LOG" 2>&1; then
    echo "PASS $gate_name" >> "$SUMMARY_FILE"
    log "[PASS] $gate_name"
  else
    echo "FAIL $gate_name" >> "$SUMMARY_FILE"
    log "[FAIL] $gate_name"
    log "Stopping at first failure. See $GATE_LOG"
    exit 1
  fi
}

run_baseline() {
  local baseline_targets
  baseline_targets="${MC_BASELINE_TARGETS:-cii}"

  run_gate "prepare-classpath" node "$REPO_ROOT/scripts/minecraft-browser/prepare-classpath.js" "$VERSION"
  local missing_file="$REPO_ROOT/build/minecraft-browser/$VERSION/missing-libraries.json"
  local missing_count="0"

  if [[ -f "$missing_file" ]]; then
    missing_count="$(node -e "const fs=require('fs');const p=process.argv[1];try{const a=JSON.parse(fs.readFileSync(p,'utf8'));process.stdout.write(String(Array.isArray(a)?a.length:0));}catch{process.stdout.write('0');}" "$missing_file")"
  fi

  if [[ "$missing_count" != "0" ]]; then
    run_gate "fetch-missing-libs" node "$REPO_ROOT/scripts/minecraft-browser/fetch-missing-libraries.js" "$VERSION"
  else
    log ""
    log "==> [fetch-missing-libs] skipped (no missing libraries)"
    echo "PASS fetch-missing-libs(skipped)" >> "$SUMMARY_FILE"
  fi

  run_gate "decompile" bash "$REPO_ROOT/scripts/minecraft-browser/decompile-minecraft.sh" "$VERSION"
  run_gate "overlay-prepare" bash "$REPO_ROOT/scripts/minecraft-browser/prepare-source-overlay.sh" "$VERSION"
  run_gate "compile-slice" bash "$REPO_ROOT/scripts/minecraft-browser/compile-overlay-slice.sh" "$VERSION"
  # Stable default baseline validates known critical target; override with MC_BASELINE_TARGETS="bib cii" when hardening broader targets.
  run_gate "compile-targets" bash "$REPO_ROOT/scripts/minecraft-browser/compile-overlay-targets.sh" "$VERSION" $baseline_targets
}

run_teavm() {
  run_gate "teavm-attempt" bash "$REPO_ROOT/scripts/minecraft-browser/run-teavm-attempt.sh" "$VERSION"
}

run_isolate() {
  run_gate "teavm-isolate" bash "$REPO_ROOT/scripts/minecraft-browser/isolate-teavm-crash.sh" "$VERSION"
}

log "Minecraft browser-port development gates"
log "Version: $VERSION"
log "Phase: $PHASE"
log "Log: $GATE_LOG"

case "$PHASE" in
  baseline)
    run_baseline
    ;;
  teavm)
    run_teavm
    ;;
  isolate)
    run_isolate
    ;;
  all)
    run_baseline
    run_teavm
    ;;
  *)
    echo "Unknown phase: $PHASE"
    echo "Usage: bash scripts/minecraft-browser/run-dev-gates.sh [version] [baseline|teavm|isolate|all]"
    exit 2
    ;;
esac

log ""
log "Completed phase: $PHASE"
log "Summary: $SUMMARY_FILE"
cat "$SUMMARY_FILE"
