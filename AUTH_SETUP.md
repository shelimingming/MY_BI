# 认证功能设置指南

本项目使用 Auth.js (NextAuth.js v5) + Prisma 实现账号密码登录功能。

## 📋 前置要求

1. PostgreSQL 数据库（本地或远程）
2. Node.js 18+ 和 npm

## 🚀 快速开始

### 1. 安装依赖

依赖已安装，包括：
- `next-auth@beta` - Auth.js (NextAuth.js v5)
- `@auth/prisma-adapter` - Prisma 适配器
- `@prisma/client` - Prisma 客户端
- `prisma` - Prisma CLI
- `bcryptjs` - 密码加密库

### 2. 配置环境变量

复制 `.env.example` 文件为 `.env`：

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置以下变量：

```env
# 数据库连接字符串
DATABASE_URL="postgresql://user:password@localhost:5432/mydb?schema=public"

# NextAuth.js 密钥（用于加密 JWT）
# 生成方式: openssl rand -base64 32
AUTH_SECRET="your-secret-key-here"

# 应用 URL
AUTH_URL="http://localhost:3000"
```

### 3. 初始化数据库

运行 Prisma 迁移来创建数据库表：

```bash
# 生成 Prisma 客户端
npx prisma generate

# 创建数据库迁移
npx prisma migrate dev --name init

# 或者直接推送 schema 到数据库（开发环境）
npx prisma db push
```

### 4. 启动开发服务器

```bash
npm run dev
```

## 📁 项目结构

```
├── auth.ts                          # Auth.js 配置文件
├── lib/
│   └── prisma.ts                    # Prisma 客户端实例
├── prisma/
│   └── schema.prisma                # 数据库模型定义
├── app/
│   ├── api/
│   │   └── auth/
│   │       ├── [...nextauth]/
│   │       │   └── route.ts         # NextAuth API 路由
│   │       └── register/
│   │           └── route.ts          # 用户注册 API
│   ├── login/
│   │   └── page.tsx                 # 登录页面
│   └── register/
│       └── page.tsx                 # 注册页面
├── components/
│   └── providers/
│       └── session-provider.tsx     # Session Provider 组件
└── types/
    └── next-auth.d.ts               # NextAuth 类型定义
```

## 🔐 数据库模型

Prisma schema 包含以下模型：

- **User**: 用户信息（邮箱、密码、姓名等）
- **Account**: OAuth 账户（用于未来扩展第三方登录）
- **Session**: 用户会话
- **VerificationToken**: 验证令牌（用于邮箱验证等）

## 🎯 功能特性

### 已实现功能

- ✅ 用户注册（邮箱 + 密码）
- ✅ 用户登录（邮箱 + 密码）
- ✅ 密码加密存储（bcryptjs）
- ✅ JWT 会话管理
- ✅ 登录/注册页面 UI
- ✅ 类型安全的认证状态

### 使用示例

#### 在服务器组件中获取会话

```typescript
import { auth } from "@/auth";

export default async function Page() {
  const session = await auth();
  
  if (!session) {
    return <div>请先登录</div>;
  }
  
  return <div>欢迎, {session.user.email}</div>;
}
```

#### 在客户端组件中使用会话

```typescript
"use client";

import { useSession } from "next-auth/react";

export default function Component() {
  const { data: session, status } = useSession();
  
  if (status === "loading") {
    return <div>加载中...</div>;
  }
  
  if (!session) {
    return <div>未登录</div>;
  }
  
  return <div>欢迎, {session.user.email}</div>;
}
```

#### 登录/登出

```typescript
"use client";

import { signIn, signOut } from "next-auth/react";

// 登录
await signIn("credentials", {
  email: "user@example.com",
  password: "password",
  redirect: true,
});

// 登出
await signOut({ redirect: true });
```

## 🔒 安全注意事项

1. **密码加密**: 使用 bcryptjs 对密码进行哈希加密（10 轮）
2. **JWT 密钥**: 确保 `AUTH_SECRET` 足够复杂且保密
3. **HTTPS**: 生产环境必须使用 HTTPS
4. **密码策略**: 当前要求密码至少 6 位，可根据需要加强
5. **邮箱验证**: 当前未实现邮箱验证，建议生产环境添加

## 🛠️ 开发工具

### Prisma Studio

可视化查看和编辑数据库：

```bash
npx prisma studio
```

### 数据库迁移

```bash
# 创建新迁移
npx prisma migrate dev --name migration-name

# 应用迁移到生产环境
npx prisma migrate deploy

# 重置数据库（开发环境）
npx prisma migrate reset
```

## 📚 相关文档

- [NextAuth.js v5 文档](https://authjs.dev)
- [Prisma 文档](https://www.prisma.io/docs)
- [bcryptjs 文档](https://www.npmjs.com/package/bcryptjs)

## 🐛 常见问题

### 1. 数据库连接失败

确保：
- PostgreSQL 服务正在运行
- `DATABASE_URL` 配置正确
- 数据库用户有足够权限

### 2. Prisma 客户端未生成

运行：
```bash
npx prisma generate
```

### 3. 认证失败

检查：
- `AUTH_SECRET` 是否已配置
- 用户是否已注册
- 密码是否正确

## 🔄 未来扩展

可以考虑添加的功能：

- [ ] 邮箱验证
- [ ] 密码重置
- [ ] 第三方登录（Google、GitHub 等）
- [ ] 双因素认证（2FA）
- [ ] 记住我功能
- [ ] 登录历史记录

