import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

/**
 * 获取菜单列表（扁平结构，用于管理）
 * GET /api/system/menus
 */
export async function GET(request: NextRequest) {
  try {
    // 检查是否登录
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "未登录" },
        { status: 401 }
      );
    }

    // 检查是否是管理员
    if (!(await isAdmin())) {
      return NextResponse.json(
        { error: "无权限访问" },
        { status: 403 }
      );
    }

    // 获取所有菜单（包含权限信息）
    const menus = await prisma.menu.findMany({
      include: {
        menuPermissions: {
          include: {
            permission: {
              select: {
                id: true,
                code: true,
                name: true,
              },
            },
          },
        },
        parent: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      orderBy: [
        { order: "asc" },
        { createdAt: "asc" },
      ],
    });

    // 格式化返回数据
    const formattedMenus = menus.map((menu) => ({
      id: menu.id,
      code: menu.code,
      name: menu.name,
      path: menu.path,
      icon: menu.icon,
      parentId: menu.parentId,
      parent: menu.parent,
      order: menu.order,
      isVisible: menu.isVisible,
      createdAt: menu.createdAt,
      updatedAt: menu.updatedAt,
      permissions: menu.menuPermissions.map((mp) => ({
        id: mp.permission.id,
        code: mp.permission.code,
        name: mp.permission.name,
      })),
    }));

    return NextResponse.json({
      menus: formattedMenus,
    });
  } catch (error) {
    console.error("获取菜单列表失败:", error);
    return NextResponse.json(
      { error: "获取菜单列表失败" },
      { status: 500 }
    );
  }
}

/**
 * 创建菜单
 * POST /api/system/menus
 */
export async function POST(request: NextRequest) {
  try {
    // 检查是否登录
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "未登录" },
        { status: 401 }
      );
    }

    // 检查是否是管理员
    if (!(await isAdmin())) {
      return NextResponse.json(
        { error: "无权限访问" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { code, name, path, icon, parentId, order, isVisible, permissionIds } = body;

    // 验证必填字段
    if (!code || !name) {
      return NextResponse.json(
        { error: "菜单代码和名称为必填项" },
        { status: 400 }
      );
    }

    // 检查菜单代码是否已存在
    const existingMenu = await prisma.menu.findUnique({
      where: { code },
    });

    if (existingMenu) {
      return NextResponse.json(
        { error: "菜单代码已存在" },
        { status: 400 }
      );
    }

    // 如果指定了父菜单，检查父菜单是否存在
    if (parentId) {
      const parentMenu = await prisma.menu.findUnique({
        where: { id: parentId },
      });

      if (!parentMenu) {
        return NextResponse.json(
          { error: "父菜单不存在" },
          { status: 400 }
        );
      }
    }

    // 创建菜单
    const menu = await prisma.menu.create({
      data: {
        code,
        name,
        path: path || null,
        icon: icon || null,
        parentId: parentId || null,
        order: order || 0,
        isVisible: isVisible !== undefined ? isVisible : true,
        menuPermissions: permissionIds && permissionIds.length > 0 ? {
          create: permissionIds.map((permissionId: string) => ({
            permissionId,
          })),
        } : undefined,
      },
      include: {
        menuPermissions: {
          include: {
            permission: {
              select: {
                id: true,
                code: true,
                name: true,
              },
            },
          },
        },
        parent: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    // 格式化返回数据
    const formattedMenu = {
      id: menu.id,
      code: menu.code,
      name: menu.name,
      path: menu.path,
      icon: menu.icon,
      parentId: menu.parentId,
      parent: menu.parent,
      order: menu.order,
      isVisible: menu.isVisible,
      createdAt: menu.createdAt,
      updatedAt: menu.updatedAt,
      permissions: menu.menuPermissions.map((mp) => ({
        id: mp.permission.id,
        code: mp.permission.code,
        name: mp.permission.name,
      })),
    };

    return NextResponse.json({
      menu: formattedMenu,
      message: "菜单创建成功",
    });
  } catch (error) {
    console.error("创建菜单失败:", error);
    return NextResponse.json(
      { error: "创建菜单失败" },
      { status: 500 }
    );
  }
}

