"use client";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check } from "lucide-react";

interface Props {
  titles: string[];
  selected: number;
  onSelect: (index: number) => void;
  onEdit: (index: number, value: string) => void;
}

/** 标题候选：点击切换选中，选中项可直接编辑 */
export function TitleCandidates({ titles, selected, onSelect, onEdit }: Props) {
  return (
    <div className="space-y-2">
      <Label>标题候选（点击选中，可修改）</Label>
      <div className="space-y-2">
        {titles.map((t, i) => {
          const active = i === selected;
          return (
            <div
              key={i}
              className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 transition-colors ${
                active ? "border-primary bg-primary/5" : "hover:bg-muted/60"
              }`}
            >
              <button
                type="button"
                onClick={() => onSelect(i)}
                className="flex size-5 shrink-0 items-center justify-center rounded-full border"
                aria-label={`选择标题 ${i + 1}`}
              >
                {active && <Check className="size-3.5 text-primary" />}
              </button>
              <Input
                value={t}
                onChange={(e) => onEdit(i, e.target.value)}
                className={`h-8 min-w-0 border-transparent bg-transparent px-1 shadow-none focus-visible:border-input ${
                  active ? "font-medium" : "text-muted-foreground"
                }`}
                aria-label={`标题候选 ${i + 1}`}
              />
              {active && (
                <Badge className="hidden shrink-0 sm:inline-flex">当前</Badge>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
