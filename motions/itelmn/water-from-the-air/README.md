# 冰杯外面的水，从哪儿来？
28 秒原创中文科普，1920×1080、30fps。通过密闭冰水杯和常温杯对照，解释看不见的空气水蒸气在低于露点的外壁凝结为水滴。过程加速，分子和水滴非等比例，不是实拍实验或测量。
## Knowledge
水来自空气，不是穿过完整杯壁，也不是冷创造了水。露点因水汽含量等条件变化，没有固定通用温度；片中只演示液态凝结，不涵盖结霜。
事实来源：NOAA https://www.noaa.gov/jetstream/ll-sweatin 与 https://gml.noaa.gov/ozwv/wvap/instrument.html ；更多见 SOURCES.md。
## Editable native project
Edit film.js for scene timing, geometry, colors and Chinese text. assets/field.ttf is a licensed Chinese font subset; regenerate subset when adding characters. index.html is the HyperFrames composition with paused registered timeline and timed audio. preview.html is a standalone developer preview with play/pause/seek. Runtime contains no MP4, WebM, visual frame sequence or Base64 video.
The source archive additionally provides render.cjs and audio.py. Native node export requires @napi-rs/canvas and FFmpeg. Run node render.cjs --stills, --gate or no flag for full MP4. Full export has been independently tested, not certified by official HyperFrames CLI. See RENDER-NOTES.md.
## License
Original work MIT-0; third-party GSAP/font terms remain intact, see THIRD_PARTY.md and assets notices.
