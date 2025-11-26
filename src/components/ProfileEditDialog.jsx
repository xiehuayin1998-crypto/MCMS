// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Button, useToast } from '@/components/ui';
// @ts-ignore;
import { Loader2, Eye, EyeOff, Lock } from 'lucide-react';

export function ProfileEditDialog({
  open,
  onOpenChange,
  employee,
  onSave
}) {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    department: '',
    password: '',
    // 基本信息字段
    sex: '',
    employee_number: '',
    employee_type: '',
    // 其他字段设为只读
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
  const [departments, setDepartments] = useState([]);
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
      loadDepartments();
      if (employee) {
        // 编辑模式：从墨西哥时区恢复日期
        setFormData({
          name: employee.name || '',
          username: employee.username || '',
          department: employee.department || '',
          password: '',
          // 编辑时不显示原密码
          // 基本信息字段
          sex: employee.sex || '',
          employee_number: employee.employee_number || '',
          employee_type: employee.employee_type || '',
          // 其他字段设为只读
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
      }
      setErrors({});
    }
  }, [open, employee]);

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
    const dateFields = ['birthday', 'birthdate'];
    dateFields.forEach(field => {
      if (formData[field] && !validateDate(formData[field])) {
        newErrors[field] = '日期格式不正确';
      }
    });

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
        // 仅在修改密码时包含密码字段
        ...(formData.password && {
          password: formData.password
        }),
        // 基本信息字段
        sex: formData.sex || '',
        employee_number: formData.employee_number.trim(),
        employee_type: formData.employee_type || '',
        // 个人信息字段
        birthday: formData.birthday ? adjustDateForMexico(formData.birthday) : null,
        birthdate: formData.birthdate ? adjustDateForMexico(formData.birthdate) : null,
        age: formData.age ? parseInt(formData.age) : null
      };

      // 移除空值
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === '' || updateData[key] === null) {
          delete updateData[key];
        }
      });

      // 更新用户信息
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
        description: "个人资料已更新"
      });
      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error('保存失败:', error);
      toast({
        title: "操作失败",
        description: error.message || "无法保存个人资料",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  // 渲染可编辑的输入框
  const renderEditableInput = (field, label, type = 'text', placeholder = '') => {
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

  // 渲染只读的输入框
  const renderReadonlyInput = (field, label, value) => <div>
      <Label>{label}</Label>
      <div className="flex items-center">
        <Input value={value || ''} readOnly className="bg-gray-50" />
        <Lock className="w-4 h-4 text-gray-400 ml-2" />
      </div>
    </div>;

  // 渲染可编辑的日期选择框
  const renderEditableDateInput = (field, label) => {
    return <div>
        <Label>{label}</Label>
        <Input type="date" value={formData[field] || ''} onChange={e => handleDateChange(field, e.target.value)} className={errors[field] ? 'border-red-500' : ''} />
        {errors[field] && <p className="text-sm text-red-500 mt-1">{errors[field]}</p>}
      </div>;
  };

  // 渲染只读的日期显示
  const renderReadonlyDateInput = (field, label) => <div>
      <Label>{label}</Label>
      <div className="flex items-center">
        <Input value={formData[field] || ''} readOnly className="bg-gray-50" />
        <Lock className="w-4 h-4 text-gray-400 ml-2" />
      </div>
    </div>;

  // 渲染可编辑的选择框
  const renderEditableSelect = (field, label, options) => <div>
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

  // 渲染只读的选择框
  const renderReadonlySelect = (field, label, options) => {
    const selectedOption = options.find(option => option.value === formData[field]);
    return <div>
        <Label>{label}</Label>
        <div className="flex items-center">
          <Input value={selectedOption ? selectedOption.label : ''} readOnly className="bg-gray-50" />
          <Lock className="w-4 h-4 text-gray-400 ml-2" />
        </div>
      </div>;
  };

  // 基本信息部分 - 可编辑
  const renderBasicInfo = () => <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">基本信息（可编辑）</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderEditableInput('name', '姓名 *')}
        {renderEditableInput('username', '用户名 *')}
        {renderEditableInput('employee_number', '工号', 'text', '请输入工号')}
        {renderEditableSelect('sex', '性别', [{
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
        {renderEditableSelect('employee_type', '类别', [{
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
        <div>
          <Label>密码（留空不修改）</Label>
          {renderEditableInput('password', '密码', 'password', '请输入新密码，留空不修改')}
        </div>
        {renderEditableDateInput('birthday', '出生日期')}
        <div>
          <Label>年龄</Label>
          <Input value={formData.age || ''} readOnly className="bg-gray-50" placeholder="自动计算" />
        </div>
        {renderEditableDateInput('birthdate', '生日')}
      </div>
    </div>;

  // 工作信息部分 - 只读
  const renderWorkInfo = () => <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 text-gray-400">工作信息（只读）</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderReadonlyInput('Workplace', '工作地', formData.Workplace)}
        {renderReadonlyInput('mexican_company_positions', '墨西哥公司职位', formData.mexican_company_positions)}
        {renderReadonlyInput('headquarters_location', '总部所属单位', formData.headquarters_location)}
        {renderReadonlyInput('original_position', '总部或原总部岗位', formData.original_position)}
        {renderReadonlyDateInput('join_date', '入司时间')}
        {renderReadonlyInput('hierarchy', '层级', formData.hierarchy)}
        {renderReadonlyDateInput('hierarchy_date', '当前层级聘用时间')}
      </div>
    </div>;

  // 个人信息部分 - 只读
  const renderPersonalInfo = () => <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 text-gray-400">个人信息（只读）</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderReadonlyInput('birth_place', '籍贯', formData.birth_place)}
        {renderReadonlySelect('political_status', '政治面貌', [{
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
        {renderReadonlySelect('education', '学历', [{
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
        {renderReadonlyInput('graduation_institution', '毕业院校', formData.graduation_institution)}
        {renderReadonlyInput('major', '专业', formData.major)}
      </div>
    </div>;

  // 职称信息部分 - 只读
  const renderProfessionalInfo = () => <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 text-gray-400">职称信息（只读）</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderReadonlyInput('job_title', '职称', formData.job_title)}
        {renderReadonlyDateInput('job_title_date', '当前职称/技能等级聘用时间')}
      </div>
    </div>;

  // 证件信息部分 - 只读
  const renderDocumentInfo = () => <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 text-gray-400">证件信息（只读）</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderReadonlyInput('ID_number', '身份证号', formData.ID_number)}
        {renderReadonlyInput('official_passport', '因公护照号', formData.official_passport)}
        {renderReadonlyDateInput('official_passport_date', '因公护照有效期')}
        {renderReadonlyInput('private_passport', '因私护照号', formData.private_passport)}
        {renderReadonlyDateInput('private_passport_date', '因私护照到期时间')}
        {renderReadonlySelect('use_visa_type', '使用签证类型', [{
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
        {renderReadonlyDateInput('visa_validity_period', '签证有效期')}
      </div>
    </div>;

  // 联系信息部分 - 只读
  const renderContactInfo = () => <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 text-gray-400">联系信息（只读）</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderReadonlyInput('permanent_address_china', '国内常住地址', formData.permanent_address_china)}
        {renderReadonlyInput('contact_number_china', '国内联系电话', formData.contact_number_china)}
        {renderReadonlyInput('contact_number_mexico', '墨西哥联系电话', formData.contact_number_mexico)}
        {renderReadonlyDateInput('first_date_mexico', '首次入境墨西哥时间')}
        {renderReadonlyDateInput('localization_expenses_time', '本地化开支时间')}
      </div>
    </div>;

  // 紧急联系人部分 - 只读
  const renderEmergencyContact = () => <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 text-gray-400">紧急联系人（只读）</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderReadonlyInput('emergency_contact_name_china', '国内紧急联系人姓名', formData.emergency_contact_name_china)}
        {renderReadonlyInput('relationship_with_domestic_emergency_contacts', '与国内紧急联系人的关系', formData.relationship_with_domestic_emergency_contacts)}
        {renderReadonlyInput('emergency_contact_number_china', '国内紧急联系人电话', formData.emergency_contact_number_china)}
      </div>
    </div>;
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>修改个人资料</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {renderBasicInfo()}
          {renderWorkInfo()}
          {renderPersonalInfo()}
          {renderProfessionalInfo()}
          {renderDocumentInfo()}
          {renderContactInfo()}
          {renderEmergencyContact()}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={saving || departmentsLoading}>
            {saving ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : '保存'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>;
}