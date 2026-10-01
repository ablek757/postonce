"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TitleCandidates } from "@/components/title-candidates";
import { copyPlainText, copyRichText, htmlToMarkdown } from "@/lib/client";
import type { GongzhonghaoDraft } from "@/lib/types";
import { Check, ClipboardCopy, FileCode2, FileText } from "lucide-react";

interface Props {
  draft: GongzhonghaoDraft;
  selectedTitle: number;
  onSelectTitle: (i: number) => void;
  onChange: (draft: GongzhonghaoDraft) => void;
}

function htmlToPlainText(html: string): string {
  if (typeof DOMParser === "undefined") return html.replace(/<[^>]+>/g, "");
  return new DOMParser().parseFromString(html, "text/html").body.textContent || "";
}

export function GongzhonghaoPanel({ draft, selectedTitle, onSelectTitle, onChange }: Props) {
  const [copied, setCopied] = useState<"rich" | "md" | null>(null);

  async function handleCopyRich() {
    await copyRichText(draft.html, htmlToPlainText(draft.html));
    setCopied("rich");
    setTimeout(() => setCopied(null), 1500);
  }

  async function handleCopyMd() {
    await copyPlainText(htmlToMarkdown(draft.html));
    setCopied("md");
    setTimeout(() => setCopied(null), 1500);
  }

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
          <Label htmlFor="gzh-digest">摘要（≤120 字，用于公众号后台）</Label>
          <span className="text-xs text-muted-foreground">{draft.digest.length} 字</span>
        </div>
        <Textarea
          id="gzh-digest"
          className="min-h-14 resize-y"
          value={draft.digest}
          onChange={(e) => onChange({ ...draft, digest: e.target.value })}
        />
      </div>

      <Tabs defaultValue="preview">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="preview">排版预览</TabsTrigger>
          <TabsTrigger value="html">
            <FileCode2 className="mr-1.5 size-4" /> HTML 源码
          </TabsTrigger>
        </TabsList>
        <TabsContent value="preview" className="pt-3">
          <iframe
            title="公众号排版预览"
            sandbox=""
            srcDoc={draft.html}
            className="h-125 w-full rounded-lg border bg-white"
          />
        </TabsContent>
        <TabsContent value="html" className="pt-3">
          <Textarea
            aria-label="公众号 HTML 源码"
            className="min-h-72 resize-y font-mono text-xs"
            value={draft.html}
            onChange={(e) => onChange({ ...draft, html: e.target.value })}
          />
        </TabsContent>
      </Tabs>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button variant="secondary" onClick={handleCopyRich}>
          {copied === "rich" ? <Check className="mr-1.5 size-4" /> : <ClipboardCopy className="mr-1.5 size-4" />}
          一键复制富文本
        </Button>
        <Button variant="outline" onClick={handleCopyMd}>
          {copied === "md" ? <Check className="mr-1.5 size-4" /> : <FileText className="mr-1.5 size-4" />}
          复制 Markdown
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        「一键复制富文本」会同时写入 text/html 与 text/plain，可直接粘贴到公众号后台编辑器，保留排版样式。
      </p>
    </div>
  );
}
