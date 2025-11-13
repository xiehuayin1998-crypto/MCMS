// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Button, useToast } from '@/components/ui';
// @ts-ignore;
import { ExternalLink, X, FileText, AlertCircle } from 'lucide-react';

export default function PdfPreviewDialog({
  open,
  onOpenChange,
  pdfData
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [iframeUrl, setIframeUrl] = useState('');
  const {
    toast
  } = useToast();
  useEffect(() => {
    if (open && pdfData?.url) {
      setLoading(true);
      setError(null);

      // 检查URL是否有效
      const checkUrl = async () => {
        try {
          const response = await fetch(pdfData.url, {
            method: 'HEAD'
          });
          if (response.ok) {
            // 使用Google Docs Viewer作为PDF预览器，并添加参数隐藏下载功能
            const encodedUrl = encodeURIComponent(pdfData.url);
            // 添加rm=minimal参数隐藏Google Docs Viewer的下载按钮
            const viewerUrl = `https://docs.google.com/viewer?url=${encodedUrl}&embedded=true&rm=minimal`;
            setIframeUrl(viewerUrl);
          } else {
            throw new Error('文件无法访问');
          }
        } catch (err) {
          setError('无法加载PDF文件，请检查文件链接或网络连接');
          setIframeUrl('');
        } finally {
          setLoading(false);
        }
      };
      checkUrl();
    }
  }, [open, pdfData]);
  const handleOpenInNewTab = () => {
    if (pdfData?.url) {
      window.open(pdfData.url, '_blank');
    }
  };
  const handleClose = () => {
    setLoading(true);
    setError(null);
    setIframeUrl('');
    onOpenChange(false);
  };
  if (!pdfData) return null;
  return <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            {pdfData.title || '文件预览'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden bg-gray-100 rounded-lg">
          {loading && <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">正在加载PDF文件...</p>
              </div>
            </div>}
          
          {error && !loading && <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 mb-4">{error}</p>
                <Button variant="outline" onClick={handleOpenInNewTab}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  新窗口打开
                </Button>
              </div>
            </div>}
          
          {!loading && !error && iframeUrl && <iframe src={iframeUrl} className="w-full h-full border-0" title={pdfData.title || '文件预览'} allowFullScreen />}
          
          {!loading && !error && !iframeUrl && <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">无法预览此文件</p>
                <div className="space-x-2">
                  <Button variant="outline" onClick={handleOpenInNewTab}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    新窗口打开
                  </Button>
                </div>
              </div>
            </div>}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            关闭
          </Button>
          <Button variant="outline" onClick={handleOpenInNewTab}>
            <ExternalLink className="w-4 h-4 mr-2" />
            新窗口打开
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>;
}