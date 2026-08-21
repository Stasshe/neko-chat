import type { NextConfig } from "next";
import { z } from "zod";

const basePathSchema = z
  .string()
  .regex(/^$|^\/[A-Za-z0-9._~!$&'()*+,;=:@%-]+(?:\/[A-Za-z0-9._~!$&'()*+,;=:@%-]+)*$/, {
    error: "NEXT_PUBLIC_BASE_PATH must be empty or a URL path without a trailing slash.",
  });

const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
let normalizedBasePath = rawBasePath.trim();
if (normalizedBasePath && !normalizedBasePath.startsWith("/")) {
  normalizedBasePath = `/${normalizedBasePath}`;
}
const basePath = basePathSchema.parse(normalizedBasePath);

const nextConfig: NextConfig = {
  reactCompiler: true,
};
if (basePath) {
  nextConfig.basePath = basePath;
  nextConfig.assetPrefix = basePath;
}

export default nextConfig;
