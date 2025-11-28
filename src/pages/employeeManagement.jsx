// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, useToast } from '@/components/ui';
// @ts-ignore;
import { Plus, Users, Home, Download, Upload, Search, Filter } from 'lucide-react';

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
  const [loading, setLoading] = useState(false); // 初始为false，不自动加载
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
  const [hasSearched, setHasSearched] = useState(false); // 标记是否已进行搜索
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
      // 自动执行搜索
      handleSearch(params.autoSearch, '', '');
      setHasSearched(true);

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

  // 处理搜索按钮点击
  const handleSearchClick = () => {
    if (isReadOnlySearch) {
      toast({
        title: "操作受限",
        description: "当前为查看模式，搜索条件不可修改",
        variant: "destructive"
      });
      return;
    }
    setHasSearched(true);
    setCurrentPage(1);
    loadEmployees(1);
  };

  // 处理搜索和筛选（实时响应，但不自动加载数据）
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
    // 不自动加载数据，等待用户点击搜索按钮
  };

  // 处理重置按钮
  const handleReset = () => {
    if (isReadOnlySearch) return; // 只读模式下不允许重置
    setSearchParams({
      searchTerm: '',
      department: '',
      role: ''
    });
    setHasSearched(false); // 重置搜索状态
    setEmployees([]); // 清空用户列表
    setFilteredEmployees([]);
    setTotalCount(0);
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

  // 退出只读模式（保留函数但不再使用按钮）
  const handleExitReadOnlyMode = () => {
    setIsReadOnlySearch(false);
    setSearchParams({
      searchTerm: '',
      department: '',
      role: ''
    });
    setHasSearched(false);
    setEmployees([]);
    setFilteredEmployees([]);
    setTotalCount(0);
    toast({
      title: "退出查看模式",
      description: "已退出只读查看模式"
    });
  };

  // 监听搜索参数变化（不再自动加载数据）
  useEffect(() => {
    // 移除自动加载数据的功能
  }, [searchParams]);
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
            {/* 已移除退出查看模式按钮 */}
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
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <EmployeeSearchFilter onSearch={handleSearch} readOnly={isReadOnlySearch} initialSearchTerm={isReadOnlySearch ? searchParams.searchTerm : ''} />
              {/* 新增搜索按钮 */}
              <Button onClick={handleSearchClick} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700" disabled={isReadOnlySearch}>
                <Search className="w-4 h-4 mr-2" />
                搜索
              </Button>
              {/* 重置按钮 */}
              <Button variant="outline" onClick={handleReset} className={`w-full sm:w-auto ${isReadOnlySearch ? 'bg-gray-50 cursor-not-allowed' : ''}`} disabled={isReadOnlySearch}>
                <Filter className="w-4 h-4 mr-2" />
                {isReadOnlySearch ? "只读模式" : "重置"}
              </Button>
            </div>
            
            <div className="mt-4">
              {/* 显示搜索提示 */}
              {!hasSearched && <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <Search className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">请进行搜索</h3>
                  <p className="text-gray-600">输入搜索条件后点击"搜索"按钮查看用户列表</p>
                </div>}
              
              {/* 显示搜索结果 */}
              {hasSearched && <EmployeeTable employees={filteredEmployees} onEdit={emp => {
              setSelectedEmployee(emp);
              setEditDialogOpen(true);
            }} onDelete={handleDelete} loading={loading} totalCount={totalCount} currentPage={currentPage} pageSize={pageSize} onPageChange={handlePageChange} />}
            </div>
          </CardContent>
        </Card>

        <EmployeeEditDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} employee={selectedEmployee} onSave={handleSave} />
        
        <UserJsonImportExport open={importExportOpen} onOpenChange={setImportExportOpen} onComplete={handleImportExportComplete} $w={$w} // 传递$w参数
      />
      </div>
    </div>;
}