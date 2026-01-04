"use client";

import { ReactNode, useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";

interface OutputPanelProps {
  title: ReactNode;
  children: ReactNode;
  className?: string;
  copyValue?: string;
  extra?: ReactNode;
}

export function OutputPanel({ 
  title, 
  children, 
  className,
  copyValue,
  extra
}: OutputPanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!copyValue) return;
    try {
      await navigator.clipboard.writeText(copyValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("复制失败:", e);
    }
  }, [copyValue]);

  return (
    <div className={cn("flex flex-col overflow-hidden rounded-lg border border-zinc-800", className)}>
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-4 py-2">
        <span className="text-sm font-medium text-zinc-400">{title}</span>
        <div className="flex items-center gap-2">
          {extra}
          {copyValue && (
            <Button
              onClick={handleCopy}
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-zinc-500 hover:text-zinc-300"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </Button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}

interface TextOutputPanelProps {
  title: ReactNode;
  value: string;
  className?: string;
  extra?: ReactNode;
}

export function TextOutputPanel({
  title,
  value,
  className,
  extra
}: TextOutputPanelProps) {
  return (
    <OutputPanel 
      title={title} 
      className={className}
      copyValue={value || undefined}
      extra={extra}
    >
      <pre className="h-full w-full whitespace-pre-wrap break-all bg-zinc-950 p-4 font-mono text-sm text-white">
        {value || <span className="text-zinc-500">输出结果将显示在这里</span>}
      </pre>
    </OutputPanel>
  );
}
