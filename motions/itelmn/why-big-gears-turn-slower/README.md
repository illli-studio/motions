# 大齿轮，为什么转得慢？
25秒、1920×1080、30fps原创科普。20齿主动轮与40齿从动轮的固定轴外啮合示意：两轮同时间通过啮合处的齿数相同，因此转速与齿数成反比，方向相反。不是所有齿轮传动形式，也不是制造图纸。

## Edit / preview
index.html registers gear-science in window.__timelines. film.js is the only visual renderer: deterministic time-driven actual XYZ extruded involute meshes projected onto Canvas with depth sorting; Chinese labels are explanatory 2D layers. No video or frame sequence used for playback. preview.html provides native play/pause/seek controls. Serve this directory on HTTP and open preview.html; browser audio begins after clicking Play. GSAP and all assets are local.

## Export
The editable source ZIP includes render.cjs, audio.py and package.json. Install the pinned @napi-rs/canvas dependency if absent, run python audio.py (requires numpy + ffmpeg), then node render.cjs. Font subset is included. The separate MP4 is not part of this runtime package. No voiceover: text, white tooth markers, close-up contact, counters and original synchronized sounds explain the mechanism.

## Verification boundaries
Independent same-JS browser playback and Canvas/FFmpeg export, not official HyperFrames certification. Official CLI lint/inspect/render were not run because prior telemetry denial is respected. No claim of subjective audio listening. Scientific references and third-party licenses are retained.
