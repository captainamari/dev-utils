"use client";

import { useState, useCallback, useEffect } from "react";
import { 
  ToolLayout, 
  ToolHeader, 
  ToolContent,
  OutputPanel,
  ActionGroup
} from "@/components/shared";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Play, Download, Loader2, Check, Copy, RefreshCw } from "lucide-react";

interface FieldOption {
  id: string;
  label: string;
  category: string;
}

interface GeneratedData {
  [key: string]: string;
}

// 默认可用字段（当 API 不可用时使用）
const defaultFields: FieldOption[] = [
  { id: 'name', label: '姓名', category: '个人信息' },
  { id: 'phone', label: '电话', category: '个人信息' },
  { id: 'email', label: '邮箱', category: '个人信息' },
  { id: 'address', label: '地址', category: '个人信息' },
  { id: 'company', label: '公司', category: '工作' },
  { id: 'job', label: '职位', category: '工作' },
  { id: 'username', label: '用户名', category: '账户' },
  { id: 'password', label: '密码', category: '账户' },
  { id: 'uuid', label: 'UUID', category: '标识' },
  { id: 'url', label: 'URL', category: '网络' },
  { id: 'ipv4', label: 'IPv4', category: '网络' },
  { id: 'date', label: '日期', category: '时间' },
  { id: 'datetime', label: '日期时间', category: '时间' },
  { id: 'text', label: '文本', category: '文本' },
  { id: 'city', label: '城市', category: '地理' },
  { id: 'country', label: '国家', category: '地理' },
];

export default function FakerGenComponent() {
  const [availableFields, setAvailableFields] = useState<FieldOption[]>(defaultFields);
  const [selectedFields, setSelectedFields] = useState<string[]>(['name', 'phone', 'email']);
  const [count, setCount] = useState(10);
  const [locale, setLocale] = useState('zh_CN');
  const [results, setResults] = useState<GeneratedData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [outputFormat, setOutputFormat] = useState<'json' | 'csv'>('json');

  // 获取可用字段列表
  useEffect(() => {
    fetch('/api/faker_gen')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.available_fields) {
          setAvailableFields(data.available_fields);
        }
      })
      .catch(() => {
        // API 不可用时使用默认字段
        console.log('Using default fields');
      });
  }, []);

  // 按分类分组字段
  const groupedFields = availableFields.reduce((acc, field) => {
    if (!acc[field.category]) {
      acc[field.category] = [];
    }
    acc[field.category].push(field);
    return acc;
  }, {} as Record<string, FieldOption[]>);

  const toggleField = useCallback((fieldId: string) => {
    setSelectedFields(prev => 
      prev.includes(fieldId) 
        ? prev.filter(f => f !== fieldId)
        : [...prev, fieldId]
    );
  }, []);

  const generate = useCallback(async () => {
    if (selectedFields.length === 0) {
      setError('请至少选择一个字段');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/faker_gen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: selectedFields,
          count,
          locale,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResults(data.data);
      } else {
        setError(data.error || '生成失败');
      }
    } catch (e) {
      setError('API 请求失败，请确保已启动 Vercel 开发服务器 (vercel dev)');
    } finally {
      setLoading(false);
    }
  }, [selectedFields, count, locale]);

  // 格式化输出
  const formattedOutput = useCallback(() => {
    if (results.length === 0) return '';

    if (outputFormat === 'json') {
      return JSON.stringify(results, null, 2);
    } else {
      // CSV 格式
      const headers = Object.keys(results[0]);
      const rows = results.map(row => 
        headers.map(h => `"${(row[h] || '').replace(/"/g, '""')}"`).join(',')
      );
      return [headers.join(','), ...rows].join('\n');
    }
  }, [results, outputFormat]);

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(formattedOutput());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('复制失败:', e);
    }
  }, [formattedOutput]);

  const downloadFile = useCallback(() => {
    const content = formattedOutput();
    const blob = new Blob([content], { 
      type: outputFormat === 'json' ? 'application/json' : 'text/csv' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `faker-data.${outputFormat}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [formattedOutput, outputFormat]);

  return (
    <ToolLayout>
      <ToolHeader>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-400">语言:</span>
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value)}
              className="rounded border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-white"
            >
              <option value="zh_CN">中文</option>
              <option value="en_US">英文</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-400">数量:</span>
            <input
              type="number"
              value={count}
              onChange={(e) => setCount(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
              min={1}
              max={100}
              className="w-20 rounded border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-400">格式:</span>
            <select
              value={outputFormat}
              onChange={(e) => setOutputFormat(e.target.value as 'json' | 'csv')}
              className="rounded border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-white"
            >
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
            </select>
          </div>
        </div>

        <ActionGroup className="ml-auto">
          <Button onClick={generate} disabled={loading} size="sm">
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Play className="mr-2 h-4 w-4" />
            )}
            生成数据
          </Button>
          {results.length > 0 && (
            <>
              <Button onClick={copyToClipboard} variant="outline" size="sm">
                {copied ? <Check className="mr-2 h-4 w-4 text-green-500" /> : <Copy className="mr-2 h-4 w-4" />}
                复制
              </Button>
              <Button onClick={downloadFile} variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                下载
              </Button>
            </>
          )}
        </ActionGroup>
      </ToolHeader>

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-2 text-sm text-red-400">
          {error}
        </div>
      )}

      <ToolContent>
        {/* 字段选择区 */}
        <div className="flex flex-col overflow-hidden rounded-lg border border-zinc-800">
          <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-4 py-2">
            <span className="text-sm font-medium text-zinc-400">
              选择字段 ({selectedFields.length} 已选)
            </span>
            <Button
              onClick={() => setSelectedFields([])}
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-zinc-500 hover:text-zinc-300"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-4">
              {Object.entries(groupedFields).map(([category, fields]) => (
                <div key={category}>
                  <h4 className="mb-2 text-xs font-medium uppercase text-zinc-500">
                    {category}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {fields.map((field) => (
                      <button
                        key={field.id}
                        onClick={() => toggleField(field.id)}
                        className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                          selectedFields.includes(field.id)
                            ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                            : 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300'
                        }`}
                      >
                        {field.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* 输出区 */}
        <OutputPanel 
          title={`生成结果 (${results.length} 条)`}
          copyValue={results.length > 0 ? formattedOutput() : undefined}
        >
          <ScrollArea className="h-full">
            {results.length === 0 ? (
              <div className="flex h-full items-center justify-center p-4">
                <span className="text-sm text-zinc-500">
                  选择字段后点击"生成数据"
                </span>
              </div>
            ) : (
              <pre className="p-4 font-mono text-sm text-zinc-300">
                {formattedOutput()}
              </pre>
            )}
          </ScrollArea>
        </OutputPanel>
      </ToolContent>
    </ToolLayout>
  );
}
