"use client";

import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";

/**
 * 认证按钮组件
 * 显示登录状态和登录/登出按钮
 */
export function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <motion.div
        className="h-8 w-8 rounded-full border-4 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-50"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      />
    );
  }

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-zinc-600 dark:text-zinc-400">
          欢迎, {session.user.email}
        </span>
        <Link
          href="/profile"
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-800"
        >
          个人资料
        </Link>
        <button
          onClick={() => signOut({ redirect: true, callbackUrl: "/" })}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          退出登录
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <Link
        href="/login"
        className="rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-800"
      >
        登录
      </Link>
      <Link
        href="/register"
        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        注册
      </Link>
    </div>
  );
}

