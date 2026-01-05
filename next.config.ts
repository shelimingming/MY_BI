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
      // 只排除 Prisma CLI 工具（开发时使用），但保留 @prisma/client 运行时文件
      "node_modules/prisma/build/**",
      "node_modules/prisma/migration-engine/**",
      "node_modules/prisma/introspection-engine/**",
      "node_modules/prisma/format-engine/**",
      // 排除 Prisma 查询引擎的二进制文件（使用二进制文件优化）
      // 注意：不要排除 .prisma/client 目录，因为运行时需要它
      "node_modules/.prisma/client/libquery_engine-*",
      "node_modules/.prisma/client/query_engine-*",
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
  // 明确包含 Prisma 客户端文件，确保运行时可用
  outputFileTracingIncludes: {
    "/api/**": [
      "node_modules/.prisma/client/**",
      "node_modules/@prisma/client/**",
    ],
  },
};

export default nextConfig;
