// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, Button, Input, Label, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, useToast } from '@/components/ui';
// @ts-ignore;
import { Plus, Building, Users, MapPin, Phone, Mail, User } from 'lucide-react';

export function MeetingRoomAddDialog({
  onRoomAdded
}) {
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: '',
    capacity: '',
    location: '',
    description: '',
    equipment: '',
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    status: 'available'
  });
  const {
    toast
  } = useToast();
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const handleSubmit = async e => {
    e.preventDefault();

    // 表单验证
    if (!formData.name.trim()) {
      toast({
        title: "错误",
        description: "会议室名称不能为空",
        variant: "destructive"
      });
      return;
    }
    if (!formData.capacity || parseInt(formData.capacity) <= 0) {
      toast({
        title: "错误",
        description: "容纳人数必须大于0",
        variant: "destructive"
      });
      return;
    }
    setIsLoading(true);
    try {
      // 使用 mc_meeting_room 数据模型创建新会议室
      const result = await window.$w.cloud.callDataSource({
        dataSourceName: 'mc_meeting_room',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            name: formData.name.trim(),
            capacity: parseInt(formData.capacity),
            location: formData.location.trim(),
            description: formData.description.trim(),
            equipment: formData.equipment.trim(),
            contactPerson: formData.contactPerson.trim(),
            contactPhone: formData.contactPhone.trim(),
            contactEmail: formData.contactEmail.trim(),
            status: formData.status,
            createdAt: Date.now(),
            // 使用时间戳格式
            updatedAt: Date.now() // 使用时间戳格式
          }
        }
      });
      if (result && result.id) {
        toast({
          title: "创建成功",
          description: `会议室 "${formData.name}" 已成功创建`
        });

        // 重置表单并关闭对话框
        setFormData({
          name: '',
          capacity: '',
          location: '',
          description: '',
          equipment: '',
          contactPerson: '',
          contactPhone: '',
          contactEmail: '',
          status: 'available'
        });
        setOpen(false);

        // 通知父组件刷新数据
        if (onRoomAdded) {
          onRoomAdded();
        }
      }
    } catch (error) {
      console.error('创建会议室失败:', error);
      toast({
        title: "创建失败",
        description: error.message || "创建会议室时发生错误",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleReset = () => {
    setFormData({
      name: '',
      capacity: '',
      location: '',
      description: '',
      equipment: '',
      contactPerson: '',
      contactPhone: '',
      contactEmail: '',
      status: 'available'
    });
  };
  return <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          新增会议室
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>新增会议室</DialogTitle>
          <DialogDescription>
            填写会议室详细信息，带 * 号为必填项
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 基本信息 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center">
                <Building className="w-4 h-4 mr-2" />
                会议室名称 *
              </Label>
              <Input id="name" value={formData.name} onChange={e => handleInputChange('name', e.target.value)} placeholder="请输入会议室名称" required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="capacity" className="flex items-center">
                <Users className="w-4 h-4 mr-2" />
                容纳人数 *
              </Label>
              <Input id="capacity" type="number" min="1" value={formData.capacity} onChange={e => handleInputChange('capacity', e.target.value)} placeholder="请输入容纳人数" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              会议室位置
            </Label>
            <Input id="location" value={formData.location} onChange={e => handleInputChange('location', e.target.value)} placeholder="请输入会议室位置" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">会议室描述</Label>
            <Textarea id="description" value={formData.description} onChange={e => handleInputChange('description', e.target.value)} placeholder="请输入会议室描述信息" rows={3} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="equipment">设备配置</Label>
            <Textarea id="equipment" value={formData.equipment} onChange={e => handleInputChange('equipment', e.target.value)} placeholder="请输入会议室设备配置，如：投影仪、音响、白板等" rows={2} />
          </div>

          {/* 联系信息 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactPerson" className="flex items-center">
                <User className="w-4 h-4 mr-2" />
                联系人
              </Label>
              <Input id="contactPerson" value={formData.contactPerson} onChange={e => handleInputChange('contactPerson', e.target.value)} placeholder="请输入联系人姓名" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPhone" className="flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                联系电话
              </Label>
              <Input id="contactPhone" type="tel" value={formData.contactPhone} onChange={e => handleInputChange('contactPhone', e.target.value)} placeholder="请输入联系电话" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactEmail" className="flex items-center">
              <Mail className="w-4 h-4 mr-2" />
              联系邮箱
            </Label>
            <Input id="contactEmail" type="email" value={formData.contactEmail} onChange={e => handleInputChange('contactEmail', e.target.value)} placeholder="请输入联系邮箱" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">会议室状态</Label>
            <Select value={formData.status} onValueChange={value => handleInputChange('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="选择会议室状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">可用</SelectItem>
                <SelectItem value="maintenance">维护中</SelectItem>
                <SelectItem value="unavailable">不可用</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={handleReset} disabled={isLoading}>
            重置
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? '创建中...' : '创建会议室'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>;
}