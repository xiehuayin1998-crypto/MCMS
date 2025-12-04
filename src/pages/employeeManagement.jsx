// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, useToast, Alert, AlertDescription, AlertTitle, Tabs, TabsContent, TabsList, TabsTrigger, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui';
// @ts-ignore;
import { User, Users, Building, Mail, Phone, Calendar, Search, Plus, Edit, Trash2, RefreshCw, Download, Upload, Eye, Filter, X, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

// @ts-ignore;
import { UserHeader } from '@/components/UserHeader';
// @ts-ignore;
import { EmployeeTable } from '@/components/EmployeeTable';
// @ts-ignore;
import { EmployeeEditDialog } from '@/components/EmployeeEditDialog';
// @ts-ignore;
import { EmployeeSearchFilter } from '@/components/EmployeeSearchFilter';
// @ts-ignore;
import { UserImportExport } from '@/components/UserImportExport';
// @ts-ignore;
import { PermissionGuard } from '@/components/PermissionGuard';
export default function EmployeeManagementPage(props) {
  const {
    $w,
    style
  } = props;
  const {
    toast
  } = useToast();
  const [activeTab, setActiveTab] = React.useState('employees');
  const [employees, setEmployees] = React.useState([]);
  const [departments, setDepartments] = React.useState([]);
  const [roles, setRoles] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedDepartment, setSelectedDepartment] = React.useState('');
  const [selectedRole, setSelectedRole] = React.useState('');
  const [showAddDialog, setShowAddDialog] = React.useState(false);
  const [showEditDialog, setShowEditDialog] = React.useState(false);
  const [selectedEmployee, setSelectedEmployee] = React.useState(null);
  const [currentUser, setCurrentUser] = React.useState(null);
  const [isAdmin, setIsAdmin] = React.useState(false);

  // 表单状态
  const [formData, setFormData] = React.useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    department: '',
    role: '',
    position: '',
    hireDate: '',
    status: 'active'
  });

  // 加载用户信息
  const loadUserInfo = async () => {
    try {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setCurrentUser(parsedUser);
        setIsAdmin(parsedUser.isAdmin || false);
        return;
      }
      if (props.$w.auth.currentUser && props.$w.auth.currentUser.name) {
        const result = await $w.cloud.callDataSource({
          dataSourceName: 'mc_users',
          methodName: 'wedaGetRecordsV2',
          params: {
            filter: {
              where: {
                username: {
                  $eq: props.$w.auth.currentUser.name
                }
              }
            },
            select: {
              $master: true
            }
          }
        });
        if (result.records && result.records.length > 0) {
          const user = result.records[0];
          setCurrentUser(user);
          setIsAdmin(user.isAdmin || false);
          localStorage.setItem('currentUser', JSON.stringify({
            userId: user._id,
            name: user.name,
            username: user.username,
            isAdmin: user.isAdmin,
            department: user.department
          }));
        } else {
          setIsAdmin(false);
        }
      }
    } catch (error) {
      console.error('加载用户信息失败:', error);
      setIsAdmin(false);
    }
  };

  // 加载员工数据
  const loadEmployees = async () => {
    try {
      setLoading(true);
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'mc_users',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            $master: true
          },
          orderBy: [{
            createdAt: 'desc'
          }]
        }
      });
      if (result.records) {
        setEmployees(result.records);
      }
    } catch (error) {
      console.error('加载员工数据失败:', error);
      toast({
        title: "错误",
        description: "加载员工数据失败",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // 加载部门数据
  const loadDepartments = async () => {
    try {
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'mc_departments',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            $master: true
          },
          orderBy: [{
            name: 'asc'
          }]
        }
      });
      if (result.records) {
        setDepartments(result.records);
      }
    } catch (error) {
      console.error('加载部门数据失败:', error);
    }
  };

  // 加载角色数据
  const loadRoles = async () => {
    try {
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'mc_roles',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            $master: true
          },
          orderBy: [{
            name: 'asc'
          }]
        }
      });
      if (result.records) {
        setRoles(result.records);
      }
    } catch (error) {
      console.error('加载角色数据失败:', error);
    }
  };

  // 过滤员工
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = !searchTerm || employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) || employee.username?.toLowerCase().includes(searchTerm.toLowerCase()) || employee.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !selectedDepartment || employee.department === selectedDepartment;
    const matchesRole = !selectedRole || employee.role === selectedRole;
    return matchesSearch && matchesDepartment && matchesRole;
  });

  // 处理添加员工
  const handleAddEmployee = () => {
    setSelectedEmployee(null);
    setFormData({
      name: '',
      username: '',
      email: '',
      phone: '',
      department: '',
      role: '',
      position: '',
      hireDate: '',
      status: 'active'
    });
    setShowAddDialog(true);
  };

  // 处理编辑员工
  const handleEditEmployee = employee => {
    setSelectedEmployee(employee);
    setFormData({
      name: employee.name || '',
      username: employee.username || '',
      email: employee.email || '',
      phone: employee.phone || '',
      department: employee.department || '',
      role: employee.role || '',
      position: employee.position || '',
      hireDate: employee.hireDate || '',
      status: employee.status || 'active'
    });
    setShowEditDialog(true);
  };

  // 处理删除员工
  const handleDeleteEmployee = async employee => {
    if (window.confirm(`确定要删除员工"${employee.name}"吗？此操作不可恢复。`)) {
      try {
        const result = await $w.cloud.callDataSource({
          dataSourceName: 'mc_users',
          methodName: 'wedaDeleteV2',
          params: {
            filter: {
              where: {
                _id: {
                  $eq: employee._id
                }
              }
            }
          }
        });
        if (result.count > 0) {
          toast({
            title: "删除成功",
            description: "员工已删除"
          });
          loadEmployees();
        }
      } catch (error) {
        console.error('删除员工失败:', error);
        toast({
          title: "删除失败",
          description: error.message || "删除过程中发生错误",
          variant: "destructive"
        });
      }
    }
  };

  // 处理表单提交
  const handleSubmit = async () => {
    try {
      if (!formData.name || !formData.username || !formData.email) {
        toast({
          title: "请填写完整信息",
          description: "姓名、用户名和邮箱不能为空",
          variant: "destructive"
        });
        return;
      }
      const employeeData = {
        ...formData,
        updatedAt: new Date().getTime()
      };
      if (selectedEmployee) {
        // 编辑现有员工
        const result = await $w.cloud.callDataSource({
          dataSourceName: 'mc_users',
          methodName: 'wedaUpdateV2',
          params: {
            data: employeeData,
            filter: {
              where: {
                _id: {
                  $eq: selectedEmployee._id
                }
              }
            }
          }
        });
        if (result.count > 0) {
          toast({
            title: "更新成功",
            description: "员工信息已更新"
          });
          setShowEditDialog(false);
        }
      } else {
        // 添加新员工
        employeeData.createdAt = new Date().getTime();
        const result = await $w.cloud.callDataSource({
          dataSourceName: 'mc_users',
          methodName: 'wedaCreateV2',
          params: {
            data: employeeData
          }
        });
        if (result.id) {
          toast({
            title: "添加成功",
            description: "员工已添加"
          });
          setShowAddDialog(false);
        }
      }
      loadEmployees();
    } catch (error) {
      console.error('操作失败:', error);
      toast({
        title: "操作失败",
        description: error.message || "操作过程中发生错误",
        variant: "destructive"
      });
    }
  };

  // 处理表单字段变化
  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 刷新用户信息
  const refreshUserInfo = async () => {
    await loadUserInfo();
    await loadEmployees();
    toast({
      title: "刷新成功",
      description: "用户信息已更新"
    });
  };

  // 初始化
  React.useEffect(() => {
    loadUserInfo();
    loadEmployees();
    loadDepartments();
    loadRoles();
  }, []);
  return <div className="min-h-screen bg-gray-50" style={style}>
      <UserHeader $w={$w} showHomeButton={true} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">员工管理</h1>
            <p className="text-gray-600 mt-1">管理公司员工信息和权限</p>
          </div>
          
          <PermissionGuard requiredPermission="employee_management" currentUser={currentUser}>
            <Button onClick={handleAddEmployee} className="flex items-center bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              添加员工
            </Button>
          </PermissionGuard>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="employees" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>员工列表 ({filteredEmployees.length})</span>
            </TabsTrigger>
            <TabsTrigger value="import" className="flex items-center space-x-2">
              <Upload className="w-4 h-4" />
              <span>批量导入</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="employees" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>员工列表</CardTitle>
              </CardHeader>
              <CardContent>
                <EmployeeSearchFilter searchTerm={searchTerm} setSearchTerm={setSearchTerm} selectedDepartment={selectedDepartment} setSelectedDepartment={setSelectedDepartment} selectedRole={selectedRole} setSelectedRole={setSelectedRole} departments={departments} roles={roles} />
                
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" onClick={loadEmployees} className="flex items-center bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-300">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    刷新员工列表
                  </Button>
                  <Button variant="outline" onClick={() => setSearchTerm('')} className="flex items-center bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-300">
                    <Filter className="w-4 h-4 mr-2" />
                    清除筛选
                  </Button>
                </div>

                <EmployeeTable employees={filteredEmployees} departments={departments} roles={roles} onEdit={handleEditEmployee} onDelete={handleDeleteEmployee} loading={loading} currentUser={currentUser} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="import" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>批量导入员工</CardTitle>
              </CardHeader>
              <CardContent>
                <UserImportExport onImportComplete={loadEmployees} departments={departments} roles={roles} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 添加/编辑员工对话框 */}
        <Dialog open={showAddDialog || showEditDialog} onOpenChange={() => {
        setShowAddDialog(false);
        setShowEditDialog(false);
      }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedEmployee ? '编辑员工' : '添加员工'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>姓名 *</Label>
                <Input value={formData.name} onChange={e => handleFormChange('name', e.target.value)} placeholder="请输入员工姓名" />
              </div>
              <div>
                <Label>用户名 *</Label>
                <Input value={formData.username} onChange={e => handleFormChange('username', e.target.value)} placeholder="请输入用户名" />
              </div>
              <div>
                <Label>邮箱 *</Label>
                <Input type="email" value={formData.email} onChange={e => handleFormChange('email', e.target.value)} placeholder="请输入邮箱" />
              </div>
              <div>
                <Label>电话</Label>
                <Input value={formData.phone} onChange={e => handleFormChange('phone', e.target.value)} placeholder="请输入电话" />
              </div>
              <div>
                <Label>部门</Label>
                <Select value={formData.department} onValueChange={value => handleFormChange('department', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择部门" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => <SelectItem key={dept._id} value={dept.name}>{dept.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>角色</Label>
                <Select value={formData.role} onValueChange={value => handleFormChange('role', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择角色" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map(role => <SelectItem key={role._id} value={role.name}>{role.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>职位</Label>
                <Input value={formData.position} onChange={e => handleFormChange('position', e.target.value)} placeholder="请输入职位" />
              </div>
              <div>
                <Label>入职日期</Label>
                <Input type="date" value={formData.hireDate} onChange={e => handleFormChange('hireDate', e.target.value)} />
              </div>
              <div>
                <Label>状态</Label>
                <Select value={formData.status} onValueChange={value => handleFormChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">在职</SelectItem>
                    <SelectItem value="inactive">离职</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
              setShowAddDialog(false);
              setShowEditDialog(false);
            }}>
                取消
              </Button>
              <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
                {selectedEmployee ? '更新' : '添加'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>;
}