import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

/**
 * 获取角色列表
 * GET /api/roles
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

    // 获取查询参数
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";

    // 构建查询条件
    const where: Prisma.RoleWhereInput = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { displayName: { contains: search, mode: "insensitive" } },
      ];
    }

    // 获取角色列表（包含权限信息）
    const roles = await prisma.role.findMany({
      where,
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
      orderBy: {
        createdAt: "asc",
      },
    });

    // 格式化返回数据
    const formattedRoles = roles.map((role) => ({
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
    }));

    return NextResponse.json({
      roles: formattedRoles,
    });
  } catch (error) {
    console.error("获取角色列表失败:", error);
    return NextResponse.json(
      { error: "获取角色列表失败" },
      { status: 500 }
    );
  }
}

/**
 * 创建角色
 * POST /api/roles
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
    const { name, displayName, description, permissionIds } = body;

    // 验证必填字段
    if (!name || !displayName) {
      return NextResponse.json(
        { error: "角色代码和显示名称为必填项" },
        { status: 400 }
      );
    }

    // 检查角色代码是否已存在
    const existingRole = await prisma.role.findUnique({
      where: { name },
    });

    if (existingRole) {
      return NextResponse.json(
        { error: "角色代码已存在" },
        { status: 400 }
      );
    }

    // 创建角色
    const role = await prisma.role.create({
      data: {
        name,
        displayName,
        description,
        rolePermissions: permissionIds && permissionIds.length > 0 ? {
          create: permissionIds.map((permissionId: string) => ({
            permissionId,
          })),
        } : undefined,
      },
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

    return NextResponse.json({
      role: formattedRole,
      message: "角色创建成功",
    });
  } catch (error) {
    console.error("创建角色失败:", error);
    return NextResponse.json(
      { error: "创建角色失败" },
      { status: 500 }
    );
  }
}

