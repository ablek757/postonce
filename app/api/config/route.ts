import { NextResponse } from "next/server";
import { getServerProviderInfo } from "@/lib/llm";

/** 告知前端当前服务端模型预设与密钥配置状态（不含任何密钥） */
export async function GET() {
  return NextResponse.json(getServerProviderInfo());
}
