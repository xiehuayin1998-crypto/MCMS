// @ts-ignore;
import React from 'react';

export default function PdfViewerPage(props) {
  const {
    $w,
    style
  } = props;
  const fileId = $w.page.dataset.params?.id || '';
  const fileName = $w.page.dataset.params?.name || 'PDF 文件';
  const fileUrl = $w.page.dataset.params?.url || '';
  return <div style={style} className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">{fileName}</h1>
          <button onClick={() => $w.utils.navigateBack()} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
            返回
          </button>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto p-4">
        {fileUrl ? <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <iframe src={fileUrl} className="w-full h-screen" title={fileName} style={{
          minHeight: '80vh'
        }} />
          </div> : <div className="text-center py-12">
            <div className="text-gray-500">无法加载 PDF 文件</div>
          </div>}
      </div>
    </div>;
}