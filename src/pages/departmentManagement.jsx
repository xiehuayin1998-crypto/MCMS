// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, useToast, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Badge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui';
// @ts-ignore;
import { Building, Users, User, Edit, Trash2, Plus, RefreshCw, Search, Shield } from 'lucide-react';

// @ts-ignore;
import { UserHeader } from '@/components/UserHeader';
// @ts-ignore;
import { PermissionGuard } from '@/components/PermissionGuard';
export default function DepartmentManagement(props) {
  const {
    $w,
    style
  } = props;
  const {
    toast
  } = useToast();
  const [departments, setDepartments] = React.useState([]);
  const [ministers, setMinisters] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [editingDept, setEditingDept] = React.useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [formData, setFormData] = React.useState({
    departmentName: '',
    description: '',
    manager: '',
    status: true
  });
  const [currentUser, setCurrentUser] = React.useState(null);

  // 加载当前用户信息
  const loadCurrentUser = async () => {
    try {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setCurrentUser(parsedUser);
        return;
      }

      // 从数据库加载用户信息
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
          localStorage.setItem('currentUser', JSON.stringify({
            userId: user._id,
            name: user.name,
            username: user.username,
            isAdmin: user.isAdmin,
            roles: user.roles || [],
            permissions: user.permissions || '',
            department: user.department
          }));
        }
      }
    } catch (error) {
      console.error('加载用户信息失败:', error);
    }
  };

  // 加载部门数据
  const loadDepartments = async () => {
    try {
      setLoading(true);
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'mc_departments',
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
        setDepartments(result.records);
      }
    } catch (error) {
      console.error('加载部门数据失败:', error);
      toast({
        title: "错误",
        description: "加载部门数据失败",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // 加载部长数据（isMinister为true的用户）
  const loadMinisters = async () => {
    try {
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'mc_users',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              isMinister: {
                $eq: true
              }
            }
          },
          select: {
            $master: true
          }
        }
      });
      if (result.records) {
        setMinisters(result.records);
      }
    } catch (error) {
      console.error('加载部长数据失败:', error);
      toast({
        title: "错误",
        description: "加载部长数据失败",
        variant: "destructive"
      });
    }
  };

  // 保存部门信息
  const handleSave = async () => {
    if (!formData.departmentName.trim()) {
      toast({
        title: "错误",
        description: "部门名称不能为空",
        variant: "destructive"
      });
      return;
    }

    // 确保 manager 字段格式正确
    const saveData = {
      departmentName: formData.departmentName.trim(),
      description: formData.description?.trim() || '',
      manager: formData.manager === 'none' ? '' : formData.manager,
      status: formData.status
    };
    try {
      if (editingDept?._id) {
        // 更新部门
        const result = await $w.cloud.callDataSource({
          dataSourceName: 'mc_departments',
          methodName: 'wedaUpdateV2',
          params: {
            data: saveData,
            filter: {
              where: {
                _id: {
                  $eq: editingDept._id
                }
              }
            }
          }
        });
        if (result.count > 0) {
          toast({
            title: "更新成功",
            description: "部门信息已更新"
          });
        }
      } else {
        // 新增部门
        const result = await $w.cloud.callDataSource({
          dataSourceName: 'mc_departments',
          methodName: 'wedaCreateV2',
          params: {
            data: {
              ...saveData,
              createdAt: new Date().getTime()
            }
          }
        });
        if (result.id) {
          toast({
            title: "添加成功",
            description: "新部门已添加"
          });
        }
      }
      loadDepartments();
      handleCloseDialog();
    } catch (error) {
      console.error('保存部门信息失败:', error);
      toast({
        title: "错误",
        description: error.message || "保存部门信息失败",
        variant: "destructive"
      });
    }
  };

  // 删除部门
  const handleDelete = async dept => {
    try {
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'mc_departments',
        methodName: 'wedaDeleteV2',
        params: {
          filter: {
            where: {
              _id: {
                $eq: dept._id
              }
            }
          }
        }
      });
      if (result.count > 0) {
        toast({
          title: "删除成功",
          description: "部门已删除"
        });
        loadDepartments();
      }
    } catch (error) {
      console.error('删除部门失败:', error);
      toast({
        title: "错误",
        description: "删除部门失败",
        variant: "destructive"
      });
    }
  };

  // 打开编辑对话框
  const handleEdit = dept => {
    setEditingDept(dept);
    setFormData({
      departmentName: dept.departmentName || '',
      description: dept.description || '',
      manager: dept.manager || 'none',
      status: dept.status !== undefined ? dept.status : true
    });
  };

  // 关闭对话框
  const handleCloseDialog = () => {
    setEditingDept(null);
    setIsAddDialogOpen(false);
    setFormData({
      departmentName: '',
      description: '',
      manager: 'none',
      status: true
    });
  };

  // 获取部长姓名
  const getMinisterName = ministerId => {
    if (!ministerId || ministerId === 'none') return '未指定';
    const minister = ministers.find(m => m._id === ministerId);
    return minister ? minister.name : '未指定';
  };

  // 获取状态样式
  const getStatusStyle = status => {
    return status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };
  const getStatusText = status => {
    return status ? '启用' : '停用';
  };

  // 过滤部门
  const filteredDepartments = departments.filter(dept => {
    const searchLower = searchTerm.toLowerCase();
    return dept.departmentName?.toLowerCase().includes(searchLower) || dept.description?.toLowerCase().includes(searchLower);
  });

  // 初始化加载
  React.useEffect(() => {
    loadCurrentUser();
    loadDepartments();
    loadMinisters();
  }, []);
  return <div className="min-h-screen bg-gray-50" style={style}>
    <UserHeader $w={$w} showHomeButton={true} />
    
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 页面标题 */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">部门管理</h1>
          <p className="text-gray-600">管理公司所有部门信息</p>
        </div>
        
        <Button onClick={() => {
          setIsAddDialogOpen(true);
          setFormData({
            departmentName: '',
            description: '',
            manager: 'none',
            status: true
          });
        }} className="flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          新增部门
        </Button>
      </div>

      {/* 权限管理系统导航标签 */}
      <PermissionGuard isAdmin={true} user={currentUser}>
        <div className="mb-6">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-blue-900">权限管理系统</h3>
                    <p className="text-sm text-blue-700">管理用户角色和权限分配</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => $w.utils.navigateTo({
                  pageId: 'permissionManagement',
                  params: {}
                })} className="border-blue-300 text-blue-700 hover:bg-blue-100">
                  <Shield className="w-4 h-4 mr-2" />
                  进入权限管理
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </PermissionGuard>

      {/* 搜索栏 */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input placeholder="搜索部门名称或描述..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
      </div>

      {/* 部门列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building className="w-5 h-5 mr-2" />
            部门列表 ({filteredDepartments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div> : filteredDepartments.length === 0 ? <div className="text-center py-12">
              <Building className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">暂无部门数据</p>
            </div> : <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>部门名称</TableHead>
                  <TableHead>描述</TableHead>
                  <TableHead>部长</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDepartments.map(dept => <TableRow key={dept._id}>
                    <TableCell className="font-medium">
                      <div className="font-semibold text-gray-900">{dept.departmentName}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-gray-600">{dept.description || '-'}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-gray-900">{getMinisterName(dept.manager)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusStyle(dept.status)}>
                        {getStatusText(dept.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(dept)} className="flex items-center">
                          <Edit className="w-4 h-4 mr-1" />
                          编辑
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(dept)} className="flex items-center text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4 mr-1" />
                          删除
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>)}
              </TableBody>
            </Table>}
        </CardContent>
      </Card>

      {/* 编辑/新增对话框 */}
      {(editingDept || isAddDialogOpen) && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">
              {editingDept?._id ? '编辑部门' : '新增部门'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-2">部门名称 *</Label>
                <Input value={formData.departmentName} onChange={e => setFormData({
                ...formData,
                departmentName: e.target.value
              })} placeholder="请输入部门名称" className="w-full" />
              </div>
              
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-2">部门描述</Label>
                <Input value={formData.description} onChange={e => setFormData({
                ...formData,
                description: e.target.value
              })} placeholder="请输入部门描述" className="w-full" />
              </div>
              
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-2">部长</Label>
                <Select value={formData.manager} onValueChange={value => setFormData({
                ...formData,
                manager: value
              })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="选择部长" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">不指定部长</SelectItem>
                    {ministers.map(minister => <SelectItem key={minister._id} value={minister._id}>
                        {minister.name} ({minister.username})
                      </SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-2">状态</Label>
                <Select value={formData.status.toString()} onValueChange={value => setFormData({
                ...formData,
                status: value === 'true'
              })}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">启用</SelectItem>
                    <SelectItem value="false">停用</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="outline" onClick={handleCloseDialog}>
                取消
              </Button>
              <Button onClick={handleSave}>
                保存
              </Button>
            </div>
          </div>
        </div>}
    </div>
  </div>;
}