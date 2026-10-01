"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { apiPost, type IngestResponse } from "@/lib/client";
import type { SourceDocument } from "@/lib/types";
import { FileText, Link2, Loader2, Sparkles } from "lucide-react";

interface Props {
  initialDoc?: SourceDocument | null;
  onReady: (doc: SourceDocument) => void;
  onUnderstand: () => void;
  ready: boolean;
  busy: boolean;
}

export function SourceInput({ initialDoc, onReady, onUnderstand, ready, busy }: Props) {
  const [title, setTitle] = useState(initialDoc?.title ?? "");
  const [content, setContent] = useState(initialDoc?.content ?? "");
  const [url, setUrl] = useState("");
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const textReady = content.trim().length >= 10;

  function emit(doc: SourceDocument) {
    setTitle(doc.title);
    setContent(doc.content);
    onReady(doc);
  }

  async function handleFetch() {
    const target = url.trim();
    if (!target) {
      setError("请先输入要抓取的网页链接");
      return;
    }
    setError(null);
    setFetching(true);
    try {
      const res = await apiPost<IngestResponse>("/api/ingest", { url: target });
      emit({
        title: res.title || "",
        content: res.content,
        excerpt: res.excerpt,
        sourceUrl: res.sourceUrl,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "抓取失败");
    } finally {
      setFetching(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">1</span>
          输入内容
        </CardTitle>
        <CardDescription>粘贴你的原始内容，或输入网页链接自动抓取正文</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="text">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="text">
              <FileText className="mr-1.5 size-4" /> 粘贴文本
            </TabsTrigger>
            <TabsTrigger value="url">
              <Link2 className="mr-1.5 size-4" /> 网页链接
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="space-y-3 pt-3">
            <div className="space-y-1.5">
              <Label htmlFor="src-title">标题（可选）</Label>
              <Input
                id="src-title"
                placeholder="给你的内容起个标题"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (ready) onReady({ title: e.target.value, content, excerpt: "" });
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="src-content">正文</Label>
              <Textarea
                id="src-content"
                placeholder="把公众号文章、知乎回答或任何文字粘贴到这里…"
                className="min-h-44 resize-y"
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  if (ready) onReady({ title, content: e.target.value, excerpt: "" });
                }}
              />
              <p className="text-xs text-muted-foreground text-right">{content.length} 字</p>
            </div>
            <Button
              className="w-full sm:w-auto"
              disabled={!textReady || busy}
              onClick={() => onReady({ title, content, excerpt: "" })}
            >
              {busy ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Sparkles className="mr-2 size-4" />}
              开始理解
            </Button>
          </TabsContent>

          <TabsContent value="url" className="space-y-3 pt-3">
            <div className="space-y-1.5">
              <Label htmlFor="src-url">文章链接</Label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  id="src-url"
                  placeholder="https://example.com/article"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleFetch();
                  }}
                />
                <Button variant="secondary" onClick={handleFetch} disabled={fetching} className="sm:w-28">
                  {fetching ? <Loader2 className="size-4 animate-spin" /> : "抓取正文"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                支持公众号、知乎及普通网页；服务端抓取并提取正文，仅支持公网 http/https 链接。
              </p>
            </div>

            {ready && (
              <div className="space-y-3 rounded-lg border bg-muted/40 p-3">
                <div className="space-y-1.5">
                  <Label htmlFor="fetched-title">抓取到的标题（可修改）</Label>
                  <Input
                    id="fetched-title"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      onReady({ title: e.target.value, content, excerpt: "" });
                    }}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="fetched-content">抓取到的正文（可修改）</Label>
                  <Textarea
                    id="fetched-content"
                    className="min-h-40 resize-y"
                    value={content}
                    onChange={(e) => {
                      setContent(e.target.value);
                      onReady({ title, content: e.target.value, excerpt: "" });
                    }}
                  />
                  <p className="text-xs text-muted-foreground text-right">{content.length} 字</p>
                </div>
                <Button className="w-full sm:w-auto" disabled={!textReady || busy} onClick={onUnderstand}>
                  {busy ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Sparkles className="mr-2 size-4" />}
                  开始理解
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {error && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
