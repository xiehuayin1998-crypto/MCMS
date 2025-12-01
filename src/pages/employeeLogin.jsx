// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, useToast } from '@/components/ui';
// @ts-ignore;
import { Building2, User, Lock, Eye, EyeOff, LogIn, Users, Shield } from 'lucide-react';

export default function EmployeeLogin(props) {
  const {
    $w,
    style
  } = props;
  const {
    toast
  } = useToast();
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

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
          }
        }
      });
      if (result.records && result.records.length > 0) {
        const user = result.records[0];

        // 检查用户权限
        if (!user.isAdmin) {
          toast({
            title: "权限不足",
            description: "您没有员工管理系统的访问权限，请联系管理员",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }

        // 存储员工管理专用用户信息
        const employeeUserInfo = {
          userId: user._id,
          name: user.name,
          username: user.username,
          isAdmin: user.isAdmin,
          department: user.department,
          employee_number: user.employee_number,
          loginTime: new Date().toISOString(),
          system: 'employee_management'
        };
        localStorage.setItem('employeeUser', JSON.stringify(employeeUserInfo));
        toast({
          title: "登录成功",
          description: `欢迎进入员工管理系统，${user.name}`
        });

        // 跳转到员工管理页面
        $w.utils.navigateTo({
          pageId: 'employeeManagement',
          params: {
            authenticated: 'true',
            userInfo: JSON.stringify(employeeUserInfo)
          }
        });
      } else {
        toast({
          title: "登录失败",
          description: "用户名或密码错误",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('员工管理登录错误:', error);
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

  // 返回登录页面
  const handleGoToMainLogin = () => {
    $w.utils.navigateTo({
      pageId: 'login',
      params: {}
    });
  };
  return <div style={style} className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center p-4">
    <div className="w-full max-w-md">
      {/* Logo区域 */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto mb-4 bg-white rounded-full shadow-lg flex items-center justify-center">
          <Shield className="w-10 h-10 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">员工管理系统</h1>
        <p className="text-gray-600">Employee Management System</p>
        <div className="mt-2 flex items-center justify-center text-sm text-gray-500">
          <Users className="w-4 h-4 mr-1" />
          墨西哥轨道交通装备有限公司
        </div>
      </div>

      {/* 登录卡片 */}
      <Card className="border-0 shadow-xl">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold text-gray-900 flex items-center justify-center">
            <Shield className="w-6 h-6 mr-2 text-red-600" />
            管理员登录
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">请输入管理员账号密码</p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mt-2">
            <p className="text-xs text-yellow-800">
              <strong>注意：</strong>仅管理员账号可访问员工管理系统
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmployeeLogin} className="space-y-6">
            {/* 用户名输入 */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">
                管理员账号
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input id="username" type="text" placeholder="请输入管理员账号" value={username} onChange={e => setUsername(e.target.value)} onKeyPress={handleKeyPress} className="pl-10" disabled={isLoading} />
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

            {/* 登录按钮 */}
            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white" disabled={isLoading}>
              {isLoading ? <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                验证中...
              </div> : <div className="flex items-center">
                <LogIn className="w-4 h-4 mr-2" />
                进入管理系统
              </div>}
            </Button>
          </form>

          {/* 底部导航按钮 */}
          <div className="mt-6 flex justify-between">
            <Button variant="outline" size="sm" onClick={handleGoHome} className="text-gray-600">
              <Building2 className="w-4 h-4 mr-1" />
              返回首页
            </Button>
            <Button variant="ghost" size="sm" onClick={handleGoToMainLogin} className="text-blue-600">
              普通用户登录
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 版权信息 */}
      <div className="text-center mt-8">
        <p className="text-sm text-gray-500">
          © 2025 墨西哥轨道交通装备有限公司. 员工管理系统
        </p>
      </div>
    </div>
  </div>;
}