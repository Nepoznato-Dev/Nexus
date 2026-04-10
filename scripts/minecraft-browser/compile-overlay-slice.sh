#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
VERSION="${1:-1.12.2}"
DECOMPILED_ROOT="$REPO_ROOT/build/minecraft-browser/$VERSION/decompiled"
OVERLAY_SRC="$REPO_ROOT/build/minecraft-browser/$VERSION/browser-overlay/src"
OUT_DIR="$REPO_ROOT/build/minecraft-browser/$VERSION/browser-overlay/classes-slice"
FIND_JAVA17_SCRIPT="$REPO_ROOT/scripts/minecraft-browser/find-java17.sh"
JAVAC_CMD="${JAVAC_CMD:-javac}"

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

if [[ ! -d "$DECOMPILED_ROOT" ]]; then
   echo "Decompiled sources not found for $VERSION, running decompile step..."
   bash "$REPO_ROOT/scripts/minecraft-browser/decompile-minecraft.sh" "$VERSION"
fi

bash "$REPO_ROOT/scripts/minecraft-browser/prepare-source-overlay.sh" "$VERSION" >/dev/null

if [[ ! -d "$OVERLAY_SRC" ]]; then
   echo "Overlay source tree not found: $OVERLAY_SRC"
   exit 1
fi

mapfile -t SOURCES < <(find \
   "$OVERLAY_SRC/dev/nexus/minecraft/browser" \
   "$OVERLAY_SRC/net/minecraft/client/main" \
   "$OVERLAY_SRC/org/lwjgl" \
   "$OVERLAY_SRC/javax" \
   -type f -name '*.java' | sort)

if [[ ${#SOURCES[@]} -eq 0 ]]; then
   echo "No Java sources found for compile slice."
   exit 1
fi

rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"

JAVAC_CMD="$(resolve_javac || true)"
if [[ -z "$JAVAC_CMD" ]]; then
   echo "No javac binary found. Install a JDK (11+ recommended) and retry."
   exit 1
fi

JAVAC_VERSION_LINE="$($JAVAC_CMD -version 2>&1 | head -n 1 || true)"
JAVAC_MAJOR="$(echo "$JAVAC_VERSION_LINE" | sed -nE 's/^javac ([0-9]+).*/\1/p')"
if [[ -z "$JAVAC_MAJOR" ]]; then
   echo "Unable to detect javac version from: $JAVAC_VERSION_LINE"
   exit 1
fi

COMPILE_RELEASE="17"
if (( JAVAC_MAJOR < 17 )); then
   COMPILE_RELEASE="$JAVAC_MAJOR"
   if (( COMPILE_RELEASE < 11 )); then
      COMPILE_RELEASE="8"
   fi
   echo "Java 17 compiler not available ($JAVAC_VERSION_LINE)."
   echo "Falling back to --release $COMPILE_RELEASE for compile-slice validation."
fi

"$JAVAC_CMD" --release "$COMPILE_RELEASE" -d "$OUT_DIR" "${SOURCES[@]}"

echo "Compile slice succeeded for Minecraft $VERSION"
echo "Classes output: $OUT_DIR"
echo "Source files compiled: ${#SOURCES[@]}"