import { ComponentType } from "react";
import { LucideIcon } from "lucide-react";

export type ToolCategory = "code" | "convert" | "test" | "other";

export interface ToolDefinition {
  id: string;
  name: string;
  icon: LucideIcon;
  description: string;
  component: ComponentType;
  category: ToolCategory;
}

export interface CategoryDefinition {
  id: ToolCategory;
  name: string;
  order: number;
}

// 分类定义
export const categories: CategoryDefinition[] = [
  { id: "code", name: "代码工具", order: 1 },
  { id: "convert", name: "基础转换", order: 2 },
  { id: "test", name: "测试工具", order: 3 },
  { id: "other", name: "其他", order: 4 },
];

// 工具注册表 Map
const toolRegistry = new Map<string, ToolDefinition>();

// 注册工具
export function registerTool(tool: ToolDefinition) {
  toolRegistry.set(tool.id, tool);
}

// 获取单个工具
export function getTool(id: string): ToolDefinition | undefined {
  return toolRegistry.get(id);
}

// 获取所有工具
export function getAllTools(): ToolDefinition[] {
  return Array.from(toolRegistry.values());
}

// 按分类获取工具
export function getToolsByCategory(): Map<ToolCategory, ToolDefinition[]> {
  const result = new Map<ToolCategory, ToolDefinition[]>();
  
  // 初始化所有分类
  categories.forEach(cat => result.set(cat.id, []));
  
  // 分配工具到分类
  toolRegistry.forEach(tool => {
    const categoryTools = result.get(tool.category) || [];
    categoryTools.push(tool);
    result.set(tool.category, categoryTools);
  });
  
  return result;
}

// 检查工具是否存在
export function hasTool(id: string): boolean {
  return toolRegistry.has(id);
}
