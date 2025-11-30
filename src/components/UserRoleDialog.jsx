// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Button, Label } from '@/components/ui';

export function UserRoleDialog({
  open,
  onOpenChange,
  user,
  roles,
  userRoles,
  onSave,
  $w
}) {
  const [selectedRoles, setSelectedRoles] = React.useState([]);

  // 当用户数据变化时更新选中的角色
  React.useEffect(() => {
    setSelectedRoles(userRoles || []);
  }, [userRoles]);
  const toggleUserRole = roleId => {
    setSelectedRoles(prev => prev.includes(roleId) ? prev.filter(id => id !== roleId) : [...prev, roleId]);
  };
  const isUserHasRole = roleId => {
    return selectedRoles.includes(roleId);
  };
  const handleSave = async () => {
    try {
      await onSave(selectedRoles);
      return true;
    } catch (error) {
      console.error('保存用户角色失败:', error);
      return false;
    }
  };
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>分配角色 - {user?.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label>选择角色</Label>
            <div className="space-y-2 mt-2 max-h-60 overflow-y-auto">
              {roles.map(role => <label key={role._id} className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50 cursor-pointer">
                  <input type="checkbox" checked={isUserHasRole(role._id)} onChange={() => toggleUserRole(role._id)} className="rounded border-gray-300" />
                  <span>{role.roleName}</span>
                </label>)}
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