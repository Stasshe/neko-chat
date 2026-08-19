import type { NextConfig } from "next";

let basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
if (basePath && !basePath.startsWith("/")) {
  basePath = `/${basePath}`;
}

const nextConfig: NextConfig = {};
if (basePath) {
  nextConfig.basePath = basePath;
  nextConfig.assetPrefix = basePath;
}

export default nextConfig;
