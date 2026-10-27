# 细管里的水，为何爬得更高？
27秒 / 1920×1080 / 30fps / 中文图解 / 原创立体声音效 / 无旁白。

## 知识
同一液体、相同润湿性与重力条件下，理想均匀圆管越细，毛细上升的**平衡高度**越高。接触线表面张力的向上分量支持液柱重量。并非越细上升必然越快，也非无限上升。尺寸、时间、颜色为示意；忽略弯月面体积。完整来源及边界见SOURCES.md。

## 编辑与播放
修改film.js中的几何、文字与时间函数；index.html包含同步注册的暂停GSAP时间线，播放器负责时间和独立音轨。浏览器打开preview.html可播放、暂停与跳时。原生运行时没有整片视频或帧图；平台播放不依赖MP4。

## 独立导出
安装package.json固定版本依赖后运行 `node render.cjs`，需要FFmpeg。prepare-font.py使用系统Noto字体及fontTools生成子集，音轨由audio.py生成。MP4为独立聊天交付，不放在平台包里。

## 验证范围
此前官方HyperFrames CLI遥测路线被拒绝；未重试或绕过，也未声称通过官方lint/inspect/render。采用同一film.js的独立NodeCanvas出口，并另做浏览器原生播放、构图动态检查、完整解码和音频测量。详见RENDER-NOTES.md。

原创内容MIT-0；第三方字体及GSAP保持原许可证，见THIRD_PARTY.md。
