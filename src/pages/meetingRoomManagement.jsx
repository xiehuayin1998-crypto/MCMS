// @ts-ignore;
import React, { useState, useEffect, useCallback } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, useToast, Alert, AlertDescription, AlertTitle, Tabs, TabsContent, TabsList, TabsTrigger, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Textarea, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
// @ts-ignore;
import { Calendar, Clock, Users, Building, User, FileText, CheckCircle, XCircle, AlertCircle, ArrowLeft, Search, MapPin, Settings, Eye, ClipboardList, Monitor, Coffee, Filter, RefreshCw, Undo2, History, Plus, Edit, Trash2 } from 'lucide-react';

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

  // 新增状态：会议室管理
  const [showRoomDialog, setShowRoomDialog] = React.useState(false);
  const [selectedRoom, setSelectedRoom] = React.useState(null);
  const [roomForm, setRoomForm] = React.useState({
    name: '',
    location: '',
    capacity: '',
    status: '可使用'
  });

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

  // 修复：加载会议室数据 - 处理openid权限问题
  const loadMeetingRooms = async () => {
    try {
      console.log('开始加载会议室数据...');
      console.log('当前用户:', currentUser);
      console.log('是否为管理员:', isAdmin);
      let params = {
        select: {
          $master: true
        },
        orderBy: [{
          createdAt: 'desc'
        }]
      };

      // 如果不是管理员，只显示当前用户创建的会议室
      if (!isAdmin && currentUser) {
        params.filter = {
          where: {
            _openid: {
              $eq: currentUser.userId
            }
          }
        };
      }
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'mc_meeting_room',
        methodName: 'wedaGetRecordsV2',
        params: params
      });
      console.log('会议室数据加载结果:', result);
      if (result.records && Array.isArray(result.records)) {
        console.log('成功获取会议室数据:', result.records.length, '条记录');
        setMeetingRooms(result.records);
      } else {
        console.log('未获取到会议室数据或数据格式不正确');
        setMeetingRooms([]);
      }
    } catch (error) {
      console.error('加载会议室数据失败:', error);
      toast({
        title: "错误",
        description: `加载会议室数据失败: ${error.message || '未知错误'}`,
        variant: "destructive"
      });
      setMeetingRooms([]);
    }
  };

  // 加载预约数据 - 同样处理openid权限
  const loadBookings = async () => {
    try {
      let params = {
        select: {
          $master: true
        },
        orderBy: [{
          createdAt: 'desc'
        }]
      };

      // 如果不是管理员，只显示当前用户的预约
      if (!isAdmin && currentUser) {
        params.filter = {
          where: {
            _openid: {
              $eq: currentUser.userId
            }
          }
        };
      }
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'mc_meeting_booking',
        methodName: 'wedaGetRecordsV2',
        params: params
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

  // 获取会议室名称
  const getRoomName = roomId => {
    const room = meetingRooms.find(r => r._id === roomId);
    return room ? room.name : '未知会议室';
  };

  // 获取会议室位置
  const getRoomLocation = roomId => {
    const room = meetingRooms.find(r => r._id === roomId);
    return room ? room.location : '位置未知';
  };

  // 获取状态颜色
  const getStatusColor = status => {
    switch (status) {
      case '待审批':
        return 'bg-yellow-100 text-yellow-800';
      case '已通过':
        return 'bg-green-100 text-green-800';
      case '已拒绝':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 获取会议室状态颜色
  const getRoomStatusColor = status => {
    switch (status) {
      case '可使用':
        return 'bg-green-100 text-green-800';
      case '已停用':
        return 'bg-red-100 text-red-800';
      case '维护中':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  // 新增：会议室管理功能
  const handleAddRoom = () => {
    setSelectedRoom(null);
    setRoomForm({
      name: '',
      location: '',
      capacity: '',
      status: '可使用'
    });
    setShowRoomDialog(true);
  };
  const handleEditRoom = room => {
    setSelectedRoom(room);
    setRoomForm({
      name: room.name || '',
      location: room.location || '',
      capacity: room.capacity?.toString() || '',
      status: room.status || '可使用'
    });
    setShowRoomDialog(true);
  };
  const handleRoomSubmit = async () => {
    try {
      if (!roomForm.name.trim() || !roomForm.location.trim() || !roomForm.capacity) {
        toast({
          title: "请填写完整信息",
          description: "会议室名称、地点和容纳人数不能为空",
          variant: "destructive"
        });
        return;
      }
      const roomData = {
        name: roomForm.name,
        location: roomForm.location,
        capacity: parseInt(roomForm.capacity),
        status: roomForm.status,
        updatedAt: new Date().getTime()
      };
      if (selectedRoom) {
        // 编辑现有会议室
        const result = await $w.cloud.callDataSource({
          dataSourceName: 'mc_meeting_room',
          methodName: 'wedaUpdateV2',
          params: {
            data: roomData,
            filter: {
              where: {
                _id: {
                  $eq: selectedRoom._id
                }
              }
            }
          }
        });
        if (result.count > 0) {
          toast({
            title: "更新成功",
            description: "会议室信息已更新"
          });
        }
      } else {
        // 新增会议室
        roomData.createdAt = new Date().getTime();
        const result = await $w.cloud.callDataSource({
          dataSourceName: 'mc_meeting_room',
          methodName: 'wedaCreateV2',
          params: {
            data: roomData
          }
        });
        if (result.id) {
          toast({
            title: "新增成功",
            description: "会议室已添加"
          });
        }
      }
      setShowRoomDialog(false);
      setSelectedRoom(null);
      loadMeetingRooms();
    } catch (error) {
      console.error('操作失败:', error);
      toast({
        title: "操作失败",
        description: error.message || "操作过程中发生错误",
        variant: "destructive"
      });
    }
  };
  const handleDeleteRoom = async room => {
    if (window.confirm(`确定要删除会议室"${room.name}"吗？此操作不可恢复。`)) {
      try {
        const result = await $w.cloud.callDataSource({
          dataSourceName: 'mc_meeting_room',
          methodName: 'wedaDeleteV2',
          params: {
            filter: {
              where: {
                _id: {
                  $eq: room._id
                }
              }
            }
          }
        });
        if (result.count > 0) {
          toast({
            title: "删除成功",
            description: "会议室已删除"
          });
          loadMeetingRooms();
        }
      } catch (error) {
        console.error('删除失败:', error);
        toast({
          title: "删除失败",
          description: error.message || "删除过程中发生错误",
          variant: "destructive"
        });
      }
    }
  };
  const handleFormChange = (field, value) => {
    setRoomForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 修复：当用户信息加载完成后重新加载会议室数据
  React.useEffect(() => {
    if (currentUser !== null) {
      console.log('用户信息已加载，重新加载会议室数据...');
      loadMeetingRooms();
      loadBookings();
    }
  }, [currentUser]);

  // 初始化
  React.useEffect(() => {
    console.log('组件挂载，开始加载数据...');
    loadUserInfo();
    loadMeetingDevices();
    loadMeetingServices();
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

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="approval" className="flex items-center space-x-2">
            <ClipboardList className="w-4 h-4" />
            <span>待审批 ({pendingBookings.length})</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center space-x-2">
            <History className="w-4 h-4" />
            <span>审批历史 ({approvalHistory.length})</span>
          </TabsTrigger>
          <TabsTrigger value="rooms" className="flex items-center space-x-2">
            <Building className="w-4 h-4" />
            <span>会议室管理 ({meetingRooms.length})</span>
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
                  <Badge variant="secondary" className={getStatusColor(booking.status)}>
                    {booking.status}
                  </Badge>
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
                  
                  {/* 显示会议设备 */}
                  {booking.devices && booking.devices.length > 0 && <div className="flex items-start text-sm">
                    <Monitor className="w-4 h-4 mr-2 text-blue-600 mt-0.5" />
                    <div>
                      <span className="font-medium">设备：</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {booking.devices.map(deviceId => <Badge key={deviceId} variant="outline" className="text-xs">
                          {getDeviceName(deviceId)}
                        </Badge>)}
                      </div>
                    </div>
                  </div>}
                  
                  {/* 显示会议服务 */}
                  {booking.services && booking.services.length > 0 && <div className="flex items-start text-sm">
                    <Coffee className="w-4 h-4 mr-2 text-blue-600 mt-0.5" />
                    <div>
                      <span className="font-medium">服务：</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {booking.services.map(serviceId => <Badge key={serviceId} variant="outline" className="text-xs">
                          {getServiceName(serviceId)}
                        </Badge>)}
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
                      <Badge variant="secondary" className={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                      {isEnded && <Badge variant="outline" className="text-xs bg-gray-100 text-gray-600">
                        已结束
                      </Badge>}
                      {isStarted && !isEnded && <Badge variant="outline" className="text-xs bg-blue-100 text-blue-600">
                        进行中
                      </Badge>}
                      {!isStarted && !isEnded && <Badge variant="outline" className="text-xs bg-green-100 text-green-600">
                        未开始
                      </Badge>}
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
                    
                    {/* 显示会议设备 */}
                    {booking.devices && booking.devices.length > 0 && <div className="flex items-start text-sm">
                      <Monitor className="w-4 h-4 mr-2 text-gray-600 mt-0.5" />
                      <div>
                        <span className="font-medium">设备：</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {booking.devices.map(deviceId => <Badge key={deviceId} variant="outline" className="text-xs">
                            {getDeviceName(deviceId)}
                          </Badge>)}
                        </div>
                      </div>
                    </div>}
                    
                    {/* 显示会议服务 */}
                    {booking.services && booking.services.length > 0 && <div className="flex items-start text-sm">
                      <Coffee className="w-4 h-4 mr-2 text-gray-600 mt-0.5" />
                      <div>
                        <span className="font-medium">服务：</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {booking.services.map(serviceId => <Badge key={serviceId} variant="outline" className="text-xs">
                            {getServiceName(serviceId)}
                          </Badge>)}
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

        {/* 新增：会议室管理标签页 */}
        <TabsContent value="rooms" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">会议室管理</h2>
            <div className="flex gap-2">
              <Button onClick={loadMeetingRooms} variant="outline" size="sm" className="flex items-center">
                <RefreshCw className="w-4 h-4 mr-2" />
                刷新
              </Button>
              {isAdmin && <Button onClick={handleAddRoom} size="sm" className="flex items-center bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                新增会议室
              </Button>}
            </div>
          </div>

          {meetingRooms.length === 0 ? <div className="text-center py-12">
            <Building className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">暂无会议室</h3>
            <p className="text-gray-600">
              {isAdmin ? '请添加会议室信息' : '暂无权限查看会议室，请联系管理员'}
            </p>
          </div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {meetingRooms.map(room => <Card key={room._id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{room.name}</CardTitle>
                  <Badge variant="secondary" className={getRoomStatusColor(room.status)}>
                    {room.status}
                  </Badge>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{room.location}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Users className="w-4 h-4 mr-2 text-blue-600" />
                    <span>容纳人数：{room.capacity}人</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Building className="w-4 h-4 mr-2 text-blue-600" />
                    <span>会议室ID：{room.roomId}</span>
                  </div>
                  {room._openid && <div className="flex items-center text-sm">
                    <User className="w-4 h-4 mr-2 text-gray-600" />
                    <span>创建者：{room._openid === currentUser?.userId ? '我' : room._openid}</span>
                  </div>}
                </div>

                {isAdmin && <div className="flex space-x-2 pt-2">
                  <Button onClick={() => handleEditRoom(room)} variant="outline" className="flex-1">
                    <Edit className="w-4 h-4 mr-1" />
                    编辑
                  </Button>
                  <Button onClick={() => handleDeleteRoom(room)} variant="destructive" className="flex-1">
                    <Trash2 className="w-4 h-4 mr-1" />
                    删除
                  </Button>
                </div>}
              </CardContent>
            </Card>)}
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

      {/* 新增：会议室管理对话框 */}
      <Dialog open={showRoomDialog} onOpenChange={setShowRoomDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedRoom ? '编辑会议室' : '新增会议室'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>会议室名称 *</Label>
              <Input value={roomForm.name} onChange={e => handleFormChange('name', e.target.value)} placeholder="请输入会议室名称" />
            </div>
            <div>
              <Label>位置 *</Label>
              <Input value={roomForm.location} onChange={e => handleFormChange('location', e.target.value)} placeholder="请输入位置" />
            </div>
            <div>
              <Label>容纳人数 *</Label>
              <Input type="number" value={roomForm.capacity} onChange={e => handleFormChange('capacity', e.target.value)} placeholder="请输入容纳人数" />
            </div>
            <div>
              <Label>状态</Label>
              <Select value={roomForm.status} onValueChange={value => handleFormChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="可使用">可使用</SelectItem>
                  <SelectItem value="已停用">已停用</SelectItem>
                  <SelectItem value="维护中">维护中</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRoomDialog(false)}>
              取消
            </Button>
            <Button onClick={handleRoomSubmit} className="bg-blue-600 hover:bg-blue-700">
              {selectedRoom ? '更新' : '新增'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  </div>;
}