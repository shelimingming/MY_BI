import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * RBAC权限管理工具函数库
 * 提供角色和权限检查功能
 */

/**
 * 检查用户是否拥有指定角色
 * @param userRoles 用户角色列表
 * @param requiredRoles 需要的角色列表（任一即可）
 * @returns 是否拥有所需角色
 */
export function hasRole(
  userRoles: string[] | undefined,
  requiredRoles: string | string[]
): boolean {
  if (!userRoles || userRoles.length === 0) {
    return false;
  }

  const roles = Array.isArray(requiredRoles)
    ? requiredRoles
    : [requiredRoles];

  return roles.some((role) => userRoles.includes(role));
}

/**
 * 检查用户是否拥有指定权限
 * @param userPermissions 用户权限列表
 * @param requiredPermissions 需要的权限列表（任一即可）
 * @returns 是否拥有所需权限
 */
export function hasPermission(
  userPermissions: string[] | undefined,
  requiredPermissions: string | string[]
): boolean {
  if (!userPermissions || userPermissions.length === 0) {
    return false;
  }

  const permissions = Array.isArray(requiredPermissions)
    ? requiredPermissions
    : [requiredPermissions];

  return permissions.some((permission) =>
    userPermissions.includes(permission)
  );
}

/**
 * 检查用户是否拥有所有指定权限（需要全部拥有）
 * @param userPermissions 用户权限列表
 * @param requiredPermissions 需要的权限列表（全部需要）
 * @returns 是否拥有所有所需权限
 */
export function hasAllPermissions(
  userPermissions: string[] | undefined,
  requiredPermissions: string[]
): boolean {
  if (!userPermissions || userPermissions.length === 0) {
    return false;
  }

  return requiredPermissions.every((permission) =>
    userPermissions.includes(permission)
  );
}

/**
 * 从session中获取用户角色和权限（服务端使用）
 * @returns 用户角色和权限信息
 */
export async function getUserRolesAndPermissions() {
  const session = await auth();
  if (!session?.user) {
    return {
      roles: [],
      permissions: [],
    };
  }

  return {
    roles: session.user.roles || [],
    permissions: session.user.permissions || [],
  };
}

/**
 * 获取用户可访问的菜单列表
 * @param userId 用户ID
 * @returns 可访问的菜单列表
 */
export async function getUserMenus(userId: string) {
  // 获取用户的所有权限
  const user = await prisma.user.findUnique({
    where: { id: userId },
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

  if (!user) {
    return [];
  }

  // 收集用户的所有权限代码
  const userPermissions = new Set<string>();
  user.userRoles.forEach((ur: { role: { rolePermissions: Array<{ permission: { code: string } }> } }) => {
    ur.role.rolePermissions.forEach((rp: { permission: { code: string } }) => {
      userPermissions.add(rp.permission.code);
    });
  });

  // 获取所有菜单及其权限要求
  const allMenus = await prisma.menu.findMany({
    where: {
      isVisible: true,
    },
    include: {
      menuPermissions: {
        include: {
          permission: true,
        },
      },
    },
    orderBy: [
      { order: "asc" },
      { createdAt: "asc" },
    ],
  });

  // 过滤出用户有权限访问的菜单
  const accessibleMenus = allMenus.filter((menu: { menuPermissions: Array<{ permission: { code: string } }> }) => {
    // 如果菜单没有权限要求，则所有用户都可以访问
    if (menu.menuPermissions.length === 0) {
      return true;
    }

    // 检查用户是否拥有菜单所需的任一权限
    return menu.menuPermissions.some((mp: { permission: { code: string } }) =>
      userPermissions.has(mp.permission.code)
    );
  });

  // 构建菜单树结构
  return buildMenuTree(accessibleMenus);
}

/**
 * 菜单项类型定义
 */
interface MenuNode {
  id: string;
  code: string;
  name: string;
  path: string | null;
  icon: string | null;
  parentId: string | null;
  order: number;
  isVisible: boolean;
  children: MenuNode[];
  menuPermissions?: Array<{ permission: { code: string } }>;
}

/**
 * 菜单项输入类型（用于构建树之前，children 可选）
 */
type MenuNodeInput = Omit<MenuNode, 'children'> & {
  children?: MenuNode[];
};

/**
 * 构建菜单树结构
 * @param menus 扁平菜单列表
 * @returns 树形菜单结构
 */
function buildMenuTree(menus: MenuNodeInput[]): MenuNode[] {
  const menuMap = new Map<string, MenuNode>();
  const rootMenus: MenuNode[] = [];

  // 创建菜单映射
  menus.forEach((menu) => {
    menuMap.set(menu.id, {
      ...menu,
      children: [],
    });
  });

  // 构建树结构
  menus.forEach((menu) => {
    const menuNode = menuMap.get(menu.id);
    if (!menuNode) {
      return; // 跳过无效的菜单节点
    }

    if (menu.parentId) {
      const parent = menuMap.get(menu.parentId);
      if (parent) {
        parent.children.push(menuNode);
      } else {
        // 父菜单不存在或不可访问，作为根菜单
        rootMenus.push(menuNode);
      }
    } else {
      rootMenus.push(menuNode);
    }
  });

  return rootMenus;
}

/**
 * 检查用户是否可以访问指定菜单
 * @param userId 用户ID
 * @param menuCode 菜单代码
 * @returns 是否可以访问
 */
export async function canAccessMenu(
  userId: string,
  menuCode: string
): Promise<boolean> {
  const userMenus = await getUserMenus(userId);
  return checkMenuInTree(userMenus, menuCode);
}

/**
 * 递归检查菜单是否在树中
 * @param menus 菜单树
 * @param menuCode 菜单代码
 * @returns 是否找到
 */
function checkMenuInTree(menus: MenuNode[], menuCode: string): boolean {
  for (const menu of menus) {
    if (menu.code === menuCode) {
      return true;
    }
    if (menu.children && menu.children.length > 0) {
      if (checkMenuInTree(menu.children, menuCode)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * 检查当前用户是否是管理员（服务端使用）
 * @returns 是否是管理员
 */
export async function isAdmin(): Promise<boolean> {
  const { roles } = await getUserRolesAndPermissions();
  return hasRole(roles, "admin");
}

/**
 * 检查用户是否是管理员（客户端使用）
 * @param userRoles 用户角色列表
 * @returns 是否是管理员
 */
export function isAdminRole(userRoles: string[] | undefined): boolean {
  return hasRole(userRoles, "admin");
}

