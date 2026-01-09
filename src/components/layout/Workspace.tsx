"use client";

import { useTabStore } from "@/store/useTabStore";
import { getTool, getToolsByCategory, categories } from "@/registry";
import { memo, useMemo } from "react";
import { Wrench } from "lucide-react";
import { useLanguage } from "@/i18n";

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
  const { openTab } = useTabStore();
  const { t } = useLanguage();
  const toolsByCategory = useMemo(() => getToolsByCategory(), []);
  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.order - b.order),
    []
  );

  return (
    <div className="flex h-full flex-col items-center overflow-auto py-12 px-8">
      <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-zinc-800/50">
        <Wrench className="h-10 w-10 text-zinc-400" />
      </div>
      <h1 className="mb-2 text-2xl font-bold text-white">{t.common.title}</h1>
      <p className="mb-10 text-center text-zinc-400">
        {t.common.selectToolHint}
      </p>

      <div className="w-full max-w-4xl space-y-8">
        {sortedCategories.map((category) => {
          const tools = toolsByCategory.get(category.id) || [];
          if (tools.length === 0) return null;

          const categoryName = t.categories[category.id as keyof typeof t.categories] || category.name;

          return (
            <div key={category.id}>
              <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-zinc-500">
                {categoryName}
              </h2>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {tools.map((tool) => {
                  const Icon = tool.icon;
                  const toolTranslation = t.tools[tool.id as keyof typeof t.tools];
                  return (
                    <button
                      key={tool.id}
                      onClick={() => openTab(tool.id)}
                      className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 text-left transition-all hover:border-zinc-700 hover:bg-zinc-800/50"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-800">
                        <Icon className="h-5 w-5 text-zinc-300" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-white truncate">{toolTranslation?.name || tool.name}</p>
                        <p className="text-sm text-zinc-400 truncate">{toolTranslation?.description || tool.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
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
