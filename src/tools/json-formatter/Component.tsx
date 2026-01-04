"use client";

import { useState, useCallback } from "react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Copy, Check, Minimize2, Maximize2, AlertCircle } from "lucide-react";

export default function JsonFormatterComponent() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [indentSize, setIndentSize] = useState(2);

  const formatJson = useCallback(() => {
    if (!input.trim()) {
      setOutput("");
      setError(null);
      return;
    }

    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, indentSize);
      setOutput(formatted);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "JSON 解析错误");
      setOutput("");
    }
  }, [input, indentSize]);

  const minifyJson = useCallback(() => {
    if (!input.trim()) {
      setOutput("");
      setError(null);
      return;
    }

    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      setOutput(minified);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "JSON 解析错误");
      setOutput("");
    }
  }, [input]);

  const copyToClipboard = useCallback(async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("复制失败:", e);
    }
  }, [output]);

  const handleInputChange = useCallback((value: string | undefined) => {
    setInput(value || "");
    setError(null);
  }, []);

  return (
    <div className="flex h-full flex-col p-4">
      {/* 工具栏 */}
      <div className="mb-4 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Button onClick={formatJson} size="sm" className="gap-2">
            <Maximize2 className="h-4 w-4" />
            格式化
          </Button>
          <Button onClick={minifyJson} variant="secondary" size="sm" className="gap-2">
            <Minimize2 className="h-4 w-4" />
            压缩
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-400">缩进:</span>
          <select
            value={indentSize}
            onChange={(e) => setIndentSize(Number(e.target.value))}
            className="rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-sm text-white"
          >
            <option value={2}>2 空格</option>
            <option value={4}>4 空格</option>
            <option value={1}>Tab</option>
          </select>
        </div>

        {output && (
          <Button
            onClick={copyToClipboard}
            variant="outline"
            size="sm"
            className="ml-auto gap-2"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-green-500" />
                已复制
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                复制结果
              </>
            )}
          </Button>
        )}
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-2 text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* 编辑器区域 */}
      <div className="grid flex-1 grid-cols-2 gap-4">
        {/* 输入区 */}
        <div className="flex flex-col overflow-hidden rounded-lg border border-zinc-800">
          <div className="border-b border-zinc-800 bg-zinc-900 px-4 py-2">
            <span className="text-sm font-medium text-zinc-400">输入 JSON</span>
          </div>
          <div className="flex-1">
            <Editor
              height="100%"
              defaultLanguage="json"
              value={input}
              onChange={handleInputChange}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                wordWrap: "on",
                automaticLayout: true,
                tabSize: 2,
                padding: { top: 12 },
              }}
            />
          </div>
        </div>

        {/* 输出区 */}
        <div className="flex flex-col overflow-hidden rounded-lg border border-zinc-800">
          <div className="border-b border-zinc-800 bg-zinc-900 px-4 py-2">
            <span className="text-sm font-medium text-zinc-400">输出结果</span>
          </div>
          <div className="flex-1">
            <Editor
              height="100%"
              defaultLanguage="json"
              value={output}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                wordWrap: "on",
                automaticLayout: true,
                readOnly: true,
                tabSize: 2,
                padding: { top: 12 },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
