# 钢铁会沉，钢船为什么能浮？
29秒原创中文科普。比较钢块与空心钢船，展示排水体积与浮力，装货后吃水加深。

浮力等于排开液体的重量；静止漂浮时浮力才等于船与载荷总重。空心船体可在进水前排开足够的水，钢材本身没有变轻。装载过多或进水仍可能下沉。所有尺寸/运动是简化示意、非等比例；请勿从画面测量数值。来源详见 SOURCES.md。

## Edit and play
index.html is the native HyperFrames entry; registered paused GSAP timeline drives film.js at explicit time. preview.html has local playback and seek controls. No video plate. 3D polygon geometry is projected/depth sorted at runtime. Original sound is assets/score.mp3.

## Export
Install pinned dependencies from package.json, then node render.cjs. It exports the identical film.js through @napi-rs/canvas and FFmpeg at 1920x1080/30fps. The full MP4 is chat delivery only, excluded from runtime/source ZIP. See RENDER-NOTES.md.

Original content MIT-0; keep third-party licenses. No narration; explanatory labels accompany the soundtrack.
