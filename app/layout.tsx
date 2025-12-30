import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/session-provider";
import { NavigationMenu } from "@/components/navigation-menu";
import { AuthButton } from "@/components/auth-button";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "现代全栈项目",
  description: "基于 Next.js、React、TypeScript、Tailwind CSS 和 shadcn/ui 构建的现代化全栈应用框架",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
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
        </Providers>
      </body>
    </html>
  );
}
