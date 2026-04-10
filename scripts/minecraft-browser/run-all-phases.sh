#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
VERSION="${1:-1.12.2}"
LOG_DIR="$REPO_ROOT/build/minecraft-browser/$VERSION"
PLAN_LOG="$LOG_DIR/playable-phases.log"
SUMMARY_FILE="$LOG_DIR/playable-phases.summary"

mkdir -p "$LOG_DIR"
: > "$PLAN_LOG"
: > "$SUMMARY_FILE"

log() {
  echo "$1" | tee -a "$PLAN_LOG"
}

run_phase() {
  local phase_name="$1"
  shift

  log ""
  log "==> [${phase_name}] $*"

  if "$@" >>"$PLAN_LOG" 2>&1; then
    echo "PASS ${phase_name}" >> "$SUMMARY_FILE"
    log "[PASS] ${phase_name}"
    return 0
  fi

  echo "FAIL ${phase_name}" >> "$SUMMARY_FILE"
  log "[FAIL] ${phase_name}"
  return 1
}

log "Minecraft browser-port phased implementation run"
log "Version: $VERSION"
log "Log: $PLAN_LOG"

if ! run_phase "baseline" bash "$REPO_ROOT/scripts/minecraft-browser/run-dev-gates.sh" "$VERSION" baseline; then
  log "Baseline failed. Fix baseline blockers before TeaVM/runtime phases."
  cat "$SUMMARY_FILE"
  exit 1
fi

if ! run_phase "teavm" bash "$REPO_ROOT/scripts/minecraft-browser/run-dev-gates.sh" "$VERSION" teavm; then
  log "TeaVM failed. Running isolate phase to capture first blocker family."
  if ! run_phase "teavm-isolate" bash "$REPO_ROOT/scripts/minecraft-browser/run-dev-gates.sh" "$VERSION" isolate; then
    log "Isolate phase failed as well; inspect logs for first actionable class family."
  fi
  cat "$SUMMARY_FILE"
  exit 1
fi

if ! run_phase "runtime-bootstrap" bash "$REPO_ROOT/scripts/minecraft-browser/create-teavm-bootstrap.sh" "$VERSION"; then
  log "TeaVM succeeded but runtime bootstrap generation failed."
  cat "$SUMMARY_FILE"
  exit 1
fi

log ""
log "All automated phases completed."
log "Open build/minecraft-browser/$VERSION/teavm-out/launch.html for browser runtime diagnostics."
cat "$SUMMARY_FILE"
