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
import { useLanguage } from "@/i18n";

interface FieldOption {
  id: string;
  label: string;
  category: string;
}

interface GeneratedData {
  [key: string]: string;
}

export default function FakerGenComponent() {
  const { t } = useLanguage();
  
  // 默认可用字段（当 API 不可用时使用）
  const defaultFields: FieldOption[] = [
    { id: 'name', label: t.fakerGen.fields.name, category: t.fakerGen.fieldCategories.personal },
    { id: 'phone', label: t.fakerGen.fields.phone, category: t.fakerGen.fieldCategories.personal },
    { id: 'email', label: t.fakerGen.fields.email, category: t.fakerGen.fieldCategories.personal },
    { id: 'address', label: t.fakerGen.fields.address, category: t.fakerGen.fieldCategories.personal },
    { id: 'company', label: t.fakerGen.fields.company, category: t.fakerGen.fieldCategories.work },
    { id: 'job', label: t.fakerGen.fields.job, category: t.fakerGen.fieldCategories.work },
    { id: 'username', label: t.fakerGen.fields.username, category: t.fakerGen.fieldCategories.account },
    { id: 'password', label: t.fakerGen.fields.password, category: t.fakerGen.fieldCategories.account },
    { id: 'uuid', label: t.fakerGen.fields.uuid, category: t.fakerGen.fieldCategories.identifier },
    { id: 'url', label: t.fakerGen.fields.url, category: t.fakerGen.fieldCategories.network },
    { id: 'ipv4', label: t.fakerGen.fields.ipv4, category: t.fakerGen.fieldCategories.network },
    { id: 'date', label: t.fakerGen.fields.date, category: t.fakerGen.fieldCategories.time },
    { id: 'datetime', label: t.fakerGen.fields.datetime, category: t.fakerGen.fieldCategories.time },
    { id: 'text', label: t.fakerGen.fields.text, category: t.fakerGen.fieldCategories.text },
    { id: 'city', label: t.fakerGen.fields.city, category: t.fakerGen.fieldCategories.geography },
    { id: 'country', label: t.fakerGen.fields.country, category: t.fakerGen.fieldCategories.geography },
  ];

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
        setAvailableFields(defaultFields);
      });
  }, [defaultFields]);

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
      setError(t.fakerGen.selectAtLeastOne);
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
        setError(data.error || t.fakerGen.generateFailed);
      }
    } catch (e) {
      setError(t.fakerGen.apiError);
    } finally {
      setLoading(false);
    }
  }, [selectedFields, count, locale, t]);

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
      console.error(t.jsonFormatter.copyFailed, e);
    }
  }, [formattedOutput, t]);

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
            <span className="text-sm text-zinc-400">{t.fakerGen.dataLanguage}:</span>
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value)}
              className="rounded border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-white"
            >
              <option value="zh_CN">{t.fakerGen.chinese}</option>
              <option value="en_US">{t.fakerGen.english}</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-400">{t.common.count}:</span>
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
            <span className="text-sm text-zinc-400">{t.fakerGen.outputFormat}:</span>
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
            {t.common.generateData}
          </Button>
          {results.length > 0 && (
            <>
              <Button onClick={copyToClipboard} variant="outline" size="sm">
                {copied ? <Check className="mr-2 h-4 w-4 text-green-500" /> : <Copy className="mr-2 h-4 w-4" />}
                {t.common.copy}
              </Button>
              <Button onClick={downloadFile} variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                {t.common.download}
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
              {t.common.selectField} ({selectedFields.length} {t.common.selected})
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
          title={`${t.common.result} (${results.length} ${t.common.records})`}
          copyValue={results.length > 0 ? formattedOutput() : undefined}
        >
          <ScrollArea className="h-full">
            {results.length === 0 ? (
              <div className="flex h-full items-center justify-center p-4">
                <span className="text-sm text-zinc-500">
                  {t.fakerGen.clickToGenerate}
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
