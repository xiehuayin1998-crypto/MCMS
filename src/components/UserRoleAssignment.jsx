// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Button, useToast, Badge, Alert, AlertDescription } from '@/components/ui';
// @ts-ignore;
import { Users, Shield, RefreshCw, CheckCircle, AlertCircle, Database } from 'lucide-react';

export function UserRoleAssignment({
  userId,
  onRoleAssigned,
  $w
}) {
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [userRoles, setUserRoles] = useState([]);
  const [userRolesLevel, setUserRolesLevel] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null); // null, 'success', 'error'
  const [syncMessage, setSyncMessage] = useState('');
  const [debugInfo, setDebugInfo] = useState({});
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

  // 加载角色列表
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
      console.log('加载角色列表结果:', result);
      setRoles(result.records || []);
      setDebugInfo(prev => ({
        ...prev,
        rolesCount: result.records?.length || 0,
        rolesData: result.records?.map(r => ({
          id: r._id,
          name: r.roleName,
          permissions: r.permissions
        }))
      }));
    } catch (error) {
      console.error('加载角色失败:', error);
      toast({
        title: "加载角色失败",
        description: error.message || "无法加载角色列表",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // 加载用户角色
  const loadUserRoles = async () => {
    if (!userId) return;
    try {
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'mc_users',
        methodName: 'wedaGetItemV2',
        params: {
          filter: {
            where: {
              _id: {
                $eq: userId
              }
            }
          },
          select: {
            $master: true
          }
        }
      });
      console.log('加载用户角色结果:', result);
      setUserRoles(Array.isArray(result.roles) ? result.roles.filter(id => typeof id === 'string') : []);
      setUserRolesLevel(Array.isArray(result.roles_level) ? result.roles_level.filter(l => typeof l === 'number') : []);
      setDebugInfo(prev => ({
        ...prev,
        userRoles: result.roles,
        userPermissions: result.permissions,
        userId: userId
      }));
    } catch (error) {
      console.error('加载用户角色失败:', error);
    }
  };

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

  // 获取角色权限
  const getRolePermissions = roleId => {
    const role = roles.find(r => r._id === roleId);
    if (!role || !role.permissions) {
      console.log('角色权限为空:', {
        roleId,
        role
      });
      return [];
    }
    try {
      const parsed = JSON.parse(role.permissions);
      console.log('解析角色权限:', {
        roleId,
        permissions: parsed
      });
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('解析角色权限失败:', {
        roleId,
        permissions: role.permissions,
        error
      });
      return [];
    }
  };

  // 同步用户权限
  const syncUserPermissions = async (userId, roleId) => {
    setSyncing(true);
    setSyncStatus(null);
    setSyncMessage('');
    try {
      // 获取角色权限
      const rolePermissions = getRolePermissions(roleId);
      console.log('同步权限信息:', {
        userId,
        roleId,
        rolePermissions
      });
      if (rolePermissions.length === 0) {
        setSyncStatus('error');
        setSyncMessage('该角色没有配置权限，无法同步');
        setDebugInfo(prev => ({
          ...prev,
          syncError: '角色权限为空',
          rolePermissions: []
        }));
        return false;
      }

      // 更新用户权限 - 使用云函数或 wedaUpdateV2
      let updateResult;
      if (useCloudFunction) {
        // 使用 update-user 云函数
        const result = await $w.cloud.callFunction({
          name: 'update-user',
          data: {
            userId: userId,
            updateData: {
              permissions: JSON.stringify(rolePermissions),
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
        // 使用 wedaUpdateV2 作为备选方案
        updateResult = await $w.cloud.callDataSource({
          dataSourceName: 'mc_users',
          methodName: 'wedaUpdateV2',
          params: {
            data: {
              permissions: JSON.stringify(rolePermissions),
              updatedAt: new Date().getTime()
            },
            filter: {
              where: {
                _id: {
                  $eq: userId
                }
              }
            }
          }
        });
      }
      console.log('权限更新结果:', updateResult);
      if (updateResult.count > 0) {
        setSyncStatus('success');
        setSyncMessage(`权限同步成功！已为用户同步 ${rolePermissions.length} 个权限`);
        setDebugInfo(prev => ({
          ...prev,
          syncSuccess: true,
          permissionsSynced: rolePermissions,
          updateResult: updateResult
        }));
        return true;
      } else {
        setSyncStatus('error');
        setSyncMessage('权限更新失败：数据库更新未生效');
        setDebugInfo(prev => ({
          ...prev,
          syncError: '数据库更新失败',
          updateResult: updateResult
        }));
        return false;
      }
    } catch (error) {
      console.error('权限同步失败:', error);
      setSyncStatus('error');
      setSyncMessage(`权限同步失败: ${error.message || '未知错误'}`);
      setDebugInfo(prev => ({
        ...prev,
        syncError: error.message,
        errorStack: error.stack
      }));
      return false;
    } finally {
      setSyncing(false);
    }
  };

  // 分配角色
  const handleAssignRole = async () => {
    if (!selectedRole || !userId) {
      toast({
        title: "请选择角色",
        variant: "destructive"
      });
      return;
    }
    try {
      const roleLevel = getRoleLevel(selectedRole);
      console.log('开始分配角色:', {
        userId,
        selectedRole,
        roleLevel
      });

      // 先分配角色 - 使用云函数或 wedaUpdateV2
      let roleResult;
      if (useCloudFunction) {
        // 使用 update-user 云函数
        const result = await $w.cloud.callFunction({
          name: 'update-user',
          data: {
            userId: userId,
            updateData: {
              roles: [selectedRole],
              roles_level: [roleLevel],
              updatedAt: new Date().getTime()
            }
          }
        });
        if (result.result.success) {
          roleResult = {
            count: 1
          };
        } else {
          throw new Error(result.result.errorMessage || '角色分配失败');
        }
      } else {
        // 使用 wedaUpdateV2 作为备选方案
        roleResult = await $w.cloud.callDataSource({
          dataSourceName: 'mc_users',
          methodName: 'wedaUpdateV2',
          params: {
            data: {
              roles: [selectedRole],
              roles_level: [roleLevel],
              updatedAt: new Date().getTime()
            },
            filter: {
              where: {
                _id: {
                  $eq: userId
                }
              }
            }
          }
        });
      }
      console.log('角色分配结果:', roleResult);
      if (roleResult.count === 0) {
        toast({
          title: "角色分配失败",
          description: "数据库更新未生效",
          variant: "destructive"
        });
        return;
      }

      // 然后同步权限
      const syncSuccess = await syncUserPermissions(userId, selectedRole);
      if (syncSuccess) {
        toast({
          title: "角色分配成功",
          description: `已为用户分配 ${getRoleName(selectedRole)} 角色并同步权限`
        });
      } else {
        toast({
          title: "角色分配成功",
          description: `已为用户分配 ${getRoleName(selectedRole)} 角色，但权限同步失败`,
          variant: "destructive"
        });
      }
      setSelectedRole('');
      await loadUserRoles(); // 重新加载用户数据
      if (onRoleAssigned) onRoleAssigned();
    } catch (error) {
      console.error('角色分配失败:', error);
      toast({
        title: "角色分配失败",
        description: error.message || "无法分配角色",
        variant: "destructive"
      });
    }
  };

  // 手动同步权限
  const handleManualSync = async () => {
    if (!userId || userRoles.length === 0) {
      toast({
        title: "无法同步",
        description: "用户没有分配角色，无法同步权限",
        variant: "destructive"
      });
      return;
    }
    const currentRoleId = userRoles[0]; // 获取当前角色
    await syncUserPermissions(userId, currentRoleId);
    await loadUserRoles(); // 重新加载用户数据
  };

  // 获取当前角色的权限信息
  const getCurrentRolePermissions = () => {
    if (userRoles.length === 0) return [];
    const currentRoleId = userRoles[0];
    return getRolePermissions(currentRoleId);
  };

  // 移除角色
  const handleRemoveRole = async roleId => {
    try {
      let result;
      if (useCloudFunction) {
        // 使用 update-user 云函数
        const cloudResult = await $w.cloud.callFunction({
          name: 'update-user',
          data: {
            userId: userId,
            updateData: {
              roles: [],
              roles_level: [],
              permissions: JSON.stringify([]),
              updatedAt: new Date().getTime()
            }
          }
        });
        if (cloudResult.result.success) {
          result = {
            count: 1
          };
        } else {
          throw new Error(cloudResult.result.errorMessage || '角色移除失败');
        }
      } else {
        // 使用 wedaUpdateV2 作为备选方案
        result = await $w.cloud.callDataSource({
          dataSourceName: 'mc_users',
          methodName: 'wedaUpdateV2',
          params: {
            data: {
              roles: [],
              roles_level: [],
              permissions: JSON.stringify([]),
              updatedAt: new Date().getTime()
            },
            filter: {
              where: {
                _id: {
                  $eq: userId
                }
              }
            }
          }
        });
      }
      console.log('角色移除结果:', result);
      if (result.count > 0) {
        setSyncStatus('success');
        setSyncMessage('角色已移除，权限已清空');
        toast({
          title: "角色移除成功",
          description: `已移除 ${getRoleName(roleId)} 角色并清空权限`
        });
        await loadUserRoles(); // 重新加载用户数据
        if (onRoleAssigned) onRoleAssigned();
      } else {
        toast({
          title: "角色移除失败",
          description: "数据库更新未生效",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('角色移除失败:', error);
      toast({
        title: "角色移除失败",
        description: error.message || "无法移除角色",
        variant: "destructive"
      });
    }
  };

  // 调试信息显示
  const DebugInfoPanel = () => {
    if (!debugInfo.userId) return null;
    return <div className="mt-4 p-3 bg-gray-100 border border-gray-300 rounded-lg text-xs">
        <div className="flex items-center space-x-2 mb-2">
          <Database className="w-4 h-4" />
          <span className="font-medium">调试信息</span>
        </div>
        <div className="space-y-1">
          <div>用户ID: {debugInfo.userId}</div>
          <div>角色数量: {debugInfo.rolesCount}</div>
          <div>用户角色: {JSON.stringify(debugInfo.userRoles)}</div>
          <div>用户权限: {debugInfo.userPermissions}</div>
          {debugInfo.syncError && <div className="text-red-600">同步错误: {debugInfo.syncError}</div>}
          <div>使用云函数: {useCloudFunction ? '是' : '否'}</div>
        </div>
      </div>;
  };
  useEffect(() => {
    const initialize = async () => {
      await Promise.all([loadRoles(), loadUserRoles(), checkCloudFunction()]);
    };
    initialize();
  }, [userId]);
  const currentPermissions = getCurrentRolePermissions();
  return <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            角色分配
          </div>
          {userRoles.length > 0 && <Button variant="outline" size="sm" onClick={handleManualSync} disabled={syncing} className="flex items-center space-x-1">
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              <span>同步权限</span>
            </Button>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 权限同步状态提示 */}
          {syncStatus && <Alert variant={syncStatus === 'success' ? 'default' : 'destructive'}>
              {syncStatus === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <AlertDescription>{syncMessage}</AlertDescription>
            </Alert>}

          {/* 当前权限信息 */}
          {userRoles.length > 0 && currentPermissions.length > 0 && <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">当前权限 ({currentPermissions.length} 个)</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {currentPermissions.slice(0, 3).map((perm, index) => <Badge key={index} variant="secondary" className="text-xs">
                    {perm}
                  </Badge>)}
                {currentPermissions.length > 3 && <Badge variant="outline" className="text-xs">
                    +{currentPermissions.length - 3} 更多
                  </Badge>}
              </div>
            </div>}

          <div>
            <label className="text-sm font-medium">选择角色</label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="请选择角色" />
              </SelectTrigger>
              <SelectContent>
                {roles.map(role => <SelectItem key={role._id} value={role._id}>
                    {role.roleName} (等级: {role.level || 0})
                    {role.permissions && <span className="text-xs text-gray-500 ml-2">
                        {JSON.parse(role.permissions).length} 权限
                      </span>}
                  </SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleAssignRole} disabled={!selectedRole || !userId || syncing} className="w-full">
            {syncing ? '分配中...' : '分配角色'}
          </Button>

          {userRoles.length > 0 && <div className="space-y-2">
              <h4 className="font-medium">当前角色</h4>
              {userRoles.map((roleId, index) => <div key={roleId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                  <div className="flex-1">
                    <div className="font-medium">{getRoleName(roleId)}</div>
                    <div className="text-sm text-gray-600">等级: {userRolesLevel[index] || 0}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      权限: {getRolePermissions(roleId).length} 个
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleRemoveRole(roleId)} disabled={syncing}>
                    移除
                  </Button>
                </div>)}
            </div>}

          {/* 无角色提示 */}
          {userRoles.length === 0 && <div className="text-center p-4 border border-dashed border-gray-300 rounded-lg">
              <Shield className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">用户尚未分配角色</p>
            </div>}

          {/* 调试信息面板 */}
          <DebugInfoPanel />
        </div>
      </CardContent>
    </Card>;
}