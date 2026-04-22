#!/usr/bin/env bash
# Convert all images in public/projects and public/media to WebP, max 1440 wide.
# Reports before/after sizes per file.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REPORT="$ROOT/scripts/image-optimization-report.tsv"
echo -e "file\tbefore_bytes\tbefore_w\tbefore_h\tafter_bytes\tafter_w\tafter_h\tsaved_pct" > "$REPORT"

process_dir() {
  local dir="$1"
  while IFS= read -r -d '' f; do
    local ext="${f##*.}"
    local lower
    lower=$(echo "$ext" | tr '[:upper:]' '[:lower:]')
    case "$lower" in
      jpg|jpeg|png|webp) ;;
      *) continue ;;
    esac

    local before_bytes before_dim before_w before_h
    before_bytes=$(stat -f "%z" "$f")
    before_dim=$(magick identify -format "%wx%h" "$f" 2>/dev/null || echo "0x0")
    before_w=${before_dim%x*}
    before_h=${before_dim#*x}

    local out="${f%.*}.webp"
    # Resize: only shrink if wider than 1440
    magick "$f" -auto-orient -resize "1440>" -quality 82 "$out.tmp" 2>/dev/null
    # Replace
    if [ "$out" != "$f" ]; then
      rm -f "$f"
    fi
    mv "$out.tmp" "$out"

    local after_bytes after_dim after_w after_h
    after_bytes=$(stat -f "%z" "$out")
    after_dim=$(magick identify -format "%wx%h" "$out" 2>/dev/null || echo "0x0")
    after_w=${after_dim%x*}
    after_h=${after_dim#*x}

    local saved_pct
    saved_pct=$(awk -v b="$before_bytes" -v a="$after_bytes" 'BEGIN{printf "%.1f", (b-a)*100.0/b}')

    local rel="${f#$ROOT/}"
    echo -e "${rel}\t${before_bytes}\t${before_w}\t${before_h}\t${after_bytes}\t${after_w}\t${after_h}\t${saved_pct}" >> "$REPORT"
    printf "%-70s %8s -> %8s  (-%s%%)\n" "$rel" "$before_bytes" "$after_bytes" "$saved_pct"
  done < <(find "$dir" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.webp" \) -print0)
}

process_dir "$ROOT/public/projects"

echo
echo "Report: $REPORT"
