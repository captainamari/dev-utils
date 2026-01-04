import { ComponentType } from "react";
import { LucideIcon } from "lucide-react";

export interface ToolDefinition {
  id: string;
  name: string;
  icon: LucideIcon;
  description: string;
  component: ComponentType;
}

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

// 检查工具是否存在
export function hasTool(id: string): boolean {
  return toolRegistry.has(id);
}
