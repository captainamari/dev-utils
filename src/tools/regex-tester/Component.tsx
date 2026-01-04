"use client";

import { useState, useCallback, useMemo } from "react";
import { 
  ToolLayout, 
  ToolHeader, 
  ToolContent,
  InputPanel,
  OutputPanel,
  ActionGroup
} from "@/components/shared";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Play, Code, Copy, Check } from "lucide-react";

interface MatchResult {
  index: number;
  match: string;
  groups: string[];
  namedGroups?: Record<string, string>;
}

export default function RegexTesterComponent() {
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState("g");
  const [testText, setTestText] = useState("");
  const [results, setResults] = useState<MatchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showCodeGen, setShowCodeGen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const runTest = useCallback(() => {
    if (!pattern.trim() || !testText) {
      setResults([]);
      setError(null);
      return;
    }

    try {
      const regex = new RegExp(pattern, flags);
      const matches: MatchResult[] = [];

      if (flags.includes("g")) {
        let match;
        while ((match = regex.exec(testText)) !== null) {
          matches.push({
            index: match.index,
            match: match[0],
            groups: match.slice(1),
            namedGroups: match.groups,
          });
          // 防止无限循环
          if (match[0].length === 0) regex.lastIndex++;
        }
      } else {
        const match = regex.exec(testText);
        if (match) {
          matches.push({
            index: match.index,
            match: match[0],
            groups: match.slice(1),
            namedGroups: match.groups,
          });
        }
      }

      setResults(matches);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "正则表达式错误");
      setResults([]);
    }
  }, [pattern, flags, testText]);

  // 高亮显示匹配结果
  const highlightedText = useMemo(() => {
    if (!pattern.trim() || !testText || results.length === 0) {
      return testText;
    }

    try {
      const regex = new RegExp(pattern, flags.includes("g") ? flags : flags + "g");
      const parts: { text: string; isMatch: boolean }[] = [];
      let lastIndex = 0;

      testText.replace(regex, (match, ...args) => {
        const index = args[args.length - 2] as number;
        if (index > lastIndex) {
          parts.push({ text: testText.slice(lastIndex, index), isMatch: false });
        }
        parts.push({ text: match, isMatch: true });
        lastIndex = index + match.length;
        return match;
      });

      if (lastIndex < testText.length) {
        parts.push({ text: testText.slice(lastIndex), isMatch: false });
      }

      return parts;
    } catch {
      return testText;
    }
  }, [pattern, flags, testText, results]);

  // 生成代码片段
  const generateCode = useCallback((lang: "typescript" | "python") => {
    const escapedPattern = pattern.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
    
    if (lang === "typescript") {
      return `const regex = /${pattern}/${flags};
const text = '${testText.replace(/'/g, "\\'")}';

// 测试是否匹配
const isMatch = regex.test(text);

// 获取所有匹配
const matches = text.match(regex);

// 使用 exec 获取详细信息
let match;
while ((match = regex.exec(text)) !== null) {
  console.log('Match:', match[0]);
  console.log('Index:', match.index);
  console.log('Groups:', match.slice(1));
}`;
    } else {
      return `import re

pattern = r'${escapedPattern}'
text = '''${testText}'''
flags = ${flags.includes("i") ? "re.IGNORECASE" : "0"}${flags.includes("m") ? " | re.MULTILINE" : ""}${flags.includes("s") ? " | re.DOTALL" : ""}

# 测试是否匹配
is_match = bool(re.search(pattern, text, flags))

# 获取所有匹配
matches = re.findall(pattern, text, flags)

# 使用 finditer 获取详细信息
for match in re.finditer(pattern, text, flags):
    print(f'Match: {match.group()}')
    print(f'Index: {match.start()}')
    print(f'Groups: {match.groups()}')`;
    }
  }, [pattern, flags, testText]);

  const copyCode = useCallback(async (lang: "typescript" | "python") => {
    try {
      await navigator.clipboard.writeText(generateCode(lang));
      setCopied(lang);
      setTimeout(() => setCopied(null), 2000);
    } catch (e) {
      console.error("复制失败:", e);
    }
  }, [generateCode]);

  return (
    <ToolLayout>
      <ToolHeader>
        <div className="flex flex-1 items-center gap-2">
          <span className="text-sm text-zinc-400">正则:</span>
          <div className="flex flex-1 items-center rounded border border-zinc-700 bg-zinc-800">
            <span className="px-2 text-zinc-500">/</span>
            <input
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="输入正则表达式"
              className="flex-1 bg-transparent py-1.5 font-mono text-sm text-white placeholder-zinc-500 focus:outline-none"
            />
            <span className="px-2 text-zinc-500">/</span>
            <input
              type="text"
              value={flags}
              onChange={(e) => setFlags(e.target.value)}
              placeholder="flags"
              className="w-16 bg-transparent py-1.5 font-mono text-sm text-white placeholder-zinc-500 focus:outline-none"
            />
          </div>
        </div>

        <ActionGroup>
          <Button onClick={runTest} size="sm">
            <Play className="mr-2 h-4 w-4" />
            测试
          </Button>
          <Button 
            onClick={() => setShowCodeGen(!showCodeGen)} 
            variant={showCodeGen ? "secondary" : "outline"} 
            size="sm"
          >
            <Code className="mr-2 h-4 w-4" />
            生成代码
          </Button>
        </ActionGroup>
      </ToolHeader>

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-2 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* 代码生成面板 */}
      {showCodeGen && pattern && (
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50">
            <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2">
              <span className="text-sm font-medium text-zinc-400">TypeScript</span>
              <Button onClick={() => copyCode("typescript")} variant="ghost" size="sm" className="h-7 px-2">
                {copied === "typescript" ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
              </Button>
            </div>
            <pre className="overflow-auto p-4 font-mono text-xs text-zinc-300">
              {generateCode("typescript")}
            </pre>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50">
            <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2">
              <span className="text-sm font-medium text-zinc-400">Python</span>
              <Button onClick={() => copyCode("python")} variant="ghost" size="sm" className="h-7 px-2">
                {copied === "python" ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
              </Button>
            </div>
            <pre className="overflow-auto p-4 font-mono text-xs text-zinc-300">
              {generateCode("python")}
            </pre>
          </div>
        </div>
      )}

      <ToolContent>
        {/* 输入区 */}
        <InputPanel 
          title="测试文本" 
          onClear={testText ? () => setTestText("") : undefined}
        >
          <textarea
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            placeholder="输入要测试的文本..."
            className="h-full w-full resize-none bg-zinc-950 p-4 font-mono text-sm text-white placeholder-zinc-500 focus:outline-none"
          />
        </InputPanel>

        {/* 结果区 */}
        <div className="flex flex-col gap-4 overflow-hidden">
          {/* 高亮预览 */}
          <OutputPanel title="匹配高亮" className="flex-1">
            <ScrollArea className="h-full">
              <div className="whitespace-pre-wrap break-all p-4 font-mono text-sm">
                {typeof highlightedText === "string" ? (
                  <span className="text-zinc-300">{highlightedText || "输入文本后查看匹配结果"}</span>
                ) : (
                  highlightedText.map((part, i) => (
                    <span
                      key={i}
                      className={part.isMatch ? "rounded bg-yellow-500/30 text-yellow-300" : "text-zinc-300"}
                    >
                      {part.text}
                    </span>
                  ))
                )}
              </div>
            </ScrollArea>
          </OutputPanel>

          {/* 匹配详情 */}
          <OutputPanel title={`匹配结果 (${results.length})`} className="flex-1">
            <ScrollArea className="h-full">
              <div className="p-4">
                {results.length === 0 ? (
                  <span className="text-sm text-zinc-500">暂无匹配结果</span>
                ) : (
                  <div className="space-y-3">
                    {results.map((result, i) => (
                      <div key={i} className="rounded border border-zinc-800 bg-zinc-900/50 p-3">
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-zinc-500">#{i + 1}</span>
                          <span className="text-zinc-400">位置: {result.index}</span>
                          <code className="rounded bg-zinc-800 px-2 py-0.5 text-green-400">
                            {result.match}
                          </code>
                        </div>
                        {result.groups.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {result.groups.map((group, j) => (
                              <span key={j} className="rounded bg-zinc-800 px-2 py-0.5 text-xs">
                                <span className="text-zinc-500">组{j + 1}:</span>{" "}
                                <span className="text-blue-400">{group}</span>
                              </span>
                            ))}
                          </div>
                        )}
                        {result.namedGroups && Object.keys(result.namedGroups).length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {Object.entries(result.namedGroups).map(([name, value]) => (
                              <span key={name} className="rounded bg-zinc-800 px-2 py-0.5 text-xs">
                                <span className="text-zinc-500">{name}:</span>{" "}
                                <span className="text-purple-400">{value}</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </OutputPanel>
        </div>
      </ToolContent>
    </ToolLayout>
  );
}
