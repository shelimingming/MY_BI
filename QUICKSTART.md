# 快速开始指南

## 🚀 5 分钟快速上手

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### 3. 测试健康检查接口

```bash
curl http://localhost:3000/api/health
```

或在浏览器中访问：http://localhost:3000/api/health

## 📝 常用命令

```bash
# 开发
npm run dev              # 启动开发服务器

# 构建
npm run build            # 构建生产版本
npm start                # 启动生产服务器

# 代码质量
npm run lint             # 检查代码规范
npm run lint:fix         # 自动修复代码规范问题
npm run format           # 格式化代码
npm run format:check     # 检查代码格式
npm run type-check       # TypeScript 类型检查
```

## 🎨 添加 shadcn/ui 组件

```bash
# 查看可用组件
npx shadcn@latest add

# 添加特定组件
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
```

## 🔌 创建新的 API 路由

在 `app/api/` 目录下创建新目录和 `route.ts` 文件：

```typescript
// app/api/example/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Hello from API" });
}
```

## 📄 创建新页面

在 `app/` 目录下创建新目录和 `page.tsx` 文件：

```typescript
// app/about/page.tsx
export default function About() {
  return <div>About Page</div>;
}
```

## 🎭 使用 Framer Motion

```typescript
import { motion } from "framer-motion";

export default function AnimatedComponent() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      Hello World
    </motion.div>
  );
}
```

## 📚 下一步

- 阅读 [README.md](./README.md) 了解项目详情
- 阅读 [ARCHITECTURE.md](./ARCHITECTURE.md) 了解项目架构
- 查看 [Next.js 文档](https://nextjs.org/docs) 学习更多功能

