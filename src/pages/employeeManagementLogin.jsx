// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, useToast, Badge } from '@/components/ui';
// @ts-ignore;
import { Users, Shield, LogIn, User, Lock, Eye, EyeOff, Building2, AlertCircle } from 'lucide-react';

export default function EmployeeManagementLogin(props) {
  const {
    $w,
    style
  } = props;
  const {
    toast
  } = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // 检查当前登录状态和权限
  useEffect(() => {
    const checkCurrentUser = async () => {
      if (!$w.auth.currentUser) {
        return;
      }
      setIsChecking(true);
      try {
        // 查询当前登录用户信息
        const result = await $w.cloud.callDataSource({
          dataSourceName: 'mc_users',
          methodName: 'wedaGetRecordsV2',
          params: {
            filter: {
              where: {
                _id: {
                  $eq: $w.auth.currentUser.userId
                }
              }
            },
            select: {
              $master: true
            },
            pageSize: 1
          }
        });
        if (result.records && result.records.length > 0) {
          const user = result.records[0];
          setCurrentUser(user);

          // 如果是管理员，自动跳转到员工管理页面
          if (user.isAdmin) {
            toast({
              title: "权限验证通过",
              description: "欢迎使用员工管理系统"
            });
            setTimeout(() => {
              $w.utils.navigateTo({
                pageId: 'employeeManagement',
                params: {}
              });
            }, 1000);
          }
        }
      } catch (error) {
        console.error('检查用户权限失败:', error);
      } finally {
        setIsChecking(false);
      }
    };
    checkCurrentUser();
  }, [$w.auth.currentUser]);

  // 处理员工管理登录
  const handleEmployeeLogin = async e => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast({
        title: "输入错误",
        description: "请输入用户名和密码",
        variant: "destructive"
      });
      return;
    }
    setIsLoading(true);
    try {
      // 查询用户数据
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'mc_users',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              username: {
                $eq: username.trim()
              },
              password: {
                $eq: password.trim()
              }
            }
          },
          select: {
            $master: true
          },
          pageSize: 1
        }
      });
      if (result.records && result.records.length > 0) {
        const user = result.records[0];

        // 检查是否为管理员
        if (!user.isAdmin) {
          toast({
            title: "权限不足",
            description: "只有管理员可以访问员工管理功能",
            variant: "destructive"
          });
          return;
        }

        // 存储用户信息到本地存储
        const userInfo = {
          userId: user._id,
          name: user.name,
          username: user.username,
          isAdmin: user.isAdmin,
          department: user.department,
          employee_number: user.employee_number
        };
        localStorage.setItem('employeeManagementUser', JSON.stringify(userInfo));
        toast({
          title: "登录成功",
          description: `欢迎回来，${user.name}管理员`
        });

        // 跳转到员工管理页面
        $w.utils.navigateTo({
          pageId: 'employeeManagement',
          params: {}
        });
      } else {
        toast({
          title: "登录失败",
          description: "用户名或密码错误",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('登录错误:', error);
      toast({
        title: "登录失败",
        description: error.message || "登录过程中发生错误",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 处理回车键登录
  const handleKeyPress = e => {
    if (e.key === 'Enter') {
      handleEmployeeLogin(e);
    }
  };

  // 返回首页
  const handleGoHome = () => {
    $w.utils.navigateTo({
      pageId: 'home',
      params: {}
    });
  };
  return <div style={style} className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo区域 */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-white rounded-full shadow-lg flex items-center justify-center">
            <Building2 className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">墨西哥轨道交通装备有限公司</h1>
          <p className="text-gray-600">员工管理系统 - 管理员登录</p>
        </div>

        {/* 登录卡片 */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-blue-600 mr-3" />
              <CardTitle className="text-2xl font-bold text-gray-900">员工管理登录</CardTitle>
            </div>
            <p className="text-sm text-gray-600">请输入管理员账号进行身份验证</p>
          </CardHeader>
          
          <CardContent>
            {/* 当前用户状态显示 */}
            {currentUser && <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <User className="w-5 h-5 text-blue-600 mr-2" />
                    <div>
                      <p className="font-medium text-blue-900">{currentUser.name}</p>
                      <p className="text-sm text-blue-700">{currentUser.username}</p>
                    </div>
                  </div>
                  <Badge variant={currentUser.isAdmin ? "default" : "secondary"} className={currentUser.isAdmin ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                    {currentUser.isAdmin ? "管理员" : "普通用户"}
                  </Badge>
                </div>
                {!currentUser.isAdmin && <div className="mt-3 flex items-center text-sm text-red-600">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    当前账号无管理员权限
                  </div>}
              </div>}

            {isChecking ? <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">正在检查权限...</p>
              </div> : <form onSubmit={handleEmployeeLogin} className="space-y-6">
                {/* 用户名输入 */}
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium">
                    管理员账号
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input id="username" type="text" placeholder="请输入管理员用户名" value={username} onChange={e => setUsername(e.target.value)} onKeyPress={handleKeyPress} className="pl-10" disabled={isLoading} />
                  </div>
                </div>

                {/* 密码输入 */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    密码
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input id="password" type={showPassword ? "text" : "password"} placeholder="请输入密码" value={password} onChange={e => setPassword(e.target.value)} onKeyPress={handleKeyPress} className="pl-10 pr-10" disabled={isLoading} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* 操作按钮组 */}
                <div className="flex flex-col space-y-3">
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isLoading}>
                    {isLoading ? <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        登录中...
                      </div> : <div className="flex items-center justify-center">
                        <LogIn className="w-4 h-4 mr-2" />
                        管理员登录
                      </div>}
                  </Button>
                  
                  <Button type="button" variant="outline" onClick={handleGoHome} className="w-full">
                    返回首页
                  </Button>
                </div>
              </form>}
          </CardContent>
        </Card>

        {/* 安全提示 */}
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex items-start">
            <Shield className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800">安全提示</p>
              <p className="text-xs text-yellow-700 mt-1">
                员工管理系统仅限管理员访问。请使用管理员账号登录，确保信息安全。
              </p>
            </div>
          </div>
        </div>

        {/* 版权信息 */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            © 2025 墨西哥轨道交通装备有限公司. 保留所有权利.
          </p>
        </div>
      </div>
    </div>;
}