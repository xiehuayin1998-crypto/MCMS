// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Button, Avatar, AvatarFallback, AvatarImage, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui';
// @ts-ignore;
import { Home, User, LogOut, Settings, LayoutDashboard } from 'lucide-react';

import { useAuth } from './AuthProvider';
export function UserHeader({
  $w,
  showHomeButton = true
}) {
  const {
    user,
    isAuthenticated,
    logout,
    isLoading
  } = useAuth();
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('退出登录失败:', error);
    }
  };
  const handleNavigateTo = pageId => {
    $w.utils.navigateTo({
      pageId: pageId,
      params: {}
    });
  };
  if (isLoading) {
    return <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              {showHomeButton && <Button variant="ghost" size="sm" className="mr-4" disabled>
                  <Home className="w-4 h-4 mr-2" />
                  返回首页
                </Button>}
              <h1 className="text-xl font-semibold text-gray-900">
                墨西哥轨道交通装备有限公司
              </h1>
            </div>
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
      </header>;
  }
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
            {isAuthenticated && user ? <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.username)}&background=3b82f6&color=fff`} alt={user.name || user.username} />
                      <AvatarFallback>
                        {(user.name || user.username || '').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      {user.name && <p className="font-medium">{user.name}</p>}
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user.username || user.name}
                        {user.isAdmin && <span className="ml-2 px-1 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
                            管理员
                          </span>}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  
                  {/* 个人工作台入口 - 仅登录用户可见 */}
                  <DropdownMenuItem onClick={() => handleNavigateTo('personalDashboard')}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>个人工作台</span>
                  </DropdownMenuItem>
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