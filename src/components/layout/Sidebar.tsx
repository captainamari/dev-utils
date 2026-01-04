"use client";

import { cn } from "@/lib/utils";
import { useTabStore } from "@/store/useTabStore";
import { getAllTools } from "@/registry";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Wrench } from "lucide-react";

export function Sidebar() {
  const { openTabIds, activeTabId, openTab } = useTabStore();
  const tools = getAllTools();

  return (
    <div className="flex h-full w-16 flex-col border-r border-zinc-800 bg-zinc-950">
      {/* Logo 区域 */}
      <div className="flex h-12 items-center justify-center border-b border-zinc-800">
        <Wrench className="h-6 w-6 text-zinc-400" />
      </div>

      <Separator className="bg-zinc-800" />

      {/* 工具图标列表 */}
      <ScrollArea className="flex-1">
        <div className="flex flex-col items-center gap-1 py-2">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const isOpen = openTabIds.includes(tool.id);
            const isActive = activeTabId === tool.id;

            return (
              <Tooltip key={tool.id} delayDuration={0}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => openTab(tool.id)}
                    className={cn(
                      "relative flex h-12 w-12 items-center justify-center rounded-lg transition-all duration-200",
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
                          "absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full transition-all",
                          isActive ? "bg-blue-500" : "bg-zinc-600"
                        )}
                      />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-zinc-800 border-zinc-700">
                  <p className="font-medium">{tool.name}</p>
                  <p className="text-xs text-zinc-400">{tool.description}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
