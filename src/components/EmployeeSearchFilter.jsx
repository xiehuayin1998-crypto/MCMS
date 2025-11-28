// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Button } from '@/components/ui';
// @ts-ignore;
import { Search, Filter, Lock } from 'lucide-react';

export function EmployeeSearchFilter({
  onSearch,
  readOnly = false,
  initialSearchTerm = ''
}) {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState('');
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);

  // 加载部门列表
  const loadDepartments = async () => {
    try {
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'mc_departments',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            $master: true
          },
          orderBy: [{
            name: 'asc'
          }]
        }
      });
      setDepartments(result.records || []);
    } catch (error) {
      console.error('加载部门失败:', error);
    }
  };

  // 加载角色列表
  const loadRoles = async () => {
    try {
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'mc_roles',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            $master: true
          },
          orderBy: [{
            role_name: 'asc'
          }]
        }
      });
      setRoles(result.records || []);
    } catch (error) {
      console.error('加载角色失败:', error);
    }
  };

  // 初始化设置
  useEffect(() => {
    if (initialSearchTerm) {
      setSearchTerm(initialSearchTerm);
    }
    loadDepartments();
    loadRoles();
  }, []);

  // 监听搜索条件变化
  useEffect(() => {
    onSearch(searchTerm, department, role);
  }, [searchTerm, department, role]);
  const handleReset = () => {
    if (readOnly) return; // 只读模式下不允许重置
    setSearchTerm('');
    setDepartment('');
    setRole('');
  };
  const handleSearchTermChange = value => {
    if (readOnly) return; // 只读模式下不允许修改
    setSearchTerm(value);
  };
  const handleDepartmentChange = value => {
    if (readOnly) return; // 只读模式下不允许修改
    setDepartment(value);
  };
  const handleRoleChange = value => {
    if (readOnly) return; // 只读模式下不允许修改
    setRole(value);
  };
  return <div className="flex flex-col sm:flex-row gap-4 mb-4">
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          {readOnly && <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />}
          <Input placeholder={readOnly ? "当前为只读模式" : "搜索姓名或用户名..."} value={searchTerm} onChange={e => handleSearchTermChange(e.target.value)} className={`pl-10 ${readOnly ? 'pr-10 bg-gray-50 cursor-not-allowed' : ''}`} readOnly={readOnly} disabled={readOnly} />
        </div>
      </div>
      
      <Select value={department} onValueChange={handleDepartmentChange} disabled={readOnly}>
        <SelectTrigger className={`w-full sm:w-[180px] ${readOnly ? 'bg-gray-50 cursor-not-allowed' : ''}`}>
          <SelectValue placeholder={readOnly ? "只读模式" : "选择部门"} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">全部部门</SelectItem>
          {departments.map(dept => <SelectItem key={dept._id} value={dept.name}>
              {dept.name}
            </SelectItem>)}
        </SelectContent>
      </Select>

      <Select value={role} onValueChange={handleRoleChange} disabled={readOnly}>
        <SelectTrigger className={`w-full sm:w-[180px] ${readOnly ? 'bg-gray-50 cursor-not-allowed' : ''}`}>
          <SelectValue placeholder={readOnly ? "只读模式" : "选择角色"} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">全部角色</SelectItem>
          {roles.map(role => <SelectItem key={role._id} value={role._id}>
              {role.role_name} (等级: {role.level || 0})
            </SelectItem>)}
        </SelectContent>
      </Select>

      <Button variant="outline" onClick={handleReset} className={`w-full sm:w-auto ${readOnly ? 'bg-gray-50 cursor-not-allowed' : ''}`} disabled={readOnly}>
        <Filter className="w-4 h-4 mr-2" />
        {readOnly ? "只读模式" : "重置"}
      </Button>
    </div>;
}