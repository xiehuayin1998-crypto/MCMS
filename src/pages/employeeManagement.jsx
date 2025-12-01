// @ts-ignore;
import React, { useState, useEffect, useCallback } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, useToast, Badge } from '@/components/ui';
// @ts-ignore;
import { Plus, Users, Home, Upload, Search, Filter, RefreshCw, Shield, User, ChevronDown, Calendar, BookOpen, FileText, LayoutDashboard, UserCheck, UserX } from 'lucide-react';

import { UserHeader } from '@/components/UserHeader';
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
  const [currentUserInfo, setCurrentUserInfo] = useState(null);
  const [showBusinessMenu, setShowBusinessMenu] = useState(false);
  const [showDocumentMenu, setShowDocumentMenu] = useState(false);
  const [userLoading, setUserLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const {
    toast
  } = useToast();

  // 重构：参考会议室预定页面的用户信息获取方式
  const loadUserInfo = useCallback(async () => {
    try {
      setUserLoading(true);

      // 首先检查本地存储
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setCurrentUserInfo(parsedUser);
        setIsAdmin(parsedUser.isAdmin || false);
        setUserLoading(false);
        return;
      }

      // 如果本地存储没有，从数据源获取
      if ($w.auth.currentUser && $w.auth.currentUser.name) {
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
          setCurrentUserInfo(userInfo);
          setIsAdmin(userInfo.isAdmin);

          // 保存到本地存储
          localStorage.setItem('currentUser', JSON.stringify(userInfo));
        } else {
          // 如果查询不到用户记录，使用基础信息
          const basicUserInfo = {
            userId: $w.auth.currentUser.userId,
            name: $w.auth.currentUser.name,
            username: $w.auth.currentUser.name,
            isAdmin: false,
            department: '',
            employee_number: ''
          };
          setCurrentUserInfo(basicUserInfo);
          setIsAdmin(false);
        }
      } else {
        // 未登录状态
        setCurrentUserInfo(null);
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
      // 出错时使用基础信息
      if ($w.auth.currentUser) {
        const basicUserInfo = {
          userId: $w.auth.currentUser.userId,
          name: $w.auth.currentUser.name,
          username: $w.auth.currentUser.name,
          isAdmin: false,
          department: '',
          employee_number: ''
        };
        setCurrentUserInfo(basicUserInfo);
        setIsAdmin(false);
      } else {
        setCurrentUserInfo(null);
        setIsAdmin(false);
      }
    } finally {
      setUserLoading(false);
    }
  }, [$w.auth.currentUser, $w.cloud]);

  // 重构：简化加载逻辑
  useEffect(() => {
    const loadData = async () => {
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
      }
      await loadUserInfo();
    };
    loadData();
  }, [$w.page.dataset.params]);

  // 重构：简化刷新用户信息功能
  const refreshUserInfo = async () => {
    // 清除本地存储，强制重新获取
    localStorage.removeItem('currentUser');
    await loadUserInfo();
    toast({
      title: "用户信息已刷新",
      description: "当前用户信息已更新"
    });
  };

  // 检查用户权限 - 使用重构后的isAdmin状态
  const canManageUsers = useCallback(() => {
    return isAdmin;
  }, [isAdmin]);

  // 加载用户列表（保持不变）
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
        }, {
          employee_number: {
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
        description: error.message || "无法加载用户列表",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // 处理搜索按钮点击（保持不变）
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

  // 处理搜索和筛选（保持不变）
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

  // 处理重置按钮（保持不变）
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

  // 处理只读模式下的刷新按钮点击（保持不变）
  const handleRefresh = async () => {
    if (!isReadOnlySearch) return;
    const user = currentUserInfo;
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

  // 处理页码变化（保持不变）
  const handlePageChange = newPage => {
    loadEmployees(newPage);
  };

  // 处理保存（保持不变）
  const handleSave = async () => {
    await loadEmployees(currentPage);
  };

  // 处理删除 - 使用云函数绕过行级权限
  const handleDelete = async employee => {
    try {
      if (!currentUserInfo) {
        toast({
          title: "权限不足",
          description: "无法获取当前用户信息",
          variant: "destructive"
        });
        return;
      }
      // 使用重构后的isAdmin状态判断权限
      if (!isAdmin && currentUserInfo.userId !== employee._id) {
        toast({
          title: "权限不足",
          description: "您只能删除自己的账户，如需删除其他用户请联系管理员",
          variant: "destructive"
        });
        return;
      }

      // 使用云函数绕过行级权限进行删除
      const result = await $w.cloud.callFunction({
        name: 'updateUserPermission',
        data: {
          action: 'delete',
          userId: employee._id,
          currentUser: currentUserInfo
        }
      });
      if (result.result && result.result.success) {
        toast({
          title: "删除成功",
          description: "用户已删除"
        });
        const newTotalCount = totalCount - 1;
        const newTotalPages = Math.ceil(newTotalCount / pageSize);
        const newPage = currentPage > newTotalPages ? Math.max(1, newTotalPages) : currentPage;
        loadEmployees(newPage);
      } else {
        throw new Error(result.result?.error || '删除失败');
      }
    } catch (error) {
      console.error('删除失败:', error);
      toast({
        title: "删除失败",
        description: error.message || "无法删除用户",
        variant: "destructive"
      });
    }
  };

  // 处理导入导出完成（保持不变）
  const handleImportExportComplete = () => {
    setImportExportOpen(false);
    loadEmployees(currentPage);
    toast({
      title: "批量操作完成",
      description: "用户数据导入/导出操作已完成"
    });
  };

  // 处理导航菜单点击（保持不变）
  const handleNavigationClick = (type, item) => {
    if (type === 'business') {
      switch (item) {
        case 'meeting':
          $w.utils.navigateTo({
            pageId: 'meetingRoomBooking',
            params: {}
          });
          break;
        default:
          break;
      }
    } else if (type === 'document') {
      switch (item) {
        case 'regulation':
          $w.utils.navigateTo({
            pageId: 'regulationManagement',
            params: {
              category: '规章制度'
            }
          });
          break;
        case 'quality':
          $w.utils.navigateTo({
            pageId: 'qualitySystem',
            params: {
              category: '质量体系'
            }
          });
          break;
        case 'safety':
          $w.utils.navigateTo({
            pageId: 'safetyEnvironmentSystem',
            params: {
              category: '安环体系'
            }
          });
          break;
        default:
          break;
      }
    }
    setShowBusinessMenu(false);
    setShowDocumentMenu(false);
  };
  return <div className="min-h-screen bg-gray-50">
    {/* 使用统一的用户信息栏组件 */}
    <UserHeader $w={$w} showHomeButton={true} />

    {/* 导航栏 - 复用home页面的导航结构 */}
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* 左侧导航项 */}
          <div className="flex items-center space-x-8">
            <button onClick={() => $w.utils.navigateTo({
              pageId: 'home',
              params: {}
            })} className="flex items-center text-blue-600 hover:text-blue-800">
              <Home className="w-5 h-5 mr-2" />
              首页
            </button>

            {/* 业务功能管理 */}
            <div className="relative">
              <button onClick={() => {
                setShowBusinessMenu(!showBusinessMenu);
                setShowDocumentMenu(false);
              }} className="flex items-center text-gray-700 hover:text-gray-900">
                业务功能管理
                <ChevronDown className="w-4 h-4 ml-1" />
              </button>
              {showBusinessMenu && <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                <button onClick={() => handleNavigationClick('business', 'meeting')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  会议室预定
                </button>
              </div>}
            </div>

            {/* 管理文件 */}
            <div className="relative">
              <button onClick={() => {
                setShowDocumentMenu(!showDocumentMenu);
                setShowBusinessMenu(false);
              }} className="flex items-center text-gray-700 hover:text-gray-900">
                管理文件
                <ChevronDown className="w-4 h-4 ml-1" />
              </button>
              {showDocumentMenu && <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                <button onClick={() => handleNavigationClick('document', 'regulation')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                  <BookOpen className="w-4 h-4 mr-2" />
                  规章制度
                </button>
                <button onClick={() => handleNavigationClick('document', 'quality')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  质量体系
                </button>
                <button onClick={() => handleNavigationClick('document', 'safety')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                  <Shield className="w-4 h-4 mr-2" />
                  安环体系
                </button>
              </div>}
            </div>

            {/* 个人工作台 */}
            <div className="relative">
              <button onClick={() => $w.utils.navigateTo({
                pageId: 'personalDashboard',
                params: {}
              })} className="flex items-center text-gray-700 hover:text-gray-900">
                <LayoutDashboard className="w-5 h-5 mr-2" />
                个人工作台
              </button>
            </div>
          </div>

          {/* 右侧公司信息管理 - 仅管理员可点击，调整至最右边 */}
          {canManageUsers() && <div className="relative">
            <button onClick={() => $w.utils.navigateTo({
              pageId: 'employeeManagement',
              params: {}
            })} className="flex items-center text-blue-600 hover:text-blue-800">
              <Users className="w-5 h-5 mr-2" />
              员工管理
            </button>
          </div>}
        </div>
      </div>
    </nav>

    {/* 主内容区域 */}
    <div className="max-w-7xl mx-auto p-6">
      {/* 页面头部 */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
        <div className="flex items-center space-x-4">
          <div className="bg-white rounded-full p-3 shadow-lg">
            <Users className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              用户管理系统
              {isReadOnlySearch && <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  查看模式
                </Badge>}
            </h1>
            <p className="text-gray-600 mt-1">管理企业员工信息和权限分配</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={refreshUserInfo} className="flex items-center bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-300">
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新用户信息
          </Button>
          {canManageUsers() && <>
              <Button variant="outline" onClick={() => setImportExportOpen(true)} className="flex items-center bg-green-50 text-green-700 hover:bg-green-100 border-green-200">
                <Upload className="w-4 h-4 mr-2" />
                批量操作
              </Button>
              <Button onClick={() => {
              setSelectedEmployee(null);
              setEditDialogOpen(true);
            }} className="flex items-center bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                新增用户
              </Button>
            </>}
        </div>
      </div>

      {/* 用户统计卡片 - 修改为4列布局 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">总用户数</p>
                <p className="text-3xl font-bold">{totalCount}</p>
              </div>
              <Users className="w-12 h-12 opacity-20" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">当前页面</p>
                <p className="text-3xl font-bold">{filteredEmployees.length}</p>
              </div>
              <User className="w-12 h-12 opacity-20" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">权限状态</p>
                <p className="text-3xl font-bold">
                  {isAdmin ? '管理员' : '普通用户'}
                </p>
                {currentUserInfo && <p className="text-purple-200 text-sm mt-1">
                    {currentUserInfo.name} ({currentUserInfo.employee_number || '无工号'})
                  </p>}
              </div>
              <Shield className="w-12 h-12 opacity-20" />
            </div>
          </CardContent>
        </Card>

        {/* 当前用户信息卡片 - 使用重构后的数据 */}
        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100">当前用户</p>
                {userLoading ? <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    <span className="text-orange-200 text-sm">加载中...</span>
                  </div> : currentUserInfo ? <>
                    <p className="text-2xl font-bold truncate max-w-[150px]">
                      {currentUserInfo.username || currentUserInfo.name || '未知用户'}
                    </p>
                    <div className="flex items-center mt-2">
                      {isAdmin ? <UserCheck className="w-4 h-4 mr-1 text-green-300" /> : <UserX className="w-4 h-4 mr-1 text-red-300" />}
                      <span className="text-orange-200 text-sm">
                        {isAdmin ? '管理员' : '普通用户'}
                      </span>
                    </div>
                  </> : <>
                    <p className="text-2xl font-bold">未登录</p>
                    <div className="flex items-center mt-2">
                      <UserX className="w-4 h-4 mr-1 text-red-300" />
                      <span className="text-orange-200 text-sm">请先登录系统</span>
                    </div>
                  </>}
              </div>
              <div className="bg-orange-400/20 rounded-full p-3">
                {userLoading ? <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div> : currentUserInfo && isAdmin ? <UserCheck className="w-8 h-8 text-white" /> : <UserX className="w-8 h-8 text-white" />}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 主内容区域 */}
      <Card className="shadow-xl border-0">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
          <CardTitle className="flex items-center justify-between">
            <span className="text-xl font-semibold text-gray-900">用户列表</span>
            {isReadOnlySearch && <span className="text-sm text-blue-600 font-normal flex items-center">
                <User className="w-4 h-4 mr-1" />
                当前为只读查看模式
              </span>}
            {!canManageUsers() && <span className="text-sm text-orange-600 font-normal flex items-center">
                <Shield className="w-4 h-4 mr-1" />
                普通用户权限，只能查看和修改自己的信息
              </span>}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6">
          {/* 搜索筛选区域 */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <EmployeeSearchFilter onSearch={handleSearch} readOnly={isReadOnlySearch} initialSearchTerm={isReadOnlySearch ? searchParams.searchTerm : ''} />
            </div>
            
            {/* 操作按钮组 */}
            <div className="flex flex-col sm:flex-row gap-3">
              {isReadOnlySearch ? <Button onClick={handleRefresh} className="bg-blue-600 hover:bg-blue-700">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  刷新信息
                </Button> : <>
                  <Button onClick={handleSearchClick} className="bg-blue-600 hover:bg-blue-700">
                    <Search className="w-4 h-4 mr-2" />
                    搜索
                  </Button>
                  <Button variant="outline" onClick={handleReset}>
                    <Filter className="w-4 h-4 mr-2" />
                    重置
                  </Button>
                </>}
            </div>
          </div>
          
          {/* 内容区域 */}
          <div className="mt-4">
            {!hasSearched ? <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg border-2 border-dashed border-gray-200">
                <Search className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {isReadOnlySearch ? '正在加载您的信息...' : '开始搜索用户'}
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  {isReadOnlySearch ? '系统将自动显示您的个人信息，确保数据安全' : '输入姓名、用户名或工号进行搜索，支持部门筛选'}
                </p>
              </div> : <EmployeeTable employees={filteredEmployees} onEdit={emp => {
              setSelectedEmployee(emp);
              setEditDialogOpen(true);
            }} onDelete={handleDelete} loading={loading} totalCount={totalCount} currentPage={currentPage} pageSize={pageSize} onPageChange={handlePageChange} canEdit={canManageUsers()} $w={$w} // 传递$w参数
            />}
          </div>
        </CardContent>
      </Card>

      {/* 对话框组件 */}
      <EmployeeEditDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} employee={selectedEmployee} onSave={handleSave} $w={$w} currentUser={currentUserInfo} />
      
      <UserJsonImportExport open={importExportOpen} onOpenChange={setImportExportOpen} onComplete={handleImportExportComplete} $w={$w} />
    </div>
  </div>;
}