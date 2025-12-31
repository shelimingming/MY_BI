import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/rbac";
import { RoleManagement } from "@/components/role-management";

/**
 * 角色管理页面
 * 只有管理员可以访问
 */
export default async function RolesPage() {
  // 检查是否登录
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  // 检查是否是管理员
  const admin = await isAdmin();
  if (!admin) {
    redirect("/");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">角色管理</h1>
        <p className="text-muted-foreground mt-2">
          管理系统中的所有角色，包括创建、编辑、删除角色和分配权限
        </p>
      </div>
      <RoleManagement />
    </div>
  );
}

