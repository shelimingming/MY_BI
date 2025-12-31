import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * 为用户1绑定管理员权限
 */
async function main() {
  console.log("开始为用户1绑定管理员权限...");

  try {
    // 1. 查找第一个用户（用户1）
    const firstUser = await prisma.user.findFirst({
      orderBy: {
        createdAt: "asc",
      },
    });

    if (!firstUser) {
      console.error("未找到用户，请先创建用户");
      process.exit(1);
    }

    console.log(`找到用户: ${firstUser.email} (ID: ${firstUser.id})`);

    // 2. 查找管理员角色
    const adminRole = await prisma.role.findUnique({
      where: { name: "admin" },
    });

    if (!adminRole) {
      console.error("未找到管理员角色，请先运行 npm run db:seed");
      process.exit(1);
    }

    console.log(`找到管理员角色: ${adminRole.displayName} (ID: ${adminRole.id})`);

    // 3. 检查用户是否已经有管理员角色
    const existingUserRole = await prisma.userRole.findUnique({
      where: {
        userId_roleId: {
          userId: firstUser.id,
          roleId: adminRole.id,
        },
      },
    });

    if (existingUserRole) {
      console.log("用户已经拥有管理员权限");
      return;
    }

    // 4. 创建用户角色关联
    await prisma.userRole.create({
      data: {
        userId: firstUser.id,
        roleId: adminRole.id,
      },
    });

    console.log("✅ 成功为用户1绑定管理员权限！");
    console.log(`用户: ${firstUser.email}`);
    console.log(`角色: ${adminRole.displayName}`);
  } catch (error) {
    console.error("绑定管理员权限失败:", error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error("执行失败:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

