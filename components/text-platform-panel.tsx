"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { TitleCandidates } from "@/components/title-candidates";
import { Textarea } from "@/components/ui/textarea";
import { copyPlainText } from "@/lib/client";
import type { PlatformId, ToutiaoDraft, WeiboDraft, ZhihuDraft } from "@/lib/types";
import { Check, ClipboardCopy, FileText, Hash } from "lucide-react";
import { useState } from "react";

type TextDraft = ZhihuDraft | WeiboDraft | ToutiaoDraft;

interface Props {
  platform: PlatformId; // zhihu | weibo | toutiao
  draft: TextDraft;
  selectedTitle: number;
  onSelectTitle: (i: number) => void;
  onChange: (draft: TextDraft) => void;
}

/** 去掉常见 Markdown 记号，得到可直接粘贴的纯文本 */
function stripMarkdown(md: string): string {
  return md
    .replace(/`{3}[a-z]*\n?/gi, "")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/^\s*[-*+]\s+/gm, "· ")
    .replace(/^\s*\d+\.\s+/gm, "· ")
    .replace(/^>\s?/gm, "")
    .trim();
}

function isWeiboDraft(d: TextDraft): d is WeiboDraft {
  return "text" in d;
}

/** 知乎 / 微博 / 头条通用面板：标题候选（微博除外）+ 正文编辑 + 复制 */
export function TextPlatformPanel({ platform, draft, selectedTitle, onSelectTitle, onChange }: Props) {
  const [copied, setCopied] = useState<string | null>(null);

  async function copy(key: string, text: string) {
    await copyPlainText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  }

  function copyBtn(key: string, label: string, text: () => string) {
    return (
      <Button variant="secondary" onClick={() => copy(key, text())}>
        {copied === key ? <Check className="mr-1.5 size-4" /> : <ClipboardCopy className="mr-1.5 size-4" />}
        {label}
      </Button>
    );
  }

  /* ---------- 微博 ---------- */
  if (isWeiboDraft(draft)) {
    const hasLong = Boolean(draft.longText && draft.longText.trim());
    const composeWeibo = () => {
      const parts = [draft.text.trim()];
      if (draft.topics.length) parts.push(draft.topics.map((t) => `#${t}#`).join(" "));
      if (hasLong) parts.push(draft.longText!.trim());
      return parts.filter(Boolean).join("\n\n");
    };
    return (
      <div className="space-y-4">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="wb-text">短文案（≤140 字，前 20 字定生死）</Label>
            <span className={`text-xs ${draft.text.length > 140 ? "font-medium text-destructive" : "text-muted-foreground"}`}>
              {draft.text.length}/140
            </span>
          </div>
          <Textarea
            id="wb-text"
            className="min-h-24 resize-y whitespace-pre-wrap"
            value={draft.text}
            maxLength={280}
            onChange={(e) => onChange({ ...draft, text: e.target.value })}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="wb-topics">话题词（2-4 个，不带 #，复制时自动加 #）</Label>
          <div className="relative">
            <Hash className="absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
            <Input
              id="wb-topics"
              className="pl-8"
              value={draft.topics.join(" ")}
              onChange={(e) => {
                const topics = e.target.value
                  .split(/[,，\s]+/)
                  .map((t) => t.replace(/^#+|#+$/g, "").trim())
                  .filter(Boolean)
                  .slice(0, 4);
                onChange({ ...draft, topics });
              }}
            />
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {draft.topics.map((t) => (
              <Badge key={t} variant="secondary">#{t}#</Badge>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="size-4 accent-primary"
            checked={hasLong}
            onChange={(e) => {
              if (e.target.checked) {
                onChange({ ...draft, longText: draft.longText || "（在此粘贴或生成长微博正文）" });
              } else {
                onChange({ ...draft, longText: "" });
              }
            }}
          />
          同时发布长微博版本（500 字内）
        </label>
        {hasLong && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="wb-long">长微博正文</Label>
              <span className="text-xs text-muted-foreground">{(draft.longText ?? "").length}/500</span>
            </div>
            <Textarea
              id="wb-long"
              className="min-h-32 resize-y whitespace-pre-wrap"
              value={draft.longText ?? ""}
              onChange={(e) => onChange({ ...draft, longText: e.target.value.slice(0, 800) })}
            />
          </div>
        )}

        <div className="flex flex-col gap-2 sm:flex-row">
          {copyBtn("weibo-full", "复制完整文案（含话题）", composeWeibo)}
          {copyBtn("weibo-short", "复制短文案", () => draft.text.trim())}
        </div>
      </div>
    );
  }

  /* ---------- 知乎 / 头条 ---------- */
  const isZhihu = platform === "zhihu";
  const bodyLabel = isZhihu ? "正文（Markdown，2000 字内）" : "正文（资讯稿，1500 字内）";
  const limit = isZhihu ? 2000 : 1500;

  return (
    <div className="space-y-4">
      <TitleCandidates
        titles={draft.titles}
        selected={selectedTitle}
        onSelect={onSelectTitle}
        onEdit={(i, v) => {
          const titles = [...draft.titles];
          titles[i] = v;
          onChange({ ...draft, titles });
        }}
      />

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="tp-body">{bodyLabel}</Label>
          <span className={`text-xs ${draft.body.length > limit ? "font-medium text-destructive" : "text-muted-foreground"}`}>
            {draft.body.length}/{limit}
          </span>
        </div>
        <Textarea
          id="tp-body"
          className="min-h-64 resize-y whitespace-pre-wrap font-mono text-sm"
          value={draft.body}
          onChange={(e) => onChange({ ...draft, body: e.target.value })}
        />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        {copyBtn(
          "md",
          isZhihu ? "复制 Markdown" : "复制正文",
          () => draft.body.trim()
        )}
        {copyBtn("plain", "复制纯文本", () => stripMarkdown(draft.body))}
      </div>
      {isZhihu && (
        <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
          <FileText className="mt-0.5 size-3.5 shrink-0" />
          知乎编辑器支持 Markdown 粘贴；「复制纯文本」会去掉 ##、**、- 等记号。
        </p>
      )}
    </div>
  );
}
