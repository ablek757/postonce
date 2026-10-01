"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CoverStudio } from "@/components/cover-studio";
import { TitleCandidates } from "@/components/title-candidates";
import type { XiaohongshuDraft } from "@/lib/types";
import { Hash } from "lucide-react";

interface Props {
  draft: XiaohongshuDraft;
  selectedTitle: number;
  onSelectTitle: (i: number) => void;
  onChange: (draft: XiaohongshuDraft) => void;
}

export function XiaohongshuPanel({ draft, selectedTitle, onSelectTitle, onChange }: Props) {
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
          <Label htmlFor="xhs-body">正文（≤800 字，emoji 分段）</Label>
          <span className="text-xs text-muted-foreground">{draft.body.length} 字</span>
        </div>
        <Textarea
          id="xhs-body"
          className="min-h-52 resize-y whitespace-pre-wrap"
          value={draft.body}
          onChange={(e) => onChange({ ...draft, body: e.target.value })}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="xhs-tags">话题标签（5-10 个，用逗号或空格分隔，保存时自动加 #）</Label>
        <div className="relative">
          <Hash className="absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
          <Textarea
            id="xhs-tags"
            className="min-h-12 resize-y pl-8"
            value={draft.tags.join(" ")}
            onChange={(e) => {
              const tags = e.target.value
                .split(/[,，\s]+/)
                .map((t) => t.replace(/^#+/, "").trim())
                .filter(Boolean);
              onChange({ ...draft, tags });
            }}
          />
        </div>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {draft.tags.map((t) => (
            <Badge key={t} variant="secondary">#{t}</Badge>
          ))}
        </div>
      </div>

      <CoverStudio
        main={draft.coverText.main}
        sub={draft.coverText.sub}
        onChange={(patch) =>
          onChange({ ...draft, coverText: { ...draft.coverText, ...patch } })
        }
      />
    </div>
  );
}
