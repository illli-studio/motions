# 同样重，降落伞为什么慢？

29秒 / 1920×1080 / 原创音轨 / 原生可编辑 Hyperframes HTML。

## 知识收获
同速度时，迎风面积更大，阻力更大。由静止下降时速度增大，阻力也增大，最终趋近与重力平衡。在同总质量、空气密度和阻力系数下，迎风面积4倍，终端速度一半。静风、伞形稳定、忽略浮力；参数与时间均为示意，不是产品实测。两伞终端状态所受阻力相同，均等于相同重力。

## 编辑和播放
index.html是主入口；film.js含真实XYZ伞面网格、绳索、载荷和确定性时间驱动渲染。使用官方 hyperframes preview 打开 Studio 预览。GSAP暂停时间线注册到window.__timelines。assets/score.mp3为原创音轨。发行包不含整条视频或帧序列。

## 来源与许可
NASA一手来源见SOURCES.md。原创部分MIT-0；字体和GSAP许可分别保留，见THIRD_PARTY.md。

## 检查限制
2026-10-28 已使用官方 Hyperframes 0.8.186 完成 lint、四构图 inspect、Studio 实际播放与整片导出。HYPERFRAMES_NO_TELEMETRY=1 关闭遥测，使用已安装 Chromium 截图捕获路径。29秒、1920×1080、30fps、870帧，整片解码无错误。详见 RENDER-NOTES.md。
