// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, useToast, Button } from '@/components/ui';
// @ts-ignore;
import { Home, RefreshCw, User, AlertCircle } from 'lucide-react';

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
  const [errorInfo, setErrorInfo] = useState('');

  // 加载当前用户信息
  const loadCurrentUser = async () => {
    try {
      setIsLoading(true);
      setErrorInfo('');

      // 优先从本地存储获取用户信息
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log('从本地存储加载用户:', parsedUser);
          setCurrentUser(parsedUser);
          return;
        } catch (parseError) {
          console.error('解析本地存储用户信息失败:', parseError);
          localStorage.removeItem('currentUser');
        }
      }

      // 如果本地存储没有用户信息，从数据库加载
      // 关键修复：使用当前登录用户的用户名进行精确查询
      if (props.$w.auth.currentUser && props.$w.auth.currentUser.name) {
        console.log('当前登录用户信息:', props.$w.auth.currentUser);

        // 方法1：直接使用当前登录用户的用户名查询
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
        console.log('用户查询结果:', result);
        if (result.records && result.records.length > 0) {
          const user = result.records[0];
          console.log('查询到用户信息:', user);

          // 验证用户身份
          if (user.username === props.$w.auth.currentUser.name) {
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
            return;
          } else {
            setErrorInfo(`用户身份验证失败：期望用户名 "${props.$w.auth.currentUser.name}"，实际用户名 "${user.username}"`);
          }
        }

        // 如果查询不到用户，显示详细的错误信息
        const errorMessage = `未找到用户名为 "${props.$w.auth.currentUser.name}" 的用户记录。请检查：\n1. 用户名是否正确\n2. 用户是否存在于数据库中\n3. 数据库连接是否正常`;
        console.error('未找到匹配的用户记录:', {
          currentUserName: props.$w.auth.currentUser.name,
          queryResult: result.records
        });
        setErrorInfo(errorMessage);
        toast({
          title: "用户信息错误",
          description: `未找到用户 "${props.$w.auth.currentUser.name}" 的详细信息`,
          variant: "destructive"
        });
      } else {
        const errorMessage = "当前用户信息为空，请重新登录";
        console.error('当前用户信息为空:', props.$w.auth.currentUser);
        setErrorInfo(errorMessage);
        toast({
          title: "用户信息错误",
          description: errorMessage,
          variant: "destructive"
        });
      }
    } catch (error) {
      const errorMessage = `加载用户信息失败：${error.message || "未知错误"}`;
      console.error('加载用户信息失败:', error);
      setErrorInfo(errorMessage);
      toast({
        title: "加载失败",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 刷新用户数据
  const refreshUserData = async () => {
    try {
      setIsLoading(true);
      setErrorInfo('');

      // 直接使用当前登录用户的用户名查询数据库
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
          // 更新本地存储
          localStorage.setItem('currentUser', JSON.stringify({
            userId: user._id,
            name: user.name,
            username: user.username,
            isAdmin: user.isAdmin,
            roles: user.roles || [],
            permissions: user.permissions || '',
            department: user.department
          }));
          toast({
            title: "刷新成功",
            description: "用户数据已更新"
          });
        } else {
          toast({
            title: "刷新失败",
            description: "未找到用户信息",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('刷新用户数据失败:', error);
      toast({
        title: "刷新失败",
        description: "无法刷新用户数据：" + (error.message || "未知错误"),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 跳转到登录页面
  const goToLogin = () => {
    $w.utils.navigateTo({
      pageId: 'login',
      params: {}
    });
  };

  // 清除本地存储并重新登录
  const clearAndRelogin = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('hasSeenNotifications');
    goToLogin();
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

  // 如果当前用户为空，显示详细的错误页面
  if (!currentUser) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center" style={style}>
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
            <div className="text-red-600 text-lg font-semibold mb-4">
              用户信息加载失败
            </div>
            {errorInfo && <div className="text-left bg-red-50 border border-red-200 rounded p-3 mb-4">
                <p className="text-sm text-red-800 whitespace-pre-line">{errorInfo}</p>
              </div>}
            <p className="text-gray-600 mb-6">
              无法加载当前用户信息，请重新登录或联系管理员。
            </p>
            <div className="space-y-3">
              <Button onClick={loadCurrentUser} className="w-full flex items-center justify-center">
                <RefreshCw className="w-4 h-4 mr-2" />
                重新加载
              </Button>
              <Button variant="outline" onClick={clearAndRelogin} className="w-full flex items-center justify-center">
                <User className="w-4 h-4 mr-2" />
                重新登录
              </Button>
              <Button variant="outline" onClick={() => $w.utils.navigateTo({
              pageId: 'home',
              params: {}
            })} className="w-full">
                返回首页
              </Button>
            </div>
          </CardContent>
        </Card>
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
              <p className="text-sm text-gray-500 mt-1">
                当前用户: {currentUser.name} ({currentUser.username}) - 
                {currentUser.isAdmin ? ' 管理员' : ' 普通用户'}
              </p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={refreshUserData} className="flex items-center space-x-2" disabled={isLoading}>
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
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