# My BI Dashboard

现代商业智能仪表盘 - 基于 Next.js 16 + TypeScript + Tailwind CSS + shadcn/ui

## 📋 项目介绍

My BI Dashboard 是一个现代化的全栈 Web 应用程序，专为商业智能分析设计。项目采用最新的前端技术栈，提供卓越的开发体验和用户体验。

### ✨ 核心特性

- **🚀 高性能**: 基于 Next.js 16 App Router，支持 Server Components 和 SSR
- **🎨 现代化 UI**: 使用 Tailwind CSS + shadcn/ui 构建，美观且可定制
- **📊 数据可视化**: 集成 Recharts 图表库，支持丰富的数据展示
- **✨ 流畅动画**: Framer Motion 提供流畅的交互动画
- **🔒 类型安全**: TypeScript 全类型支持，减少运行时错误
- **📏 代码规范**: ESLint + Prettier 双重保障代码质量

## 🛠 技术栈

### 前端技术

| 技术 | 用途 |
|------|------|
| **React 19** | UI 组件库 |
| **Next.js 16** | React 框架，支持 SSR 和 API Routes |
| **TypeScript 5** | 类型安全的编程语言 |
| **Tailwind CSS 4** | 原子化 CSS 框架 |
| **shadcn/ui** | 基于 Radix UI 的美观组件库 |
| **Framer Motion** | 声明式动画库 |
| **Recharts** | 数据可视化图表库 |
| **Lucide React** | 图标库 |

### 开发工具

| 技术 | 用途 |
|------|------|
| **ESLint 9** | JavaScript/TypeScript 代码检查 |
| **Prettier** | 代码格式化 |
| **Git** | 版本控制 |

## 📁 项目结构

```
my_bi/
├── public/                 # 静态资源文件
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── api/           # API Routes
│   │   │   └── health/    # 健康检查接口
│   │   │       └── route.ts
│   │   ├── globals.css    # 全局样式
│   │   ├── layout.tsx     # 根布局组件
│   │   └── page.tsx       # 首页
│   ├── components/        # React 组件
│   │   └── ui/            # UI 组件库
│   │       ├── button.tsx
│   │       └── card.tsx
│   └── lib/               # 工具函数
│       └── utils.ts       # 通用工具函数
├── .eslintrc.mjs          # ESLint 配置
├── .prettierrc            # Prettier 配置
├── next.config.ts         # Next.js 配置
├── tailwind.config.ts     # Tailwind CSS 配置
├── tsconfig.json          # TypeScript 配置
└── package.json           # 项目依赖
```

## 🚀 快速开始

### 环境要求

- Node.js 18.17+ 
- npm / yarn / pnpm / bun

### 安装依赖

```bash
# 使用 npm
npm install

# 或使用 yarn
yarn install

# 或使用 pnpm
pnpm install
```

### 开发模式

```bash
npm run dev
```

开发服务器运行在 [http://localhost:3000](http://localhost:3000)

### 生产构建

```bash
npm run build
npm run start
```

### 代码检查

```bash
# ESLint 检查
npm run lint

# 代码格式化
npx prettier --write .
```

## 📡 API 接口

### 健康检查接口

**端点**: `GET /api/health`

**响应示例**:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0",
  "services": {
    "api": "running",
    "database": "connected",
    "cache": "ready"
  },
  "uptime": 3600.5,
  "memory": {
    "heapUsed": 12345678,
    "heapTotal": 23456789
  }
}
```

**支持方法**: GET, POST

## 🎨 自定义主题

项目使用 CSS 变量定义主题，支持亮色和暗色模式。可以在 `src/app/globals.css` 中修改主题色：

```css
:root {
  --primary: 221.2 83.2% 53.3%;  /* 主色调 */
  --secondary: 210 40% 96.1%;    /* 次要色 */
  --destructive: 0 84.2% 60.2%;  /* 危险色 */
}
```

## 📦 已安装的依赖

### 生产依赖

- `@radix-ui/react-dialog` - 对话框组件
- `@radix-ui/react-dropdown-menu` - 下拉菜单组件
- `@radix-ui/react-slot` - 组件插槽
- `class-variance-authority` - CSS 类名变体管理
- `clsx` - 条件类名合并
- `tailwind-merge` - Tailwind 类名合并
- `tailwindcss-animate` - Tailwind 动画
- `framer-motion` - 动画库
- `lucide-react` - 图标库
- `recharts` - 图表库

### 开发依赖

- `@tailwindcss/postcss` - Tailwind CSS PostCSS 插件
- `@types/node` - Node.js 类型定义
- `@types/react` - React 类型定义
- `@types/react-dom` - React DOM 类型定义
- `eslint` - 代码检查工具
- `eslint-config-next` - Next.js ESLint 配置
- `typescript` - TypeScript 编译器
- `tailwindcss` - CSS 框架

## 🔧 配置说明

### TypeScript 配置

项目使用严格的 TypeScript 配置，开启了以下选项：
- 严格模式 (strict mode)
- 增量编译
- 路径别名 (@/*)

### ESLint 配置

使用 Next.js 推荐的 ESLint 配置，包括：
- TypeScript 语法检查
- React 最佳实践
- Next.js 特定规则

### Prettier 配置

代码格式化规则：
- 使用单引号
- 分号结尾
- 2 空格缩进
- 最大行宽 100 字符

## 📖 学习资源

- [Next.js 文档](https://nextjs.org/docs)
- [TypeScript 文档](https://www.typescriptlang.org/docs)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [shadcn/ui 文档](https://ui.shadcn.com)
- [Framer Motion 文档](https://www.framer.com/motion)
- [Recharts 文档](https://recharts.org)

## 📄 许可证

MIT License

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！
