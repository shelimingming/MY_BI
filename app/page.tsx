"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

/**
 * 首页组件
 * 展示项目框架和健康检查状态
 */
export default function Home() {
  const [healthStatus, setHealthStatus] = useState<{
    status: string;
    timestamp: string;
  } | null>(null);

  // 获取健康检查状态
  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const response = await fetch("/api/health");
        const data = await response.json();
        setHealthStatus(data);
      } catch (error) {
        console.error("健康检查失败:", error);
      }
    };

    fetchHealth();
  }, []);

  // 动画变体配置
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-black dark:to-zinc-900">
      <motion.main
        className="flex min-h-screen w-full max-w-4xl flex-col items-center justify-center gap-8 px-8 py-16"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* 标题区域 */}
        <motion.div
          className="flex flex-col items-center gap-4 text-center"
          variants={itemVariants}
        >
          <motion.h1
            className="text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            现代全栈项目
          </motion.h1>
          <motion.p
            className="max-w-2xl text-lg text-zinc-600 dark:text-zinc-400"
            variants={itemVariants}
          >
            基于 Next.js、React、TypeScript、Tailwind CSS 和 shadcn/ui
            构建的现代化全栈应用框架
          </motion.p>
        </motion.div>

        {/* 技术栈展示 */}
        <motion.div
          className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          variants={itemVariants}
        >
          {[
            { name: "Next.js", color: "bg-black dark:bg-white" },
            { name: "React", color: "bg-blue-500" },
            { name: "TypeScript", color: "bg-blue-600" },
            { name: "Tailwind CSS", color: "bg-cyan-500" },
            { name: "shadcn/ui", color: "bg-zinc-800" },
            { name: "Framer Motion", color: "bg-purple-500" },
          ].map((tech, index) => (
            <motion.div
              key={tech.name}
              className={`flex items-center justify-center rounded-lg ${tech.color} p-4 text-white`}
              whileHover={{ scale: 1.05, rotate: 2 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <span className="font-semibold">{tech.name}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* 健康检查状态卡片 */}
        <motion.div
          className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
          variants={itemVariants}
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            系统状态
          </h2>
          {healthStatus ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">状态:</span>
                <motion.span
                  className={`rounded-full px-3 py-1 text-sm font-medium ${
                    healthStatus.status === "healthy"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  }`}
                  animate={{
                    scale: healthStatus.status === "healthy" ? [1, 1.1, 1] : 1,
                  }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  {healthStatus.status === "healthy" ? "健康" : "异常"}
                </motion.span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">
                  时间戳:
                </span>
                <span className="text-sm text-zinc-900 dark:text-zinc-50">
                  {new Date(healthStatus.timestamp).toLocaleString("zh-CN")}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-4">
              <motion.div
                className="h-8 w-8 rounded-full border-4 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-50"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              />
            </div>
          )}
        </motion.div>

        {/* 快速链接 */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-4"
          variants={itemVariants}
        >
          <motion.a
            href="/api/health"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-zinc-900 px-6 py-3 text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            查看健康检查 API
          </motion.a>
          <motion.a
            href="https://nextjs.org/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-zinc-300 px-6 py-3 text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-800"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            查看文档
          </motion.a>
        </motion.div>
      </motion.main>
    </div>
  );
}
