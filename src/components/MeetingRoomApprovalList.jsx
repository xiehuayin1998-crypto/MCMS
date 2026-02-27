// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, useToast, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui';
// @ts-ignore;
import { Clock as ClockIcon, CheckCircle, XCircle, Trash2, Eye, MessageSquare, Users, Building, Calendar, CheckCheck } from 'lucide-react';

// @ts-ignore;
import { BookingRejectDialog } from './BookingRejectDialog';
// @ts-ignore;
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
export function MeetingRoomApprovalList({
  $w,
  onRefresh
}) {
  const [bookings, setBookings] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [rejectingBooking, setRejectingBooking] = React.useState(null);
  const [deletingBooking, setDeletingBooking] = React.useState(null);
  const [viewingBooking, setViewingBooking] = React.useState(null);
  const [rooms, setRooms] = React.useState({});
  const [showBatchApproveDialog, setShowBatchApproveDialog] = React.useState(false);
  const [isBatchApproving, setIsBatchApproving] = React.useState(false);
  const {
    toast
  } = useToast();

  // 加载会议室信息
  const loadRooms = async () => {
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
      const roomMap = {};
      result.records.forEach(room => {
        roomMap[room._id] = room;
      });
      setRooms(roomMap);
    } catch (error) {
      console.error('加载会议室信息失败:', error);
    }
  };

  // 加载待审批的会议室申请
  const loadPendingBookings = async () => {
    try {
      setIsLoading(true);
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'mc_meeting_booking',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              status: {
                $eq: '待审批'
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
      }
    } catch (error) {
      console.error('加载待审批申请失败:', error);
      toast({
        title: "加载失败",
        description: "无法加载待审批的会议室申请",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 同意申请
  const handleApprove = async booking => {
    try {
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'mc_meeting_booking',
        methodName: 'wedaUpdateV2',
        params: {
          data: {
            status: '已通过',
            updatedAt: Date.now()
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
          description: `已同意会议室申请：${booking.topic}`
        });
        loadPendingBookings();
        onRefresh && onRefresh();
      }
    } catch (error) {
      console.error('同意申请失败:', error);
      toast({
        title: "审批失败",
        description: error.message || "同意申请时发生错误",
        variant: "destructive"
      });
    }
  };

  // 拒绝申请
  const handleReject = async (booking, reason) => {
    try {
      // 更新申请状态为已拒绝
      const updateResult = await $w.cloud.callDataSource({
        dataSourceName: 'mc_meeting_booking',
        methodName: 'wedaUpdateV2',
        params: {
          data: {
            status: '已拒绝',
            updatedAt: Date.now()
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
      if (updateResult.count > 0) {
        // 保存拒绝原因到 mc_meeting_refused_information
        await $w.cloud.callDataSource({
          dataSourceName: 'mc_meeting_refused_information',
          methodName: 'wedaCreateV2',
          params: {
            data: {
              bookingId: booking._id,
              reason: reason,
              rejectedAt: Date.now(),
              rejectedBy: $w.auth.currentUser?.name || '管理员'
            }
          }
        });
        toast({
          title: "拒绝成功",
          description: `已拒绝会议室申请：${booking.topic}`
        });
        loadPendingBookings();
        onRefresh && onRefresh();
      }
    } catch (error) {
      console.error('拒绝申请失败:', error);
      toast({
        title: "拒绝失败",
        description: error.message || "拒绝申请时发生错误",
        variant: "destructive"
      });
    }
  };

  // 删除申请
  const handleDelete = async booking => {
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
          title: "删除成功",
          description: `已删除会议室申请：${booking.topic}`
        });
        loadPendingBookings();
        onRefresh && onRefresh();
      }
    } catch (error) {
      console.error('删除申请失败:', error);
      toast({
        title: "删除失败",
        description: error.message || "删除申请时发生错误",
        variant: "destructive"
      });
    }
  };

  // 一键审批所有待审批申请
  const handleBatchApprove = async () => {
    if (bookings.length === 0) {
      toast({
        title: "无待审批申请",
        description: "当前没有待审批的会议室申请",
        variant: "destructive"
      });
      return;
    }
    setShowBatchApproveDialog(true);
  };

  // 确认批量审批
  const confirmBatchApprove = async () => {
    try {
      setIsBatchApproving(true);
      let successCount = 0;
      let failCount = 0;

      // 批量更新所有待审批申请
      for (const booking of bookings) {
        try {
          const result = await $w.cloud.callDataSource({
            dataSourceName: 'mc_meeting_booking',
            methodName: 'wedaUpdateV2',
            params: {
              data: {
                status: '已通过',
                updatedAt: Date.now()
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
            successCount++;
          } else {
            failCount++;
          }
        } catch (error) {
          console.error(`审批申请 ${booking.topic} 失败:`, error);
          failCount++;
        }
      }
      if (successCount > 0) {
        toast({
          title: "批量审批完成",
          description: `成功审批 ${successCount} 条申请${failCount > 0 ? `，失败 ${failCount} 条` : ''}`
        });
        loadPendingBookings();
        onRefresh && onRefresh();
      } else {
        toast({
          title: "批量审批失败",
          description: "所有申请审批失败，请重试",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('批量审批失败:', error);
      toast({
        title: "批量审批失败",
        description: error.message || "批量审批过程中发生错误",
        variant: "destructive"
      });
    } finally {
      setIsBatchApproving(false);
      setShowBatchApproveDialog(false);
    }
  };

  // 格式化时间
  const formatDateTime = timestamp => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  const formatDate = timestamp => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleDateString('zh-CN');
  };
  const formatTime = timestamp => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 获取会议室名称
  const getRoomName = roomId => {
    return rooms[roomId]?.name || '未指定会议室';
  };

  // 初始化加载
  React.useEffect(() => {
    loadRooms();
    loadPendingBookings();
  }, []);
  if (isLoading) {
    return <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">正在加载待审批申请...</p>
        </div>
      </div>;
  }
  return <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">会议室申请审批</h2>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={loadPendingBookings} className="flex items-center">
            <ClockIcon className="w-4 h-4 mr-2" />
            刷新
          </Button>
          <Button className="bg-green-600 hover:bg-green-700 flex items-center" onClick={handleBatchApprove} disabled={bookings.length === 0}>
            <CheckCheck className="w-4 h-4 mr-2" />
            一键审批
          </Button>
        </div>
      </div>

      {bookings.length === 0 ? <Card>
          <CardContent className="p-12 text-center">
            <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无待审批申请</h3>
            <p className="text-gray-600">当前没有待审批的会议室申请</p>
          </CardContent>
        </Card> : <Card>
          <CardHeader>
            <CardTitle>待审批申请列表</CardTitle>
            <p className="text-sm text-gray-600">共 {bookings.length} 条待审批申请</p>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>申请主题</TableHead>
                  <TableHead>申请人</TableHead>
                  <TableHead>会议室</TableHead>
                  <TableHead>参会人数</TableHead>
                  <TableHead>会议时间</TableHead>
                  <TableHead>申请时间</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map(booking => <TableRow key={booking._id}>
                    <TableCell className="font-medium max-w-xs">
                      <div className="truncate" title={booking.topic}>{booking.topic}</div>
                    </TableCell>
                    <TableCell>{booking.applicant}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Building className="w-4 h-4 mr-1" />
                        {getRoomName(booking.roomId)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {booking.attendeeCount}人
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDate(booking.startTime)}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <ClockIcon className="w-3 h-3 mr-1" />
                          {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {formatDateTime(booking.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => setViewingBooking(booking)} className="flex items-center">
                          <Eye className="w-3 h-3 mr-1" />
                          详情
                        </Button>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 flex items-center" onClick={() => handleApprove(booking)}>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          同意
                        </Button>
                        <Button size="sm" variant="outline" className="border-orange-500 text-orange-600 hover:bg-orange-50 flex items-center" onClick={() => setRejectingBooking(booking)}>
                          <XCircle className="w-3 h-3 mr-1" />
                          拒绝
                        </Button>
                        <Button size="sm" variant="outline" className="border-red-500 text-red-600 hover:bg-red-50 flex items-center" onClick={() => setDeletingBooking(booking)}>
                          <Trash2 className="w-3 h-3 mr-1" />
                          删除
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>)}
              </TableBody>
            </Table>
          </CardContent>
        </Card>}

      {/* 拒绝申请对话框 */}
      {rejectingBooking && <BookingRejectDialog open={!!rejectingBooking} onOpenChange={open => !open && setRejectingBooking(null)} booking={rejectingBooking} onReject={handleReject} />}
      
      {/* 删除确认对话框 */}
      {deletingBooking && <DeleteConfirmDialog open={!!deletingBooking} onOpenChange={open => !open && setDeletingBooking(null)} onConfirm={() => handleDelete(deletingBooking)} title="确认删除" description={`确定要删除申请 "${deletingBooking.topic}" 吗？此操作不可撤销。`} />}
      
      {/* 一键审批确认对话框 */}
      <Dialog open={showBatchApproveDialog} onOpenChange={setShowBatchApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <CheckCheck className="w-5 h-5 mr-2 text-green-600" />
              确认批量审批
            </DialogTitle>
            <DialogDescription>
              确定要将所有 <span className="font-bold text-green-600">{bookings.length}</span> 条待审批申请全部通过吗？
              <br />
              此操作将一次性审批所有待审批的会议室申请，无法撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBatchApproveDialog(false)} disabled={isBatchApproving}>
              取消
            </Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={confirmBatchApprove} disabled={isBatchApproving}>
              {isBatchApproving ? '审批中...' : '确认全部通过'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* 查看详情对话框 */}
      {viewingBooking && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">申请详情</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">申请主题</label>
                <p className="text-gray-900">{viewingBooking.topic}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">申请人</label>
                <p className="text-gray-900">{viewingBooking.applicant}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">会议室</label>
                <p className="text-gray-900">{getRoomName(viewingBooking.roomId)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">参会人数</label>
                <p className="text-gray-900">{viewingBooking.attendeeCount}人</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">会议时间</label>
                <p className="text-gray-900">{formatDateTime(viewingBooking.startTime)} - {formatDateTime(viewingBooking.endTime)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">申请时间</label>
                <p className="text-gray-900">{formatDateTime(viewingBooking.createdAt)}</p>
              </div>
              {viewingBooking.description && <div>
                  <label className="text-sm font-medium text-gray-700">申请描述</label>
                  <p className="text-gray-900">{viewingBooking.description}</p>
                </div>}
            </div>
            <div className="mt-6 flex justify-end">
              <Button variant="outline" onClick={() => setViewingBooking(null)}>
                关闭
              </Button>
            </div>
          </div>
        </div>}
    </div>;
}