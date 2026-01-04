"use client";

import { useTabStore } from "@/store/useTabStore";
import { getTool, getAllTools } from "@/registry";
import { memo, useMemo } from "react";
import { Wrench } from "lucide-react";

// 使用 memo 优化渲染
const ToolPanel = memo(function ToolPanel({
  toolId,
  isActive,
}: {
  toolId: string;
  isActive: boolean;
}) {
  const tool = getTool(toolId);
  if (!tool) return null;

  const Component = tool.component;

  return (
    <div
      className="absolute inset-0 overflow-auto custom-scrollbar"
      style={{ display: isActive ? "block" : "none" }}
    >
      <Component />
    </div>
  );
});

// 欢迎页面
function WelcomePage() {
  const tools = getAllTools();
  const { openTab } = useTabStore();

  return (
    <div className="flex h-full flex-col items-center justify-center p-8">
      <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-zinc-800/50">
        <Wrench className="h-10 w-10 text-zinc-400" />
      </div>
      <h1 className="mb-2 text-2xl font-bold text-white">开发者工具集</h1>
      <p className="mb-8 text-center text-zinc-400">
        选择左侧工具栏中的工具开始使用，提高你的开发效率
      </p>
      <div className="grid max-w-2xl grid-cols-2 gap-4">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.id}
              onClick={() => openTab(tool.id)}
              className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 text-left transition-all hover:border-zinc-700 hover:bg-zinc-800/50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800">
                <Icon className="h-5 w-5 text-zinc-300" />
              </div>
              <div>
                <p className="font-medium text-white">{tool.name}</p>
                <p className="text-sm text-zinc-400">{tool.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function Workspace() {
  const { openTabIds, activeTabId } = useTabStore();

  // 缓存已打开的工具面板
  const panels = useMemo(() => {
    return openTabIds.map((tabId) => (
      <ToolPanel key={tabId} toolId={tabId} isActive={activeTabId === tabId} />
    ));
  }, [openTabIds, activeTabId]);

  if (openTabIds.length === 0) {
    return (
      <div className="relative h-full bg-zinc-900">
        <WelcomePage />
      </div>
    );
  }

  return (
    <div className="relative h-full bg-zinc-900">
      {panels}
    </div>
  );
}
