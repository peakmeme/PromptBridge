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
- [x] 文本切片算法实现 (TextChunker)
- [x] 本地向量库 LanceDB 集成 (完成)
- [x] 本地 Embedding 模型加载测试 (完成本地化装填)
- [x] 全链路自动化流水线打通 (解析 -> 切片 -> 向量化 -> 入库)
- [x] 前端拖拽上传 UI 与 IPC 实装
- [x] RAG 语义搜索增强 (KnowledgeService 实装)
- [x] 靶标数据精准度测试 (Day 7 大考通过)
- [x] 全局快捷键唤起 (Option+Space)
- [x] 透明悬浮搜索框 (系统级置顶交互)

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
- [x] Text chunking algorithm implementation (TextChunker)
- [x] Local vector database LanceDB integration (Completed)
- [x] Local Embedding model loading test (Completed localization)
- [x] Full-link automated pipeline integrated (Parse -> Chunk -> Vectorize -> DB)
- [x] Frontend drag-and-drop UI with IPC implementation
- [x] RAG Semantic Search Enhancement (KnowledgeService)
- [x] Precision Testing with Target Data (Day 7 Challenge)
- [x] Global Hotkey Support (Option+Space)
- [x] Transparent Floating Search Window (System-wide Topmost Interaction)

---

## 📝 更新日志 / Changelog

### [2026-04-11]

#### 第九次更新 / Ninth Session
- **feat**: 实现全局快捷键 `Option+Space` 唤起悬浮搜索框，调用 Electron 系统底层能力。
- **feat**: 实装“透明悬浮窗”UI，支持无边框、背景透明、永远置顶交互。
- **feat**: 打通悬浮窗与主进程的 RAG 交互链路，支持输入问题按回车直接检索。
- **test**: 在悬浮窗中添加只读 `<textarea>` 实时展示组装好的“超级提示词”，通过 Day 7 精准度验证。
- **feat**: Implemented global hotkey `Option+Space` for search window, leveraging Electron's low-level system APIs.
- **feat**: Added transparent floating window UI with borderless, background transparency, and always-on-top behavior.
- **feat**: Completed RAG interaction loop from search window to main process via IPC.
- **test**: Added read-only `<textarea>` in search window to display assembled "Super Prompts" for precision verification.

#### 第十次更新 / Tenth Session
- **feat**: 完成知识库管理 UI，支持查看已索引文件列表、单选/全选和批量删除。
- **feat**: 增加一键清空本地知识库能力，对应物理删除 LanceDB 目录并自动重建。
- **feat**: 前端状态文案与复制提示优化，入库、删除、复制等行为均有即时反馈。
- **feat**: 将数据库存储路径暴露给前端，便于调试和观察本地向量库位置。
- **feat**: 完善全局搜索浮窗的自动隐藏策略（Idle/清空/失焦），提升防误触体验。
- **fix**: 强化 VectorDbService 对表存在性、空表和异常场景的处理与日志记录。
- **chore**: 统一 IPC 层知识库相关接口（搜索、清空、列出文件、删除文件、获取 DB 路径）。
- **feat**: Completed knowledge base management UI with indexed file listing, single/multi-selection, and batch deletion.
- **feat**: Added one-click local knowledge base reset by physically removing the LanceDB directory and recreating it.
- **feat**: Improved frontend status messages and copy feedback for ingestion, deletion, and clipboard operations.
- **feat**: Exposed database path to the renderer to simplify debugging and inspection of the local vector store.
- **feat**: Refined global search window auto-hide behavior (idle/empty/blur) for a safer and smoother UX.
- **fix**: Hardened VectorDbService logic and logging around table existence, empty DB, and failure cases.
- **chore**: Consolidated knowledge-related IPC handlers (search, clear, list files, delete files, get DB path).

#### 第八次更新 / Eighth Session
- **feat**: 实现 `KnowledgeService`，打通 RAG（检索增强生成）闭环。
- **feat**: 在 `VectorDbService` 中新增向量搜索接口，支持 Top-K 检索。
- **test**: 建立靶标数据 `hetong.txt`，模拟 Day 7 精准度大考。
- **test**: 编写 `test-search.ts` 和 `test-ingest-hetong.ts`，验证全链路检索效果。
- **feat**: Implemented `KnowledgeService` to complete the RAG (Retrieval-Augmented Generation) loop.
- **feat**: Added vector search API to `VectorDbService` supporting Top-K retrieval.
- **test**: Created target data `hetong.txt` for Day 7 precision evaluation.
- **test**: Developed `test-search.ts` and `test-ingest-hetong.ts` to verify full-link retrieval.

#### 第七次更新 / Seventh Session
- **feat**: 实现主进程全自动化处理流水线 `PipelineService`。
- **feat**: 前端实装“虚线拖拽框”UI，支持 PDF 文件拖拽入库。
- **feat**: 打通 `Renderer -> IPC -> Main Pipeline -> LanceDB` 的全链路闭环。
- **fix**: 解决 ESM 模块导入冲突，通过动态 `import()` 兼容 `transformers.js` 和 `lancedb`。
- **feat**: Implemented automated main process pipeline `PipelineService`.
- **feat**: Added "Dashed Drag-and-Drop Box" UI in the frontend for PDF ingestion.
- **feat**: Completed the full-link loop: `Renderer -> IPC -> Main Pipeline -> LanceDB`.
- **fix**: Resolved ESM import conflicts using dynamic `import()` for `transformers.js` and `lancedb`.

#### 第六次更新 / Sixth Session
- **feat**: 集成无服务器向量数据库 `@lancedb/lancedb`。
- **feat**: 实现 `VectorDbService`，支持在 Electron `userData` 目录下自动初始化数据库。
- **feat**: 规范化数据库字段：`id, text, vector, source_file`。
- **feat**: 编写 `test-lancedb.ts` 测试脚本，验证向量数据入库与 `COUNT(*)` 查询。
- **feat**: Integrated serverless vector database `@lancedb/lancedb`.
- **feat**: Implemented `VectorDbService` for automatic DB initialization in Electron's `userData` directory.
- **feat**: Standardized database fields: `id, text, vector, source_file`.
- **feat**: Created `test-lancedb.ts` to verify vector data insertion and `COUNT(*)` queries.

#### 第五次更新 / Fifth Session
- **feat**: 在主进程成功引入 `@xenova/transformers`，跑通 `BGE-Small-ZH-V1.5` 本地推理。
- **feat**: 实现 `EmbeddingService` 单例服务，强制开启 `local_files_only: true` 确保 100% 物理断网运行。
- **feat**: 编写全流程测试脚本 `test-pipeline.ts`，打通“PDF 解析 -> 语义切片 -> 向量化”完整链路。
- **fix**: 补全 `onnxruntime-node` 依赖，解决 Node.js 环境下加载 ONNX 模型的后端缺失问题。
- **feat**: Integrated `@xenova/transformers` in the main process, enabling `BGE-Small-ZH-V1.5` local inference.
- **feat**: Implemented `EmbeddingService` singleton with `local_files_only: true` to ensure 100% offline execution.
- **feat**: Created `test-pipeline.ts` to verify the full RAG pipeline (PDF Parsing -> Text Chunking -> Vectorization).
- **fix**: Added `onnxruntime-node` dependency to resolve the missing backend for ONNX models in Node.js.

#### 第四次更新 / Fourth Session
- **feat**: 实现大模型本地化装填，选用 `BGE-Small-ZH-V1.5` 模型并完成 24MB 核心资产集成。
- **feat**: 建立标准的 `assets/models/` 目录结构，实现 100% 本地运行与物理隐私隔离。
- **chore**: 更新 `.gitignore` 策略，决定将轻量化模型资产直接纳入 Git 仓库，实现克隆即用。
- **feat**: Implement model localization with `BGE-Small-ZH-V1.5` and integrated 24MB core assets.
- **feat**: Established standard `assets/models/` structure for 100% local execution and privacy isolation.
- **chore**: Updated `.gitignore` to include lightweight model assets in the repository for "clone and play" experience.

#### 第三次更新 / Third Session
- **feat**: 实现文本切片算法 `TextChunker`，支持按中文标点切割，并引入重叠区机制。
- **feat**: 编写 `test-chunker.ts` 测试脚本，验证切片算法的重叠区效果。
- **feat**: Implement text chunking algorithm `TextChunker` with Chinese punctuation-based splitting and overlap mechanism.
- **feat**: Write `test-chunker.ts` test script to verify the overlap effect of the chunking algorithm.

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
