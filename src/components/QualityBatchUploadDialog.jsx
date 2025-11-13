// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Button, Input, Progress } from '@/components/ui';
// @ts-ignore;
import { Upload, FileText, AlertCircle } from 'lucide-react';

export default function QualityBatchUploadDialog({
  open,
  onOpenChange,
  onSuccess,
  dataSourceName = 'mc_quality_system'
}) {
  const [files, setFiles] = useState([]);
  const [titlePrefix, setTitlePrefix] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [currentFileIndex, setCurrentFileIndex] = useState(0);

  // 处理文件选择
  const handleFileChange = e => {
    const selectedFiles = Array.from(e.target.files);
    const pdfFiles = selectedFiles.filter(file => {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      return fileExtension === 'pdf';
    });
    if (pdfFiles.length !== selectedFiles.length) {
      setError(`已过滤 ${selectedFiles.length - pdfFiles.length} 个非PDF文件，仅支持PDF格式`);
    } else {
      setError('');
    }
    setFiles(pdfFiles);
  };

  // 处理批量上传
  const handleBatchUpload = async () => {
    if (files.length === 0) {
      setError('请选择要上传的PDF文件');
      return;
    }
    try {
      setUploading(true);
      setUploadProgress(0);
      setError('');
      const cloudInstance = await window.$w.cloud.getCloudInstance();
      const uploadPromises = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setCurrentFileIndex(i);
        setUploadProgress(Math.round(i / files.length * 100));
        const uploadPromise = cloudInstance.uploadFile({
          cloudPath: `quality_system/batch/${Date.now()}_${i}_${file.name}`,
          filePath: file
        }).then(uploadResult => {
          const fileData = {
            fileName: file.name,
            title: titlePrefix ? `${titlePrefix}_${file.name.replace('.pdf', '')}` : file.name.replace('.pdf', ''),
            description: description.trim(),
            fileUrl: uploadResult.fileID,
            fileSize: file.size || 0,
            category: '质量体系',
            uploadedAt: Date.now(),
            updatedAt: Date.now()
          };
          return window.$w.cloud.callDataSource({
            dataSourceName: dataSourceName,
            methodName: 'wedaCreateV2',
            params: {
              data: fileData
            }
          });
        });
        uploadPromises.push(uploadPromise);
      }
      const results = await Promise.all(uploadPromises);
      setUploadProgress(100);

      // 重置表单
      setFiles([]);
      setTitlePrefix('');
      setDescription('');
      setUploadProgress(0);

      // 关闭对话框并通知父组件
      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('批量文件上传失败:', error);
      setError(error.message || '批量上传失败，请重试');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      setCurrentFileIndex(0);
    }
  };

  // 重置表单
  const handleClose = () => {
    setFiles([]);
    setTitlePrefix('');
    setDescription('');
    setError('');
    setUploadProgress(0);
    onOpenChange(false);
  };

  // 移除文件
  const removeFile = index => {
    setFiles(files.filter((_, i) => i !== index));
  };
  return <Dialog open={open} onOpenChange={handleClose}>
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle className="flex items-center">
          <Upload className="w-5 h-5 mr-2" />
          批量上传质量体系文件
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
            <input type="file" multiple accept=".pdf" onChange={handleFileChange} className="hidden" id="quality-batch-pdf-upload" />
            <label htmlFor="quality-batch-pdf-upload" className="cursor-pointer text-sm text-blue-600 hover:text-blue-800">
              点击选择多个PDF文件
            </label>
            <p className="text-xs text-gray-500 mt-1">仅支持PDF格式，可一次选择多个文件</p>
          </div>
        </div>

        {/* 已选择文件列表 */}
        {files.length > 0 && <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              已选择文件 ({files.length}个)
            </label>
            <div className="max-h-40 overflow-y-auto border rounded-md">
              {files.map((file, index) => <div key={index} className="flex items-center justify-between p-2 border-b last:border-b-0">
                  <span className="text-sm text-gray-700 truncate">{file.name}</span>
                  <button onClick={() => removeFile(index)} className="text-red-500 hover:text-red-700 text-sm" disabled={uploading}>
                    移除
                  </button>
                </div>)}
            </div>
          </div>}

        {/* 标题前缀 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            标题前缀（可选）
          </label>
          <Input value={titlePrefix} onChange={e => setTitlePrefix(e.target.value)} placeholder="批量上传的文件标题前缀" className="w-full" disabled={uploading} />
        </div>

        {/* 文件描述 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            文件描述（可选）
          </label>
          <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="批量上传的文件描述" className="w-full" disabled={uploading} />
        </div>

        {/* 上传进度条 */}
        {uploading && <div>
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>
                上传进度 ({currentFileIndex + 1}/{files.length})
              </span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="w-full" />
            {currentFileIndex < files.length && <p className="text-xs text-gray-500 mt-1">
                正在上传: {files[currentFileIndex]?.name}
              </p>}
          </div>}

        {/* 错误提示 */}
        {error && <div className="flex items-center text-sm text-red-600 bg-red-50 p-2 rounded">
            <AlertCircle className="w-4 h-4 mr-2" />
            {error}
          </div>}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={handleClose} disabled={uploading}>
          取消
        </Button>
        <Button onClick={handleBatchUpload} disabled={uploading || files.length === 0} className="flex items-center">
          {uploading ? <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              上传中... ({currentFileIndex + 1}/{files.length})
            </> : <>
              <Upload className="w-4 h-4 mr-2" />
              确认上传
            </>}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>;
}