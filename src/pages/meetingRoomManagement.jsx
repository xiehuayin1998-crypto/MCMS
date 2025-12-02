// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, useToast, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Badge, Alert, AlertDescription, AlertTitle, Tabs, TabsContent, TabsList, TabsTrigger, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Textarea } from '@/components/ui';
// @ts-ignore;
import { Calendar, Clock, Users, Building, User, FileText, CheckCircle, XCircle, AlertCircle, ArrowLeft, Search, MapPin, Settings, Eye, ClipboardList, Monitor, Coffee, Filter, RefreshCw, Undo2, History } from 'lucide-react';

// @ts-ignore;
import { UserHeader } from '@/components/UserHeader';
export default function MeetingRoomManagementPage(props) {
  const {
    $w,
    style
  } = props;
  const {
    toast
  } = useToast();
  const [activeTab, setActiveTab] = React.useState('approval');
  const [meetingRooms, setMeetingRooms] = React.useState([]);
  const [bookings, setBookings] = React.useState([]);
  const [meetingDevices, setMeetingDevices] = React.useState([]);
  const [meetingServices, setMeetingServices] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState(null);
  const [isAdmin, setIsAdmin] = React.useState(false);

  // 新增状态：撤销对话框
  const [revokeDialogOpen, setRevokeDialogOpen] = React.useState(false);
  const [selectedBooking, setSelectedBooking] = React.useState(null);
  const [revokeReason, setRevokeReason] = React.useState('');

  // 从UTC时间戳获取本地日期
  const utcToLocalDate = timestamp => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('zh-CN');
  };

  // 从UTC时间戳获取本地时间
  const utcToLocalTime = timestamp => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 加载会议设备数据
  const loadMeetingDevices = async () => {
    try {
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'mc_meeting_devices',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            device_id: true,
            device_name: true
          },
          orderBy: [{
            device_name: 'asc'
          }]
        }
      });
      if (result.records) {
        setMeetingDevices(result.records);
      }
    } catch (error) {
      console.error('加载会议设备数据失败:', error);
    }
  };

  // 加载会议服务数据
  const loadMeetingServices = async () => {
    try {
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'mc_meeting_services',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            service_id: true,
            service_name: true
          },
          orderBy: [{
            service_name: 'asc'
          }]
        }
      });
      if (result.records) {
        setMeetingServices(result.records);
      }
    } catch (error) {
      console.error('加载会议服务数据失败:', error);
    }
  };

  // 获取设备名称
  const getDeviceName = device_id => {
    const device = meetingDevices.find(d => d.device_id === device_id);
    return device ? device.device_name : '未知设备';
  };

  // 获取服务名称
  const getServiceName = service_id => {
    const service = meetingServices.find(s => s.service_id === service_id);
    return service ? service.service_name : '未知服务';
  };

  // 加载用户信息并检查管理员权限
  const loadUserInfo = async () => {
    try {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setCurrentUser(parsedUser);
        setIsAdmin(parsedUser.isAdmin || false);
        return;
      }
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
          setIsAdmin(user.isAdmin || false);
          localStorage.setItem('currentUser', JSON.stringify({
            userId: user._id,
            name: user.name,
            username: user.username,
            isAdmin: user.isAdmin,
            department: user.department
          }));
        } else {
          setIsAdmin(false);
        }
      }
    } catch (error) {
      console.error('加载用户信息失败:', error);
      setIsAdmin(false);
    }
  };

  // 加载会议室数据 - 使用mc_meeting_room数据源的真实数据
  const loadMeetingRooms = async () => {
    try {
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'mc_meeting_room',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            $master: true
          },
          orderBy: [{
            name: 'asc'
          }]
        }
      });
      if (result.records) {
        setMeetingRooms(result.records);
        console.log('加载会议室数据成功:', result.records);
      } else {
        console.log('未找到会议室数据');
      }
    } catch (error) {
      console.error('加载会议室数据失败:', error);
      toast({
        title: "错误",
        description: "加载会议室数据失败",
        variant: "destructive"
      });
    }
  };

  // 加载预约数据
  const loadBookings = async () => {
    try {
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'mc_meeting_booking',
        methodName: 'wedaGetRecordsV2',
        params: {
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
      }
    } catch (error) {
      console.error('加载预约数据失败:', error);
      toast({
        title: "错误",
        description: "加载预约数据失败",
        variant: "destructive"
      });
    }
  };

  // 获取会议室名称 - 使用正确的字段关联
  const getRoomName = roomId => {
    const room = meetingRooms.find(r => r._id === roomId);
    return room ? room.name : '未知会议室';
  };

  // 获取会议室位置 - 使用正确的字段关联
  const getRoomLocation = roomId => {
    const room = meetingRooms.find(r => r._id === roomId);
    return room ? room.location : '位置未知';
  };

  // 获取会议室容量 - 新增功能
  const getRoomCapacity = roomId => {
    const room = meetingRooms.find(r => r._id === roomId);
    return room ? room.capacity : 0;
  };

  // 获取会议室状态 - 新增功能
  const getRoomStatus = roomId => {
    const room = meetingRooms.find(r => r._id === roomId);
    return room ? room.status : '未知状态';
  };

  // 获取状态颜色 - 复用服务管理的样式
  const getStatusColor = status => {
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

  // 获取会议室状态标签样式 - 复用服务管理的样式
  const getRoomStatusBadge = status => {
    switch (status) {
      case '可用':
        return 'bg-green-100 text-green-800 border-green-200';
      case '占用':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case '维护中':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // 检查会议是否已开始
  const isMeetingStarted = booking => {
    const now = new Date().getTime();
    return now >= booking.startTime;
  };

  // 检查会议是否已结束
  const isMeetingEnded = booking => {
    const now = new Date().getTime();
    return now >= booking.endTime;
  };

  // 处理审批操作
  const handleApprove = async bookingId => {
    try {
      setIsLoading(true);
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'mc_meeting_booking',
        methodName: 'wedaUpdateV2',
        params: {
          data: {
            status: '已通过',
            updatedAt: new Date().getTime()
          },
          filter: {
            where: {
              _id: {
                $eq: bookingId
              }
            }
          }
        }
      });
      if (result.count > 0) {
        toast({
          title: "审批通过",
          description: "会议室申请已通过"
        });
        loadBookings();
      }
    } catch (error) {
      console.error('审批失败:', error);
      toast({
        title: "审批失败",
        description: error.message || "审批过程中发生错误",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 处理拒绝操作
  const handleReject = async (bookingId, reason) => {
    try {
      setIsLoading(true);
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'mc_meeting_booking',
        methodName: 'wedaUpdateV2',
        params: {
          data: {
            status: '已拒绝',
            rejectReason: reason,
            updatedAt: new Date().getTime()
          },
          filter: {
            where: {
              _id: {
                $eq: bookingId
              }
            }
          }
        }
      });
      if (result.count > 0) {
        toast({
          title: "已拒绝",
          description: "会议室申请已拒绝"
        });
        loadBookings();
      }
    } catch (error) {
      console.error('拒绝失败:', error);
      toast({
        title: "拒绝失败",
        description: error.message || "拒绝过程中发生错误",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 处理撤销通过操作
  const handleRevoke = async (bookingId, reason) => {
    try {
      setIsLoading(true);

      // 1. 更新会议状态为已拒绝
      const updateResult = await $w.cloud.callDataSource({
        dataSourceName: 'mc_meeting_booking',
        methodName: 'wedaUpdateV2',
        params: {
          data: {
            status: '已拒绝',
            rejectReason: reason,
            updatedAt: new Date().getTime()
          },
          filter: {
            where: {
              _id: {
                $eq: bookingId
              }
            }
          }
        }
      });
      if (updateResult.count > 0) {
        // 2. 保存撤销原因到拒绝信息表
        await $w.cloud.callDataSource({
          dataSourceName: 'mc_meeting_refused_information',
          methodName: 'wedaCreateV2',
          params: {
            data: {
              bookingId: bookingId,
              reason: reason,
              createdAt: new Date().getTime()
            }
          }
        });
        toast({
          title: "撤销成功",
          description: "会议申请已撤销"
        });
        setRevokeDialogOpen(false);
        setRevokeReason('');
        loadBookings();
      }
    } catch (error) {
      console.error('撤销失败:', error);
      toast({
        title: "撤销失败",
        description: error.message || "撤销过程中发生错误",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 打开撤销对话框
  const openRevokeDialog = booking => {
    if (isMeetingEnded(booking)) {
      toast({
        title: "无法撤销",
        description: "会议已结束，无法撤销",
        variant: "destructive"
      });
      return;
    }
    if (isMeetingStarted(booking)) {
      toast({
        title: "无法撤销",
        description: "会议已开始，无法撤销",
        variant: "destructive"
      });
      return;
    }
    setSelectedBooking(booking);
    setRevokeReason('');
    setRevokeDialogOpen(true);
  };

  // 初始化
  React.useEffect(() => {
    loadMeetingRooms();
    loadBookings();
    loadMeetingDevices();
    loadMeetingServices();
    loadUserInfo();
  }, []);

  // 跳转到预定页面
  const handleBooking = () => {
    $w.utils.navigateTo({
      pageId: 'meetingRoomBooking',
      params: {}
    });
  };

  // 跳转到管理员页面
  const handleAdminManagement = () => {
    $w.utils.navigateTo({
      pageId: 'meetingRoomManagementAdmin',
      params: {}
    });
  };

  // 过滤待审批的申请
  const pendingBookings = bookings.filter(booking => booking.status === '待审批');
  // 过滤已通过的申请
  const approvedBookings = bookings.filter(booking => booking.status === '已通过');
  // 过滤已拒绝的申请
  const rejectedBookings = bookings.filter(booking => booking.status === '已拒绝');
  // 整合审批历史（已通过 + 已拒绝）
  const approvalHistory = [...approvedBookings, ...rejectedBookings].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return <div className="min-h-screen bg-gray-50" style={style}>
    <UserHeader $w={$w} showHomeButton={true} />

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <h1 className="text-3xl font-bold text-gray-900">会议室申请管理</h1>
        </div>
        
        {/* 管理员管理按钮 - 仅管理员可见 */}
        {isAdmin && <div className="flex gap-2">
          <Button onClick={handleBooking} className="flex items-center bg-blue-600 hover:bg-blue-700">
            <Calendar className="w-4 h-4 mr-2" />
            预定会议室
          </Button>
          <Button onClick={handleAdminManagement} className="flex items-center bg-green-600 hover:bg-green-700">
            <Settings className="w-4 h-4 mr-2" />
            会议室管理
          </Button>
        </div>}
      </div>

      {/* 会议室列表信息展示 - 修改为复用服务管理的标签样式 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building className="w-5 h-5 mr-2" />
            可用会议室列表
          </CardTitle>
        </CardHeader>
        <CardContent>
          {meetingRooms.length === 0 ? <div className="text-center py-4">
              <p className="text-gray-500">暂无可用会议室</p>
            </div> : <div className="flex flex-wrap gap-3">
              {meetingRooms.map(room => <div key={room._id} className="inline-flex items-center px-3 py-2 rounded-full border text-sm font-medium transition-colors hover:bg-gray-50">
                  <span className="font-medium text-gray-900">{room.name}</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs border ${getRoomStatusBadge(room.status)}`}>
                    {room.status}
                  </span>
                  {room.location && <span className="ml-2 text-gray-600 text-xs">({room.location})</span>}
                  {room.capacity && <span className="ml-2 text-gray-600 text-xs">{room.capacity}人</span>}
                </div>)}
            </div>}
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="approval" className="flex items-center space-x-2">
            <ClipboardList className="w-4 h-4" />
            <span>待审批 ({pendingBookings.length})</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center space-x-2">
            <History className="w-4 h-4" />
            <span>审批历史 ({approvalHistory.length})</span>
          </TabsTrigger>
        </TabsList>

        {/* 待审批标签页 */}
        <TabsContent value="approval" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">待审批申请</h2>
            <Button onClick={loadBookings} variant="outline" size="sm" className="flex items-center">
              <RefreshCw className="w-4 h-4 mr-2" />
              刷新
            </Button>
          </div>

          {pendingBookings.length === 0 ? <div className="text-center py-12">
            <ClipboardList className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">暂无待审批申请</h3>
            <p className="text-gray-600">所有申请都已处理完毕</p>
          </div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingBookings.map(booking => <Card key={booking._id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{booking.topic}</CardTitle>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <User className="w-4 h-4 mr-1" />
                  <span>{booking.applicant}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Building className="w-4 h-4 mr-2 text-blue-600" />
                    <span>{getRoomName(booking.roomId)}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                    <span>{getRoomLocation(booking.roomId)}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                    <span>{utcToLocalDate(booking.startTime)}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock className="w-4 h-4 mr-2 text-blue-600" />
                    <span>{utcToLocalTime(booking.startTime)} - {utcToLocalTime(booking.endTime)}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Users className="w-4 h-4 mr-2 text-blue-600" />
                    <span>{booking.attendeeCount}人</span>
                  </div>
                  
                  {/* 显示会议室容量信息 */}
                  <div className="flex items-center text-sm">
                    <Users className="w-4 h-4 mr-2 text-blue-600" />
                    <span>会议室容量: {getRoomCapacity(booking.roomId)}人</span>
                  </div>
                  
                  {/* 显示会议设备 - 复用服务管理的标签样式 */}
                  {booking.devices && booking.devices.length > 0 && <div className="flex items-start text-sm">
                    <Monitor className="w-4 h-4 mr-2 text-blue-600 mt-0.5" />
                    <div>
                      <span className="font-medium">设备：</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {booking.devices.map(deviceId => <span key={deviceId} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 border border-blue-200">
                          {getDeviceName(deviceId)}
                        </span>)}
                      </div>
                    </div>
                  </div>}
                  
                  {/* 显示会议服务 - 复用服务管理的标签样式 */}
                  {booking.services && booking.services.length > 0 && <div className="flex items-start text-sm">
                    <Coffee className="w-4 h-4 mr-2 text-blue-600 mt-0.5" />
                    <div>
                      <span className="font-medium">服务：</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {booking.services.map(serviceId => <span key={serviceId} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 border border-green-200">
                          {getServiceName(serviceId)}
                        </span>)}
                      </div>
                    </div>
                  </div>}
                  
                  {booking.description && <div className="flex items-start text-sm">
                    <FileText className="w-4 h-4 mr-2 text-blue-600 mt-0.5" />
                    <div>
                      <span className="font-medium">描述：</span>
                      <p className="text-gray-600 mt-1">{booking.description}</p>
                    </div>
                  </div>}
                </div>

                <div className="flex space-x-2 pt-2">
                  <Button onClick={() => handleApprove(booking._id)} disabled={isLoading} className="flex-1 bg-green-600 hover:bg-green-700">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    通过
                  </Button>
                  <Button onClick={() => handleReject(booking._id, '申请被拒绝')} disabled={isLoading} variant="destructive" className="flex-1">
                    <XCircle className="w-4 h-4 mr-1" />
                    拒绝
                  </Button>
                </div>
              </CardContent>
            </Card>)}
          </div>}
        </TabsContent>

        {/* 审批历史标签页 */}
        <TabsContent value="history" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">审批历史</h2>
            <Button onClick={loadBookings} variant="outline" size="sm" className="flex items-center">
              <RefreshCw className="w-4 h-4 mr-2" />
              刷新
            </Button>
          </div>

          {approvalHistory.length === 0 ? <div className="text-center py-12">
            <History className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">暂无审批历史</h3>
            <p className="text-gray-600">还没有处理任何申请</p>
          </div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {approvalHistory.map(booking => {
              const isStarted = isMeetingStarted(booking);
              const isEnded = isMeetingEnded(booking);
              const canRevoke = booking.status === '已通过' && !isStarted && !isEnded;
              return <Card key={booking._id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{booking.topic}</CardTitle>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                      {isEnded && <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600 border border-gray-200">
                        已结束
                      </span>}
                      {isStarted && !isEnded && <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-600 border border-blue-200">
                        进行中
                      </span>}
                      {!isStarted && !isEnded && <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-600 border border-green-200">
                        未开始
                      </span>}
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="w-4 h-4 mr-1" />
                    <span>{booking.applicant}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Building className="w-4 h-4 mr-2 text-gray-600" />
                      <span>{getRoomName(booking.roomId)}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <MapPin className="w-4 h-4 mr-2 text-gray-600" />
                      <span>{getRoomLocation(booking.roomId)}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Calendar className="w-4 h-4 mr-2 text-gray-600" />
                      <span>{utcToLocalDate(booking.startTime)}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Clock className="w-4 h-4 mr-2 text-gray-600" />
                      <span>{utcToLocalTime(booking.startTime)} - {utcToLocalTime(booking.endTime)}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Users className="w-4 h-4 mr-2 text-gray-600" />
                      <span>{booking.attendeeCount}人</span>
                    </div>
                    
                    {/* 显示会议室容量信息 */}
                    <div className="flex items-center text-sm">
                      <Users className="w-4 h-4 mr-2 text-gray-600" />
                      <span>会议室容量: {getRoomCapacity(booking.roomId)}人</span>
                    </div>
                    
                    {/* 显示会议设备 - 复用服务管理的标签样式 */}
                    {booking.devices && booking.devices.length > 0 && <div className="flex items-start text-sm">
                      <Monitor className="w-4 h-4 mr-2 text-gray-600 mt-0.5" />
                      <div>
                        <span className="font-medium">设备：</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {booking.devices.map(deviceId => <span key={deviceId} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 border border-blue-200">
                            {getDeviceName(deviceId)}
                          </span>)}
                        </div>
                      </div>
                    </div>}
                    
                    {/* 显示会议服务 - 复用服务管理的标签样式 */}
                    {booking.services && booking.services.length > 0 && <div className="flex items-start text-sm">
                      <Coffee className="w-4 h-4 mr-2 text-gray-600 mt-0.5" />
                      <div>
                        <span className="font-medium">服务：</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {booking.services.map(serviceId => <span key={serviceId} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 border border-green-200">
                            {getServiceName(serviceId)}
                          </span>)}
                        </div>
                      </div>
                    </div>}
                    
                    {booking.description && <div className="flex items-start text-sm">
                      <FileText className="w-4 h-4 mr-2 text-gray-600 mt-0.5" />
                      <div>
                        <span className="font-medium">描述：</span>
                        <p className="text-gray-600 mt-1">{booking.description}</p>
                      </div>
                    </div>}
                    
                    {booking.rejectReason && <div className="flex items-start text-sm">
                      <AlertCircle className="w-4 h-4 mr-2 text-red-600 mt-0.5" />
                      <div>
                        <span className="font-medium">拒绝原因：</span>
                        <p className="text-red-600 mt-1">{booking.rejectReason}</p>
                      </div>
                    </div>}
                  </div>

                  {canRevoke && <div className="pt-2">
                    <Button onClick={() => openRevokeDialog(booking)} variant="outline" className="w-full" disabled={isLoading}>
                      <Undo2 className="w-4 h-4 mr-1" />
                      撤销通过
                    </Button>
                  </div>}
                </CardContent>
              </Card>;
            })}
          </div>}
        </TabsContent>
      </Tabs>

      {/* 撤销对话框 */}
      <Dialog open={revokeDialogOpen} onOpenChange={setRevokeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>撤销会议申请</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedBooking && <div className="space-y-2">
              <div className="text-sm text-gray-600">
                <p><strong>会议主题：</strong>{selectedBooking.topic}</p>
                <p><strong>申请人：</strong>{selectedBooking.applicant}</p>
                <p><strong>会议室：</strong>{getRoomName(selectedBooking.roomId)}</p>
                <p><strong>时间：</strong>{utcToLocalDate(selectedBooking.startTime)} {utcToLocalTime(selectedBooking.startTime)} - {utcToLocalTime(selectedBooking.endTime)}</p>
              </div>
            </div>}
            <div>
              <Label>撤销原因</Label>
              <Textarea value={revokeReason} onChange={e => setRevokeReason(e.target.value)} placeholder="请输入撤销原因..." className="mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRevokeDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={() => handleRevoke(selectedBooking?._id, revokeReason)} disabled={!revokeReason.trim() || isLoading} variant="destructive">
              <Undo2 className="w-4 h-4 mr-1" />
              确认撤销
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  </div>;
}