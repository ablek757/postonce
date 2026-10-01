"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { loadByok, saveByok, type ByokConfig } from "@/lib/client";
import { KeyRound, ShieldCheck, X } from "lucide-react";

export interface ServerInfo {
  provider: string;
  providerLabel: string;
  model: string;
  keyConfigured: boolean;
}

interface Props {
  open: boolean;
  onClose: () => void;
  serverInfo: ServerInfo | null;
}

/** BYOK 设置面板：baseURL / API Key / 模型名，仅存浏览器 localStorage，经自定义 header 传给后端 */
export function SettingsSheet({ open, onClose, serverInfo }: Props) {
  const [form, setForm] = useState<ByokConfig>({ baseURL: "", apiKey: "", model: "" });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (open) {
      const byok = loadByok();
      setForm(byok ?? { baseURL: "", apiKey: "", model: "" });
      setSaved(false);
    }
  }, [open]);

  if (!open) return null;

  function handleSave() {
    const baseURL = form.baseURL.trim();
    const apiKey = form.apiKey.trim();
    const model = form.model.trim();
    if (baseURL || apiKey || model) {
      if (!baseURL || !apiKey || !model) return;
      saveByok({ baseURL, apiKey, model });
    } else {
      saveByok(null);
    }
    setSaved(true);
    setTimeout(onClose, 500);
  }

  function handleClear() {
    saveByok(null);
    setForm({ baseURL: "", apiKey: "", model: "" });
    setSaved(true);
    setTimeout(onClose, 500);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border bg-background p-5 shadow-lg"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="模型设置"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <KeyRound className="size-4" /> 模型设置（BYOK）
          </h2>
          <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="关闭">
            <X className="size-4" />
          </Button>
        </div>

        <div className="mb-4 space-y-2 rounded-lg bg-muted/50 p-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">服务端预设</span>
            <Badge variant="secondary">{serverInfo?.providerLabel ?? "加载中…"}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">服务端密钥</span>
            <Badge variant={serverInfo?.keyConfigured ? "default" : "destructive"}>
              {serverInfo?.keyConfigured ? "已配置" : "未配置"}
            </Badge>
          </div>
          {serverInfo && !serverInfo.keyConfigured && (
            <p className="text-xs text-destructive">
              服务端未配置密钥时，需要在下方填写自己的模型配置才能使用 AI 功能。
            </p>
          )}
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="byok-base">Base URL（OpenAI 兼容，如 https://api.deepseek.com）</Label>
            <Input
              id="byok-base"
              placeholder="https://api.deepseek.com"
              value={form.baseURL}
              onChange={(e) => setForm({ ...form, baseURL: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="byok-key">API Key</Label>
            <Input
              id="byok-key"
              type="password"
              placeholder="sk-..."
              value={form.apiKey}
              onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="byok-model">模型名</Label>
            <Input
              id="byok-model"
              placeholder="deepseek-chat"
              value={form.model}
              onChange={(e) => setForm({ ...form, model: e.target.value })}
            />
          </div>
        </div>

        <p className="mt-3 flex items-start gap-1.5 text-xs text-muted-foreground">
          <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
          密钥仅保存在你的浏览器 localStorage，请求时通过自定义 header 携带；服务端不会把密钥写入日志。
          三个字段需同时填写（或全部留空使用服务端预设）。
        </p>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={handleClear}>
            清除自定义配置
          </Button>
          <Button onClick={handleSave} disabled={saved}>
            {saved ? "已保存" : "保存"}
          </Button>
        </div>
      </div>
    </div>
  );
}
