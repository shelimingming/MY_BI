# 现代全栈项目

基于 Next.js、React、TypeScript、Tailwind CSS 和 shadcn/ui 构建的现代化全栈应用框架。

## 🚀 技术栈

- **前端框架**: React 19 + Next.js 16
- **样式方案**: Tailwind CSS 4
- **UI 组件库**: shadcn/ui
- **动画库**: Framer Motion
- **开发语言**: TypeScript
- **代码规范**: ESLint + Prettier

## 📁 项目结构

```
cursor/
├── app/                    # Next.js App Router 目录
│   ├── api/               # API 路由
│   │   └── health/        # 健康检查接口
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 首页
├── components/            # React 组件
│   └── ui/               # shadcn/ui 组件
├── lib/                   # 工具函数
│   └── utils.ts          # 通用工具函数
├── hooks/                 # 自定义 React Hooks
├── public/                # 静态资源
├── .eslintrc.json        # ESLint 配置
├── .prettierrc           # Prettier 配置
├── components.json        # shadcn/ui 配置
├── next.config.ts        # Next.js 配置
├── package.json          # 项目依赖
├── tsconfig.json         # TypeScript 配置
└── README.md            # 项目文档
```

## 🛠️ 开发指南

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本

```bash
npm run build
```

### 启动生产服务器

```bash
npm start
```

## 📝 代码规范

### 代码检查

```bash
# 检查代码规范
npm run lint

# 自动修复代码规范问题
npm run lint:fix
```

### 代码格式化

```bash
# 格式化代码
npm run format

# 检查代码格式
npm run format:check
```

### TypeScript 类型检查

```bash
npm run type-check
```

## 🔌 API 接口

### 健康检查接口

- **端点**: `/api/health`
- **方法**: `GET`
- **说明**: 返回系统运行状态信息

详细文档请参考 [app/api/health/README.md](./app/api/health/README.md)

## 🎨 使用 shadcn/ui

添加 shadcn/ui 组件：

```bash
npx shadcn@latest add [component-name]
```

例如：

```bash
npx shadcn@latest add button
npx shadcn@latest add card
```

## 📦 扩展性

### 添加新的 API 路由

在 `app/api/` 目录下创建新的路由文件：

```typescript
// app/api/example/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Hello World" });
}
```

### 添加新的页面

在 `app/` 目录下创建新的页面文件或目录：

```typescript
// app/about/page.tsx
export default function About() {
  return <div>About Page</div>;
}
```

### 集成 tRPC（可选）

如需使用 tRPC，可以安装并配置：

```bash
npm install @trpc/server @trpc/client @trpc/react-query @trpc/next
```

### 集成 Supabase（可选）

如需使用 Supabase，可以安装并配置：

```bash
npm install @supabase/supabase-js
```

## 🔧 配置说明

### Tailwind CSS

Tailwind CSS 配置位于 `app/globals.css`，已集成 shadcn/ui 的主题变量。

### TypeScript

TypeScript 配置位于 `tsconfig.json`，已配置路径别名 `@/*`。

### ESLint

ESLint 配置位于 `eslint.config.mjs`，已集成 Prettier。

### Prettier

Prettier 配置位于 `.prettierrc`，已配置代码格式化规则。

## 📚 相关文档

- [Next.js 文档](https://nextjs.org/docs)
- [React 文档](https://react.dev)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [shadcn/ui 文档](https://ui.shadcn.com)
- [Framer Motion 文档](https://www.framer.com/motion)
- [TypeScript 文档](https://www.typescriptlang.org/docs)

## 📄 许可证

MIT
