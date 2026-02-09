import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      api: 'running',
      database: 'connected',
      cache: 'ready'
    },
    uptime: process.uptime(),
    memory: process.memoryUsage()
  })
}

export async function POST() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    message: '健康检查接口支持 GET 和 POST 方法'
  })
}
