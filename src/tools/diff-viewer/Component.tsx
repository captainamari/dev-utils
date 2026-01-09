"use client";

import { useState, useCallback } from "react";
import { DiffEditor } from "@monaco-editor/react";
import { ToolLayout, ToolHeader, ActionGroup } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Columns2, Rows2, Eye, EyeOff, Trash2 } from "lucide-react";
import { useLanguage } from "@/i18n";

export default function DiffViewerComponent() {
  const [original, setOriginal] = useState("");
  const [modified, setModified] = useState("");
  const [renderSideBySide, setRenderSideBySide] = useState(true);
  const [ignoreTrimWhitespace, setIgnoreTrimWhitespace] = useState(false);
  const [language, setLanguage] = useState("plaintext");
  const { t } = useLanguage();

  const languageOptions = [
    { value: "plaintext", label: t.diffViewer.plaintext },
    { value: "javascript", label: "JavaScript" },
    { value: "typescript", label: "TypeScript" },
    { value: "json", label: "JSON" },
    { value: "html", label: "HTML" },
    { value: "css", label: "CSS" },
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
    { value: "cpp", label: "C++" },
    { value: "csharp", label: "C#" },
    { value: "go", label: "Go" },
    { value: "rust", label: "Rust" },
    { value: "sql", label: "SQL" },
    { value: "markdown", label: "Markdown" },
    { value: "yaml", label: "YAML" },
    { value: "xml", label: "XML" },
  ];

  const handleClear = useCallback(() => {
    setOriginal("");
    setModified("");
  }, []);

  const handleSwap = useCallback(() => {
    setOriginal(modified);
    setModified(original);
  }, [original, modified]);

  return (
    <ToolLayout className="p-0">
      <ToolHeader className="border-b border-zinc-800 bg-zinc-950 px-4 py-3 mb-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-400">{t.diffViewer.language}:</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="rounded border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-white"
            >
              {languageOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 rounded-lg border border-zinc-700 p-1">
            <Button
              onClick={() => setRenderSideBySide(true)}
              variant={renderSideBySide ? "secondary" : "ghost"}
              size="sm"
              className="h-7 px-2"
              title={t.diffViewer.sideBySide}
            >
              <Columns2 className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => setRenderSideBySide(false)}
              variant={!renderSideBySide ? "secondary" : "ghost"}
              size="sm"
              className="h-7 px-2"
              title={t.diffViewer.inline}
            >
              <Rows2 className="h-4 w-4" />
            </Button>
          </div>

          <Button
            onClick={() => setIgnoreTrimWhitespace(!ignoreTrimWhitespace)}
            variant={ignoreTrimWhitespace ? "secondary" : "outline"}
            size="sm"
            className="gap-2"
          >
            {ignoreTrimWhitespace ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
            {ignoreTrimWhitespace ? t.diffViewer.ignoreWhitespace : t.diffViewer.showWhitespace}
          </Button>
        </div>

        <ActionGroup className="ml-auto">
          <Button onClick={handleSwap} variant="outline" size="sm">
            {t.common.swap}
          </Button>
          <Button onClick={handleClear} variant="outline" size="sm">
            <Trash2 className="mr-2 h-4 w-4" />
            {t.common.clear}
          </Button>
        </ActionGroup>
      </ToolHeader>

      {/* 标签头 */}
      <div className="flex border-b border-zinc-800 bg-zinc-950">
        <div className="flex-1 border-r border-zinc-800 px-4 py-2">
          <span className="text-sm font-medium text-zinc-400">{t.diffViewer.originalText}</span>
        </div>
        <div className="flex-1 px-4 py-2">
          <span className="text-sm font-medium text-zinc-400">{t.diffViewer.modifiedText}</span>
        </div>
      </div>

      {/* Diff 编辑器 */}
      <div className="flex-1">
        <DiffEditor
          height="100%"
          language={language}
          original={original}
          modified={modified}
          theme="vs-dark"
          options={{
            renderSideBySide,
            ignoreTrimWhitespace,
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            wordWrap: "on",
            automaticLayout: true,
            readOnly: false,
            originalEditable: true,
            padding: { top: 12 },
          }}
          onMount={(editor) => {
            // 获取原始和修改后的编辑器实例
            const originalEditor = editor.getOriginalEditor();
            const modifiedEditor = editor.getModifiedEditor();

            // 监听内容变化
            originalEditor.onDidChangeModelContent(() => {
              setOriginal(originalEditor.getValue());
            });
            modifiedEditor.onDidChangeModelContent(() => {
              setModified(modifiedEditor.getValue());
            });
          }}
        />
      </div>
    </ToolLayout>
  );
}
