#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
VERSION="${1:-1.12.2}"
SRC_DIR="$REPO_ROOT/build/minecraft-browser/$VERSION/decompiled/src"
FALLBACK_DIR="$REPO_ROOT/build/minecraft-browser/$VERSION/decompiled"
STAGING_DIR="$REPO_ROOT/build/minecraft-browser/$VERSION/decompiled/.src-staging"

if [[ ! -d "$SRC_DIR" ]] || [[ -z "$(find "$SRC_DIR" -type f -name '*.java' -print -quit 2>/dev/null)" ]]; then
   if [[ -d "$STAGING_DIR" ]] && [[ -n "$(find "$STAGING_DIR" -type f -name '*.java' -print -quit)" ]]; then
      SRC_DIR="$STAGING_DIR"
   elif [[ -d "$FALLBACK_DIR" ]] && [[ -n "$(find "$FALLBACK_DIR" -maxdepth 1 -type f -name '*.java' -print -quit)" ]]; then
      SRC_DIR="$FALLBACK_DIR"
   else
      echo "Decompiled source directory not found: $SRC_DIR"
      echo "Run decompile-minecraft.sh first."
      exit 1
   fi
fi

cat <<EOF
Next practical path for browser-porting Minecraft $VERSION:

1. Decompiled sources are now in:
   $SRC_DIR

2. Build a working overlay source tree with:
   bash scripts/minecraft-browser/prepare-source-overlay.sh $VERSION

3. Validate the first browser-port compile slice with:
   bash scripts/minecraft-browser/compile-overlay-slice.sh $VERSION

4. Validate targeted decompiled classes (starting point: bib + cii) with:
   bash scripts/minecraft-browser/compile-overlay-targets.sh $VERSION bib cii

5. From here, the required work is source-level patching:
   - replace LWJGL / OpenGL calls
   - replace native input/audio/runtime hooks
   - add TeaVM-compatible shims
   - choose a browser entrypoint smaller than net.minecraft.client.main.Main

6. This is the Eaglercraft-style workflow. Direct jar -> TeaVM is not the right path.
EOF
