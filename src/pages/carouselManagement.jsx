// @ts-ignore;
import React from 'react';

// @ts-ignore;
import { UserHeader } from '@/components/UserHeader';
export default function CarouselManagement(props) {
  const {
    $w,
    style
  } = props;
  return <div style={style} className="min-h-screen bg-gray-50">
      <UserHeader $w={$w} showHomeButton={true} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">轮播图管理</h1>
          <p className="text-gray-600">轮播图管理功能正在开发中...</p>
        </div>
      </div>
    </div>;
}