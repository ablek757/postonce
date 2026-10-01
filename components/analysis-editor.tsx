"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type { ContentAnalysis, PlatformId } from "@/lib/types";
import { PLATFORM_IDS, PLATFORM_LABELS } from "@/lib/types";
import { Lightbulb, Loader2, Plus, RefreshCw, Send, X } from "lucide-react";

interface Props {
  analysis: ContentAnalysis;
  onChange: (next: ContentAnalysis) => void;
  onRegenerate: () => void;
  onAdapt: () => void;
  busy: boolean;
  busyLabel?: string;
  selectedPlatforms: PlatformId[];
  onTogglePlatform: (p: PlatformId) => void;
}

export function AnalysisEditor({
  analysis,
  onChange,
  onRegenerate,
  onAdapt,
  busy,
  busyLabel,
  selectedPlatforms,
  onTogglePlatform,
}: Props) {
  function set<K extends keyof ContentAnalysis>(key: K, value: ContentAnalysis[K]) {
    onChange({ ...analysis, [key]: value });
  }

  function updateList(key: "keyPoints" | "goldenQuotes", index: number, value: string) {
    const list = [...analysis[key]];
    list[index] = value;
    set(key, list);
  }

  function removeListItem(key: "keyPoints" | "goldenQuotes", index: number) {
    set(key, analysis[key].filter((_, i) => i !== index));
  }

  function addListItem(key: "keyPoints" | "goldenQuotes") {
    set(key, [...analysis[key], ""]);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">2</span>
          内容理解
          <Badge variant="secondary" className="ml-auto font-normal">可编辑</Badge>
        </CardTitle>
        <CardDescription>AI 对原文的结构化理解，所有字段都可以手动修改，会作为改写依据</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="an-summary">核心总结</Label>
          <Textarea
            id="an-summary"
            value={analysis.summary}
            onChange={(e) => set("summary", e.target.value)}
            className="min-h-20 resize-y"
          />
        </div>

        <div className="space-y-1.5">
          <Label>要点清单</Label>
          <div className="space-y-2">
            {analysis.keyPoints.map((p, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input value={p} onChange={(e) => updateList("keyPoints", i, e.target.value)} />
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="删除要点"
                  onClick={() => removeListItem("keyPoints", i)}
                >
                  <X className="size-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={() => addListItem("keyPoints")}>
            <Plus className="mr-1 size-4" /> 添加要点
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="an-audience">目标读者</Label>
            <Input id="an-audience" value={analysis.audience} onChange={(e) => set("audience", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="an-tone">情绪调性</Label>
            <Input id="an-tone" value={analysis.tone} onChange={(e) => set("tone", e.target.value)} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>金句（每行一条）</Label>
          {analysis.goldenQuotes.map((q, i) => (
            <div key={i} className="flex items-start gap-2">
              <Textarea
                value={q}
                onChange={(e) => updateList("goldenQuotes", i, e.target.value)}
                className="min-h-12 resize-y"
              />
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="删除金句"
                onClick={() => removeListItem("goldenQuotes", i)}
              >
                <X className="size-4" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => addListItem("goldenQuotes")}>
            <Plus className="mr-1 size-4" /> 添加金句
          </Button>
        </div>

        <div className="space-y-2">
          <Label>生成平台（可多选）</Label>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {PLATFORM_IDS.map((p) => (
              <label key={p} className="flex cursor-pointer items-center gap-1.5 text-sm">
                <input
                  type="checkbox"
                  className="size-4 accent-primary"
                  checked={selectedPlatforms.includes(p)}
                  onChange={() => onTogglePlatform(p)}
                />
                {PLATFORM_LABELS[p]}
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={onRegenerate} disabled={busy}>
            {busy ? <Loader2 className="mr-2 size-4 animate-spin" /> : <RefreshCw className="mr-2 size-4" />}
            重新理解
          </Button>
          <Button onClick={onAdapt} disabled={busy || selectedPlatforms.length === 0}>
            {busy ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Send className="mr-2 size-4" />}
            {busy ? (busyLabel ?? "生成中…") : `生成草稿（${selectedPlatforms.length} 个平台）`}
          </Button>
        </div>

        <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
          <Lightbulb className="mt-0.5 size-3.5 shrink-0" />
          生成结果是草稿，发布前请人工审核；建议按平台要求添加「AI 辅助创作」标识。
        </p>
      </CardContent>
    </Card>
  );
}
