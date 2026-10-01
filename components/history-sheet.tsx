"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { HistoryRun } from "@/lib/client";
import { Clock3, Trash2, X } from "lucide-react";

interface Props {
  open: boolean;
  runs: HistoryRun[];
  onClose: () => void;
  onLoad: (run: HistoryRun) => void;
  onDelete: (id: string) => void;
}

export function HistorySheet({ open, runs, onClose, onLoad, onDelete }: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-xl border bg-background p-5 shadow-lg"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="历史记录"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <Clock3 className="size-4" /> 历史记录
            <Badge variant="secondary">{runs.length}</Badge>
          </h2>
          <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="关闭">
            <X className="size-4" />
          </Button>
        </div>

        {runs.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            还没有历史记录。生成平台草稿后会自动保存在浏览器本地。
          </p>
        ) : (
          <ul className="space-y-2">
            {runs.map((run) => (
              <li
                key={run.id}
                className="flex items-center gap-2 rounded-lg border p-2.5 hover:bg-muted/50"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {run.title || "（无标题）"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(run.time).toLocaleString("zh-CN", { hour12: false })}
                  </p>
                </div>
                <Button size="sm" variant="secondary" onClick={() => onLoad(run)}>
                  载入
                </Button>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  aria-label="删除记录"
                  onClick={() => onDelete(run.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-xs text-muted-foreground">
          记录仅保存在当前浏览器的 localStorage，最多保留 20 条，不会上传。
        </p>
      </div>
    </div>
  );
}
