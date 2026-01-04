"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ToolLayoutProps {
  children: ReactNode;
  className?: string;
}

export function ToolLayout({ children, className }: ToolLayoutProps) {
  return (
    <div className={cn("flex h-full flex-col p-4", className)}>
      {children}
    </div>
  );
}

interface ToolHeaderProps {
  children: ReactNode;
  className?: string;
}

export function ToolHeader({ children, className }: ToolHeaderProps) {
  return (
    <div className={cn("mb-4 flex flex-wrap items-center gap-4", className)}>
      {children}
    </div>
  );
}

interface ToolContentProps {
  children: ReactNode;
  className?: string;
  layout?: "horizontal" | "vertical";
}

export function ToolContent({ 
  children, 
  className,
  layout = "horizontal" 
}: ToolContentProps) {
  return (
    <div 
      className={cn(
        "flex-1 overflow-hidden",
        layout === "horizontal" ? "grid grid-cols-2 gap-4" : "flex flex-col gap-4",
        className
      )}
    >
      {children}
    </div>
  );
}
