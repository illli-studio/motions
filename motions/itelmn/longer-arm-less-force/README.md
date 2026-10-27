# 长扳手，为什么更省力？
26秒原创中文科普：同样施力时更长力臂产生更大力矩；要同样力矩可减小力，但同负载同转角时手端走更远，理想情况下不省功。只讲垂直力臂，不把工具总长直接代入一般情形。初段定性门槛与后段20N·m示例是分开的。非维修操作指南，来源/边界见SOURCES.md。

## Edit and play
index.html is native HyperFrames entry with paused GSAP timeline. film.js constructs and projects actual XYZ geometry at explicit time; no video plate or frame images. preview.html supplies a local player and seek UI. assets/score.mp3 is original sound; no narration.

## Export
Install pinned @napi-rs/canvas from package.json and FFmpeg, then node render.cjs. Same native film.js exports 1920×1080,30fps. MP4 is a separate chat deliverable, not part of platform or source ZIP. RENDER-NOTES.md documents the independent export and official CLI limitation. Font is already subset and shipped; prepare-font.py (source only) may expand it when supplied original Noto Sans CJK Regular collection.

Original work MIT-0, preserve third-party licenses.
