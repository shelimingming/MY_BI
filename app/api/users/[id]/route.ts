import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

/**
 * 获取单个用户信息
 * GET /api/users/[id]
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

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        userRoles: {
          include: {
            role: {
              select: {
                id: true,
                name: true,
                displayName: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "用户不存在" },
        { status: 404 }
      );
    }

    // 格式化返回数据（不包含密码）
    const formattedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      roles: user.userRoles.map((ur) => ({
        id: ur.role.id,
        name: ur.role.name,
        displayName: ur.role.displayName,
      })),
    };

    return NextResponse.json({ user: formattedUser });
  } catch (error) {
    console.error("获取用户信息失败:", error);
    return NextResponse.json(
      { error: "获取用户信息失败" },
      { status: 500 }
    );
  }
}

/**
 * 更新用户信息
 * PUT /api/users/[id]
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
    const { name, email, password, roleIds } = body;

    // 检查用户是否存在
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "用户不存在" },
        { status: 404 }
      );
    }

    // 如果更新邮箱，检查是否已被其他用户使用
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email },
      });

      if (emailExists) {
        return NextResponse.json(
          { error: "邮箱已被使用" },
          { status: 400 }
        );
      }
    }

    // 准备更新数据
    const updateData: {
      name?: string;
      email?: string;
      password?: string;
    } = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // 更新用户信息
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    // 如果提供了角色ID列表，更新用户角色
    if (roleIds !== undefined) {
      // 删除现有角色关联
      await prisma.userRole.deleteMany({
        where: { userId: id },
      });

      // 创建新的角色关联
      if (roleIds.length > 0) {
        await prisma.userRole.createMany({
          data: roleIds.map((roleId: string) => ({
            userId: id,
            roleId,
          })),
        });
      }
    }

    // 获取更新后的用户信息（包含角色）
    const updatedUser = await prisma.user.findUnique({
      where: { id },
      include: {
        userRoles: {
          include: {
            role: {
              select: {
                id: true,
                name: true,
                displayName: true,
              },
            },
          },
        },
      },
    });

    // 格式化返回数据（不包含密码）
    const formattedUser = {
      id: updatedUser!.id,
      name: updatedUser!.name,
      email: updatedUser!.email,
      image: updatedUser!.image,
      createdAt: updatedUser!.createdAt,
      updatedAt: updatedUser!.updatedAt,
      roles: updatedUser!.userRoles.map((ur) => ({
        id: ur.role.id,
        name: ur.role.name,
        displayName: ur.role.displayName,
      })),
    };

    return NextResponse.json({
      user: formattedUser,
      message: "用户更新成功",
    });
  } catch (error) {
    console.error("更新用户失败:", error);
    return NextResponse.json(
      { error: "更新用户失败" },
      { status: 500 }
    );
  }
}

/**
 * 删除用户
 * DELETE /api/users/[id]
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

    // 不能删除自己
    if (id === session.user.id) {
      return NextResponse.json(
        { error: "不能删除自己的账户" },
        { status: 400 }
      );
    }

    // 检查用户是否存在
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "用户不存在" },
        { status: 404 }
      );
    }

    // 删除用户（级联删除关联的角色关系）
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "用户删除成功",
    });
  } catch (error) {
    console.error("删除用户失败:", error);
    return NextResponse.json(
      { error: "删除用户失败" },
      { status: 500 }
    );
  }
}

