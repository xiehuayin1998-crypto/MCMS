// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { cn } from '@/lib/utils';

export function CompanyTabs({
  activeTab,
  onTabChange
}) {
  const tabs = [{
    id: 'employee',
    label: '员工管理',
    icon: '👥'
  }, {
    id: 'document',
    label: '文件管理',
    icon: '📄'
  }, {
    id: 'department',
    label: '部门管理',
    icon: '🏢'
  }, {
    id: 'role',
    label: '角色管理',
    icon: '🔐'
  }];
  return <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map(tab => <button key={tab.id} onClick={() => onTabChange(tab.id)} className={cn("py-4 px-1 border-b-2 font-medium text-sm transition-colors", activeTab === tab.id ? "border-red-600 text-red-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300")}>
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>)}
            </nav>
          </div>
        </div>;
}