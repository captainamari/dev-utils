import dynamic from "next/dynamic";
import { Braces, Clock } from "lucide-react";
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

// 工具配置列表
export const toolConfigs: ToolDefinition[] = [
  {
    id: "json-formatter",
    name: "JSON 格式化",
    icon: Braces,
    description: "格式化、压缩和验证 JSON 数据",
    component: JsonFormatter,
  },
  {
    id: "timestamp-convert",
    name: "时间戳转换",
    icon: Clock,
    description: "Unix 时间戳与日期时间互转",
    component: TimestampConvert,
  },
];

// 初始化注册所有工具
export function initializeTools() {
  toolConfigs.forEach((tool) => registerTool(tool));
}
