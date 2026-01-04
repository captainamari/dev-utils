"use client";

import { useEffect } from "react";
import { Sidebar, TabBar, Workspace } from "@/components/layout";
import { TooltipProvider } from "@/components/ui/tooltip";
import { initializeTools } from "@/registry/tools";

// 初始化工具注册
initializeTools();

export default function Home() {
  useEffect(() => {
    // 防止页面滚动
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <TooltipProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-zinc-950">
        {/* 左侧边栏 */}
        <Sidebar />

        {/* 主内容区 */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* 顶部标签栏 */}
          <TabBar />

          {/* 工作区 */}
          <div className="flex-1 overflow-hidden">
            <Workspace />
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
