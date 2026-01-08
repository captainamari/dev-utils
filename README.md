

# DevUtils - 开发者工具站

**DevUtils** 是一款专为开发者设计的在线工具平台。采用了 **IDE 风格的标签页布局**，支持多任务并行处理，并具备极强的**插件化扩展能力**。

## 核心特性

* **IDE 交互体验**：采用侧边栏导航 + 顶部标签页切换，支持多工具同时打开，无感切换。
* **插件化架构**：每个工具都是一个独立的模块，通过注册中心（Registry）管理。新增工具只需添加一个文件夹，零耦合。
* **高性能计算**：集成 WebAssembly (Wasm) 模块，将 C++ 逻辑直接运行在浏览器端。
* **深度集成 Python**：利用 Vercel Serverless Functions 运行 Python 后端逻辑，支持自动化测试脚本生成与 Faker 数据模拟。
* **沉浸式编辑**：内置 Monaco Editor（VS Code 核心），支持代码高亮、自动格式化和 Diff 对比。

## 技术栈

| 层级 | 技术 |
|------|------|
| **前端框架** | Next.js 14 (App Router) + TypeScript |
| **UI 样式** | Tailwind CSS + Shadcn/UI |
| **状态管理** | Zustand (持久化到 localStorage) |
| **代码编辑器** | Monaco Editor (@monaco-editor/react) |
| **图标库** | Lucide React |
| **后端** | Python Serverless (Vercel Functions) |
| **高性能计算** | C++ WebAssembly (Emscripten) |
| **部署平台** | Vercel |

## 已实现的工具 (7个)

### 代码工具类 (Code)

| 工具 | 功能描述 |
|------|----------|
| **JSON 格式化** | 格式化、压缩、验证 JSON；支持 Python 字典格式自动转换 |
| **文本对比 (Diff)** | 使用 Monaco DiffEditor 对比代码差异，支持多语言高亮 |
| **正则测试** | 正则表达式测试，支持 JS/Python 双引擎验证，自动生成 Pytest 用例 |

### 基础转换类 (Convert)

| 工具 | 功能描述 |
|------|----------|
| **时间戳转换** | Unix 时间戳与日期时间互转，支持秒/毫秒单位 |
| **编解码器** | Base64、URL、Unicode、Hex、Binary、Octal 编解码；支持 2/8/10/16/64 进制互转 |
| **IEEE 754 查看器** | 浮点数二进制位可视化，支持 32/64 位精度，显示符号位/指数位/尾数位 |

### 测试工具类 (Test)

| 工具 | 功能描述 |
|------|----------|
| **Faker 数据生成** | 生成模拟测试数据（姓名、电话、邮箱、地址等 27 种字段），支持中英文 |

## 后端 API

| API 路径 | 方法 | 功能 |
|----------|------|------|
| `/api/faker_gen` | GET | 获取可用字段列表 |
| `/api/faker_gen` | POST | 生成 Faker 模拟数据 |
| `/api/regex_test` | POST | Python 正则验证 + Pytest 代码生成 |

## 项目结构

```text
.
├── api/                          # Python Serverless 后端 (Vercel API)
│   ├── faker_gen.py              # Faker 数据生成 API
│   └── regex_test.py             # 正则表达式测试 API
├── src/
│   ├── app/                      # Next.js App Router
│   ├── components/
│   │   ├── layout/               # 布局组件 (Sidebar, TabBar, Workspace)
│   │   ├── shared/               # 共享组件 (ToolLayout, InputPanel, OutputPanel)
│   │   └── ui/                   # UI 基础组件 (Button, ScrollArea, Tooltip)
│   ├── lib/                      # 工具库 (ieee754.ts, utils.ts)
│   ├── registry/                 # 插件注册中心
│   ├── store/                    # Zustand 状态管理
│   └── tools/                    # 工具插件池 (7个工具)
│       ├── json-formatter/       # JSON 格式化
│       ├── timestamp-convert/    # 时间戳转换
│       ├── multi-codec/          # 编解码器
│       ├── regex-tester/         # 正则测试
│       ├── diff-viewer/          # 文本对比
│       ├── faker-gen/            # Faker 数据生成
│       └── ieee754-viewer/       # IEEE 754 浮点数可视化
├── wasm/                         # WebAssembly 源码
│   └── ieee754.cpp               # C++ IEEE 754 实现
├── scripts/                      # 构建脚本
│   ├── build-wasm.ps1            # Windows WASM 构建
│   └── build-wasm.sh             # Linux/Mac WASM 构建
├── public/                       # 静态资源与 Wasm 编译产物
└── requirements.txt              # Python 依赖 (faker)
```

## 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd dev-utils
```

### 2. 安装依赖

```bash
npm install
pip install -r requirements.txt
```

### 3. 本地开发

```bash
# 启动 Next.js 并在本地模拟 Vercel API (推荐)
vercel dev

# 或仅前端开发（不含 Python API）
npm run dev
```

访问 `http://localhost:3000` 查看。

## 如何添加一个新工具？

1. 在 `src/tools/` 下新建工具文件夹，实现 `Component.tsx`。
2. 在 `src/registry/tools.ts` 中注册工具配置（ID、名称、图标、分类）。
3. **完成！** 框架会自动在侧边栏渲染并管理标签页。

## 路线图 (Roadmap)

* [x] **第一阶段**：核心框架搭建，支持 JSON 和时间戳工具。
* [x] **第二阶段**：基础工具集（编解码器、正则测试、Diff 对比、Faker 数据生成）。
* [x] **第三阶段**：IEEE 754 浮点数可视化工具（TypeScript 实现完成）。
* [ ] **第四阶段**：WebAssembly 高性能模块集成（C++ 源码已就绪）。
* [ ] **第五阶段**：CUDA 线程索引计算工具。
* [ ] **第六阶段**：Docker 容器化部署。



