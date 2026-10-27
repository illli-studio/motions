# 同样室温，金属为什么摸起来更凉？
29秒，1920×1080，30fps。浏览器原生确定性 Canvas 三维几何和二维解释，HyperFrames暂停GSAP时间轴。

## 知识要点
充分放置，初温相同且低于手温。热由较暖的手流入材料；金属通常让手失热更快，皮肤局部降温更明显。木材接触面更易暖起，导热不是零。凉感不等于温度。本片22°C为示意，非等比例、非实测；接触条件和材料厚度也影响触感。来源及模型边界在SOURCES.md。

## 编辑与播放
index.html是平台入口，film.js维护真实xyz曲面、相机、标注和四段时间；assets/score.mp3为原创声音。preview.html附本地播放/暂停/跳转控件。离线提供工程目录HTTP服务后打开preview.html。没有整条预渲染画面视频、图片序列、Base64画面或远程资源。

## 导出
完整源码包附render.cjs和audio.py，可独立导出同一film.js。需要Node与@napi-rs/canvas、FFmpeg，音频生成另需Python numpy/scipy；在源码目录运行 npm install（自备免费本地依赖），python audio.py，再 node render.cjs。不是Blender/Python场景包装：Python仅生成声音，浏览器执行所有画面几何。
官方HyperFrames CLI检查和导出未执行，参见RENDER-NOTES.md，不将独立检查冒称官方通过。

原创部分MIT-0，第三方字体及GSAP保留原许可。
