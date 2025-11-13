// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, useToast, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui';
// @ts-ignore;
import { Eye, Download, Edit, Trash2, FileText, Calendar, User, AlertCircle } from 'lucide-react';

// @ts-ignore;
import { RegulationEditDialog } from './RegulationEditDialog';
// @ts-ignore;
import { PermissionGuard } from './PermissionGuard';
export function RegulationFileList({
  regulations,
  loading,
  onRefresh,
  $w
}) {
  const {
    toast
  } = useToast();
  const [selectedRegulation, setSelectedRegulation] = useState(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // 查看文件
  const handleView = regulation => {
    $w.utils.navigateTo({
      pageId: 'regulationViewer',
      params: {
        id: regulation._id
      }
    });
  };

  // 下载文件
  const handleDownload = async regulation => {
    try {
      if (regulation.fileUrl) {
        window.open(regulation.fileUrl, '_blank');
      } else {
        toast({
          title: "下载失败",
          description: "文件链接无效",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "下载失败",
        description: error.message || "无法下载文件",
        variant: "destructive"
      });
    }
  };

  // 删除文件
  const handleDelete = async () => {
    if (!selectedRegulation) return;
    try {
      await $w.cloud.callDataSource({
        dataSourceName: 'mc_regulations',
        methodName: 'wedaDeleteV2',
        params: {
          filter: {
            where: {
              _id: {
                $eq: selectedRegulation._id
              }
            }
          }
        }
      });
      toast({
        title: "删除成功",
        description: "规章制度已删除"
      });
      setShowDeleteDialog(false);
      setSelectedRegulation(null);
      onRefresh();
    } catch (error) {
      toast({
        title: "删除失败",
        description: error.message || "无法删除文件",
        variant: "destructive"
      });
    }
  };
  if (loading) {
    return <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>;
  }
  if (regulations.length === 0) {
    return <Card>
        <CardContent className="text-center py-12">
          <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">暂无规章制度</p>
        </CardContent>
      </Card>;
  }
  return <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {regulations.map(regulation => <Card key={regulation._id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span className="truncate">{regulation.title}</span>
                <Badge variant={regulation.status === 'active' ? 'default' : 'secondary'}>
                  {regulation.status === 'active' ? '有效' : '已废止'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                {regulation.description}
              </p>
              
              <div className="space-y-2 text-sm text-gray-500 mb-4">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>发布日期: {new Date(regulation.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  <span>发布人: {regulation.createdBy || '系统管理员'}</span>
                </div>
                <div className="flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  <span>分类: {regulation.category || '未分类'}</span>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button size="sm" variant="outline" onClick={() => handleView(regulation)} className="flex-1">
                  <Eye className="w-4 h-4 mr-1" />
                  查看
                </Button>
                
                <Button size="sm" variant="outline" onClick={() => handleDownload(regulation)} className="flex-1">
                  <Download className="w-4 h-4 mr-1" />
                  下载
                </Button>

                {/* 使用权限守卫控制编辑和删除按钮 */}
                <PermissionGuard $w={$w} requiredPermission="regulationManagement">
                  <>
                    <Button size="sm" variant="outline" onClick={() => {
                  setSelectedRegulation(regulation);
                  setShowEditDialog(true);
                }}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    
                    <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700" onClick={() => {
                  setSelectedRegulation(regulation);
                  setShowDeleteDialog(true);
                }}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </>
                </PermissionGuard>
              </div>
            </CardContent>
          </Card>)}
      </div>

      {/* 编辑对话框 */}
      {showEditDialog && selectedRegulation && <RegulationEditDialog open={showEditDialog} onOpenChange={setShowEditDialog} regulation={selectedRegulation} onSuccess={onRefresh} $w={$w} />}

      {/* 删除确认对话框 */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center space-x-2 text-red-600 mb-4">
              <AlertCircle className="w-5 h-5" />
              <span>警告：此操作不可撤销</span>
            </div>
            <p>确定要删除规章制度 "{selectedRegulation?.title}" 吗？</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>;
}