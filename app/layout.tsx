import type { Metadata, Viewport } from "next";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

export const metadata: Metadata = {
  title: "PostOnce · 一稿多发",
  description:
    "Write once, publish everywhere. 写一次，发全网 — 粘贴文本、链接或视频，AI 一键产出小红书/公众号/知乎/微博/头条发布级草稿与封面。",
  openGraph: {
    title: "PostOnce · 一稿多发",
    description:
      "Write once, publish everywhere. 写一次，发全网 — AI 跨平台内容二创，五平台草稿 + 模板封面一键出。",
    type: "website",
    siteName: "PostOnce",
  },
  twitter: {
    card: "summary",
    title: "PostOnce · 一稿多发",
    description:
      "Write once, publish everywhere. 写一次，发全网 — AI 跨平台内容二创 Agent。",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
