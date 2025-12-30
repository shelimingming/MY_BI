import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import type { NextAuthConfig } from "next-auth";

/**
 * Auth.js 配置
 * 使用 Prisma 适配器和 Credentials 提供者实现账号密码登录
 */
export const authConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "邮箱", type: "email" },
        password: { label: "密码", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // 查找用户，同时获取角色和权限信息
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email as string,
          },
          include: {
            userRoles: {
              include: {
                role: {
                  include: {
                    rolePermissions: {
                      include: {
                        permission: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });

        if (!user || !user.password) {
          return null;
        }

        // 验证密码
        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        // 提取用户角色和权限
        const roles = user.userRoles.map((ur: { role: { name: string } }) => ur.role.name);
        const permissions = new Set<string>();
        user.userRoles.forEach((ur: { role: { rolePermissions: Array<{ permission: { code: string } }> } }) => {
          ur.role.rolePermissions.forEach((rp: { permission: { code: string } }) => {
            permissions.add(rp.permission.code);
          });
        });

        // 返回用户信息（包含角色和权限）
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          roles: roles,
          permissions: Array.from(permissions),
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.roles = user.roles;
        token.permissions = user.permissions;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.roles = token.roles;
        session.user.permissions = token.permissions;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;

export const { handlers, signIn, signOut, auth } = NextAuth(authConfig);

