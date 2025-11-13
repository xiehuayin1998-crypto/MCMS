// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Button, Input, Progress } from '@/components/ui';
// @ts-ignore;
import { Upload, FileText } from 'lucide-react';

export default function QualityUploadDialog({
  open,
  onOpenChange,
  onSuccess,
  dataSourceName = 'mc_quality_system'
}) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');

  // 处理文件选择
  const handleFileChange = e => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // 检查文件类型是否为PDF
      const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
      if (fileExtension !== 'pdf') {
        setError('请上传PDF格式的文件');
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError('');
      // 自动填充标题
      if (!title) {
        setTitle(selectedFile.name.replace('.pdf', ''));
      }
    }
  };

  // 处理文件上传
  const handleUpload = async () => {
    if (!file) {
      setError('请选择要上传的文件');
      return;
    }
    if (!title.trim()) {
      setError('请输入文件标题');
      return;
    }
    try {
      setUploading(true);
      setUploadProgress(0);
      setError('');

      // 获取云开发实例
      const cloudInstance = await window.$w.cloud.getCloudInstance();

      // 模拟进度更新
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // 上传文件到云存储
      const uploadResult = await cloudInstance.uploadFile({
        cloudPath: `quality_system/${Date.now()}_${file.name}`,
        filePath: file
      });
      clearInterval(progressInterval);
      setUploadProgress(100);

      // 计算文件大小
      const fileSize = file.size || 0;

      // 保存文件信息到数据模型
      const fileData = {
        fileName: file.name,
        title: title.trim(),
        description: description.trim(),
        fileUrl: uploadResult.fileID,
        fileSize: fileSize,
        category: '质量体系',
        uploadedAt: Date.now(),
        updatedAt: Date.now()
      };
      const result = await window.$w.cloud.callDataSource({
        dataSourceName: dataSourceName,
        methodName: 'wedaCreateV2',
        params: {
          data: fileData
        }
      });
      if (result && result.id) {
        // 重置表单
        setFile(null);
        setTitle('');
        setDescription('');
        setUploadProgress(0);

        // 关闭对话框并通知父组件
        onOpenChange(false);
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      console.error('文件上传失败:', error);
      setError(error.message || '文件上传失败，请重试');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // 重置表单
  const handleClose = () => {
    setFile(null);
    setTitle('');
    setDescription('');
    setError('');
    setUploadProgress(0);
    onOpenChange(false);
  };
  return <Dialog open={open} onOpenChange={handleClose}>
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center">
          <Upload className="w-5 h-5 mr-2" />
          上传质量体系文件
        </DialogTitle>
      </DialogHeader>
      
      <div className="space-y-4 py-4">
        {/* 文件选择区域 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            选择PDF文件
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
            <FileText className="w-12 h-12 mx-auto text-gray-400 mb-2" />
            <input type="file" accept=".pdf" onChange={handleFileChange} className="hidden" id="quality-pdf-upload" />
            <label htmlFor="quality-pdf-upload" className="cursor-pointer text-sm text-blue-600 hover:text-blue-800">
              点击选择PDF文件
            </label>
            <p className="text-xs text-gray-500 mt-1">仅支持PDF格式</p>
          </div>
          {file && <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
              <span className="text-blue-700">已选择: {file.name}</span>
            </div>}
        </div>

        {/* 文件标题 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            文件标题 *
          </label>
          <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="请输入文件标题" className="w-full" disabled={uploading} />
        </div>

        {/* 文件描述 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            文件描述（可选）
          </label>
          <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="请输入文件描述" className="w-full" disabled={uploading} />
        </div>

        {/* 上传进度条 */}
        {uploading && <div>
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>上传进度</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="w-full" />
          </div>}

        {/* 错误提示 */}
        {error && <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
            {error}
          </div>}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={handleClose} disabled={uploading}>
          取消
        </Button>
        <Button onClick={handleUpload} disabled={uploading || !file || !title.trim()} className="flex items-center">
          {uploading ? <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              上传中...
            </> : <>
              <Upload className="w-4 h-4 mr-2" />
              确认上传
            </>}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>;
}