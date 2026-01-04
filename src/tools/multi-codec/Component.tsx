"use client";

import { useState, useCallback, useMemo } from "react";
import { 
  ToolLayout, 
  ToolHeader, 
  ToolContent,
  TextInputPanel,
  TextOutputPanel,
  ActionGroup
} from "@/components/shared";
import { Button } from "@/components/ui/button";
import { ArrowRightLeft, ArrowUpDown } from "lucide-react";

type CodecMode = 
  | "base64" 
  | "url" 
  | "unicode" 
  | "hex" 
  | "binary" 
  | "octal"
  | "base64-to-hex";

interface CodecOption {
  value: CodecMode;
  label: string;
  description: string;
}

const codecOptions: CodecOption[] = [
  { value: "base64", label: "Base64", description: "Base64 编码/解码" },
  { value: "url", label: "URL 编码", description: "URL 编码/解码" },
  { value: "unicode", label: "Unicode", description: "Unicode 转中文/中文转 Unicode" },
  { value: "hex", label: "十六进制", description: "文本与十六进制互转" },
  { value: "binary", label: "二进制", description: "文本与二进制互转" },
  { value: "octal", label: "八进制", description: "文本与八进制互转" },
  { value: "base64-to-hex", label: "进制转换", description: "支持 2/8/10/16/64 进制互转" },
];

// 进制转换选项
const radixOptions = [
  { value: 2, label: "二进制" },
  { value: 8, label: "八进制" },
  { value: 10, label: "十进制" },
  { value: 16, label: "十六进制" },
  { value: 64, label: "Base64" },
];

// Base64 字符表
const BASE64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

// BigInt 进制转换
function bigIntToRadix(num: bigint, radix: number): string {
  if (radix === 64) {
    // Base64 编码
    if (num === 0n) return "A";
    let result = "";
    let n = num;
    while (n > 0n) {
      result = BASE64_CHARS[Number(n % 64n)] + result;
      n = n / 64n;
    }
    return result;
  }
  
  if (num === 0n) return "0";
  const digits = "0123456789abcdef";
  let result = "";
  let n = num;
  const bigRadix = BigInt(radix);
  while (n > 0n) {
    result = digits[Number(n % bigRadix)] + result;
    n = n / bigRadix;
  }
  return result;
}

function radixToBigInt(str: string, radix: number): bigint {
  if (radix === 64) {
    // Base64 解码
    let result = 0n;
    for (const char of str) {
      const index = BASE64_CHARS.indexOf(char);
      if (index === -1) throw new Error(`无效的 Base64 字符: ${char}`);
      result = result * 64n + BigInt(index);
    }
    return result;
  }
  
  return BigInt(parseInt(str, radix) || 0);
}

export default function MultiCodecComponent() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<CodecMode>("base64");
  const [error, setError] = useState<string | null>(null);
  const [fromRadix, setFromRadix] = useState(10);
  const [toRadix, setToRadix] = useState(16);

  const encode = useCallback(() => {
    if (!input.trim()) {
      setOutput("");
      setError(null);
      return;
    }

    try {
      let result = "";
      switch (mode) {
        case "base64":
          result = btoa(unescape(encodeURIComponent(input)));
          break;
        case "url":
          result = encodeURIComponent(input);
          break;
        case "unicode":
          result = input
            .split("")
            .map((char) => "\\u" + char.charCodeAt(0).toString(16).padStart(4, "0"))
            .join("");
          break;
        case "hex":
          result = Array.from(new TextEncoder().encode(input))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join(" ");
          break;
        case "binary":
          result = Array.from(new TextEncoder().encode(input))
            .map((b) => b.toString(2).padStart(8, "0"))
            .join(" ");
          break;
        case "octal":
          result = Array.from(new TextEncoder().encode(input))
            .map((b) => b.toString(8).padStart(3, "0"))
            .join(" ");
          break;
        case "base64-to-hex":
          const num = radixToBigInt(input.trim(), fromRadix);
          result = bigIntToRadix(num, toRadix);
          break;
      }
      setOutput(result);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "编码错误");
      setOutput("");
    }
  }, [input, mode, fromRadix, toRadix]);

  const decode = useCallback(() => {
    if (!input.trim()) {
      setOutput("");
      setError(null);
      return;
    }

    try {
      let result = "";
      switch (mode) {
        case "base64":
          result = decodeURIComponent(escape(atob(input)));
          break;
        case "url":
          result = decodeURIComponent(input);
          break;
        case "unicode":
          result = input.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) =>
            String.fromCharCode(parseInt(hex, 16))
          );
          break;
        case "hex":
          const hexBytes = input.trim().split(/\s+/);
          result = new TextDecoder().decode(
            new Uint8Array(hexBytes.map((b) => parseInt(b, 16)))
          );
          break;
        case "binary":
          const binBytes = input.trim().split(/\s+/);
          result = new TextDecoder().decode(
            new Uint8Array(binBytes.map((b) => parseInt(b, 2)))
          );
          break;
        case "octal":
          const octBytes = input.trim().split(/\s+/);
          result = new TextDecoder().decode(
            new Uint8Array(octBytes.map((b) => parseInt(b, 8)))
          );
          break;
        case "base64-to-hex":
          // 进制转换模式下，解码就是反向转换
          const num = radixToBigInt(input.trim(), toRadix);
          result = bigIntToRadix(num, fromRadix);
          break;
      }
      setOutput(result);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "解码错误");
      setOutput("");
    }
  }, [input, mode, fromRadix, toRadix]);

  const swapRadix = useCallback(() => {
    setFromRadix(toRadix);
    setToRadix(fromRadix);
  }, [fromRadix, toRadix]);

  const currentCodec = useMemo(() => 
    codecOptions.find(o => o.value === mode), 
    [mode]
  );

  return (
    <ToolLayout>
      <ToolHeader>
        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-400">编码类型:</span>
          <select
            value={mode}
            onChange={(e) => {
              setMode(e.target.value as CodecMode);
              setOutput("");
              setError(null);
            }}
            className="rounded border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-white"
          >
            {codecOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <span className="text-xs text-zinc-500">{currentCodec?.description}</span>
        </div>

        {mode === "base64-to-hex" && (
          <div className="flex items-center gap-2">
            <select
              value={fromRadix}
              onChange={(e) => setFromRadix(Number(e.target.value))}
              className="rounded border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-white"
            >
              {radixOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <Button onClick={swapRadix} variant="ghost" size="sm" className="px-2">
              <ArrowUpDown className="h-4 w-4" />
            </Button>
            <select
              value={toRadix}
              onChange={(e) => setToRadix(Number(e.target.value))}
              className="rounded border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-white"
            >
              {radixOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <ActionGroup className="ml-auto">
          <Button onClick={encode} size="sm">
            <ArrowRightLeft className="mr-2 h-4 w-4" />
            编码
          </Button>
          <Button onClick={decode} variant="secondary" size="sm">
            <ArrowRightLeft className="mr-2 h-4 w-4 rotate-180" />
            解码
          </Button>
        </ActionGroup>
      </ToolHeader>

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-2 text-sm text-red-400">
          {error}
        </div>
      )}

      <ToolContent>
        <TextInputPanel
          title="输入"
          value={input}
          onChange={setInput}
          placeholder="输入要编码或解码的内容..."
        />
        <TextOutputPanel
          title="输出"
          value={output}
        />
      </ToolContent>
    </ToolLayout>
  );
}
