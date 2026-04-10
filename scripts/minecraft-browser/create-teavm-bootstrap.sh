#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
VERSION="${1:-1.12.2}"
OUT_DIR="$REPO_ROOT/build/minecraft-browser/$VERSION/teavm-out"
CLASSES_JS="$OUT_DIR/classes.js"
BOOT_HTML="$OUT_DIR/launch.html"

if [[ ! -f "$CLASSES_JS" ]]; then
  echo "TeaVM output not found: $CLASSES_JS"
  echo "Run TeaVM first: npm run mc:teavm:$VERSION"
  exit 1
fi

cat > "$BOOT_HTML" <<'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Minecraft Browser Port - TeaVM Launch</title>
  <style>
    html, body {
      margin: 0;
      width: 100%;
      height: 100%;
      background: #111;
      color: #e5e5e5;
      font-family: monospace;
      overflow: hidden;
    }
    #root {
      display: flex;
      width: 100%;
      height: 100%;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      gap: 10px;
    }
    #status {
      max-width: 80ch;
      white-space: pre-wrap;
      line-height: 1.4;
      opacity: 0.9;
    }
  </style>
</head>
<body>
  <div id="root">
    <h2>TeaVM Runtime Bootstrap</h2>
    <div id="status">Loading classes.js ...</div>
  </div>
  <script>
    const status = document.getElementById('status');
    window.addEventListener('error', (e) => {
      status.textContent = 'Runtime error: ' + (e.message || e.error || 'unknown');
    });
    window.addEventListener('unhandledrejection', (e) => {
      status.textContent = 'Unhandled promise rejection: ' + (e.reason || 'unknown');
    });
  </script>
  <script src="./classes.js"></script>
  <script>
    if (typeof main === 'function') {
      status.textContent = 'Found global main(); invoking ...';
      try {
        main();
      } catch (e) {
        status.textContent = 'main() threw: ' + (e && e.message ? e.message : String(e));
      }
    } else {
      status.textContent = [
        'classes.js loaded.',
        'No global main() detected.',
        'Next step: wire generated TeaVM entry module API for this build.'
      ].join('\n');
    }
  </script>
</body>
</html>
EOF

echo "Generated bootstrap: $BOOT_HTML"
