import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

/**
 * 获取权限列表（用于角色管理中的权限选择）
 * GET /api/permissions
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

    // 获取所有权限
    const permissions = await prisma.permission.findMany({
      orderBy: [
        { resource: "asc" },
        { action: "asc" },
      ],
    });

    return NextResponse.json({
      permissions,
    });
  } catch (error) {
    console.error("获取权限列表失败:", error);
    return NextResponse.json(
      { error: "获取权限列表失败" },
      { status: 500 }
    );
  }
}

