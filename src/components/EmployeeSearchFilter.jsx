// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Button } from '@/components/ui';
// @ts-ignore;
import { Search, X } from 'lucide-react';

export function EmployeeSearchFilter({
  onSearch,
  initialSearchTerm = '',
  isReadonly = false
}) {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [department, setDepartment] = useState('all');
  const [role, setRole] = useState('all');
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  // 加载部门和角色数据
  useEffect(() => {
    loadFilterData();
  }, []);

  // 监听初始搜索词变化
  useEffect(() => {
    setSearchTerm(initialSearchTerm);
  }, [initialSearchTerm]);

  // 加载筛选数据
  const loadFilterData = async () => {
    try {
      setLoading(true);

      // 加载部门数据
      const deptResult = await $w.cloud.callDataSource({
        dataSourceName: 'mc_departments',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            name: true
          },
          orderBy: [{
            name: 'asc'
          }]
        }
      });
      setDepartments(deptResult.records || []);

      // 加载角色数据
      const roleResult = await $w.cloud.callDataSource({
        dataSourceName: 'mc_roles',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            name: true
          },
          orderBy: [{
            name: 'asc'
          }]
        }
      });
      setRoles(roleResult.records || []);
    } catch (error) {
      console.error('加载筛选数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 处理搜索
  const handleSearch = () => {
    if (!isReadonly) {
      onSearch(searchTerm, department, role);
    }
  };

  // 处理重置
  const handleReset = () => {
    if (!isReadonly) {
      setSearchTerm('');
      setDepartment('all');
      setRole('all');
      onSearch('', 'all', 'all');
    }
  };

  // 处理搜索词变化
  const handleSearchTermChange = value => {
    if (!isReadonly) {
      setSearchTerm(value);
    }
  };

  // 处理部门变化
  const handleDepartmentChange = value => {
    if (!isReadonly) {
      setDepartment(value);
    }
  };

  // 处理角色变化
  const handleRoleChange = value => {
    if (!isReadonly) {
      setRole(value);
    }
  };
  return <div className="flex flex-col sm:flex-row gap-4 items-end">
    <div className="flex-1">
      <label className="block text-sm font-medium text-gray-700 mb-1">搜索</label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input type="text" placeholder={isReadonly ? "已锁定搜索条件" : "搜索姓名或用户名..."} value={searchTerm} onChange={e => handleSearchTermChange(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSearch()} className={`pl-10 ${isReadonly ? 'bg-gray-100 cursor-not-allowed' : ''}`} disabled={isReadonly} />
      </div>
    </div>

    <div className="w-full sm:w-40">
      <label className="block text-sm font-medium text-gray-700 mb-1">部门</label>
      <Select value={department} onValueChange={handleDepartmentChange} disabled={isReadonly || loading}>
        <SelectTrigger className={isReadonly ? 'bg-gray-100 cursor-not-allowed' : ''}>
          <SelectValue placeholder="选择部门" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">全部部门</SelectItem>
          {departments.map(dept => <SelectItem key={dept._id} value={dept.name}>
              {dept.name}
            </SelectItem>)}
        </SelectContent>
      </Select>
    </div>

    <div className="w-full sm:w-40">
      <label className="block text-sm font-medium text-gray-700 mb-1">角色</label>
      <Select value={role} onValueChange={handleRoleChange} disabled={isReadonly || loading}>
        <SelectTrigger className={isReadonly ? 'bg-gray-100 cursor-not-allowed' : ''}>
          <SelectValue placeholder="选择角色" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">全部角色</SelectItem>
          {roles.map(role => <SelectItem key={role._id} value={role.name}>
              {role.name}
            </SelectItem>)}
        </SelectContent>
      </Select>
    </div>

    {!isReadonly && <>
        <Button onClick={handleSearch} className="w-full sm:w-auto">
          搜索
        </Button>
        <Button variant="outline" onClick={handleReset} className="w-full sm:w-auto">
          <X className="w-4 h-4 mr-2" />
          重置
        </Button>
      </>}
  </div>;
}