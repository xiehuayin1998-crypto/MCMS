// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, useToast, Tabs, TabsContent, TabsList, TabsTrigger, Input, Label, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui';
// @ts-ignore;
import { Building, Users, MapPin, Phone, Mail, Edit, Trash2, Plus, RefreshCw, FileText, ArrowLeft, Monitor, Coffee, Settings } from 'lucide-react';

// @ts-ignore;
import { UserHeader } from '@/components/UserHeader';
// @ts-ignore;
import { MeetingRoomEditDialog } from '@/components/MeetingRoomEditDialog';
// @ts-ignore;
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
// @ts-ignore;
import { MeetingRoomAddDialog } from '@/components/MeetingRoomAddDialog';
// @ts-ignore;
import { MeetingRoomApprovalList } from '@/components/MeetingRoomApprovalList';
export default function MeetingRoomManagementAdmin(props) {
  const {
    $w,
    style
  } = props;
  const {
    toast
  } = useToast();
  const [rooms, setRooms] = React.useState([]);
  const [meetingServices, setMeetingServices] = React.useState([]);
  const [meetingDevices, setMeetingDevices] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [editingRoom, setEditingRoom] = React.useState(null);
  const [deletingRoom, setDeletingRoom] = React.useState(null);
  const [activeTab, setActiveTab] = React.useState('rooms'); // 'rooms', 'approvals', 'services', 'devices'

  // 服务和设备管理相关状态
  const [serviceDialogOpen, setServiceDialogOpen] = React.useState(false);
  const [deviceDialogOpen, setDeviceDialogOpen] = React.useState(false);
  const [editingService, setEditingService] = React.useState(null);
  const [editingDevice, setEditingDevice] = React.useState(null);
  const [newServiceName, setNewServiceName] = React.useState('');
  const [newDeviceName, setNewDeviceName] = React.useState('');

  // 加载会议室列表
  const loadRooms = async () => {
    try {
      setIsLoading(true);
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'mc_meeting_room',
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
        setRooms(result.records);
      }
    } catch (error) {
      console.error('加载会议室失败:', error);
      toast({
        title: "加载失败",
        description: "加载会议室数据失败",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 加载会议服务数据 - 使用正确的字段名
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
      toast({
        title: "加载失败",
        description: "加载会议服务数据失败",
        variant: "destructive"
      });
    }
  };

  // 加载会议设备数据 - 使用正确的字段名
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
      toast({
        title: "加载失败",
        description: "加载会议设备数据失败",
        variant: "destructive"
      });
    }
  };

  // 添加会议服务 - 使用正确的字段名
  const handleAddService = async () => {
    if (!newServiceName.trim()) {
      toast({
        title: "请输入服务名称",
        variant: "destructive"
      });
      return;
    }
    try {
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'mc_meeting_services',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            service_id: `SVC_${Date.now()}`,
            service_name: newServiceName.trim()
          }
        }
      });
      if (result.id) {
        toast({
          title: "添加成功",
          description: "会议服务已添加"
        });
        setNewServiceName('');
        setServiceDialogOpen(false);
        loadMeetingServices();
      }
    } catch (error) {
      console.error('添加会议服务失败:', error);
      toast({
        title: "添加失败",
        description: "添加会议服务失败",
        variant: "destructive"
      });
    }
  };

  // 添加会议设备 - 使用正确的字段名
  const handleAddDevice = async () => {
    if (!newDeviceName.trim()) {
      toast({
        title: "请输入设备名称",
        variant: "destructive"
      });
      return;
    }
    try {
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'mc_meeting_devices',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            device_id: `DEV_${Date.now()}`,
            device_name: newDeviceName.trim()
          }
        }
      });
      if (result.id) {
        toast({
          title: "添加成功",
          description: "会议设备已添加"
        });
        setNewDeviceName('');
        setDeviceDialogOpen(false);
        loadMeetingDevices();
      }
    } catch (error) {
      console.error('添加会议设备失败:', error);
      toast({
        title: "添加失败",
        description: "添加会议设备失败",
        variant: "destructive"
      });
    }
  };

  // 删除会议服务
  const handleDeleteService = async service => {
    try {
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'mc_meeting_services',
        methodName: 'wedaDeleteV2',
        params: {
          filter: {
            where: {
              _id: {
                $eq: service._id
              }
            }
          }
        }
      });
      if (result.count > 0) {
        toast({
          title: "删除成功",
          description: "会议服务已删除"
        });
        loadMeetingServices();
      }
    } catch (error) {
      console.error('删除会议服务失败:', error);
      toast({
        title: "删除失败",
        description: "删除会议服务失败",
        variant: "destructive"
      });
    }
  };

  // 删除会议设备
  const handleDeleteDevice = async device => {
    try {
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'mc_meeting_devices',
        methodName: 'wedaDeleteV2',
        params: {
          filter: {
            where: {
              _id: {
                $eq: device._id
              }
            }
          }
        }
      });
      if (result.count > 0) {
        toast({
          title: "删除成功",
          description: "会议设备已删除"
        });
        loadMeetingDevices();
      }
    } catch (error) {
      console.error('删除会议设备失败:', error);
      toast({
        title: "删除失败",
        description: "删除会议设备失败",
        variant: "destructive"
      });
    }
  };

  // 编辑会议服务 - 使用正确的字段名
  const handleEditService = async service => {
    if (!newServiceName.trim()) {
      toast({
        title: "请输入服务名称",
        variant: "destructive"
      });
      return;
    }
    try {
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'mc_meeting_services',
        methodName: 'wedaUpdateV2',
        params: {
          data: {
            service_name: newServiceName.trim()
          },
          filter: {
            where: {
              _id: {
                $eq: service._id
              }
            }
          }
        }
      });
      if (result.count > 0) {
        toast({
          title: "更新成功",
          description: "会议服务已更新"
        });
        setNewServiceName('');
        setEditingService(null);
        loadMeetingServices();
      }
    } catch (error) {
      console.error('更新会议服务失败:', error);
      toast({
        title: "更新失败",
        description: "更新会议服务失败",
        variant: "destructive"
      });
    }
  };

  // 编辑会议设备 - 使用正确的字段名
  const handleEditDevice = async device => {
    if (!newDeviceName.trim()) {
      toast({
        title: "请输入设备名称",
        variant: "destructive"
      });
      return;
    }
    try {
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'mc_meeting_devices',
        methodName: 'wedaUpdateV2',
        params: {
          data: {
            device_name: newDeviceName.trim()
          },
          filter: {
            where: {
              _id: {
                $eq: device._id
              }
            }
          }
        }
      });
      if (result.count > 0) {
        toast({
          title: "更新成功",
          description: "会议设备已更新"
        });
        setNewDeviceName('');
        setEditingDevice(null);
        loadMeetingDevices();
      }
    } catch (error) {
      console.error('更新会议设备失败:', error);
      toast({
        title: "更新失败",
        description: "更新会议设备失败",
        variant: "destructive"
      });
    }
  };

  // 删除会议室
  const handleDelete = async room => {
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
        loadRooms();
      }
    } catch (error) {
      console.error('删除会议室失败:', error);
      toast({
        title: "删除失败",
        description: "删除会议室失败",
        variant: "destructive"
      });
    }
  };

  // 获取状态样式
  const getStatusStyle = status => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'unavailable':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  const getStatusText = status => {
    switch (status) {
      case 'available':
        return '可使用';
      case 'maintenance':
        return '维护中';
      case 'unavailable':
        return '不可用';
      default:
        return status;
    }
  };

  // 返回会议室预定页面
  const handleBackToBooking = () => {
    $w.utils.navigateTo({
      pageId: 'meetingRoomBooking',
      params: {}
    });
  };

  // 打开服务对话框
  const openServiceDialog = (service = null) => {
    setEditingService(service);
    setNewServiceName(service ? service.service_name : '');
    setServiceDialogOpen(true);
  };

  // 打开设备对话框
  const openDeviceDialog = (device = null) => {
    setEditingDevice(device);
    setNewDeviceName(device ? device.device_name : '');
    setDeviceDialogOpen(true);
  };

  // 初始化加载
  React.useEffect(() => {
    loadRooms();
    loadMeetingServices();
    loadMeetingDevices();
  }, []);

  // 根据活动标签刷新数据
  React.useEffect(() => {
    if (activeTab === 'services') {
      loadMeetingServices();
    } else if (activeTab === 'devices') {
      loadMeetingDevices();
    } else if (activeTab === 'rooms') {
      loadRooms();
    }
  }, [activeTab]);
  return <div className="min-h-screen bg-gray-50" style={style}>
    <UserHeader $w={$w} showHomeButton={true} />
    
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 页面标题和标签切换 */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center">
          <Button variant="outline" onClick={handleBackToBooking} className="flex items-center mr-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回预定
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">会议室管理</h1>
            <p className="text-gray-600">管理公司所有会议室信息和申请审批</p>
          </div>
        </div>
        
        {/* 标签切换按钮 */}
        <div className="flex space-x-2">
          <Button variant={activeTab === 'rooms' ? 'default' : 'outline'} onClick={() => setActiveTab('rooms')}>
            <Building className="w-4 h-4 mr-2" />
            会议室管理
          </Button>
          <Button variant={activeTab === 'approvals' ? 'default' : 'outline'} onClick={() => setActiveTab('approvals')}>
            <FileText className="w-4 h-4 mr-2" />
            申请管理
          </Button>
          <Button variant={activeTab === 'services' ? 'default' : 'outline'} onClick={() => setActiveTab('services')}>
            <Coffee className="w-4 h-4 mr-2" />
            服务管理
          </Button>
          <Button variant={activeTab === 'devices' ? 'default' : 'outline'} onClick={() => setActiveTab('devices')}>
            <Monitor className="w-4 h-4 mr-2" />
            设备管理
          </Button>
        </div>
      </div>

      {/* 标签内容 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="hidden">
          <TabsTrigger value="rooms">会议室管理</TabsTrigger>
          <TabsTrigger value="approvals">申请管理</TabsTrigger>
          <TabsTrigger value="services">服务管理</TabsTrigger>
          <TabsTrigger value="devices">设备管理</TabsTrigger>
        </TabsList>

        {/* 会议室管理标签页 */}
        <TabsContent value="rooms" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">会议室列表</h2>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={loadRooms} className="flex items-center">
                <RefreshCw className="w-4 h-4 mr-2" />
                刷新
              </Button>
              <MeetingRoomAddDialog onRoomAdded={loadRooms} />
            </div>
          </div>

          {rooms.length === 0 ? <Card>
              <CardContent className="p-12 text-center">
                <Building className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">暂无会议室</h3>
                <p className="text-gray-600 mb-4">当前还没有添加任何会议室</p>
                <MeetingRoomAddDialog onRoomAdded={loadRooms} />
              </CardContent>
            </Card> : <Card>
              <CardHeader>
                <CardTitle>会议室列表</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>会议室名称</TableHead>
                      <TableHead>容纳人数</TableHead>
                      <TableHead>位置</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>联系人</TableHead>
                      <TableHead>联系电话</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rooms.map(room => <TableRow key={room._id}>
                        <TableCell className="font-medium">{room.name}</TableCell>
                        <TableCell>{room.capacity}人</TableCell>
                        <TableCell>{room.location || '-'}</TableCell>
                        <TableCell>
                          <Badge className={getStatusStyle(room.status)}>
                            {getStatusText(room.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>{room.contactPerson || '-'}</TableCell>
                        <TableCell>{room.contactPhone || '-'}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" onClick={() => setEditingRoom(room)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600" onClick={() => setDeletingRoom(room)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>)}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>}
        </TabsContent>

        {/* 申请管理标签页 */}
        <TabsContent value="approvals">
          <MeetingRoomApprovalList $w={$w} onRefresh={loadRooms} />
        </TabsContent>

        {/* 服务管理标签页 */}
        <TabsContent value="services" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">会议服务管理</h2>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={loadMeetingServices} className="flex items-center">
                <RefreshCw className="w-4 h-4 mr-2" />
                刷新
              </Button>
              <Button onClick={() => openServiceDialog()} className="flex items-center bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                添加服务
              </Button>
            </div>
          </div>

          {meetingServices.length === 0 ? <Card>
              <CardContent className="p-12 text-center">
                <Coffee className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">暂无会议服务</h3>
                <p className="text-gray-600 mb-4">当前还没有添加任何会议服务</p>
                <Button onClick={() => openServiceDialog()} className="flex items-center">
                  <Plus className="w-4 h-4 mr-2" />
                  添加服务
                </Button>
              </CardContent>
            </Card> : <Card>
              <CardHeader>
                <CardTitle>会议服务列表</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>服务ID</TableHead>
                      <TableHead>服务名称</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {meetingServices.map(service => <TableRow key={service._id}>
                        <TableCell className="font-mono text-sm">{service.service_id}</TableCell>
                        <TableCell className="font-medium">{service.service_name}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" onClick={() => openServiceDialog(service)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleDeleteService(service)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>)}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>}
        </TabsContent>

        {/* 设备管理标签页 */}
        <TabsContent value="devices" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">会议设备管理</h2>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={loadMeetingDevices} className="flex items-center">
                <RefreshCw className="w-4 h-4 mr-2" />
                刷新
              </Button>
              <Button onClick={() => openDeviceDialog()} className="flex items-center bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                添加设备
              </Button>
            </div>
          </div>

          {meetingDevices.length === 0 ? <Card>
              <CardContent className="p-12 text-center">
                <Monitor className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">暂无会议设备</h3>
                <p className="text-gray-600 mb-4">当前还没有添加任何会议设备</p>
                <Button onClick={() => openDeviceDialog()} className="flex items-center">
                  <Plus className="w-4 h-4 mr-2" />
                  添加设备
                </Button>
              </CardContent>
            </Card> : <Card>
              <CardHeader>
                <CardTitle>会议设备列表</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>设备ID</TableHead>
                      <TableHead>设备名称</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {meetingDevices.map(device => <TableRow key={device._id}>
                        <TableCell className="font-mono text-sm">{device.device_id}</TableCell>
                        <TableCell className="font-medium">{device.device_name}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" onClick={() => openDeviceDialog(device)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleDeleteDevice(device)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>)}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>}
        </TabsContent>
      </Tabs>

      {/* 服务管理对话框 */}
      <Dialog open={serviceDialogOpen} onOpenChange={setServiceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingService ? '编辑会议服务' : '添加会议服务'}</DialogTitle>
            <DialogDescription>
              {editingService ? '修改会议服务名称' : '输入新的会议服务名称'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="serviceName">服务名称</Label>
              <Input id="serviceName" value={newServiceName} onChange={e => setNewServiceName(e.target.value)} placeholder="请输入服务名称" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setServiceDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={editingService ? () => handleEditService(editingService) : handleAddService} disabled={!newServiceName.trim()}>
              {editingService ? '更新' : '添加'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 设备管理对话框 */}
      <Dialog open={deviceDialogOpen} onOpenChange={setDeviceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingDevice ? '编辑会议设备' : '添加会议设备'}</DialogTitle>
            <DialogDescription>
              {editingDevice ? '修改会议设备名称' : '输入新的会议设备名称'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="deviceName">设备名称</Label>
              <Input id="deviceName" value={newDeviceName} onChange={e => setNewDeviceName(e.target.value)} placeholder="请输入设备名称" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeviceDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={editingDevice ? () => handleEditDevice(editingDevice) : handleAddDevice} disabled={!newDeviceName.trim()}>
              {editingDevice ? '更新' : '添加'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑对话框 */}
      {editingRoom && <MeetingRoomEditDialog room={editingRoom} open={!!editingRoom} onOpenChange={open => !open && setEditingRoom(null)} onRoomUpdated={loadRooms} />}
      
      {/* 删除确认对话框 */}
      {deletingRoom && <DeleteConfirmDialog open={!!deletingRoom} onOpenChange={open => !open && setDeletingRoom(null)} onConfirm={() => handleDelete(deletingRoom)} title="确认删除" description={`确定要删除会议室 "${deletingRoom.name}" 吗？此操作不可撤销。`} />}
    </div>
  </div>;
}