import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      roles?: string[]; // 用户角色列表
      permissions?: string[]; // 用户权限列表
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    roles?: string[]; // 用户角色列表
    permissions?: string[]; // 用户权限列表
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    roles?: string[]; // 用户角色列表
    permissions?: string[]; // 用户权限列表
  }
}

