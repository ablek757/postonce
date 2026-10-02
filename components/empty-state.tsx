"use client";

import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  BadgeCheck,
  ClipboardPaste,
  Coins,
  ScanSearch,
  Send,
  Server,
  Zap,
} from "lucide-react";

const STEPS = [
  {
    icon: ClipboardPaste,
    title: "输入",
    desc: "粘贴文本、网页链接，或 B 站 / YouTube / 播客音视频链接",
  },
  {
    icon: ScanSearch,
    title: "AI 结构化理解",
    desc: "提取总结、要点、读者画像与金句，全程可编辑",
  },
  {
    icon: Send,
    title: "五平台草稿 + 封面",
    desc: "小红书、公众号、知乎、微博、头条并行出稿，模板封面秒出",
  },
];

const VALUE_POINTS = [
  { icon: Zap, text: "30 秒出稿" },
  { icon: Coins, text: "单次约 1 分钱" },
  { icon: Server, text: "开源可自托管" },
  { icon: BadgeCheck, text: "支持国产免费模型" },
];

/** 首屏空状态：三步流程 + 核心价值点（产生分析结果后由父组件隐藏） */
export function EmptyState() {
  return (
    <section className="rounded-xl border bg-card/60 px-5 py-6 sm:px-8 sm:py-8">
      <div className="grid gap-4 sm:grid-cols-3 sm:gap-2">
        {STEPS.map((step, i) => (
          <div key={step.title} className="relative flex items-start gap-3 sm:block sm:text-center">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full border bg-muted/60 sm:mx-auto">
              <step.icon className="size-4.5 text-muted-foreground" aria-hidden />
            </div>
            <div className="min-w-0 sm:mt-3">
              <p className="flex items-center gap-1.5 text-sm font-semibold sm:justify-center">
                <span className="text-xs font-normal text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {step.title}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{step.desc}</p>
            </div>
            {i < STEPS.length - 1 && (
              <ArrowRight
                className="absolute top-4 -right-2 hidden size-4 text-muted-foreground/50 sm:block"
                aria-hidden
              />
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-2 border-t pt-5">
        {VALUE_POINTS.map((v) => (
          <Badge key={v.text} variant="secondary" className="gap-1.5 px-2.5 py-1 font-normal">
            <v.icon className="size-3.5 text-muted-foreground" aria-hidden />
            {v.text}
          </Badge>
        ))}
      </div>
    </section>
  );
}
