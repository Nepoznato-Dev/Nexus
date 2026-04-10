#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
VERSION="${1:-1.12.2}"
JAVA_CMD="${JAVA_CMD:-java}"

if [[ -z "${JAVA_CMD_OVERRIDE:-}" ]] && [[ -x "/usr/lib/jvm/msopenjdk-17-amd64/bin/java" ]]; then
  JAVA_CMD="/usr/lib/jvm/msopenjdk-17-amd64/bin/java"
fi

cd "$REPO_ROOT"

node scripts/minecraft-browser/prepare-classpath.js "$VERSION"

CP_LINES_FILE="$REPO_ROOT/build/minecraft-browser/$VERSION/classpath.lines.txt"
RUNNER_POM="$REPO_ROOT/scripts/minecraft-browser/teavm-runner/pom.xml"
TEAVM_CP_FILE="$REPO_ROOT/build/minecraft-browser/$VERSION/teavm-cli.classpath.txt"
OUT_ROOT="$REPO_ROOT/build/minecraft-browser/$VERSION/isolation"
LOG_FILE="$OUT_ROOT/isolation.log"

mkdir -p "$OUT_ROOT"
: > "$LOG_FILE"

mvn -q -f "$RUNNER_POM" dependency:build-classpath -Dmdep.outputFile="$TEAVM_CP_FILE" -Dmdep.includeScope=runtime
TEAVM_CP="$(cat "$TEAVM_CP_FILE")"

mapfile -t entries < "$CP_LINES_FILE"
if [[ ${#entries[@]} -eq 0 ]]; then
  echo "No classpath entries found" | tee -a "$LOG_FILE"
  exit 1
fi

MAIN_CLASS="net.minecraft.client.main.Main"
BASE_JAR="${entries[0]}"

echo "Isolation run for $VERSION" | tee -a "$LOG_FILE"
echo "Java runtime: $JAVA_CMD" | tee -a "$LOG_FILE"
JAVA_VERSION_LINE="$($JAVA_CMD -version 2>&1 | head -n 1)"
echo "$JAVA_VERSION_LINE" | tee -a "$LOG_FILE"

JAVA_MAJOR=$("$JAVA_CMD" -XshowSettings:properties -version 2>&1 | awk -F'= ' '/^ *java.class.version =/{print $2}' | awk -F'.' '{print int($1 - 44)}' | head -n 1)
if [[ -n "$JAVA_MAJOR" ]] && [[ "$JAVA_MAJOR" -ge 25 ]]; then
  echo "Java $JAVA_MAJOR detected. TeaVM ASM can't parse this runtime's class format." | tee -a "$LOG_FILE"
  echo "Set JAVA_CMD to Java 17 and rerun." | tee -a "$LOG_FILE"
  exit 4
fi
echo "Base jar: $BASE_JAR" | tee -a "$LOG_FILE"

test_compile() {
  local cp="$1"
  local out_dir="$2"

  mkdir -p "$out_dir"

  set +e
  "$JAVA_CMD" -Xmx4G -cp "$TEAVM_CP:$cp" org.teavm.cli.TeaVMRunner \
    -t js \
    -d "$out_dir" \
    -f classes.js \
    "$MAIN_CLASS" > "$out_dir/run.log" 2>&1
  local status=$?
  set -e

  return $status
}

echo "\n[1] Testing base jar only..." | tee -a "$LOG_FILE"
if ! test_compile "$BASE_JAR" "$OUT_ROOT/base-only"; then
  echo "Result: FAIL with base jar only." | tee -a "$LOG_FILE"
  echo "Conclusion: vanilla jar path itself crashes TeaVM; requires decompiled+patched source pipeline (Eaglercraft-style)." | tee -a "$LOG_FILE"
  tail -n 40 "$OUT_ROOT/base-only/run.log" | tee -a "$LOG_FILE"
  exit 2
fi

echo "Result: PASS with base jar only." | tee -a "$LOG_FILE"
echo "\n[2] Adding dependency jars one-by-one..." | tee -a "$LOG_FILE"

current_cp="$BASE_JAR"
for ((i=1; i<${#entries[@]}; i++)); do
  jar="${entries[$i]}"
  candidate_cp="$current_cp:$jar"
  out_dir="$OUT_ROOT/step-$i"

  printf "Testing [%d/%d]: %s ... " "$i" "$(( ${#entries[@]} - 1 ))" "$jar" | tee -a "$LOG_FILE"
  if test_compile "$candidate_cp" "$out_dir"; then
    echo "PASS" | tee -a "$LOG_FILE"
    current_cp="$candidate_cp"
  else
    echo "FAIL" | tee -a "$LOG_FILE"
    echo "First failing jar: $jar" | tee -a "$LOG_FILE"
    tail -n 40 "$out_dir/run.log" | tee -a "$LOG_FILE"
    exit 3
  fi
done

echo "\nNo single dependency introduced the crash in one-by-one mode." | tee -a "$LOG_FILE"
echo "If full classpath still fails, this is an interaction issue across multiple jars." | tee -a "$LOG_FILE"
