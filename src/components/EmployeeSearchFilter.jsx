// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Button } from '@/components/ui';
// @ts-ignore;
import { Search, Filter, X } from 'lucide-react';

export function EmployeeSearchFilter({
  searchTerm,
  setSearchTerm,
  selectedDepartment,
  setSelectedDepartment,
  selectedRole,
  setSelectedRole,
  departments = [],
  roles = [],
  onSearch = () => {} // 添加默认空函数
}) {
  const handleSearch = () => {
    if (typeof onSearch === 'function') {
      onSearch();
    }
  };
  const handleKeyPress = e => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedDepartment('');
    setSelectedRole('');
    if (typeof onSearch === 'function') {
      onSearch();
    }
  };
  return <div className="space-y-4 mb-6">
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input type="text" placeholder="搜索员工姓名、用户名或邮箱..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} onKeyPress={handleKeyPress} className="pl-10" />
        </div>
      </div>
      
      <div className="flex gap-2">
        <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="选择部门" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部部门</SelectItem>
            {departments.map(dept => <SelectItem key={dept._id} value={dept.name}>{dept.name}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={selectedRole} onValueChange={setSelectedRole}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="选择角色" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部角色</SelectItem>
            {roles.map(role => <SelectItem key={role._id} value={role.name}>{role.name}</SelectItem>)}
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={clearFilters} className="flex items-center">
          <X className="w-4 h-4 mr-1" />
          清除
        </Button>
      </div>
    </div>
  </div>;
}