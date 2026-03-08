#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -ne 1 ]; then
  echo "Usage: $0 <path-to-app.aab-or-apk>"
  exit 1
fi

ARTIFACT_PATH="$1"
if [ ! -f "$ARTIFACT_PATH" ]; then
  echo "File not found: $ARTIFACT_PATH"
  exit 1
fi

READELF_BIN=""
if command -v llvm-readelf >/dev/null 2>&1; then
  READELF_BIN="llvm-readelf"
elif command -v readelf >/dev/null 2>&1; then
  READELF_BIN="readelf"
elif command -v xcrun >/dev/null 2>&1 && xcrun --find llvm-readelf >/dev/null 2>&1; then
  READELF_BIN="xcrun llvm-readelf"
else
  echo "No readelf tool found (llvm-readelf/readelf)."
  echo "Install Android NDK or LLVM tools, then rerun."
  exit 2
fi

TMP_DIR="$(mktemp -d)"
cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

unzip -q "$ARTIFACT_PATH" -d "$TMP_DIR/archive"

mapfile -t SO_FILES < <(find "$TMP_DIR/archive" -type f -name "*.so" | sort)
if [ "${#SO_FILES[@]}" -eq 0 ]; then
  echo "No native .so libraries found in artifact."
  exit 3
fi

MIN_REQUIRED=16384
HAS_FAILURE=0

echo "Checking ${#SO_FILES[@]} native libraries with: $READELF_BIN"
echo

for so_file in "${SO_FILES[@]}"; do
  worst_align=999999999
  worst_hex=""

  while IFS= read -r align_hex; do
    align_hex="${align_hex#0x}"
    if [ -z "$align_hex" ]; then
      continue
    fi
    align_dec=$((16#$align_hex))
    if [ "$align_dec" -lt "$worst_align" ]; then
      worst_align="$align_dec"
      worst_hex="0x$align_hex"
    fi
  done < <(eval "$READELF_BIN -l \"$so_file\"" | awk '/LOAD/ {print $NF}')

  rel_path="${so_file#"$TMP_DIR/archive/"}"
  if [ "$worst_align" -lt "$MIN_REQUIRED" ]; then
    HAS_FAILURE=1
    echo "FAIL  $rel_path  (lowest LOAD alignment: $worst_hex)"
  else
    echo "OK    $rel_path  (lowest LOAD alignment: $worst_hex)"
  fi
done

echo
if [ "$HAS_FAILURE" -eq 1 ]; then
  echo "Result: NOT compliant with 16 KB page size requirement."
  exit 4
fi

echo "Result: compliant with 16 KB page size requirement."
