// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Alert, AlertDescription } from '@/components/ui';
// @ts-ignore;
import { CheckCircle, RefreshCw, AlertCircle, Filter } from 'lucide-react';

export function SyncStatusAlert({
  status,
  message,
  progress,
  results
}) {
  if (!status) return null;
  const getIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4" />;
      case 'syncing':
        return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'info':
        return <Filter className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };
  const getVariant = () => {
    switch (status) {
      case 'success':
        return 'default';
      case 'syncing':
        return 'default';
      case 'info':
        return 'default';
      default:
        return 'destructive';
    }
  };
  return <Alert variant={getVariant()}>
      {getIcon()}
      <AlertDescription>
        {message}
        {status === 'syncing' && <div className="mt-2">
            <div className="flex justify-between text-sm mb-1">
              <span>进度: {progress}%</span>
              <span>{results.success + results.failed}/{results.total}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{
            width: `${progress}%`
          }}></div>
            </div>
          </div>}
        {status === 'success' && results.details.length > 0 && <div className="mt-2 text-sm">
            <div>成功: {results.success} 失败: {results.failed} 跳过: {results.skipped}</div>
            {results.failed > 0 && <div className="text-orange-600 mt-1">
                查看下方错误详情了解失败原因
              </div>}
          </div>}
      </AlertDescription>
    </Alert>;
}