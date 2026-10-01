"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { AnalysisEditor } from "@/components/analysis-editor";
import { GongzhonghaoPanel } from "@/components/gongzhonghao-panel";
import { HistorySheet } from "@/components/history-sheet";
import { SettingsSheet, type ServerInfo } from "@/components/settings-sheet";
import { SourceInput } from "@/components/source-input";
import { XiaohongshuPanel } from "@/components/xiaohongshu-panel";
import {
  apiPost,
  deleteHistoryRun,
  isGzh,
  isXhs,
  loadByok,
  loadHistory,
  saveHistoryRun,
  type AdaptResponse,
  type HistoryRun,
  type UnderstandResponse,
} from "@/lib/client";
import {
  PLATFORM_IDS,
  PLATFORM_LABELS,
  type ContentAnalysis,
  type GongzhonghaoDraft,
  type PlatformId,
  type SourceDocument,
  type TokenUsage,
  type XiaohongshuDraft,
} from "@/lib/types";
import { AlertCircle, Coins, History, Loader2, RefreshCw, Settings2 } from "lucide-react";

interface DraftState {
  status: "loading" | "ok" | "error";
  data?: XiaohongshuDraft | GongzhonghaoDraft;
  error?: string;
  usage?: TokenUsage;
}

const EMPTY_USAGE: TokenUsage = { inputTokens: 0, outputTokens: 0, totalTokens: 0 };

export function PostonceApp() {
  const [doc, setDoc] = useState<SourceDocument | null>(null);
  const [analysis, setAnalysis] = useState<ContentAnalysis | null>(null);
  const [drafts, setDrafts] = useState<Partial<Record<PlatformId, DraftState>>>({});
  const [titleSelected, setTitleSelected] = useState<Record<PlatformId, number>>({
    xiaohongshu: 0,
    gongzhonghao: 0,
  });
  const [busy, setBusy] = useState<"understand" | "adapt" | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [usageTotal, setUsageTotal] = useState<TokenUsage>(EMPTY_USAGE);
  const [serverInfo, setServerInfo] = useState<ServerInfo | null>(null);
  const [byokOn, setByokOn] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyRuns, setHistoryRuns] = useState<HistoryRun[]>([]);

  useEffect(() => {
    fetch("/api/config")
      .then((r) => (r.ok ? r.json() : null))
      .then((info) => setServerInfo(info))
      .catch(() => setServerInfo(null));
    setByokOn(loadByok() !== null);
  }, []);

  const addUsage = useCallback((u?: TokenUsage) => {
    if (!u) return;
    setUsageTotal((prev) => ({
      inputTokens: prev.inputTokens + (u.inputTokens ?? 0),
      outputTokens: prev.outputTokens + (u.outputTokens ?? 0),
      totalTokens: prev.totalTokens + (u.totalTokens ?? 0),
    }));
  }, []);

  const runUnderstand = useCallback(
    async (target: SourceDocument) => {
      setGlobalError(null);
      setBusy("understand");
      try {
        const res = await apiPost<UnderstandResponse>("/api/understand", {
          title: target.title,
          content: target.content,
        });
        const { usage, ...rest } = res;
        setAnalysis(rest);
        addUsage(usage);
      } catch (e) {
        setGlobalError(e instanceof Error ? e.message : "内容理解失败");
      } finally {
        setBusy(null);
      }
    },
    [addUsage]
  );

  const runAdapt = useCallback(
    async (platforms: PlatformId[]) => {
      if (!doc || !analysis) return;
      setGlobalError(null);
      setBusy("adapt");
      setDrafts((prev) => {
        const next = { ...prev };
        for (const p of platforms) next[p] = { status: "loading" };
        return next;
      });
      try {
        const res = await apiPost<AdaptResponse>("/api/adapt", {
          title: doc.title,
          content: doc.content,
          analysis,
          platforms,
        });
        addUsage(res.usage);
        const next: Partial<Record<PlatformId, DraftState>> = {};
        for (const r of res.results) {
          next[r.platform] = r.ok
            ? { status: "ok", data: r.data, usage: r.usage }
            : { status: "error", error: r.error || "生成失败" };
        }
        setDrafts((prev) => ({ ...prev, ...next }));

        // 完整生成（双平台）成功时写入历史
        const allOk = res.results.every((r) => r.ok);
        if (allOk && platforms.length === PLATFORM_IDS.length) {
          saveHistoryRun({
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            time: Date.now(),
            title: doc.title || analysis.summary.slice(0, 30),
            sourceUrl: doc.sourceUrl,
            doc,
            analysis,
            results: res.results,
          });
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : "生成失败";
        setGlobalError(msg);
        setDrafts((prev) => {
          const next = { ...prev };
          for (const p of platforms) {
            if (next[p]?.status === "loading") next[p] = { status: "error", error: msg };
          }
          return next;
        });
      } finally {
        setBusy(null);
      }
    },
    [doc, analysis, addUsage]
  );

  function openHistory() {
    setHistoryRuns(loadHistory());
    setHistoryOpen(true);
  }

  function handleLoadRun(run: HistoryRun) {
    setDoc(run.doc);
    setAnalysis(run.analysis);
    const next: Partial<Record<PlatformId, DraftState>> = {};
    for (const r of run.results) {
      if (r.ok && r.data) {
        next[r.platform] = { status: "ok", data: r.data, usage: r.usage };
      }
    }
    setDrafts(next);
    setTitleSelected({ xiaohongshu: 0, gongzhonghao: 0 });
    setGlobalError(null);
    setHistoryOpen(false);
    window.scrollTo({ top: 0 });
  }

  const hasDrafts = useMemo(
    () => PLATFORM_IDS.some((p) => drafts[p]),
    [drafts]
  );

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-3xl items-center gap-2 px-4">
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-bold">
              PostOnce <span className="text-muted-foreground font-normal">一稿多发</span>
            </h1>
            <p className="hidden text-xs text-muted-foreground sm:block">
              Write once, publish everywhere. 写一次，发全网。
            </p>
          </div>
          <Badge variant="secondary" className="hidden font-normal sm:inline-flex">
            {byokOn ? "自定义模型" : (serverInfo?.providerLabel ?? "默认模型")}
          </Badge>
          {usageTotal.totalTokens > 0 && (
            <Badge variant="outline" className="font-normal" title="本次会话累计 token 消耗">
              <Coins className="mr-1 size-3.5" />
              {usageTotal.totalTokens.toLocaleString()} tokens
            </Badge>
          )}
          <Button variant="ghost" size="icon" onClick={openHistory} aria-label="历史记录">
            <History className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSettingsOpen(true)}
            aria-label="模型设置"
          >
            <Settings2 className="size-4" />
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 space-y-6 px-4 py-6">
        <SourceInput
          initialDoc={doc}
          ready={doc !== null}
          busy={busy === "understand"}
          onReady={(d) => setDoc(d)}
          onUnderstand={() => doc && runUnderstand(doc)}
        />

        {globalError && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <div>
              <p className="font-medium">出错了</p>
              <p>{globalError}</p>
            </div>
          </div>
        )}

        {analysis && (
          <AnalysisEditor
            analysis={analysis}
            busy={busy !== null}
            busyLabel={busy === "adapt" ? "正在生成草稿…" : undefined}
            onChange={setAnalysis}
            onRegenerate={() => doc && runUnderstand(doc)}
            onAdapt={() => runAdapt(PLATFORM_IDS)}
          />
        )}

        {hasDrafts && (
          <div className="space-y-4">
            <Separator />
            <h2 className="text-sm font-semibold text-muted-foreground">
              ③ 平台草稿（逐平台可编辑、可单独重新生成）
            </h2>
            {PLATFORM_IDS.map((platform) => {
              const state = drafts[platform];
              if (!state) return null;
              return (
                <Card key={platform}>
                  <CardHeader className="flex-row items-center gap-2 space-y-0">
                    <CardTitle className="text-base">{PLATFORM_LABELS[platform]}</CardTitle>
                    {state.status === "ok" && state.usage && (
                      <Badge variant="outline" className="font-normal">
                        {state.usage.totalTokens.toLocaleString()} tokens
                      </Badge>
                    )}
                    <div className="ml-auto flex items-center gap-2">
                      {state.status === "loading" && (
                        <Loader2 className="size-4 animate-spin text-muted-foreground" />
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={busy !== null || state.status === "loading"}
                        onClick={() => runAdapt([platform])}
                      >
                        <RefreshCw className="mr-1.5 size-3.5" />
                        重新生成
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {state.status === "loading" && (
                      <div className="space-y-3">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-11/12" />
                        <Skeleton className="h-40 w-full" />
                      </div>
                    )}
                    {state.status === "error" && (
                      <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                        {state.error || "该平台生成失败，请重试"}
                      </div>
                    )}
                    {state.status === "ok" && state.data && isXhs(state.data) && (
                      <XiaohongshuPanel
                        draft={state.data}
                        selectedTitle={titleSelected.xiaohongshu}
                        onSelectTitle={(i) =>
                          setTitleSelected((s) => ({ ...s, xiaohongshu: i }))
                        }
                        onChange={(d) =>
                          setDrafts((prev) => ({ ...prev, xiaohongshu: { ...state, data: d } }))
                        }
                      />
                    )}
                    {state.status === "ok" && state.data && isGzh(state.data) && (
                      <GongzhonghaoPanel
                        draft={state.data}
                        selectedTitle={titleSelected.gongzhonghao}
                        onSelectTitle={(i) =>
                          setTitleSelected((s) => ({ ...s, gongzhonghao: i }))
                        }
                        onChange={(d) =>
                          setDrafts((prev) => ({ ...prev, gongzhonghao: { ...state, data: d } }))
                        }
                      />
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      <footer className="border-t py-4">
        <p className="mx-auto max-w-3xl px-4 text-center text-xs text-muted-foreground">
          PostOnce 只产出草稿、不碰自动发布。请人工审核后再发布，并遵守各平台
          「AI 辅助创作」标识要求；网页抓取内容仅供你本人二次创作，请尊重原作者版权。
        </p>
      </footer>

      <SettingsSheet
        open={settingsOpen}
        onClose={() => {
          setSettingsOpen(false);
          setByokOn(loadByok() !== null);
        }}
        serverInfo={serverInfo}
      />
      <HistorySheet
        open={historyOpen}
        runs={historyRuns}
        onClose={() => setHistoryOpen(false)}
        onLoad={handleLoadRun}
        onDelete={(id) => {
          deleteHistoryRun(id);
          setHistoryRuns(loadHistory());
        }}
      />
    </div>
  );
}
