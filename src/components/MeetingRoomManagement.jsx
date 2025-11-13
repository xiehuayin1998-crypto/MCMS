// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, useToast, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
// @ts-ignore;
import { Plus, Edit, Trash2, MapPin, Users, Settings, Monitor } from 'lucide-react';

export function MeetingRoomManagement({
  rooms,
  services,
  devices,
  onRefresh
}) {
  const {
    toast
  } = useToast();
  const [showRoomDialog, setShowRoomDialog] = React.useState(false);
  const [selectedRoom, setSelectedRoom] = React.useState(null);
  const [roomForm, setRoomForm] = React.useState({
    name: '',
    location: '',
    capacity: '',
    status: '空闲中',
    services: [],
    devices: []
  });
  const statusColors = {
    '空闲中': 'bg-green-100 text-green-800',
    '使用中': 'bg-orange-100 text-orange-800',
    '停用中': 'bg-red-100 text-red-800'
  };
  const handleAddRoom = () => {
    setSelectedRoom(null);
    setRoomForm({
      name: '',
      location: '',
      capacity: '',
      status: '空闲中',
      services: [],
      devices: []
    });
    setShowRoomDialog(true);
  };
  const handleEditRoom = room => {
    setSelectedRoom(room);
    setRoomForm({
      name: room.name || '',
      location: room.location || '',
      capacity: room.capacity?.toString() || '',
      status: room.status || '空闲中',
      services: room.services || [],
      devices: room.devices || []
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
        ...roomForm,
        capacity: parseInt(roomForm.capacity)
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
                roomId: {
                  $eq: selectedRoom.roomId
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
      onRefresh();
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
                roomId: {
                  $eq: room.roomId
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
          onRefresh();
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
  return <div className="space-y-6">
      {/* 操作按钮 */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">会议室列表</h2>
        <Button onClick={handleAddRoom} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          新增会议室
        </Button>
      </div>

      {/* 会议室列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map(room => <Card key={room.roomId} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{room.name}</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[room.status]}`}>
                    {room.status}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={() => handleEditRoom(room)} className="text-blue-600 hover:text-blue-800 p-1 h-8 w-8">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button onClick={() => handleDeleteRoom(room)} className="text-red-600 hover:text-red-800 p-1 h-8 w-8">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                  {room.location}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 mr-2 text-gray-400" />
                  容纳人数：{room.capacity}人
                </div>
                {room.services && room.services.length > 0 && <div className="flex items-center text-sm text-gray-600">
                    <Settings className="w-4 h-4 mr-2 text-gray-400" />
                    服务：{room.services.join(', ')}
                  </div>}
                {room.devices && room.devices.length > 0 && <div className="flex items-center text-sm text-gray-600">
                    <Monitor className="w-4 h-4 mr-2 text-gray-400" />
                    设备：{room.devices.join(', ')}
                  </div>}
              </div>
            </CardContent>
          </Card>)}
      </div>

      {/* 新增/编辑会议室弹窗 */}
      <Dialog open={showRoomDialog} onOpenChange={setShowRoomDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedRoom ? '编辑会议室' : '新增会议室'}</DialogTitle>
            <DialogDescription>
              {selectedRoom ? '修改会议室信息' : '添加新的会议室'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="roomName">会议室名称 *</Label>
              <Input id="roomName" value={roomForm.name} onChange={e => handleFormChange('name', e.target.value)} placeholder="请输入会议室名称" />
            </div>
            <div>
              <Label htmlFor="roomLocation">地点 *</Label>
              <Input id="roomLocation" value={roomForm.location} onChange={e => handleFormChange('location', e.target.value)} placeholder="请输入会议室地点" />
            </div>
            <div>
              <Label htmlFor="roomCapacity">容纳人数 *</Label>
              <Input id="roomCapacity" type="number" value={roomForm.capacity} onChange={e => handleFormChange('capacity', e.target.value)} placeholder="请输入容纳人数" />
            </div>
            <div>
              <Label htmlFor="roomStatus">状态</Label>
              <Select value={roomForm.status} onValueChange={value => handleFormChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="空闲中">空闲中</SelectItem>
                  <SelectItem value="使用中">使用中</SelectItem>
                  <SelectItem value="停用中">停用中</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>会议服务</Label>
              <div className="space-y-2">
                {services.map(service => <label key={service.serviceId} className="flex items-center">
                    <input type="checkbox" className="mr-2" checked={roomForm.services.includes(service.name)} onChange={e => {
                  const newServices = e.target.checked ? [...roomForm.services, service.name] : roomForm.services.filter(s => s !== service.name);
                  handleFormChange('services', newServices);
                }} />
                    {service.name}
                  </label>)}
              </div>
            </div>
            <div>
              <Label>会议设备</Label>
              <div className="space-y-2">
                {devices.map(device => <label key={device.deviceId} className="flex items-center">
                    <input type="checkbox" className="mr-2" checked={roomForm.devices.includes(device.name)} onChange={e => {
                  const newDevices = e.target.checked ? [...roomForm.devices, device.name] : roomForm.devices.filter(d => d !== device.name);
                  handleFormChange('devices', newDevices);
                }} />
                    {device.name}
                  </label>)}
              </div>
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
    </div>;
}