# RBAC权限管理使用指南

## 概述

本系统实现了基于角色的访问控制（RBAC）权限管理系统，支持：
- 角色管理（Role）
- 权限管理（Permission）
- 菜单权限控制（Menu）
- 用户角色分配

## 数据库结构

### 核心表

1. **Role（角色表）**
   - `name`: 角色代码（如：admin, user, guest）
   - `displayName`: 显示名称
   - `description`: 角色描述

2. **Permission（权限表）**
   - `code`: 权限代码（如：user:read, user:write）
   - `name`: 权限名称
   - `resource`: 资源类型（如：user, menu, dashboard）
   - `action`: 操作类型（如：read, write, delete）

3. **Menu（菜单表）**
   - `code`: 菜单代码
   - `name`: 菜单名称
   - `path`: 路由路径
   - `icon`: 图标
   - `parentId`: 父菜单ID（支持菜单树结构）
   - `order`: 排序
   - `isVisible`: 是否可见

4. **关联表**
   - `UserRole`: 用户-角色关联（多对多）
   - `RolePermission`: 角色-权限关联（多对多）
   - `MenuPermission`: 菜单-权限关联（多对多）

## 初始化数据

运行以下命令初始化默认角色、权限和菜单：

```bash
# 安装tsx（如果还没有安装）
npm install -D tsx

# 运行初始化脚本
npm run db:seed
```

### 默认角色

- **admin（管理员）**: 拥有所有权限
- **user（普通用户）**: 拥有基本权限（查看用户、仪表盘、菜单）
- **guest（访客）**: 只有只读权限（查看仪表盘、菜单）

### 默认权限

- `user:read` - 查看用户
- `user:write` - 编辑用户
- `user:delete` - 删除用户
- `role:read` - 查看角色
- `role:write` - 编辑角色
- `permission:read` - 查看权限
- `permission:write` - 编辑权限
- `menu:read` - 查看菜单
- `menu:write` - 编辑菜单
- `dashboard:read` - 查看仪表盘
- `admin:all` - 管理员全部权限

### 默认菜单

- **仪表盘** (`/`) - 需要 `dashboard:read` 权限
- **用户管理** (`/users`) - 需要 `user:read` 权限
- **系统管理**（父菜单）
  - **角色管理** (`/system/roles`) - 需要 `role:read` 权限
  - **菜单管理** (`/system/menus`) - 需要 `menu:read` 权限

## 使用方法

### 1. 在组件中检查权限

#### 服务端组件

```typescript
import { getUserRolesAndPermissions, hasRole, hasPermission } from "@/lib/rbac";

export default async function MyPage() {
  const { roles, permissions } = await getUserRolesAndPermissions();

  // 检查角色
  if (!hasRole(roles, "admin")) {
    return <div>无权限访问</div>;
  }

  // 检查权限
  if (!hasPermission(permissions, "user:write")) {
    return <div>无权限编辑用户</div>;
  }

  return <div>有权限的内容</div>;
}
```

#### 客户端组件

```typescript
"use client";

import { useSession } from "next-auth/react";
import { hasRole, hasPermission } from "@/lib/rbac";

export default function MyComponent() {
  const { data: session } = useSession();
  const roles = session?.user?.roles || [];
  const permissions = session?.user?.permissions || [];

  if (!hasRole(roles, "admin")) {
    return <div>无权限访问</div>;
  }

  return <div>有权限的内容</div>;
}
```

### 2. 在API路由中检查权限

```typescript
import { auth } from "@/auth";
import { hasPermission } from "@/lib/rbac";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const permissions = session.user.permissions || [];
  if (!hasPermission(permissions, "user:write")) {
    return NextResponse.json({ error: "无权限" }, { status: 403 });
  }

  // 处理请求...
}
```

### 3. 获取用户菜单

菜单组件会自动根据用户权限显示可访问的菜单。菜单数据通过 `/api/menus` API获取。

### 4. 创建新菜单

```typescript
import { prisma } from "@/lib/prisma";

// 创建菜单
const menu = await prisma.menu.create({
  data: {
    code: "my-menu",
    name: "我的菜单",
    path: "/my-menu",
    icon: "📝",
    order: 10,
    isVisible: true,
  },
});

// 为菜单分配权限
await prisma.menuPermission.create({
  data: {
    menuId: menu.id,
    permissionId: permissionId, // 需要先获取权限ID
  },
});
```

### 5. 为用户分配角色

```typescript
import { prisma } from "@/lib/prisma";

// 获取角色
const adminRole = await prisma.role.findUnique({
  where: { name: "admin" },
});

// 为用户分配角色
await prisma.userRole.create({
  data: {
    userId: userId,
    roleId: adminRole!.id,
  },
});
```

## 权限检查函数

### `hasRole(userRoles, requiredRoles)`

检查用户是否拥有指定角色（任一即可）。

```typescript
hasRole(["admin", "user"], "admin"); // true
hasRole(["user"], ["admin", "user"]); // true
hasRole(["guest"], "admin"); // false
```

### `hasPermission(userPermissions, requiredPermissions)`

检查用户是否拥有指定权限（任一即可）。

```typescript
hasPermission(["user:read", "user:write"], "user:read"); // true
hasPermission(["user:read"], ["user:read", "user:write"]); // true
hasPermission(["user:read"], "user:delete"); // false
```

### `hasAllPermissions(userPermissions, requiredPermissions)`

检查用户是否拥有所有指定权限（全部需要）。

```typescript
hasAllPermissions(["user:read", "user:write"], ["user:read", "user:write"]); // true
hasAllPermissions(["user:read"], ["user:read", "user:write"]); // false
```

## 菜单系统

菜单系统支持：
- 多级菜单（通过 `parentId` 实现）
- 菜单排序（通过 `order` 字段）
- 菜单可见性控制（通过 `isVisible` 字段）
- 基于权限的菜单显示（通过 `MenuPermission` 关联）

菜单会自动根据用户权限过滤，只显示用户有权限访问的菜单。

## 注意事项

1. **新用户注册**：新用户会自动分配 `user` 角色
2. **权限缓存**：用户权限信息存储在JWT token中，修改角色/权限后需要重新登录才能生效
3. **菜单权限**：如果菜单没有分配权限，则所有用户都可以访问
4. **角色继承**：当前系统不支持角色继承，需要显式分配所有权限

## 扩展建议

1. **添加权限中间件**：可以创建Next.js中间件来统一检查权限
2. **权限管理界面**：可以创建管理界面来管理角色、权限和菜单
3. **权限日志**：可以添加权限操作日志记录
4. **动态权限**：可以根据业务需求添加动态权限检查逻辑






