"use client";

import { cn } from "@/lib/utils";
import { useTabStore } from "@/store/useTabStore";
import { getTool } from "@/registry";
import { X } from "lucide-react";
import { useRef, useEffect } from "react";

export function TabBar() {
  const { openTabIds, activeTabId, setActiveTab, closeTab } = useTabStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);

  // 当激活的 Tab 改变时，滚动到可视区域
  useEffect(() => {
    if (activeTabRef.current && scrollRef.current) {
      activeTabRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      });
    }
  }, [activeTabId]);

  if (openTabIds.length === 0) {
    return (
      <div className="flex h-10 items-center border-b border-zinc-800 bg-zinc-950 px-4">
        <span className="text-sm text-zinc-500">选择一个工具开始使用</span>
      </div>
    );
  }

  return (
    <div className="flex h-10 items-center border-b border-zinc-800 bg-zinc-950">
      <div
        ref={scrollRef}
        className="flex h-full flex-1 items-end overflow-x-auto scrollbar-hide"
      >
        {openTabIds.map((tabId) => {
          const tool = getTool(tabId);
          if (!tool) return null;

          const isActive = activeTabId === tabId;
          const Icon = tool.icon;

          return (
            <button
              key={tabId}
              ref={isActive ? activeTabRef : null}
              onClick={() => setActiveTab(tabId)}
              className={cn(
                "group relative flex h-9 min-w-[120px] max-w-[180px] items-center gap-2 border-r border-zinc-800 px-3 transition-colors",
                isActive
                  ? "bg-zinc-900 text-white"
                  : "bg-zinc-950 text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-300"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate text-sm">{tool.name}</span>
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tabId);
                }}
                className={cn(
                  "ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded transition-colors",
                  "hover:bg-zinc-700",
                  isActive
                    ? "text-zinc-400 hover:text-white"
                    : "text-zinc-500 opacity-0 group-hover:opacity-100"
                )}
              >
                <X className="h-3 w-3" />
              </span>
              {/* 激活状态底部指示线 */}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-500" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
