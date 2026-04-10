#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
VERSION="${1:-1.12.2}"

cd "$REPO_ROOT"

echo "==> Preparing classpath for Minecraft $VERSION"
node scripts/minecraft-browser/prepare-classpath.js "$VERSION"

CP_FILE="$REPO_ROOT/build/minecraft-browser/$VERSION/classpath.txt"
CFG_FILE="$REPO_ROOT/build/minecraft-browser/$VERSION/compile-config.json"
MISSING_FILE="$REPO_ROOT/build/minecraft-browser/$VERSION/missing-libraries.json"
OUT_DIR="$REPO_ROOT/build/minecraft-browser/$VERSION/teavm-out"
RUNNER_POM="$REPO_ROOT/scripts/minecraft-browser/teavm-runner/pom.xml"
MAIN_CLASS="net.minecraft.client.main.Main"
RUN_LOG="$REPO_ROOT/build/minecraft-browser/$VERSION/teavm-run.log"
RUN_META="$REPO_ROOT/build/minecraft-browser/$VERSION/teavm-run.meta"
RUN_EXIT_CODE_FILE="$REPO_ROOT/build/minecraft-browser/$VERSION/teavm-run.exitcode"
TEAVM_CP_FILE="$REPO_ROOT/build/minecraft-browser/$VERSION/teavm-cli.classpath.txt"
FIND_JAVA17_SCRIPT="$REPO_ROOT/scripts/minecraft-browser/find-java17.sh"
USER_JAVA_CMD="${JAVA_CMD:-}"

if [[ -n "$USER_JAVA_CMD" ]]; then
  JAVA_CMD="$USER_JAVA_CMD"
elif [[ -x "$FIND_JAVA17_SCRIPT" ]] && JAVA17_CANDIDATE="$($FIND_JAVA17_SCRIPT 2>/dev/null)"; then
  JAVA_CMD="$JAVA17_CANDIDATE"
else
  JAVA_CMD="java"
fi

mkdir -p "$OUT_DIR"

MISSING_COUNT=$(node -e "const fs=require('fs');const p=process.argv[1];const a=JSON.parse(fs.readFileSync(p,'utf8'));process.stdout.write(String(Array.isArray(a)?a.length:0));" "$MISSING_FILE")

if [[ "$MISSING_COUNT" != "0" ]]; then
  echo ""
  echo "Found $MISSING_COUNT missing libraries."
  echo "Run this first: npm run mc:fetch-libs:1122"
  echo "Then rerun: npm run mc:teavm:1122"
  exit 2
fi

MINECRAFT_CP="$(cat "$CP_FILE")"

# Attempt a direct TeaVM compile.
# NOTE: Vanilla Minecraft will usually require additional LWJGL/WebGL patches to complete.
echo "==> Running first TeaVM attempt"
echo "==> Resolving TeaVM CLI runtime classpath"
if [[ ! -s "$TEAVM_CP_FILE" ]]; then
  echo "==> No cached TeaVM classpath found, resolving with Maven..."
  mvn -f "$RUNNER_POM" dependency:build-classpath -Dmdep.outputFile="$TEAVM_CP_FILE" -Dmdep.includeScope=runtime
else
  echo "==> Using cached TeaVM classpath: $TEAVM_CP_FILE"
fi

TEAVM_CP="$(cat "$TEAVM_CP_FILE")"

echo "==> Writing full output log to: $RUN_LOG"
echo "==> Java runtime: $JAVA_CMD"
rm -f "$RUN_LOG"
rm -f "$RUN_META" "$RUN_EXIT_CODE_FILE"
JAVA_VERSION_LINE="$($JAVA_CMD -version 2>&1 | head -n 1)"
echo "$JAVA_VERSION_LINE"
{
  echo "start_time=$(date -Iseconds)"
  echo "java_cmd=$JAVA_CMD"
  echo "java_version=$JAVA_VERSION_LINE"
  echo "main_class=$MAIN_CLASS"
  echo "output_dir=$OUT_DIR"
} > "$RUN_META"

JAVA_MAJOR=$("$JAVA_CMD" -XshowSettings:properties -version 2>&1 | awk -F'= ' '/^ *java.class.version =/{print $2}' | awk -F'.' '{print int($1 - 44)}' | head -n 1)
if [[ -n "$JAVA_MAJOR" ]] && [[ "$JAVA_MAJOR" -ge 25 ]]; then
  if [[ -x "$FIND_JAVA17_SCRIPT" ]] && JAVA17_CANDIDATE="$($FIND_JAVA17_SCRIPT 2>/dev/null)"; then
    echo "Switching to Java 17 runtime: $JAVA17_CANDIDATE"
    JAVA_CMD="$JAVA17_CANDIDATE"
    JAVA_VERSION_LINE="$($JAVA_CMD -version 2>&1 | head -n 1)"
    echo "$JAVA_VERSION_LINE"
  else
  echo ""
  echo "Detected Java $JAVA_MAJOR runtime, which triggers TeaVM ASM incompatibility (class major 69)."
  echo "No Java 17 runtime was auto-detected."
  echo "Install one, then rerun."
  exit 4
  fi
fi

echo "==> Starting TeaVM analysis. This can take a long time on Minecraft; wait for a real error or success message."
set +e
"$JAVA_CMD" -Xmx6G -cp "$TEAVM_CP:$MINECRAFT_CP" org.teavm.cli.TeaVMRunner \
  -t js \
  -d "$OUT_DIR" \
  -f classes.js \
  -g \
  -G \
  "$MAIN_CLASS" 2>&1 | tee "$RUN_LOG"
STATUS=${PIPESTATUS[0]}
set -e

{
  echo "end_time=$(date -Iseconds)"
  echo "exit_code=$STATUS"
} >> "$RUN_META"
echo "$STATUS" > "$RUN_EXIT_CODE_FILE"

if [[ $STATUS -eq 130 ]]; then
  echo
  echo "TeaVM compile was interrupted by the user (Ctrl+C)."
  echo "No compiler failure has been established yet."
  echo "Log: $RUN_LOG"
  exit 130
fi

if [[ $STATUS -ne 0 ]]; then
  echo
  echo "TeaVM compile attempt failed."
  echo "Next step: patch LWJGL/OpenGL and runtime hooks like Eaglercraft does."
  echo "Config: $CFG_FILE"
  echo "Log: $RUN_LOG"
  exit $STATUS
fi

echo "==> TeaVM output written to: $OUT_DIR"
