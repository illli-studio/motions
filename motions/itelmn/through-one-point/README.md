# 光没拐弯，像怎么倒了？

27 秒 / 原生 1920×1080 / 原创有声音轨 / 可编辑 Hyperframes HTML。

一只双色茶壶进入暗箱剖面，沿顶部、底部两条直线追踪到屏幕；俯视镜头再解释左右翻转，最后移动物体观察像反向移动。均匀介质中光走直线，小孔筛选能通过的光路，并不使光折弯。

## 原生工程
index.html 是 Hyperframes 入口，film.js 包含实际 XYZ 茶壶旋转面、壶嘴、壶把、暗箱几何与确定性时间驱动 Canvas 渲染。assets/score.mp3 为原创新合成音轨。发布包没有整条视频或帧图序列。GSAP 暂停时间线注册到 window.__timelines。

## 编辑
修改 film.js 的几何、文字和时间参数；用官方 Hyperframes preview 在 Studio 播放，render 导出。项目的辅助 render.cjs 仅为静帧/短段开发检查，正式成片采用官方 Hyperframes 导出。参考 sources 与设计说明，不把辅助源码冒充平台播放器。

## 科学边界
几何光学简化、非等比例；不模拟衍射、曝光、真实亮度或材质成像。移除箱壁是剖面示意，真实暗箱必须遮光。选取的光线表示传播路径，不是空气里实际可见的光束。可信一手出处见 SOURCES.md（ANU、MIT、Illinois）。

## 许可
原创内容 MIT-0；第三方字体与 GSAP 许可见 THIRD_PARTY.md。
