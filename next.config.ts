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
      // 排除客户端库（只在客户端使用，不应在 SSR 中）
      "node_modules/recharts/**",
      "node_modules/framer-motion/**",
      // 排除测试相关
      "node_modules/**/*.test.*",
      "node_modules/**/*.spec.*",
      "node_modules/**/__tests__/**",
      "node_modules/**/test/**",
      "node_modules/**/tests/**",
      // 排除文档和示例
      "node_modules/**/README*",
      "node_modules/**/CHANGELOG*",
      "node_modules/**/LICENSE*",
      "node_modules/**/*.md",
      "node_modules/**/docs/**",
      "node_modules/**/examples/**",
      "node_modules/**/example/**",
      // 排除源码映射（生产环境不需要）
      "node_modules/**/*.map",
      // 排除大型依赖的额外文件
      "node_modules/@radix-ui/**/README*",
      "node_modules/@radix-ui/**/*.md",
      "node_modules/lucide-react/dist/esm/icons/*.d.ts",
      // 排除 Prisma 客户端的文档和脚本（运行时不需要）
      "node_modules/@prisma/client/README*",
      "node_modules/@prisma/client/*.md",
      "node_modules/@prisma/client/scripts/**",
      // 排除不必要的二进制文件
      "node_modules/**/*.node",
      "node_modules/**/*.dylib",
      "node_modules/**/*.so",
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
