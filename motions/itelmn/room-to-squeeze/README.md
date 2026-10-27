# 空气能压缩，水为什么难压？
Room to Squeeze · original 27-second educational animation · 1920×1080 · 30 fps

Two sealed needle-free cylinders compare air and water at the same piston area and qualitative external force. Air has much more room between molecules; compression reduces their separation, not their size. Water molecules are already close together, so ordinary pushes barely change its volume. Water is not absolutely incompressible. See SOURCES.md for original educational and scientific references and the schematic limitations.

## Editable source
Edit film.js for all geometry, camera, timing and Chinese explanation. index.html is the HyperFrames composition with a paused registered GSAP timeline. preview.html provides standalone native play/pause/seek controls. No prerecorded visual media is used. assets/score.mp3 is original sound design, no narration.

## Independent MP4 export
Install dependency from package.json using npm install, then node render.cjs (FFmpeg must be installed). The exporter uses the included MP3; if an optional soundtrack.wav master exists, it uses that instead. To regenerate that master from audio.py, install Python numpy and scipy first. Export runs exactly the same film.js using @napi-rs/canvas and FFmpeg. Official HyperFrames CLI checks were not run; see RENDER-NOTES.md. MP4 is delivered separately and excluded from the ui2v runtime.

## License
Original code/art/audio MIT-0; third-party font and GSAP terms retained in THIRD_PARTY.md and assets.
