#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
VERSION="${1:-1.12.2}"
SRC_DIR="$REPO_ROOT/build/minecraft-browser/$VERSION/decompiled/src"
FALLBACK_DIR="$REPO_ROOT/build/minecraft-browser/$VERSION/decompiled"
STAGING_DIR="$REPO_ROOT/build/minecraft-browser/$VERSION/decompiled/.src-staging"
OVERLAY_ROOT="$REPO_ROOT/build/minecraft-browser/$VERSION/browser-overlay"
OVERLAY_SRC="$OVERLAY_ROOT/src"
PORT_SRC="$REPO_ROOT/minecraft-browser-port/src/main/java"

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

rm -rf "$OVERLAY_ROOT"
mkdir -p "$OVERLAY_SRC"

cp -R "$SRC_DIR"/. "$OVERLAY_SRC"/

mkdir -p "$OVERLAY_SRC/dev/nexus/minecraft/browser"
mkdir -p "$OVERLAY_SRC/net/minecraft/client/main"
mkdir -p "$OVERLAY_SRC/org/lwjgl"
mkdir -p "$OVERLAY_SRC/javax/annotation"

cp -R "$PORT_SRC/dev/nexus/minecraft/browser"/. "$OVERLAY_SRC/dev/nexus/minecraft/browser/"
cp -R "$PORT_SRC/net/minecraft/client/main"/. "$OVERLAY_SRC/net/minecraft/client/main/"
cp -R "$PORT_SRC/org/lwjgl"/. "$OVERLAY_SRC/org/lwjgl/"
if [[ -d "$PORT_SRC/javax/annotation" ]]; then
   cp -R "$PORT_SRC/javax/annotation"/. "$OVERLAY_SRC/javax/annotation/"
fi

# Some decompilation runs emit U+2603 (UTF-8 bytes E2 98 83) as a placeholder identifier,
# which is not a valid Java identifier. Normalize it to an ASCII-safe token.
while IFS= read -r java_file; do
   perl -i -pe 's/\xE2\x98\x83/__snowman__/g' "$java_file"
   perl -i -pe 's/\bdo\(/do_(/g' "$java_file"
   perl -i -pe 's/\.do\b/.do_/g' "$java_file"
done < <(find "$OVERLAY_SRC" -type f -name '*.java' | sort)

# Some renamed GL shim classes keep placeholder tokens in call arguments.
# Normalize known broken mappings for 1.12.2 `cii` -> `class_1947`.
CLASS_1947_FILE="$OVERLAY_SRC/class_1947.java"
if [[ -f "$CLASS_1947_FILE" ]] && grep -q '^// \$VF: renamed from: cii$' "$CLASS_1947_FILE"; then
   perl -i -pe 's/__snowman__, __snowman__, __snowman__, __snowman__, __snowman__/var0, var1, var2, var3, var4/g' "$CLASS_1947_FILE"
   perl -i -pe 's/__snowman__, __snowman__, __snowman__, __snowman__/var0, var1, var2, var3/g' "$CLASS_1947_FILE"
   perl -i -pe 's/__snowman__, __snowman__, __snowman__/var0, var1, var2/g' "$CLASS_1947_FILE"
   perl -i -pe 's/__snowman__, __snowman__/var0, var1/g' "$CLASS_1947_FILE"
   perl -i -pe 's/__snowman__/var0/g' "$CLASS_1947_FILE"
   perl -i -pe 's/class_3199\.field_11221\.method_10482\(16\.0F\);/field_5847 = true;/g' "$CLASS_1947_FILE"
   perl -i -pe 's/return field_5809 && class_3239\.method_10619\(\)\.field_11602\.field_8356;/return field_5809;/g' "$CLASS_1947_FILE"
   perl -i -pe 's/if \(class_1930\.method_5615\(\) == class_3196\.field_11179\) \{/String s2 = System.getProperty("os.name", "").toLowerCase(Locale.ROOT);\n      if (s2.contains("mac")) {/g' "$CLASS_1947_FILE"
   perl -i -pe 's/\} else if \(class_1930\.method_5615\(\) == class_3196\.field_11178\) \{/} else if (s2.contains("win")) {/g' "$CLASS_1947_FILE"
   perl -i -0pe 's/public static boolean method_5694\(\) \{\s*return field_5846 && class_3239\.method_10619\(\)\.field_11602\.field_8371;\s*\}/public static boolean method_5694() {\n      return field_5846;\n   }/g' "$CLASS_1947_FILE"
   perl -i -0pe 's/public static void method_5711\(int var0\) \{\s*class_2227\.method_6733\(\);\s*class_2227\.method_6695\(false\);\s*bve bve = class_2375\.method_7128\(\);\s*buk buk = bve\.method_7130\(\);\s*GL11\.glLineWidth\(4\.0F\);\s*buk\.method_6650\(1, class_2095\.field_6212\);\s*buk\.method_6665\(0\.0, 0\.0, 0\.0\)\.method_6662\(0, 0, 0, 255\)\.method_6664\(\);\s*buk\.method_6665\(\(double\)var0, 0\.0, 0\.0\)\.method_6662\(0, 0, 0, 255\)\.method_6664\(\);\s*buk\.method_6665\(0\.0, 0\.0, 0\.0\)\.method_6662\(0, 0, 0, 255\)\.method_6664\(\);\s*buk\.method_6665\(0\.0, \(double\)var0, 0\.0\)\.method_6662\(0, 0, 0, 255\)\.method_6664\(\);\s*buk\.method_6665\(0\.0, 0\.0, 0\.0\)\.method_6662\(0, 0, 0, 255\)\.method_6664\(\);\s*buk\.method_6665\(0\.0, 0\.0, \(double\)var0\)\.method_6662\(0, 0, 0, 255\)\.method_6664\(\);\s*bve\.method_7129\(\);\s*GL11\.glLineWidth\(2\.0F\);\s*buk\.method_6650\(1, class_2095\.field_6212\);\s*buk\.method_6665\(0\.0, 0\.0, 0\.0\)\.method_6662\(255, 0, 0, 255\)\.method_6664\(\);\s*buk\.method_6665\(\(double\)var0, 0\.0, 0\.0\)\.method_6662\(255, 0, 0, 255\)\.method_6664\(\);\s*buk\.method_6665\(0\.0, 0\.0, 0\.0\)\.method_6662\(0, 255, 0, 255\)\.method_6664\(\);\s*buk\.method_6665\(0\.0, \(double\)var0, 0\.0\)\.method_6662\(0, 255, 0, 255\)\.method_6664\(\);\s*buk\.method_6665\(0\.0, 0\.0, 0\.0\)\.method_6662\(127, 127, 255, 255\)\.method_6664\(\);\s*buk\.method_6665\(0\.0, 0\.0, \(double\)var0\)\.method_6662\(127, 127, 255, 255\)\.method_6664\(\);\s*bve\.method_7129\(\);\s*GL11\.glLineWidth\(1\.0F\);\s*class_2227\.method_6695\(true\);\s*class_2227\.method_6732\(\);\s*\}/public static void method_5711(int var0) {\n      GL11.glLineWidth(1.0F);\n   }/g' "$CLASS_1947_FILE"
   if ! grep -q 'enum class_3198' "$CLASS_1947_FILE"; then
      perl -i -0pe 's/\n}\s*\z/\n\n   private static enum class_3198 {\n      field_11212,\n      field_11213,\n      field_11214;\n   }\n}\n/s' "$CLASS_1947_FILE"
   fi
fi

cat <<EOF
Prepared browser overlay for Minecraft $VERSION

Base source:
  $SRC_DIR

Overlay source:
  $OVERLAY_SRC

Overlay packages copied:
  dev/nexus/minecraft/browser
  net/minecraft/client/main
  org/lwjgl
   javax/annotation
EOF