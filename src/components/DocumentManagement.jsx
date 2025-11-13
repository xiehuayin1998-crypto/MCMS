// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, useToast, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
// @ts-ignore;
import { FileText, Download, Edit, Trash2, Plus, Upload, HardDrive, TrendingUp, File, Search, Filter, XCircle } from 'lucide-react';

export function DocumentManagement(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [documents, setDocuments] = React.useState([]);
  const [filteredDocuments, setFilteredDocuments] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [showUploadModal, setShowUploadModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [selectedDocument, setSelectedDocument] = React.useState(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [selectedFileType, setSelectedFileType] = React.useState('all');
  const [searchKeyword, setSearchKeyword] = React.useState('');

  // 模拟文件数据加载
  React.useEffect(() => {
    loadDocuments();
  }, []);

  // 筛选和搜索文件
  React.useEffect(() => {
    filterAndSearchDocuments();
  }, [documents, selectedFileType, searchKeyword]);
  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 模拟文件数据
      const mockDocuments = [{
        _id: '1',
        fileName: '公司规章制度.pdf',
        fileDesc: '公司规章制度文件，包含员工行为规范、考勤制度等内容',
        fileType: 'pdf',
        fileSize: 2.5,
        fileCategory: 'document',
        uploadDate: '2024-12-20',
        downloadCount: 156,
        uploader: '张三'
      }, {
        _id: '2',
        fileName: '年度工作总结.docx',
        fileDesc: '2024年度工作总结报告，包含各部门工作成果和未来规划',
        fileType: 'docx',
        fileSize: 1.8,
        fileCategory: 'document',
        uploadDate: '2024-12-18',
        downloadCount: 89,
        uploader: '李四'
      }, {
        _id: '3',
        fileName: '员工信息表.xlsx',
        fileDesc: '员工基本信息表格，包含联系方式、部门分配等信息',
        fileType: 'xlsx',
        fileSize: 0.856,
        fileCategory: 'document',
        uploadDate: '2024-12-15',
        downloadCount: 234,
        uploader: '王五'
      }, {
        _id: '4',
        fileName: '公司Logo.png',
        fileDesc: '公司官方Logo图片，用于各类文档和宣传材料',
        fileType: 'png',
        fileSize: 0.456,
        fileCategory: 'image',
        uploadDate: '2024-12-10',
        downloadCount: 67,
        uploader: '赵六'
      }, {
        _id: '5',
        fileName: '项目计划书.zip',
        fileDesc: '新项目计划书压缩包，包含详细的项目规划和时间安排',
        fileType: 'zip',
        fileSize: 3.2,
        fileCategory: 'other',
        uploadDate: '2024-12-08',
        downloadCount: 45,
        uploader: '钱七'
      }];
      setDocuments(mockDocuments);
    } catch (error) {
      toast({
        title: "加载失败",
        description: "加载文件数据失败",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  const filterAndSearchDocuments = () => {
    let filtered = [...documents];

    // 文件类型筛选
    if (selectedFileType !== 'all') {
      filtered = filtered.filter(doc => {
        if (selectedFileType === 'pdf') return doc.fileType === 'pdf';
        if (selectedFileType === 'doc') return ['docx', 'doc'].includes(doc.fileType);
        if (selectedFileType === 'excel') return ['xlsx', 'xls'].includes(doc.fileType);
        if (selectedFileType === 'image') return ['png', 'jpg', 'jpeg', 'gif'].includes(doc.fileType);
        if (selectedFileType === 'other') return !['pdf', 'docx', 'doc', 'xlsx', 'xls', 'png', 'jpg', 'jpeg', 'gif'].includes(doc.fileType);
        return true;
      });
    }

    // 搜索筛选
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase().trim();
      filtered = filtered.filter(doc => doc.fileName.toLowerCase().includes(keyword) || doc.fileDesc.toLowerCase().includes(keyword));
    }
    setFilteredDocuments(filtered);
  };
  const handleFileTypeChange = value => {
    setSelectedFileType(value);
  };
  const handleSearchChange = e => {
    setSearchKeyword(e.target.value);
  };
  const handleClearFilters = () => {
    setSelectedFileType('all');
    setSearchKeyword('');
  };
  const handleUploadDocument = () => {
    setShowUploadModal(true);
  };
  const handleEditDocument = document => {
    setSelectedDocument(document);
    setShowEditModal(true);
  };
  const handleDownloadDocument = document => {
    toast({
      title: "下载提示",
      description: `正在下载文件: ${document.fileName}`
    });
  };
  const handleDeleteDocument = async document => {
    if (!confirm(`确定要删除文件"${document.fileName}"吗？`)) {
      return;
    }
    try {
      // 模拟删除操作
      setDocuments(prev => prev.filter(doc => doc._id !== document._id));
      toast({
        title: "删除成功",
        description: "文件已删除"
      });
    } catch (error) {
      toast({
        title: "删除失败",
        description: error.message || "删除文件失败",
        variant: "destructive"
      });
    }
  };
  const handleCloseUploadModal = () => {
    setShowUploadModal(false);
    setUploadProgress(0);
  };
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedDocument(null);
  };
  const handleFileUpload = async fileData => {
    try {
      setIsUploading(true);

      // 模拟上传进度
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + Math.random() * 20;
        });
      }, 200);

      // 模拟上传延迟
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 创建新文件记录
      const newDocument = {
        _id: `doc_${Date.now()}`,
        fileName: fileData.fileName,
        fileDesc: fileData.fileDesc,
        fileType: fileData.fileName.split('.').pop().toLowerCase(),
        fileSize: Math.random() * 5,
        // 模拟文件大小
        fileCategory: fileData.fileCategory,
        uploadDate: new Date().toISOString().split('T')[0],
        downloadCount: 0,
        uploader: '当前用户'
      };
      setDocuments(prev => [newDocument, ...prev]);
      toast({
        title: "上传成功",
        description: "文件已成功上传"
      });
      handleCloseUploadModal();
    } catch (error) {
      toast({
        title: "上传失败",
        description: error.message || "上传文件失败",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };
  const handleSaveDocument = async fileData => {
    if (!selectedDocument) return;
    try {
      setIsSaving(true);

      // 模拟保存延迟
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 更新文件信息
      setDocuments(prev => prev.map(doc => doc._id === selectedDocument._id ? {
        ...doc,
        ...fileData
      } : doc));
      toast({
        title: "保存成功",
        description: "文件信息已更新"
      });
      handleCloseEditModal();
    } catch (error) {
      toast({
        title: "保存失败",
        description: error.message || "保存文件信息失败",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  const getFileIcon = fileType => {
    const iconMap = {
      pdf: {
        icon: FileText,
        color: 'text-red-600',
        bgColor: 'bg-red-100'
      },
      docx: {
        icon: FileText,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100'
      },
      doc: {
        icon: FileText,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100'
      },
      xlsx: {
        icon: FileText,
        color: 'text-green-600',
        bgColor: 'bg-green-100'
      },
      xls: {
        icon: FileText,
        color: 'text-green-600',
        bgColor: 'bg-green-100'
      },
      png: {
        icon: File,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100'
      },
      jpg: {
        icon: File,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100'
      },
      jpeg: {
        icon: File,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100'
      },
      gif: {
        icon: File,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100'
      },
      zip: {
        icon: File,
        color: 'text-gray-600',
        bgColor: 'bg-gray-100'
      },
      default: {
        icon: File,
        color: 'text-gray-600',
        bgColor: 'bg-gray-100'
      }
    };
    return iconMap[fileType] || iconMap.default;
  };
  const formatFileSize = size => {
    if (size >= 1) {
      return `${size.toFixed(1)}MB`;
    }
    return `${(size * 1024).toFixed(0)}KB`;
  };

  // 统计数据
  const stats = [{
    title: '文件总数',
    value: documents.length,
    icon: FileText,
    color: 'text-red-600',
    bgColor: 'bg-red-100'
  }, {
    title: '下载次数',
    value: documents.reduce((sum, doc) => sum + doc.downloadCount, 0),
    icon: Download,
    color: 'text-green-600',
    bgColor: 'bg-green-100'
  }, {
    title: '存储空间',
    value: formatFileSize(documents.reduce((sum, doc) => sum + doc.fileSize, 0)),
    icon: HardDrive,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100'
  }, {
    title: '本月上传',
    value: documents.filter(doc => doc.uploadDate.startsWith('2024-12')).length,
    icon: Upload,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100'
  }];
  return <div className="space-y-6">
          {/* 统计卡片 */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {stats.map(stat => {
        const Icon = stat.icon;
        return <Card key={stat.title}>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className={`p-3 rounded-full ${stat.bgColor} mr-4`}>
                        <Icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>;
      })}
          </div>

          {/* 筛选区域 */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                {/* 文件类型筛选 */}
                <div className="flex items-center space-x-2 flex-1">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <Select value={selectedFileType} onValueChange={handleFileTypeChange}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="选择文件类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部类型</SelectItem>
                      <SelectItem value="pdf">PDF文档</SelectItem>
                      <SelectItem value="doc">Word文档</SelectItem>
                      <SelectItem value="excel">Excel表格</SelectItem>
                      <SelectItem value="image">图片文件</SelectItem>
                      <SelectItem value="other">其他文件</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 搜索框 */}
                <div className="flex items-center space-x-2 flex-1">
                  <Search className="w-4 h-4 text-gray-500" />
                  <div className="relative flex-1">
                    <Input placeholder="搜索文件名或描述" value={searchKeyword} onChange={handleSearchChange} className="pr-8" />
                    {searchKeyword && <button onClick={() => setSearchKeyword('')} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        <XCircle className="w-4 h-4" />
                      </button>}
                  </div>
                </div>

                {/* 清除按钮 */}
                {(selectedFileType !== 'all' || searchKeyword) && <Button onClick={handleClearFilters} variant="outline" size="sm">
                    <XCircle className="w-4 h-4 mr-2" />
                    清除筛选
                  </Button>}
              </div>

              {/* 筛选结果统计 */}
              <div className="mt-3 text-sm text-gray-500">
                共找到 <span className="font-medium text-red-600">{filteredDocuments.length}</span> 个文件
                {(selectedFileType !== 'all' || searchKeyword) && <span className="ml-2">
                    (筛选条件: {selectedFileType !== 'all' ? `类型: ${selectedFileType}` : ''}
                    {selectedFileType !== 'all' && searchKeyword ? ', ' : ''}
                    {searchKeyword ? `搜索: ${searchKeyword}` : ''})
                  </span>}
              </div>
            </CardContent>
          </Card>

          {/* 文件列表 */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-red-600" />
                  文件列表
                </CardTitle>
                <Button onClick={handleUploadDocument} className="bg-red-600 hover:bg-red-700">
                  <Upload className="w-4 h-4 mr-2" />
                  上传文件
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                  <p className="mt-2 text-gray-500">加载中...</p>
                </div> : <div className="space-y-4">
                  {filteredDocuments.map(document => {
            const fileIconInfo = getFileIcon(document.fileType);
            const Icon = fileIconInfo.icon;
            return <div key={document._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all">
                        <div className="flex items-center">
                          <div className={`w-10 h-10 ${fileIconInfo.bgColor} rounded-lg flex items-center justify-center mr-4`}>
                            <Icon className={`w-5 h-5 ${fileIconInfo.color}`} />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{document.fileName}</h3>
                            <p className="text-sm text-gray-500">
                              {formatFileSize(document.fileSize)} • 上传于 {document.uploadDate} • 下载 {document.downloadCount} 次
                            </p>
                            {document.fileDesc && <p className="text-xs text-gray-400 mt-1">{document.fileDesc}</p>}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button onClick={() => handleDownloadDocument(document)} variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800">
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button onClick={() => handleEditDocument(document)} variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button onClick={() => handleDeleteDocument(document)} variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>;
          })}

                  {/* 空状态 */}
                  {filteredDocuments.length === 0 && <div className="text-center py-12">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">
                        {documents.length === 0 ? '暂无文件数据' : '没有找到匹配的文件'}
                      </p>
                      <p className="text-gray-400 text-sm mt-2">
                        {documents.length === 0 ? '点击"上传文件"按钮上传文件' : '请尝试调整筛选条件'}
                      </p>
                    </div>}
                </div>}
            </CardContent>
          </Card>

          {/* 文件上传弹窗 */}
          {showUploadModal && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center">
                      <Upload className="w-5 h-5 mr-2 text-red-600" />
                      上传文件
                    </h2>
                    <Button onClick={handleCloseUploadModal} variant="ghost" size="sm">
                      ✕
                    </Button>
                  </div>

                  <FileUploadForm onUpload={handleFileUpload} onCancel={handleCloseUploadModal} isUploading={isUploading} uploadProgress={uploadProgress} />
                </div>
              </div>
            </div>}

          {/* 文件编辑弹窗 */}
          {showEditModal && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center">
                      <Edit className="w-5 h-5 mr-2 text-red-600" />
                      编辑文件
                    </h2>
                    <Button onClick={handleCloseEditModal} variant="ghost" size="sm">
                      ✕
                    </Button>
                  </div>

                  <FileEditForm document={selectedDocument} onSave={handleSaveDocument} onCancel={handleCloseEditModal} isSaving={isSaving} />
                </div>
              </div>
            </div>}
        </div>;
}

// 文件上传表单组件
function FileUploadForm({
  onUpload,
  onCancel,
  isUploading,
  uploadProgress
}) {
  const [formData, setFormData] = React.useState({
    fileName: '',
    fileDesc: '',
    fileCategory: 'document'
  });
  const [selectedFile, setSelectedFile] = React.useState(null);
  const handleSubmit = e => {
    e.preventDefault();
    if (!selectedFile) {
      alert('请选择要上传的文件');
      return;
    }
    onUpload({
      ...formData,
      fileName: formData.fileName || selectedFile.name
    });
  };
  const handleFileSelect = e => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // 自动填充文件名（去除扩展名）
      const fileName = file.name.split('.').slice(0, -1).join('.');
      setFormData(prev => ({
        ...prev,
        fileName: fileName
      }));
    }
  };
  const handleChange = field => value => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  return <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">选择文件</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-red-500 transition-colors">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">点击选择文件或拖拽文件到此处</p>
              <p className="text-xs text-gray-500">支持 PDF、Word、Excel、图片等格式</p>
              <input type="file" className="hidden" id="fileInput" onChange={handleFileSelect} />
              <Button type="button" onClick={() => document.getElementById('fileInput').click()} variant="outline" size="sm" className="mt-2">
                选择文件
              </Button>
              {selectedFile && <p className="text-sm text-green-600 mt-2">
                  已选择: {selectedFile.name}
                </p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">文件名称</label>
            <Input value={formData.fileName} onChange={e => handleChange('fileName', e.target.value)} placeholder="请输入文件名称" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">文件描述</label>
            <textarea value={formData.fileDesc} onChange={e => handleChange('fileDesc', e.target.value)} placeholder="请输入文件描述" rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">文件分类</label>
            <Select onValueChange={value => handleChange('fileCategory', value)} defaultValue={formData.fileCategory}>
              <SelectTrigger>
                <SelectValue placeholder="请选择分类" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="document">文档资料</SelectItem>
                <SelectItem value="image">图片文件</SelectItem>
                <SelectItem value="video">视频文件</SelectItem>
                <SelectItem value="other">其他文件</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 上传进度 */}
          {isUploading && <div>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>上传进度</span>
              <span>{Math.round(uploadProgress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-red-600 h-2 rounded-full transition-all duration-300" style={{
          width: `${uploadProgress}%`
        }}></div>
            </div>
          </div>}

          {/* 按钮组 */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button type="button" onClick={onCancel} variant="outline">
              取消
            </Button>
            <Button type="submit" disabled={isUploading} className="bg-red-600 hover:bg-red-700">
              {isUploading ? '上传中...' : '上传文件'}
            </Button>
          </div>
        </form>;
}

// 文件编辑表单组件
function FileEditForm({
  document,
  onSave,
  onCancel,
  isSaving
}) {
  const [formData, setFormData] = React.useState({
    fileName: document?.fileName || '',
    fileDesc: document?.fileDesc || '',
    fileCategory: document?.fileCategory || 'document'
  });
  const handleSubmit = e => {
    e.preventDefault();
    onSave(formData);
  };
  const handleChange = field => value => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  return <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">文件名称</label>
            <Input value={formData.fileName} onChange={e => handleChange('fileName', e.target.value)} placeholder="请输入文件名称" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">文件描述</label>
            <textarea value={formData.fileDesc} onChange={e => handleChange('fileDesc', e.target.value)} placeholder="请输入文件描述" rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">文件分类</label>
            <Select onValueChange={value => handleChange('fileCategory', value)} defaultValue={formData.fileCategory}>
              <SelectTrigger>
                <SelectValue placeholder="请选择分类" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="document">文档资料</SelectItem>
                <SelectItem value="image">图片文件</SelectItem>
                <SelectItem value="video">视频文件</SelectItem>
                <SelectItem value="other">其他文件</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 按钮组 */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button type="button" onClick={onCancel} variant="outline">
              取消
            </Button>
            <Button type="submit" disabled={isSaving} className="bg-red-600 hover:bg-red-700">
              {isSaving ? '保存中...' : '保存修改'}
            </Button>
          </div>
        </form>;
}