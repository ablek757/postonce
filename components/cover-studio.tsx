"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { apiPost } from "@/lib/client";
import { COVER_TEMPLATES, type CoverTemplateId } from "@/lib/types";
import { Download, ImageIcon, Loader2 } from "lucide-react";

interface Props {
  main: string;
  sub: string;
  onChange: (patch: { main?: string; sub?: string }) => void;
}

/** 封面工作台：选模板 → 渲染 PNG → 预览 → 下载 */
export function CoverStudio({ main, sub, onChange }: Props) {
  const [template, setTemplate] = useState<CoverTemplateId>("solid");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    if (!main.trim()) {
      setError("请先填写封面主标题");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const blob = await apiPost<Blob>("/api/cover", {
        template,
        main: main.trim(),
        sub: sub.trim(),
      });
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(blob));
    } catch (e) {
      setError(e instanceof Error ? e.message : "封面生成失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <ImageIcon className="size-4" /> 封面（3:4，900×1200）
      </div>

      <div className="flex flex-wrap gap-2">
        {COVER_TEMPLATES.map((t) => (
          <Button
            key={t.id}
            size="sm"
            variant={template === t.id ? "default" : "outline"}
            onClick={() => setTemplate(t.id)}
          >
            {t.label}
          </Button>
        ))}
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

      <div className="flex items-center gap-2">
        <Button size="sm" onClick={generate} disabled={loading}>
          {loading ? <Loader2 className="mr-1.5 size-4 animate-spin" /> : null}
          生成封面
        </Button>
        {previewUrl && (
          <Button size="sm" variant="secondary" asChild>
            <a href={previewUrl} download={`postonce-cover-${template}.png`}>
              <Download className="mr-1.5 size-4" /> 下载 PNG
            </a>
          </Button>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {previewUrl && (
        <>
          <Separator />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="封面预览"
            className="mx-auto w-52 max-w-full rounded-md border shadow-sm"
          />
        </>
      )}
    </div>
  );
}
