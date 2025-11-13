// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, useToast, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Textarea, Label } from '@/components/ui';
// @ts-ignore;
import { Check, X, Clock, Calendar, Users, RefreshCw } from 'lucide-react';

export function MeetingRoomApproval({
  bookings,
  onApprove,
  onReject,
  onRefresh
}) {
  const {
    toast
  } = useToast();
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [filteredBookings, setFilteredBookings] = React.useState(bookings);
  const [showRejectDialog, setShowRejectDialog] = React.useState(false);
  const [selectedBooking, setSelectedBooking] = React.useState(null);
  const [rejectReason, setRejectReason] = React.useState('');
  React.useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredBookings(bookings);
    } else {
      setFilteredBookings(bookings.filter(booking => booking.status === statusFilter));
    }
  }, [bookings, statusFilter]);
  const statusColors = {
    '待审批': 'bg-yellow-100 text-yellow-800',
    '已通过': 'bg-green-100 text-green-800',
    '已拒绝': 'bg-red-100 text-red-800'
  };
  const formatDateTime = timestamp => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('zh-CN'),
      time: date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };
  const getStatusStats = () => {
    return {
      pending: bookings.filter(b => b.status === '待审批').length,
      approved: bookings.filter(b => b.status === '已通过').length,
      rejected: bookings.filter(b => b.status === '已拒绝').length,
      today: bookings.filter(b => {
        const bookingDate = new Date(b.startTime).toDateString();
        const today = new Date().toDateString();
        return bookingDate === today;
      }).length
    };
  };
  const stats = getStatusStats();
  const handleApprove = async booking => {
    try {
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'mc_meeting_booking',
        methodName: 'wedaUpdateV2',
        params: {
          data: {
            status: '已通过'
          },
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
          title: "审批成功",
          description: "预约已通过审批"
        });
        onRefresh();
      }
    } catch (error) {
      console.error('审批失败:', error);
      toast({
        title: "审批失败",
        description: error.message || "审批过程中发生错误",
        variant: "destructive"
      });
    }
  };
  const handleReject = booking => {
    setSelectedBooking(booking);
    setRejectReason('');
    setShowRejectDialog(true);
  };
  const handleConfirmReject = async () => {
    if (!rejectReason.trim()) {
      toast({
        title: "请输入拒绝原因",
        description: "拒绝原因不能为空",
        variant: "destructive"
      });
      return;
    }
    try {
      // 更新预约状态为已拒绝
      const updateResult = await $w.cloud.callDataSource({
        dataSourceName: 'mc_meeting_booking',
        methodName: 'wedaUpdateV2',
        params: {
          data: {
            status: '已拒绝'
          },
          filter: {
            where: {
              _id: {
                $eq: selectedBooking._id
              }
            }
          }
        }
      });

      // 创建拒绝信息记录，系统会自动生成refuseId
      const rejectResult = await $w.cloud.callDataSource({
        dataSourceName: 'mc_meeting_refused_information',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            bookingId: selectedBooking._id,
            reason: rejectReason,
            createdAt: new Date().getTime(),
            applicant: selectedBooking.applicant,
            topic: selectedBooking.topic,
            roomName: selectedBooking.roomName || '会议室',
            rejectTime: new Date().getTime()
          }
        }
      });
      if (updateResult.count > 0 && rejectResult.id) {
        toast({
          title: "拒绝成功",
          description: "预约已拒绝，原因已记录"
        });
        setShowRejectDialog(false);
        setRejectReason('');
        setSelectedBooking(null);
        onRefresh();
      }
    } catch (error) {
      console.error('拒绝失败:', error);
      toast({
        title: "拒绝失败",
        description: error.message || "拒绝过程中发生错误",
        variant: "destructive"
      });
    }
  };
  return <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
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
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Check className="w-6 h-6 text-green-600" />
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
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <X className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">已拒绝</p>
                <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">今日预约</p>
                <p className="text-2xl font-bold text-gray-900">{stats.today}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 筛选和操作 */}
      <div className="flex justify-between items-center">
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg">
          <option value="all">全部状态</option>
          <option value="待审批">待审批</option>
          <option value="已通过">已通过</option>
          <option value="已拒绝">已拒绝</option>
        </select>
        <Button onClick={onRefresh} className="bg-blue-600 hover:bg-blue-700">
          <RefreshCw className="w-4 h-4 mr-2" />
          刷新
        </Button>
      </div>

      {/* 预约申请列表 */}
      <Card>
        <CardHeader>
          <CardTitle>预约申请列表</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredBookings.length === 0 ? <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">暂无预约申请</h3>
              <p className="text-gray-600">当前没有需要处理的预约申请</p>
            </div> : <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">会议室</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">申请人</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">会议主题</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">时间</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">人数</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBookings.map(booking => {
                const {
                  date,
                  time
                } = formatDateTime(booking.startTime);
                const endTime = formatDateTime(booking.endTime).time;
                return <tr key={booking._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{booking.roomName || '会议室'}</div>
                          <div className="text-sm text-gray-500">{booking.roomLocation || ''}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{booking.applicant}</div>
                          <div className="text-sm text-gray-500">{booking.department || ''}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{booking.topic}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{date}</div>
                          <div className="text-sm text-gray-500">{time} - {endTime}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.attendeeCount}人</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[booking.status]}`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {booking.status === '待审批' && <div className="flex space-x-2">
                              <Button onClick={() => handleApprove(booking)} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-xs">
                                <Check className="w-3 h-3 mr-1" />
                                同意
                              </Button>
                              <Button onClick={() => handleReject(booking)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 text-xs">
                                <X className="w-3 h-3 mr-1" />
                                拒绝
                              </Button>
                            </div>}
                          {booking.status !== '待审批' && <span className="text-gray-500 text-sm">已处理</span>}
                        </td>
                      </tr>;
              })}
                </tbody>
              </table>
            </div>}
        </CardContent>
      </Card>

      {/* 拒绝原因弹窗 */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>拒绝预约申请</DialogTitle>
            <DialogDescription>
              请填写拒绝原因，申请人将收到通知
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rejectReason">拒绝原因 <span className="text-red-500">*</span></Label>
              <Textarea id="rejectReason" value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="请输入拒绝原因..." rows={4} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
            setShowRejectDialog(false);
            setRejectReason('');
            setSelectedBooking(null);
          }}>
              取消
            </Button>
            <Button onClick={handleConfirmReject} className="bg-red-600 hover:bg-red-700">
              确认拒绝
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>;
}