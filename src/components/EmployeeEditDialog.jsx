// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Textarea, useToast } from '@/components/ui';
// @ts-ignore;
import { User, Mail, Phone, MapPin, Calendar, Briefcase, Shield, Building, UserCheck, Eye, EyeOff } from 'lucide-react';

export function EmployeeEditDialog({
  open,
  onOpenChange,
  employee,
  departments,
  roles,
  onSave
}) {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    idCard: '',
    department: '',
    role: '',
    position: '',
    hireDate: '',
    status: 'active',
    password: '',
    confirmPassword: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
    notes: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {
    toast
  } = useToast();
  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name || '',
        username: employee.username || '',
        email: employee.email || '',
        phone: employee.phone || '',
        idCard: employee.idCard || '',
        department: employee.department || '',
        role: employee.role || '',
        position: employee.position || '',
        hireDate: employee.hireDate || '',
        status: employee.status || 'active',
        password: '',
        confirmPassword: '',
        address: employee.address || '',
        emergencyContact: employee.emergencyContact || '',
        emergencyPhone: employee.emergencyPhone || '',
        notes: employee.notes || ''
      });
    } else {
      setFormData({
        name: '',
        username: '',
        email: '',
        phone: '',
        idCard: '',
        department: '',
        role: '',
        position: '',
        hireDate: '',
        status: 'active',
        password: '',
        confirmPassword: '',
        address: '',
        emergencyContact: '',
        emergencyPhone: '',
        notes: ''
      });
    }
    setErrors({});
  }, [employee, open]);
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // 清除该字段的错误
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // 移除身份证验证函数
  const validateForm = () => {
    const newErrors = {};

    // 姓名验证
    if (!formData.name.trim()) {
      newErrors.name = '请输入姓名';
    }

    // 用户名验证
    if (!formData.username.trim()) {
      newErrors.username = '请输入用户名';
    } else if (formData.username.length < 3) {
      newErrors.username = '用户名至少3个字符';
    }

    // 邮箱验证
    if (!formData.email.trim()) {
      newErrors.email = '请输入邮箱';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '请输入有效的邮箱地址';
    }

    // 手机号验证
    if (!formData.phone.trim()) {
      newErrors.phone = '请输入手机号';
    } else if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = '请输入有效的手机号';
    }

    // 部门验证
    if (!formData.department) {
      newErrors.department = '请选择部门';
    }

    // 角色验证
    if (!formData.role) {
      newErrors.role = '请选择角色';
    }

    // 入职日期验证
    if (!formData.hireDate) {
      newErrors.hireDate = '请选择入职日期';
    }

    // 密码验证（仅新增时）
    if (!employee && !formData.password) {
      newErrors.password = '请输入密码';
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = '密码至少6个字符';
    }

    // 确认密码验证
    if (formData.password && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '两次输入的密码不一致';
    }

    // 紧急联系人验证
    if (!formData.emergencyContact.trim()) {
      newErrors.emergencyContact = '请输入紧急联系人';
    }

    // 紧急联系电话验证
    if (!formData.emergencyPhone.trim()) {
      newErrors.emergencyPhone = '请输入紧急联系电话';
    } else if (!/^1[3-9]\d{9}$/.test(formData.emergencyPhone)) {
      newErrors.emergencyPhone = '请输入有效的手机号';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    try {
      const dataToSave = {
        ...formData
      };

      // 如果是编辑模式且没有修改密码，则不包含密码字段
      if (employee && !formData.password) {
        delete dataToSave.password;
        delete dataToSave.confirmPassword;
      } else {
        delete dataToSave.confirmPassword;
      }
      await onSave(dataToSave);
      onOpenChange(false);
      toast({
        title: employee ? '更新成功' : '添加成功',
        description: employee ? '用户信息已更新' : '新用户已添加'
      });
    } catch (error) {
      toast({
        title: '操作失败',
        description: error.message || '操作过程中发生错误',
        variant: 'destructive'
      });
    }
  };
  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{employee ? '编辑用户' : '新增用户'}</DialogTitle>
      </DialogHeader>
      
      <div className="grid gap-4 py-4">
        {/* 基本信息 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>姓名 *</Label>
            <Input value={formData.name} onChange={e => handleChange('name', e.target.value)} placeholder="请输入姓名" className={errors.name ? 'border-red-500' : ''} />
            {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
          </div>
          
          <div>
            <Label>用户名 *</Label>
            <Input value={formData.username} onChange={e => handleChange('username', e.target.value)} placeholder="请输入用户名" className={errors.username ? 'border-red-500' : ''} />
            {errors.username && <p className="text-sm text-red-500 mt-1">{errors.username}</p>}
          </div>
          
          <div>
            <Label>邮箱 *</Label>
            <Input type="email" value={formData.email} onChange={e => handleChange('email', e.target.value)} placeholder="请输入邮箱" className={errors.email ? 'border-red-500' : ''} />
            {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
          </div>
          
          <div>
            <Label>手机号 *</Label>
            <Input type="tel" value={formData.phone} onChange={e => handleChange('phone', e.target.value)} placeholder="请输入手机号" className={errors.phone ? 'border-red-500' : ''} />
            {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
          </div>
          
          <div>
            <Label>身份证号</Label>
            <Input value={formData.idCard} onChange={e => handleChange('idCard', e.target.value)} placeholder="请输入身份证号" />
            {/* 移除了身份证验证提示 */}
          </div>
          
          <div>
            <Label>部门 *</Label>
            <Select value={formData.department} onValueChange={value => handleChange('department', value)}>
              <SelectTrigger className={errors.department ? 'border-red-500' : ''}>
                <SelectValue placeholder="请选择部门" />
              </SelectTrigger>
              <SelectContent>
                {departments.map(dept => <SelectItem key={dept._id} value={dept.name}>{dept.name}</SelectItem>)}
              </SelectContent>
            </Select>
            {errors.department && <p className="text-sm text-red-500 mt-1">{errors.department}</p>}
          </div>
          
          <div>
            <Label>角色 *</Label>
            <Select value={formData.role} onValueChange={value => handleChange('role', value)}>
              <SelectTrigger className={errors.role ? 'border-red-500' : ''}>
                <SelectValue placeholder="请选择角色" />
              </SelectTrigger>
              <SelectContent>
                {roles.map(role => <SelectItem key={role._id} value={role.name}>{role.name}</SelectItem>)}
              </SelectContent>
            </Select>
            {errors.role && <p className="text-sm text-red-500 mt-1">{errors.role}</p>}
          </div>
          
          <div>
            <Label>职位</Label>
            <Input value={formData.position} onChange={e => handleChange('position', e.target.value)} placeholder="请输入职位" />
          </div>
          
          <div>
            <Label>入职日期 *</Label>
            <Input type="date" value={formData.hireDate} onChange={e => handleChange('hireDate', e.target.value)} className={errors.hireDate ? 'border-red-500' : ''} />
            {errors.hireDate && <p className="text-sm text-red-500 mt-1">{errors.hireDate}</p>}
          </div>
          
          <div>
            <Label>状态</Label>
            <Select value={formData.status} onValueChange={value => handleChange('status', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">在职</SelectItem>
                <SelectItem value="inactive">离职</SelectItem>
                <SelectItem value="probation">试用期</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 密码（仅新增时显示） */}
        {!employee && <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>密码 *</Label>
              <div className="relative">
                <Input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={e => handleChange('password', e.target.value)} placeholder="请输入密码" className={errors.password ? 'border-red-500' : ''} />
                <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
            </div>
            
            <div>
              <Label>确认密码 *</Label>
              <div className="relative">
                <Input type={showConfirmPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={e => handleChange('confirmPassword', e.target.value)} placeholder="请确认密码" className={errors.confirmPassword ? 'border-red-500' : ''} />
                <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-sm text-red-500 mt-1">{errors.confirmPassword}</p>}
            </div>
          </div>}

        {/* 联系信息 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>地址</Label>
            <Input value={formData.address} onChange={e => handleChange('address', e.target.value)} placeholder="请输入地址" />
          </div>
          
          <div>
            <Label>紧急联系人 *</Label>
            <Input value={formData.emergencyContact} onChange={e => handleChange('emergencyContact', e.target.value)} placeholder="请输入紧急联系人姓名" className={errors.emergencyContact ? 'border-red-500' : ''} />
            {errors.emergencyContact && <p className="text-sm text-red-500 mt-1">{errors.emergencyContact}</p>}
          </div>
          
          <div>
            <Label>紧急联系电话 *</Label>
            <Input type="tel" value={formData.emergencyPhone} onChange={e => handleChange('emergencyPhone', e.target.value)} placeholder="请输入紧急联系电话" className={errors.emergencyPhone ? 'border-red-500' : ''} />
            {errors.emergencyPhone && <p className="text-sm text-red-500 mt-1">{errors.emergencyPhone}</p>}
          </div>
        </div>

        {/* 备注 */}
        <div>
          <Label>备注</Label>
          <Textarea value={formData.notes} onChange={e => handleChange('notes', e.target.value)} placeholder="请输入备注信息" rows={3} />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          取消
        </Button>
        <Button onClick={handleSubmit}>
          {employee ? '更新' : '添加'}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>;
}