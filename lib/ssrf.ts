import { lookup } from "node:dns/promises";
import net from "node:net";

const DESKTOP_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

export const FETCH_TIMEOUT_MS = 15_000;
const MAX_REDIRECTS = 3;
const MAX_BODY_BYTES = 2 * 1024 * 1024; // 网页 HTML 最多取 2MB

export class SsrfError extends Error {}

function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) return true;
  const [a, b] = parts;
  if (a === 0) return true; // 0.0.0.0/8
  if (a === 10) return true; // 10/8
  if (a === 127) return true; // 127/8
  if (a === 169 && b === 254) return true; // 链路本地 169.254/16
  if (a === 172 && b >= 16 && b <= 31) return true; // 172.16/12
  if (a === 192 && b === 168) return true; // 192.168/16
  if (a === 100 && b >= 64 && b <= 127) return true; // 100.64/10 CGNAT
  if (a === 192 && b === 0) return true; // 192.0.0/24
  if (a === 198 && (b === 18 || b === 19)) return true; // 198.18/15 基准测试
  if (a >= 224) return true; // 组播/保留/广播
  if (a === 203 && b === 0 && parts[2] === 113) return true; // 203.0.113/24
  return false;
}

function isPrivateIPv6(ip: string): boolean {
  const lower = ip.toLowerCase();
  if (lower === "::1" || lower === "::") return true;
  if (lower.startsWith("fe80:")) return true; // 链路本地
  if (lower.startsWith("fe90:") || lower.startsWith("fea0:") || lower.startsWith("feb0:")) return true;
  if (lower.startsWith("fc") || lower.startsWith("fd")) return true; // ULA fc00::/7
  if (lower.startsWith("::ffff:")) {
    // IPv4 映射地址，按 IPv4 规则判断
    const v4 = lower.slice("::ffff:".length);
    return isPrivateIPv4(v4);
  }
  if (lower.startsWith("ff")) return true; // 组播
  return false;
}

function isPrivateIP(ip: string): boolean {
  if (net.isIPv6(ip)) return isPrivateIPv6(ip);
  return isPrivateIPv4(ip);
}

async function assertUrlAllowed(rawUrl: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new SsrfError("链接格式不正确，请输入完整的 http(s) 链接");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new SsrfError("仅支持 http/https 链接");
  }

  const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal") ||
    hostname.endsWith(".lan")
  ) {
    throw new SsrfError("不允许抓取本机或内网地址");
  }

  // 字面量 IP 直接判断
  if (net.isIPv4(hostname) || net.isIPv6(hostname)) {
    if (isPrivateIP(hostname)) {
      throw new SsrfError("不允许抓取本机或内网地址");
    }
    return url;
  }

  // 域名做 DNS 解析，拒绝解析到内网的域名
  try {
    const records = await lookup(hostname, { all: true, verbatim: true });
    if (records.length === 0) throw new SsrfError("域名无法解析");
    for (const r of records) {
      if (isPrivateIP(r.address)) {
        throw new SsrfError("不允许抓取本机或内网地址");
      }
    }
  } catch (err) {
    if (err instanceof SsrfError) throw err;
    throw new SsrfError("域名解析失败，请检查链接是否正确");
  }
  return url;
}

/**
 * 带 SSRF 防护的网页抓取：
 * - 仅 http/https
 * - 拒绝 localhost / 内网 IP / 解析到内网的域名
 * - 手动跟随重定向，每一跳都重新校验
 * - 超时与体积上限保护
 */
export async function fetchWebPage(
  rawUrl: string
): Promise<{ html: string; finalUrl: string }> {
  let url = (await assertUrlAllowed(rawUrl)).toString();

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    let res: Response;
    try {
      res = await fetch(url, {
        signal: controller.signal,
        redirect: "manual",
        headers: {
          "user-agent": DESKTOP_UA,
          accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
        },
      });
    } catch (err) {
      clearTimeout(timer);
      if (err instanceof SsrfError) throw err;
      if (controller.signal.aborted) {
        throw new Error("网页抓取失败：目标站点响应超时");
      }
      throw new Error("网页抓取失败：无法连接到目标站点");
    }

    // timer 保持存活直至响应体读完，覆盖"header 快、body 慢"的挂死场景
    try {
      if (res.status >= 300 && res.status < 400) {
        const location = res.headers.get("location");
        res.headers.get("set-cookie"); // 消费响应，避免连接复用挂起
        await res.arrayBuffer().catch(() => undefined);
        if (!location) throw new Error("网页抓取失败：重定向地址缺失");
        const next = new URL(location, url).toString();
        url = (await assertUrlAllowed(next)).toString();
        continue;
      }

      if (!res.ok) {
        throw new Error(`网页抓取失败：目标站点返回 ${res.status}`);
      }

      const contentType = res.headers.get("content-type") || "";
      if (contentType && !/text\/html|application\/xhtml/i.test(contentType)) {
        throw new Error("目标链接不是网页（Content-Type 不是 HTML）");
      }

      // 限制读取体积
      const reader = res.body?.getReader();
      if (!reader) throw new Error("网页抓取失败：响应为空");
      const chunks: Uint8Array[] = [];
      let total = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        total += value.byteLength;
        if (total > MAX_BODY_BYTES) break;
        chunks.push(value);
      }
      const merged = new Uint8Array(Math.min(total, MAX_BODY_BYTES));
      let offset = 0;
      for (const c of chunks) {
        merged.set(c.subarray(0, merged.length - offset), offset);
        offset += Math.min(c.byteLength, merged.length - offset);
        if (offset >= merged.length) break;
      }
      const charset = /charset=([\w-]+)/i.exec(contentType)?.[1];
      return {
        html: new TextDecoder(charset || "utf-8").decode(merged),
        finalUrl: url,
      };
    } catch (err) {
      if (controller.signal.aborted) {
        throw new Error("网页抓取失败：目标站点响应超时");
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }

  throw new Error("网页抓取失败：重定向次数过多");
}
