# 桥面，为什么故意留一道缝？
29.1秒，1920×1080，30fps。原创浏览器原生知识动画；源码可编辑。

## 知识主线
桥段材料升温会伸长，在所示固定端—活动端模型中，端部靠近桥台、接缝收窄；降温则反向。柔性密封与允许水平位移的支座配合，而不是让桥墩跟着平移。
实际位移还包括混凝土收缩、徐变等；有些桥采用无桥面伸缩缝的构造。模型不是施工设计：一种装置剖面，结构简化，变形放大、过程加速，未标定真实尺寸或温差。
来源与边界见 SOURCES.md。主要依据 WSDOT2025桥梁设计手册第9章及TxDOT维护手册：
https://wsdot.wa.gov/publications/manuals/fulltext/M23-50/Chapter9.pdf
https://www.txdot.gov/manuals/mnt/ope/bridges/bridge_maintenance_actions.html

## 工程
index.html 是 HyperFrames 入口，film.js 是显式秒数驱动的 xyz 几何场景和2D解释。BridgeFilm.render(context,seconds) 支持任意前后跳转；没有外部网络请求、随机时钟或预渲染视频。assets/score.mp3 是原创合成声音；机制声音为解释性声效，不是真实结构录音；无旁白。
几何体通过相机投影和深度排序直接在Canvas绘制。桥段、支座、桥台、车辆、接缝均是实际顶点/面，不是图片拼贴。source包可含开发渲染助手；运行入口不使用 Python、FFmpeg 或 Node。

## 本地播放与导出
使用官方 HyperFrames CLI；Node22+、Chromium、FFmpeg。
HYPERFRAMES_NO_TELEMETRY=1 hyperframes preview
HYPERFRAMES_NO_TELEMETRY=1 hyperframes lint
HYPERFRAMES_NO_TELEMETRY=1 hyperframes check
HYPERFRAMES_NO_TELEMETRY=1 hyperframes render --quality high --fps 30 --output bridge.mp4
已执行检查与限制见 RENDER-NOTES.md。MP4单独聊天交付，不在平台原生发布包内。

## 许可
原创代码/模型/图示/声音/文字采用 MIT-0。第三方GSAP、ZCOOL XiaoWei字体保留各自许可，不被重新许可。
