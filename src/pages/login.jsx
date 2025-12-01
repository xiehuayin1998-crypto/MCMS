// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, useToast } from '@/components/ui';
// @ts-ignore;
import { Building2, User, Lock, Eye, EyeOff, LogIn } from 'lucide-react';

export default function Login(props) {
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

  // 处理登录
  const handleLogin = async e => {
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

        // 存储用户信息到本地存储
        const userInfo = {
          userId: user._id,
          name: user.name,
          username: user.username,
          isAdmin: user.isAdmin,
          department: user.department,
          roles: user.roles,
          permissions: user.permissions
        };
        localStorage.setItem('currentUser', JSON.stringify(userInfo));
        toast({
          title: "登录成功",
          description: `欢迎回来，${user.name}`
        });

        // 跳转到首页
        $w.utils.navigateTo({
          pageId: 'home',
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
      handleLogin(e);
    }
  };
  return <div style={style} className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center p-4">
    <div className="w-full max-w-md">
      {/* Logo区域 */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto mb-4 bg-white rounded-full shadow-lg flex items-center justify-center">
          <Building2 className="w-10 h-10 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">墨西哥轨道交通装备有限公司</h1>
        <p className="text-gray-600">Mexico Rail Transit Equipment Co., Ltd.</p>
      </div>

      {/* 登录卡片 */}
      <Card className="border-0 shadow-xl">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold text-gray-900">用户登录</CardTitle>
          <p className="text-sm text-gray-600 mt-2">请输入您的登录凭据</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            {/* 用户名输入 */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">
                用户名
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input id="username" type="text" placeholder="请输入用户名" value={username} onChange={e => setUsername(e.target.value)} onKeyPress={handleKeyPress} className="pl-10" disabled={isLoading} />
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

            {/* 记住我选项 */}
            {/* <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-red-600 focus:ring-red-500" />
                  <span className="ml-2 text-sm text-gray-600">记住我</span>
                </label>
                <a href="#" className="text-sm text-red-600 hover:text-red-500">
                  忘记密码？
                </a>
              </div> */}

            {/* 登录按钮 */}
            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white" disabled={isLoading}>
              {isLoading ? <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                登录中...
              </div> : <div className="flex items-center">
                <LogIn className="w-4 h-4 mr-2" />
                登录
              </div>}
            </Button>
          </form>

        </CardContent>
      </Card>

      {/* 版权信息 */}
      <div className="text-center mt-8">
        <p className="text-sm text-gray-500">
          © 2025 墨西哥轨道交通装备有限公司. 保留所有权利.
        </p>
      </div>
    </div>
  </div>;
}