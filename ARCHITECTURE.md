# 项目架构说明

## 目录结构详解

### `/app` - Next.js App Router

Next.js 13+ 的 App Router 目录，所有路由和页面都在此目录下。

- `app/page.tsx` - 首页
- `app/layout.tsx` - 根布局组件
- `app/globals.css` - 全局样式文件
- `app/api/` - API 路由目录

### `/app/api` - API 路由

使用 Next.js API Routes 创建的后端接口。

- `app/api/health/` - 健康检查接口
  - `route.ts` - API 路由处理函数
  - `README.md` - 接口文档

### `/components` - React 组件

可复用的 React 组件。

- `components/ui/` - shadcn/ui 组件（通过 CLI 自动添加）

### `/lib` - 工具函数库

通用的工具函数和辅助方法。

- `lib/utils.ts` - 通用工具函数（如 cn 函数用于合并 className）

### `/hooks` - 自定义 Hooks

可复用的自定义 React Hooks。

### `/public` - 静态资源

静态文件目录，如图片、图标等。

## 技术架构

### 前端架构

- **React 19**: 使用最新的 React 特性
- **Next.js 16**: App Router 架构，支持服务端渲染和静态生成
- **TypeScript**: 类型安全，提升开发体验

### 样式架构

- **Tailwind CSS 4**: 实用优先的 CSS 框架
- **shadcn/ui**: 基于 Tailwind CSS 的组件库
- **CSS Variables**: 支持主题切换（明暗模式）

### 动画架构

- **Framer Motion**: 声明式动画库，用于页面和组件动画

### 代码质量

- **ESLint**: 代码检查工具
- **Prettier**: 代码格式化工具
- **TypeScript**: 静态类型检查

## 扩展指南

### 添加新的 API 路由

1. 在 `app/api/` 下创建新目录
2. 创建 `route.ts` 文件
3. 导出 HTTP 方法函数（GET、POST、PUT、DELETE 等）

示例：

```typescript
// app/api/users/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ users: [] });
}

export async function POST(request: Request) {
  const body = await request.json();
  // 处理 POST 请求
  return NextResponse.json({ success: true });
}
```

### 添加新的页面

1. 在 `app/` 下创建新目录或文件
2. 创建 `page.tsx` 文件
3. 导出默认组件

示例：

```typescript
// app/about/page.tsx
export default function About() {
  return <div>About Page</div>;
}
```

### 添加新的组件

1. 在 `components/` 下创建组件文件
2. 使用 TypeScript 和 Tailwind CSS
3. 如需使用 shadcn/ui 组件，先通过 CLI 添加

### 添加自定义 Hook

1. 在 `hooks/` 下创建 Hook 文件
2. 使用 `use` 前缀命名
3. 导出 Hook 函数

示例：

```typescript
// hooks/useDebounce.ts
import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

## 最佳实践

1. **组件组织**: 按功能模块组织组件，保持单一职责
2. **类型安全**: 充分利用 TypeScript 的类型系统
3. **代码复用**: 提取可复用的逻辑到 Hooks 或工具函数
4. **性能优化**: 使用 Next.js 的优化特性（Image、Link 等）
5. **可访问性**: 遵循 Web 可访问性标准
6. **响应式设计**: 使用 Tailwind CSS 的响应式类名

## 集成建议

### tRPC 集成（可选）

如需类型安全的 API，可以考虑集成 tRPC：

```bash
npm install @trpc/server @trpc/client @trpc/react-query @trpc/next
```

### Supabase 集成（可选）

如需后端即服务（BaaS），可以集成 Supabase：

```bash
npm install @supabase/supabase-js
```

### 状态管理（可选）

如需全局状态管理，可以考虑：

- Zustand（轻量级）
- Redux Toolkit（功能强大）
- Jotai（原子化状态管理）

