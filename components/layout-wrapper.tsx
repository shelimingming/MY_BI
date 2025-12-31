"use client";

import { usePathname } from "next/navigation";
import { NavigationMenu } from "@/components/navigation-menu";
import { AuthButton } from "@/components/auth-button";

/**
 * 布局包装组件
 * 根据路径决定是否显示侧边栏和顶栏
 */
export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // 这些路径不需要显示侧边栏和顶栏
  const noLayoutPaths = ["/", "/login", "/register"];
  const shouldShowLayout = !noLayoutPaths.includes(pathname);

  if (!shouldShowLayout) {
    // 不显示侧边栏和顶栏的页面
    return <>{children}</>;
  }

  // 显示侧边栏和顶栏的页面
  return (
    <div className="flex min-h-screen">
      {/* 侧边栏导航菜单 */}
      <aside className="fixed left-0 top-0 h-screen border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <NavigationMenu />
      </aside>

      {/* 主内容区域 */}
      <main className="flex-1 ml-64">
        {/* 顶部导航栏 */}
        <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
          <div className="flex h-16 items-center justify-end px-6">
            <AuthButton />
          </div>
        </header>

        {/* 页面内容 */}
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}

