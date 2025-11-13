// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Dialog, DialogContent, DialogHeader, DialogTitle, Input, Button, Alert, AlertDescription } from '@/components/ui';
// @ts-ignore;
import { Link } from 'lucide-react';

export function RegulationManualAddDialog({
  open,
  onOpenChange,
  onAdd
}) {
  const [formData, setFormData] = useState({
    name: '',
    url: ''
  });
  const handleSubmit = e => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.url.trim()) {
      return;
    }
    onAdd(formData);
    setFormData({
      name: '',
      url: ''
    });
  };
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>手动添加文件链接</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Alert>
            <AlertDescription>
              当云存储权限不足时，可以通过手动添加文件链接的方式上传文件。
            </AlertDescription>
          </Alert>
          
          <div>
            <label className="block text-sm font-medium mb-2">文件名</label>
            <Input value={formData.name} onChange={e => setFormData({
            ...formData,
            name: e.target.value
          })} placeholder="输入文件名" required />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">文件链接</label>
            <Input value={formData.url} onChange={e => setFormData({
            ...formData,
            url: e.target.value
          })} placeholder="输入文件URL" required />
            <p className="text-xs text-gray-500 mt-1">
              支持外部链接或云存储链接，例如：https://example.com/file.pdf
            </p>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => {
            onOpenChange(false);
            setFormData({
              name: '',
              url: ''
            });
          }}>
              取消
            </Button>
            <Button type="submit">添加</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>;
}