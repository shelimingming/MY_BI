import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

/**
 * 用户注册 API
 * POST /api/auth/register
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    // 验证输入
    if (!email || !password) {
      return NextResponse.json(
        { error: "邮箱和密码是必填项" },
        { status: 400 }
      );
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "邮箱格式不正确" },
        { status: 400 }
      );
    }

    // 验证密码长度
    if (password.length < 6) {
      return NextResponse.json(
        { error: "密码长度至少为 6 位" },
        { status: 400 }
      );
    }

    // 检查用户是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "该邮箱已被注册" },
        { status: 400 }
      );
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 查找默认角色（user角色）
    const defaultRole = await prisma.role.findUnique({
      where: { name: "user" },
    });

    if (!defaultRole) {
      // 如果默认角色不存在，创建用户但不分配角色
      // 这种情况应该不会发生，因为初始化脚本会创建默认角色
      console.warn("默认角色 'user' 不存在，用户创建时未分配角色");
    }

    // 创建用户并分配默认角色
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
        userRoles: defaultRole
          ? {
              create: {
                roleId: defaultRole.id,
              },
            }
          : undefined,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        message: "注册成功",
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("注册错误:", error);
    return NextResponse.json(
      { error: "注册失败，请稍后重试" },
      { status: 500 }
    );
  }
}

