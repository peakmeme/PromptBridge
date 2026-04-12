# PromptBridge Release

## 中文

### 直接下载
- 平台：macOS Apple Silicon
- 安装包：`peakmeme-1.0.0-arm64.dmg`
- 当前构建产物位置：`dist/peakmeme-1.0.0-arm64.dmg`

### 软件简介
PromptBridge 是一个本地隐私记忆中枢与 AI 上下文桥接器。
用户可以将本地文档拖入应用，自动完成解析、切片、向量化和知识库入库，再通过语义检索快速生成可用于大模型的高质量上下文。

### 当前版本包含
- 文档拖拽导入与知识库管理
- RAG 语义检索与结果复制
- 全局快捷键 `Option+Space`
- Liquid Glass 风格界面
- 修复打包版缺失 `apache-arrow` 依赖的问题

### 安装说明
1. 下载 `peakmeme-1.0.0-arm64.dmg`
2. 打开 dmg 后将 `peakmeme.app` 拖入 Applications
3. 如果系统提示应用未签名，请在“系统设置 -> 隐私与安全性”中手动允许打开
4. 如本机已安装旧版本，请先替换 `/Applications/peakmeme.app` 后再测试

### 使用提示
- 首次使用请先拖入本地文档，建立知识库
- 数据库默认位于用户目录下的 Application Support 中
- 如果拖拽导入异常，请确认拖入的是 Finder 中的本地文件

---

## English

### Direct Download
- Platform: macOS Apple Silicon
- Installer: `peakmeme-1.0.0-arm64.dmg`
- Current build artifact path: `dist/peakmeme-1.0.0-arm64.dmg`

### Product Overview
PromptBridge is a local privacy memory hub and AI context bridge.
It lets users drag local documents into the app, automatically parse, chunk, vectorize, and store them in a local knowledge base, then perform semantic retrieval to generate high-quality context for LLM usage.

### Included in This Build
- Drag-and-drop document ingestion with knowledge base management
- RAG semantic retrieval with result copying
- Global hotkey `Option+Space`
- Liquid Glass styled interface
- Fix for the packaged `apache-arrow` runtime dependency issue

### Installation
1. Download `peakmeme-1.0.0-arm64.dmg`
2. Open the dmg and drag `peakmeme.app` into Applications
3. If macOS warns that the app is unsigned, allow it manually in "System Settings -> Privacy & Security"
4. If an older build is already installed, replace `/Applications/peakmeme.app` before testing

### Notes
- On first use, ingest local documents to build the knowledge base
- The database is stored under the user's Application Support directory
- If drag-and-drop ingestion fails, make sure the file is dragged from Finder as a local file
