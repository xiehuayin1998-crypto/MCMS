// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Button, Input, Label, Textarea, Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui';

// @ts-ignore;
import { PERMISSION_LIST, PERMISSION_GROUPS } from './PermissionConstants';
export function RoleFormDialog({
  open,
  onOpenChange,
  role,
  onSave,
  $w
}) {
  const [formData, setFormData] = React.useState({
    roleName: '',
    roleDesc: '',
    permissions: []
  });

  // 当角色数据变化时更新表单
  React.useEffect(() => {
    if (role) {
      setFormData({
        roleName: role.roleName || '',
        roleDesc: role.roleDesc || '',
        permissions: parsePermissions(role.permissions)
      });
    } else {
      setFormData({
        roleName: '',
        roleDesc: '',
        permissions: []
      });
    }
  }, [role]);
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const togglePermission = permissionKey => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionKey) ? prev.permissions.filter(p => p !== permissionKey) : [...prev.permissions, permissionKey]
    }));
  };
  const isPermissionSelected = permissionKey => {
    return formData.permissions.includes(permissionKey);
  };
  const handleSave = async () => {
    if (!formData.roleName.trim()) {
      return false;
    }
    try {
      const permissionsStr = JSON.stringify(formData.permissions);
      await onSave({
        ...formData,
        permissions: permissionsStr
      }, role);
      return true;
    } catch (error) {
      console.error('保存角色失败:', error);
      return false;
    }
  };
  const parsePermissions = permissionsStr => {
    if (!permissionsStr) return [];
    try {
      const parsed = JSON.parse(permissionsStr);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (error) {
      if (typeof permissionsStr === 'string') {
        return permissionsStr.split(',').filter(p => p.trim()).map(p => p.trim());
      }
    }
    return [];
  };
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{role ? '编辑角色' : '新建角色'}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="role-name">角色名称 *</Label>
              <Input id="role-name" value={formData.roleName} onChange={e => handleInputChange('roleName', e.target.value)} placeholder="请输入角色名称" />
            </div>
            <div>
              <Label htmlFor="role-desc">角色描述</Label>
              <Textarea id="role-desc" value={formData.roleDesc} onChange={e => handleInputChange('roleDesc', e.target.value)} placeholder="请输入角色描述" rows={3} />
            </div>
          </div>
          
          <div>
            <Label className="mb-4 block">权限分配</Label>
            <div className="space-y-4">
              {Object.entries(PERMISSION_GROUPS).map(([groupKey, group]) => <Card key={groupKey}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">{group.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {group.permissions.map(permKey => <label key={permKey} className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50 cursor-pointer">
                          <input type="checkbox" checked={isPermissionSelected(PERMISSION_LIST[permKey])} onChange={() => togglePermission(PERMISSION_LIST[permKey])} className="rounded border-gray-300" />
                          <span className="text-sm">{permKey.replace(/_/g, ' ').toLowerCase()}</span>
                        </label>)}
                    </div>
                  </CardContent>
                </Card>)}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSave}>
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>;
}