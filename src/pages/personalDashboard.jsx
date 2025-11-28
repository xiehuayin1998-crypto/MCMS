// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, useToast, Badge, Avatar, AvatarFallback, AvatarImage } from '@/components/ui';
// @ts-ignore;
import { User, Calendar, Clock, FileText, Users, Settings, Bell, Home, Search, Eye, EyeOff } from 'lucide-react';

// @ts-ignore;
import { UserHeader } from '@/components/UserHeader';
export default function PersonalDashboard(props) {
  const {
    $w,
    style
  } = props;
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const {
    toast
  } = useToast();

  // 获取当前用户信息
  const getCurrentUser = async () => {
    try {
      // 从本地存储获取用户信息
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUserInfo(userData);
      } else {
        // 如果没有存储的用户信息，使用匿名用户
        setUserInfo({
          name: '访客',
          username: 'guest',
          department: '未分配',
          role: '访客',
          avatar: null
        });
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
      setUserInfo({
        name: '访客',
        username: 'guest',
        department: '未分配',
        role: '访客',
        avatar: null
      });
    }
  };

  // 加载个人工作台数据
  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // 模拟加载数据
      setRecentActivities([{
        id: 1,
        type: 'login',
        description: '登录系统',
        time: '2024-12-20 09:00',
        icon: <User className="w-4 h-4" />
      }, {
        id: 2,
        type: 'meeting',
        description: '预订了会议室A',
        time: '2024-12-19 14:30',
        icon: <Calendar className="w-4 h-4" />
      }, {
        id: 3,
        type: 'document',
        description: '查看了质量体系文件',
        time: '2024-12-19 10:15',
        icon: <FileText className="w-4 h-4" />
      }]);
      setUpcomingMeetings([{
        id: 1,
        title: '项目进度会议',
        room: '会议室A',
        time: '2024-12-21 14:00',
        duration: '1小时'
      }, {
        id: 2,
        title: '部门周会',
        room: '会议室B',
        time: '2024-12-22 09:30',
        duration: '30分钟'
      }]);
      setPendingApprovals([{
        id: 1,
        type: 'meeting',
        title: '会议室预订申请',
        applicant: '张三',
        time: '2024-12-20 10:00',
        status: '待审批'
      }]);
      setNotifications([{
        id: 1,
        title: '系统更新',
        content: '系统将于今晚22:00进行更新',
        time: '2024-12-20 08:00',
        type: 'info'
      }, {
        id: 2,
        title: '会议提醒',
        content: '您有一个会议将在30分钟后开始',
        time: '2024-12-20 13:30',
        type: 'warning'
      }]);
    } catch (error) {
      console.error('加载工作台数据失败:', error);
      toast({
        title: "加载失败",
        description: "无法加载工作台数据",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // 处理跳转到员工管理
  const handleNavigateToEmployeeManagement = () => {
    if (userInfo && userInfo.name) {
      $w.utils.navigateTo({
        pageId: 'employeeManagement',
        params: {
          searchName: userInfo.name,
          readonly: true
        }
      });
    } else {
      toast({
        title: "无法跳转",
        description: "无法获取当前用户信息",
        variant: "destructive"
      });
    }
  };

  // 返回首页
  const handleGoHome = () => {
    $w.utils.navigateTo({
      pageId: 'home',
      params: {}
    });
  };

  // 初始化数据
  useEffect(() => {
    getCurrentUser();
    loadDashboardData();
  }, []);
  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">正在加载...</p>
      </div>
    </div>;
  }
  return <div className="min-h-screen bg-gray-50" style={style}>
    {/* 使用统一的用户信息栏组件 */}
    <UserHeader $w={$w} showHomeButton={true} onHomeClick={handleGoHome} />

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 欢迎区域 */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              欢迎回来，{userInfo?.name || '用户'}
            </h1>
            <p className="text-gray-600 mt-2">
              今天是 {new Date().toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
              })}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button onClick={handleNavigateToEmployeeManagement} className="bg-blue-600 hover:bg-blue-700 text-white flex items-center">
              <Search className="w-4 h-4 mr-2" />
              查看我的员工信息
            </Button>
          </div>
        </div>
      </div>

      {/* 用户信息卡片 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              个人信息
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={userInfo?.avatar} alt={userInfo?.name} />
                <AvatarFallback>{userInfo?.name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">{userInfo?.name}</h3>
                <p className="text-sm text-gray-600">{userInfo?.department}</p>
                <p className="text-sm text-gray-500">{userInfo?.role}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              快捷操作
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="justify-start" onClick={() => $w.utils.navigateTo({
                pageId: 'meetingRoomBooking',
                params: {}
              })}>
                <Calendar className="w-4 h-4 mr-2" />
                预订会议室
              </Button>
              <Button variant="outline" className="justify-start" onClick={() => $w.utils.navigateTo({
                pageId: 'regulationManagement',
                params: {
                  category: '规章制度'
                }
              })}>
                <FileText className="w-4 h-4 mr-2" />
                查看规章制度
              </Button>
              <Button variant="outline" className="justify-start" onClick={() => $w.utils.navigateTo({
                pageId: 'qualitySystem',
                params: {
                  category: '质量体系'
                }
              })}>
                <Eye className="w-4 h-4 mr-2" />
                质量体系文件
              </Button>
              <Button variant="outline" className="justify-start" onClick={() => $w.utils.navigateTo({
                pageId: 'safetyEnvironmentSystem',
                params: {
                  category: '安环体系'
                }
              })}>
                <EyeOff className="w-4 h-4 mr-2" />
                安环体系文件
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 工作台内容区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 最近活动 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              最近活动
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map(activity => <div key={activity.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    {activity.icon}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>)}
            </div>
          </CardContent>
        </Card>

        {/* 待办事项 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              待办事项
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingApprovals.map(approval => <div key={approval.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{approval.title}</p>
                  <p className="text-xs text-gray-500">申请人: {approval.applicant}</p>
                </div>
                <Badge variant="secondary">{approval.status}</Badge>
              </div>)}
            </div>
          </CardContent>
        </Card>

        {/* 即将开始的会议 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              即将开始的会议
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingMeetings.map(meeting => <div key={meeting.id} className="border-l-4 border-blue-500 pl-4">
                <p className="text-sm font-medium text-gray-900">{meeting.title}</p>
                <p className="text-xs text-gray-600">{meeting.room} • {meeting.time} • {meeting.duration}</p>
              </div>)}
            </div>
          </CardContent>
        </Card>

        {/* 通知公告 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              通知公告
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notifications.map(notification => <div key={notification.id} className="border-l-4 border-yellow-500 pl-4">
                <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                <p className="text-xs text-gray-600">{notification.content}</p>
                <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
              </div>)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>;
}