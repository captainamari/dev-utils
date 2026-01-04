"use client";

import { ReactNode, useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface InputPanelProps {
  title: ReactNode;
  children: ReactNode;
  className?: string;
  onClear?: () => void;
  extra?: ReactNode;
}

export function InputPanel({ 
  title, 
  children, 
  className,
  onClear,
  extra
}: InputPanelProps) {
  return (
    <div className={cn("flex flex-col overflow-hidden rounded-lg border border-zinc-800", className)}>
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-4 py-2">
        <span className="text-sm font-medium text-zinc-400">{title}</span>
        <div className="flex items-center gap-2">
          {extra}
          {onClear && (
            <Button
              onClick={onClear}
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-zinc-500 hover:text-zinc-300"
            >
              <Trash2 className="h-3.5 w-3.5" />
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

interface TextInputPanelProps {
  title: ReactNode;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  extra?: ReactNode;
}

export function TextInputPanel({
  title,
  value,
  onChange,
  placeholder,
  className,
  extra
}: TextInputPanelProps) {
  const handleClear = useCallback(() => {
    onChange("");
  }, [onChange]);

  return (
    <InputPanel 
      title={title} 
      className={className}
      onClear={value ? handleClear : undefined}
      extra={extra}
    >
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-full w-full resize-none bg-zinc-950 p-4 font-mono text-sm text-white placeholder-zinc-500 focus:outline-none"
      />
    </InputPanel>
  );
}
