import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * 数据库初始化脚本
 * 创建默认角色、权限和菜单
 */
async function main() {
  console.log("开始初始化RBAC数据...");

  // 1. 创建角色
  console.log("创建角色...");
  const adminRole = await prisma.role.upsert({
    where: { name: "admin" },
    update: {},
    create: {
      name: "admin",
      displayName: "管理员",
      description: "系统管理员，拥有所有权限",
    },
  });

  const userRole = await prisma.role.upsert({
    where: { name: "user" },
    update: {},
    create: {
      name: "user",
      displayName: "普通用户",
      description: "普通用户，拥有基本权限",
    },
  });

  const guestRole = await prisma.role.upsert({
    where: { name: "guest" },
    update: {},
    create: {
      name: "guest",
      displayName: "访客",
      description: "访客用户，拥有只读权限",
    },
  });

  console.log("角色创建完成");

  // 2. 创建权限
  console.log("创建权限...");
  const permissions = [
    // 用户管理权限
    {
      code: "user:read",
      name: "查看用户",
      description: "可以查看用户信息",
      resource: "user",
      action: "read",
    },
    {
      code: "user:write",
      name: "编辑用户",
      description: "可以创建和编辑用户",
      resource: "user",
      action: "write",
    },
    {
      code: "user:delete",
      name: "删除用户",
      description: "可以删除用户",
      resource: "user",
      action: "delete",
    },
    // 角色管理权限
    {
      code: "role:read",
      name: "查看角色",
      description: "可以查看角色信息",
      resource: "role",
      action: "read",
    },
    {
      code: "role:write",
      name: "编辑角色",
      description: "可以创建和编辑角色",
      resource: "role",
      action: "write",
    },
    // 权限管理权限
    {
      code: "permission:read",
      name: "查看权限",
      description: "可以查看权限信息",
      resource: "permission",
      action: "read",
    },
    {
      code: "permission:write",
      name: "编辑权限",
      description: "可以创建和编辑权限",
      resource: "permission",
      action: "write",
    },
    // 菜单管理权限
    {
      code: "menu:read",
      name: "查看菜单",
      description: "可以查看菜单信息",
      resource: "menu",
      action: "read",
    },
    {
      code: "menu:write",
      name: "编辑菜单",
      description: "可以创建和编辑菜单",
      resource: "menu",
      action: "write",
    },
    // 仪表盘权限
    {
      code: "dashboard:read",
      name: "查看仪表盘",
      description: "可以查看仪表盘",
      resource: "dashboard",
      action: "read",
    },
    // 管理员全部权限
    {
      code: "admin:all",
      name: "管理员全部权限",
      description: "拥有所有权限",
      resource: "admin",
      action: "all",
    },
  ];

  const createdPermissions = [];
  for (const perm of permissions) {
    const permission = await prisma.permission.upsert({
      where: { code: perm.code },
      update: {},
      create: perm,
    });
    createdPermissions.push(permission);
  }

  console.log("权限创建完成");

  // 3. 分配角色权限
  console.log("分配角色权限...");

  // 管理员拥有所有权限
  for (const permission of createdPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: permission.id,
      },
    });
  }

  // 普通用户拥有基本权限
  const userPermissions = createdPermissions.filter(
    (p) =>
      p.code === "user:read" ||
      p.code === "dashboard:read" ||
      p.code === "menu:read"
  );
  for (const permission of userPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: userRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: userRole.id,
        permissionId: permission.id,
      },
    });
  }

  // 访客只有只读权限
  const guestPermissions = createdPermissions.filter(
    (p) => p.code === "dashboard:read" || p.code === "menu:read"
  );
  for (const permission of guestPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: guestRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: guestRole.id,
        permissionId: permission.id,
      },
    });
  }

  console.log("角色权限分配完成");

  // 4. 创建菜单
  console.log("创建菜单...");

  // 获取权限引用
  const dashboardReadPerm = createdPermissions.find(
    (p) => p.code === "dashboard:read"
  )!;
  const userReadPerm = createdPermissions.find((p) => p.code === "user:read")!;
  const userWritePerm = createdPermissions.find(
    (p) => p.code === "user:write"
  )!;
  const roleReadPerm = createdPermissions.find((p) => p.code === "role:read")!;
  const menuReadPerm = createdPermissions.find((p) => p.code === "menu:read")!;

  // 创建根菜单
  const dashboardMenu = await prisma.menu.upsert({
    where: { code: "dashboard" },
    update: {},
    create: {
      code: "dashboard",
      name: "仪表盘",
      path: "/",
      icon: "📊",
      order: 1,
    },
  });

  // 为仪表盘菜单分配权限
  if (dashboardReadPerm) {
    await prisma.menuPermission.upsert({
      where: {
        menuId_permissionId: {
          menuId: dashboardMenu.id,
          permissionId: dashboardReadPerm.id,
        },
      },
      update: {},
      create: {
        menuId: dashboardMenu.id,
        permissionId: dashboardReadPerm.id,
      },
    });
  }

  // 创建用户管理菜单（需要user:read权限）
  const userMenu = await prisma.menu.upsert({
    where: { code: "users" },
    update: {},
    create: {
      code: "users",
      name: "用户管理",
      path: "/users",
      icon: "👥",
      order: 2,
    },
  });

  if (userReadPerm) {
    await prisma.menuPermission.upsert({
      where: {
        menuId_permissionId: {
          menuId: userMenu.id,
          permissionId: userReadPerm.id,
        },
      },
      update: {},
      create: {
        menuId: userMenu.id,
        permissionId: userReadPerm.id,
      },
    });
  }

  // 创建系统管理父菜单
  const systemMenu = await prisma.menu.upsert({
    where: { code: "system" },
    update: {},
    create: {
      code: "system",
      name: "系统管理",
      path: null,
      icon: "⚙️",
      order: 3,
    },
  });

  // 创建角色管理子菜单（需要role:read权限）
  const roleMenu = await prisma.menu.upsert({
    where: { code: "roles" },
    update: {},
    create: {
      code: "roles",
      name: "角色管理",
      path: "/system/roles",
      icon: "🔐",
      parentId: systemMenu.id,
      order: 1,
    },
  });

  if (roleReadPerm) {
    await prisma.menuPermission.upsert({
      where: {
        menuId_permissionId: {
          menuId: roleMenu.id,
          permissionId: roleReadPerm.id,
        },
      },
      update: {},
      create: {
        menuId: roleMenu.id,
        permissionId: roleReadPerm.id,
      },
    });
  }

  // 创建菜单管理子菜单（需要menu:read权限）
  const menuManageMenu = await prisma.menu.upsert({
    where: { code: "menus" },
    update: {},
    create: {
      code: "menus",
      name: "菜单管理",
      path: "/system/menus",
      icon: "📋",
      parentId: systemMenu.id,
      order: 2,
    },
  });

  if (menuReadPerm) {
    await prisma.menuPermission.upsert({
      where: {
        menuId_permissionId: {
          menuId: menuManageMenu.id,
          permissionId: menuReadPerm.id,
        },
      },
      update: {},
      create: {
        menuId: menuManageMenu.id,
        permissionId: menuReadPerm.id,
      },
    });
  }

  console.log("菜单创建完成");
  console.log("RBAC数据初始化完成！");
}

main()
  .catch((e) => {
    console.error("初始化失败:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


