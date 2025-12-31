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
 * 角色类型定义
 */
interface Role {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  permissions: Array<{
    id: string;
    code: string;
    name: string;
  }>;
  userCount: number;
}

/**
 * 权限类型定义
 */
interface Permission {
  id: string;
  code: string;
  name: string;
  resource: string;
  action: string;
}

/**
 * 角色管理组件
 */
export function RoleManagement() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [deletingRole, setDeletingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    displayName: "",
    description: "",
    permissionIds: [] as string[],
  });
  const [error, setError] = useState<string | null>(null);

  // 获取角色列表
  const fetchRoles = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append("search", search);

      const response = await fetch(`/api/roles?${params.toString()}`);
      if (!response.ok) {
        throw new Error("获取角色列表失败");
      }
      const data = await response.json();
      setRoles(data.roles || []);
    } catch (err) {
      console.error("获取角色列表失败:", err);
      setError("获取角色列表失败");
    } finally {
      setLoading(false);
    }
  };

  // 获取权限列表
  const fetchPermissions = async () => {
    try {
      const response = await fetch("/api/permissions");
      if (!response.ok) {
        throw new Error("获取权限列表失败");
      }
      const data = await response.json();
      setPermissions(data.permissions || []);
    } catch (err) {
      console.error("获取权限列表失败:", err);
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  // 搜索功能
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRoles();
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // 打开创建对话框
  const handleCreate = () => {
    setEditingRole(null);
    setFormData({
      name: "",
      displayName: "",
      description: "",
      permissionIds: [],
    });
    setError(null);
    setIsDialogOpen(true);
  };

  // 打开编辑对话框
  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      displayName: role.displayName,
      description: role.description || "",
      permissionIds: role.permissions.map((p) => p.id),
    });
    setError(null);
    setIsDialogOpen(true);
  };

  // 打开删除确认对话框
  const handleDelete = (role: Role) => {
    setDeletingRole(role);
    setIsDeleteDialogOpen(true);
  };

  // 保存角色（创建或更新）
  const handleSave = async () => {
    try {
      setError(null);

      // 验证必填字段
      if (!formData.name || !formData.displayName) {
        setError("角色代码和显示名称为必填项");
        return;
      }

      const url = editingRole ? `/api/roles/${editingRole.id}` : "/api/roles";
      const method = editingRole ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          displayName: formData.displayName,
          description: formData.description || null,
          permissionIds: formData.permissionIds,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "保存失败");
      }

      setIsDialogOpen(false);
      fetchRoles();
    } catch (err: any) {
      setError(err.message || "保存失败");
    }
  };

  // 确认删除
  const handleConfirmDelete = async () => {
    if (!deletingRole) return;

    try {
      const response = await fetch(`/api/roles/${deletingRole.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "删除失败");
      }

      setIsDeleteDialogOpen(false);
      setDeletingRole(null);
      fetchRoles();
    } catch (err: any) {
      setError(err.message || "删除失败");
    }
  };

  // 切换权限选择
  const togglePermission = (permissionId: string) => {
    setFormData((prev) => ({
      ...prev,
      permissionIds: prev.permissionIds.includes(permissionId)
        ? prev.permissionIds.filter((id) => id !== permissionId)
        : [...prev.permissionIds, permissionId],
    }));
  };

  // 按资源分组权限
  const groupedPermissions = permissions.reduce((acc, perm) => {
    if (!acc[perm.resource]) {
      acc[perm.resource] = [];
    }
    acc[perm.resource].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>角色列表</CardTitle>
          <div className="flex items-center gap-2">
            {/* 搜索框 */}
            <div className="relative">
              <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="搜索角色..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 w-64"
              />
            </div>
            <Button onClick={handleCreate}>
              <PlusIcon className="size-4 mr-2" />
              新建角色
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
        ) : roles.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            暂无角色数据
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>角色代码</TableHead>
                <TableHead>显示名称</TableHead>
                <TableHead>描述</TableHead>
                <TableHead>权限数量</TableHead>
                <TableHead>用户数量</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-mono text-sm">{role.name}</TableCell>
                  <TableCell>{role.displayName}</TableCell>
                  <TableCell>{role.description || "-"}</TableCell>
                  <TableCell>{role.permissions.length}</TableCell>
                  <TableCell>{role.userCount}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(role)}
                      >
                        <PencilIcon className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(role)}
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRole ? "编辑角色" : "新建角色"}
            </DialogTitle>
            <DialogDescription>
              {editingRole
                ? "修改角色信息和权限分配"
                : "创建新角色并分配权限"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">角色代码 *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="例如: admin, user"
                required
                disabled={!!editingRole}
              />
              <p className="text-xs text-muted-foreground">
                角色代码创建后不可修改
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayName">显示名称 *</Label>
              <Input
                id="displayName"
                value={formData.displayName}
                onChange={(e) =>
                  setFormData({ ...formData, displayName: e.target.value })
                }
                placeholder="例如: 管理员、普通用户"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">描述</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="角色描述（可选）"
              />
            </div>
            <div className="space-y-2">
              <Label>权限</Label>
              <div className="space-y-3 p-4 border rounded-md max-h-96 overflow-y-auto">
                {Object.entries(groupedPermissions).map(([resource, perms]) => (
                  <div key={resource} className="space-y-2">
                    <div className="font-medium text-sm text-muted-foreground">
                      {resource}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {perms.map((perm) => (
                        <button
                          key={perm.id}
                          type="button"
                          onClick={() => togglePermission(perm.id)}
                          className={`px-3 py-1 text-sm rounded-md transition-colors ${
                            formData.permissionIds.includes(perm.id)
                              ? "bg-primary text-primary-foreground"
                              : "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                          }`}
                        >
                          {perm.name}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                {permissions.length === 0 && (
                  <span className="text-muted-foreground text-sm">暂无权限</span>
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
              确定要删除角色 "{deletingRole?.displayName}" 吗？此操作不可恢复。
              {deletingRole && deletingRole.userCount > 0 && (
                <span className="block mt-2 text-destructive">
                  警告：该角色正在被 {deletingRole.userCount} 个用户使用，删除前请先移除这些用户的角色。
                </span>
              )}
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

