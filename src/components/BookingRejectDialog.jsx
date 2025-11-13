// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Textarea, Label } from '@/components/ui';

export function BookingRejectDialog({
  open,
  onOpenChange,
  booking,
  onReject
}) {
  const [reason, setReason] = React.useState('');
  const handleReject = () => {
    if (!reason.trim()) {
      return;
    }
    onReject(reason);
    setReason('');
  };
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>拒绝会议室申请</DialogTitle>
          <DialogDescription>
            请填写拒绝原因，申请人将收到通知
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>会议主题</Label>
            <p className="text-sm text-gray-600">{booking?.topic}</p>
          </div>
          <div>
            <Label>申请人</Label>
            <p className="text-sm text-gray-600">{booking?.applicant}</p>
          </div>
          <div>
            <Label>拒绝原因 *</Label>
            <Textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="请输入拒绝原因..." rows={4} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleReject} disabled={!reason.trim()}>
            确认拒绝
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>;
}