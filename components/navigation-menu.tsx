"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";

/**
 * 菜单项类型定义
 */
interface MenuItem {
  id: string;
  code: string;
  name: string;
  path: string | null;
  icon: string | null;
  children: MenuItem[];
}

/**
 * 导航菜单组件
 * 根据用户权限动态显示菜单
 */
export function NavigationMenu() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());

  // 获取用户菜单
  useEffect(() => {
    const fetchMenus = async () => {
      if (status === "loading") {
        return;
      }

      if (!session?.user) {
        setMenus([]);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/menus");
        if (response.ok) {
          const data = await response.json();
          setMenus(data.menus || []);
        } else {
          setMenus([]);
        }
      } catch (error) {
        console.error("获取菜单失败:", error);
        setMenus([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMenus();
  }, [session, status]);

  // 切换菜单展开/收起
  const toggleMenu = (menuId: string) => {
    setExpandedMenus((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(menuId)) {
        newSet.delete(menuId);
      } else {
        newSet.add(menuId);
      }
      return newSet;
    });
  };

  // 渲染菜单项
  const renderMenuItem = (menu: MenuItem, level: number = 0) => {
    const hasChildren = menu.children && menu.children.length > 0;
    const isExpanded = expandedMenus.has(menu.id);
    const isActive = pathname === menu.path;

    return (
      <div key={menu.id} className="w-full">
        {hasChildren ? (
          // 有子菜单的情况
          <div>
            <button
              onClick={() => toggleMenu(menu.id)}
              className={`w-full flex items-center justify-between px-4 py-2 text-left rounded-lg transition-colors ${
                isActive
                  ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                  : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
            >
              <div className="flex items-center gap-2">
                {menu.icon && (
                  <span className="text-lg">{menu.icon}</span>
                )}
                <span>{menu.name}</span>
              </div>
              <motion.span
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-sm"
              >
                ▼
              </motion.span>
            </button>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="ml-4 mt-1 space-y-1"
              >
                {menu.children.map((child) => renderMenuItem(child, level + 1))}
              </motion.div>
            )}
          </div>
        ) : (
          // 无子菜单的情况
          <Link
            href={menu.path || "#"}
            className={`block px-4 py-2 rounded-lg transition-colors ${
              isActive
                ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            }`}
          >
            <div className="flex items-center gap-2">
              {menu.icon && <span className="text-lg">{menu.icon}</span>}
              <span>{menu.name}</span>
            </div>
          </Link>
        )}
      </div>
    );
  };

  if (loading || status === "loading") {
    return (
      <div className="w-64 p-4">
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-10 w-full rounded-lg bg-zinc-200 animate-pulse dark:bg-zinc-800"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!session?.user || menus.length === 0) {
    return null;
  }

  return (
    <nav className="w-64 p-4 space-y-2">
      <h2 className="px-4 py-2 text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
        导航菜单
      </h2>
      <div className="space-y-1">
        {menus.map((menu) => renderMenuItem(menu))}
      </div>
    </nav>
  );
}



