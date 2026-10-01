// 把 LLM 调用异常翻译为面向用户的中文提示
export function friendlyLlmError(err: unknown): string {
  const e = err as { statusCode?: number; message?: string; code?: string };
  if (e?.statusCode === 401 || e?.code === "invalid_api_key") {
    return "模型 API Key 无效或已过期，请检查密钥配置";
  }
  if (e?.statusCode === 404) {
    return "模型接口地址或模型名不正确（404），请检查 baseURL 与模型名";
  }
  if (e?.statusCode === 429) {
    return "模型服务限流或余额不足（429），请稍后重试或更换模型";
  }
  if (
    e?.code === "ECONNRESET" ||
    e?.code === "ETIMEDOUT" ||
    e?.code === "UND_ERR_CONNECT_TIMEOUT"
  ) {
    return "无法连接到模型服务，请检查网络或 baseURL 配置";
  }
  return `模型调用失败：${e?.message || "未知错误"}`;
}
