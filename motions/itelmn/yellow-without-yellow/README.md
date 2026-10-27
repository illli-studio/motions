# 屏幕里的黄色，藏在哪儿？
28秒原创中文知识科普，1920×1080，30fps，有声。问题 → 子像素组合 → 视觉空间整合 → 相似颜色不等于相同光谱。

以常见 RGB 条纹屏幕为例，而不是所有屏幕。红、绿子像素亮起，蓝接近关闭；远看时细小色点难以分辨，产生黄色感觉。红光和绿光并未变成新的黄色波长。几何和光谱是定性示意，不代表测量结果、精确配色或真实产品尺寸。

## 原生播放 / 编辑
- `index.html`：Hyperframes 根合成和同步注册的 paused GSAP 时间轴 `window.__timelines['pixel-science']`。
- `film.js`：可编辑、确定性 `PixelScience.render(context, seconds)`。真实三维顶点/面、透视投影、面深度排序，非预渲染图像或视频。
- `preview.html`：单独浏览器播放/暂停/拖动时间工具；请通过普通静态 HTTP 服务打开。
- `assets/score.mp3`：原创声音提示，服务放大、红绿点亮和比较节奏。没有旁白；中文字幕/图示负责完整解释。音高不是光波频率，也不是屏幕真实声音。
- `SOURCES.md`：科学来源与边界。`THIRD_PARTY.md` 和 assets 内保留所有第三方许可。

## 导出
可编辑完整源码包另含 `render.cjs`、`audio.py` 和独立审计记录。需要 Node.js、@napi-rs/canvas、FFmpeg，音效再生需要 Python + numpy。运行 `python audio.py` 后 `node render.cjs`，得到 H.264/AAC MP4。MP4只聊天交付，不在ui2v包中。
官方 Hyperframes CLI 本轮未执行：先前遥测请求被拒绝，没有重试或声称官方检查通过。本轮验证实际浏览器原生播放、相同 JavaScript 本地导出、确定性 seek、视频完整解码和音频峰值。

## 来源
Exploratorium: https://annex.exploratorium.edu/colorfest/whatiscolor.html
MIT: https://designftw.mit.edu/lectures/color/
Sharp RGBY 反例: https://global.sharp/corporate/news/100531_1.html
其余来源与读取限制见 SOURCES.md。
