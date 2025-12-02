// @ts-ignore;
import React, { useState, useEffect, useCallback } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, useToast, Alert, AlertDescription, AlertTitle } from '@/components/ui';
// @ts-ignore;
import { Plus, Users, Calendar, MapPin, Settings, Clock, CheckCircle, XCircle, RefreshCw, Building, Phone, Mail } from 'lucide-react';

import { MeetingRoomEditDialog } from '@/components/MeetingRoomEditDialog';
import { MeetingRoomAddDialog } from '@/components/MeetingRoomAddDialog';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { UserHeader } from '@/components/UserHeader';
export default function MeetingRoomManagement(props) {
  const {
    $w
  } = props;
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [currentUserInfo, setCurrentUserInfo] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userLoading, setUserLoading] = useState(true);
  const {
    toast
  } = useToast();

  // 获取当前用户信息 - 参考会议室预定页面方式
  const loadUserInfo = useCallback(async () => {
    try {
      setUserLoading(true);

      // 检查本地存储
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setCurrentUserInfo(parsedUser);
        setIsAdmin(parsedUser.isAdmin || false);
        setUserLoading(false);
        return;
      }

      // 从数据源获取用户信息
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
          const userInfo = {
            userId: user._id,
            name: user.name,
            username: user.username,
            isAdmin: user.isAdmin || false,
            department: user.department,
            employee_number: user.employee_number
          };
          setCurrentUserInfo(userInfo);
          setIsAdmin(userInfo.isAdmin);
          localStorage.setItem('currentUser', JSON.stringify(userInfo));
        } else {
          // 使用基础信息
          const basicUserInfo = {
            userId: $w.auth.currentUser.userId,
            name: $w.auth.currentUser.name,
            username: $w.auth.currentUser.name,
            isAdmin: false,
            department: '',
            employee_number: ''
          };
          setCurrentUserInfo(basicUserInfo);
          setIsAdmin(false);
        }
      } else {
        setCurrentUserInfo(null);
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
      if ($w.auth.currentUser) {
        const basicUserInfo = {
          userId: $w.auth.currentUser.userId,
          name: $w.auth.currentUser.name,
          username: $w.auth.currentUser.name,
          isAdmin: false,
          department: '',
          employee_number: ''
        };
        setCurrentUserInfo(basicUserInfo);
        setIsAdmin(false);
      }
    } finally {
      setUserLoading(false);
    }
  }, [$w.auth.currentUser, $w.cloud]);

  // 加载会议室列表 - 使用真实数据源
  const loadMeetingRooms = useCallback(async () => {
    try {
      setLoading(true);
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'mc_meeting_room',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            $master: true
          },
          orderBy: [{
            createdAt: 'desc'
          }],
          getCount: true
        }
      });
      if (result.records) {
        setRooms(result.records);
      } else {
        setRooms([]);
      }
    } catch (error) {
      console.error('加载会议室失败:', error);
      toast({
        title: "加载失败",
        description: error.message || "无法加载会议室列表",
        variant: "destructive"
      });
      setRooms([]);
    } finally {
      setLoading(false);
    }
  }, [$w.cloud, toast]);

  // 初始化加载
  useEffect(() => {
    loadUserInfo();
    loadMeetingRooms();
  }, [loadUserInfo, loadMeetingRooms]);

  // 处理添加会议室
  const handleAddRoom = async roomData => {
    try {
      await $w.cloud.callDataSource({
        dataSourceName: 'mc_meeting_room',
        methodName: 'wedaCreateV2',
        params: {
          data: roomData
        }
      });
      toast({
        title: "添加成功",
        description: "会议室已成功添加"
      });
      await loadMeetingRooms();
    } catch (error) {
      toast({
        title: "添加失败",
        description: error.message || "无法添加会议室",
        variant: "destructive"
      });
    }
  };

  // 处理编辑会议室
  const handleEditRoom = async roomData => {
    try {
      await $w.cloud.callDataSource({
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
      toast({
        title: "更新成功",
        description: "会议室信息已更新"
      });
      await loadMeetingRooms();
    } catch (error) {
      toast({
        title: "更新失败",
        description: error.message || "无法更新会议室信息",
        variant: "destructive"
      });
    }
  };

  // 处理删除会议室
  const handleDeleteRoom = async () => {
    if (!selectedRoom) return;
    try {
      await $w.cloud.callDataSource({
        dataSourceName: 'mc_meeting_room',
        methodName: 'wedaDeleteV2',
        params: {
          filter: {
            where: {
              _id: {
                $eq: selectedRoom._id
              }
            }
          }
        }
      });
      toast({
        title: "删除成功",
        description: "会议室已删除"
      });
      await loadMeetingRooms();
    } catch (error) {
      toast({
        title: "删除失败",
        description: error.message || "无法删除会议室",
        variant: "destructive"
      });
    }
  };

  // 获取状态样式
  const getStatusBadge = status => {
    switch (status) {
      case 'available':
        return <Badge className="bg-green-100 text-green-800">可用</Badge>;
      case 'occupied':
        return <Badge className="bg-red-100 text-red-800">占用</Badge>;
      case 'maintenance':
        return <Badge className="bg-yellow-100 text-yellow-800">维护中</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">未知</Badge>;
    }
  };

  // 获取容量标签
  const getCapacityBadge = capacity => {
    if (capacity <= 5) return <Badge variant="outline" className="text-blue-600 border-blue-200">小型</Badge>;
    if (capacity <= 15) return <Badge variant="outline" className="text-green-600 border-green-200">中型</Badge>;
    return <Badge variant="outline" className="text-purple-600 border-purple-200">大型</Badge>;
  };
  return <div className="min-h-screen bg-gray-50">
    {/* 用户信息栏 */}
    <UserHeader $w={$w} showHomeButton={true} />

    {/* 页面内容 */}
    <div className="max-w-7xl mx-auto p-6">
      {/* 页面头部 */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
        <div className="flex items-center space-x-4">
          <div className="bg-white rounded-full p-3 shadow-lg">
            <Building className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              会议室管理
              {userLoading ? <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div> : isAdmin && <Badge variant="secondary" className="bg-green-100 text-green-800">管理员</Badge>}
            </h1>
            <p className="text-gray-600 mt-1">管理企业会议室信息和预约状态</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={loadMeetingRooms} className="flex items-center bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-300">
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新
          </Button>
          {isAdmin && <Button onClick={() => setAddDialogOpen(true)} className="flex items-center bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            添加会议室
          </Button>}
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">总会议室</p>
                <p className="text-3xl font-bold">{rooms.length}</p>
              </div>
              <Building className="w-12 h-12 opacity-20" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">可用会议室</p>
                <p className="text-3xl font-bold">{rooms.filter(r => r.status === 'available').length}</p>
              </div>
              <CheckCircle className="w-12 h-12 opacity-20" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100">维护中</p>
                <p className="text-3xl font-bold">{rooms.filter(r => r.status === 'maintenance').length}</p>
              </div>
              <Settings className="w-12 h-12 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 会议室列表 */}
      <Card className="shadow-xl border-0">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
          <CardTitle className="flex items-center justify-between">
            <span className="text-xl font-semibold text-gray-900">会议室列表</span>
            {loading && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6">
          {loading ? <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">正在加载会议室信息...</p>
            </div> : rooms.length === 0 ? <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg border-2 border-dashed border-gray-200">
              <Building className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">暂无会议室</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {isAdmin ? '点击右上角"添加会议室"按钮创建第一个会议室' : '请联系管理员添加会议室'}
              </p>
            </div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map(room => <Card key={room._id} className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg font-semibold text-gray-900">{room.name}</CardTitle>
                        <p className="text-sm text-gray-600">{room.location}</p>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        {getStatusBadge(room.status)}
                        {getCapacityBadge(room.capacity)}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-2" />
                        <span>容量: {room.capacity}人</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>位置: {room.location}</span>
                      </div>
                      
                      {room.equipment && room.equipment.length > 0 && <div className="flex items-start text-sm text-gray-600">
                          <Settings className="w-4 h-4 mr-2 mt-0.5" />
                          <div>
                            <span className="font-medium">设备:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {room.equipment.map((item, index) => <Badge key={index} variant="outline" className="text-xs">
                                  {item}
                                </Badge>)}
                            </div>
                          </div>
                        </div>}
                      
                      {room.contact && <div className="flex items-center text-sm text-gray-600">
                          <Phone className="w-4 h-4 mr-2" />
                          <span>联系: {room.contact}</span>
                        </div>}
                      
                      {room.description && <p className="text-sm text-gray-600 line-clamp-2">{room.description}</p>}
                      
                      {isAdmin && <div className="flex space-x-2 pt-3 border-t">
                          <Button variant="outline" size="sm" onClick={() => {
                      setSelectedRoom(room);
                      setEditDialogOpen(true);
                    }} className="flex-1">
                            编辑
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1 text-red-600 hover:text-red-700" onClick={() => {
                      setSelectedRoom(room);
                      setDeleteDialogOpen(true);
                    }}>
                            删除
                          </Button>
                        </div>}
                    </div>
                  </CardContent>
                </Card>)}
            </div>}
        </CardContent>
      </Card>

      {/* 对话框组件 */}
      <MeetingRoomAddDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} onSave={handleAddRoom} />
      
      <MeetingRoomEditDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} room={selectedRoom} onSave={handleEditRoom} />
      
      <DeleteConfirmDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onConfirm={handleDeleteRoom} title="确认删除" description={`确定要删除会议室"${selectedRoom?.name}"吗？此操作不可撤销。`} />
    </div>
  </div>;
}