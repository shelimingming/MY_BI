import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserMenus } from "@/lib/rbac";

/**
 * 获取用户可访问的菜单列表
 * GET /api/menus
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "未登录" },
        { status: 401 }
      );
    }

    // 获取用户可访问的菜单
    const menus = await getUserMenus(session.user.id);

    return NextResponse.json({
      menus,
    });
  } catch (error) {
    console.error("获取菜单失败:", error);
    return NextResponse.json(
      { error: "获取菜单失败" },
      { status: 500 }
    );
  }
}


