"use client";

import { useState, useCallback, useMemo } from "react";
import { 
  ToolLayout, 
  ToolHeader, 
  ToolContent,
  ToolSettings,
  SettingsItem,
  ActionGroup
} from "@/components/shared";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowRightLeft, Info, Copy, Check } from "lucide-react";
import {
  float32ToParts,
  float64ToParts,
  binaryToFloat32,
  binaryToFloat64,
  hexToFloat32,
  hexToFloat64,
  getActualExponent,
  formatBinary,
  Float32Parts,
  Float64Parts,
} from "@/lib/ieee754";

type Precision = 32 | 64;
type InputMode = "decimal" | "binary" | "hex";

export default function IEEE754ViewerComponent() {
  const [input, setInput] = useState("3.14");
  const [precision, setPrecision] = useState<Precision>(32);
  const [inputMode, setInputMode] = useState<InputMode>("decimal");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  // 解析结果
  const result = useMemo(() => {
    if (!input.trim()) return null;

    try {
      let value: number;

      if (inputMode === "decimal") {
        value = parseFloat(input);
        if (isNaN(value) && input.toLowerCase() !== "nan") {
          throw new Error("无效的数字");
        }
        if (input.toLowerCase() === "nan") value = NaN;
        if (input.toLowerCase() === "infinity" || input.toLowerCase() === "inf") value = Infinity;
        if (input.toLowerCase() === "-infinity" || input.toLowerCase() === "-inf") value = -Infinity;
      } else if (inputMode === "binary") {
        value = precision === 32 ? binaryToFloat32(input) : binaryToFloat64(input);
      } else {
        value = precision === 32 ? hexToFloat32(input) : hexToFloat64(input);
      }

      setError(null);
      return precision === 32 ? float32ToParts(value) : float64ToParts(value);
    } catch (e) {
      setError(e instanceof Error ? e.message : "解析错误");
      return null;
    }
  }, [input, precision, inputMode]);

  const copyToClipboard = useCallback(async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (e) {
      console.error("复制失败:", e);
    }
  }, []);

  // 示例值
  const examples = [
    { label: "π", value: "3.141592653589793" },
    { label: "e", value: "2.718281828459045" },
    { label: "0.1", value: "0.1" },
    { label: "最大值", value: precision === 32 ? "3.4028235e38" : "1.7976931348623157e308" },
    { label: "最小正数", value: precision === 32 ? "1.17549435e-38" : "2.2250738585072014e-308" },
    { label: "NaN", value: "NaN" },
    { label: "+∞", value: "Infinity" },
    { label: "-∞", value: "-Infinity" },
  ];

  return (
    <ToolLayout>
      <ToolHeader>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-400">精度:</span>
            <div className="flex rounded-lg border border-zinc-700 p-1">
              <button
                onClick={() => setPrecision(32)}
                className={`rounded px-3 py-1 text-sm transition-colors ${
                  precision === 32
                    ? "bg-zinc-700 text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                32位 (float)
              </button>
              <button
                onClick={() => setPrecision(64)}
                className={`rounded px-3 py-1 text-sm transition-colors ${
                  precision === 64
                    ? "bg-zinc-700 text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                64位 (double)
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-400">输入:</span>
            <select
              value={inputMode}
              onChange={(e) => {
                setInputMode(e.target.value as InputMode);
                setInput("");
              }}
              className="rounded border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-white"
            >
              <option value="decimal">十进制</option>
              <option value="binary">二进制</option>
              <option value="hex">十六进制</option>
            </select>
          </div>
        </div>
      </ToolHeader>

      {/* 示例值 */}
      <div className="mb-4 flex flex-wrap gap-2">
        <span className="text-sm text-zinc-500">示例:</span>
        {examples.map((ex) => (
          <button
            key={ex.label}
            onClick={() => {
              setInputMode("decimal");
              setInput(ex.value);
            }}
            className="rounded border border-zinc-700 bg-zinc-800/50 px-2 py-0.5 text-xs text-zinc-400 hover:border-zinc-600 hover:text-zinc-300"
          >
            {ex.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-2 text-sm text-red-400">
          {error}
        </div>
      )}

      <ToolContent layout="vertical">
        {/* 输入区 */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
          <label className="mb-2 block text-sm font-medium text-zinc-400">
            {inputMode === "decimal" && "输入十进制数值"}
            {inputMode === "binary" && `输入 ${precision} 位二进制`}
            {inputMode === "hex" && `输入 ${precision === 32 ? 8 : 16} 位十六进制`}
          </label>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              inputMode === "decimal"
                ? "例如: 3.14, -0.5, 1e10"
                : inputMode === "binary"
                ? `输入 ${precision} 个 0 或 1`
                : `例如: ${precision === 32 ? "40490FDB" : "400921FB54442D18"}`
            }
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 font-mono text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* 结果展示 */}
        {result && (
          <ScrollArea className="flex-1">
            <div className="space-y-4 p-1">
              {/* 数值信息 */}
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                <h3 className="mb-3 text-sm font-medium text-zinc-300">数值信息</h3>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div>
                    <span className="text-xs text-zinc-500">十进制值</span>
                    <p className="font-mono text-white">
                      {result.special === "NaN" ? "NaN" : result.value}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-zinc-500">十六进制</span>
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-white">{result.hex}</p>
                      <button
                        onClick={() => copyToClipboard(result.hex, "hex")}
                        className="text-zinc-500 hover:text-zinc-300"
                      >
                        {copied === "hex" ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-zinc-500">精度</span>
                    <p className="font-mono text-white">{precision} 位</p>
                  </div>
                  {result.special && (
                    <div>
                      <span className="text-xs text-zinc-500">特殊值</span>
                      <p className="font-mono text-yellow-400">{result.special}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 位表示可视化 */}
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                <h3 className="mb-3 text-sm font-medium text-zinc-300">位表示可视化</h3>
                <div className="overflow-x-auto">
                  <div className="flex gap-1 font-mono text-sm">
                    {/* 符号位 */}
                    <div className="flex flex-col items-center">
                      <span className="mb-1 text-xs text-zinc-500">符号</span>
                      <span className="rounded bg-red-500/20 px-2 py-1 text-red-400">
                        {result.binary[0]}
                      </span>
                    </div>
                    {/* 指数位 */}
                    <div className="flex flex-col items-center">
                      <span className="mb-1 text-xs text-zinc-500">指数</span>
                      <span className="rounded bg-green-500/20 px-2 py-1 text-green-400">
                        {precision === 32 ? result.binary.slice(1, 9) : result.binary.slice(1, 12)}
                      </span>
                    </div>
                    {/* 尾数位 */}
                    <div className="flex flex-col items-center">
                      <span className="mb-1 text-xs text-zinc-500">尾数</span>
                      <span className="rounded bg-blue-500/20 px-2 py-1 text-blue-400">
                        {precision === 32 ? result.binary.slice(9) : result.binary.slice(12)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 完整二进制 */}
                <div className="mt-4">
                  <span className="text-xs text-zinc-500">完整二进制:</span>
                  <div className="mt-1 flex items-center gap-2">
                    <code className="rounded bg-zinc-800 px-3 py-1 font-mono text-sm text-zinc-300">
                      {formatBinary(result.binary, precision)}
                    </code>
                    <button
                      onClick={() => copyToClipboard(result.binary, "binary")}
                      className="text-zinc-500 hover:text-zinc-300"
                    >
                      {copied === "binary" ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* 详细解析 */}
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                <h3 className="mb-3 text-sm font-medium text-zinc-300">详细解析</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-4">
                    <span className="w-24 shrink-0 text-zinc-500">符号位 (S)</span>
                    <div>
                      <span className="font-mono text-white">{result.sign}</span>
                      <span className="ml-2 text-zinc-400">
                        ({result.sign === 0 ? "正数" : "负数"})
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="w-24 shrink-0 text-zinc-500">指数位 (E)</span>
                    <div>
                      <span className="font-mono text-white">{result.exponent}</span>
                      <span className="ml-2 text-zinc-400">
                        (偏移后: {getActualExponent(result.exponent, precision)}, 
                        偏移量: {precision === 32 ? 127 : 1023})
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="w-24 shrink-0 text-zinc-500">尾数位 (M)</span>
                    <div>
                      <span className="font-mono text-white">
                        {precision === 32 
                          ? result.mantissa.toString() 
                          : (result as Float64Parts).mantissa.toString()}
                      </span>
                      <span className="ml-2 text-zinc-400">
                        ({precision === 32 ? 23 : 52} bits)
                      </span>
                    </div>
                  </div>
                </div>

                {/* 公式说明 */}
                <div className="mt-4 rounded bg-zinc-800/50 p-3">
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <Info className="h-4 w-4" />
                    <span>
                      计算公式: (-1)^S × 2^(E-{precision === 32 ? 127 : 1023}) × (1.M)
                    </span>
                  </div>
                </div>
              </div>

              {/* C/C++ 代码示例 */}
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                <h3 className="mb-3 text-sm font-medium text-zinc-300">C/C++ 代码示例</h3>
                <pre className="overflow-x-auto rounded bg-zinc-800 p-3 font-mono text-xs text-zinc-300">
{precision === 32 ? `// 32位浮点数位操作
float value = ${result.value}f;
uint32_t bits;
memcpy(&bits, &value, sizeof(float));

// 提取各部分
uint32_t sign = (bits >> 31) & 0x1;      // ${result.sign}
uint32_t exp = (bits >> 23) & 0xFF;      // ${result.exponent}
uint32_t mantissa = bits & 0x7FFFFF;     // ${result.mantissa}

printf("Hex: 0x%08X\\n", bits);  // ${result.hex}` 
: `// 64位浮点数位操作
double value = ${result.value};
uint64_t bits;
memcpy(&bits, &value, sizeof(double));

// 提取各部分
uint64_t sign = (bits >> 63) & 0x1;           // ${result.sign}
uint64_t exp = (bits >> 52) & 0x7FF;          // ${result.exponent}
uint64_t mantissa = bits & 0xFFFFFFFFFFFFF;   // ${(result as Float64Parts).mantissa}

printf("Hex: 0x%016llX\\n", bits);  // ${result.hex}`}
                </pre>
                <button
                  onClick={() => copyToClipboard(
                    precision === 32 
                      ? `float value = ${result.value}f;\nuint32_t bits;\nmemcpy(&bits, &value, sizeof(float));`
                      : `double value = ${result.value};\nuint64_t bits;\nmemcpy(&bits, &value, sizeof(double));`,
                    "code"
                  )}
                  className="mt-2 flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300"
                >
                  {copied === "code" ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                  复制代码
                </button>
              </div>
            </div>
          </ScrollArea>
        )}
      </ToolContent>
    </ToolLayout>
  );
}
