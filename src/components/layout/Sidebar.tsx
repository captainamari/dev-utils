"use client";

import { cn } from "@/lib/utils";
import { useTabStore } from "@/store/useTabStore";
import { getToolsByCategory, categories, ToolDefinition } from "@/registry";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Wrench, Globe } from "lucide-react";
import { useMemo } from "react";
import { useLanguage, localeConfigs, type Locale } from "@/i18n";

interface ToolButtonProps {
  tool: ToolDefinition;
  isOpen: boolean;
  isActive: boolean;
  onClick: () => void;
}

function ToolButton({ tool, isOpen, isActive, onClick }: ToolButtonProps) {
  const Icon = tool.icon;
  const { t } = useLanguage();
  const toolTranslation = t.tools[tool.id as keyof typeof t.tools];

  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          className={cn(
            "relative flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-200",
            "hover:bg-zinc-800/80",
            isActive && "bg-zinc-800 text-white",
            isOpen && !isActive && "text-zinc-400",
            !isOpen && "text-zinc-500 hover:text-zinc-300"
          )}
        >
          <Icon className="h-5 w-5" />
          {/* 已打开指示器 */}
          {isOpen && (
            <span
              className={cn(
                "absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full transition-all",
                isActive ? "bg-blue-500" : "bg-zinc-600"
              )}
            />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent side="right" className="bg-zinc-800 border-zinc-700">
        <p className="font-medium">{toolTranslation?.name || tool.name}</p>
        <p className="text-xs text-zinc-400">{toolTranslation?.description || tool.description}</p>
      </TooltipContent>
    </Tooltip>
  );
}

function LanguageSwitcher() {
  const { locale, setLocale, localeConfig } = useLanguage();

  const toggleLocale = () => {
    const nextLocale: Locale = locale === 'zh-CN' ? 'en' : 'zh-CN';
    setLocale(nextLocale);
  };

  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <button
          onClick={toggleLocale}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-500 transition-all duration-200 hover:bg-zinc-800/80 hover:text-zinc-300"
        >
          <span className="text-xs font-medium">{localeConfig.shortName}</span>
        </button>
      </TooltipTrigger>
      <TooltipContent side="right" className="bg-zinc-800 border-zinc-700">
        <p className="text-xs">{localeConfig.name}</p>
        <p className="text-xs text-zinc-400">
          {locale === 'zh-CN' ? 'Click to switch to English' : '点击切换到中文'}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}

export function Sidebar() {
  const { openTabIds, activeTabId, openTab } = useTabStore();
  const { t } = useLanguage();

  const toolsByCategory = useMemo(() => getToolsByCategory(), []);

  // 按 order 排序分类
  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.order - b.order),
    []
  );

  return (
    <div className="flex h-full w-16 flex-col border-r border-zinc-800 bg-zinc-950">
      {/* Logo 区域 */}
      <div className="flex h-12 items-center justify-center border-b border-zinc-800">
        <Wrench className="h-6 w-6 text-zinc-400" />
      </div>

      {/* 工具图标列表（按分类） */}
      <ScrollArea className="flex-1">
        <div className="flex flex-col py-2">
          {sortedCategories.map((category) => {
            const tools = toolsByCategory.get(category.id) || [];
            if (tools.length === 0) return null;

            const categoryName = t.categories[category.id as keyof typeof t.categories] || category.name;

            return (
              <div key={category.id} className="mb-2">
                {/* 分类标题 */}
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <div className="mb-1 flex h-6 items-center justify-center">
                      <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
                        {categoryName.slice(0, 2)}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-zinc-800 border-zinc-700">
                    <p className="text-xs">{categoryName}</p>
                  </TooltipContent>
                </Tooltip>

                {/* 工具按钮 */}
                <div className="flex flex-col items-center gap-1">
                  {tools.map((tool) => (
                    <ToolButton
                      key={tool.id}
                      tool={tool}
                      isOpen={openTabIds.includes(tool.id)}
                      isActive={activeTabId === tool.id}
                      onClick={() => openTab(tool.id)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* 底部语言切换按钮 */}
      <div className="flex items-center justify-center border-t border-zinc-800 py-2">
        <LanguageSwitcher />
      </div>
    </div>
  );
}
