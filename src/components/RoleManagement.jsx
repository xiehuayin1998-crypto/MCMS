// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, useToast, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Input, Textarea } from '@/components/ui';
// @ts-ignore;
import { Key, Plus, Edit, Trash2, AlertCircle } from 'lucide-react';

export function RoleManagement({
  roles,
  loading,
  onRefresh,
  $w
}) {
  const {
    toast
  } = useToast();
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [roleForm, setRoleForm] = useState({
    name: '',
    description: '',
    permissions: []
  });
  const handleCreateRole = () => {
    setEditingRole(null);
    setRoleForm({
      name: '',
      description: '',
      permissions: []
    });
    setShowRoleDialog(true);
  };
  const handleEditRole = role => {
    setEditingRole(role);
    setRoleForm({
      name: role.name,
      description: role.description,
      permissions: role.permissions || []
    });
    setShowRoleDialog(true);
  };
  const handleSaveRole = async () => {
    try {
      if (!roleForm.name.trim()) {
        toast({
          title: "验证失败",
          description: "角色名称不能为空",
          variant: "destructive"
        });
        return;
      }
      if (editingRole) {
        // 更新角色
        await $w.cloud.callDataSource({
          dataSourceName: 'mc_roles',
          methodName: 'wedaUpdateV2',
          params: {
            data: roleForm,
            filter: {
              where: {
                _id: {
                  $eq: editingRole._id
                }
              }
            }
          }
        });
        toast({
          title: "更新成功",
          description: "角色已更新"
        });
      } else {
        // 创建新角色
        await $w.cloud.callDataSource({
          dataSourceName: 'mc_roles',
          methodName: 'wedaCreateV2',
          params: {
            data: roleForm
          }
        });
        toast({
          title: "创建成功",
          description: "新角色已创建"
        });
      }
      setShowRoleDialog(false);
      onRefresh();
    } catch (error) {
      toast({
        title: "操作失败",
        description: error.message || "无法保存角色",
        variant: "destructive"
      });
    }
  };
  const handleDeleteRole = async role => {
    if (!confirm(`确定要删除角色 "${role.name}" 吗？此操作不可撤销。`)) {
      return;
    }
    try {
      await $w.cloud.callDataSource({
        dataSourceName: 'mc_roles',
        methodName: 'wedaDeleteV2',
        params: {
          filter: {
            where: {
              _id: {
                $eq: role._id
              }
            }
          }
        }
      });
      toast({
        title: "删除成功",
        description: "角色已删除"
      });
      onRefresh();
    } catch (error) {
      toast({
        title: "删除失败",
        description: error.message || "无法删除角色",
        variant: "destructive"
      });
    }
  };
  if (loading) {
    return <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>;
  }
  return <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>角色管理</span>
            <Button size="sm" onClick={handleCreateRole}>
              <Plus className="w-4 h-4 mr-1" />
              创建角色
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {roles.length === 0 ? <div className="text-center py-12">
              <Key className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">暂无角色</p>
              <Button size="sm" className="mt-4" onClick={handleCreateRole}>
                创建第一个角色
              </Button>
            </div> : <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {roles.map(role => <Card key={role._id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      {role.name}
                      <Badge variant={role.isSystem ? "default" : "secondary"}>
                        {role.isSystem ? "系统" : "自定义"}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">{role.description}</p>
                    
                    {role.permissions && role.permissions.length > 0 && <div className="mb-4">
                        <p className="text-xs font-medium text-gray-500 mb-2">权限:</p>
                        <div className="flex flex-wrap gap-1">
                          {role.permissions.slice(0, 3).map((perm, index) => <Badge key={index} variant="outline" className="text-xs">
                              {perm}
                            </Badge>)}
                          {role.permissions.length > 3 && <Badge variant="outline" className="text-xs">
                              +{role.permissions.length - 3}
                            </Badge>}
                        </div>
                      </div>}

                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleEditRole(role)} disabled={role.isSystem}>
                        <Edit className="w-3 h-3 mr-1" />
                        编辑
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700" onClick={() => handleDeleteRole(role)} disabled={role.isSystem}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>)}
            </div>}
        </CardContent>
      </Card>

      {/* 角色创建/编辑对话框 */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingRole ? '编辑角色' : '创建新角色'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                角色名称 *
              </label>
              <Input value={roleForm.name} onChange={e => setRoleForm({
              ...roleForm,
              name: e.target.value
            })} placeholder="例如：管理员、普通用户" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                角色描述
              </label>
              <Textarea value={roleForm.description} onChange={e => setRoleForm({
              ...roleForm,
              description: e.target.value
            })} placeholder="描述该角色的用途和权限范围" rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRoleDialog(false)}>
              取消
            </Button>
            <Button onClick={handleSaveRole}>
              {editingRole ? '更新' : '创建'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>;
}