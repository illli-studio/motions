# 卫星为什么不会掉下来？

28秒，1920×1080，30fps。原生Canvas XYZ几何与2D说明，由GSAP确定性时间驱动；不使用视频或逐帧图片背景。

平台入口 index.html。独立预览 preview.html 可播放/暂停/拖动，需HTTP服务。编辑 film.js 修改几何、相机、标签与时间；修改 audio.py 可重建原创声景。

## 独立导出
源码包安装锁定的 @napi-rs/canvas 并准备本机 FFmpeg，运行 node render.cjs。同一 film.js 在浏览器和 Node Canvas 绘制，导出MP4仅聊天交付。正式平台包不含MP4。

官方HyperFrames CLI检查本轮没有执行：此前telemetry权限拒绝，未重试或绕过。独立渲染和本地/公开浏览器实播验证不是官方CLI通过证明。

科学边界：理想圆轨道、忽略空气阻力，尺寸/距离/速度非比例。配乐非真实太空录音。请见 SOURCES.md 和 RENDER-NOTES.md。

本模型忽略引力以外其他力；“引力消失”是假设比较，不是现实中开关引力。
