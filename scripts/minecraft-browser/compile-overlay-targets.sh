#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
VERSION="${1:-1.12.2}"
shift || true

if [[ $# -eq 0 ]]; then
  TARGETS=("bib" "cii")
else
  TARGETS=("$@")
fi

OVERLAY_SRC="$REPO_ROOT/build/minecraft-browser/$VERSION/browser-overlay/src"
SLICE_OUT_DIR="$REPO_ROOT/build/minecraft-browser/$VERSION/browser-overlay/classes-slice"
TARGET_OUT_DIR="$REPO_ROOT/build/minecraft-browser/$VERSION/browser-overlay/classes-targets"
FIND_JAVA17_SCRIPT="$REPO_ROOT/scripts/minecraft-browser/find-java17.sh"
CP_FILE="$REPO_ROOT/build/minecraft-browser/$VERSION/classpath.txt"
MISSING_FILE="$REPO_ROOT/build/minecraft-browser/$VERSION/missing-libraries.json"
LOG_FILE="$REPO_ROOT/build/minecraft-browser/$VERSION/compile-targets.log"

mkdir -p "$(dirname "$LOG_FILE")"
exec > >(tee "$LOG_FILE") 2>&1

resolve_javac() {
  local java_bin
  local candidate

  if [[ -x "$FIND_JAVA17_SCRIPT" ]]; then
    java_bin="$($FIND_JAVA17_SCRIPT 2>/dev/null || true)"
    if [[ -n "$java_bin" ]]; then
      candidate="${java_bin%/java}/javac"
      if [[ -x "$candidate" ]]; then
        echo "$candidate"
        return 0
      fi
    fi
  fi

  if command -v javac >/dev/null 2>&1; then
    echo "$(command -v javac)"
    return 0
  fi

  return 1
}

resolve_release_level() {
  local javac_cmd="$1"
  local version_line
  local major

  version_line="$($javac_cmd -version 2>&1 | head -n 1 || true)"
  major="$(echo "$version_line" | sed -nE 's/^javac ([0-9]+).*/\1/p')"
  if [[ -z "$major" ]]; then
    echo "Unable to detect javac version from: $version_line"
    return 1
  fi

  if (( major >= 17 )); then
    echo "17"
    return 0
  fi

  if (( major >= 11 )); then
    echo "$major"
    return 0
  fi

  echo "8"
}

resolve_target_file() {
  local target="$1"
  local candidate="$OVERLAY_SRC/$target"
  local mapped_path
  local symbol_name="${target%.java}"

  if [[ -f "$candidate" ]]; then
    echo "$candidate"
    return 0
  fi

  if command -v rg >/dev/null 2>&1; then
    mapped_path="$(rg -l "^// \$VF: renamed from: ${symbol_name}$" "$OVERLAY_SRC"/class_*.java 2>/dev/null | head -n 1 || true)"
  else
    mapped_path="$(grep -l "^// \$VF: renamed from: ${symbol_name}$" "$OVERLAY_SRC"/class_*.java 2>/dev/null | head -n 1 || true)"
  fi

  if [[ -n "$mapped_path" ]]; then
    echo "$mapped_path"
    return 0
  fi

  return 1
}

bash "$REPO_ROOT/scripts/minecraft-browser/compile-overlay-slice.sh" "$VERSION" >/dev/null
node "$REPO_ROOT/scripts/minecraft-browser/prepare-classpath.js" "$VERSION" >/dev/null

if [[ ! -d "$OVERLAY_SRC" ]]; then
  echo "Overlay source tree not found: $OVERLAY_SRC"
  exit 1
fi

JAVAC_CMD="$(resolve_javac || true)"
if [[ -z "$JAVAC_CMD" ]]; then
  echo "No javac binary found. Install a JDK (11+ recommended) and retry."
  exit 1
fi

COMPILE_RELEASE="$(resolve_release_level "$JAVAC_CMD")"
EXTERNAL_CP=""
if [[ -f "$CP_FILE" ]]; then
  EXTERNAL_CP="$(cat "$CP_FILE")"
fi

if [[ -f "$MISSING_FILE" ]]; then
  MISSING_COUNT="$(node -e "const fs=require('fs');const p=process.argv[1];try{const a=JSON.parse(fs.readFileSync(p,'utf8'));process.stdout.write(String(Array.isArray(a)?a.length:0));}catch{process.stdout.write('0');}" "$MISSING_FILE")"
  if [[ "$MISSING_COUNT" != "0" ]]; then
    echo "Warning: $MISSING_COUNT Minecraft libraries are missing."
    echo "Run npm run mc:fetch-libs:1122 for fuller classpath coverage."
  fi
fi

JAVAC_VERSION_LINE="$($JAVAC_CMD -version 2>&1 | head -n 1 || true)"
if [[ "$COMPILE_RELEASE" != "17" ]]; then
  echo "Java 17 compiler not available ($JAVAC_VERSION_LINE)."
  echo "Falling back to --release $COMPILE_RELEASE for targeted compile validation."
fi

TARGET_FILES=()
TARGET_LABELS=()
for target in "${TARGETS[@]}"; do
  candidate="$target"
  if [[ "$candidate" != *.java ]]; then
    candidate="$candidate.java"
  fi

  candidate="$(resolve_target_file "$candidate" || true)"

  if [[ -z "$candidate" ]] || [[ ! -f "$candidate" ]]; then
    echo "Target source not found: $target"
    exit 1
  fi

  TARGET_FILES+=("$candidate")
  TARGET_LABELS+=("$target")
done

rm -rf "$TARGET_OUT_DIR"
mkdir -p "$TARGET_OUT_DIR"

SOURCEPATH_FALLBACK_MODE="${MC_TARGET_SOURCEPATH_MODE:-never}"
echo "Using strict target-only mode (sourcepath fallback: $SOURCEPATH_FALLBACK_MODE)."

FAILED_TARGETS=()
for idx in "${!TARGET_FILES[@]}"; do
  target_file="${TARGET_FILES[$idx]}"
  target_label="${TARGET_LABELS[$idx]}"

  echo "Compiling target: $target_label ($(basename "$target_file"))"

  if "$JAVAC_CMD" \
    --release "$COMPILE_RELEASE" \
    -implicit:none \
    -cp "$SLICE_OUT_DIR${EXTERNAL_CP:+:${EXTERNAL_CP}}" \
    -d "$TARGET_OUT_DIR" \
    "$target_file"; then
    continue
  fi

  if [[ "$SOURCEPATH_FALLBACK_MODE" == "always" || "$SOURCEPATH_FALLBACK_MODE" == "auto" ]]; then
    echo "Strict compile failed for $target_label; retrying with sourcepath dependency mode."
    if "$JAVAC_CMD" \
      --release "$COMPILE_RELEASE" \
      -implicit:class \
      -sourcepath "$OVERLAY_SRC" \
      -cp "$SLICE_OUT_DIR${EXTERNAL_CP:+:${EXTERNAL_CP}}" \
      -d "$TARGET_OUT_DIR" \
      "$target_file"; then
      continue
    fi
  fi

  FAILED_TARGETS+=("$target_label")
done

if [[ ${#FAILED_TARGETS[@]} -gt 0 ]]; then
  echo "Failed targets: ${FAILED_TARGETS[*]}"
  exit 1
fi

echo "Targeted compile succeeded for Minecraft $VERSION"
echo "Classes output: $TARGET_OUT_DIR"
echo "Target files compiled: ${#TARGET_FILES[@]}"
echo "Compile log: $LOG_FILE"