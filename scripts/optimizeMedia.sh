#!/usr/bin/env bash
# In-place resize+recompress for /public/media (keeps extension to preserve DB references).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DIR="$ROOT/public/media"
REPORT="$ROOT/scripts/media-optimization-report.tsv"
echo -e "file\tbefore_bytes\tbefore_w\tbefore_h\tafter_bytes\tafter_w\tafter_h\tsaved_pct" > "$REPORT"

TOTAL=0
DONE=0

while IFS= read -r -d '' f; do
  TOTAL=$((TOTAL+1))
done < <(find "$DIR" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.webp" \) -print0)

echo "Found $TOTAL images in /public/media"

while IFS= read -r -d '' f; do
  ext="${f##*.}"
  lower=$(echo "$ext" | tr '[:upper:]' '[:lower:]')

  before_bytes=$(stat -f "%z" "$f")
  before_dim=$(magick identify -format "%wx%h" "$f" 2>/dev/null || echo "0x0")
  before_w=${before_dim%x*}
  before_h=${before_dim#*x}

  # Quality settings per format
  case "$lower" in
    jpg|jpeg) Q="-quality 80 -strip -interlace Plane" ;;
    png) Q="-strip" ;;
    webp) Q="-quality 80 -strip" ;;
    *) continue ;;
  esac

  tmp="${f}.opt.tmp"
  # Resize to max 1440 wide; only shrink (>)
  if ! magick "$f" -auto-orient -resize "1440>" $Q "$tmp" 2>/dev/null; then
    rm -f "$tmp"
    continue
  fi

  after_bytes=$(stat -f "%z" "$tmp" 2>/dev/null || echo "$before_bytes")

  # Only replace if smaller
  if [ "$after_bytes" -lt "$before_bytes" ]; then
    mv "$tmp" "$f"
  else
    rm -f "$tmp"
    after_bytes=$before_bytes
  fi

  after_dim=$(magick identify -format "%wx%h" "$f" 2>/dev/null || echo "0x0")
  after_w=${after_dim%x*}
  after_h=${after_dim#*x}

  saved_pct=$(awk -v b="$before_bytes" -v a="$after_bytes" 'BEGIN{ if(b==0){print 0}else{printf "%.1f", (b-a)*100.0/b} }')
  rel="${f#$ROOT/}"
  echo -e "${rel}\t${before_bytes}\t${before_w}\t${before_h}\t${after_bytes}\t${after_w}\t${after_h}\t${saved_pct}" >> "$REPORT"
  DONE=$((DONE+1))
  if [ $((DONE % 20)) -eq 0 ]; then
    echo "  $DONE / $TOTAL processed..."
  fi
done < <(find "$DIR" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.webp" \) -print0)

echo "Done: $DONE / $TOTAL"
awk -F'\t' 'NR>1{b+=$2;a+=$5} END{printf "Total: %.2f MB -> %.2f MB (saved %.1f%%)\n", b/1024/1024, a/1024/1024, (b-a)*100/b}' "$REPORT"
echo "Report: $REPORT"
