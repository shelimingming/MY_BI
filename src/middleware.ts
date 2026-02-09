import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname

  // 检查是否是登录或注册页面
  const isAuthPage = path.startsWith('/login') || path.startsWith('/register')

  // 从 cookie 读取 session token（简化版检查）
  // 实际项目中，auth.js 会自动处理这个逻辑
  // 这里我们只做页面重定向，不检查具体认证状态
  if (isAuthPage) {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * 匹配所有路径除了：
     * - api (API 路由)
     * - _next/static (静态文件)
     * - _next/image (图片优化)
     * - favicon.ico (网站图标)
     * - 认证相关 API
     */
    '/((?!api|_next/static|_next/image|favicon.ico|$|api/auth).*)',
  ],
}
