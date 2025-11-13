// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, useToast } from '@/components/ui';
// @ts-ignore;
import { ArrowLeft, Download, ExternalLink, AlertCircle, Loader2 } from 'lucide-react';

export default function RegulationViewerPage(props) {
  const {
    $w,
    style
  } = props;
  const {
    toast
  } = useToast();
  const fileId = $w.page.dataset.params?.id || '';
  const [fileInfo, setFileInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 页面加载时获取文件信息
  useEffect(() => {
    if (fileId) {
      loadFileInfo();
    } else {
      setError('未提供文件ID');
      setIsLoading(false);
    }
  }, [fileId]);

  // 从 mc_regulations 数据模型获取文件信息
  const loadFileInfo = async () => {
    try {
      setIsLoading(true);
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'mc_regulations',
        methodName: 'wedaGetItemV2',
        params: {
          filter: {
            where: {
              _id: {
                $eq: fileId
              }
            }
          },
          select: {
            $master: true
          }
        }
      });
      if (result) {
        setFileInfo({
          id: result._id,
          name: result.fileName,
          url: result.fileUrl,
          uploadedAt: result.uploadedAt,
          uploaderId: result.uploaderId
        });
      } else {
        setError('文件不存在');
      }
    } catch (error) {
      console.error('加载文件信息失败:', error);
      setError('无法加载文件信息');
      toast({
        title: "加载失败",
        description: "无法获取文件信息，请稍后重试",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 返回上一页
  const handleBack = () => {
    $w.utils.navigateBack();
  };

  // 返回规章制度管理首页
  const handleBackToList = () => {
    $w.utils.navigateTo({
      pageId: 'regulationManagement',
      params: {}
    });
  };

  // 下载文件
  const handleDownload = () => {
    if (fileInfo?.url) {
      window.open(fileInfo.url, '_blank');
    }
  };

  // 格式化文件大小（实际项目中可以从云存储获取）
  const formatFileSize = bytes => {
    if (!bytes) return '未知大小';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 格式化日期
  const formatDate = timestamp => {
    if (!timestamp) return '未知时间';
    return new Date(timestamp).toLocaleString('zh-CN');
  };
  if (isLoading) {
    return <div style={style} className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">正在加载文件...</p>
        </div>
      </div>;
  }
  if (error) {
    return <div style={style} className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <AlertCircle className="w-5 h-5 mr-2" />
              加载失败
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="flex space-x-2">
              <Button onClick={handleBackToList} className="flex-1">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回列表
              </Button>
              <Button onClick={loadFileInfo} variant="outline" className="flex-1">
                重试
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>;
  }
  return <div style={style} className="min-h-screen bg-gray-100">
      {/* 顶部导航栏 */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button onClick={handleBack} variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 truncate max-w-xs sm:max-w-md md:max-w-lg">
                  {fileInfo?.name || '规章制度文件'}
                </h1>
                <p className="text-sm text-gray-500 hidden sm:block">
                  上传时间: {formatDate(fileInfo?.uploadedAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={handleDownload} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                下载
              </Button>
              <Button onClick={handleBackToList} variant="outline" size="sm">
                <ExternalLink className="w-4 h-4 mr-2" />
                返回列表
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 文件信息卡片 - 移动端显示 */}
      <div className="sm:hidden bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <p className="text-sm text-gray-600">
            上传时间: {formatDate(fileInfo?.uploadedAt)}
          </p>
        </div>
      </div>

      {/* PDF 预览区域 */}
      <div className="flex-1">
        <div className="max-w-7xl mx-auto p-4 h-full">
          {fileInfo?.url ? <div className="bg-white rounded-lg shadow-lg overflow-hidden h-full">
              <iframe src={fileInfo.url} className="w-full h-full" title={fileInfo.name} style={{
            minHeight: 'calc(100vh - 120px)'
          }} />
            </div> : <div className="flex items-center justify-center h-full">
              <Card className="max-w-md">
                <CardContent className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">无法加载 PDF 文件</p>
                  <Button onClick={loadFileInfo} variant="outline" className="mt-4">
                    重新加载
                  </Button>
                </CardContent>
              </Card>
            </div>}
        </div>
      </div>
    </div>;
}