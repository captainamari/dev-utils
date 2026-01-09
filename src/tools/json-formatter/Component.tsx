"use client";

import { useState, useCallback } from "react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Copy, Check, Minimize2, Maximize2, AlertCircle, Trash2 } from "lucide-react";
import { useLanguage } from "@/i18n";

/**
 * 将 Python 风格的字典字符串转换为标准 JSON
 * 处理：单引号 -> 双引号，True/False -> true/false，None -> null
 */
function pythonDictToJson(input: string): string {
  let result = input;
  
  // 状态机解析，正确处理字符串内外的内容
  let output = "";
  let i = 0;
  
  while (i < result.length) {
    const char = result[i];
    
    // 处理单引号字符串
    if (char === "'") {
      output += '"';
      i++;
      // 读取字符串内容直到遇到未转义的单引号
      while (i < result.length) {
        const innerChar = result[i];
        if (innerChar === "\\") {
          // 处理转义字符
          if (i + 1 < result.length) {
            const nextChar = result[i + 1];
            if (nextChar === "'") {
              // \' -> ' (在 JSON 中单引号不需要转义)
              output += "'";
              i += 2;
            } else if (nextChar === '"') {
              // \" -> \" (保持双引号转义)
              output += '\\"';
              i += 2;
            } else {
              // 其他转义字符保持原样
              output += innerChar + nextChar;
              i += 2;
            }
          } else {
            output += innerChar;
            i++;
          }
        } else if (innerChar === '"') {
          // 字符串内的双引号需要转义
          output += '\\"';
          i++;
        } else if (innerChar === "'") {
          // 字符串结束
          output += '"';
          i++;
          break;
        } else {
          output += innerChar;
          i++;
        }
      }
    }
    // 处理双引号字符串（保持原样，但需要跳过内容）
    else if (char === '"') {
      output += char;
      i++;
      while (i < result.length) {
        const innerChar = result[i];
        if (innerChar === "\\") {
          output += innerChar;
          i++;
          if (i < result.length) {
            output += result[i];
            i++;
          }
        } else if (innerChar === '"') {
          output += innerChar;
          i++;
          break;
        } else {
          output += innerChar;
          i++;
        }
      }
    }
    // 处理 True/False/None（仅在字符串外部）
    else if (result.slice(i, i + 4) === "True" && !isIdentifierChar(result[i - 1]) && !isIdentifierChar(result[i + 4])) {
      output += "true";
      i += 4;
    } else if (result.slice(i, i + 5) === "False" && !isIdentifierChar(result[i - 1]) && !isIdentifierChar(result[i + 5])) {
      output += "false";
      i += 5;
    } else if (result.slice(i, i + 4) === "None" && !isIdentifierChar(result[i - 1]) && !isIdentifierChar(result[i + 4])) {
      output += "null";
      i += 4;
    }
    else {
      output += char;
      i++;
    }
  }
  
  return output;
}

function isIdentifierChar(char: string | undefined): boolean {
  if (!char) return false;
  return /[a-zA-Z0-9_]/.test(char);
}

/**
 * 智能解析 JSON，支持标准 JSON 和 Python 字典格式
 */
function smartParseJson(input: string): unknown {
  // 先尝试标准 JSON 解析
  try {
    return JSON.parse(input);
  } catch {
    // 标准解析失败，尝试 Python 字典格式转换
    const converted = pythonDictToJson(input);
    return JSON.parse(converted);
  }
}

export default function JsonFormatterComponent() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [indentSize, setIndentSize] = useState(2);
  const { t } = useLanguage();

  const formatJson = useCallback(() => {
    if (!input.trim()) {
      setOutput("");
      setError(null);
      return;
    }

    try {
      const parsed = smartParseJson(input);
      const formatted = JSON.stringify(parsed, null, indentSize);
      setOutput(formatted);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : t.jsonFormatter.parseError);
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
      const parsed = smartParseJson(input);
      const minified = JSON.stringify(parsed);
      setOutput(minified);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : t.jsonFormatter.parseError);
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

  const clearAll = useCallback(() => {
    setInput("");
    setOutput("");
    setError(null);
  }, []);

  return (
    <div className="flex h-full flex-col p-4">
      {/* 工具栏 */}
      <div className="mb-4 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Button onClick={formatJson} size="sm" className="gap-2">
            <Maximize2 className="h-4 w-4" />
            {t.common.format}
          </Button>
          <Button onClick={minifyJson} variant="secondary" size="sm" className="gap-2">
            <Minimize2 className="h-4 w-4" />
            {t.common.minify}
          </Button>
          <Button onClick={clearAll} variant="ghost" size="sm" className="gap-2 text-zinc-400 hover:text-white">
            <Trash2 className="h-4 w-4" />
            {t.common.clear}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-400">{t.common.indent}:</span>
          <select
            value={indentSize}
            onChange={(e) => setIndentSize(Number(e.target.value))}
            className="rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-sm text-white"
          >
            <option value={2}>2 {t.common.spaces}</option>
            <option value={4}>4 {t.common.spaces}</option>
            <option value={1}>{t.common.tab}</option>
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
                {t.common.copied}
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                {t.common.copyResult}
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
            <span className="text-sm font-medium text-zinc-400">{t.jsonFormatter.inputJson}</span>
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
            <span className="text-sm font-medium text-zinc-400">{t.jsonFormatter.outputResult}</span>
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
