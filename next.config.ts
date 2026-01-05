import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // 优化输出文件追踪，排除不必要的文件以减少 SSR functions 包大小
  outputFileTracingExcludes: {
    "*": [
      // 排除编译器和构建工具
      "node_modules/@swc/core-*",
      "node_modules/@next/swc-*",
      "node_modules/next/dist/compiled/@next/swc-*",
      "node_modules/webpack/**",
      // 排除 Prisma 相关文件（运行时不需要）
      "node_modules/prisma/**",
      "node_modules/.prisma/client/libquery_engine-*",
      "node_modules/.prisma/client/query_engine-*",
      "node_modules/.prisma/client/schema.prisma",
      // 排除开发依赖
      "node_modules/@types/**",
      "node_modules/typescript/**",
      "node_modules/eslint/**",
      "node_modules/prettier/**",
      // 排除测试相关
      "node_modules/**/*.test.*",
      "node_modules/**/*.spec.*",
      "node_modules/**/__tests__/**",
      // 排除文档和示例
      "node_modules/**/README*",
      "node_modules/**/CHANGELOG*",
      "node_modules/**/LICENSE*",
      "node_modules/**/*.md",
      // 排除源码映射（生产环境不需要）
      "node_modules/**/*.map",
    ],
  },
};

export default nextConfig;
