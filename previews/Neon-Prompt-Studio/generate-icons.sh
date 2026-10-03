#!/bin/bash

# ============================================================
#  Generate All PWA Icons from a Source Image
#  Usage: ./generate-icons.sh [source-image]
#  If no source is provided, default is "icon.png"
# ============================================================

SOURCE="${1:-icon.png}"

if [ ! -f "$SOURCE" ]; then
    echo "❌ Error: Source image '$SOURCE' not found."
    exit 1
fi

# List of required sizes
SIZES=(48 72 96 128 144 152 192 256 384 512)

echo "🚀 Generating icons from $SOURCE ..."

# Loop through each size and generate normal icons
for size in "${SIZES[@]}"; do
    OUTPUT="icon-${size}.png"
    echo "  ➜ $OUTPUT (${size}x${size})"
    convert "$SOURCE" -resize "${size}x${size}" -quality 100 "$OUTPUT"
done

# Generate maskable icon (512x512 with 20% padding)
MASKABLE="icon-512-maskable.png"
echo "  ➜ $MASKABLE (512x512, maskable with 20% padding)"
# Resize source to 410x410 (80% of 512) and place it centered on a 512x512 transparent canvas
convert "$SOURCE" -resize 410x410 -background none -gravity center -extent 512x512 -quality 100 "$MASKABLE"

# Optional: create a simple favicon (32x32)
echo "  ➜ favicon.ico (32x32)"
convert "$SOURCE" -resize 32x32 -quality 100 "favicon.ico"

echo "✅ Done! All icons have been generated in the current folder."