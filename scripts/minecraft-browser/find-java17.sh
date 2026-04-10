#!/usr/bin/env bash
set -euo pipefail

# Print the first usable Java 17 binary path and exit 0.
# Exit 1 if no Java 17 runtime is found.

candidates=()

# Common Linux locations
while IFS= read -r path; do
  candidates+=("$path")
done < <(compgen -G "/usr/lib/jvm/*17*/bin/java" || true)

# SDKMAN installs
if [[ -d "$HOME/.sdkman/candidates/java" ]]; then
  while IFS= read -r path; do
    candidates+=("$path")
  done < <(compgen -G "$HOME/.sdkman/candidates/java/*17*/bin/java" || true)
fi

# java17 on PATH (if provided by distro)
if command -v java17 >/dev/null 2>&1; then
  candidates+=("$(command -v java17)")
fi

for java_bin in "${candidates[@]}"; do
  [[ -x "$java_bin" ]] || continue
  ver_line="$($java_bin -version 2>&1 | head -n 1 || true)"
  if [[ "$ver_line" == *" version \"17."* ]] || [[ "$ver_line" == *" version \"17\""* ]]; then
    echo "$java_bin"
    exit 0
  fi
done

exit 1
