"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { apiPost } from "@/lib/client";
import { COVER_TEMPLATES, type CoverTemplateId } from "@/lib/types";
import { Check, Download, ImageIcon, Loader2, RefreshCw } from "lucide-react";

interface Props {
  main: string;
  sub: string;
  onChange: (patch: { main?: string; sub?: string }) => void;
}

/** 封面工作台：一键并行渲染全部模板 → 缩略图对比 → 点击放大预览 → 单独下载 */
export function CoverStudio({ main, sub, onChange }: Props) {
  const [results, setResults] = useState<Partial<Record<CoverTemplateId, string>>>({});
  const [renderedFor, setRenderedFor] = useState<{ main: string; sub: string } | null>(null);
  const [selected, setSelected] = useState<CoverTemplateId>("solid");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty =
    renderedFor === null || renderedFor.main !== main.trim() || renderedFor.sub !== sub.trim();

  async function generate() {
    if (!main.trim()) {
      setError("请先填写封面主标题");
      return;
    }
    setError(null);
    setLoading(true);
    // 并行渲染全部模板
    const settled = await Promise.allSettled(
      COVER_TEMPLATES.map(async (t) => {
        const blob = await apiPost<Blob>("/api/cover", {
          template: t.id,
          main: main.trim(),
          sub: sub.trim(),
        });
        return { id: t.id, blob };
      })
    );
    setLoading(false);

    const next: Partial<Record<CoverTemplateId, string>> = {};
    let firstOk: CoverTemplateId | null = null;
    let firstError: string | null = null;
    for (const outcome of settled) {
      if (outcome.status === "fulfilled") {
        next[outcome.value.id] = URL.createObjectURL(outcome.value.blob);
        if (!firstOk) firstOk = outcome.value.id;
      } else {
        firstError = outcome.reason instanceof Error ? outcome.reason.message : "封面生成失败";
      }
    }
    setResults((prev) => {
      for (const url of Object.values(prev)) URL.revokeObjectURL(url);
      return next;
    });
    if (firstOk) {
      setSelected(firstOk);
      setRenderedFor({ main: main.trim(), sub: sub.trim() });
    }
    if (!firstOk) {
      setError(firstError || "封面生成失败，请重试");
    } else if (firstError) {
      setError(null);
    }
  }

  const previewUrl = results[selected];

  return (
    <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <ImageIcon className="size-4" aria-hidden /> 封面（3:4，900×1200）
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="cover-main" className="text-xs">主标题（≤12 字效果最佳）</Label>
          <Input
            id="cover-main"
            value={main}
            maxLength={30}
            onChange={(e) => onChange({ main: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="cover-sub" className="text-xs">副标题</Label>
          <Input
            id="cover-sub"
            value={sub}
            maxLength={60}
            onChange={(e) => onChange({ sub: e.target.value })}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={generate} disabled={loading}>
          {loading ? (
            <Loader2 className="mr-1.5 size-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-1.5 size-4" />
          )}
          {loading ? "渲染中…" : dirty && Object.keys(results).length > 0 ? "重新生成 3 套模板" : "一键生成 3 套模板"}
        </Button>
        {dirty && Object.keys(results).length > 0 && !loading && (
          <span className="text-xs text-muted-foreground">封面文字已修改，可重新生成</span>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {Object.keys(results).length > 0 && (
        <>
          <Separator />
          <div className="flex gap-3 overflow-x-auto pb-1">
            {COVER_TEMPLATES.map((t) => {
              const url = results[t.id];
              if (!url) return null;
              const active = t.id === selected;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelected(t.id)}
                  className={`group relative w-20 shrink-0 overflow-hidden rounded-md border-2 transition-all ${
                    active ? "border-primary shadow-sm" : "border-transparent opacity-75 hover:opacity-100"
                  }`}
                  aria-label={`预览模板：${t.label}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={t.label} className="block w-full" />
                  {active && (
                    <span className="absolute top-1 right-1 rounded-full bg-primary p-0.5 text-primary-foreground">
                      <Check className="size-3" aria-hidden />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {previewUrl && (
            <div className="flex flex-col items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt={`封面预览：${COVER_TEMPLATES.find((t) => t.id === selected)?.label}`}
                className="w-56 max-w-full rounded-md border shadow-sm"
              />
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {COVER_TEMPLATES.find((t) => t.id === selected)?.label}
                </span>
                <Button size="sm" variant="secondary" asChild>
                  <a href={previewUrl} download={`postonce-cover-${selected}.png`}>
                    <Download className="mr-1.5 size-4" /> 下载此封面
                  </a>
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
