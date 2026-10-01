import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 原生模块 / wasm 资源不参与打包，运行时直接 require
  serverExternalPackages: ["@resvg/resvg-js", "jsdom", "satori"],
};

export default nextConfig;
