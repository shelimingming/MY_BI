import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { signOut } from "@/auth";

/**
 * 用户资料页面（受保护页面）
 * 需要登录才能访问
 */
export default async function ProfilePage() {
  // 获取当前会话
  const session = await auth();

  // 如果未登录，重定向到登录页
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-black dark:to-zinc-900 px-4">
      <div className="w-full max-w-2xl space-y-8 rounded-lg border border-zinc-200 bg-white p-8 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            用户资料
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            您的个人信息
          </p>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              账户信息
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  邮箱
                </label>
                <p className="mt-1 text-zinc-900 dark:text-zinc-50">
                  {session.user.email}
                </p>
              </div>
              {session.user.name && (
                <div>
                  <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    姓名
                  </label>
                  <p className="mt-1 text-zinc-900 dark:text-zinc-50">
                    {session.user.name}
                  </p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  用户 ID
                </label>
                <p className="mt-1 font-mono text-sm text-zinc-600 dark:text-zinc-400">
                  {session.user.id}
                </p>
              </div>
            </div>
          </div>

          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button
              type="submit"
              className="w-full rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              退出登录
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

