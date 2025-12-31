# RBAC权限管理快速开始

## 步骤1：安装依赖

如果还没有安装 `tsx`，需要先安装：

```bash
npm install -D tsx
```

## 步骤2：运行数据库迁移

更新数据库schema以创建RBAC相关表：

```bash
npx prisma migrate dev --name add_rbac
```

或者如果使用 Prisma 的 db push：

```bash
npx prisma db push
```

## 步骤3：初始化默认数据

运行初始化脚本，创建默认角色、权限和菜单：

```bash
npm run db:seed
```

这将创建：
- 3个默认角色：admin（管理员）、user（普通用户）、guest（访客）
- 12个默认权限：包括用户管理、角色管理、权限管理、菜单管理等
- 5个默认菜单：仪表盘、用户管理、系统管理（包含角色管理和菜单管理）

## 步骤4：测试

1. 启动开发服务器：
   ```bash
   npm run dev
   ```

2. 注册一个新用户（会自动分配 `user` 角色）

3. 登录后，你应该能看到根据权限显示的菜单：
   - 普通用户：可以看到仪表盘和用户管理
   - 管理员：可以看到所有菜单

## 步骤5：创建管理员用户

如果需要将某个用户设置为管理员，可以通过以下方式：

### 方法1：使用 Prisma Studio

```bash
npx prisma studio
```

在 Prisma Studio 中：
1. 找到 `User` 表，记录用户的 ID
2. 找到 `Role` 表，记录 `admin` 角色的 ID
3. 在 `UserRole` 表中创建新记录，关联用户和 admin 角色

### 方法2：使用数据库查询

```sql
-- 假设用户邮箱是 admin@example.com
INSERT INTO "UserRole" ("id", "userId", "roleId", "createdAt")
SELECT 
  gen_random_uuid()::text,
  u.id,
  r.id,
  NOW()
FROM "User" u, "Role" r
WHERE u.email = 'admin@example.com' AND r.name = 'admin';
```

### 方法3：创建管理脚本

可以创建一个管理脚本来分配角色（可选）。

## 验证

登录后，检查：
1. 侧边栏是否显示菜单
2. 菜单是否根据用户权限正确显示
3. 在浏览器控制台查看 session，应该包含 `roles` 和 `permissions` 字段

## 常见问题

### Q: 菜单没有显示？

A: 检查以下几点：
1. 是否运行了 `npm run db:seed`？
2. 用户是否已登录？
3. 用户是否有相应的权限？
4. 检查浏览器控制台是否有错误

### Q: 权限修改后没有生效？

A: 权限信息存储在 JWT token 中，修改角色/权限后需要重新登录才能生效。

### Q: 如何添加新菜单？

A: 可以通过 Prisma Studio 或直接使用 Prisma Client 添加菜单。参考 `RBAC_GUIDE.md` 中的说明。

## 下一步

- 查看 `RBAC_GUIDE.md` 了解详细的使用方法
- 根据需要添加更多角色和权限
- 创建权限管理界面（可选）



