"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ActionGroupProps {
  children: ReactNode;
  className?: string;
  position?: "top" | "center" | "bottom";
}

export function ActionGroup({ 
  children, 
  className,
  position = "top"
}: ActionGroupProps) {
  return (
    <div 
      className={cn(
        "flex flex-wrap items-center gap-2",
        position === "center" && "justify-center",
        position === "bottom" && "mt-auto pt-4",
        className
      )}
    >
      {children}
    </div>
  );
}
