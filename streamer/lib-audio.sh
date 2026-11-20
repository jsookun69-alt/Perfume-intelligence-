# Shared audio helpers for the compositor scripts (sourced, not run).
#
# Builds an ffmpeg audio graph that mixes Rae's voice (input 0) with the
# gameplay sound (input 1). Either track may be missing.
#
#   RAE_VOL   loudness of Rae's audio      (default 1.0)
#   GAME_VOL  loudness of gameplay audio   (default 0.35 when Rae talks, 1.0 otherwise)
#   DUCK=1    also dip the gameplay automatically while Rae is speaking (default 1)

has_audio() {
  ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 "$1" | grep -q .
}

# Sets AUDIO_FILTER (a filter_complex fragment ending in [a], may be empty)
# and AUDIO_MAP (the -map arguments for audio).
build_audio() {
  local rae="$1" game="$2"
  local rae_vol="${RAE_VOL:-1.0}" duck="${DUCK:-1}"
  AUDIO_FILTER=""
  AUDIO_MAP=()
  if has_audio "$rae" && has_audio "$game"; then
    local game_vol="${GAME_VOL:-0.35}"
    if [ "$duck" = "1" ]; then
      AUDIO_FILTER="[0:a]volume=${rae_vol},asplit=2[ra][rkey];
        [1:a]volume=${game_vol}[g0];
        [g0][rkey]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=400[gd];
        [ra][gd]amix=inputs=2:duration=shortest:normalize=0[a]"
    else
      AUDIO_FILTER="[0:a]volume=${rae_vol}[ra];[1:a]volume=${game_vol}[g0];
        [ra][g0]amix=inputs=2:duration=shortest:normalize=0[a]"
    fi
    AUDIO_MAP=(-map "[a]")
  elif has_audio "$rae"; then
    AUDIO_FILTER="[0:a]volume=${rae_vol}[a]"
    AUDIO_MAP=(-map "[a]")
  elif has_audio "$game"; then
    AUDIO_FILTER="[1:a]volume=${GAME_VOL:-1.0}[a]"
    AUDIO_MAP=(-map "[a]")
  fi
}
