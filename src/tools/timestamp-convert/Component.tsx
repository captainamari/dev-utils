"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check, RefreshCw, ArrowRightLeft } from "lucide-react";

export default function TimestampConvertComponent() {
  const [timestamp, setTimestamp] = useState("");
  const [datetime, setDatetime] = useState("");
  const [currentTimestamp, setCurrentTimestamp] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);
  const [unit, setUnit] = useState<"s" | "ms">("s");

  // 更新当前时间戳
  useEffect(() => {
    const updateCurrent = () => {
      setCurrentTimestamp(Math.floor(Date.now() / 1000));
    };
    updateCurrent();
    const interval = setInterval(updateCurrent, 1000);
    return () => clearInterval(interval);
  }, []);

  // 时间戳转日期
  const timestampToDate = useCallback(() => {
    if (!timestamp.trim()) return;
    try {
      let ts = parseInt(timestamp, 10);
      if (isNaN(ts)) return;

      // 如果是秒级时间戳，转换为毫秒
      if (unit === "s") {
        ts = ts * 1000;
      }

      const date = new Date(ts);
      if (isNaN(date.getTime())) return;

      // 格式化为本地时间字符串
      const formatted = date.toLocaleString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
      setDatetime(formatted);
    } catch (e) {
      console.error(e);
    }
  }, [timestamp, unit]);

  // 日期转时间戳
  const dateToTimestamp = useCallback(() => {
    if (!datetime.trim()) return;
    try {
      const date = new Date(datetime);
      if (isNaN(date.getTime())) return;

      const ts = unit === "s" 
        ? Math.floor(date.getTime() / 1000)
        : date.getTime();
      setTimestamp(ts.toString());
    } catch (e) {
      console.error(e);
    }
  }, [datetime, unit]);

  // 使用当前时间戳
  const useCurrentTimestamp = useCallback(() => {
    const ts = unit === "s" ? currentTimestamp : currentTimestamp * 1000;
    setTimestamp(ts.toString());
    const date = new Date(currentTimestamp * 1000);
    setDatetime(
      date.toLocaleString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })
    );
  }, [currentTimestamp, unit]);

  // 复制到剪贴板
  const copyToClipboard = useCallback(async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (e) {
      console.error("复制失败:", e);
    }
  }, []);

  return (
    <div className="flex h-full flex-col p-6">
      <div className="mx-auto w-full max-w-2xl space-y-6">
        {/* 当前时间戳显示 */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">当前 Unix 时间戳</p>
              <p className="mt-1 font-mono text-2xl text-white">
                {currentTimestamp}
              </p>
            </div>
            <Button onClick={useCurrentTimestamp} variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              使用当前时间
            </Button>
          </div>
        </div>

        {/* 单位选择 */}
        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-400">时间戳单位:</span>
          <div className="flex rounded-lg border border-zinc-700 p-1">
            <button
              onClick={() => setUnit("s")}
              className={`rounded px-4 py-1 text-sm transition-colors ${
                unit === "s"
                  ? "bg-zinc-700 text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              秒 (s)
            </button>
            <button
              onClick={() => setUnit("ms")}
              className={`rounded px-4 py-1 text-sm transition-colors ${
                unit === "ms"
                  ? "bg-zinc-700 text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              毫秒 (ms)
            </button>
          </div>
        </div>

        {/* 转换区域 */}
        <div className="grid gap-4">
          {/* 时间戳输入 */}
          <div className="rounded-lg border border-zinc-800 p-4">
            <label className="mb-2 block text-sm font-medium text-zinc-400">
              Unix 时间戳
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={timestamp}
                onChange={(e) => setTimestamp(e.target.value)}
                placeholder={`输入时间戳 (${unit === "s" ? "秒" : "毫秒"})`}
                className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 font-mono text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
              />
              <Button onClick={timestampToDate} size="sm" className="shrink-0">
                <ArrowRightLeft className="mr-2 h-4 w-4" />
                转换
              </Button>
              {timestamp && (
                <Button
                  onClick={() => copyToClipboard(timestamp, "timestamp")}
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                >
                  {copied === "timestamp" ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* 日期时间输入 */}
          <div className="rounded-lg border border-zinc-800 p-4">
            <label className="mb-2 block text-sm font-medium text-zinc-400">
              日期时间
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={datetime}
                onChange={(e) => setDatetime(e.target.value)}
                placeholder="输入日期时间 (如: 2024-01-01 12:00:00)"
                className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 font-mono text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
              />
              <Button onClick={dateToTimestamp} size="sm" className="shrink-0">
                <ArrowRightLeft className="mr-2 h-4 w-4" />
                转换
              </Button>
              {datetime && (
                <Button
                  onClick={() => copyToClipboard(datetime, "datetime")}
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                >
                  {copied === "datetime" ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* 常用时间戳参考 */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-4">
          <h3 className="mb-3 text-sm font-medium text-zinc-400">常用时间戳参考</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-500">今天开始</span>
              <span className="font-mono text-zinc-300">
                {Math.floor(new Date().setHours(0, 0, 0, 0) / 1000)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">今天结束</span>
              <span className="font-mono text-zinc-300">
                {Math.floor(new Date().setHours(23, 59, 59, 999) / 1000)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">一小时后</span>
              <span className="font-mono text-zinc-300">
                {currentTimestamp + 3600}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">一天后</span>
              <span className="font-mono text-zinc-300">
                {currentTimestamp + 86400}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
