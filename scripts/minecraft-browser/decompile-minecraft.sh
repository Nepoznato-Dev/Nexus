#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
VERSION="${1:-1.12.2}"
RUNNER_POM="$REPO_ROOT/scripts/minecraft-browser/vineflower-runner/pom.xml"
JAR_PATH="$REPO_ROOT/Minecraft_FULLcode/versions/$VERSION/$VERSION.jar"
OUT_ROOT="$REPO_ROOT/build/minecraft-browser/$VERSION/decompiled"
SRC_ZIP="$OUT_ROOT/${VERSION}-sources.zip"
SRC_DIR="$OUT_ROOT/src"
LOG_FILE="$OUT_ROOT/decompile.log"
STAGING_DIR="$OUT_ROOT/.src-staging"
JAVA_CMD="${JAVA_CMD:-java}"
FIND_JAVA17_SCRIPT="$REPO_ROOT/scripts/minecraft-browser/find-java17.sh"

if [[ -x "$FIND_JAVA17_SCRIPT" ]] && [[ -z "${JAVA_CMD_OVERRIDE:-}" ]]; then
  JAVA17_CANDIDATE="$($FIND_JAVA17_SCRIPT 2>/dev/null || true)"
  if [[ -n "$JAVA17_CANDIDATE" ]]; then
    JAVA_CMD="$JAVA17_CANDIDATE"
  fi
fi

if [[ ! -f "$JAR_PATH" ]]; then
  echo "Missing jar: $JAR_PATH"
  exit 1
fi

mkdir -p "$OUT_ROOT"
rm -rf "$SRC_DIR"
rm -rf "$STAGING_DIR"
rm -f "$SRC_ZIP" "$LOG_FILE"

echo "==> Using Java runtime: $JAVA_CMD" | tee "$LOG_FILE"
"$JAVA_CMD" -version 2>&1 | head -n 1 | tee -a "$LOG_FILE"

echo "==> Resolving Vineflower decompiler" | tee -a "$LOG_FILE"
mvn -q -f "$RUNNER_POM" dependency:build-classpath -Dmdep.outputFile="$OUT_ROOT/vineflower.classpath.txt" -Dmdep.includeScope=runtime
VF_CP="$(cat "$OUT_ROOT/vineflower.classpath.txt")"

echo "==> Decompiling $JAR_PATH" | tee -a "$LOG_FILE"
# -ren=1 asks Vineflower to rename problematic obfuscated identifiers into legal Java names.
# This significantly reduces placeholder/keyword collisions in the emitted source tree.
set +e
"$JAVA_CMD" -Xmx6G -cp "$VF_CP" org.jetbrains.java.decompiler.main.decompiler.ConsoleDecompiler \
  -dgs=1 -hdc=0 -rsy=1 -jvn=1 -asc=1 -ren=1 -log=INFO \
  "$JAR_PATH" "$OUT_ROOT" 2>&1 | tee -a "$LOG_FILE"
STATUS=${PIPESTATUS[0]}
set -e

if [[ $STATUS -ne 0 ]]; then
  echo "Decompile failed. See $LOG_FILE" | tee -a "$LOG_FILE"
  exit $STATUS
fi

mkdir -p "$SRC_DIR"

if [[ -f "$SRC_ZIP" ]]; then
  unzip -oq "$SRC_ZIP" -d "$SRC_DIR"
else
  # Some Vineflower runs emit sources directly into OUT_ROOT instead of a zip archive.
  # Normalize that layout into OUT_ROOT/src so the next pipeline step has a stable path.
  mkdir -p "$STAGING_DIR"

  shopt -s nullglob
  for item in "$OUT_ROOT"/*; do
    base_name="$(basename "$item")"
    if [[ "$base_name" == "src" || "$base_name" == ".src-staging" || "$base_name" == "decompile.log" || "$base_name" == "vineflower.classpath.txt" || "$base_name" == "${VERSION}-sources.zip" ]]; then
      continue
    fi

    mv "$item" "$STAGING_DIR/"
  done
  shopt -u nullglob

  if [[ -z "$(find "$STAGING_DIR" -type f \( -name '*.java' -o -name '*.xml' -o -name '*.png' -o -name '*.mcmeta' -o -name '*.json' \) -print -quit)" ]]; then
    echo "No extracted source files were found in $OUT_ROOT" | tee -a "$LOG_FILE"
    exit 2
  fi

  mv "$STAGING_DIR"/* "$SRC_DIR/"
  rmdir "$STAGING_DIR"
fi

echo "==> Decompiled sources extracted to: $SRC_DIR" | tee -a "$LOG_FILE"
