# UI2V Upload Demo

桌面上的可上传 HyperFrames 包，用来测 UI2V 上传 / 发布。

## 结构

- `registry-item.json` — 包清单（必填）
- `index.html` — 入口 composition（必填）

## 网页上传

1. 打开本地站：http://localhost:3000/publish-motion-upload（或站点上的 Upload）
2. 登录后，把整个 `ui2v-upload-demo` 文件夹拖进去
3. 核对 slug / 版本后 Publish

## CLI 上传

```bash
cd C:\Users\33132\Desktop
ui2v login
ui2v publish ui2v-upload-demo --slug ui2v-upload-demo --name "UI2V Upload Demo" --version 1.0.0
```

发布后页面大致是：`http://localhost:3000/<你的handle>/ui2v-upload-demo`
