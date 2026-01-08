import dynamic from "next/dynamic";
import { 
  Braces, 
  Clock, 
  Binary, 
  Regex, 
  GitCompare, 
  Database,
  Cpu,
} from "lucide-react";
import { registerTool, ToolDefinition } from "./index";

// 使用 dynamic import 延迟加载工具组件
const JsonFormatter = dynamic(
  () => import("@/tools/json-formatter/Component"),
  { ssr: false }
);

const TimestampConvert = dynamic(
  () => import("@/tools/timestamp-convert/Component"),
  { ssr: false }
);

const MultiCodec = dynamic(
  () => import("@/tools/multi-codec/Component"),
  { ssr: false }
);

const RegexTester = dynamic(
  () => import("@/tools/regex-tester/Component"),
  { ssr: false }
);

const DiffViewer = dynamic(
  () => import("@/tools/diff-viewer/Component"),
  { ssr: false }
);

const FakerGen = dynamic(
  () => import("@/tools/faker-gen/Component"),
  { ssr: false }
);

const IEEE754Viewer = dynamic(
  () => import("@/tools/ieee754-viewer/Component"),
  { ssr: false }
);

// 工具配置列表
export const toolConfigs: ToolDefinition[] = [
  // 代码工具
  {
    id: "json-formatter",
    name: "JSON 格式化",
    icon: Braces,
    description: "格式化、压缩和验证 JSON 数据",
    component: JsonFormatter,
    category: "code",
  },
  {
    id: "diff-viewer",
    name: "文本对比",
    icon: GitCompare,
    description: "对比两段代码或文本的差异",
    component: DiffViewer,
    category: "code",
  },
  // {
  //   id: "regex-tester",
  //   name: "正则测试",
  //   icon: Regex,
  //   description: "测试正则表达式并生成代码",
  //   component: RegexTester,
  //   category: "code",
  // },
  // 基础转换
  {
    id: "timestamp-convert",
    name: "时间戳转换",
    icon: Clock,
    description: "Unix 时间戳与日期时间互转",
    component: TimestampConvert,
    category: "convert",
  },
  {
    id: "multi-codec",
    name: "编解码器",
    icon: Binary,
    description: "Base64、URL、Unicode、进制转换",
    component: MultiCodec,
    category: "convert",
  },
  {
    id: "ieee754-viewer",
    name: "IEEE 754",
    icon: Cpu,
    description: "浮点数二进制位可视化",
    component: IEEE754Viewer,
    category: "convert",
  },
  // 测试工具
  {
    id: "faker-gen",
    name: "Faker 数据",
    icon: Database,
    description: "生成模拟测试数据",
    component: FakerGen,
    category: "test",
  },
];

// 初始化注册所有工具
export function initializeTools() {
  toolConfigs.forEach((tool) => registerTool(tool));
}
