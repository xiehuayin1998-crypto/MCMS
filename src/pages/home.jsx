// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, useToast, Badge, Avatar, AvatarFallback, AvatarImage } from '@/components/ui';
// @ts-ignore;
import { Users, FileText, Calendar, Building2, ChevronDown, BookOpen, Shield, LayoutDashboard, User, LogOut, Settings, Home as HomeIcon, Plus, Upload, Search, Filter, RefreshCw, UserCheck, UserX } from 'lucide-react';

import { UserHeader } from '@/components/UserHeader';
export default function HomePage(props) {
  const {
    $w,
    style
  } = props;
  const [currentUser, setCurrentUser] = useState(null);
  const [showBusinessMenu, setShowBusinessMenu] = useState(false);
  const [showDocumentMenu, setShowDocumentMenu] = useState(false);
  const [userLoading, setUserLoading] = useState(true);
  const {
    toast
  } = useToast();

  // 加载当前用户信息
  useEffect(() => {
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
        setUserLoading(false);
      }
    };
    loadCurrentUser();
  }, [$w.auth.currentUser]);

  // 处理导航菜单点击
  const handleNavigationClick = (type, item) => {
    if (type === 'business') {
      switch (item) {
        case 'meeting':
          $w.utils.navigateTo({
            pageId: 'meetingRoomBooking',
            params: {}
          });
          break;
        default:
          break;
      }
    } else if (type === 'document') {
      switch (item) {
        case 'regulation':
          $w.utils.navigateTo({
            pageId: 'regulationManagement',
            params: {
              category: '规章制度'
            }
          });
          break;
        case 'quality':
          $w.utils.navigateTo({
            pageId: 'qualitySystem',
            params: {
              category: '质量体系'
            }
          });
          break;
        case 'safety':
          $w.utils.navigateTo({
            pageId: 'safetyEnvironmentSystem',
            params: {
              category: '安环体系'
            }
          });
          break;
        default:
          break;
      }
    }
    setShowBusinessMenu(false);
    setShowDocumentMenu(false);
  };

  // 检查用户权限
  const canManageUsers = () => {
    return currentUser && currentUser.isAdmin;
  };
  return <div style={style} className="min-h-screen bg-gray-50">
    {/* 使用统一的用户信息栏组件 */}
    <UserHeader $w={$w} showHomeButton={false} />

    {/* 导航栏 */}
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* 左侧导航项 */}
          <div className="flex items-center space-x-8">
            <button className="flex items-center text-blue-600">
              <HomeIcon className="w-5 h-5 mr-2" />
              首页
            </button>

            {/* 业务功能管理 */}
            <div className="relative">
              <button onClick={() => {
                setShowBusinessMenu(!showBusinessMenu);
                setShowDocumentMenu(false);
              }} className="flex items-center text-gray-700 hover:text-gray-900">
                业务功能管理
                <ChevronDown className="w-4 h-4 ml-1" />
              </button>
              {showBusinessMenu && <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                <button onClick={() => handleNavigationClick('business', 'meeting')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  会议室预定
                </button>
              </div>}
            </div>

            {/* 管理文件 */}
            <div className="relative">
              <button onClick={() => {
                setShowDocumentMenu(!showDocumentMenu);
                setShowBusinessMenu(false);
              }} className="flex items-center text-gray-700 hover:text-gray-900">
                管理文件
                <ChevronDown className="w-4 h-4 ml-1" />
              </button>
              {showDocumentMenu && <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                <button onClick={() => handleNavigationClick('document', 'regulation')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                  <BookOpen className="w-4 h-4 mr-2" />
                  规章制度
                </button>
                <button onClick={() => handleNavigationClick('document', 'quality')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  质量体系
                </button>
                <button onClick={() => handleNavigationClick('document', 'safety')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                  <Shield className="w-4 h-4 mr-2" />
                  安环体系
                </button>
              </div>}
            </div>

            {/* 个人工作台 */}
            <div className="relative">
              <button onClick={() => $w.utils.navigateTo({
                pageId: 'personalDashboard',
                params: {}
              })} className="flex items-center text-gray-700 hover:text-gray-900">
                <LayoutDashboard className="w-5 h-5 mr-2" />
                个人工作台
              </button>
            </div>
          </div>

          {/* 右侧公司信息管理 - 仅管理员可点击 */}
          <div className="relative">
            <button onClick={() => $w.utils.navigateTo({
              pageId: 'employeeLogin',
              params: {}
            })} className="flex items-center text-blue-600 hover:text-blue-800">
              <Users className="w-5 h-5 mr-2" />
              员工管理
            </button>
          </div>
        </div>
      </div>
    </nav>

    {/* 主内容区域 */}
    <div className="max-w-7xl mx-auto p-6">
      {/* 欢迎区域 */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          欢迎使用企业管理系统
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          墨西哥轨道交通装备有限公司 - 为您提供全面的企业管理和协作平台
        </p>
      </div>

      {/* 功能卡片网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* 会议室预定 */}
        <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer" onClick={() => handleNavigationClick('business', 'meeting')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Calendar className="w-12 h-12 text-blue-600" />
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                热门
              </Badge>
            </div>
            <CardTitle className="text-xl mb-2">会议室预定</CardTitle>
            <p className="text-gray-600">快速预定会议室，查看可用时间，管理会议安排</p>
          </CardContent>
        </Card>

        {/* 规章制度 */}
        <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer" onClick={() => handleNavigationClick('document', 'regulation')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <BookOpen className="w-12 h-12 text-green-600" />
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                重要
              </Badge>
            </div>
            <CardTitle className="text-xl mb-2">规章制度</CardTitle>
            <p className="text-gray-600">查看公司规章制度，了解企业文化和行为规范</p>
          </CardContent>
        </Card>

        {/* 质量体系 */}
        <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer" onClick={() => handleNavigationClick('document', 'quality')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <FileText className="w-12 h-12 text-purple-600" />
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                专业
              </Badge>
            </div>
            <CardTitle className="text-xl mb-2">质量体系</CardTitle>
            <p className="text-gray-600">质量管理体系文档，确保产品质量和服务标准</p>
          </CardContent>
        </Card>

        {/* 安环体系 */}
        <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer" onClick={() => handleNavigationClick('document', 'safety')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Shield className="w-12 h-12 text-red-600" />
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                安全
              </Badge>
            </div>
            <CardTitle className="text-xl mb-2">安环体系</CardTitle>
            <p className="text-gray-600">安全生产和环境保护体系，保障员工安全和企业可持续发展</p>
          </CardContent>
        </Card>

        {/* 个人工作台 */}
        <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer" onClick={() => $w.utils.navigateTo({
          pageId: 'personalDashboard',
          params: {}
        })}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <LayoutDashboard className="w-12 h-12 text-orange-600" />
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                个人
              </Badge>
            </div>
            <CardTitle className="text-xl mb-2">个人工作台</CardTitle>
            <p className="text-gray-600">个性化工作空间，管理个人任务和日程安排</p>
          </CardContent>
        </Card>

        {/* 员工管理 */}
        <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer" onClick={() => $w.utils.navigateTo({
          pageId: 'employeeLogin',
          params: {}
        })}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-12 h-12 text-indigo-600" />
              <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
                管理
              </Badge>
            </div>
            <CardTitle className="text-xl mb-2">员工管理</CardTitle>
            <p className="text-gray-600">员工信息管理，权限分配，组织架构维护</p>
            <div className="mt-3 text-sm text-indigo-600">
              <Shield className="w-4 h-4 inline mr-1" />
              管理员专用
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 用户信息区域 */}
      {currentUser && <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={currentUser.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || currentUser.username)}&background=3b82f6&color=fff`} alt={currentUser.name || currentUser.username} />
                <AvatarFallback>
                  {(currentUser.name || currentUser.username || '').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{currentUser.name || currentUser.username}</h3>
                <p className="text-gray-600">欢迎使用企业管理系统</p>
                <div className="flex items-center mt-1">
                  {currentUser.isAdmin ? <UserCheck className="w-4 h-4 text-green-600 mr-1" /> : <UserX className="w-4 h-4 text-gray-400 mr-1" />}
                  <span className="text-sm text-gray-500">
                    {currentUser.isAdmin ? '管理员权限' : '普通用户权限'}
                  </span>
                </div>
              </div>
            </div>
            <Button variant="outline" onClick={() => {
            localStorage.removeItem('currentUser');
            $w.utils.navigateTo({
              pageId: 'login',
              params: {}
            });
          }}>
              <LogOut className="w-4 h-4 mr-2" />
              退出登录
            </Button>
          </div>
        </div>}
    </div>
  </div>;
}