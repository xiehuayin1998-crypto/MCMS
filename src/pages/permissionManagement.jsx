// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, useToast, Button } from '@/components/ui';
// @ts-ignore;
import { Home } from 'lucide-react';

// @ts-ignore;
import { UserHeader } from '@/components/UserHeader';
// @ts-ignore;
import { PermissionManagement } from '@/components/PermissionManagement';
// @ts-ignore;
import { PermissionGuard } from '@/components/PermissionGuard';
export default function PermissionManagementPage(props) {
  const {
    $w,
    style
  } = props;
  const {
    toast
  } = useToast();
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 加载当前用户信息
  const loadCurrentUser = async () => {
    try {
      setIsLoading(true);
      // 从本地存储获取用户信息
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setCurrentUser(parsedUser);
        return;
      }

      // 从数据库加载用户信息 - 修复查询字段：使用 name 而不是 username
      if (props.$w.auth.currentUser && props.$w.auth.currentUser.name) {
        const result = await $w.cloud.callDataSource({
          dataSourceName: 'mc_users',
          methodName: 'wedaGetRecordsV2',
          params: {
            filter: {
              where: {
                name: {
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
        } else {
          // 如果查询不到用户，显示错误信息
          toast({
            title: "用户信息错误",
            description: "未找到当前用户的详细信息，请联系管理员",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('加载用户信息失败:', error);
      toast({
        title: "加载失败",
        description: "无法加载用户信息：" + (error.message || "未知错误"),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 清除本地存储并重新加载用户信息
  const reloadUser = async () => {
    localStorage.removeItem('currentUser');
    await loadCurrentUser();
  };
  useEffect(() => {
    loadCurrentUser();
  }, []);
  if (isLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center" style={style}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">正在加载用户信息...</p>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gray-50" style={style}>
      <UserHeader $w={$w} showHomeButton={true} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题和返回按钮区域 */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">权限管理系统</h1>
              <p className="text-gray-600 mt-2">管理用户角色和权限分配</p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={reloadUser} className="flex items-center space-x-2">
                <Home className="w-4 h-4" />
                <span>刷新数据</span>
              </Button>
              <Button variant="outline" onClick={() => $w.utils.navigateTo({
              pageId: 'home',
              params: {}
            })} className="flex items-center space-x-2">
                <Home className="w-4 h-4" />
                <span>返回首页</span>
              </Button>
            </div>
          </div>
        </div>

        {/* 权限守卫 - 只有管理员才能访问此页面 */}
        <PermissionGuard isAdmin={true} user={currentUser} fallback={<Card>
              <CardContent className="p-8 text-center">
                <div className="text-red-600 text-lg font-semibold">
                  无权限访问
                </div>
                <p className="text-gray-600 mt-2">
                  您没有权限访问权限管理功能，请联系管理员。
                </p>
                <Button onClick={() => $w.utils.navigateTo({
            pageId: 'home',
            params: {}
          })} className="mt-4">
                  返回首页
                </Button>
              </CardContent>
            </Card>}>
          <PermissionManagement user={currentUser} $w={$w} />
        </PermissionGuard>
      </div>
    </div>;
}