// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, useToast, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Badge, Alert, AlertDescription, AlertTitle, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui';
// @ts-ignore;
import { Plus, Search, Filter, RefreshCw, FileText, AlertCircle, Shield, Home, Edit, Trash2, Download, Calendar, User, MoreVertical, Pencil, ExternalLink, Upload, Eye, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

// @ts-ignore;
import { UserHeader } from '@/components/UserHeader';
// @ts-ignore;
import PdfPreviewDialog from '@/components/PdfPreviewDialog';
// @ts-ignore;
import QualityUploadDialog from '@/components/QualityUploadDialog';
// @ts-ignore;
import QualityBatchUploadDialog from '@/components/QualityBatchUploadDialog';
export default function QualitySystem(props) {
  const {
    $w,
    style
  } = props;
  const {
    toast
  } = useToast();
  const [regulations, setRegulations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showBatchUploadDialog, setShowBatchUploadDialog] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingPermission, setCheckingPermission] = useState(true);
  const [showEditMenu, setShowEditMenu] = useState(null);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [renamingFile, setRenamingFile] = useState(null);
  const [newFileName, setNewFileName] = useState('');
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState(null);

  // 分页相关状态
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20); // 每页显示20条
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // 加载用户权限
  useEffect(() => {
    checkUserPermission();
  }, []);

  // 加载质量体系数据 - 使用分页
  useEffect(() => {
    if (!checkingPermission) {
      loadRegulations();
    }
  }, [checkingPermission, currentPage, selectedCategory, searchTerm]);

  // 检查用户权限
  const checkUserPermission = () => {
    try {
      setCheckingPermission(true);
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        const userInfo = JSON.parse(storedUser);
        setIsAdmin(userInfo.isAdmin || false);
      } else {
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('检查权限失败:', error);
      setIsAdmin(false);
    } finally {
      setCheckingPermission(false);
    }
  };

  // 加载质量体系数据 - 分页版本
  const loadRegulations = async () => {
    try {
      setLoading(true);

      // 构建查询条件
      let filter = {
        where: {}
      };

      // 添加搜索条件
      if (searchTerm) {
        filter.where.$or = [{
          fileName: {
            $search: searchTerm
          }
        }, {
          title: {
            $search: searchTerm
          }
        }];
      }
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'mc_quality_system',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            $master: true
          },
          orderBy: [{
            uploadedAt: 'desc'
          }],
          pageSize: pageSize,
          pageNumber: currentPage,
          getCount: true,
          filter: filter
        }
      });
      if (result && result.records) {
        setRegulations(result.records);
        setTotalCount(result.total || 0);
        setTotalPages(Math.ceil((result.total || 0) / pageSize));
      }
    } catch (error) {
      console.error('加载质量体系数据失败:', error);
      toast({
        title: "加载失败",
        description: "无法加载质量体系数据",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // 处理文件预览 - 仅查看功能
  const handleFilePreview = async regulation => {
    try {
      if (!regulation.fileUrl) {
        toast({
          title: "文件链接无效",
          description: "无法打开文件",
          variant: "destructive"
        });
        return;
      }

      // 获取云存储临时访问链接
      const cloudInstance = await $w.cloud.getCloudInstance();
      const tempUrlResult = await cloudInstance.getTempFileURL({
        fileList: [regulation.fileUrl]
      });
      if (tempUrlResult.fileList && tempUrlResult.fileList[0]) {
        const tempUrl = tempUrlResult.fileList[0].tempFileURL;

        // 检查文件类型
        const fileExtension = regulation.fileName?.split('.').pop()?.toLowerCase();
        const isPdf = fileExtension === 'pdf';
        if (isPdf) {
          // PDF文件使用预览对话框
          setSelectedPdf({
            url: tempUrl,
            title: regulation.fileName || '文件预览',
            fileName: regulation.fileName
          });
          setShowPdfPreview(true);
        } else {
          // 非PDF文件直接在新窗口打开预览
          window.open(tempUrl, '_blank');
        }
      } else {
        toast({
          title: "获取文件失败",
          description: "无法获取文件访问链接",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('打开文件失败:', error);
      toast({
        title: "打开失败",
        description: "无法打开文件",
        variant: "destructive"
      });
    }
  };

  // 处理删除
  const handleDelete = async regulation => {
    if (!isAdmin) {
      toast({
        title: "权限不足",
        description: "您没有权限删除质量体系文件",
        variant: "destructive"
      });
      return;
    }
    if (window.confirm(`确定要删除《${regulation.fileName}》吗？此操作不可恢复。`)) {
      try {
        await $w.cloud.callDataSource({
          dataSourceName: 'mc_quality_system',
          methodName: 'wedaDeleteV2',
          params: {
            filter: {
              where: {
                _id: {
                  $eq: regulation._id
                }
              }
            }
          }
        });
        toast({
          title: "删除成功",
          description: "质量体系文件已删除"
        });
        loadRegulations();
        setShowEditMenu(null);
      } catch (error) {
        console.error('删除失败:', error);
        toast({
          title: "删除失败",
          description: error.message || "无法删除质量体系文件",
          variant: "destructive"
        });
      }
    }
  };

  // 处理重命名
  const handleRename = async () => {
    if (!renamingFile || !newFileName.trim()) {
      toast({
        title: "信息不完整",
        description: "请输入新的文件名",
        variant: "destructive"
      });
      return;
    }
    try {
      await $w.cloud.callDataSource({
        dataSourceName: 'mc_quality_system',
        methodName: 'wedaUpdateV2',
        params: {
          data: {
            fileName: newFileName.trim(),
            updatedAt: Date.now()
          },
          filter: {
            where: {
              _id: {
                $eq: renamingFile._id
              }
            }
          }
        }
      });
      toast({
        title: "重命名成功",
        description: "文件名已更新"
      });
      setShowRenameDialog(false);
      setRenamingFile(null);
      setNewFileName('');
      loadRegulations();
      setShowEditMenu(null);
    } catch (error) {
      console.error('重命名失败', error);
      toast({
        title: "重命名失败",
        description: error.message || "无法重命名文件",
        variant: "destructive"
      });
    }
  };

  // 分页控制函数
  const handlePageChange = page => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  const handleFirstPage = () => {
    setCurrentPage(1);
  };
  const handleLastPage = () => {
    setCurrentPage(totalPages);
  };

  // 生成分页按钮
  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // 首页和上一页
    buttons.push(<Button key="first" variant="outline" size="sm" onClick={handleFirstPage} disabled={currentPage === 1} className="h-8 w-8 p-0">
        <ChevronsLeft className="h-4 w-4" />
      </Button>);
    buttons.push(<Button key="prev" variant="outline" size="sm" onClick={handlePreviousPage} disabled={currentPage === 1} className="h-8 w-8 p-0">
        <ChevronLeft className="h-4 w-4" />
      </Button>);

    // 页码按钮
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(<Button key={i} variant={currentPage === i ? "default" : "outline"} size="sm" onClick={() => handlePageChange(i)} className="h-8 min-w-[2rem] px-2">
          {i}
        </Button>);
    }

    // 下一页和末页
    buttons.push(<Button key="next" variant="outline" size="sm" onClick={handleNextPage} disabled={currentPage === totalPages} className="h-8 w-8 p-0">
        <ChevronRight className="h-4 w-4" />
      </Button>);
    buttons.push(<Button key="last" variant="outline" size="sm" onClick={handleLastPage} disabled={currentPage === totalPages} className="h-8 w-8 p-0">
        <ChevronsRight className="h-4 w-4" />
      </Button>);
    return buttons;
  };

  // 返回首页
  const handleBackToHome = () => {
    $w.utils.navigateTo({
      pageId: 'home',
      params: {}
    });
  };

  // 格式化日期
  const formatDate = timestamp => {
    if (!timestamp) return '未知';
    return new Date(timestamp).toLocaleDateString('zh-CN');
  };
  if (checkingPermission) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">正在检查权限...</span>
      </div>;
  }
  return <div className="min-h-screen bg-gray-50 p-4" style={style}>
      <UserHeader $w={$w} showHomeButton={true} />
      
      <div className="max-w-6xl mx-auto mt-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <FileText className="w-8 h-8 mr-3 text-blue-600" />
              质量体系管理
            </h1>
            <p className="text-gray-600 mt-2">管理公司质量体系文件</p>
          </div>
          <Button variant="outline" onClick={handleBackToHome} className="flex items-center">
            <Home className="w-4 h-4 mr-2" />
            返回首页
          </Button>
        </div>

        {/* 权限提示 */}
        {!isAdmin && <Alert className="mb-4">
            <Shield className="h-4 w-4" />
            <AlertTitle>权限提示</AlertTitle>
            <AlertDescription>
              您当前以普通用户身份查看，仅支持查看功能。如需上传、编辑或删除质量体系文件，请联系管理员。
            </AlertDescription>
          </Alert>}

        {/* 操作栏 */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input type="text" placeholder="搜索文件名..." value={searchTerm} onChange={e => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // 搜索时重置到第一页
                }} className="pl-10 w-64" />
                </div>
                
                <Select value={selectedCategory} onValueChange={value => {
                setSelectedCategory(value);
                setCurrentPage(1); // 切换分类时重置到第一页
              }}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="全部分类" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部分类</SelectItem>
                    <SelectItem value="质量体系">质量体系</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Button variant="outline" onClick={() => {
                setCurrentPage(1);
                loadRegulations();
              }} disabled={loading}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  刷新
                </Button>
                
                {isAdmin && <>
                    <Button onClick={() => setShowUploadDialog(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      上传文件
                    </Button>
                    <Button onClick={() => setShowBatchUploadDialog(true)} variant="secondary">
                      <Upload className="w-4 h-4 mr-2" />
                      批量上传
                    </Button>
                  </>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 文件列表 */}
        <Card>
          <CardHeader>
            <CardTitle>
              质量体系文件 ({totalCount})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <div className="space-y-3">
                {Array.from({
              length: 5
            }).map((_, i) => <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-10"></div>)}
              </div> : regulations.length === 0 ? <div className="text-center py-12">
                <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">暂无质量体系文件</p>
                {isAdmin && <p className="text-sm text-gray-400 mt-2">点击"上传文件"来创建第一条质量体系文件</p>}
              </div> : <div className="space-y-2">
                {regulations.map(regulation => <div key={regulation._id} className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow flex items-center justify-between h-10">
                    {/* 左侧文件信息 */}
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <FileText className="w-6 h-6 text-blue-500 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <button onClick={() => handleFilePreview(regulation)} className="text-left text-blue-600 hover:text-blue-800 font-medium truncate max-w-md cursor-pointer flex items-center text-sm">
                          {regulation.fileName || '未命名文件'}
                          <Eye className="w-3 h-3 ml-1" />
                        </button>
                        <div className="flex items-center space-x-3 text-xs text-gray-500 mt-0.5">
                          <span className="flex items-center">
                            <Calendar className="w-2.5 h-2.5 mr-1" />
                            {formatDate(regulation.uploadedAt)}
                          </span>
                          {regulation.fileSize && <span>{Math.round(regulation.fileSize / 1024)} KB</span>}
                          {regulation.category && <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                              {regulation.category}
                            </Badge>}
                        </div>
                      </div>
                    </div>

                    {/* 右侧操作按钮 */}
                    <div className="flex items-center space-x-1">
                      {regulation.fileUrl && <Button size="sm" variant="outline" onClick={() => handleFilePreview(regulation)} className="h-7 px-2">
                          <Eye className="w-3 h-3" />
                          <span className="ml-1 text-xs">查看</span>
                        </Button>}
                      
                      {isAdmin && <div className="relative">
                          <Button size="sm" variant="outline" onClick={() => setShowEditMenu(showEditMenu === regulation._id ? null : regulation._id)} className="h-7 px-2">
                            <MoreVertical className="w-3 h-3" />
                          </Button>
                          
                          {showEditMenu === regulation._id && <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 w-32">
                              <button onClick={() => {
                      setRenamingFile(regulation);
                      setNewFileName(regulation.fileName || '');
                      setShowRenameDialog(true);
                    }} className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100 flex items-center">
                                <Pencil className="w-2.5 h-2.5 mr-1.5" />
                                重命名
                              </button>
                              <button onClick={() => handleDelete(regulation)} className="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 flex items-center">
                                <Trash2 className="w-2.5 h-2.5 mr-1.5" />
                                删除
                              </button>
                            </div>}
                        </div>}
                    </div>
                  </div>)}
              </div>}

            {/* 分页控件 */}
            {totalPages > 1 && <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    显示 {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalCount)} 条，共 {totalCount} 条
                  </div>
                  <div className="flex items-center space-x-1">
                    {renderPaginationButtons()}
                  </div>
                </div>
              </div>}
          </CardContent>
        </Card>

        {/* 上传对话框 */}
        <QualityUploadDialog open={showUploadDialog} onOpenChange={setShowUploadDialog} onSuccess={() => {
        setCurrentPage(1);
        loadRegulations();
      }} dataSourceName="mc_quality_system" />

        {/* 批量上传对话框 */}
        <QualityBatchUploadDialog open={showBatchUploadDialog} onOpenChange={setShowBatchUploadDialog} onSuccess={() => {
        setCurrentPage(1);
        loadRegulations();
      }} dataSourceName="mc_quality_system" />

        {/* 重命名对话框 */}
        <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>重命名文件</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Input value={newFileName} onChange={e => setNewFileName(e.target.value)} placeholder="请输入新的文件名" className="w-full" />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRenameDialog(false)}>
                取消
              </Button>
              <Button onClick={handleRename}>
                确认重命名
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* PDF预览对话框 */}
        <PdfPreviewDialog open={showPdfPreview} onOpenChange={setShowPdfPreview} pdfData={selectedPdf} />
      </div>
    </div>;
}