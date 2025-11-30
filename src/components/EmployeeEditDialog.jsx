// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, useToast } from '@/components/ui';
// @ts-ignore;
import { User, Mail, Phone, Building, Calendar, MapPin, Briefcase, Shield } from 'lucide-react';

export function EmployeeEditDialog({
  employee,
  departments = [],
  roles = [],
  open,
  onOpenChange,
  onEmployeeUpdated,
  $w
}) {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    employee_number: '',
    hire_date: '',
    address: '',
    roles: [],
    status: 'active'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [useCloudFunction, setUseCloudFunction] = useState(false);
  const {
    toast
  } = useToast();

  // 检查云函数是否存在
  const checkCloudFunction = async () => {
    try {
      const result = await $w.cloud.callFunction({
        name: 'update-user',
        data: {
          test: true
        }
      });
      setUseCloudFunction(true);
      return true;
    } catch (error) {
      if (error.code === 'FUNCTION_NOT_FOUND') {
        console.warn('update-user 云函数未找到，将使用 wedaUpdateV2');
        setUseCloudFunction(false);
        return false;
      }
      console.warn('云函数调用失败，将使用 wedaUpdateV2:', error);
      setUseCloudFunction(false);
      return false;
    }
  };

  // 初始化时检查云函数
  useEffect(() => {
    if (open) {
      checkCloudFunction();
    }
  }, [open]);
  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name || '',
        username: employee.username || '',
        email: employee.email || '',
        phone: employee.phone || '',
        department: employee.department || '',
        position: employee.position || '',
        employee_number: employee.employee_number || '',
        hire_date: employee.hire_date || '',
        address: employee.address || '',
        roles: Array.isArray(employee.roles) ? employee.roles : [],
        status: employee.status || 'active'
      });
    }
  }, [employee]);
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({
        title: "错误",
        description: "姓名不能为空",
        variant: "destructive"
      });
      return;
    }
    if (!formData.username.trim()) {
      toast({
        title: "错误",
        description: "用户名不能为空",
        variant: "destructive"
      });
      return;
    }
    setIsLoading(true);
    try {
      const updateData = {
        name: formData.name.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        department: formData.department,
        position: formData.position.trim(),
        employee_number: formData.employee_number.trim(),
        hire_date: formData.hire_date,
        address: formData.address.trim(),
        roles: formData.roles,
        status: formData.status,
        updatedAt: new Date().getTime()
      };
      let result;
      if (useCloudFunction) {
        // 使用 update-user 云函数
        const cloudResult = await $w.cloud.callFunction({
          name: 'update-user',
          data: {
            userId: employee._id,
            updateData: updateData
          }
        });
        if (cloudResult.result.success) {
          result = {
            count: 1
          };
        } else {
          // 根据云函数返回的错误信息提供更准确的提示
          const errorMessage = cloudResult.result.errorMessage || '更新失败';
          if (errorMessage.includes('未找到') || errorMessage.includes('not found')) {
            throw new Error('未找到指定的用户记录');
          }
          throw new Error(errorMessage);
        }
      } else {
        // 使用 wedaUpdateV2 作为备选方案
        result = await $w.cloud.callDataSource({
          dataSourceName: 'mc_users',
          methodName: 'wedaUpdateV2',
          params: {
            data: updateData,
            filter: {
              where: {
                _id: {
                  $eq: employee._id
                }
              }
            }
          }
        });
      }
      if (result.count > 0) {
        toast({
          title: "更新成功",
          description: `员工 "${formData.name}" 的信息已更新`
        });
        onEmployeeUpdated && onEmployeeUpdated();
        onOpenChange(false);
      } else {
        // 当更新结果为0时，可能是用户不存在
        throw new Error('未找到指定的用户记录');
      }
    } catch (error) {
      console.error('更新员工信息失败:', error);
      // 提供更准确的错误提示
      const errorMessage = error.message || '更新员工信息时发生错误';
      toast({
        title: "更新失败",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 安全渲染部门选择器
  const renderDepartmentSelect = () => {
    if (!Array.isArray(departments) || departments.length === 0) {
      return <Input id="edit-department" value={formData.department} onChange={e => handleInputChange('department', e.target.value)} placeholder="请输入部门" />;
    }
    return <Select value={formData.department} onValueChange={value => handleInputChange('department', value)}>
        <SelectTrigger>
          <SelectValue placeholder="请选择部门" />
        </SelectTrigger>
        <SelectContent>
          {departments.map(dept => <SelectItem key={dept._id} value={dept.name}>
              {dept.name}
            </SelectItem>)}
        </SelectContent>
      </Select>;
  };

  // 安全渲染角色选择器
  const renderRoleSelector = () => {
    if (!Array.isArray(roles) || roles.length === 0) {
      return <div className="text-sm text-gray-500">
          暂无可用角色
        </div>;
    }
    return <div className="flex flex-wrap gap-2">
        {roles.map(role => <div key={role._id} className="flex items-center space-x-2">
            <input type="checkbox" id={`role-${role._id}`} checked={formData.roles.includes(role._id)} onChange={e => {
          if (e.target.checked) {
            setFormData(prev => ({
              ...prev,
              roles: [...prev.roles, role._id]
            }));
          } else {
            setFormData(prev => ({
              ...prev,
              roles: prev.roles.filter(id => id !== role._id)
            }));
          }
        }} className="rounded border-gray-300" />
            <label htmlFor={`role-${role._id}`} className="text-sm">
              {role.roleName}
            </label>
          </div>)}
      </div>;
  };
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>编辑员工信息</DialogTitle>
          <DialogDescription>
            修改员工详细信息
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="flex items-center">
                <User className="w-4 h-4 mr-2" />
                姓名 *
              </Label>
              <Input id="edit-name" value={formData.name} onChange={e => handleInputChange('name', e.target.value)} placeholder="请输入姓名" required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-username" className="flex items-center">
                <User className="w-4 h-4 mr-2" />
                用户名 *
              </Label>
              <Input id="edit-username" value={formData.username} onChange={e => handleInputChange('username', e.target.value)} placeholder="请输入用户名" required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-email" className="flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                邮箱
              </Label>
              <Input id="edit-email" type="email" value={formData.email} onChange={e => handleInputChange('email', e.target.value)} placeholder="请输入邮箱" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-phone" className="flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                电话
              </Label>
              <Input id="edit-phone" type="tel" value={formData.phone} onChange={e => handleInputChange('phone', e.target.value)} placeholder="请输入电话" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-department" className="flex items-center">
                <Building className="w-4 h-4 mr-2" />
                部门
              </Label>
              {renderDepartmentSelect()}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-position" className="flex items-center">
                <Briefcase className="w-4 h-4 mr-2" />
                职位
              </Label>
              <Input id="edit-position" value={formData.position} onChange={e => handleInputChange('position', e.target.value)} placeholder="请输入职位" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-employee-number" className="flex items-center">
                <User className="w-4 h-4 mr-2" />
                工号
              </Label>
              <Input id="edit-employee-number" value={formData.employee_number} onChange={e => handleInputChange('employee_number', e.target.value)} placeholder="请输入工号" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-hire-date" className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                入职日期
              </Label>
              <Input id="edit-hire-date" type="date" value={formData.hire_date} onChange={e => handleInputChange('hire_date', e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-address" className="flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              地址
            </Label>
            <Input id="edit-address" value={formData.address} onChange={e => handleInputChange('address', e.target.value)} placeholder="请输入地址" />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              角色
            </Label>
            {renderRoleSelector()}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-status">状态</Label>
            <Select value={formData.status} onValueChange={value => handleInputChange('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="请选择状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">在职</SelectItem>
                <SelectItem value="inactive">离职</SelectItem>
                <SelectItem value="suspended">暂停</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? '更新中...' : '保存更改'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>;
}