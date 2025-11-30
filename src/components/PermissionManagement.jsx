// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, useToast, Input, Label, Tabs, TabsContent, TabsList, TabsTrigger, Badge, Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from '@/components/ui';
// @ts-ignore;
import { Plus, Edit, Trash2, Shield, User, Users, Search, RefreshCw } from 'lucide-react';

// 导入子组件
// @ts-ignore;
import { RoleFormDialog } from './RoleFormDialog';
// @ts-ignore;
import { UserRoleDialog } from './UserRoleDialog';
// @ts-ignore;
import { SyncStatusAlert } from './SyncStatusAlert';
// @ts-ignore;
import { PERMISSION_LIST, PERMISSION_GROUPS, parsePermissions, hasUserRoles, getUserPermissionCount } from './PermissionConstants';
export function PermissionManagement({
  user,
  $w
}) {
  const {
    toast
  } = useToast();
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('roles');

  // 对话框状态
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [userRoleDialogOpen, setUserRoleDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userRoles, setUserRoles] = useState([]);

  // 同步状态
  const [syncStatus, setSyncStatus] = useState(null);
  const [syncMessage, setSyncMessage] = useState('');
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncResults, setSyncResults] = useState({
    total: 0,
    success: 0,
    failed: 0,
    skipped: 0,
    details: []
  });

  // 分页和搜索状态
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [useCloudFunction, setUseCloudFunction] = useState(false);

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
            roleName: 'asc'
          }]
        }
      });
      setRoles(result.records || []);
    } catch (error) {
      console.error('加载角色失败:', error);
      toast({
        title: "加载失败",
        description: "无法加载角色数据",
        variant: "destructive"
      });
    }
  };

  // 加载用户数据（带分页和搜索）
  const loadUsers = async (page = 1, search = '') => {
    try {
      const filter = {
        where: {}
      };
      if (search.trim()) {
        filter.where.$or = [{
          name: {
            $search: search
          }
        }, {
          username: {
            $search: search
          }
        }, {
          employee_number: {
            $search: search
          }
        }];
      }
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'mc_users',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: filter,
          select: {
            $master: true
          },
          getCount: true,
          pageSize: pageSize,
          pageNumber: page,
          orderBy: [{
            name: 'asc'
          }]
        }
      });
      setUsers(result.records || []);
      setTotalUsers(result.total || 0);
      setCurrentPage(page);
    } catch (error) {
      toast({
        title: "加载失败",
        description: "无法加载用户数据",
        variant: "destructive"
      });
    }
  };

  // 处理搜索
  const handleSearch = value => {
    setSearchTerm(value);
    loadUsers(1, value);
  };

  // 处理分页
  const handlePageChange = page => {
    loadUsers(page, searchTerm);
  };

  // 计算总页数
  const totalPages = Math.ceil(totalUsers / pageSize);

  // 生成分页按钮
  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    for (let i = startPage; i <= endPage; i++) {
      pages.push(<PaginationItem key={i}>
          <PaginationLink isActive={i === currentPage} onClick={() => handlePageChange(i)}>
            {i}
          </PaginationLink>
        </PaginationItem>);
    }
    return <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious onClick={() => handlePageChange(Math.max(1, currentPage - 1))} className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''} />
          </PaginationItem>
          
          {startPage > 1 && <>
              <PaginationItem>
                <PaginationLink onClick={() => handlePageChange(1)}>1</PaginationLink>
              </PaginationItem>
              {startPage > 2 && <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>}
            </>}
          
          {pages}
          
          {endPage < totalPages && <>
              {endPage < totalPages - 1 && <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>}
              <PaginationItem>
                <PaginationLink onClick={() => handlePageChange(totalPages)}>
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            </>}
          
          <PaginationItem>
            <PaginationNext onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))} className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>;
  };

  // 获取角色权限
  const getRolePermissions = roleId => {
    const role = roles.find(r => r._id === roleId);
    if (!role || !role.permissions) return [];
    return parsePermissions(role.permissions);
  };

  // 同步单个用户的权限
  const syncUserPermissions = async user => {
    try {
      if (!hasUserRoles(user)) {
        return {
          success: false,
          message: '用户没有分配角色',
          skipped: true
        };
      }
      let allPermissions = [];
      let hasValidPermissions = false;
      for (const roleId of user.roles) {
        const rolePermissions = getRolePermissions(roleId);
        if (rolePermissions.length > 0) {
          allPermissions = [...allPermissions, ...rolePermissions];
          hasValidPermissions = true;
        }
      }
      if (!hasValidPermissions) {
        return {
          success: false,
          message: '用户角色没有配置权限'
        };
      }
      const uniquePermissions = [...new Set(allPermissions)];
      if (uniquePermissions.length === 0) {
        return {
          success: false,
          message: '用户角色没有配置权限'
        };
      }

      // 更新用户权限 - 使用云函数或 wedaUpdateV2
      let updateResult;
      if (useCloudFunction) {
        const result = await $w.cloud.callFunction({
          name: 'update-user',
          data: {
            userId: user._id,
            updateData: {
              permissions: JSON.stringify(uniquePermissions),
              updatedAt: new Date().getTime()
            }
          }
        });
        if (result.result.success) {
          updateResult = {
            count: 1
          };
        } else {
          throw new Error(result.result.errorMessage || '权限更新失败');
        }
      } else {
        updateResult = await $w.cloud.callDataSource({
          dataSourceName: 'mc_users',
          methodName: 'wedaUpdateV2',
          params: {
            data: {
              permissions: JSON.stringify(uniquePermissions),
              updatedAt: new Date().getTime()
            },
            filter: {
              where: {
                _id: {
                  $eq: user._id
                }
              }
            }
          }
        });
      }
      if (updateResult.count > 0) {
        return {
          success: true,
          message: `同步成功，获得 ${uniquePermissions.length} 个权限`,
          permissions: uniquePermissions
        };
      } else {
        return {
          success: false,
          message: '数据库更新失败'
        };
      }
    } catch (error) {
      console.error('同步用户权限失败:', error);
      return {
        success: false,
        message: error.message || '同步过程中发生错误'
      };
    }
  };

  // 批量同步所有用户的权限
  const handleBatchSync = async () => {
    setSyncStatus('syncing');
    setSyncProgress(0);
    setSyncResults({
      total: 0,
      success: 0,
      failed: 0,
      skipped: 0,
      details: []
    });
    try {
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'mc_users',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            $master: true
          },
          getCount: true
        }
      });
      const allUsers = result.records || [];
      const usersWithRoles = allUsers.filter(user => hasUserRoles(user));
      const usersWithoutRoles = allUsers.filter(user => !hasUserRoles(user));
      setSyncResults(prev => ({
        ...prev,
        total: usersWithRoles.length,
        skipped: usersWithoutRoles.length
      }));
      if (usersWithRoles.length === 0) {
        setSyncStatus('info');
        setSyncMessage(`没有找到需要同步的用户。${usersWithoutRoles.length} 个用户没有分配角色，已跳过。`);
        return;
      }
      let successCount = 0;
      let failedCount = 0;
      const details = [];
      for (let i = 0; i < usersWithRoles.length; i++) {
        const user = usersWithRoles[i];
        const result = await syncUserPermissions(user);
        details.push({
          userId: user._id,
          userName: user.name,
          success: result.success,
          message: result.message,
          permissions: result.permissions || [],
          skipped: result.skipped || false
        });
        if (result.success) {
          successCount++;
        } else {
          failedCount++;
        }
        const progress = Math.round((i + 1) / usersWithRoles.length * 100);
        setSyncProgress(progress);
        setSyncResults({
          total: usersWithRoles.length,
          success: successCount,
          failed: failedCount,
          skipped: usersWithoutRoles.length,
          details: details
        });
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      setSyncStatus('success');
      setSyncMessage(`权限同步完成！成功: ${successCount} 个用户，失败: ${failedCount} 个用户，跳过: ${usersWithoutRoles.length} 个未分配角色的用户`);
      await loadUsers(currentPage, searchTerm);
    } catch (error) {
      console.error('批量同步失败:', error);
      setSyncStatus('error');
      setSyncMessage(`批量同步失败: ${error.message || '未知错误'}`);
    }
  };

  // 同步单个用户的权限
  const handleSyncSingleUser = async user => {
    setSyncStatus('syncing');
    setSyncMessage(`正在同步用户 ${user.name} 的权限...`);
    const result = await syncUserPermissions(user);
    if (result.success) {
      setSyncStatus('success');
      setSyncMessage(result.message);
      await loadUsers(currentPage, searchTerm);
    } else if (result.skipped) {
      setSyncStatus('info');
      setSyncMessage('用户没有分配角色，无需同步');
    } else {
      setSyncStatus('error');
      setSyncMessage(result.message);
    }
  };

  // 保存角色
  const handleSaveRole = async (formData, role) => {
    try {
      if (role) {
        // 更新角色 - 使用云函数或 wedaUpdateV2
        if (useCloudFunction) {
          const result = await $w.cloud.callFunction({
            name: 'update-user',
            data: {
              userId: role._id,
              updateData: {
                roleName: formData.roleName,
                roleDesc: formData.roleDesc,
                permissions: formData.permissions
              }
            }
          });
          if (!result.result.success) {
            throw new Error(result.result.errorMessage || '更新失败');
          }
        } else {
          await $w.cloud.callDataSource({
            dataSourceName: 'mc_roles',
            methodName: 'wedaUpdateV2',
            params: {
              data: {
                roleName: formData.roleName,
                roleDesc: formData.roleDesc,
                permissions: formData.permissions
              },
              filter: {
                where: {
                  _id: {
                    $eq: role._id
                  }
                }
              }
            }
          });
        }
        toast({
          title: "更新成功",
          description: "角色信息已更新"
        });
      } else {
        // 创建新角色
        await $w.cloud.callDataSource({
          dataSourceName: 'mc_roles',
          methodName: 'wedaCreateV2',
          params: {
            data: {
              roleName: formData.roleName,
              roleDesc: formData.roleDesc,
              permissions: formData.permissions,
              status: 'active'
            }
          }
        });
        toast({
          title: "创建成功",
          description: "新角色已创建"
        });
      }
      setRoleDialogOpen(false);
      loadRoles();
    } catch (error) {
      toast({
        title: "保存失败",
        description: error.message || "保存过程中发生错误",
        variant: "destructive"
      });
      throw error;
    }
  };

  // 删除角色
  const deleteRole = async role => {
    try {
      await $w.cloud.callDataSource({
        dataSourceName: 'mc_roles',
        methodName: 'wedaDeleteV2',
        params: {
          filter: {
            where: {
              _id: {
                $eq: role._id
              }
            }
          }
        }
      });
      toast({
        title: "删除成功",
        description: "角色已删除"
      });
      loadRoles();
    } catch (error) {
      toast({
        title: "删除失败",
        description: error.message || "删除过程中发生错误",
        variant: "destructive"
      });
    }
  };

  // 保存用户角色分配
  const handleSaveUserRoles = async selectedRoles => {
    try {
      // 更新用户角色 - 使用云函数或 wedaUpdateV2
      if (useCloudFunction) {
        const result = await $w.cloud.callFunction({
          name: 'update-user',
          data: {
            userId: selectedUser._id,
            updateData: {
              roles: selectedRoles
            }
          }
        });
        if (!result.result.success) {
          throw new Error(result.result.errorMessage || '保存失败');
        }
      } else {
        await $w.cloud.callDataSource({
          dataSourceName: 'mc_users',
          methodName: 'wedaUpdateV2',
          params: {
            data: {
              roles: selectedRoles
            },
            filter: {
              where: {
                _id: {
                  $eq: selectedUser._id
                }
              }
            }
          }
        });
      }
      toast({
        title: "保存成功",
        description: "用户角色已更新"
      });
      setUserRoleDialogOpen(false);
      loadUsers(currentPage, searchTerm);
    } catch (error) {
      toast({
        title: "保存失败",
        description: error.message || "保存过程中发生错误",
        variant: "destructive"
      });
      throw error;
    }
  };

  // 打开角色编辑对话框
  const openRoleDialog = (role = null) => {
    setSelectedRole(role);
    setRoleDialogOpen(true);
  };

  // 打开用户角色分配对话框
  const openUserRoleDialog = user => {
    setSelectedUser(user);
    setUserRoles(user.roles || []);
    setUserRoleDialogOpen(true);
  };

  // 初始化加载
  useEffect(() => {
    const initialize = async () => {
      await Promise.all([loadRoles(), loadUsers(), checkCloudFunction()]);
    };
    initialize();
  }, []);
  return <div className="space-y-6">
      {/* 同步状态显示 */}
      <SyncStatusAlert status={syncStatus} message={syncMessage} progress={syncProgress} results={syncResults} />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="roles" className="flex items-center space-x-2">
            <Shield className="w-4 h-4" />
            <span>角色管理</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>用户权限分配</span>
          </TabsTrigger>
        </TabsList>

        {/* 角色管理标签页 */}
        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>角色列表</CardTitle>
              <Button onClick={() => openRoleDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                新建角色
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {roles.map(role => {
                const permissions = parsePermissions(role.permissions);
                return <div key={role._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <Shield className="w-5 h-5 text-blue-600" />
                          <div>
                            <h3 className="font-semibold">{role.roleName}</h3>
                            <p className="text-sm text-gray-600">{role.roleDesc}</p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {permissions.map(perm => <Badge key={perm} variant="secondary" className="text-xs">
                                  {perm}
                                </Badge>)}
                              {permissions.length === 0 && <span className="text-xs text-gray-500">暂无权限</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => openRoleDialog(role)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => deleteRole(role)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>;
              })}
                {roles.length === 0 && <div className="text-center py-8 text-gray-500">
                    <Shield className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>暂无角色数据</p>
                  </div>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 用户权限分配标签页 */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <CardTitle>用户列表</CardTitle>
                <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input placeholder="搜索姓名、用户名或工号..." value={searchTerm} onChange={e => handleSearch(e.target.value)} className="pl-10" />
                  </div>
                  <Button onClick={handleBatchSync} disabled={syncStatus === 'syncing'} className="flex items-center space-x-2">
                    <RefreshCw className={`w-4 h-4 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                    <span>批量同步权限</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-6">
                {users.map(user => <div key={user._id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <User className="w-5 h-5 text-gray-600" />
                        <div>
                          <h3 className="font-semibold">{user.name}</h3>
                          <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                            <span>用户名: {user.username}</span>
                            {user.employee_number && <span>工号: {user.employee_number}</span>}
                            {user.department && <span>部门: {user.department}</span>}
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {user.roles && user.roles.map(roleId => {
                          const role = roles.find(r => r._id === roleId);
                          return role ? <Badge key={roleId} variant="secondary" className="text-xs">
                                  {role.roleName}
                                </Badge> : null;
                        })}
                            {user.isAdmin && <Badge variant="default" className="text-xs bg-red-100 text-red-800">
                                管理员
                              </Badge>}
                            <Badge variant="outline" className="text-xs">
                              权限: {getUserPermissionCount(user)} 个
                            </Badge>
                            {!hasUserRoles(user) && <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800">
                                未分配角色
                              </Badge>}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleSyncSingleUser(user)} disabled={syncStatus === 'syncing' || !hasUserRoles(user)} className="flex items-center">
                        <RefreshCw className={`w-4 h-4 mr-1 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                        同步
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openUserRoleDialog(user)} className="flex items-center">
                        <Edit className="w-4 h-4 mr-1" />
                        分配角色
                      </Button>
                    </div>
                  </div>)}
              </div>
              
              {/* 分页组件 */}
              {totalPages > 1 && <div className="flex justify-center">
                  {renderPagination()}
                </div>}
              
              {/* 分页信息 */}
              <div className="text-center text-sm text-gray-600 mt-4">
                显示第 {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalUsers)} 条，共 {totalUsers} 条记录
              </div>
              
              {users.length === 0 && <div className="text-center py-8 text-gray-500">
                  <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>{searchTerm ? '没有找到匹配的用户' : '暂无用户数据'}</p>
                </div>}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 角色编辑对话框 */}
      <RoleFormDialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen} role={selectedRole} onSave={handleSaveRole} $w={$w} />

      {/* 用户角色分配对话框 */}
      <UserRoleDialog open={userRoleDialogOpen} onOpenChange={setUserRoleDialogOpen} user={selectedUser} roles={roles} userRoles={userRoles} onSave={handleSaveUserRoles} $w={$w} />
    </div>;
}