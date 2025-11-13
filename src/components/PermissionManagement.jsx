// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, useToast, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Badge, Tabs, TabsContent, TabsList, TabsTrigger, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Textarea, Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis, Alert, AlertDescription } from '@/components/ui';
// @ts-ignore;
import { Plus, Edit, Trash2, Shield, User, Users, CheckCircle, XCircle, Search, RefreshCw, AlertCircle, FileText, Filter } from 'lucide-react';

// 预定义的权限列表
const PERMISSION_LIST = {
  // 用户管理权限
  USER_VIEW: 'user.view',
  USER_CREATE: 'user.create',
  USER_EDIT: 'user.edit',
  USER_DELETE: 'user.delete',
  // 角色管理权限
  ROLE_VIEW: 'role.view',
  ROLE_CREATE: 'role.create',
  ROLE_EDIT: 'role.edit',
  ROLE_DELETE: 'role.delete',
  // 部门管理权限
  DEPARTMENT_VIEW: 'department.view',
  DEPARTMENT_CREATE: 'department.create',
  DEPARTMENT_EDIT: 'department.edit',
  DEPARTMENT_DELETE: 'department.delete',
  // 会议室管理权限
  MEETING_ROOM_VIEW: 'meeting.room.view',
  MEETING_ROOM_CREATE: 'meeting.room.create',
  MEETING_ROOM_EDIT: 'meeting.room.edit',
  MEETING_ROOM_DELETE: 'meeting.room.delete',
  // 会议室预定权限
  MEETING_BOOKING_VIEW: 'meeting.booking.view',
  MEETING_BOOKING_CREATE: 'meeting.booking.create',
  MEETING_BOOKING_EDIT: 'meeting.booking.edit',
  MEETING_BOOKING_DELETE: 'meeting.booking.delete',
  MEETING_BOOKING_APPROVE: 'meeting.booking.approve',
  // 申请管理权限
  APPLICATION_MANAGEMENT_VIEW: 'application.management.view',
  APPLICATION_MANAGEMENT_APPROVE: 'application.management.approve',
  APPLICATION_MANAGEMENT_REJECT: 'application.management.reject',
  APPLICATION_MANAGEMENT_CANCEL: 'application.management.cancel',
  // 文件管理权限
  FILE_VIEW: 'file.view',
  FILE_UPLOAD: 'file.upload',
  FILE_EDIT: 'file.edit',
  FILE_DELETE: 'file.delete',
  // 规章制度权限
  REGULATION_VIEW: 'regulation.view',
  REGULATION_CREATE: 'regulation.create',
  REGULATION_EDIT: 'regulation.edit',
  REGULATION_DELETE: 'regulation.delete',
  // 质量体系权限
  QUALITY_VIEW: 'quality.view',
  QUALITY_CREATE: 'quality.create',
  QUALITY_EDIT: 'quality.edit',
  QUALITY_DELETE: 'quality.delete',
  // 安全环境权限
  SAFETY_VIEW: 'safety.view',
  SAFETY_CREATE: 'safety.create',
  SAFETY_EDIT: 'safety.edit',
  SAFETY_DELETE: 'safety.delete'
};

// 权限分组
const PERMISSION_GROUPS = {
  user: {
    name: '用户管理',
    permissions: ['USER_VIEW', 'USER_CREATE', 'USER_EDIT', 'USER_DELETE']
  },
  role: {
    name: '角色管理',
    permissions: ['ROLE_VIEW', 'ROLE_CREATE', 'ROLE_EDIT', 'ROLE_DELETE']
  },
  department: {
    name: '部门管理',
    permissions: ['DEPARTMENT_VIEW', 'DEPARTMENT_CREATE', 'DEPARTMENT_EDIT', 'DEPARTMENT_DELETE']
  },
  meeting: {
    name: '会议室管理',
    permissions: ['MEETING_ROOM_VIEW', 'MEETING_ROOM_CREATE', 'MEETING_ROOM_EDIT', 'MEETING_ROOM_DELETE', 'MEETING_BOOKING_VIEW', 'MEETING_BOOKING_CREATE', 'MEETING_BOOKING_EDIT', 'MEETING_BOOKING_DELETE', 'MEETING_BOOKING_APPROVE']
  },
  application: {
    name: '申请管理',
    permissions: ['APPLICATION_MANAGEMENT_VIEW', 'APPLICATION_MANAGEMENT_APPROVE', 'APPLICATION_MANAGEMENT_REJECT', 'APPLICATION_MANAGEMENT_CANCEL']
  },
  file: {
    name: '文件管理',
    permissions: ['FILE_VIEW', 'FILE_UPLOAD', 'FILE_EDIT', 'FILE_DELETE']
  },
  regulation: {
    name: '规章制度',
    permissions: ['REGULATION_VIEW', 'REGULATION_CREATE', 'REGULATION_EDIT', 'REGULATION_DELETE']
  },
  quality: {
    name: '质量体系',
    permissions: ['QUALITY_VIEW', 'QUALITY_CREATE', 'QUALITY_EDIT', 'QUALITY_DELETE']
  },
  safety: {
    name: '安全环境',
    permissions: ['SAFETY_VIEW', 'SAFETY_CREATE', 'SAFETY_EDIT', 'SAFETY_DELETE']
  }
};
export function PermissionManagement({
  user
}) {
  const {
    toast
  } = useToast();
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('roles');
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [roleForm, setRoleForm] = useState({
    roleName: '',
    roleDesc: '',
    permissions: []
  });
  const [userRoleDialogOpen, setUserRoleDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userRoles, setUserRoles] = useState([]);
  const [syncStatus, setSyncStatus] = useState(null); // null, 'syncing', 'success', 'error'
  const [syncMessage, setSyncMessage] = useState('');
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncResults, setSyncResults] = useState({
    total: 0,
    success: 0,
    failed: 0,
    skipped: 0,
    // 新增：跳过的用户数量
    details: []
  });
  const [debugInfo, setDebugInfo] = useState({
    rolesData: [],
    usersData: [],
    syncErrors: []
  });

  // 分页和搜索状态
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);

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
      console.log('加载角色数据结果:', result);
      setRoles(result.records || []);
      setDebugInfo(prev => ({
        ...prev,
        rolesData: result.records?.map(r => ({
          id: r._id,
          name: r.roleName,
          permissions: r.permissions,
          level: r.level
        })) || []
      }));
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

      // 添加搜索条件
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
      console.log('加载用户数据结果:', result);
      setUsers(result.records || []);
      setFilteredUsers(result.records || []);
      setTotalUsers(result.total || 0);
      setCurrentPage(page);
      setDebugInfo(prev => ({
        ...prev,
        usersData: result.records?.map(u => ({
          id: u._id,
          name: u.name,
          roles: u.roles,
          permissions: u.permissions
        })) || []
      }));
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

  // 解析权限字符串 - 修复权限解析问题
  const parsePermissions = permissionsStr => {
    if (!permissionsStr) return [];
    try {
      // 尝试解析为JSON数组
      const parsed = JSON.parse(permissionsStr);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (error) {
      // 如果不是JSON格式，尝试按逗号分割
      if (typeof permissionsStr === 'string') {
        return permissionsStr.split(',').filter(p => p.trim()).map(p => p.trim());
      }
    }
    return [];
  };

  // 根据角色ID获取角色权限 - 修复权限获取逻辑
  const getRolePermissions = roleId => {
    const role = roles.find(r => r._id === roleId);
    if (!role || !role.permissions) {
      console.log('角色权限为空:', {
        roleId,
        roleName: role?.roleName,
        rolePermissions: role?.permissions
      });
      return [];
    }
    const permissions = parsePermissions(role.permissions);
    console.log('获取角色权限:', {
      roleId,
      roleName: role.roleName,
      permissionsCount: permissions.length,
      permissions
    });
    return permissions;
  };

  // 检查用户是否拥有角色
  const hasUserRoles = user => {
    return user.roles && user.roles.length > 0;
  };

  // 同步单个用户的权限 - 修复同步逻辑
  const syncUserPermissions = async user => {
    try {
      console.log('开始同步用户权限:', {
        userId: user._id,
        userName: user.name,
        userRoles: user.roles,
        currentPermissions: user.permissions
      });

      // 检查用户是否有角色
      if (!hasUserRoles(user)) {
        console.log('用户没有分配角色:', user.name);
        return {
          success: false,
          message: '用户没有分配角色',
          skipped: true // 标记为跳过
        };
      }

      // 获取用户所有角色的权限并合并
      let allPermissions = [];
      let hasValidPermissions = false;
      for (const roleId of user.roles) {
        const rolePermissions = getRolePermissions(roleId);
        if (rolePermissions.length > 0) {
          allPermissions = [...allPermissions, ...rolePermissions];
          hasValidPermissions = true;
          console.log(`角色 ${roleId} 有 ${rolePermissions.length} 个权限`);
        } else {
          console.log(`角色 ${roleId} 没有配置权限`);
        }
      }

      // 检查是否有有效的权限
      if (!hasValidPermissions) {
        console.log('用户所有角色都没有配置权限:', user.name);
        return {
          success: false,
          message: '用户角色没有配置权限'
        };
      }

      // 去重
      const uniquePermissions = [...new Set(allPermissions)];
      console.log('合并后的权限:', {
        totalPermissions: allPermissions.length,
        uniquePermissions: uniquePermissions.length,
        permissions: uniquePermissions
      });
      if (uniquePermissions.length === 0) {
        return {
          success: false,
          message: '用户角色没有配置权限'
        };
      }

      // 更新用户权限字段
      const updateResult = await $w.cloud.callDataSource({
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
      console.log('权限更新结果:', updateResult);
      if (updateResult.count > 0) {
        return {
          success: true,
          message: `同步成功，获得 ${uniquePermissions.length} 个权限`,
          permissions: uniquePermissions
        };
      } else {
        console.log('数据库更新失败，count为0');
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

  // 批量同步所有用户的权限 - 优化：仅同步已拥有角色的用户
  const handleBatchSync = async () => {
    setSyncStatus('syncing');
    setSyncProgress(0);
    setSyncResults({
      total: 0,
      success: 0,
      failed: 0,
      skipped: 0,
      // 新增：跳过的用户数量
      details: []
    });
    setDebugInfo(prev => ({
      ...prev,
      syncErrors: []
    }));
    try {
      // 获取所有用户（不分页）
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
      const totalUsers = allUsers.length;

      // 筛选出已拥有角色的用户
      const usersWithRoles = allUsers.filter(user => hasUserRoles(user));
      const usersWithoutRoles = allUsers.filter(user => !hasUserRoles(user));
      console.log('开始批量同步，总用户数:', totalUsers);
      console.log('已拥有角色的用户数:', usersWithRoles.length);
      console.log('未拥有角色的用户数:', usersWithoutRoles.length);
      setSyncResults(prev => ({
        ...prev,
        total: usersWithRoles.length,
        // 只统计需要同步的用户
        skipped: usersWithoutRoles.length // 记录跳过的用户数
      }));
      if (usersWithRoles.length === 0) {
        setSyncStatus('info');
        setSyncMessage(`没有找到需要同步的用户。${usersWithoutRoles.length} 个用户没有分配角色，已跳过。`);
        return;
      }
      let successCount = 0;
      let failedCount = 0;
      const details = [];
      const syncErrors = [];

      // 逐个同步已拥有角色的用户权限
      for (let i = 0; i < usersWithRoles.length; i++) {
        const user = usersWithRoles[i];
        console.log(`同步用户 ${i + 1}/${usersWithRoles.length}:`, user.name);
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
          console.log(`用户 ${user.name} 同步成功`);
        } else {
          failedCount++;
          syncErrors.push({
            userName: user.name,
            error: result.message
          });
          console.log(`用户 ${user.name} 同步失败:`, result.message);
        }

        // 更新进度
        const progress = Math.round((i + 1) / usersWithRoles.length * 100);
        setSyncProgress(progress);
        setSyncResults({
          total: usersWithRoles.length,
          success: successCount,
          failed: failedCount,
          skipped: usersWithoutRoles.length,
          details: details
        });
        setDebugInfo(prev => ({
          ...prev,
          syncErrors: syncErrors
        }));

        // 短暂延迟，避免请求过快
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      console.log('批量同步完成:', {
        success: successCount,
        failed: failedCount,
        skipped: usersWithoutRoles.length,
        errors: syncErrors
      });
      setSyncStatus('success');
      setSyncMessage(`权限同步完成！成功: ${successCount} 个用户，失败: ${failedCount} 个用户，跳过: ${usersWithoutRoles.length} 个未分配角色的用户`);

      // 重新加载当前页面的用户数据
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

      // 重新加载当前页面的用户数据
      await loadUsers(currentPage, searchTerm);
    } else if (result.skipped) {
      setSyncStatus('info');
      setSyncMessage('用户没有分配角色，无需同步');
    } else {
      setSyncStatus('error');
      setSyncMessage(result.message);
    }
  };

  // 初始化加载
  useEffect(() => {
    loadRoles();
    loadUsers();
  }, []);

  // 打开角色编辑对话框
  const openRoleDialog = (role = null) => {
    if (role) {
      setRoleForm({
        roleName: role.roleName || '',
        roleDesc: role.roleDesc || '',
        permissions: parsePermissions(role.permissions) // 使用修复后的解析方法
      });
      setSelectedRole(role);
    } else {
      setRoleForm({
        roleName: '',
        roleDesc: '',
        permissions: []
      });
      setSelectedRole(null);
    }
    setRoleDialogOpen(true);
  };

  // 保存角色
  const saveRole = async () => {
    if (!roleForm.roleName.trim()) {
      toast({
        title: "请输入角色名称",
        variant: "destructive"
      });
      return;
    }
    try {
      const permissionsStr = JSON.stringify(roleForm.permissions); // 使用JSON格式存储
      if (selectedRole) {
        // 更新角色
        await $w.cloud.callDataSource({
          dataSourceName: 'mc_roles',
          methodName: 'wedaUpdateV2',
          params: {
            data: {
              roleName: roleForm.roleName,
              roleDesc: roleForm.roleDesc,
              permissions: permissionsStr
            },
            filter: {
              where: {
                _id: {
                  $eq: selectedRole._id
                }
              }
            }
          }
        });
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
              roleName: roleForm.roleName,
              roleDesc: roleForm.roleDesc,
              permissions: permissionsStr,
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

  // 打开用户角色分配对话框
  const openUserRoleDialog = user => {
    setSelectedUser(user);
    setUserRoles(user.roles || []);
    setUserRoleDialogOpen(true);
  };

  // 保存用户角色分配
  const saveUserRoles = async () => {
    try {
      await $w.cloud.callDataSource({
        dataSourceName: 'mc_users',
        methodName: 'wedaUpdateV2',
        params: {
          data: {
            roles: userRoles
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
    }
  };

  // 切换权限选择
  const togglePermission = permissionKey => {
    setRoleForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionKey) ? prev.permissions.filter(p => p !== permissionKey) : [...prev.permissions, permissionKey]
    }));
  };

  // 切换用户角色
  const toggleUserRole = roleId => {
    setUserRoles(prev => prev.includes(roleId) ? prev.filter(id => id !== roleId) : [...prev, roleId]);
  };

  // 检查权限是否被选中
  const isPermissionSelected = permissionKey => {
    return roleForm.permissions.includes(permissionKey);
  };

  // 检查用户是否拥有角色
  const isUserHasRole = roleId => {
    return userRoles.includes(roleId);
  };

  // 获取用户当前权限数量
  const getUserPermissionCount = user => {
    if (!user.permissions) return 0;
    const permissions = parsePermissions(user.permissions);
    return permissions.length;
  };

  // 调试信息面板
  const DebugInfoPanel = () => {
    if (!debugInfo.syncErrors.length) return null;
    return <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          同步错误详情
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          {debugInfo.syncErrors.map((error, index) => <div key={index} className="p-2 bg-red-50 border border-red-200 rounded">
              <div className="font-medium text-red-800">{error.userName}</div>
              <div className="text-red-600">{error.error}</div>
            </div>)}
        </div>
      </CardContent>
    </Card>;
  };
  return <div className="space-y-6">
      {/* 同步状态显示 */}
      {syncStatus && <Alert variant={syncStatus === 'success' ? 'default' : syncStatus === 'syncing' ? 'default' : syncStatus === 'info' ? 'default' : 'destructive'}>
          {syncStatus === 'success' ? <CheckCircle className="w-4 h-4" /> : syncStatus === 'syncing' ? <RefreshCw className="w-4 h-4 animate-spin" /> : syncStatus === 'info' ? <Filter className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <AlertDescription>
            {syncMessage}
            {syncStatus === 'syncing' && <div className="mt-2">
                <div className="flex justify-between text-sm mb-1">
                  <span>进度: {syncProgress}%</span>
                  <span>{syncResults.success + syncResults.failed}/{syncResults.total}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{
              width: `${syncProgress}%`
            }}></div>
                </div>
              </div>}
            {syncStatus === 'success' && syncResults.details.length > 0 && <div className="mt-2 text-sm">
                <div>成功: {syncResults.success} 失败: {syncResults.failed} 跳过: {syncResults.skipped}</div>
                {syncResults.failed > 0 && <div className="text-orange-600 mt-1">
                    查看下方错误详情了解失败原因
                  </div>}
              </div>}
          </AlertDescription>
        </Alert>}

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
                {filteredUsers.map(user => <div key={user._id} className="flex items-center justify-between p-4 border rounded-lg">
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
                      <Button variant="outline" size="sm" onClick={() => openUserRoleDialog(user)}>
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
              
              {filteredUsers.length === 0 && <div className="text-center py-8 text-gray-500">
                  <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>{searchTerm ? '没有找到匹配的用户' : '暂无用户数据'}</p>
                </div>}
            </CardContent>
          </Card>
          
          {/* 调试信息面板 */}
          {debugInfo.syncErrors.length > 0 && <DebugInfoPanel />}
        </TabsContent>
      </Tabs>

      {/* 角色编辑对话框 */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedRole ? '编辑角色' : '新建角色'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label>角色名称</Label>
                <Input value={roleForm.roleName} onChange={e => setRoleForm({
                ...roleForm,
                roleName: e.target.value
              })} placeholder="请输入角色名称" />
              </div>
              <div>
                <Label>角色描述</Label>
                <Textarea value={roleForm.roleDesc} onChange={e => setRoleForm({
                ...roleForm,
                roleDesc: e.target.value
              })} placeholder="请输入角色描述" />
              </div>
            </div>
            
            <div>
              <Label className="mb-4 block">权限分配</Label>
              <div className="space-y-4">
                {Object.entries(PERMISSION_GROUPS).map(([groupKey, group]) => <Card key={groupKey}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">{group.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {group.permissions.map(permKey => <label key={permKey} className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50">
                            <input type="checkbox" checked={isPermissionSelected(PERMISSION_LIST[permKey])} onChange={() => togglePermission(PERMISSION_LIST[permKey])} className="rounded border-gray-300" />
                            <span className="text-sm">{permKey.replace(/_/g, ' ').toLowerCase()}</span>
                          </label>)}
                      </div>
                    </CardContent>
                  </Card>)}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={saveRole}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 用户角色分配对话框 */}
      <Dialog open={userRoleDialogOpen} onOpenChange={setUserRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>分配角色 - {selectedUser?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>选择角色</Label>
              <div className="space-y-2 mt-2">
                {roles.map(role => <label key={role._id} className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50">
                    <input type="checkbox" checked={isUserHasRole(role._id)} onChange={() => toggleUserRole(role._id)} className="rounded border-gray-300" />
                    <span>{role.roleName}</span>
                  </label>)}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUserRoleDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={saveUserRoles}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>;
}