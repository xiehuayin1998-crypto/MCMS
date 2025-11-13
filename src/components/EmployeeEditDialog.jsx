// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Button, useToast } from '@/components/ui';
// @ts-ignore;
import { Loader2, Eye, EyeOff } from 'lucide-react';

export function EmployeeEditDialog({
  open,
  onOpenChange,
  employee,
  onSave
}) {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    department: '',
    roles: [],
    roles_level: [],
    isAdmin: false,
    password: '',
    // 新增字段
    sex: '',
    employee_number: '',
    employee_type: '',
    Workplace: '',
    mexican_company_positions: '',
    headquarters_location: '',
    original_position: '',
    join_date: '',
    birthday: '',
    age: '',
    birth_place: '',
    political_status: '',
    education: '',
    graduation_institution: '',
    major: '',
    job_title: '',
    job_title_date: '',
    hierarchy: '',
    hierarchy_date: '',
    ID_number: '',
    official_passport: '',
    official_passport_date: '',
    private_passport: '',
    private_passport_date: '',
    use_visa_type: '',
    visa_validity_period: '',
    localization_expenses_time: '',
    permanent_address_china: '',
    contact_number_china: '',
    contact_number_mexico: '',
    first_date_mexico: '',
    emergency_contact_name_china: '',
    relationship_with_domestic_emergency_contacts: '',
    emergency_contact_number_china: '',
    birthdate: ''
  });
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const {
    toast
  } = useToast();

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

  // 加载角色列表
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

  // 加载部门列表
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
          password: '',
          // 编辑时不显示原密码
          // 新增字段初始化，日期字段需要从墨西哥时区恢复
          sex: employee.sex || '',
          employee_number: employee.employee_number || '',
          employee_type: employee.employee_type || '',
          Workplace: employee.Workplace || '',
          mexican_company_positions: employee.mexican_company_positions || '',
          headquarters_location: employee.headquarters_location || '',
          original_position: employee.original_position || '',
          join_date: restoreDateFromMexico(employee.join_date) || '',
          birthday: restoreDateFromMexico(employee.birthday) || '',
          age: employee.age || '',
          birth_place: employee.birth_place || '',
          political_status: employee.political_status || '',
          education: employee.education || '',
          graduation_institution: employee.graduation_institution || '',
          major: employee.major || '',
          job_title: employee.job_title || '',
          job_title_date: restoreDateFromMexico(employee.job_title_date) || '',
          hierarchy: employee.hierarchy || '',
          hierarchy_date: restoreDateFromMexico(employee.hierarchy_date) || '',
          ID_number: employee.ID_number || '',
          official_passport: employee.official_passport || '',
          official_passport_date: restoreDateFromMexico(employee.official_passport_date) || '',
          private_passport: employee.private_passport || '',
          private_passport_date: restoreDateFromMexico(employee.private_passport_date) || '',
          use_visa_type: employee.use_visa_type || '',
          visa_validity_period: restoreDateFromMexico(employee.visa_validity_period) || '',
          localization_expenses_time: restoreDateFromMexico(employee.localization_expenses_time) || '',
          permanent_address_china: employee.permanent_address_china || '',
          contact_number_china: employee.contact_number_china || '',
          contact_number_mexico: employee.contact_number_mexico || '',
          first_date_mexico: restoreDateFromMexico(employee.first_date_mexico) || '',
          emergency_contact_name_china: employee.emergency_contact_name_china || '',
          relationship_with_domestic_emergency_contacts: employee.relationship_with_domestic_emergency_contacts || '',
          emergency_contact_number_china: employee.emergency_contact_number_china || '',
          birthdate: restoreDateFromMexico(employee.birthdate) || ''
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
          password: '123456',
          // 新增用户默认密码
          // 新增字段初始化
          sex: '',
          employee_number: '',
          employee_type: '',
          Workplace: '',
          mexican_company_positions: '',
          headquarters_location: '',
          original_position: '',
          join_date: '',
          birthday: '',
          age: '',
          birth_place: '',
          political_status: '',
          education: '',
          graduation_institution: '',
          major: '',
          job_title: '',
          job_title_date: '',
          hierarchy: '',
          hierarchy_date: '',
          ID_number: '',
          official_passport: '',
          official_passport_date: '',
          private_passport: '',
          private_passport_date: '',
          use_visa_type: '',
          visa_validity_period: '',
          localization_expenses_time: '',
          permanent_address_china: '',
          contact_number_china: '',
          contact_number_mexico: '',
          first_date_mexico: '',
          emergency_contact_name_china: '',
          relationship_with_domestic_emergency_contacts: '',
          emergency_contact_number_china: '',
          birthdate: ''
        });
      }
      setErrors({});
    }
  }, [open, employee]);

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
      age: age,
      birthdate: value
    });
  };

  // 验证身份证号
  const validateIdCard = idCard => {
    if (!idCard) return true;
    const regex = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
    return regex.test(idCard);
  };

  // 验证手机号
  const validatePhone = phone => {
    if (!phone) return true;
    const regex = /^1[3-9]\d{9}$/;
    return regex.test(phone);
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

    // 身份证号验证
    if (formData.ID_number && !validateIdCard(formData.ID_number)) {
      newErrors.ID_number = '身份证号格式不正确';
    }

    // 手机号验证
    if (formData.contact_number_china && !validatePhone(formData.contact_number_china)) {
      newErrors.contact_number_china = '国内手机号格式不正确';
    }
    if (formData.contact_number_mexico && !/^\d{7,15}$/.test(formData.contact_number_mexico)) {
      newErrors.contact_number_mexico = '墨西哥电话格式不正确';
    }
    if (formData.emergency_contact_number_china && !validatePhone(formData.emergency_contact_number_china)) {
      newErrors.emergency_contact_number_china = '紧急联系人电话格式不正确';
    }

    // 日期验证
    const dateFields = ['join_date', 'birthday', 'job_title_date', 'hierarchy_date', 'official_passport_date', 'private_passport_date', 'visa_validity_period', 'localization_expenses_time', 'first_date_mexico', 'birthdate'];
    dateFields.forEach(field => {
      if (formData[field] && !validateDate(formData[field])) {
        newErrors[field] = '日期格式不正确';
      }
    });

    // 护照号验证
    if (formData.official_passport && !/^[A-Z0-9]{5,15}$/.test(formData.official_passport)) {
      newErrors.official_passport = '护照号格式不正确';
    }
    if (formData.private_passport && !/^[A-Z0-9]{5,15}$/.test(formData.private_passport)) {
      newErrors.private_passport = '护照号格式不正确';
    }

    // 工号验证
    if (formData.employee_number && !/^[A-Z0-9-]{1,20}$/.test(formData.employee_number)) {
      newErrors.employee_number = '工号格式不正确';
    }
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

  // 处理表单提交
  const handleSubmit = async () => {
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
        // 仅在新增或修改密码时包含密码字段
        ...(formData.password && {
          password: formData.password
        }),
        // 字符串字段
        sex: formData.sex || '',
        employee_number: formData.employee_number.trim(),
        employee_type: formData.employee_type || '',
        Workplace: formData.Workplace.trim(),
        mexican_company_positions: formData.mexican_company_positions.trim(),
        headquarters_location: formData.headquarters_location.trim(),
        original_position: formData.original_position.trim(),
        birth_place: formData.birth_place.trim(),
        political_status: formData.political_status || '',
        education: formData.education || '',
        graduation_institution: formData.graduation_institution.trim(),
        major: formData.major.trim(),
        job_title: formData.job_title.trim(),
        hierarchy: formData.hierarchy.trim(),
        ID_number: formData.ID_number.trim(),
        official_passport: formData.official_passport.trim(),
        private_passport: formData.private_passport.trim(),
        use_visa_type: formData.use_visa_type || '',
        permanent_address_china: formData.permanent_address_china.trim(),
        contact_number_china: formData.contact_number_china.trim(),
        contact_number_mexico: formData.contact_number_mexico.trim(),
        emergency_contact_name_china: formData.emergency_contact_name_china.trim(),
        relationship_with_domestic_emergency_contacts: formData.relationship_with_domestic_emergency_contacts.trim(),
        emergency_contact_number_china: formData.emergency_contact_number_china.trim(),
        // 日期字段 - 调整为墨西哥时区（向后移动一天）
        join_date: formData.join_date ? adjustDateForMexico(formData.join_date) : null,
        birthday: formData.birthday ? adjustDateForMexico(formData.birthday) : null,
        job_title_date: formData.job_title_date ? adjustDateForMexico(formData.job_title_date) : null,
        hierarchy_date: formData.hierarchy_date ? adjustDateForMexico(formData.hierarchy_date) : null,
        official_passport_date: formData.official_passport_date ? adjustDateForMexico(formData.official_passport_date) : null,
        private_passport_date: formData.private_passport_date ? adjustDateForMexico(formData.private_passport_date) : null,
        visa_validity_period: formData.visa_validity_period ? adjustDateForMexico(formData.visa_validity_period) : null,
        localization_expenses_time: formData.localization_expenses_time ? adjustDateForMexico(formData.localization_expenses_time) : null,
        first_date_mexico: formData.first_date_mexico ? adjustDateForMexico(formData.first_date_mexico) : null,
        birthdate: formData.birthdate ? adjustDateForMexico(formData.birthdate) : null,
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
        // 更新现有用户
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
        // 创建新用户
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
        {renderSelect('employee_type', '类别', [{
        value: '正式员工',
        label: '正式员工'
      }, {
        value: '实习生',
        label: '实习生'
      }, {
        value: '外派员工',
        label: '外派员工'
      }, {
        value: '合同工',
        label: '合同工'
      }])}
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
        {renderInput('mexican_company_positions', '墨西哥公司职位', 'text', '请输入墨西哥公司职位')}
        {renderInput('headquarters_location', '总部所属单位', 'text', '请输入总部所属单位')}
        {renderInput('original_position', '总部或原总部岗位', 'text', '请输入总部或原总部岗位')}
        {renderDateInput('join_date', '入司时间')}
        {renderInput('hierarchy', '层级', 'text', '请输入层级')}
        {renderDateInput('hierarchy_date', '当前层级聘用时间')}
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
        {renderDateInput('birthdate', '生日')}
        {renderInput('birth_place', '籍贯', 'text', '请输入籍贯')}
        {renderSelect('political_status', '政治面貌', [{
        value: '群众',
        label: '群众'
      }, {
        value: '共青团员',
        label: '共青团员'
      }, {
        value: '中共党员',
        label: '中共党员'
      }, {
        value: '民主党派',
        label: '民主党派'
      }])}
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
      </div>
    </div>;
  const renderProfessionalInfo = () => <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">职称信息</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderInput('job_title', '职称', 'text', '请输入职称')}
        {renderDateInput('job_title_date', '当前职称/技能等级聘用时间')}
      </div>
    </div>;
  const renderDocumentInfo = () => <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">证件信息</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderInput('ID_number', '身份证号', 'text', '请输入身份证号')}
        {renderInput('official_passport', '因公护照号', 'text', '请输入因公护照号')}
        {renderDateInput('official_passport_date', '因公护照有效期')}
        {renderInput('private_passport', '因私护照号', 'text', '请输入因私护照号')}
        {renderDateInput('private_passport_date', '因私护照到期时间')}
        {renderSelect('use_visa_type', '使用签证类型', [{
        value: '商务签证',
        label: '商务签证'
      }, {
        value: '工作签证',
        label: '工作签证'
      }, {
        value: '旅游签证',
        label: '旅游签证'
      }, {
        value: '学生签证',
        label: '学生签证'
      }])}
        {renderDateInput('visa_validity_period', '签证有效期')}
      </div>
    </div>;
  const renderContactInfo = () => <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">联系信息</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderInput('permanent_address_china', '国内常住地址', 'text', '请输入国内常住地址')}
        {renderInput('contact_number_china', '国内联系电话', 'text', '请输入国内联系电话')}
        {renderInput('contact_number_mexico', '墨西哥联系电话', 'text', '请输入墨西哥联系电话')}
        {renderDateInput('first_date_mexico', '首次入境墨西哥时间')}
        {renderDateInput('localization_expenses_time', '本地化开支时间')}
      </div>
    </div>;
  const renderEmergencyContact = () => <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">紧急联系人</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderInput('emergency_contact_name_china', '国内紧急联系人姓名', 'text', '请输入紧急联系人姓名')}
        {renderInput('relationship_with_domestic_emergency_contacts', '与国内紧急联系人的关系', 'text', '请输入关系')}
        {renderInput('emergency_contact_number_china', '国内紧急联系人电话', 'text', '请输入紧急联系人电话')}
      </div>
    </div>;
  const renderRoleInfo = () => <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">角色权限</h3>
      <div>
        <Label>用户角色</Label>
        {rolesLoading ? <div className="flex items-center justify-center py-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm text-gray-500">加载中...</span>
          </div> : roles.length > 0 ? <div className="space-y-2">
            {roles.map(role => <label key={role._id} className="flex items-center space-x-2">
                <input type="checkbox" checked={formData.roles.includes(role._id)} onChange={e => handleRoleChange(role._id, e.target.checked)} className="rounded border-gray-300" />
                <span className="text-sm">{role.roleName} (等级: {role.level || 0})</span>
              </label>)}
          </div> : <div className="text-sm text-gray-500 py-2">暂无可用角色</div>}
      </div>
      <div>
        <Label>管理员权限</Label>
        <label className="flex items-center space-x-2">
          <input type="checkbox" checked={formData.isAdmin} onChange={e => handleInputChange('isAdmin', e.target.checked)} className="rounded border-gray-300" />
          <span className="text-sm">设为管理员</span>
        </label>
      </div>
    </div>;
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{employee ? '编辑用户' : '新增用户'}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {renderBasicInfo()}
          {renderWorkInfo()}
          {renderPersonalInfo()}
          {renderProfessionalInfo()}
          {renderDocumentInfo()}
          {renderContactInfo()}
          {renderEmergencyContact()}
          {renderRoleInfo()}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={saving || rolesLoading}>
            {saving ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : '保存'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>;
}