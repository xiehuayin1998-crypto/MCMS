// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Button, Badge, useToast, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui';
// @ts-ignore;
import { Edit, Trash2, Eye, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export function EmployeeTable({
  employees,
  onEdit,
  onDelete,
  loading,
  totalCount,
  currentPage,
  pageSize,
  onPageChange
}) {
  const [roles, setRoles] = useState([]);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const {
    toast
  } = useToast();

  // 加载角色列表
  const loadRoles = async () => {
    try {
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'mc_roles',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            $master: true
          }
        }
      });
      setRoles(result.records || []);
    } catch (error) {
      toast({
        title: "加载角色失败",
        description: "无法加载角色列表",
        variant: "destructive"
      });
    }
  };

  // 获取角色名称
  const getRoleNames = roleIds => {
    if (!Array.isArray(roleIds)) return [];
    return roleIds.filter(id => typeof id === 'string').map(roleId => {
      const role = roles.find(r => r._id === roleId);
      return role ? role.role_name : '未知角色';
    });
  };

  // 切换展开/收起
  const toggleExpand = employeeId => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(employeeId)) {
      newExpanded.delete(employeeId);
    } else {
      newExpanded.add(employeeId);
    }
    setExpandedRows(newExpanded);
  };

  // 格式化日期显示
  const formatDate = dateString => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  // 计算分页信息
  const totalPages = Math.ceil(totalCount / pageSize);
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalCount);

  // 处理页码变化
  const handlePageChange = newPage => {
    if (newPage >= 1 && newPage <= totalPages) {
      onPageChange(newPage);
    }
  };

  // 渲染分页控件
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const pageNumbers = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    return <div className="flex items-center justify-between px-4 py-3 border-t">
      <div className="text-sm text-gray-700">
        显示第 {startIndex} 到 {endIndex} 条，共 {totalCount} 条记录
      </div>
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" onClick={() => handlePageChange(1)} disabled={currentPage === 1}>
          <ChevronsLeft className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {pageNumbers.map(page => <Button key={page} variant={currentPage === page ? "default" : "outline"} size="sm" onClick={() => handlePageChange(page)}>
          {page}
        </Button>)}

        <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
          <ChevronRight className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages}>
          <ChevronsRight className="w-4 h-4" />
        </Button>
      </div>
    </div>;
  };

  // 渲染展开详情
  const renderExpandedDetails = employee => <div className="bg-gray-50 p-4 rounded-lg mt-2">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
      <div>
        <h4 className="font-semibold text-gray-700 mb-2">个人信息</h4>
        <div className="space-y-1">
          <p><span className="text-gray-600">性别：</span>{employee.sex || '-'}</p>
          <p><span className="text-gray-600">工号：</span>{employee.employee_number || '-'}</p>
          <p><span className="text-gray-600">类别：</span>{employee.employee_type || '-'}</p>
          <p><span className="text-gray-600">出生日期：</span>{formatDate(employee.birthday)}</p>
          <p><span className="text-gray-600">年龄：</span>{employee.age || '-'}</p>
          <p><span className="text-gray-600">籍贯：</span>{employee.birth_place || '-'}</p>
          <p><span className="text-gray-600">政治面貌：</span>{employee.political_status || '-'}</p>
          <p><span className="text-gray-600">学历：</span>{employee.education || '-'}</p>
        </div>
      </div>
      <div>
        <h4 className="font-semibold text-gray-700 mb-2">工作信息</h4>
        <div className="space-y-1">
          <p><span className="text-gray-600">工作地：</span>{employee.Workplace || '-'}</p>
          <p><span className="text-gray-600">墨西哥职位：</span>{employee.mexican_company_positions || '-'}</p>
          <p><span className="text-gray-600">总部单位：</span>{employee.headquarters_location || '-'}</p>
          <p><span className="text-gray-600">总部岗位：</span>{employee.original_position || '-'}</p>
          <p><span className="text-gray-600">入司时间：</span>{formatDate(employee.join_date)}</p>
          <p><span className="text-gray-600">层级：</span>{employee.hierarchy || '-'}</p>
          <p><span className="text-gray-600">专业：</span>{employee.major || '-'}</p>
          <p><span className="text-gray-600">毕业院校：</span>{employee.graduation_institution || '-'}</p>
        </div>
      </div>
      <div>
        <h4 className="font-semibold text-gray-700 mb-2">证件信息</h4>
        <div className="space-y-1">
          <p><span className="text-gray-600">身份证号：</span>{employee.ID_number ? '***' + employee.ID_number.slice(-4) : '-'}</p>
          <p><span className="text-gray-600">职称：</span>{employee.job_title || '-'}</p>
          <p><span className="text-gray-600">因公护照：</span>{employee.official_passport ? '***' + employee.official_passport.slice(-4) : '-'}</p>
          <p><span className="text-gray-600">因私护照：</span>{employee.private_passport ? '***' + employee.private_passport.slice(-4) : '-'}</p>
          <p><span className="text-gray-600">签证类型：</span>{employee.use_visa_type || '-'}</p>
          <p><span className="text-gray-600">首次入境：</span>{formatDate(employee.first_date_mexico)}</p>
        </div>
      </div>
    </div>
    <div className="mt-4 pt-4 border-t">
      <h4 className="font-semibold text-gray-700 mb-2">联系信息</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <p><span className="text-gray-600">国内地址：</span>{employee.permanent_address_china || '-'}</p>
        <p><span className="text-gray-600">国内电话：</span>{employee.contact_number_china || '-'}</p>
        <p><span className="text-gray-600">墨西哥电话：</span>{employee.contact_number_mexico || '-'}</p>
      </div>
    </div>
  </div>;
  useEffect(() => {
    loadRoles();
  }, []);
  if (loading) {
    return <div className="flex justify-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>;
  }
  return <div className="flex flex-col h-full">
    {/* 表格容器 - 支持滚动 */}
    <div className="flex-1 overflow-auto">
      <Table>
        <TableHeader className="sticky top-0 bg-white z-10">
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead className="min-w-[100px]">姓名</TableHead>
            <TableHead className="min-w-[100px]">用户名</TableHead>
            <TableHead className="min-w-[100px]">工号</TableHead>
            <TableHead className="min-w-[60px]">性别</TableHead>
            {/* <TableHead className="min-w-[100px]">类别</TableHead>
            <TableHead className="min-w-[120px]">工作地</TableHead>
            <TableHead className="min-w-[100px]">部门</TableHead>
            <TableHead className="min-w-[150px]">角色</TableHead>
            <TableHead className="min-w-[120px]">入司时间</TableHead> */}
            <TableHead className="min-w-[100px]">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map(employee => {
            const roleNames = getRoleNames(employee.roles);
            const isExpanded = expandedRows.has(employee._id);
            return <React.Fragment key={employee._id}>
              <TableRow>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => toggleExpand(employee._id)}>
                    <Eye className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </Button>
                </TableCell>
                <TableCell className="font-medium">{employee.name}</TableCell>
                <TableCell>{employee.username}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {employee.employee_number || '-'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-xs">
                    {employee.sex || '-'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => onEdit(employee)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onDelete(employee)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              {isExpanded && <TableRow>
                <TableCell colSpan={11} className="p-0">
                  {renderExpandedDetails(employee)}
                </TableCell>
              </TableRow>}
            </React.Fragment>;
          })}
        </TableBody>
      </Table>
    </div>

    {/* 分页控件 */}
    {renderPagination()}
  </div>;
}