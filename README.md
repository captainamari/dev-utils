
# DevUtils - 开发者工具站

**DevUtils** 是一款专为开发者设计的在线工具平台。采用了 **IDE 风格的标签页布局**，支持多任务并行处理，并具备极强的**插件化扩展能力**。

## 核心特性

* **IDE 交互体验**：采用侧边栏导航 + 顶部标签页切换，支持多工具同时打开，无感切换。
* **插件化架构**：每个工具都是一个独立的模块，通过注册中心（Registry）管理。新增工具只需添加一个文件夹，零耦合。
* **高性能计算**：集成 WebAssembly (Wasm) 模块，将 C++ 逻辑直接运行在浏览器端。
* **深度集成 Python**：利用 Vercel Serverless Functions 运行 Python 后端逻辑，支持自动化测试脚本生成与 Faker 数据模拟。
* **⌨沉浸式编辑**：内置 Monaco Editor（VS Code 核心），支持代码高亮、自动格式化和 Diff 对比。

## 技术栈

* **前端**: Next.js 14 (App Router), TypeScript, Tailwind CSS
* **状态管理**: Zustand (管理 Tabs 与全局状态)
* **UI 组件**: Shadcn/UI, Lucide React (图标)
* **编辑器**: @monaco-editor/react
* **后端**: Python (Vercel Serverless Functions), FastAPI (待选)
* **高性能**: C++ / CUDA (通过 WebAssembly 实现浏览器端加速)
* **部署**: Vercel

## 项目结构

```text
.
├── api/                # Python Serverless 后端接口 (Vercel API)
├── src/
│   ├── app/            # Next.js 路由逻辑
│   ├── components/     # 全局 UI 组件 (Sidebar, TabBar, Workspace)
│   ├── registry/       # 插件注册中心 (工具配置文件)
│   ├── store/          # Zustand 状态库 (Tab 管理逻辑)
│   └── tools/          # 工具插件池 (高度模块化)
│       ├── json-formatter/     # JSON 格式化工具
│       ├── timestamp-convert/  # 时间戳工具
│       └── [new-tool]/         # 待扩展的新工具
├── public/             # 静态资源与 Wasm 编译产物
└── requirements.txt    # Python 依赖

```

## 快速开始

### 1. 克隆项目

```bash
git clone xxx
cd dev-utils

```

### 2. 安装依赖

```bash
npm install
# 如果有 Python 依赖
pip install -r requirements.txt

```

### 3. 本地开发

```bash
# 启动 Next.js 并在本地模拟 Vercel API
vercel dev  # 或 npm run dev（不含 Python API）

```

访问 `http://localhost:3000` 查看。

## 如何添加一个新工具？

1. 在 `src/tools/` 下新建工具文件夹，实现 `Component.tsx`。
2. 在该文件夹下创建 `index.ts` 导出工具配置（ID、名称、图标）。
3. 在 `src/registry/tools.ts` 中引入该配置。
4. **完成！** 框架会自动在侧边栏渲染并管理标签页。

## 路线图 (Roadmap)

* [x] **第一阶段**：核心框架搭好，支持 JSON 和 时间戳。
* [x] **第二阶段**：基础工具集。
* [ ] **第三阶段**：C++ 与 CUDA 特色工具（IEEE 754 转换、CUDA 线程索引计算）。
* [ ] **第四阶段**：支持 Docker 容器化部署。


