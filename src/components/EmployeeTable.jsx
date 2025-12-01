// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Button, Badge, useToast, Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext, PaginationEllipsis } from '@/components/ui';
// @ts-ignore;
import { Edit, Trash2, Shield, User, UserCheck, UserX, Eye } from 'lucide-react';

export function EmployeeTable({
  employees,
  onEdit,
  onDelete,
  loading,
  totalCount,
  currentPage,
  pageSize,
  onPageChange,
  canEdit,
  $w
}) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const {
    toast
  } = useToast();

  // 获取当前用户信息
  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        setUserLoading(true);
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          setCurrentUser(JSON.parse(storedUser));
        } else if ($w.auth.currentUser && $w.auth.currentUser.name) {
          const result = await $w.cloud.callDataSource({
            dataSourceName: 'mc_users',
            methodName: 'wedaGetRecordsV2',
            params: {
              filter: {
                where: {
                  username: {
                    $eq: $w.auth.currentUser.name
                  }
                }
              },
              select: {
                $master: true
              }
            }
          });
          if (result.records && result.records.length > 0) {
            const user = result.records[0];
            const userInfo = {
              userId: user._id,
              name: user.name,
              username: user.username,
              isAdmin: user.isAdmin || false,
              department: user.department,
              employee_number: user.employee_number
            };
            setCurrentUser(userInfo);
            localStorage.setItem('currentUser', JSON.stringify(userInfo));
          }
        }
      } catch (error) {
        console.error('获取当前用户信息失败:', error);
      } finally {
        setUserLoading(false);
      }
    };
    loadCurrentUser();
  }, [$w.auth.currentUser, $w.cloud]);

  // 检查用户权限
  const hasEditPermission = employee => {
    if (!currentUser) return false;
    // 管理员可以编辑任何用户
    if (currentUser.isAdmin) return true;
    // 普通用户只能编辑自己
    return currentUser.userId === employee._id;
  };
  const hasDeletePermission = employee => {
    if (!currentUser) return false;
    // 管理员可以删除任何用户
    if (currentUser.isAdmin) return true;
    // 普通用户只能删除自己
    return currentUser.userId === employee._id;
  };

  // 计算总页数
  const totalPages = Math.ceil(totalCount / pageSize);

  // 处理页码变化
  const handlePageChange = page => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  // 渲染分页
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage <= 1} />
          </PaginationItem>
          {startPage > 1 && <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>}
          {pages.map(page => <PaginationItem key={page}>
              <PaginationLink onClick={() => handlePageChange(page)} isActive={page === currentPage}>
                {page}
              </PaginationLink>
            </PaginationItem>)}
          {endPage < totalPages && <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>}
          <PaginationItem>
            <PaginationNext onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>;
  };

  // 格式化日期
  const formatDate = dateString => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN');
    } catch (error) {
      return dateString;
    }
  };

  // 获取角色显示名称
  const getRoleDisplay = roles => {
    if (!roles || !Array.isArray(roles)) return '-';
    return roles.map(role => {
      if (role === 'admin') return '管理员';
      if (role === 'user') return '普通用户';
      if (role === 'manager') return '部门经理';
      return role;
    }).join(', ');
  };

  // 获取状态显示
  const getStatusDisplay = status => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">正常</Badge>;
      case 'inactive':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">禁用</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">待审核</Badge>;
      default:
        return <Badge variant="outline">{status || '未知'}</Badge>;
    }
  };
  if (loading) {
    return <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-2">加载中...</p>
      </div>;
  }
  if (!employees || employees.length === 0) {
    return <div className="text-center py-8">
        <div className="text-gray-500">
          <User className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium">暂无用户数据</p>
          <p className="text-sm text-gray-400 mt-2">请尝试调整搜索条件或添加新用户</p>
        </div>
      </div>;
  }
  return <div className="space-y-4">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">头像</TableHead>
              <TableHead>姓名</TableHead>
              <TableHead>用户名</TableHead>
              <TableHead>工号</TableHead>
              <TableHead>部门</TableHead>
              <TableHead>角色</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map(employee => <TableRow key={employee._id} className="hover:bg-gray-50">
                <TableCell>
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                </TableCell>
                <TableCell className="font-medium">{employee.name || '-'}</TableCell>
                <TableCell>{employee.username || '-'}</TableCell>
                <TableCell>{employee.employee_number || '-'}</TableCell>
                <TableCell>{employee.department || '-'}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    {employee.isAdmin && <Badge variant="outline" className="bg-purple-100 text-purple-800">
                        <Shield className="w-3 h-3 mr-1" />
                        管理员
                      </Badge>}
                    {employee.roles && employee.roles.length > 0 && getRoleDisplay(employee.roles)}
                  </div>
                </TableCell>
                <TableCell>{getStatusDisplay(employee.status)}</TableCell>
                <TableCell>{formatDate(employee.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => onEdit(employee)} disabled={!hasEditPermission(employee)} className={!hasEditPermission(employee) ? 'opacity-50 cursor-not-allowed' : ''}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onDelete(employee)} disabled={!hasDeletePermission(employee)} className={!hasDeletePermission(employee) ? 'opacity-50 cursor-not-allowed text-red-400' : 'text-red-600'}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>)}
          </TableBody>
        </Table>
      </div>
      
      {renderPagination()}
    </div>;
}