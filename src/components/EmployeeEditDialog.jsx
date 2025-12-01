// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Button, useToast, Checkbox } from '@/components/ui';
// @ts-ignore;
import { Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react';

export function EmployeeEditDialog({
  open,
  onOpenChange,
  employee,
  onSave,
  $w,
  currentUser // 添加当前用户信息参数
}) {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    isAdmin: false,
    permissions: '',
    roles: [],
    roles_level: [],
    isMinister: false,
    navigationOrder: '',
    department: '',
    sex: '',
    employee_number: '',
    employee_type: '',
    Workplace: '',
    company: '',
    headquarters_location: '',
    job_position_number: '',
    join_date: '',
    birthday: '',
    age: '',
    birth_place: '',
    social_security_number: '',
    rfc: '',
    education: '',
    graduation_institution: '',
    major: '',
    country_of_citizenship: '',
    address: '',
    telephone_number: '',
    ID_number: '',
    e_mail: '',
    emergency_contact: '',
    telephone_number_of_emergency_contact: ''
  });
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [permissionError, setPermissionError] = useState('');
  const {
    toast
  } = useToast();

  // 检查当前用户权限
  const checkPermission = () => {
    if (!currentUser) {
      setPermissionError('无法获取当前用户信息');
      return false;
    }

    // 如果是管理员，允许修改任何用户
    if (currentUser.isAdmin) {
      setPermissionError('');
      return true;
    }

    // 如果是普通用户，只能修改自己的数据
    if (employee && currentUser.userId !== employee._id) {
      setPermissionError('您没有权限修改其他用户的信息');
      return false;
    }
    setPermissionError('');
    return true;
  };

  // 验证身份证号函数
  const validateIdCard = idCard => {
    if (!idCard) return true;
    const regex = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
    return regex.test(idCard);
  };

  // 墨西哥时区调整：将日期向后移动一天
  const adjustDateForMexico = dateString => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      // 墨西哥时区比中国晚13-16小时，需要将日期向后移动一天
      date.setDate(date.getDate() + 1);
      return date.toISOString().split('T')[0];
    } catch (error) {
      return dateString;
    }
  };

  // 从墨西哥时区恢复日期
  const restoreDateFromMexico = dateString => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      // 从墨西哥时区恢复：将日期向前移动一天
      date.setDate(date.getDate() - 1);
      return date.toISOString().split('T')[0];
    } catch (error) {
      return dateString;
    }
  };

  // 加载角色列表 - 使用数据源方法
  const loadRoles = async () => {
    try {
      setRolesLoading(true);
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'mc_roles',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            $master: true
          },
          orderBy: [{
            roleName: 'asc'
          }]
        }
      });
      setRoles(result.records || []);
    } catch (error) {
      toast({
        title: "加载角色失败",
        description: error.message || "无法加载角色列表",
        variant: "destructive"
      });
    } finally {
      setRolesLoading(false);
    }
  };

  // 加载部门列表 - 使用数据源方法
  const loadDepartments = async () => {
    try {
      setDepartmentsLoading(true);
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'mc_departments',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            $master: true
          },
          orderBy: [{
            departmentName: 'asc'
          }]
        }
      });
      setDepartments(result.records || []);
    } catch (error) {
      toast({
        title: "加载部门失败",
        description: error.message || "无法加载部门列表",
        variant: "destructive"
      });
    } finally {
      setDepartmentsLoading(false);
    }
  };

  // 初始化表单数据
  useEffect(() => {
    if (open) {
      // 检查权限
      checkPermission();

      // 并行加载角色和部门数据
      Promise.all([loadRoles(), loadDepartments()]);
      if (employee) {
        // 编辑模式：从墨西哥时区恢复日期
        setFormData({
          name: employee.name || '',
          username: employee.username || '',
          department: employee.department || '',
          roles: Array.isArray(employee.roles) ? employee.roles.filter(id => typeof id === 'string') : [],
          roles_level: Array.isArray(employee.roles_level) ? employee.roles_level.filter(l => typeof l === 'number') : [],
          isAdmin: employee.isAdmin || false,
          permissions: employee.permissions || '',
          isMinister: employee.isMinister || false,
          navigationOrder: employee.navigationOrder || '',
          password: '',
          // 编辑时不显示原密码
          // 新增字段初始化，日期字段需要从墨西哥时区恢复
          sex: employee.sex || '',
          employee_number: employee.employee_number || '',
          employee_type: employee.employee_type || '',
          Workplace: employee.Workplace || '',
          company: employee.company || '',
          headquarters_location: employee.headquarters_location || '',
          job_position_number: employee.job_position_number || '',
          join_date: restoreDateFromMexico(employee.join_date) || '',
          birthday: restoreDateFromMexico(employee.birthday) || '',
          age: employee.age || '',
          birth_place: employee.birth_place || '',
          social_security_number: employee.social_security_number || '',
          rfc: employee.rfc || '',
          education: employee.education || '',
          graduation_institution: employee.graduation_institution || '',
          major: employee.major || '',
          country_of_citizenship: employee.country_of_citizenship || '',
          address: employee.address || '',
          telephone_number: employee.telephone_number || '',
          ID_number: employee.ID_number || '',
          e_mail: employee.e_mail || '',
          emergency_contact: employee.emergency_contact || '',
          telephone_number_of_emergency_contact: employee.telephone_number_of_emergency_contact || ''
        });
      } else {
        // 新建模式：使用当前日期
        setFormData({
          name: '',
          username: '',
          department: '',
          roles: [],
          roles_level: [],
          isAdmin: false,
          permissions: '',
          isMinister: false,
          navigationOrder: '',
          password: '123456',
          // 新增用户默认密码
          // 新增字段初始化
          sex: '',
          employee_number: '',
          employee_type: '',
          Workplace: '',
          company: '',
          headquarters_location: '',
          job_position_number: '',
          join_date: '',
          birthday: '',
          age: '',
          birth_place: '',
          social_security_number: '',
          rfc: '',
          education: '',
          graduation_institution: '',
          major: '',
          country_of_citizenship: '',
          address: '',
          telephone_number: '',
          ID_number: '',
          e_mail: '',
          emergency_contact: '',
          telephone_number_of_emergency_contact: ''
        });
      }
      setErrors({});
    }
  }, [open, employee, currentUser]);

  // 获取角色名称
  const getRoleName = roleId => {
    const role = roles.find(r => r._id === roleId);
    return role ? role.roleName : '未知角色';
  };

  // 获取角色等级
  const getRoleLevel = roleId => {
    const role = roles.find(r => r._id === roleId);
    return role ? role.level : 0;
  };

  // 处理角色选择变化
  const handleRoleChange = (roleId, checked) => {
    let newRoles;
    let newRolesLevel;
    if (checked) {
      newRoles = [...formData.roles, roleId];
    } else {
      newRoles = formData.roles.filter(id => id !== roleId);
    }

    // 同步更新 roles_level
    newRolesLevel = newRoles.map(id => getRoleLevel(id));
    setFormData({
      ...formData,
      roles: newRoles,
      roles_level: newRolesLevel
    });
  };

  // 计算年龄
  const calculateAge = birthDate => {
    if (!birthDate) return '';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || monthDiff === 0 && today.getDate() < birth.getDate()) {
      age--;
    }
    return age.toString();
  };

  // 处理出生日期变化
  const handleBirthDateChange = value => {
    const age = calculateAge(value);
    setFormData({
      ...formData,
      birthday: value,
      age: age
    });
  };

  // 验证密码
  const validatePassword = password => {
    if (!password) return true;
    return password.length >= 6;
  };

  // 验证日期格式
  const validateDate = date => {
    if (!date) return true;
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) return false;
    const d = new Date(date);
    return d instanceof Date && !isNaN(d);
  };

  // 表单验证
  const validateForm = () => {
    const newErrors = {};

    // 必填字段验证
    if (!formData.name.trim()) {
      newErrors.name = '姓名不能为空';
    }
    if (!formData.username.trim()) {
      newErrors.username = '用户名不能为空';
    }
    if (formData.username && !/^[a-zA-Z0-9_]{3,20}$/.test(formData.username)) {
      newErrors.username = '用户名只能包含字母、数字和下划线，长度3-20位';
    }
    if (!employee && !formData.password) {
      newErrors.password = '密码不能为空';
    }
    if (formData.password && !validatePassword(formData.password)) {
      newErrors.password = '密码长度至少6位';
    }

    // 身份证号验证（仅在填写时验证）
    if (formData.ID_number && !validateIdCard(formData.ID_number)) {
      newErrors.ID_number = '身份证号格式不正确';
    }

    // 日期验证
    const dateFields = ['join_date', 'birthday'];
    dateFields.forEach(field => {
      if (formData[field] && !validateDate(formData[field])) {
        newErrors[field] = '日期格式不正确';
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 处理输入变化
  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
    // 清除错误
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: null
      });
    }
  };

  // 处理日期输入变化 - 墨西哥时区调整
  const handleDateChange = (field, value) => {
    // 保存用户输入的原始日期
    setFormData({
      ...formData,
      [field]: value
    });
    // 清除错误
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: null
      });
    }
  };

  // 处理部门选择
  const handleDepartmentChange = value => {
    setFormData({
      ...formData,
      department: value
    });
  };

  // 处理表单提交 - 使用数据源方法
  const handleSubmit = async () => {
    // 检查权限
    if (!checkPermission()) {
      toast({
        title: "权限不足",
        description: permissionError,
        variant: "destructive"
      });
      return;
    }
    if (!validateForm()) {
      toast({
        title: "表单验证失败",
        description: "请检查并修正表单中的错误",
        variant: "destructive"
      });
      return;
    }
    try {
      setSaving(true);

      // 数据类型转换和清理，日期字段需要调整为墨西哥时区
      const updateData = {
        name: formData.name.trim(),
        username: formData.username.trim(),
        department: formData.department || '',
        roles: formData.roles.filter(id => typeof id === 'string'),
        roles_level: formData.roles_level.filter(l => typeof l === 'number'),
        isAdmin: Boolean(formData.isAdmin),
        permissions: formData.permissions || '',
        isMinister: Boolean(formData.isMinister),
        navigationOrder: formData.navigationOrder || '',
        // 仅在新增或修改密码时包含密码字段
        ...(formData.password && {
          password: formData.password
        }),
        // 字符串字段
        sex: formData.sex || '',
        employee_number: formData.employee_number.trim(),
        employee_type: formData.employee_type || '',
        Workplace: formData.Workplace.trim(),
        company: formData.company.trim(),
        headquarters_location: formData.headquarters_location.trim(),
        job_position_number: formData.job_position_number.trim(),
        birth_place: formData.birth_place.trim(),
        social_security_number: formData.social_security_number.trim(),
        rfc: formData.rfc.trim(),
        education: formData.education || '',
        graduation_institution: formData.graduation_institution.trim(),
        major: formData.major.trim(),
        country_of_citizenship: formData.country_of_citizenship || '',
        address: formData.address.trim(),
        telephone_number: formData.telephone_number.trim(),
        ID_number: formData.ID_number.trim(),
        e_mail: formData.e_mail.trim(),
        emergency_contact: formData.emergency_contact.trim(),
        telephone_number_of_emergency_contact: formData.telephone_number_of_emergency_contact.trim(),
        // 日期字段 - 调整为墨西哥时区（向后移动一天）
        join_date: formData.join_date ? adjustDateForMexico(formData.join_date) : null,
        birthday: formData.birthday ? adjustDateForMexico(formData.birthday) : null,
        // 数字字段
        age: formData.age ? parseInt(formData.age) : null
      };

      // 移除空值
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === '' || updateData[key] === null) {
          delete updateData[key];
        }
      });
      console.log('提交的数据:', updateData); // 调试日志

      if (employee && employee._id) {
        // 更新现有用户 - 使用数据源方法
        await $w.cloud.callDataSource({
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
        toast({
          title: "更新成功",
          description: "用户信息已更新"
        });
      } else {
        // 创建新用户 - 使用数据源方法
        await $w.cloud.callDataSource({
          dataSourceName: 'mc_users',
          methodName: 'wedaCreateV2',
          params: {
            data: updateData
          }
        });
        toast({
          title: "创建成功",
          description: "新用户已创建"
        });
      }
      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error('保存失败:', error); // 调试日志
      toast({
        title: "操作失败",
        description: error.message || "无法保存用户信息",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  // 渲染带错误提示的输入框
  const renderInput = (field, label, type = 'text', placeholder = '') => {
    if (field === 'password') {
      return <div>
        <Label>{label}</Label>
        <div className="relative">
          <Input type={showPassword ? 'text' : 'password'} value={formData[field] || ''} onChange={e => handleInputChange(field, e.target.value)} placeholder={placeholder} className={errors[field] ? 'border-red-500' : ''} />
          <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-gray-500" />}
          </button>
        </div>
        {errors[field] && <p className="text-sm text-red-500 mt-1">{errors[field]}</p>}
      </div>;
    }
    return <div>
      <Label>{label}</Label>
      <Input type={type} value={formData[field] || ''} onChange={e => handleInputChange(field, e.target.value)} placeholder={placeholder} className={errors[field] ? 'border-red-500' : ''} />
      {errors[field] && <p className="text-sm text-red-500 mt-1">{errors[field]}</p>}
    </div>;
  };

  // 渲染带错误提示的日期选择框（墨西哥时区调整）
  const renderDateInput = (field, label) => {
    return <div>
      <Label>{label}</Label>
      <Input type="date" value={formData[field] || ''} onChange={e => handleDateChange(field, e.target.value)} className={errors[field] ? 'border-red-500' : ''} />
      {errors[field] && <p className="text-sm text-red-500 mt-1">{errors[field]}</p>}
    </div>;
  };

  // 渲染带错误提示的选择框
  const renderSelect = (field, label, options) => <div>
    <Label>{label}</Label>
    <Select value={formData[field] || ''} onValueChange={value => handleInputChange(field, value)}>
      <SelectTrigger className={errors[field] ? 'border-red-500' : ''}>
        <SelectValue placeholder={`请选择${label}`} />
      </SelectTrigger>
      <SelectContent>
        {options.map(option => <SelectItem key={option.value} value={option.value}>
          {option.label}
        </SelectItem>)}
      </SelectContent>
    </Select>
    {errors[field] && <p className="text-sm text-red-500 mt-1">{errors[field]}</p>}
  </div>;

  // 分组渲染表单字段
  const renderBasicInfo = () => <div className="space-y-4">
    <h3 className="text-lg font-semibold text-gray-900">基本信息</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {renderInput('name', '姓名 *')}
      {renderInput('username', '用户名 *')}
      {renderInput('employee_number', '工号', 'text', '请输入工号')}
      {renderSelect('sex', '性别', [{
        value: '男',
        label: '男'
      }, {
        value: '女',
        label: '女'
      }])}
      <div>
        <Label>所属部门</Label>
        <Select value={formData.department || ''} onValueChange={handleDepartmentChange}>
          <SelectTrigger>
            <SelectValue placeholder="请选择部门" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">无部门</SelectItem>
            {departments.map(dept => <SelectItem key={dept._id} value={dept.departmentName}>
              {dept.departmentName}
            </SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      {employee ? <div>
        <Label>密码（留空不修改）</Label>
        {renderInput('password', '密码', 'password', '请输入新密码，留空不修改')}
      </div> : <div>
        <Label>密码 *</Label>
        {renderInput('password', '密码', 'password', '请输入密码')}
      </div>}
    </div>
  </div>;
  const renderWorkInfo = () => <div className="space-y-4">
    <h3 className="text-lg font-semibold text-gray-900">工作信息</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {renderInput('Workplace', '工作地', 'text', '请输入工作地')}
      {renderInput('company', '所属子公司', 'text', '请输入所属子公司')}
      {renderInput('job_position_number', '职位代码', 'text', '请输入职位代码')}
      {renderDateInput('join_date', '入司时间')}
    </div>
  </div>;
  const renderPersonalInfo = () => <div className="space-y-4">
    <h3 className="text-lg font-semibold text-gray-900">个人信息</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {renderDateInput('birthday', '出生日期')}
      <div>
        <Label>年龄</Label>
        <Input value={formData.age || ''} readOnly className="bg-gray-50" placeholder="自动计算" />
      </div>
      {renderInput('birth_place', '籍贯', 'text', '请输入籍贯')}
      {renderSelect('education', '学历', [{
        value: '高中',
        label: '高中'
      }, {
        value: '大专',
        label: '大专'
      }, {
        value: '本科',
        label: '本科'
      }, {
        value: '硕士',
        label: '硕士'
      }, {
        value: '博士',
        label: '博士'
      }])}
      {renderInput('graduation_institution', '毕业院校', 'text', '请输入毕业院校')}
      {renderInput('major', '专业', 'text', '请输入专业')}
      {renderSelect('country_of_citizenship', '国籍', [{
        value: '中国',
        label: '中国'
      }, {
        value: '墨西哥',
        label: '墨西哥'
      }, {
        value: '美国',
        label: '美国'
      }, {
        value: '其他',
        label: '其他'
      }])}
    </div>
  </div>;
  const renderDocumentInfo = () => <div className="space-y-4">
    <h3 className="text-lg font-semibold text-gray-900">证件信息</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {renderInput('ID_number', '身份证号', 'text', '请输入身份证号')}
      {renderInput('social_security_number', '社保号', 'text', '请输入社保号')}
      {renderInput('rfc', '个人税号', 'text', '请输入个人税号')}
    </div>
  </div>;
  const renderContactInfo = () => <div className="space-y-4">
    <h3 className="text-lg font-semibold text-gray-900">联系信息</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {renderInput('address', '墨西哥住宿地址', 'text', '请输入墨西哥住宿地址')}
      {renderInput('telephone_number', '电话号码', 'text', '请输入电话号码')}
      {renderInput('e_mail', '邮件地址', 'email', '请输入邮件地址')}
      {renderInput('emergency_contact', '紧急联系人', 'text', '请输入紧急联系人')}
      {renderInput('telephone_number_of_emergency_contact', '紧急联系人电话', 'text', '请输入紧急联系人电话')}
    </div>
  </div>;
  const renderPermissionInfo = () => <div className="space-y-4">
    {/* 权限信息部分暂时隐藏 */}
  </div>;
  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{employee ? '编辑用户' : '新增用户'}</DialogTitle>
      </DialogHeader>

      {/* 权限警告 */}
      {permissionError && <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-800 font-medium">{permissionError}</span>
          </div>
          {currentUser && !currentUser.isAdmin && <p className="text-red-600 text-sm mt-1">
              您只能修改自己的信息。如需修改其他用户信息，请联系管理员。
            </p>}
        </div>}

      <div className="space-y-6 py-4">
        {renderBasicInfo()}
        {renderWorkInfo()}
        {renderPersonalInfo()}
        {renderDocumentInfo()}
        {renderContactInfo()}
        {renderPermissionInfo()}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          取消
        </Button>
        <Button onClick={handleSubmit} disabled={saving || rolesLoading || !!permissionError} className={permissionError ? 'opacity-50 cursor-not-allowed' : ''}>
          {saving ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : '保存'}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>;
}