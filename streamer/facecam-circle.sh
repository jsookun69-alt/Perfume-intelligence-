#!/usr/bin/env bash
# LAYOUT 2 — round facecam (used for every video after the first).
# 1080x1920 vertical short: gameplay fills the screen, Rae in a small circle in a corner.
#
# Usage:
#   streamer/facecam-circle.sh <rae_video> <gameplay_video> <output.mp4> [gameplay_start_seconds]
#
# Options (environment variables):
#   CORNER     top-left | top-right | bottom-left | bottom-right   (default top-right)
#   SIZE       circle diameter in px                               (default 380)
#   MARGIN     gap from the screen edges in px                     (default 48)
#   FACE_X     horizontal centre of Rae's face in her clip, 0..1   (default 0.47)
#   FACE_Y     vertical centre of Rae's face in her clip, 0..1     (default 0.32)
#   ZOOM       share of her clip's width shown in the circle, 0..1 (default 0.62; smaller = tighter on the face)
#   RING       ring thickness in px, 0 for none                    (default 8)
#   RING_COLOR ring colour                                         (default 0xA855F7 purple)
#   GAME_FIT   fill | fit   fill crops the gameplay to fill the screen;
#              fit shows the whole 16:9 frame over a blurred copy  (default fill)
#
# Audio: same mixing as split-screen.sh (see lib-audio.sh). Length = the shorter input.
set -euo pipefail
source "$(dirname "$0")/lib-audio.sh"

RAE="${1:?rae video required}"
GAME="${2:?gameplay video required}"
OUT="${3:?output path required}"
START="${4:-0}"

CORNER="${CORNER:-top-right}"
SIZE="${SIZE:-380}"
MARGIN="${MARGIN:-48}"
FACE_X="${FACE_X:-0.47}"
FACE_Y="${FACE_Y:-0.32}"
ZOOM="${ZOOM:-0.62}"
RING="${RING:-8}"
RING_COLOR="${RING_COLOR:-0xA855F7}"
GAME_FIT="${GAME_FIT:-fill}"

W=1080; H=1920
OUTER=$((SIZE + 2 * RING))

case "$CORNER" in
  top-left)     X=$MARGIN;            Y=$((MARGIN + 120)) ;;   # +120 clears the platform's top UI
  top-right)    X=$((W-OUTER-MARGIN)); Y=$((MARGIN + 120)) ;;
  bottom-left)  X=$MARGIN;            Y=$((H-OUTER-MARGIN-360)) ;;  # -360 clears captions/buttons
  bottom-right) X=$((W-OUTER-MARGIN)); Y=$((H-OUTER-MARGIN-360)) ;;
  *) echo "Unknown CORNER: $CORNER" >&2; exit 1 ;;
esac

if [ "$GAME_FIT" = "fit" ]; then
  GAME_FILTER="[1:v]split=2[gb][gf];
    [gb]scale=-2:${H},crop=${W}:${H},boxblur=30:2,eq=brightness=-0.12[bg];
    [gf]scale=${W}:-2[fg];
    [bg][fg]overlay=0:(H-h)/2,setsar=1,fps=30[game]"
else
  GAME_FILTER="[1:v]scale=-2:${H},crop=${W}:${H},setsar=1,fps=30[game]"
fi

# Square crop around Rae's face -> circle with transparent corners -> on a ring disc.
CIRCLE_A="if(lte(hypot(X-W/2\,Y-H/2)\,W/2-1)\,255\,0)"
VIDEO_FILTER="
  ${GAME_FILTER};
  [0:v]crop='iw*${ZOOM}':'iw*${ZOOM}':'max(0\,min(iw-iw*${ZOOM}\,iw*${FACE_X}-iw*${ZOOM}/2))':'max(0\,min(ih-iw*${ZOOM}\,ih*${FACE_Y}-iw*${ZOOM}/2))',
       scale=${SIZE}:${SIZE},fps=30,format=yuva420p,
       geq=lum='lum(X,Y)':cb='cb(X,Y)':cr='cr(X,Y)':a='${CIRCLE_A}'[face];
  color=c=${RING_COLOR}:s=${OUTER}x${OUTER}:r=30,format=yuva420p,
       geq=lum='lum(X,Y)':cb='cb(X,Y)':cr='cr(X,Y)':a='${CIRCLE_A}'[ring];
  [ring][face]overlay=${RING}:${RING}:shortest=1[cam];
  [game][cam]overlay=${X}:${Y}:shortest=1[v]"

build_audio "$RAE" "$GAME"

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
