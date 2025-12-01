// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, useToast } from '@/components/ui';
// @ts-ignore;
import { Plus, Users, Home, Download, Upload, Search, Filter, RefreshCw } from 'lucide-react';

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
  const [loading, setLoading] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchParams, setSearchParams] = useState({
    searchTerm: '',
    department: '',
    role: ''
  });
  const [importExportOpen, setImportExportOpen] = useState(false);
  const [isReadOnlySearch, setIsReadOnlySearch] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const {
    toast
  } = useToast();

  // 获取当前登录用户信息
  const getCurrentUser = () => {
    try {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        const userInfo = JSON.parse(storedUser);
        setCurrentUser(userInfo);
        return userInfo;
      }
      return null;
    } catch (error) {
      console.error('获取当前用户信息失败:', error);
      return null;
    }
  };

  // 检查URL参数，处理自动搜索
  useEffect(() => {
    const params = $w.page.dataset.params;
    if (params && params.autoSearch) {
      setSearchParams(prev => ({
        ...prev,
        searchTerm: params.autoSearch
      }));
      setIsReadOnlySearch(params.readOnly === 'true');
      handleSearch(params.autoSearch, '', '');
      setHasSearched(true);
      toast({
        title: "自动搜索",
        description: `已自动搜索：${params.autoSearch}`
      });
    } else {
      getCurrentUser();
    }
  }, [$w.page.dataset.params]);

  // 加载用户列表
  const loadEmployees = async (page = 1) => {
    try {
      setLoading(true);
      const filter = {
        where: {}
      };
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

  // 处理搜索和筛选
  const handleSearch = (searchTerm, department, role) => {
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
  };

  // 处理重置按钮
  const handleReset = () => {
    if (isReadOnlySearch) return;
    setSearchParams({
      searchTerm: '',
      department: '',
      role: ''
    });
    setHasSearched(false);
    setEmployees([]);
    setFilteredEmployees([]);
    setTotalCount(0);
  };

  // 处理只读模式下的刷新按钮点击
  const handleRefresh = () => {
    if (!isReadOnlySearch) return;
    const user = getCurrentUser();
    if (!user || !user.name && !user.username) {
      toast({
        title: "刷新失败",
        description: "无法获取当前用户信息",
        variant: "destructive"
      });
      return;
    }
    const userName = user.name || user.username;
    setSearchParams({
      searchTerm: userName,
      department: '',
      role: ''
    });
    setHasSearched(true);
    setCurrentPage(1);
    loadEmployees(1);
    toast({
      title: "刷新成功",
      description: `已重新搜索：${userName}`
    });
  };

  // 处理页码变化
  const handlePageChange = newPage => {
    loadEmployees(newPage);
  };

  // 处理保存 - 使用云函数进行权限控制
  const handleSave = async () => {
    await loadEmployees(currentPage);
  };

  // 处理删除 - 使用云函数进行权限控制
  const handleDelete = async employee => {
    try {
      await $w.cloud.callFunction({
        name: 'user-update-with-permission',
        data: {
          userId: employee._id,
          action: 'delete'
        }
      });
      toast({
        title: "删除成功",
        description: "用户已删除"
      });
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

  // 监听搜索参数变化
  useEffect(() => {
    // 不自动加载数据
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
            
            {isReadOnlySearch ? <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Button onClick={handleRefresh} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  刷新
                </Button>
              </div> : <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Button onClick={handleSearchClick} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
                  <Search className="w-4 h-4 mr-2" />
                  搜索
                </Button>
                <Button variant="outline" onClick={handleReset} className="w-full sm:w-auto">
                  <Filter className="w-4 h-4 mr-2" />
                  重置
                </Button>
              </div>}
          </div>
          
          <div className="mt-4">
            {!hasSearched && <div className="text-center py-8 bg-gray-50 rounded-lg">
                <Search className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {isReadOnlySearch ? '正在加载您的信息...' : '请进行搜索'}
                </h3>
                <p className="text-gray-600">
                  {isReadOnlySearch ? '系统将自动显示您的个人信息' : '输入搜索条件后点击"搜索"按钮查看用户列表'}
                </p>
              </div>}
            
            {hasSearched && <EmployeeTable employees={filteredEmployees} onEdit={emp => {
              setSelectedEmployee(emp);
              setEditDialogOpen(true);
            }} onDelete={handleDelete} loading={loading} totalCount={totalCount} currentPage={currentPage} pageSize={pageSize} onPageChange={handlePageChange} $w={$w} />}
          </div>
        </CardContent>
      </Card>

      <EmployeeEditDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} employee={selectedEmployee} onSave={handleSave} $w={$w} />
      
      <UserJsonImportExport open={importExportOpen} onOpenChange={setImportExportOpen} onComplete={handleImportExportComplete} $w={$w} />
    </div>
  </div>;
}