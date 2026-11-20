#!/usr/bin/env bash
# LAYOUT 1 — 50/50 split (used for the first video).
# 1080x1920 vertical short: Rae on the top half, gameplay on the bottom half.
#
# Usage:
#   streamer/split-screen.sh <rae_video> <gameplay_video> <output.mp4> [gameplay_start_seconds] [rae_focus]
#
#   rae_focus: where to crop the 9:16 Rae clip to fit the 1080x960 top half.
#              0.0 = keep the top of the frame, 0.5 = centre (default 0.4, keeps face + controller)
#
# Audio: Rae's voice + gameplay sound mixed, gameplay dipped while she talks
# (see lib-audio.sh for RAE_VOL / GAME_VOL / DUCK). Length = the shorter input.
set -euo pipefail
source "$(dirname "$0")/lib-audio.sh"

RAE="${1:?rae video required}"
GAME="${2:?gameplay video required}"
OUT="${3:?output path required}"
START="${4:-0}"
FOCUS="${5:-0.4}"

W=1080
HALF=960
DIVIDER=6   # thin accent line between the halves
COLOR="0xA855F7"

build_audio "$RAE" "$GAME"

VIDEO_FILTER="
  [0:v]scale=${W}:-2,crop=${W}:${HALF}:0:'(ih-${HALF})*${FOCUS}',setsar=1,fps=30[top];
  [1:v]scale=-2:${HALF},crop=${W}:${HALF},setsar=1,fps=30[bottom];
  [top][bottom]vstack=inputs=2:shortest=1[stacked];
  [stacked]drawbox=x=0:y=${HALF}-${DIVIDER}/2:w=${W}:h=${DIVIDER}:color=${COLOR}:t=fill[v]"

ffmpeg -y -loglevel error \
  -i "$RAE" \
  -ss "$START" -i "$GAME" \
  -filter_complex "${VIDEO_FILTER}${AUDIO_FILTER:+;$AUDIO_FILTER}" \
  -map "[v]" "${AUDIO_MAP[@]}" \
  -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p \
  -c:a aac -b:a 192k \
  -shortest -movflags +faststart \
  "$OUT"

echo "Wrote $OUT"
