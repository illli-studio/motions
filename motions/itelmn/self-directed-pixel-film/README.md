# 自己动手：像素导演

64 秒的快运镜像素导演短片（540p 预演版）。发布版本：1.0.0；作者账号：ITELMN。

## 规格与制作边界

- 960×540，30 fps，64 秒，1920 帧；此公开版本为 540p 预演版，不是 1080p 高清母版。
- 快速相机运动、局部稳停、波形追拍、过山车绕拍、递归屏幕和片名收束。
- 独立 48 kHz 双声道原创合成配乐与动作拟音。
- `index.html` 是 Hyperframes 主合成，使用本地 GSAP、静音 MP4 和独立 MP3；由 Hyperframes 控制媒体播放与定位。
- 实体几何与相机由 Blender Workbench 预渲染，递归屏幕由 Python 透视合成，FFmpeg 编码。**并非浏览器原生实时 3D，也不宣称画面由 Hyperframes CLI 渲染。**

## 使用

```sh
npx hyperframes lint .
npx hyperframes preview .
```

`assets/film-3d-silent.mp4` 是画面，`assets/soundtrack.mp3` 是独立音轨（320 kbps、48 kHz 双声道，有损压缩），`thumbnail.jpg` 是封面。

HTML 中可调整媒体起点、时长、音量与主合成布局。3D 对象、摄影、角色表演与音乐同样提供源代码，但更改它们须重新预渲染相关资产，不能仅靠编辑 HTML 即时改变已烘焙的画面。

公开音轨采用高码率 MP3，以满足平台单文件大小限制；它不是无损音频。原始 PCM WAV 未随包分发，可运行 `audio.py` 重新生成。`finish.py` 会同时更新公开播放所需 MP3。

## 可编辑源文件与重建

- `film3d.py`：场景、几何、相机与逐帧渲染。
- `camera-beats.json`：带时间戳的相机位置和目标点参考。
- `actors.py`：角色几何与表演。
- `audio.py`：音乐、拟音与波形生成。
- `recursion.py`：递归屏幕与拖拽叠加。
- `render_preview.py`、`finish.py`：可续渲染、合成与编码。
- `softbox.sl.txt`：Blender 灯光配置；重建时由源码生成 `.sl` 文件。

环境：Blender 4.3.2、Python 3、NumPy、SciPy、Pillow、FFmpeg/libx264。安装 Python 依赖后执行：

```sh
python -m pip install -r requirements.txt
python audio.py
python render_preview.py
python finish.py
```

重建会生成帧目录、日志与本地参考片；这些生成内容不属于此公开分发包。包内不包含 `.blend` 文件，提供的是生成场景的 Python 源码。字库从原字体提取并按源码全部现用字符进行子集化，以缩小分发包；字体已重新命名。添加新的中文或其他未收录字符时，需要自行安装完整的 Noto Sans CJK / DejaVu 字库并替换对应资产。完整原字库未包含在本包。

## 许可

原创代码、构图、动画、音乐与画面按 MIT-0 发布，见 `LICENSE.txt`。第三方依赖不重新授权为 MIT-0：GSAP 与字体分别遵守原许可，见 `THIRD-PARTY-NOTICES.md` 及 `assets/` 中许可文件。
