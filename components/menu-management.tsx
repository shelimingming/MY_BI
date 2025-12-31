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
 * 菜单类型定义
 */
interface Menu {
  id: string;
  code: string;
  name: string;
  path: string | null;
  icon: string | null;
  parentId: string | null;
  parent: {
    id: string;
    name: string;
    code: string;
  } | null;
  order: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
  permissions: Array<{
    id: string;
    code: string;
    name: string;
  }>;
}

/**
 * 权限类型定义
 */
interface Permission {
  id: string;
  code: string;
  name: string;
}

/**
 * 菜单管理组件
 */
export function MenuManagement() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [deletingMenu, setDeletingMenu] = useState<Menu | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    path: "",
    icon: "",
    parentId: "",
    order: 0,
    isVisible: true,
    permissionIds: [] as string[],
  });
  const [error, setError] = useState<string | null>(null);

  // 获取菜单列表
  const fetchMenus = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/system/menus");
      if (!response.ok) {
        throw new Error("获取菜单列表失败");
      }
      const data = await response.json();
      setMenus(data.menus || []);
    } catch (err) {
      console.error("获取菜单列表失败:", err);
      setError("获取菜单列表失败");
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
    fetchMenus();
    fetchPermissions();
  }, []);

  // 打开创建对话框
  const handleCreate = () => {
    setEditingMenu(null);
    setFormData({
      code: "",
      name: "",
      path: "",
      icon: "",
      parentId: "",
      order: 0,
      isVisible: true,
      permissionIds: [],
    });
    setError(null);
    setIsDialogOpen(true);
  };

  // 打开编辑对话框
  const handleEdit = (menu: Menu) => {
    setEditingMenu(menu);
    setFormData({
      code: menu.code,
      name: menu.name,
      path: menu.path || "",
      icon: menu.icon || "",
      parentId: menu.parentId || "",
      order: menu.order,
      isVisible: menu.isVisible,
      permissionIds: menu.permissions.map((p) => p.id),
    });
    setError(null);
    setIsDialogOpen(true);
  };

  // 打开删除确认对话框
  const handleDelete = (menu: Menu) => {
    setDeletingMenu(menu);
    setIsDeleteDialogOpen(true);
  };

  // 保存菜单（创建或更新）
  const handleSave = async () => {
    try {
      setError(null);

      // 验证必填字段
      if (!formData.code || !formData.name) {
        setError("菜单代码和名称为必填项");
        return;
      }

      const url = editingMenu
        ? `/api/system/menus/${editingMenu.id}`
        : "/api/system/menus";
      const method = editingMenu ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: formData.code,
          name: formData.name,
          path: formData.path || null,
          icon: formData.icon || null,
          parentId: formData.parentId || null,
          order: formData.order,
          isVisible: formData.isVisible,
          permissionIds: formData.permissionIds,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "保存失败");
      }

      setIsDialogOpen(false);
      fetchMenus();
    } catch (err: any) {
      setError(err.message || "保存失败");
    }
  };

  // 确认删除
  const handleConfirmDelete = async () => {
    if (!deletingMenu) return;

    try {
      const response = await fetch(`/api/system/menus/${deletingMenu.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "删除失败");
      }

      setIsDeleteDialogOpen(false);
      setDeletingMenu(null);
      fetchMenus();
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

  // 过滤菜单（搜索功能）
  const filteredMenus = menus.filter((menu) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      menu.name.toLowerCase().includes(searchLower) ||
      menu.code.toLowerCase().includes(searchLower) ||
      (menu.path && menu.path.toLowerCase().includes(searchLower))
    );
  });

  // 获取可选的父菜单（排除自己和子菜单）
  const getAvailableParents = () => {
    if (!editingMenu) return menus.filter((m) => !m.parentId);
    return menus.filter(
      (m) => m.id !== editingMenu.id && !isDescendant(m.id, editingMenu.id)
    );
  };

  // 检查是否是子菜单
  const isDescendant = (menuId: string, ancestorId: string): boolean => {
    const menu = menus.find((m) => m.id === menuId);
    if (!menu || !menu.parentId) return false;
    if (menu.parentId === ancestorId) return true;
    return isDescendant(menu.parentId, ancestorId);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>菜单列表</CardTitle>
          <div className="flex items-center gap-2">
            {/* 搜索框 */}
            <div className="relative">
              <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="搜索菜单..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 w-64"
              />
            </div>
            <Button onClick={handleCreate}>
              <PlusIcon className="size-4 mr-2" />
              新建菜单
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
        ) : filteredMenus.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {search ? "未找到匹配的菜单" : "暂无菜单数据"}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>图标</TableHead>
                <TableHead>菜单代码</TableHead>
                <TableHead>名称</TableHead>
                <TableHead>路径</TableHead>
                <TableHead>父菜单</TableHead>
                <TableHead>排序</TableHead>
                <TableHead>可见</TableHead>
                <TableHead>权限</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMenus.map((menu) => (
                <TableRow key={menu.id}>
                  <TableCell>{menu.icon || "-"}</TableCell>
                  <TableCell className="font-mono text-sm">{menu.code}</TableCell>
                  <TableCell>{menu.name}</TableCell>
                  <TableCell>{menu.path || "-"}</TableCell>
                  <TableCell>
                    {menu.parent ? (
                      <span className="text-sm">{menu.parent.name}</span>
                    ) : (
                      <span className="text-muted-foreground text-sm">根菜单</span>
                    )}
                  </TableCell>
                  <TableCell>{menu.order}</TableCell>
                  <TableCell>
                    {menu.isVisible ? (
                      <span className="text-green-600 dark:text-green-400">是</span>
                    ) : (
                      <span className="text-muted-foreground">否</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {menu.permissions.slice(0, 2).map((perm) => (
                        <span
                          key={perm.id}
                          className="px-2 py-1 text-xs rounded-md bg-zinc-100 dark:bg-zinc-800"
                        >
                          {perm.name}
                        </span>
                      ))}
                      {menu.permissions.length > 2 && (
                        <span className="text-xs text-muted-foreground">
                          +{menu.permissions.length - 2}
                        </span>
                      )}
                      {menu.permissions.length === 0 && (
                        <span className="text-muted-foreground text-sm">无</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(menu)}
                      >
                        <PencilIcon className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(menu)}
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
              {editingMenu ? "编辑菜单" : "新建菜单"}
            </DialogTitle>
            <DialogDescription>
              {editingMenu
                ? "修改菜单信息和权限分配"
                : "创建新菜单并分配权限"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">菜单代码 *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  placeholder="例如: dashboard, users"
                  required
                  disabled={!!editingMenu}
                />
                <p className="text-xs text-muted-foreground">
                  菜单代码创建后不可修改
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">菜单名称 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="例如: 仪表盘、用户管理"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="path">路由路径</Label>
                <Input
                  id="path"
                  value={formData.path}
                  onChange={(e) =>
                    setFormData({ ...formData, path: e.target.value })
                  }
                  placeholder="例如: /dashboard, /users"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="icon">图标</Label>
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={(e) =>
                    setFormData({ ...formData, icon: e.target.value })
                  }
                  placeholder="例如: 📊, 👥"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="parentId">父菜单</Label>
                <select
                  id="parentId"
                  value={formData.parentId}
                  onChange={(e) =>
                    setFormData({ ...formData, parentId: e.target.value })
                  }
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">无（根菜单）</option>
                  {getAvailableParents().map((menu) => (
                    <option key={menu.id} value={menu.id}>
                      {menu.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="order">排序</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.order}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      order: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="0"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isVisible}
                  onChange={(e) =>
                    setFormData({ ...formData, isVisible: e.target.checked })
                  }
                  className="size-4 rounded border"
                />
                是否可见
              </Label>
            </div>
            <div className="space-y-2">
              <Label>权限</Label>
              <div className="flex flex-wrap gap-2 p-4 border rounded-md max-h-48 overflow-y-auto">
                {permissions.map((perm) => (
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
              确定要删除菜单 "{deletingMenu?.name}" 吗？此操作不可恢复。
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

