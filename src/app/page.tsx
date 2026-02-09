'use client'

import { useSession, signOut } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { Activity, Database, Server, Clock, User, LogOut } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* 标题区域 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            My BI Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            现代商业智能仪表盘 - 基于 Next.js + TypeScript + Tailwind CSS
          </p>
        </motion.div>

        {/* 登录用户信息 */}
        {session ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow p-4 mb-8 flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {session.user?.name || session.user?.email}
                </p>
                <p className="text-sm text-gray-500">
                  已登录
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>退出登录</span>
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 rounded-lg p-4 mb-8 text-center"
          >
            <p className="text-gray-600 mb-3">
              您还没有登录
            </p>
            <div className="flex justify-center space-x-4">
              <Link href="/login">
                <Button>登录</Button>
              </Link>
              <Link href="/register">
                <Button variant="outline">注册</Button>
              </Link>
            </div>
          </motion.div>
        )}

        {/* 状态卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">系统状态</CardTitle>
                <Activity className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">运行中</div>
                <p className="text-xs text-muted-foreground">所有服务正常</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">API 接口</CardTitle>
                <Server className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">就绪</div>
                <p className="text-xs text-muted-foreground">后端服务已启动</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">数据库</CardTitle>
                <Database className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">已连接</div>
                <p className="text-xs text-muted-foreground">PostgreSQL 15</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">运行时长</CardTitle>
                <Clock className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">99.9%</div>
                <p className="text-xs text-muted-foreground">月度可用性</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* 技术栈信息 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>项目技术栈</CardTitle>
              <CardDescription>
                本项目使用以下现代技术栈构建
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <TechBadge name="Next.js 16" description="React 框架" />
                <TechBadge name="TypeScript" description="类型安全" />
                <TechBadge name="Tailwind CSS" description="原子化 CSS" />
                <TechBadge name="shadcn/ui" description="UI 组件库" />
                <TechBadge name="Framer Motion" description="动画库" />
                <TechBadge name="Recharts" description="图表库" />
                <TechBadge name="Auth.js" description="身份认证" />
                <TechBadge name="Prisma" description="ORM 工具" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* API 测试区域 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8"
        >
          <Card>
            <CardHeader>
              <CardTitle>API 健康检查</CardTitle>
              <CardDescription>
                测试后端 API 接口是否正常工作
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                访问 <code className="bg-gray-100 px-2 py-1 rounded">/api/health</code> 获取系统健康状态
              </p>
              <a
                href="/api/health"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                测试健康检查接口
              </a>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  )
}

function TechBadge({ name, description }: { name: string; description: string }) {
  return (
    <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
      <div>
        <p className="text-sm font-medium text-gray-900">{name}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </div>
  )
}
