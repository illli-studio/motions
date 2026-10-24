#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
test "$(find frames -maxdepth 1 -name '*.png' | wc -l)" -eq 600
python3 composite.py | ffmpeg -hide_banner -y -f rawvideo -pixel_format rgb24 -video_size 1920x1080 -framerate 30 -i - -an -c:v libx264 -preset medium -crf 19 -pix_fmt yuv420p -movflags +faststart assets/visual.mp4
ffmpeg -hide_banner -y -i assets/visual.mp4 -i assets/soundtrack.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 256k -t 20 -movflags +faststart Paper-Garden.mp4
ffprobe -v error -show_streams -show_format -of json Paper-Garden.mp4 > media-probe.json
ffmpeg -v error -i Paper-Garden.mp4 -f null - 2> decode-errors.log
ffmpeg -hide_banner -i Paper-Garden.mp4 -filter_complex ebur128=peak=true -f null - 2> audio-check.log
