# PromptBridge

[中文](#中文) | [English](#english)

---

## 中文

### 🚀 项目定位
**“本地前置降噪，云端一键开火”** —— 这是一个面向高净值专业人群的本地隐私记忆中枢与 AI 上下文桥接器。
PromptBridge 旨在解决专业领域（如法律、审计、B2B 销售）在利用顶级云端大模型时面临的数据隐私与合规红线。通过纯本地的语义检索技术，将海量私密文档精准组装为高纯度“超级提示词”，实现“算力与隐私的完美解耦”。

### 🛠️ 核心架构
- **Electron + React + TypeScript**: 跨平台桌面级稳定性保障。
- **LanceDB (Node.js)**: 像 SQLite 一样简单的本地无服务器向量库。
- **Transformers.js**: 纯本地运行的 Embedding 模型，确保 100% 数据物理隔离。
- **智能剪贴板桥接**: 无需 API，通过劫持剪贴板无缝唤起网页端大模型（ChatGPT/Claude 等）。

### 📅 当前进度
- [x] 项目基础架构初始化 (Electron + Vite + React + TS)
- [x] 主进程与渲染进程 IPC 通信机制建立
- [x] 基础测试 UI 与 “Hello World” 联通验证
- [x] Git 版本管理与 .gitignore 环境隔离配置
- [x] 文档解析层集成 (pdf-parse + mammoth)
- [ ] 本地向量库 LanceDB 集成 (进行中)
- [ ] 本地 Embedding 模型加载测试 (待开始)

---

## English

### 🚀 Project Positioning
**"Local Pre-filtering, Cloud-side Execution"** —— A local privacy memory hub and AI context bridge for high-net-worth professionals.
PromptBridge addresses data privacy and compliance concerns in professional fields (e.g., legal, auditing, B2B sales) when using top-tier cloud-based LLMs. It utilizes local semantic retrieval to assemble massive private documents into high-purity "Super Prompts," achieving "perfect decoupling of compute power and privacy."

### 🛠️ Core Architecture
- **Electron + React + TypeScript**: Cross-platform desktop stability.
- **LanceDB (Node.js)**: A serverless local vector database as simple as SQLite.
- **Transformers.js**: Purely local Embedding models, ensuring 100% physical data isolation.
- **Intelligent Clipboard Bridge**: No API required; seamlessly invokes web-based LLMs (ChatGPT/Claude, etc.) via clipboard hijacking.

### 📅 Current Progress
- [x] Project scaffolding initialization (Electron + Vite + React + TS)
- [x] IPC communication mechanism between Main and Renderer processes
- [x] Basic Test UI and "Hello World" verification
- [x] Git version control and .gitignore environment isolation
- [x] Document parsing layer integration (pdf-parse + mammoth)
- [ ] Local vector database LanceDB integration (In Progress)
- [ ] Local Embedding model loading test (Pending)

---

## 📝 更新日志 / Changelog

### [2026-04-10]

#### 第二次更新 / Second Session
- **feat**: 集成文档解析层，引入 `pdf-parse` 和 `mammoth` 支持 PDF/Word 文本提取。
- **feat**: 实现 `DocParser` 类，支持纯本地文件解析与文本清洗（去空格/空行）。
- **feat**: Integrate document parsing layer with `pdf-parse` and `mammoth` for PDF/Word text extraction.
- **feat**: Implement `DocParser` class for local file parsing and text cleaning.

#### 第一次更新 / First Session
- **feat**: 初始化项目结构，配置 electron-vite + React + TypeScript。
- **feat**: 建立 IPC 通信，实现前端按钮触发主进程控制台打印。
- **chore**: 配置 Git 忽略规则，只上传源码，剔除 node_modules 等中间文件。
- **docs**: 创建中英双语 README.md，记录项目愿景与进度。
- **feat**: Init project structure with electron-vite + React + TS.
- **feat**: Setup IPC communication for Main/Renderer processes.
- **chore**: Config Git ignore rules to exclude `node_modules` and build artifacts.
- **docs**: Create bilingual README.md with project vision and roadmap.
