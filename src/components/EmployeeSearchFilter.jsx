// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Button } from '@/components/ui';
// @ts-ignore;
import { Search, Filter } from 'lucide-react';

export function EmployeeSearchFilter({
  onSearch
}) {
  const [searchTerm, setSearchTerm] = useState('');
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
  useEffect(() => {
    loadDepartments();
    loadRoles();
  }, []);
  useEffect(() => {
    onSearch(searchTerm, department, role);
  }, [searchTerm, department, role]);
  const handleReset = () => {
    setSearchTerm('');
    setDepartment('');
    setRole('');
  };
  return <div className="flex flex-col sm:flex-row gap-4 mb-4">
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input placeholder="搜索姓名或用户名..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
      </div>
      
      <Select value={department} onValueChange={setDepartment}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="选择部门" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">全部部门</SelectItem>
          {departments.map(dept => <SelectItem key={dept._id} value={dept.name}>
              {dept.name}
            </SelectItem>)}
        </SelectContent>
      </Select>

      <Select value={role} onValueChange={setRole}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="选择角色" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">全部角色</SelectItem>
          {roles.map(role => <SelectItem key={role._id} value={role._id}>
              {role.role_name} (等级: {role.level || 0})
            </SelectItem>)}
        </SelectContent>
      </Select>

      <Button variant="outline" onClick={handleReset} className="w-full sm:w-auto">
        <Filter className="w-4 h-4 mr-2" />
        重置
      </Button>
    </div>;
}