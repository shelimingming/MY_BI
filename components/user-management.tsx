"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusIcon, PencilIcon, TrashIcon, SearchIcon } from "lucide-react";

/**
 * 用户类型定义
 */
interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  createdAt: string;
  updatedAt: string;
  roles: Array<{
    id: string;
    name: string;
    displayName: string;
  }>;
}

/**
 * 角色类型定义
 */
interface Role {
  id: string;
  name: string;
  displayName: string;
}

/**
 * 用户管理组件
 */
export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    roleIds: [] as string[],
  });
  const [error, setError] = useState<string | null>(null);

  // 获取用户列表
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      params.append("page", "1");
      params.append("pageSize", "100");

      const response = await fetch(`/api/users?${params.toString()}`);
      if (!response.ok) {
        throw new Error("获取用户列表失败");
      }
      const data = await response.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error("获取用户列表失败:", err);
      setError("获取用户列表失败");
    } finally {
      setLoading(false);
    }
  };

  // 获取角色列表（用于选择）
  const fetchRoles = async () => {
    try {
      const response = await fetch("/api/roles");
      if (!response.ok) {
        throw new Error("获取角色列表失败");
      }
      const data = await response.json();
      setRoles(data.roles || []);
    } catch (err) {
      console.error("获取角色列表失败:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  // 搜索功能
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // 打开创建对话框
  const handleCreate = () => {
    setEditingUser(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      roleIds: [],
    });
    setError(null);
    setIsDialogOpen(true);
  };

  // 打开编辑对话框
  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name || "",
      email: user.email,
      password: "",
      roleIds: user.roles.map((r) => r.id),
    });
    setError(null);
    setIsDialogOpen(true);
  };

  // 打开删除确认对话框
  const handleDelete = (user: User) => {
    setDeletingUser(user);
    setIsDeleteDialogOpen(true);
  };

  // 保存用户（创建或更新）
  const handleSave = async () => {
    try {
      setError(null);

      // 验证必填字段
      if (!formData.email) {
        setError("邮箱为必填项");
        return;
      }
      if (!editingUser && !formData.password) {
        setError("密码为必填项");
        return;
      }

      const url = editingUser ? `/api/users/${editingUser.id}` : "/api/users";
      const method = editingUser ? "PUT" : "POST";

      // 准备请求数据（编辑时如果没有输入密码则不发送密码字段）
      const requestData: any = {
        name: formData.name || null,
        email: formData.email,
        roleIds: formData.roleIds,
      };
      if (formData.password || !editingUser) {
        requestData.password = formData.password;
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "保存失败");
      }

      setIsDialogOpen(false);
      fetchUsers();
    } catch (err: any) {
      setError(err.message || "保存失败");
    }
  };

  // 确认删除
  const handleConfirmDelete = async () => {
    if (!deletingUser) return;

    try {
      const response = await fetch(`/api/users/${deletingUser.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "删除失败");
      }

      setIsDeleteDialogOpen(false);
      setDeletingUser(null);
      fetchUsers();
    } catch (err: any) {
      setError(err.message || "删除失败");
    }
  };

  // 切换角色选择
  const toggleRole = (roleId: string) => {
    setFormData((prev) => ({
      ...prev,
      roleIds: prev.roleIds.includes(roleId)
        ? prev.roleIds.filter((id) => id !== roleId)
        : [...prev.roleIds, roleId],
    }));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>用户列表</CardTitle>
          <div className="flex items-center gap-2">
            {/* 搜索框 */}
            <div className="relative">
              <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="搜索用户..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 w-64"
              />
            </div>
            <Button onClick={handleCreate}>
              <PlusIcon className="size-4 mr-2" />
              新建用户
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            加载中...
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            暂无用户数据
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>姓名</TableHead>
                <TableHead>邮箱</TableHead>
                <TableHead>角色</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name || "-"}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map((role) => (
                        <span
                          key={role.id}
                          className="px-2 py-1 text-xs rounded-md bg-zinc-100 dark:bg-zinc-800"
                        >
                          {role.displayName}
                        </span>
                      ))}
                      {user.roles.length === 0 && (
                        <span className="text-muted-foreground text-sm">无角色</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleString("zh-CN")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(user)}
                      >
                        <PencilIcon className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(user)}
                      >
                        <TrashIcon className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* 创建/编辑对话框 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? "编辑用户" : "新建用户"}
            </DialogTitle>
            <DialogDescription>
              {editingUser
                ? "修改用户信息，留空密码则不更新密码"
                : "创建新用户并分配角色"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">姓名</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="请输入姓名"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">邮箱 *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="请输入邮箱"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">
                密码 {editingUser && "(留空则不更新)"} *
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="请输入密码"
                required={!editingUser}
              />
            </div>
            <div className="space-y-2">
              <Label>角色</Label>
              <div className="flex flex-wrap gap-2 p-4 border rounded-md">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => toggleRole(role.id)}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      formData.roleIds.includes(role.id)
                        ? "bg-primary text-primary-foreground"
                        : "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                    }`}
                  >
                    {role.displayName}
                  </button>
                ))}
                {roles.length === 0 && (
                  <span className="text-muted-foreground text-sm">暂无角色</span>
                )}
              </div>
            </div>
            {error && (
              <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSave}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              确定要删除用户 "{deletingUser?.name || deletingUser?.email}"
              吗？此操作不可恢复。
            </DialogDescription>
          </DialogHeader>
          {error && (
            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              取消
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

