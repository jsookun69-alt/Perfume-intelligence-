#!/usr/bin/env bash
# Build a 1080x1920 vertical short: AI model on top, gameplay on the bottom.
#
# Usage:
#   streamer/split-screen.sh <model_video> <gameplay_video> <output.mp4> [gameplay_start_seconds] [model_focus]
#
#   model_focus: where to crop the 9:16 model clip to fit the 1080x960 top half.
#                0.0 = keep the top of the frame, 0.5 = centre (default 0.4, keeps face + controller for a seated shot)
#
# Audio comes from the gameplay clip. Output length = the shorter of the two inputs.
set -euo pipefail

MODEL="${1:?model video required}"
GAME="${2:?gameplay video required}"
OUT="${3:?output path required}"
START="${4:-0}"
FOCUS="${5:-0.4}"

W=1080
HALF=960
DIVIDER=6   # thin accent line between the halves
COLOR="0xA855F7"

ffmpeg -y \
  -i "$MODEL" \
  -ss "$START" -i "$GAME" \
  -filter_complex "
    [0:v]scale=${W}:-2,crop=${W}:${HALF}:0:'(ih-${HALF})*${FOCUS}',setsar=1,fps=30[top];
    [1:v]scale=-2:${HALF},crop=${W}:${HALF},setsar=1,fps=30[bottom];
    [top][bottom]vstack=inputs=2:shortest=1[stacked];
    [stacked]drawbox=x=0:y=${HALF}-${DIVIDER}/2:w=${W}:h=${DIVIDER}:color=${COLOR}:t=fill[v]
  " \
  -map "[v]" -map "1:a?" \
  -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p \
  -c:a aac -b:a 192k \
  -shortest -movflags +faststart \
  "$OUT"

echo "Wrote $OUT"
