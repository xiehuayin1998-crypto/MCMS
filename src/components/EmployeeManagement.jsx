// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Badge, useToast, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui';
// @ts-ignore;
import { User, Mail, Shield, Building, Edit, Trash2, Plus, Search, Eye, X } from 'lucide-react';

export function EmployeeManagement() {
  const [employees, setEmployees] = React.useState([]);
  const [departments, setDepartments] = React.useState([]);
  const [roles, setRoles] = React.useState([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingEmployee, setEditingEmployee] = React.useState(null);
  const [formData, setFormData] = React.useState({
    name: '',
    username: '',
    password: '',
    department: '',
    roles: '',
    isAdmin: false,
    permissions: '[]'
  });
  const {
    toast
  } = useToast();

  // 加载员工数据
  const loadEmployees = async () => {
    try {
      setIsLoading(true);
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
        title: "加载失败",
        description: "无法加载员工数据",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
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
          }
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
          }
        }
      });
      if (result.records) {
        setRoles(result.records);
      }
    } catch (error) {
      console.error('加载角色数据失败:', error);
    }
  };

  // 初始化加载
  React.useEffect(() => {
    loadEmployees();
    loadDepartments();
    loadRoles();
  }, []);

  // 处理表单提交
  const handleSubmit = async e => {
    e.preventDefault();
    try {
      if (editingEmployee) {
        // 更新员工
        await $w.cloud.callDataSource({
          dataSourceName: 'mc_users',
          methodName: 'wedaUpdateV2',
          params: {
            data: {
              name: formData.name,
              username: formData.username,
              department: formData.department,
              roles: formData.roles,
              isAdmin: formData.isAdmin,
              permissions: formData.permissions
            },
            filter: {
              where: {
                _id: {
                  $eq: editingEmployee._id
                }
              }
            }
          }
        });
        toast({
          title: "更新成功",
          description: "员工信息已更新"
        });
      } else {
        // 新增员工
        await $w.cloud.callDataSource({
          dataSourceName: 'mc_users',
          methodName: 'wedaCreateV2',
          params: {
            data: {
              name: formData.name,
              username: formData.username,
              password: formData.password,
              department: formData.department,
              roles: formData.roles,
              isAdmin: formData.isAdmin,
              permissions: formData.permissions
            }
          }
        });
        toast({
          title: "添加成功",
          description: "新员工已添加"
        });
      }
      setIsDialogOpen(false);
      setEditingEmployee(null);
      setFormData({
        name: '',
        username: '',
        password: '',
        department: '',
        roles: '',
        isAdmin: false,
        permissions: '[]'
      });
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

  // 处理删除
  const handleDelete = async employee => {
    if (window.confirm(`确定要删除员工 ${employee.name} 吗？`)) {
      try {
        await $w.cloud.callDataSource({
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
        toast({
          title: "删除成功",
          description: "员工已删除"
        });
        loadEmployees();
      } catch (error) {
        console.error('删除失败:', error);
        toast({
          title: "删除失败",
          description: error.message || "删除过程中发生错误",
          variant: "destructive"
        });
      }
    }
  };

  // 打开编辑对话框
  const openEditDialog = (employee = null) => {
    if (employee) {
      setEditingEmployee(employee);
      setFormData({
        name: employee.name,
        username: employee.username,
        password: '',
        department: employee.department,
        roles: employee.roles,
        isAdmin: employee.isAdmin,
        permissions: employee.permissions || '[]'
      });
    } else {
      setEditingEmployee(null);
      setFormData({
        name: '',
        username: '',
        password: '',
        department: '',
        roles: '',
        isAdmin: false,
        permissions: '[]'
      });
    }
    setIsDialogOpen(true);
  };

  // 过滤员工
  const filteredEmployees = employees.filter(employee => employee.name.toLowerCase().includes(searchTerm.toLowerCase()) || employee.username.toLowerCase().includes(searchTerm.toLowerCase()) || employee.department.toLowerCase().includes(searchTerm.toLowerCase()));

  // 获取状态徽章样式
  const getRoleBadge = role => {
    const roleConfig = {
      '管理员': 'bg-red-100 text-red-800',
      '普通员工': 'bg-blue-100 text-blue-800',
      '部门主管': 'bg-green-100 text-green-800',
      '技术主管': 'bg-purple-100 text-purple-800'
    };
    return roleConfig[role] || 'bg-gray-100 text-gray-800';
  };
  return <div className="space-y-6">
      {/* 搜索和操作栏 */}
      <div className="flex justify-between items-center">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="搜索员工..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <Button onClick={() => openEditDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          添加员工
        </Button>
      </div>

      {/* 员工列表 */}
      <Card>
        <CardHeader>
          <CardTitle>员工列表</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div> : <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">姓名</th>
                    <th className="text-left py-3 px-4">用户名</th>
                    <th className="text-left py-3 px-4">部门</th>
                    <th className="text-left py-3 px-4">角色</th>
                    <th className="text-left py-3 px-4">权限</th>
                    <th className="text-left py-3 px-4">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map(employee => <tr key={employee._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <User className="w-4 h-4 text-blue-600" />
                          </div>
                          <span className="font-medium">{employee.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">{employee.username}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <Building className="w-4 h-4 mr-2 text-gray-400" />
                          {employee.department}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getRoleBadge(employee.roles)}>
                          {employee.roles}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">
                          {employee.isAdmin ? '管理员' : '普通用户'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(employee)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(employee)} className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>)}
                </tbody>
              </table>
              {filteredEmployees.length === 0 && <div className="text-center py-8 text-gray-500">
                  <User className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>暂无员工数据</p>
                </div>}
            </div>}
        </CardContent>
      </Card>

      {/* 编辑对话框 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingEmployee ? '编辑员工' : '添加员工'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>姓名</Label>
              <Input value={formData.name} onChange={e => setFormData({
              ...formData,
              name: e.target.value
            })} placeholder="请输入员工姓名" required />
            </div>
            <div className="space-y-2">
              <Label>用户名</Label>
              <Input value={formData.username} onChange={e => setFormData({
              ...formData,
              username: e.target.value
            })} placeholder="请输入用户名" required />
            </div>
            {!editingEmployee && <div className="space-y-2">
                <Label>密码</Label>
                <Input type="password" value={formData.password} onChange={e => setFormData({
              ...formData,
              password: e.target.value
            })} placeholder="请输入密码" required />
              </div>}
            <div className="space-y-2">
              <Label>部门</Label>
              <Select value={formData.department} onValueChange={value => setFormData({
              ...formData,
              department: value
            })}>
                <SelectTrigger>
                  <SelectValue placeholder="选择部门" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => <SelectItem key={dept._id} value={dept.name}>
                      {dept.name}
                    </SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>角色</Label>
              <Select value={formData.roles} onValueChange={value => setFormData({
              ...formData,
              roles: value
            })}>
                <SelectTrigger>
                  <SelectValue placeholder="选择角色" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(role => <SelectItem key={role._id} value={role.name}>
                      {role.name}
                    </SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>管理员权限</Label>
              <Select value={formData.isAdmin.toString()} onValueChange={value => setFormData({
              ...formData,
              isAdmin: value === 'true'
            })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">普通用户</SelectItem>
                  <SelectItem value="true">管理员</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                取消
              </Button>
              <Button type="submit">
                {editingEmployee ? '更新' : '添加'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>;
}