import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

/**
 * 获取单个菜单信息
 * GET /api/system/menus/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 解包 params Promise
    const { id } = await params;
    
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

    const menu = await prisma.menu.findUnique({
      where: { id },
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

    if (!menu) {
      return NextResponse.json(
        { error: "菜单不存在" },
        { status: 404 }
      );
    }

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

    return NextResponse.json({ menu: formattedMenu });
  } catch (error) {
    console.error("获取菜单信息失败:", error);
    return NextResponse.json(
      { error: "获取菜单信息失败" },
      { status: 500 }
    );
  }
}

/**
 * 更新菜单信息
 * PUT /api/system/menus/[id]
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 解包 params Promise
    const { id } = await params;
    
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

    // 检查菜单是否存在
    const existingMenu = await prisma.menu.findUnique({
      where: { id },
    });

    if (!existingMenu) {
      return NextResponse.json(
        { error: "菜单不存在" },
        { status: 404 }
      );
    }

    // 如果更新菜单代码，检查是否已被其他菜单使用
    if (code && code !== existingMenu.code) {
      const codeExists = await prisma.menu.findUnique({
        where: { code },
      });

      if (codeExists) {
        return NextResponse.json(
          { error: "菜单代码已被使用" },
          { status: 400 }
        );
      }
    }

    // 如果指定了父菜单，检查父菜单是否存在且不是自己
    if (parentId) {
      if (parentId === id) {
        return NextResponse.json(
          { error: "不能将自己设置为父菜单" },
          { status: 400 }
        );
      }

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

    // 准备更新数据
    const updateData: {
      code?: string;
      name?: string;
      path?: string | null;
      icon?: string | null;
      parentId?: string | null;
      order?: number;
      isVisible?: boolean;
    } = {};
    if (code !== undefined) updateData.code = code;
    if (name !== undefined) updateData.name = name;
    if (path !== undefined) updateData.path = path || null;
    if (icon !== undefined) updateData.icon = icon || null;
    if (parentId !== undefined) updateData.parentId = parentId || null;
    if (order !== undefined) updateData.order = order;
    if (isVisible !== undefined) updateData.isVisible = isVisible;

    // 更新菜单信息
    await prisma.menu.update({
      where: { id },
      data: updateData,
    });

    // 如果提供了权限ID列表，更新菜单权限
    if (permissionIds !== undefined) {
      // 删除现有权限关联
      await prisma.menuPermission.deleteMany({
        where: { menuId: id },
      });

      // 创建新的权限关联
      if (permissionIds.length > 0) {
        await prisma.menuPermission.createMany({
          data: permissionIds.map((permissionId: string) => ({
            menuId: id,
            permissionId,
          })),
        });
      }
    }

    // 获取更新后的菜单信息（包含权限）
    const updatedMenu = await prisma.menu.findUnique({
      where: { id },
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
      id: updatedMenu!.id,
      code: updatedMenu!.code,
      name: updatedMenu!.name,
      path: updatedMenu!.path,
      icon: updatedMenu!.icon,
      parentId: updatedMenu!.parentId,
      parent: updatedMenu!.parent,
      order: updatedMenu!.order,
      isVisible: updatedMenu!.isVisible,
      createdAt: updatedMenu!.createdAt,
      updatedAt: updatedMenu!.updatedAt,
      permissions: updatedMenu!.menuPermissions.map((mp) => ({
        id: mp.permission.id,
        code: mp.permission.code,
        name: mp.permission.name,
      })),
    };

    return NextResponse.json({
      menu: formattedMenu,
      message: "菜单更新成功",
    });
  } catch (error) {
    console.error("更新菜单失败:", error);
    return NextResponse.json(
      { error: "更新菜单失败" },
      { status: 500 }
    );
  }
}

/**
 * 删除菜单
 * DELETE /api/system/menus/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 解包 params Promise
    const { id } = await params;
    
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

    // 检查菜单是否存在
    const existingMenu = await prisma.menu.findUnique({
      where: { id },
      include: {
        children: true,
      },
    });

    if (!existingMenu) {
      return NextResponse.json(
        { error: "菜单不存在" },
        { status: 404 }
      );
    }

    // 检查是否有子菜单
    if (existingMenu.children.length > 0) {
      return NextResponse.json(
        { error: "该菜单下有子菜单，请先删除子菜单" },
        { status: 400 }
      );
    }

    // 删除菜单（级联删除关联的权限关系）
    await prisma.menu.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "菜单删除成功",
    });
  } catch (error) {
    console.error("删除菜单失败:", error);
    return NextResponse.json(
      { error: "删除菜单失败" },
      { status: 500 }
    );
  }
}

