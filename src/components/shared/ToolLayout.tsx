"use client";

import { ReactNode, useState, createContext, useContext, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { X, Settings, Copy, Check, Trash2, Play, RotateCcw } from "lucide-react";

// Context for tool actions
interface ToolContextValue {
  onCopy?: () => void;
  onClear?: () => void;
  onExecute?: () => void;
  onReset?: () => void;
  isSettingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
}

const ToolContext = createContext<ToolContextValue>({
  isSettingsOpen: false,
  setSettingsOpen: () => {},
});

export const useToolContext = () => useContext(ToolContext);

// Main Layout
interface ToolLayoutProps {
  children: ReactNode;
  className?: string;
  onCopy?: () => void;
  onClear?: () => void;
  onExecute?: () => void;
  onReset?: () => void;
}

export function ToolLayout({ 
  children, 
  className,
  onCopy,
  onClear,
  onExecute,
  onReset,
}: ToolLayoutProps) {
  const [isSettingsOpen, setSettingsOpen] = useState(false);

  return (
    <ToolContext.Provider value={{ 
      onCopy, 
      onClear, 
      onExecute, 
      onReset,
      isSettingsOpen, 
      setSettingsOpen 
    }}>
      <div className={cn("flex h-full flex-col p-4", className)}>
        {children}
      </div>
    </ToolContext.Provider>
  );
}

// Header with title and actions
interface ToolHeaderProps {
  children?: ReactNode;
  className?: string;
  title?: string;
  description?: string;
  showSettings?: boolean;
  showActions?: boolean;
}

export function ToolHeader({ 
  children, 
  className,
  title,
  description,
  showSettings = false,
  showActions = false,
}: ToolHeaderProps) {
  const { onCopy, onClear, onExecute, onReset, setSettingsOpen } = useToolContext();
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (onCopy) {
      onCopy();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [onCopy]);

  return (
    <div className={cn("mb-4 flex flex-wrap items-center gap-4", className)}>
      {(title || description) && (
        <div className="mr-auto">
          {title && <h2 className="text-lg font-semibold text-white">{title}</h2>}
          {description && <p className="text-sm text-zinc-400">{description}</p>}
        </div>
      )}
      
      {children}

      {showActions && (
        <div className="flex items-center gap-2 ml-auto">
          {onExecute && (
            <Button onClick={onExecute} size="sm">
              <Play className="mr-2 h-4 w-4" />
              执行
            </Button>
          )}
          {onCopy && (
            <Button onClick={handleCopy} variant="outline" size="sm">
              {copied ? <Check className="mr-2 h-4 w-4 text-green-500" /> : <Copy className="mr-2 h-4 w-4" />}
              复制
            </Button>
          )}
          {onClear && (
            <Button onClick={onClear} variant="outline" size="sm">
              <Trash2 className="mr-2 h-4 w-4" />
              清空
            </Button>
          )}
          {onReset && (
            <Button onClick={onReset} variant="ghost" size="sm">
              <RotateCcw className="mr-2 h-4 w-4" />
              重置
            </Button>
          )}
        </div>
      )}

      {showSettings && (
        <Button 
          onClick={() => setSettingsOpen(true)} 
          variant="ghost" 
          size="sm"
          className="ml-2"
        >
          <Settings className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

// Content area with responsive layout
interface ToolContentProps {
  children: ReactNode;
  className?: string;
  layout?: "horizontal" | "vertical" | "responsive";
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
        layout === "horizontal" && "grid grid-cols-2 gap-4",
        layout === "vertical" && "flex flex-col gap-4",
        layout === "responsive" && "grid grid-cols-1 gap-4 lg:grid-cols-2",
        className
      )}
    >
      {children}
    </div>
  );
}

// Settings Drawer
interface ToolSettingsProps {
  children: ReactNode;
  title?: string;
}

export function ToolSettings({ children, title = "设置" }: ToolSettingsProps) {
  const { isSettingsOpen, setSettingsOpen } = useToolContext();

  if (!isSettingsOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40 bg-black/50"
        onClick={() => setSettingsOpen(false)}
      />
      
      {/* Drawer */}
      <div className="fixed right-0 top-0 z-50 h-full w-80 border-l border-zinc-800 bg-zinc-900 shadow-xl">
        <div className="flex h-12 items-center justify-between border-b border-zinc-800 px-4">
          <span className="font-medium text-white">{title}</span>
          <Button 
            onClick={() => setSettingsOpen(false)} 
            variant="ghost" 
            size="sm"
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="overflow-auto p-4">
          {children}
        </div>
      </div>
    </>
  );
}

// Settings Item
interface SettingsItemProps {
  label: string;
  description?: string;
  children: ReactNode;
}

export function SettingsItem({ label, description, children }: SettingsItemProps) {
  return (
    <div className="mb-4">
      <label className="mb-1 block text-sm font-medium text-zinc-300">{label}</label>
      {description && <p className="mb-2 text-xs text-zinc-500">{description}</p>}
      {children}
    </div>
  );
}

// Footer area
interface ToolFooterProps {
  children: ReactNode;
  className?: string;
}

export function ToolFooter({ children, className }: ToolFooterProps) {
  return (
    <div className={cn("mt-4 flex items-center gap-4 border-t border-zinc-800 pt-4", className)}>
      {children}
    </div>
  );
}
