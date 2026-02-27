// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, useToast, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Badge, Alert, AlertDescription, AlertTitle, Checkbox } from '@/components/ui';
// @ts-ignore;
import { Calendar, Clock, Users, Building, User, FileText, CheckCircle, XCircle, AlertCircle, ArrowLeft, Search, MapPin, Settings, Eye, ClipboardList, Monitor, Coffee } from 'lucide-react';

// @ts-ignore;
import { UserHeader } from '@/components/UserHeader';
export default function MeetingRoomBooking(props) {
  const {
    $w,
    style
  } = props;
  const {
    toast
  } = useToast();
  const [meetingRooms, setMeetingRooms] = React.useState([]);
  const [selectedRoom, setSelectedRoom] = React.useState('');
  const [selectedDate, setSelectedDate] = React.useState('');
  const [selectedStartTime, setSelectedStartTime] = React.useState('');
  const [selectedEndTime, setSelectedEndTime] = React.useState('');
  const [topic, setTopic] = React.useState('');
  const [applicant, setApplicant] = React.useState('');
  const [attendeeCount, setAttendeeCount] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [bookings, setBookings] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [timeSlots, setTimeSlots] = React.useState([]);
  const [currentUser, setCurrentUser] = React.useState(null);
  const [roomSearchTerm, setRoomSearchTerm] = React.useState('');
  const [isAdmin, setIsAdmin] = React.useState(false);

  // 新增状态：会议设备和会议服务
  const [meetingDevices, setMeetingDevices] = React.useState([]);
  const [meetingServices, setMeetingServices] = React.useState([]);
  const [selectedDevices, setSelectedDevices] = React.useState([]);
  const [selectedServices, setSelectedServices] = React.useState([]);

  // 新增状态：每周重复功能
  const [isWeeklyRecurring, setIsWeeklyRecurring] = React.useState(false);
  const [recurringWeeks, setRecurringWeeks] = React.useState(4); // 默认重复4周

  // 获取本地时区偏移（分钟）
  const getTimezoneOffset = () => {
    return new Date().getTimezoneOffset();
  };

  // 将本地日期字符串转换为UTC时间戳（修正时区问题）
  const localDateToUTC = (dateString, timeStr) => {
    const [year, month, day] = dateString.split('-').map(Number);
    const [hour, minute] = timeStr.split(':').map(Number);

    // 创建本地日期时间对象
    const localDateTime = new Date(year, month - 1, day, hour, minute, 0, 0);

    // 直接获取时间戳（已包含时区信息）
    return localDateTime.getTime();
  };

  // 从UTC时间戳获取本地日期（修正显示问题）
  const utcToLocalDate = timestamp => {
    const date = new Date(timestamp);
    // 使用本地时区显示日期
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 从UTC时间戳获取本地时间
  const utcToLocalTime = timestamp => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 格式化日期显示（用于预览）
  const formatDisplayDate = dateString => {
    const [year, month, day] = dateString.split('-');
    return `${year}年${month}月${day}日`;
  };

  // 加载会议室数据 - 仅加载状态为 available 的会议室
  const loadMeetingRooms = async () => {
    try {
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'mc_meeting_room',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              status: {
                $eq: 'available'
              }
            }
          },
          select: {
            $master: true
          }
        }
      });
      if (result.records) {
        setMeetingRooms(result.records);
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

  // 加载会议设备数据 - 修复字段名错误
  const loadMeetingDevices = async () => {
    try {
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'mc_meeting_devices',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            device_id: true,
            // 使用正确的字段名
            device_name: true // 使用正确的字段名
          },
          orderBy: [{
            device_name: 'asc'
          }]
        }
      });
      console.log('会议设备数据加载结果:', result);
      if (result.records) {
        setMeetingDevices(result.records);
      } else {
        console.log('没有找到会议设备数据');
      }
    } catch (error) {
      console.error('加载会议设备数据失败:', error);
      toast({
        title: "错误",
        description: "加载会议设备数据失败: " + (error.message || '未知错误'),
        variant: "destructive"
      });
    }
  };

  // 加载会议服务数据 - 修复字段名错误
  const loadMeetingServices = async () => {
    try {
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'mc_meeting_services',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            service_id: true,
            // 使用正确的字段名
            service_name: true // 使用正确的字段名
          },
          orderBy: [{
            service_name: 'asc'
          }]
        }
      });
      console.log('会议服务数据加载结果:', result);
      if (result.records) {
        setMeetingServices(result.records);
      } else {
        console.log('没有找到会议服务数据');
      }
    } catch (error) {
      console.error('加载会议服务数据失败:', error);
      toast({
        title: "错误",
        description: "加载会议服务数据失败: " + (error.message || '未知错误'),
        variant: "destructive"
      });
    }
  };

  // 加载用户信息并检查管理员权限
  const loadUserInfo = async () => {
    try {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setCurrentUser(parsedUser);
        setApplicant(parsedUser.name || '');
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
          setApplicant(user.name || '');
          setIsAdmin(user.isAdmin || false);
          localStorage.setItem('currentUser', JSON.stringify({
            userId: user._id,
            name: user.name,
            username: user.username,
            isAdmin: user.isAdmin,
            department: user.department
          }));
        } else {
          setApplicant(props.$w.auth.currentUser.name || '');
          setIsAdmin(false);
        }
      }
    } catch (error) {
      console.error('加载用户信息失败:', error);
      if (props.$w.auth.currentUser) {
        setApplicant(props.$w.auth.currentUser.name || '');
        setIsAdmin(false);
      }
    }
  };

  // 加载预约数据
  const loadBookings = async () => {
    if (!selectedRoom || !selectedDate) return;
    try {
      // 使用修正的时区计算方法
      const [year, month, day] = selectedDate.split('-').map(Number);
      const localStartOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
      const localEndOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);

      // 转换为UTC时间戳
      const utcStartOfDay = localStartOfDay.getTime();
      const utcEndOfDay = localEndOfDay.getTime();
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'mc_meeting_booking',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              roomId: {
                $eq: selectedRoom
              },
              startTime: {
                $gte: utcStartOfDay
              },
              endTime: {
                $lte: utcEndOfDay
              },
              status: {
                $in: ['待审批', '已通过']
              }
            }
          },
          select: {
            $master: true
          },
          orderBy: [{
            startTime: 'asc'
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

  // 生成时间槽
  const generateTimeSlots = () => {
    const slots = [];
    const startHour = 8;
    const endHour = 18;
    const slotDuration = 30;
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeStr);
      }
    }
    return slots;
  };

  // 检查时间段是否可用
  const isTimeSlotAvailable = timeStr => {
    if (!selectedRoom || !selectedDate) return true;
    const utcTime = localDateToUTC(selectedDate, timeStr);
    return !bookings.some(booking => {
      return utcTime >= booking.startTime && utcTime < booking.endTime;
    });
  };

  // 获取时间段状态
  const getTimeSlotStatus = timeStr => {
    if (!selectedRoom || !selectedDate) return 'available';
    const utcTime = localDateToUTC(selectedDate, timeStr);
    const booking = bookings.find(b => {
      return utcTime >= b.startTime && utcTime < b.endTime;
    });
    if (booking) {
      return {
        status: 'occupied',
        topic: booking.topic,
        applicant: booking.applicant
      };
    }
    return {
      status: 'available'
    };
  };

  // 按楼层分组会议室
  const getGroupedRooms = () => {
    const grouped = {};
    meetingRooms.forEach(room => {
      const floor = room.location?.match(/(\d+)楼?/)?.[1] || '其他';
      if (!grouped[floor]) {
        grouped[floor] = [];
      }
      grouped[floor].push(room);
    });
    return grouped;
  };

  // 过滤会议室 - 仅显示状态为 available 的会议室
  const filteredRooms = meetingRooms.filter(room => room.status === 'available' && (room.name.toLowerCase().includes(roomSearchTerm.toLowerCase()) || room.location?.toLowerCase().includes(roomSearchTerm.toLowerCase())));

  // 跳转到管理员页面
  const handleAdminManagement = () => {
    $w.utils.navigateTo({
      pageId: 'meetingRoomManagementAdmin',
      params: {}
    });
  };

  // 跳转到申请管理页面
  const handleBookingAdmin = () => {
    $w.utils.navigateTo({
      pageId: 'meetingRoomManagement',
      params: {}
    });
  };

  // 处理设备选择 - 修复字段名错误
  const handleDeviceSelect = device_id => {
    setSelectedDevices(prev => {
      if (prev.includes(device_id)) {
        return prev.filter(id => id !== device_id);
      } else {
        return [...prev, device_id];
      }
    });
  };

  // 处理服务选择 - 修复字段名错误
  const handleServiceSelect = service_id => {
    setSelectedServices(prev => {
      if (prev.includes(service_id)) {
        return prev.filter(id => id !== service_id);
      } else {
        return [...prev, service_id];
      }
    });
  };

  // 获取设备名称 - 修复字段名错误
  const getDeviceName = device_id => {
    const device = meetingDevices.find(d => d.device_id === device_id); // 使用正确的字段名
    return device ? device.device_name : '未知设备';
  };

  // 获取服务名称 - 修复字段名错误
  const getServiceName = service_id => {
    const service = meetingServices.find(s => s.service_id === service_id); // 使用正确的字段名
    return service ? service.service_name : '未知服务';
  };

  // 初始化
  React.useEffect(() => {
    loadMeetingRooms();
    loadMeetingDevices();
    loadMeetingServices();
    setTimeSlots(generateTimeSlots());
    loadUserInfo();
  }, []);
  React.useEffect(() => {
    if (selectedRoom && selectedDate) {
      loadBookings();
    }
  }, [selectedRoom, selectedDate]);

  // 提交预定
  const handleSubmit = async () => {
    if (!selectedRoom || !selectedDate || !selectedStartTime || !selectedEndTime || !topic || !applicant || !attendeeCount) {
      toast({
        title: "请填写完整信息",
        description: "所有字段都是必填项",
        variant: "destructive"
      });
      return;
    }

    // 使用修正的时区转换方法
    const startTimeUTC = localDateToUTC(selectedDate, selectedStartTime);
    const endTimeUTC = localDateToUTC(selectedDate, selectedEndTime);
    if (startTimeUTC >= endTimeUTC) {
      toast({
        title: "时间选择错误",
        description: "结束时间必须晚于开始时间",
        variant: "destructive"
      });
      return;
    }
    const hasConflict = bookings.some(booking => {
      return startTimeUTC < booking.endTime && endTimeUTC > booking.startTime;
    });
    if (hasConflict) {
      toast({
        title: "时间冲突",
        description: "所选时间段已被占用，请选择其他时间",
        variant: "destructive"
      });
      return;
    }

    // 如果是每周重复，需要检查未来几周的时间冲突
    if (isWeeklyRecurring && isAdmin) {
      const [year, month, day] = selectedDate.split('-').map(Number);
      const baseDate = new Date(year, month - 1, day);
      const dayOfWeek = baseDate.getDay(); // 0-6, 0是周日

      for (let week = 1; week <= recurringWeeks; week++) {
        const nextDate = new Date(baseDate);
        nextDate.setDate(baseDate.getDate() + week * 7);
        const nextDateStr = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(nextDate.getDate()).padStart(2, '0')}`;
        const nextStartTimeUTC = localDateToUTC(nextDateStr, selectedStartTime);
        const nextEndTimeUTC = localDateToUTC(nextDateStr, selectedEndTime);

        // 检查该时间段是否已被占用
        try {
          const [nYear, nMonth, nDay] = nextDateStr.split('-').map(Number);
          const localStartOfDay = new Date(nYear, nMonth - 1, nDay, 0, 0, 0, 0);
          const localEndOfDay = new Date(nYear, nMonth - 1, nDay, 23, 59, 59, 999);
          const utcStartOfDay = localStartOfDay.getTime();
          const utcEndOfDay = localEndOfDay.getTime();
          const conflictResult = await $w.cloud.callDataSource({
            dataSourceName: 'mc_meeting_booking',
            methodName: 'wedaGetRecordsV2',
            params: {
              filter: {
                where: {
                  roomId: {
                    $eq: selectedRoom
                  },
                  startTime: {
                    $gte: utcStartOfDay
                  },
                  endTime: {
                    $lte: utcEndOfDay
                  },
                  status: {
                    $in: ['待审批', '已通过']
                  }
                }
              }
            }
          });
          if (conflictResult.records && conflictResult.records.length > 0) {
            const hasTimeConflict = conflictResult.records.some(booking => {
              return nextStartTimeUTC < booking.endTime && nextEndTimeUTC > booking.startTime;
            });
            if (hasTimeConflict) {
              toast({
                title: "时间冲突",
                description: `第${week}周（${nextDateStr}）的时间段已被占用，无法创建重复预订`,
                variant: "destructive"
              });
              return;
            }
          }
        } catch (error) {
          console.error('检查重复预订冲突失败:', error);
        }
      }
    }
    try {
      setIsLoading(true);

      // 构建重复预订信息
      let recurringInfo = null;
      if (isWeeklyRecurring && isAdmin) {
        recurringInfo = {
          isRecurring: true,
          pattern: 'weekly',
          recurringWeeks: recurringWeeks,
          baseDate: selectedDate,
          dayOfWeek: new Date(selectedDate).getDay()
        };
      }

      // 将重复信息存储在 description 中
      const finalDescription = recurringInfo ? JSON.stringify({
        originalDescription: description,
        recurringInfo: recurringInfo
      }) : description;

      // 每周重复的预订直接自动通过，无需审批
      const bookingStatus = isWeeklyRecurring && isAdmin ? '已通过' : '待审批';
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'mc_meeting_booking',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            roomId: selectedRoom,
            startTime: startTimeUTC,
            endTime: endTimeUTC,
            topic,
            applicant,
            attendeeCount: parseInt(attendeeCount),
            description: finalDescription,
            devices: selectedDevices,
            // 保存选择的设备ID数组
            services: selectedServices,
            // 保存选择的服务ID数组
            status: bookingStatus,
            createdAt: new Date().getTime()
          }
        }
      });
      if (result.id) {
        // 如果是重复预订，创建后续的预订记录
        if (isWeeklyRecurring && isAdmin) {
          const [year, month, day] = selectedDate.split('-').map(Number);
          const baseDate = new Date(year, month - 1, day);
          for (let week = 1; week <= recurringWeeks; week++) {
            const nextDate = new Date(baseDate);
            nextDate.setDate(baseDate.getDate() + week * 7);
            const nextDateStr = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(nextDate.getDate()).padStart(2, '0')}`;
            const nextStartTimeUTC = localDateToUTC(nextDateStr, selectedStartTime);
            const nextEndTimeUTC = localDateToUTC(nextDateStr, selectedEndTime);
            try {
              await $w.cloud.callDataSource({
                dataSourceName: 'mc_meeting_booking',
                methodName: 'wedaCreateV2',
                params: {
                  data: {
                    roomId: selectedRoom,
                    startTime: nextStartTimeUTC,
                    endTime: nextEndTimeUTC,
                    topic,
                    applicant,
                    attendeeCount: parseInt(attendeeCount),
                    description: finalDescription,
                    devices: selectedDevices,
                    services: selectedServices,
                    status: '已通过',
                    // 重复预订直接自动通过
                    createdAt: new Date().getTime()
                  }
                }
              });
            } catch (error) {
              console.error(`创建第${week}周重复预订失败:`, error);
            }
          }
          toast({
            title: "预定成功",
            description: `已创建${recurringWeeks + 1}个重复预订（本周及未来${recurringWeeks}周），所有预订已自动通过`
          });
        } else {
          toast({
            title: "预定成功",
            description: "会议室预定已提交，等待审批"
          });
        }

        // 重置表单
        setSelectedStartTime('');
        setSelectedEndTime('');
        setTopic('');
        setDescription('');
        setAttendeeCount('');
        setSelectedDevices([]);
        setSelectedServices([]);
        setIsWeeklyRecurring(false);
        setRecurringWeeks(4);
        loadBookings();
      }
    } catch (error) {
      console.error('预定失败:', error);
      toast({
        title: "预定失败",
        description: error.message || "预定过程中发生错误",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  const getSelectedRoom = () => {
    return meetingRooms.find(room => room._id === selectedRoom);
  };
  const handleBackToManagement = () => {
    $w.utils.navigateTo({
      pageId: 'meetingRoomManagement',
      params: {}
    });
  };
  return <div className="min-h-screen bg-gray-50" style={style}>
    <UserHeader $w={$w} showHomeButton={true} />

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <h1 className="text-3xl font-bold text-gray-900">会议室预定</h1>
        </div>

        {/* 管理员管理按钮 - 仅管理员可见 */}
        {isAdmin && <div className="flex gap-2">
          <Button onClick={handleBookingAdmin} className="flex items-center bg-green-600 hover:bg-green-700">
            <ClipboardList className="w-4 h-4 mr-2" />
            申请管理
          </Button>
          <Button onClick={handleAdminManagement} className="flex items-center bg-blue-600 hover:bg-blue-700">
            <Settings className="w-4 h-4 mr-2" />
            会议室管理
          </Button>
        </div>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 左侧：会议室选择 */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>选择会议室</CardTitle>
              <p className="text-sm text-gray-600">仅显示可用的会议室</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>搜索会议室</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input placeholder="搜索会议室名称或位置..." value={roomSearchTerm} onChange={e => setRoomSearchTerm(e.target.value)} className="pl-10" />
                  </div>
                </div>

                <div>
                  <Label>选择会议室</Label>
                  <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                    <SelectTrigger>
                      <SelectValue placeholder="请选择会议室">
                        {selectedRoom && getSelectedRoom() ? `${getSelectedRoom().name} - ${getSelectedRoom().location || '位置未设置'}` : "请选择会议室"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(getGroupedRooms()).map(([floor, rooms]) => <div key={floor}>
                        <div className="px-2 py-1 text-sm font-semibold text-gray-600 bg-gray-100">
                          {floor}楼
                        </div>
                        {rooms.filter(room => room.status === 'available' && (room.name.toLowerCase().includes(roomSearchTerm.toLowerCase()) || room.location?.toLowerCase().includes(roomSearchTerm.toLowerCase()))).map(room => <SelectItem key={room._id} value={room._id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{room.name}</span>
                            <span className="text-sm text-gray-500">{room.location || '位置未设置'}</span>
                            <span className="text-xs text-gray-400">{room.capacity}人</span>
                          </div>
                        </SelectItem>)}
                      </div>)}
                    </SelectContent>
                  </Select>
                </div>

                {getSelectedRoom() && <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">已选择会议室</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center">
                      <Building className="w-4 h-4 mr-2 text-blue-600" />
                      <span>{getSelectedRoom().name}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                      <span>位置：{getSelectedRoom().location || '位置未设置'}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2 text-blue-600" />
                      <span>容量：{getSelectedRoom().capacity}人</span>
                    </div>
                    {getSelectedRoom().equipment && <div className="flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-blue-600" />
                      <span>设备：{getSelectedRoom().equipment}</span>
                    </div>}
                  </div>
                </div>}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 中间：时间选择 */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>选择时间</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>选择日期</Label>
                  <Input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="w-full" />
                  {selectedDate && <p className="text-xs text-gray-500 mt-1">您选择的日期：{formatDisplayDate(selectedDate)}</p>}
                </div>

                {selectedRoom && selectedDate && <div className="space-y-4">
                  <div>
                    <Label>开始时间</Label>
                    <Select value={selectedStartTime} onValueChange={setSelectedStartTime}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择开始时间" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map(time => {
                          const status = getTimeSlotStatus(time);
                          return <SelectItem key={time} value={time} disabled={status.status === 'occupied'}>
                            {time}
                            {status.status === 'occupied' && ` (${status.topic})`}
                          </SelectItem>;
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>结束时间</Label>
                    <Select value={selectedEndTime} onValueChange={setSelectedEndTime}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择结束时间" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.filter(time => !selectedStartTime || time > selectedStartTime).map(time => {
                          const status = getTimeSlotStatus(time);
                          return <SelectItem key={time} value={time} disabled={status.status === 'occupied'}>
                            {time}
                            {status.status === 'occupied' && ` (${status.topic})`}
                          </SelectItem>;
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 每周重复功能 - 仅管理员可见 */}
                  {isAdmin && <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center justify-between mb-3">
                      <Label className="flex items-center cursor-pointer">
                        <Checkbox checked={isWeeklyRecurring} onCheckedChange={setIsWeeklyRecurring} className="mr-2" />
                        <span className="font-semibold text-purple-900">每周重复</span>
                      </Label>
                    </div>
                    
                    {isWeeklyRecurring && <div className="space-y-3">
                      <div>
                        <Label className="text-sm text-purple-800">重复周数</Label>
                        <Select value={String(recurringWeeks)} onValueChange={value => setRecurringWeeks(parseInt(value))}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2">2周</SelectItem>
                            <SelectItem value="4">4周</SelectItem>
                            <SelectItem value="8">8周</SelectItem>
                            <SelectItem value="12">12周</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <Alert className="bg-purple-100 border-purple-300">
                        <AlertCircle className="h-4 w-4 text-purple-800" />
                        <AlertTitle className="text-purple-900">重复预订说明</AlertTitle>
                        <AlertDescription className="text-purple-800 text-sm">
                          将自动创建本周及未来{recurringWeeks}周，每周{new Date(selectedDate).toLocaleDateString('zh-CN', {
                            weekday: 'long'
                          })}的相同时间段预订。
                          <br />
                          如需取消重复预订，请联系管理员删除相关记录。
                        </AlertDescription>
                      </Alert>
                    </div>}
                  </div>}

                  <div>
                    <Label>时间占用情况</Label>
                    <div className="grid grid-cols-4 gap-1 text-xs">
                      {timeSlots.map(time => {
                        const status = getTimeSlotStatus(time);
                        const isSelected = selectedStartTime === time || selectedEndTime === time;
                        return <div key={time} className={`p-1 text-center rounded ${status.status === 'occupied' ? 'bg-red-100 text-red-600' : isSelected ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                          {time}
                        </div>;
                      })}
                    </div>
                    <div className="flex space-x-4 mt-2 text-xs">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-100 rounded mr-1"></div>
                        <span>可用</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-red-100 rounded mr-1"></div>
                        <span>已占用</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-100 rounded mr-1"></div>
                        <span>已选择</span>
                      </div>
                    </div>
                  </div>

                  {bookings.length > 0 && <div>
                    <Label>已占用时间段</Label>
                    <div className="space-y-2">
                      {bookings.map(booking => {
                        return <div key={booking._id} className="text-sm bg-gray-100 p-2 rounded">
                          <div className="font-medium">{booking.topic}</div>
                          <div className="text-gray-600">
                            {utcToLocalTime(booking.startTime)} - {utcToLocalTime(booking.endTime)}
                            ({booking.applicant})
                          </div>
                        </div>;
                      })}
                    </div>
                  </div>}
                </div>}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右侧：预定信息 */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>预定信息</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>会议主题 *</Label>
                  <Input value={topic} onChange={e => setTopic(e.target.value)} placeholder="请输入会议主题" />
                </div>

                <div>
                  <Label>申请人 *</Label>
                  <Input value={applicant} onChange={e => setApplicant(e.target.value)} placeholder="请输入申请人姓名" disabled={!!applicant} className="bg-gray-100" />
                  {applicant && <p className="text-xs text-gray-500 mt-1">已自动填充当前登录用户姓名</p>}
                </div>

                <div>
                  <Label>参会人数 *</Label>
                  <Input type="number" value={attendeeCount} onChange={e => setAttendeeCount(e.target.value)} placeholder="请输入参会人数" min="1" max={getSelectedRoom()?.capacity || 100} />
                </div>

                {/* 新增：会议设备选择 */}
                <div>
                  <Label className="flex items-center">
                    <Monitor className="w-4 h-4 mr-2" />
                    会议设备选择
                  </Label>
                  <div className="space-y-2 mt-2 max-h-40 overflow-y-auto border rounded-md p-2">
                    {meetingDevices.map(device => <label key={device.device_id} className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50 cursor-pointer">
                      <Checkbox checked={selectedDevices.includes(device.device_id)} onCheckedChange={() => handleDeviceSelect(device.device_id)} />
                      <span className="text-sm">{device.device_name}</span>
                    </label>)}
                    {meetingDevices.length === 0 && <p className="text-sm text-gray-500 text-center py-2">暂无可用设备</p>}
                  </div>
                </div>

                {/* 新增：会议服务选择 */}
                <div>
                  <Label className="flex items-center">
                    <Coffee className="w-4 h-4 mr-2" />
                    会议服务选择
                  </Label>
                  <div className="space-y-2 mt-2 max-h-40 overflow-y-auto border rounded-md p-2">
                    {meetingServices.map(service => <label key={service.service_id} className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50 cursor-pointer">
                      <Checkbox checked={selectedServices.includes(service.service_id)} onCheckedChange={() => handleServiceSelect(service.service_id)} />
                      <span className="text-sm">{service.service_name}</span>
                    </label>)}
                    {meetingServices.length === 0 && <p className="text-sm text-gray-500 text-center py-2">暂无可用服务</p>}
                  </div>
                </div>

                <div>
                  <Label>会议描述</Label>
                  <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="请输入会议描述（选填）" />
                </div>

                <Button onClick={handleSubmit} disabled={isLoading || !selectedRoom || !selectedDate || !selectedStartTime || !selectedEndTime || !topic || !applicant || !attendeeCount} className="w-full">
                  {isLoading ? '提交中...' : '提交预定'}
                </Button>

                {selectedRoom && selectedDate && selectedStartTime && selectedEndTime && <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">预定预览</h4>
                  <div className="space-y-1 text-sm">
                    <div><strong>会议室：</strong>{getSelectedRoom()?.name}</div>
                    <div><strong>日期：</strong>{formatDisplayDate(selectedDate)}</div>
                    <div><strong>时间：</strong>{selectedStartTime} - {selectedEndTime}</div>
                    <div><strong>主题：</strong>{topic || '未填写'}</div>
                    <div><strong>申请人：</strong>{applicant || '未填写'}</div>
                    <div><strong>人数：</strong>{attendeeCount || '未填写'}人</div>
                    <div><strong>设备：</strong>
                      {selectedDevices.length > 0 ? selectedDevices.map(id => getDeviceName(id)).join(', ') : '无'}
                    </div>
                    <div><strong>服务：</strong>
                      {selectedServices.length > 0 ? selectedServices.map(id => getServiceName(id)).join(', ') : '无'}
                    </div>
                  </div>
                </div>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 管理员操作区域 - 仅管理员可见 */}
      {isAdmin && <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ClipboardList className="w-5 h-5 mr-2" />
              申请管理
            </CardTitle>
            <p className="text-sm text-gray-600">管理会议室预定申请和审批</p>
          </CardHeader>
          <CardContent>
            <Button onClick={handleBookingAdmin} className="w-full bg-green-600 hover:bg-green-700">
              <ClipboardList className="w-4 h-4 mr-2" />
              进入申请管理
            </Button>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              会议室管理
            </CardTitle>
            <p className="text-sm text-gray-600">管理会议室信息和状态</p>
          </CardHeader>
          <CardContent>
            <Button onClick={handleAdminManagement} className="w-full bg-blue-600 hover:bg-blue-700">
              <Settings className="w-4 h-4 mr-2" />
              进入会议室管理
            </Button>
          </CardContent>
        </Card>
      </div>}
    </div>
  </div>;
}