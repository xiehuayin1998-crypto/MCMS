// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui';
// @ts-ignore;
import { Users, MapPin, Monitor, Wifi, Phone, Building } from 'lucide-react';

export default function MeetingRoomSelector({
  rooms,
  selectedRoom,
  onRoomSelect
}) {
  if (!rooms || rooms.length === 0) {
    return <div className="text-center py-8">
        <Building className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500">暂无可用会议室</p>
      </div>;
  }
  return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {rooms.map(room => <Card key={room._id} className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${selectedRoom === room._id ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:border-blue-300'}`} onClick={() => onRoomSelect(room._id)}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">{room.name}</CardTitle>
              <Badge variant={selectedRoom === room._id ? "default" : "outline"}>
                {selectedRoom === room._id ? "已选择" : "可选"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="w-4 h-4 mr-2" />
              <span>{room.location || '位置未设置'}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Users className="w-4 h-4 mr-2" />
              <span>容量：{room.capacity}人</span>
            </div>
            {room.equipment && <div className="flex items-start text-sm text-gray-600">
                <Monitor className="w-4 h-4 mr-2 mt-0.5" />
                <span className="flex-1">设备：{room.equipment}</span>
              </div>}
            <div className="flex items-center space-x-2 mt-3">
              {room.hasProjector && <Badge variant="secondary" className="text-xs">
                  <Monitor className="w-3 h-3 mr-1" />
                  投影仪
                </Badge>}
              {room.hasWifi && <Badge variant="secondary" className="text-xs">
                  <Wifi className="w-3 h-3 mr-1" />
                  WiFi
                </Badge>}
              {room.hasPhone && <Badge variant="secondary" className="text-xs">
                  <Phone className="w-3 h-3 mr-1" />
                  电话
                </Badge>}
            </div>
          </CardContent>
        </Card>)}
    </div>;
}