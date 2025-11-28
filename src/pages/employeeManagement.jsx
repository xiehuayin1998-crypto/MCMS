// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, useToast } from '@/components/ui';
// @ts-ignore;
import { Plus, Users, Home, Download, Upload } from 'lucide-react';

import { EmployeeTable } from '@/components/EmployeeTable';
import { EmployeeEditDialog } from '@/components/EmployeeEditDialog';
import { EmployeeSearchFilter } from '@/components/EmployeeSearchFilter';
import { UserJsonImportExport } from '@/components/UserJsonImportExport';
export default function EmployeeManagement(props) {
  const {
    $w
  } = props;
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10); // 每页显示条数
  const [searchParams, setSearchParams] = useState({
    searchTerm: '',
    department: '',
    role: ''
  });
  const [importExportOpen, setImportExportOpen] = useState(false);
  const [isReadOnlySearch, setIsReadOnlySearch] = useState(false);
  const {
    toast
  } = useToast();

  // 检查URL参数，处理自动搜索
  useEffect(() => {
    const params = $w.page.dataset.params;
    if (params && params.autoSearch) {
      // 设置搜索条件为只读模式
      setSearchParams(prev => ({
        ...prev,
        searchTerm: params.autoSearch
      }));
      setIsReadOnlySearch(params.readOnly === 'true');

      // 显示提示信息
      toast({
        title: "自动搜索",
        description: `已自动搜索：${params.autoSearch}`
      });
    }
  }, [$w.page.dataset.params]);

  // 加载用户列表
  const loadEmployees = async (page = 1) => {
    try {
      setLoading(true);

      // 构建查询条件
      const filter = {
        where: {}
      };

      // 添加搜索条件
      if (searchParams.searchTerm) {
        filter.where.$or = [{
          name: {
            $search: searchParams.searchTerm
          }
        }, {
          username: {
            $search: searchParams.searchTerm
          }
        }];
      }
      if (searchParams.department && searchParams.department !== 'all') {
        filter.where.department = {
          $eq: searchParams.department
        };
      }
      if (searchParams.role && searchParams.role !== 'all') {
        filter.where.roles = {
          $in: [searchParams.role]
        };
      }
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'mc_users',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            $master: true
          },
          filter: filter,
          orderBy: [{
            createdAt: 'desc'
          }],
          pageSize: pageSize,
          pageNumber: page,
          getCount: true
        }
      });
      setEmployees(result.records || []);
      setFilteredEmployees(result.records || []);
      setTotalCount(result.total || 0);
      setCurrentPage(page);
    } catch (error) {
      toast({
        title: "加载失败",
        description: "无法加载用户列表",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // 处理搜索和筛选
  const handleSearch = (searchTerm, department, role) => {
    // 如果是只读模式，不允许修改搜索条件
    if (isReadOnlySearch) {
      toast({
        title: "操作受限",
        description: "当前为查看模式，搜索条件不可修改",
        variant: "destructive"
      });
      return;
    }
    setSearchParams({
      searchTerm,
      department,
      role
    });
    setCurrentPage(1); // 重置到第一页
  };

  // 处理页码变化
  const handlePageChange = newPage => {
    loadEmployees(newPage);
  };

  // 处理保存
  const handleSave = async () => {
    await loadEmployees(currentPage);
  };

  // 处理删除
  const handleDelete = async employee => {
    try {
      await $w.cloud.callDataSource({
        dataSourceName: 'mc_users',
        methodName: 'wedaDeleteV2',
        params: {
          filter: {
            where: {
              _id: {
                $eq: employee._id
              }
            }
          }
        }
      });
      toast({
        title: "删除成功",
        description: "用户已删除"
      });
      // 如果删除后当前页没有数据，回到上一页
      const newTotalCount = totalCount - 1;
      const newTotalPages = Math.ceil(newTotalCount / pageSize);
      const newPage = currentPage > newTotalPages ? Math.max(1, newTotalPages) : currentPage;
      loadEmployees(newPage);
    } catch (error) {
      toast({
        title: "删除失败",
        description: error.message || "无法删除用户",
        variant: "destructive"
      });
    }
  };

  // 返回首页
  const handleGoHome = () => {
    $w.utils.navigateTo({
      pageId: 'home',
      params: {}
    });
  };

  // 处理导入导出完成
  const handleImportExportComplete = () => {
    setImportExportOpen(false);
    loadEmployees(currentPage);
  };

  // 退出只读模式
  const handleExitReadOnlyMode = () => {
    setIsReadOnlySearch(false);
    setSearchParams({
      searchTerm: '',
      department: '',
      role: ''
    });
    toast({
      title: "退出查看模式",
      description: "已退出只读查看模式"
    });
  };

  // 监听搜索参数变化
  useEffect(() => {
    loadEmployees(1);
  }, [searchParams]);
  useEffect(() => {
    loadEmployees(1);
  }, []);
  return <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Users className="w-8 h-8 mr-3" />
              用户管理
              {isReadOnlySearch && <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">查看模式</span>}
            </h1>
            <Button variant="outline" onClick={handleGoHome} className="flex items-center">
              <Home className="w-4 h-4 mr-2" />
              返回首页
            </Button>
          </div>
          <div className="flex space-x-3">
            {isReadOnlySearch && <Button variant="outline" onClick={handleExitReadOnlyMode} className="flex items-center bg-gray-100 text-gray-800 hover:bg-gray-200">
                退出查看模式
              </Button>}
            <Button variant="outline" onClick={() => setImportExportOpen(true)} className="flex items-center bg-green-100 text-green-800 hover:bg-green-200">
              <Upload className="w-4 h-4 mr-2" />
              批量操作（JSON格式）
            </Button>
            <Button onClick={() => {
            setSelectedEmployee(null);
            setEditDialogOpen(true);
          }}>
            <Plus className="w-4 h-4 mr-2" />
            新增用户
          </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>用户列表</span>
              {isReadOnlySearch && <span className="text-sm text-blue-600 font-normal">当前为只读查看模式</span>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EmployeeSearchFilter onSearch={handleSearch} readOnly={isReadOnlySearch} initialSearchTerm={isReadOnlySearch ? searchParams.searchTerm : ''} />
            <div className="mt-4">
              <EmployeeTable employees={filteredEmployees} onEdit={emp => {
              setSelectedEmployee(emp);
              setEditDialogOpen(true);
            }} onDelete={handleDelete} loading={loading} totalCount={totalCount} currentPage={currentPage} pageSize={pageSize} onPageChange={handlePageChange} />
            </div>
          </CardContent>
        </Card>

        <EmployeeEditDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} employee={selectedEmployee} onSave={handleSave} />
        
        <UserJsonImportExport open={importExportOpen} onOpenChange={setImportExportOpen} onComplete={handleImportExportComplete} $w={$w} // 传递$w参数
      />
      </div>
    </div>;
}