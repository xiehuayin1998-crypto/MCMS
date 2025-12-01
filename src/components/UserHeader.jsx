// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Button, Avatar, AvatarFallback, AvatarImage, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui';
// @ts-ignore;
import { Home, User, LogOut, Settings, LayoutDashboard } from 'lucide-react';

export function UserHeader({
  $w,
  showHomeButton = true
}) {
  const [currentUser, setCurrentUser] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // 加载当前用户信息
  React.useEffect(() => {
    loadCurrentUser();
  }, []);
  const loadCurrentUser = async () => {
    try {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        const userInfo = JSON.parse(storedUser);
        setCurrentUser(userInfo);
      } else if ($w.auth.currentUser) {
        // 如果没有存储的用户信息，使用当前登录用户
        setCurrentUser({
          name: $w.auth.currentUser.name,
          username: $w.auth.currentUser.name,
          avatarUrl: $w.auth.currentUser.avatarUrl
        });
      }
    } catch (error) {
      console.error('加载用户信息失败:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    $w.utils.navigateTo({
      pageId: 'login',
      params: {}
    });
  };
  const handleNavigateTo = pageId => {
    $w.utils.navigateTo({
      pageId: pageId,
      params: {}
    });
  };
  return <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 左侧标题和返回按钮 */}
          <div className="flex items-center">
            {showHomeButton && <Button variant="ghost" size="sm" onClick={() => handleNavigateTo('home')} className="mr-4">
                <Home className="w-4 h-4 mr-2" />
                返回首页
              </Button>}
            <h1 className="text-xl font-semibold text-gray-900">
              墨西哥轨道交通装备有限公司
            </h1>
          </div>

          {/* 右侧用户信息 */}
          <div className="flex items-center space-x-4">
            {currentUser ? <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={currentUser.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || currentUser.username)}&background=3b82f6&color=fff`} alt={currentUser.name || currentUser.username} />
                      <AvatarFallback>
                        {(currentUser.name || currentUser.username || '').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      {currentUser.name && <p className="font-medium">{currentUser.name}</p>}
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {currentUser.username || currentUser.name}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  
                  {/* 个人工作台入口 - 仅登录用户可见 */}
                  <DropdownMenuItem onClick={() => handleNavigateTo('personalDashboard')}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>个人工作台</span>
                  </DropdownMenuItem>
                  {/* <DropdownMenuItem onClick={() => handleNavigateTo('settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>设置</span>
                  </DropdownMenuItem> */}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>退出登录</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu> : <Button variant="outline" size="sm" onClick={() => handleNavigateTo('login')}>
                <User className="w-4 h-4 mr-2" />
                登录
              </Button>}
          </div>
        </div>
      </div>
    </header>;
}