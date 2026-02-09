import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"
import { AuthProvider } from "@/components/providers/auth-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "My BI Dashboard",
  description: "现代商业智能仪表盘",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body className={cn(
        inter.className,
        "min-h-screen bg-background antialiased"
      )}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
