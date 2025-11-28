// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, useToast, Tabs, TabsContent, TabsList, TabsTrigger, Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui';
// @ts-ignore;
import { Calendar, Clock, Users, Building, AlertCircle, CheckCircle, XCircle, RefreshCw, Eye, MessageSquare, Filter, FileText, Shield, Key, ChevronDown, ChevronUp, User } from 'lucide-react';

// @ts-ignore;
import { UserHeader } from '@/components/UserHeader';
// @ts-ignore;
import { PermissionButton } from '@/components/PermissionButton';
// @ts-ignore;
import { PermissionUtils } from '@/components/PermissionGuard';
export default function PersonalDashboard(props) {
  const {
    $w,
    style
  } = props;
  const {
    toast
  } = useToast();
  const [bookings, setBookings] = React.useState([]);
  const [filteredBookings, setFilteredBookings] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [filterStatus, setFilterStatus] = React.useState('all');
  const [filterDateRange, setFilterDateRange] = React.useState('all');
  const [currentUser, setCurrentUser] = React.useState(null);
  const [rejectedReasons, setRejectedReasons] = React.useState({});
  const [meetingRooms, setMeetingRooms] = React.useState({});
  const [activeTab, setActiveTab] = React.useState('myBookings');
  const [hasMeetingManagementPermission, setHasMeetingManagementPermission] = React.useState(false);
  const [showDetailedPermissions, setShowDetailedPermissions] = React.useState(false);

  // 统计信息
  const [stats, setStats] = React.useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  // 加载当前用户信息
  const loadCurrentUser = async () => {
    try {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        const userInfo = JSON.parse(storedUser);
        setCurrentUser(userInfo);
        checkMeetingManagementPermission(userInfo);
        return userInfo;
      }
      if ($w.auth.currentUser && $w.auth.currentUser.name) {
        const result = await $w.cloud.callDataSource({
          dataSourceName: 'mc_users',
          methodName: 'wedaGetRecordsV2',
          params: {
            filter: {
              where: {
                username: {
                  $eq: $w.auth.currentUser.name
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
          checkMeetingManagementPermission(user);
          localStorage.setItem('currentUser', JSON.stringify({
            userId: user._id,
            name: user.name,
            username: user.username,
            isAdmin: user.isAdmin,
            roles: user.roles || [],
            permissions: user.permissions || '',
            department: user.department
          }));
          return user;
        }
      }
      return null;
    } catch (error) {
      console.error('加载用户信息失败:', error);
      return null;
    }
  };

  // 检查会议室申请管理权限
  const checkMeetingManagementPermission = user => {
    const hasPermission = PermissionUtils.hasMeetingManagementPermission(user);
    console.log('检查会议室申请管理权限:', {
      user: user ? {
        name: user.name,
        isAdmin: user.isAdmin,
        permissions: user.permissions
      } : 'null',
      hasPermission
    });
    setHasMeetingManagementPermission(hasPermission);
  };

  // 获取用户权限摘要
  const getUserPermissionSummary = () => {
    if (!currentUser) return [];
    const summary = [];

    // 管理员权限
    if (currentUser.isAdmin) {
      summary.push({
        type: 'admin',
        label: '管理员',
        color: 'bg-red-100 text-red-800',
        description: '拥有系统所有权限'
      });
    }

    // 会议室申请管理权限
    if (hasMeetingManagementPermission) {
      summary.push({
        type: 'meeting_management',
        label: '会议室管理',
        color: 'bg-blue-100 text-blue-800',
        description: '可以审批会议室申请'
      });
    }

    // 角色权限
    if (currentUser.roles && currentUser.roles.length > 0) {
      summary.push({
        type: 'roles',
        label: `${currentUser.roles.length}个角色`,
        color: 'bg-green-100 text-green-800',
        description: '通过角色获得权限'
      });
    }

    // 具体权限数量
    if (currentUser.permissions) {
      const permissionCount = PermissionUtils.parseUserPermissions(currentUser).length;
      if (permissionCount > 0) {
        summary.push({
          type: 'permissions',
          label: `${permissionCount}个权限`,
          color: 'bg-purple-100 text-purple-800',
          description: '直接分配的权限'
        });
      }
    }
    return summary;
  };

  // 获取用户的具体权限列表
  const getUserDetailedPermissions = () => {
    if (!currentUser) return [];
    return PermissionUtils.parseUserPermissions(currentUser);
  };

  // 权限描述映射
  const getPermissionDescription = permission => {
    const descriptions = {
      'application.management.view': '查看应用管理',
      'APPLICATION_MANAGEMENT_VIEW': '查看应用管理',
      'meeting_room_management': '会议室管理',
      'APPLICATION_MANAGEMENT_APPROVE': '审批应用申请',
      'APPLICATION_MANAGEMENT_REJECT': '拒绝应用申请',
      'APPLICATION_MANAGEMENT_CANCEL': '撤销应用申请',
      'user.management.view': '查看用户管理',
      'user.management.edit': '编辑用户信息',
      'role.management.view': '查看角色管理',
      'role.management.edit': '编辑角色权限',
      'department.management.view': '查看部门管理',
      'department.management.edit': '编辑部门信息',
      'file.management.view': '查看文件管理',
      'file.management.upload': '上传文件',
      'file.management.delete': '删除文件',
      'regulation.management.view': '查看规章制度',
      'regulation.management.edit': '编辑规章制度',
      'quality.system.view': '查看质量体系',
      'safety.system.view': '查看安全环境体系'
    };
    return descriptions[permission] || permission;
  };

  // 加载会议室信息
  const loadMeetingRooms = async () => {
    try {
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'mc_meeting_room',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            $master: true
          }
        }
      });
      if (result.records) {
        const roomsMap = {};
        result.records.forEach(room => {
          roomsMap[room._id] = room;
        });
        setMeetingRooms(roomsMap);
      }
    } catch (error) {
      console.error('加载会议室信息失败:', error);
    }
  };

  // 加载拒绝原因
  const loadRejectedReasons = async bookingIds => {
    try {
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'mc_meeting_refused_information',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              bookingId: {
                $in: bookingIds
              }
            }
          },
          select: {
            $master: true
          }
        }
      });
      const reasonsMap = {};
      if (result.records) {
        result.records.forEach(reason => {
          reasonsMap[reason.bookingId] = reason;
        });
      }
      setRejectedReasons(reasonsMap);
    } catch (error) {
      console.error('加载拒绝原因失败:', error);
    }
  };

  // 加载用户的预约记录
  const loadUserBookings = async user => {
    if (!user) return;
    try {
      setIsLoading(true);

      // 从 mc_meeting_booking 数据模型查询当前用户的所有预约记录
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'mc_meeting_booking',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              applicant: {
                $eq: user.name || user.username
              }
            }
          },
          select: {
            $master: true
          },
          orderBy: [{
            createdAt: 'desc'
          }]
        }
      });
      if (result.records) {
        setBookings(result.records);
        setFilteredBookings(result.records);

        // 计算统计信息
        const stats = {
          total: result.records.length,
          pending: result.records.filter(b => b.status === '待审批').length,
          approved: result.records.filter(b => b.status === '已通过').length,
          rejected: result.records.filter(b => b.status === '已拒绝').length
        };
        setStats(stats);

        // 加载拒绝原因 - 从 mc_meeting_refused_information 数据模型查询
        const rejectedBookings = result.records.filter(b => b.status === '已拒绝');
        if (rejectedBookings.length > 0) {
          await loadRejectedReasons(rejectedBookings.map(b => b._id));
        }
      }
    } catch (error) {
      console.error('加载预约记录失败:', error);
      toast({
        title: "加载失败",
        description: "无法加载您的预约记录",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 筛选预约记录
  const filterBookings = () => {
    let filtered = [...bookings];

    // 按状态筛选
    if (filterStatus !== 'all') {
      filtered = filtered.filter(booking => booking.status === filterStatus);
    }

    // 按时间范围筛选
    const now = new Date();
    if (filterDateRange === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      filtered = filtered.filter(booking => new Date(booking.startTime) >= today);
    } else if (filterDateRange === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter(booking => new Date(booking.startTime) >= weekAgo);
    } else if (filterDateRange === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      filtered = filtered.filter(booking => new Date(booking.startTime) >= monthAgo);
    }
    setFilteredBookings(filtered);
  };

  // 格式化时间
  const formatDateTime = timestamp => {
    return new Date(timestamp).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 格式化日期
  const formatDate = timestamp => {
    return new Date(timestamp).toLocaleDateString('zh-CN');
  };

  // 获取状态样式
  const getStatusStyle = status => {
    switch (status) {
      case '待审批':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case '已通过':
        return 'bg-green-100 text-green-800 border-green-200';
      case '已拒绝':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // 获取状态图标
  const getStatusIcon = status => {
    switch (status) {
      case '待审批':
        return <Clock className="w-4 h-4" />;
      case '已通过':
        return <CheckCircle className="w-4 h-4" />;
      case '已拒绝':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  // 查看详情
  const handleViewDetails = booking => {
    toast({
      title: "查看详情",
      description: `查看 ${booking.topic} 的详细信息`
    });
  };

  // 重新申请
  const handleReapply = booking => {
    $w.utils.navigateTo({
      pageId: 'meetingRoomBooking',
      params: {
        roomId: booking.roomId,
        topic: booking.topic,
        attendeeCount: booking.attendeeCount,
        description: booking.description
      }
    });
  };

  // 取消申请
  const handleCancel = async booking => {
    try {
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'mc_meeting_booking',
        methodName: 'wedaDeleteV2',
        params: {
          filter: {
            where: {
              _id: {
                $eq: booking._id
              }
            }
          }
        }
      });
      if (result.count > 0) {
        toast({
          title: "取消成功",
          description: "预约已取消"
        });
        loadUserBookings(currentUser);
      }
    } catch (error) {
      console.error('取消预约失败:', error);
      toast({
        title: "取消失败",
        description: error.message || "取消预约时发生错误",
        variant: "destructive"
      });
    }
  };

  // 跳转到员工管理页面，并自动填入当前用户姓名
  const handleViewMyInfo = () => {
    if (!currentUser) {
      toast({
        title: "无法获取用户信息",
        description: "请先登录系统",
        variant: "destructive"
      });
      return;
    }
    $w.utils.navigateTo({
      pageId: 'employeeManagement',
      params: {
        autoSearch: currentUser.name || currentUser.username,
        readOnly: true
      }
    });
  };

  // 初始化加载
  React.useEffect(() => {
    const init = async () => {
      const user = await loadCurrentUser();
      if (user) {
        await loadMeetingRooms();
        await loadUserBookings(user);
      }
    };
    init();
  }, []);

  // 筛选器变化时重新筛选
  React.useEffect(() => {
    filterBookings();
  }, [filterStatus, filterDateRange, bookings]);

  // 获取权限摘要
  const permissionSummary = getUserPermissionSummary();
  const detailedPermissions = getUserDetailedPermissions();
  if (isLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">正在加载您的预约记录...</p>
      </div>
    </div>;
  }
  return <div className="min-h-screen bg-gray-50" style={style}>
    <UserHeader $w={$w} showHomeButton={true} />
    
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">个人工作台</h1>
        <p className="text-gray-600">查看和管理您的会议室预约记录</p>
      </div>

      {/* 快速操作卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* 查看我的信息按钮 */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex flex-col items-center text-center" onClick={handleViewMyInfo}>
            <div className="p-3 bg-blue-100 rounded-full mb-4">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">查看我的信息</h3>
            <p className="text-sm text-gray-600 mb-4">快速查看您在系统中的个人信息</p>
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              查看信息
            </Button>
          </CardContent>
        </Card>

        {/* 会议室预约卡片 */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex flex-col items-center text-center" onClick={() => $w.utils.navigateTo({
            pageId: 'meetingRoomBooking',
            params: {}
          })}>
            <div className="p-3 bg-green-100 rounded-full mb-4">
              <Calendar className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">预约会议室</h3>
            <p className="text-sm text-gray-600 mb-4">快速预约公司会议室</p>
            <Button className="w-full bg-green-600 hover:bg-green-700">
              立即预约
            </Button>
          </CardContent>
        </Card>

        {/* 会议室管理卡片（仅管理员可见） */}
        {hasMeetingManagementPermission && <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex flex-col items-center text-center" onClick={() => $w.utils.navigateTo({
            pageId: 'meetingRoomManagement',
            params: {}
          })}>
              <div className="p-3 bg-purple-100 rounded-full mb-4">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">会议室管理</h3>
              <p className="text-sm text-gray-600 mb-4">管理会议室预约申请</p>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                进入管理
              </Button>
            </CardContent>
          </Card>}
      </div>

      {/* 用户权限展示区域 - 详细展示 */}
      {currentUser && permissionSummary.length > 0 && <div className="mb-6">
          <div className="flex items-center space-x-2 text-sm mb-3">
            <Key className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600 font-medium">当前权限：</span>
            <div className="flex flex-wrap gap-2">
              {permissionSummary.map((perm, index) => <div key={index} className="flex items-center space-x-1">
                  <Badge className={`${perm.color} text-xs px-2 py-1`}>
                    {perm.label}
                  </Badge>
                  {/* 如果用户具有会议室申请管理权限，显示特殊提示 */}
                  {perm.type === 'meeting_management' && <span className="text-xs text-blue-600 font-medium ml-1">
                      ✓ 可审批会议室申请
                    </span>}
                </div>)}
            </div>
          </div>
          
          {/* 详细权限列表 */}
          {detailedPermissions.length > 0 && <Collapsible open={showDetailedPermissions} onOpenChange={setShowDetailedPermissions}>
              <CollapsibleTrigger className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 cursor-pointer">
                {showDetailedPermissions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                <span>查看具体权限列表 ({detailedPermissions.length} 个权限)</span>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {detailedPermissions.map((permission, index) => <div key={index} className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">{permission}</code>
                        <span className="text-gray-600 text-xs">{getPermissionDescription(permission)}</span>
                      </div>)}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>}
          
          {/* 会议室申请管理权限特别提示 */}
          {hasMeetingManagementPermission && <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">会议室申请管理权限</span>
              </div>
              <p className="text-xs text-blue-700 mt-1">
                您拥有会议室申请管理权限，可以审批其他用户的会议室预约申请。
              </p>
            </div>}
        </div>}

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">总申请数</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">待审批</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">已通过</p>
                <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">已拒绝</p>
                <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 功能标签页 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="myBookings" className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>我的申请</span>
          </TabsTrigger>
          {hasMeetingManagementPermission && <TabsTrigger value="meetingManagement" className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>会议室申请管理</span>
            </TabsTrigger>}
        </TabsList>

        {/* 我的申请标签页 */}
        <TabsContent value="myBookings" className="space-y-6">
          {/* 筛选器 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">筛选条件</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">申请状态</label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择状态" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部状态</SelectItem>
                      <SelectItem value="待审批">待审批</SelectItem>
                      <SelectItem value="已通过">已通过</SelectItem>
                      <SelectItem value="已拒绝">已拒绝</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">时间范围</label>
                  <Select value={filterDateRange} onValueChange={setFilterDateRange}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择时间范围" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部时间</SelectItem>
                      <SelectItem value="today">今天</SelectItem>
                      <SelectItem value="week">本周</SelectItem>
                      <SelectItem value="month">本月</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 申请列表 */}
          {filteredBookings.length === 0 ? <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">暂无预约记录</h3>
                <p className="text-gray-600 mb-4">
                  {filterStatus === 'all' && filterDateRange === 'all' ? '您还没有任何会议室预约记录' : '当前筛选条件下没有找到匹配的预约记录'}
                </p>
                <Button onClick={() => $w.utils.navigateTo({
                pageId: 'meetingRoomBooking',
                params: {}
              })}>
                  立即预约会议室
                </Button>
              </CardContent>
            </Card> : <div className="space-y-4">
              {filteredBookings.map(booking => {
              const room = meetingRooms[booking.roomId];
              const rejectedReason = rejectedReasons[booking._id];
              return <Card key={booking._id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <Badge className={`${getStatusStyle(booking.status)} flex items-center space-x-1`}>
                              {getStatusIcon(booking.status)}
                              <span>{booking.status}</span>
                            </Badge>
                            <span className="text-sm text-gray-500">
                              申请时间：{formatDateTime(booking.createdAt)}
                            </span>
                          </div>
                          
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{booking.topic}</h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600 mb-1">
                                <Building className="inline w-4 h-4 mr-1" />
                                会议室：{room?.name || '未知会议室'}
                              </p>
                              <p className="text-gray-600">
                                <Users className="inline w-4 h-4 mr-1" />
                                参会人数：{booking.attendeeCount}人
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600 mb-1">
                                <Calendar className="inline w-4 h-4 mr-1" />
                                会议日期：{formatDate(booking.startTime)}
                              </p>
                              <p className="text-gray-600">
                                <Clock className="inline w-4 h-4 mr-1" />
                                会议时间：{formatDateTime(booking.startTime)} - {formatDateTime(booking.endTime)}
                              </p>
                            </div>
                          </div>

                          {booking.description && <p className="text-sm text-gray-600 mt-3">
                              <MessageSquare className="inline w-4 h-4 mr-1" />
                              描述：{booking.description}
                            </p>}

                          {booking.status === '已拒绝' && rejectedReason && <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                              <p className="text-sm font-medium text-red-800 mb-1">拒绝原因：</p>
                              <p className="text-sm text-red-700">{rejectedReason.reason}</p>
                              <p className="text-xs text-red-600 mt-1">
                                拒绝时间：{formatDateTime(rejectedReason.rejectedAt)}
                              </p>
                            </div>}
                        </div>

                        <div className="flex flex-col space-y-2 ml-4">
                          <Button size="sm" variant="outline" onClick={() => handleViewDetails(booking)} className="flex items-center">
                            <Eye className="w-4 h-4 mr-1" />
                            详情
                          </Button>
                          
                          {booking.status === '已拒绝' && <Button size="sm" variant="outline" onClick={() => handleReapply(booking)} className="flex items-center">
                              <RefreshCw className="w-4 h-4 mr-1" />
                              重新申请
                            </Button>}
                          
                          {booking.status === '待审批' && <Button size="sm" variant="outline" onClick={() => handleCancel(booking)} className="flex items-center text-red-600">
                              取消申请
                            </Button>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>;
            })}
              </div>}
        </TabsContent>

        {/* 会议室申请管理标签页 */}
        {hasMeetingManagementPermission && <TabsContent value="meetingManagement" className="space-y-6">
            <Card>
              <CardContent className="p-8 text-center">
                <Shield className="w-16 h-16 mx-auto text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">会议室申请管理</h3>
                <p className="text-gray-600 mb-6">管理所有会议室预约申请的审批流程</p>
                <Button onClick={() => $w.utils.navigateTo({
                pageId: 'meetingRoomManagement',
                params: {}
              })} className="bg-blue-600 hover:bg-blue-700">
                  <FileText className="w-4 h-4 mr-2" />
                  进入会议室申请管理
                </Button>
              </CardContent>
            </Card>

            {/* 权限提示 */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">权限状态</h4>
                    <p className="text-sm text-gray-600">
                      您拥有会议室申请管理权限，可以访问以下功能：
                    </p>
                    <div className="mt-3 space-y-2 text-sm">
                      <p className="text-gray-600">• 查看所有会议室申请记录</p>
                      <p className="text-gray-600">• 审批待处理的申请</p>
                      <p className="text-gray-600">• 拒绝不符合要求的申请</p>
                      <p className="text-gray-600">• 撤销已通过的申请</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>}
      </Tabs>
    </div>
  </div>;
}