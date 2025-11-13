// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Dialog, DialogContent, DialogHeader, DialogTitle, Input, Button } from '@/components/ui';

export function RegulationEditDialog({
  open,
  onOpenChange,
  file,
  onSave
}) {
  const [formData, setFormData] = React.useState({
    name: '',
    url: ''
  });
  React.useEffect(() => {
    if (file) {
      setFormData({
        name: file.name || '',
        url: file.url || ''
      });
    }
  }, [file]);
  const handleSubmit = e => {
    e.preventDefault();
    if (!formData.name.trim()) {
      return;
    }
    onSave(formData);
  };
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>编辑文件信息</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Button type="submit">保存</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>;
}