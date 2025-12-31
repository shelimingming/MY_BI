import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

/**
 * 获取单个角色信息
 * GET /api/roles/[id]
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

    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        rolePermissions: {
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
        _count: {
          select: {
            userRoles: true,
          },
        },
      },
    });

    if (!role) {
      return NextResponse.json(
        { error: "角色不存在" },
        { status: 404 }
      );
    }

    // 格式化返回数据
    const formattedRole = {
      id: role.id,
      name: role.name,
      displayName: role.displayName,
      description: role.description,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
      permissions: role.rolePermissions.map((rp) => ({
        id: rp.permission.id,
        code: rp.permission.code,
        name: rp.permission.name,
      })),
      userCount: role._count.userRoles,
    };

    return NextResponse.json({ role: formattedRole });
  } catch (error) {
    console.error("获取角色信息失败:", error);
    return NextResponse.json(
      { error: "获取角色信息失败" },
      { status: 500 }
    );
  }
}

/**
 * 更新角色信息
 * PUT /api/roles/[id]
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
    const { name, displayName, description, permissionIds } = body;

    // 检查角色是否存在
    const existingRole = await prisma.role.findUnique({
      where: { id },
    });

    if (!existingRole) {
      return NextResponse.json(
        { error: "角色不存在" },
        { status: 404 }
      );
    }

    // 如果更新角色代码，检查是否已被其他角色使用
    if (name && name !== existingRole.name) {
      const nameExists = await prisma.role.findUnique({
        where: { name },
      });

      if (nameExists) {
        return NextResponse.json(
          { error: "角色代码已被使用" },
          { status: 400 }
        );
      }
    }

    // 准备更新数据
    const updateData: {
      name?: string;
      displayName?: string;
      description?: string | null;
    } = {};
    if (name !== undefined) updateData.name = name;
    if (displayName !== undefined) updateData.displayName = displayName;
    if (description !== undefined) updateData.description = description;

    // 更新角色信息
    await prisma.role.update({
      where: { id },
      data: updateData,
    });

    // 如果提供了权限ID列表，更新角色权限
    if (permissionIds !== undefined) {
      // 删除现有权限关联
      await prisma.rolePermission.deleteMany({
        where: { roleId: id },
      });

      // 创建新的权限关联
      if (permissionIds.length > 0) {
        await prisma.rolePermission.createMany({
          data: permissionIds.map((permissionId: string) => ({
            roleId: id,
            permissionId,
          })),
        });
      }
    }

    // 获取更新后的角色信息（包含权限）
    const updatedRole = await prisma.role.findUnique({
      where: { id },
      include: {
        rolePermissions: {
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
        _count: {
          select: {
            userRoles: true,
          },
        },
      },
    });

    // 格式化返回数据
    const formattedRole = {
      id: updatedRole!.id,
      name: updatedRole!.name,
      displayName: updatedRole!.displayName,
      description: updatedRole!.description,
      createdAt: updatedRole!.createdAt,
      updatedAt: updatedRole!.updatedAt,
      permissions: updatedRole!.rolePermissions.map((rp) => ({
        id: rp.permission.id,
        code: rp.permission.code,
        name: rp.permission.name,
      })),
      userCount: updatedRole!._count.userRoles,
    };

    return NextResponse.json({
      role: formattedRole,
      message: "角色更新成功",
    });
  } catch (error) {
    console.error("更新角色失败:", error);
    return NextResponse.json(
      { error: "更新角色失败" },
      { status: 500 }
    );
  }
}

/**
 * 删除角色
 * DELETE /api/roles/[id]
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

    // 检查角色是否存在
    const existingRole = await prisma.role.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            userRoles: true,
          },
        },
      },
    });

    if (!existingRole) {
      return NextResponse.json(
        { error: "角色不存在" },
        { status: 404 }
      );
    }

    // 检查是否有用户使用该角色
    if (existingRole._count.userRoles > 0) {
      return NextResponse.json(
        { error: "该角色正在被使用，无法删除" },
        { status: 400 }
      );
    }

    // 删除角色（级联删除关联的权限关系）
    await prisma.role.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "角色删除成功",
    });
  } catch (error) {
    console.error("删除角色失败:", error);
    return NextResponse.json(
      { error: "删除角色失败" },
      { status: 500 }
    );
  }
}

