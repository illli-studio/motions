# Rendering and verification boundaries
Native platform entry: index.html. Local GSAP drives a deterministic time value into the same film.js Canvas renderer used by the independent MP4 export. Actual XYZ mesh faces are projected and depth-sorted in the browser, not a prerendered video plate. Geometry, camera and explanatory overlays are editable.

Independent export: Node @napi-rs/canvas plus FFmpeg, 1920×1080 at 30fps for 28 seconds. Node and browser use the same film.js and bundled font. The MP4 is a separate chat deliverable and is not included in the ui2v runtime directory.

Official Hyperframes CLI checks were not run: a prior telemetry action was denied and was not retried or bypassed. Independent render, DOM/timeline playback, audio metadata/peak and decode checks are separately recorded; they are not represented as official lint/inspect/render passes. Audio checks are measurements, not subjective listening.
