// @ts-ignore;
import React, { useState, useEffect, useMemo } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, useToast, Input, Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge, Switch, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui'; // @ts-ignore;
import { Plus, Search, Edit, Trash2, Building2, User, Check, X, AlertCircle, ChevronRight, ChevronDown, Home } from 'lucide-react';
export function DepartmentManagement() {
  const {
    toast } =
  useToast();
  const [departments, setDepartments] = useState([]);
  const [ministers, setMinisters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [formData, setFormData] = useState({
    departmentName: '',
    departmentCode: '',
    manager: '',
    description: '',
    parent_id: '',
    status: true });


  // 加载部门数据和部门负责人数据
  // 加载部门数据和部门负责人数据
  useEffect(() => {loadDepartments();
    loadMinisters();
  }, []);

  // 加载部门列表 - 从 mc_departments 数据模型获取
  // 加载部门列表 - 从 mc_departments 数据模型获取
  const loadDepartments = async () => {try {
      setIsLoading(true);
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'mc_departments',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            $master: true },

          orderBy: [{
            createdAt: 'desc' }] } });



      if (result && result.records) {
        setDepartments(result.records);
      }
    } catch (error) {
      console.error('加载部门数据失败:', error);
      toast({
        title: "加载失败",
        description: "无法加载部门数据，请稍后重试",
        variant: "destructive" });

    } finally {
      setIsLoading(false);
    }
  };

  // 加载部门负责人 - 从 mc_users 中筛选 isMinister=true 的用户
  // 加载部门负责人 - 从 mc_users 中筛选 isMinister=true 的用户
  const loadMinisters = async () => {try {
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'mc_users',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            $master: true },

          filter: {
            where: {
              isMinister: {
                $eq: true } } } } });





      if (result && result.records) {
        setMinisters(result.records);
      }
    } catch (error) {
      console.error('加载部门负责人数据失败:', error);
      toast({
        title: "加载失败",
        description: "无法加载部门负责人数据",
        variant: "destructive" });

    }
  };

  // 构建树形结构
  // 构建树形结构
  const buildTree = (items, parentId = null) => {return items.filter((item) => item.parent_id === parentId || item.parent_id === undefined && parentId === null).map((item) => ({
      ...item,
      children: buildTree(items, item._id) }));

  };

  // 获取树形结构
  // 获取树形结构
  const departmentTree = useMemo(() => {return buildTree(departments);
  }, [departments]);

  // 展开/折叠行
  // 展开/折叠行
  const toggleExpand = (departmentId) => {const newExpanded = new Set(expandedRows);
    if (newExpanded.has(departmentId)) {
      newExpanded.delete(departmentId);
    } else {
      newExpanded.add(departmentId);
    }
    setExpandedRows(newExpanded);
  };

  // 递归渲染树形表格行
  // 递归渲染树形表格行
  const renderTreeRows = (nodes, level = 0) => {return nodes.map((node) => {
      const hasChildren = node.children && node.children.length > 0;
      const isExpanded = expandedRows.has(node._id);
      return <React.Fragment key={node._id}>
          <TableRow className="hover:bg-gray-50">
            <TableCell className="font-medium">
              <div className="flex items-center" style={{
              paddingLeft: `${level * 24}px` }}>

                {hasChildren && <button onClick={() => toggleExpand(node._id)} className="mr-2 p-1 hover:bg-gray-100 rounded">
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>}
                {!hasChildren && <div className="w-6 mr-2" />}
                <Building2 className="w-4 h-4 mr-2 text-red-600" />
                {node.departmentName}
              </div>
            </TableCell>
            <TableCell>{node.departmentCode}</TableCell>
            <TableCell>{getMinisterName(node.manager)}</TableCell>
            <TableCell>{getParentName(node.parent_id)}</TableCell>
            <TableCell>{getStatusBadge(node.status)}</TableCell>
            <TableCell>
              {node.createdAt ? new Date(node.createdAt).toLocaleDateString() : '-'}
            </TableCell>
            <TableCell>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(node)} className="text-blue-600 hover:text-blue-700">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => toggleDepartmentStatus(node)} className={node.status ? "text-yellow-600 hover:text-yellow-700" : "text-green-600 hover:text-green-700"}>
                  {node.status ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete(node)} className="text-red-600 hover:text-red-700">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
          {hasChildren && isExpanded && renderTreeRows(node.children, level + 1)}
        </React.Fragment>;
    });
  };

  // 获取部门负责人名称
  // 获取部门负责人名称
  const getMinisterName = (ministerId) => {if (!ministerId || ministerId === '__none__') return '-';
    const minister = ministers.find((user) => user._id === ministerId);
    return minister ? minister.name : '-';
  };

  // 获取父部门名称
  // 获取父部门名称
  const getParentName = (parentId) => {if (!parentId || parentId === '__none__') return '-';
    const parent = departments.find((dept) => dept._id === parentId);
    return parent ? parent.departmentName : '-';
  };

  // 处理表单提交 - 新增/编辑部门
  // 处理表单提交 - 新增/编辑部门
  const handleSubmit = async (e) => {e.preventDefault();
    try {
      if (editingDepartment) {
        // 更新部门 - 移除 updatedAt 字段
        await $w.cloud.callDataSource({
          dataSourceName: 'mc_departments',
          methodName: 'wedaUpdateV2',
          params: {
            data: {
              departmentName: formData.departmentName,
              departmentCode: formData.departmentCode,
              manager: formData.manager === '__none__' ? '' : formData.manager,
              description: formData.description,
              parent_id: formData.parent_id === '__none__' ? null : formData.parent_id,
              status: formData.status },

            filter: {
              where: {
                _id: {
                  $eq: editingDepartment._id } } } } });





        toast({
          title: "更新成功",
          description: "部门信息已更新" });

      } else {
        // 新增部门 - 移除 createdAt 和 updatedAt 字段
        await $w.cloud.callDataSource({
          dataSourceName: 'mc_departments',
          methodName: 'wedaCreateV2',
          params: {
            data: {
              departmentName: formData.departmentName,
              departmentCode: formData.departmentCode,
              manager: formData.manager === '__none__' ? '' : formData.manager,
              description: formData.description,
              parent_id: formData.parent_id === '__none__' ? null : formData.parent_id,
              status: formData.status } } });



        toast({
          title: "添加成功",
          description: "新部门已添加" });

      }
      setShowAddDialog(false);
      setShowEditDialog(false);
      resetForm();
      loadDepartments();
    } catch (error) {
      console.error('保存部门信息失败:', error);
      toast({
        title: "保存失败",
        description: error.message || "无法保存部门信息，请稍后重试",
        variant: "destructive" });

    }
  };

  // 删除部门 - 使用真实数据模型
  // 删除部门 - 使用真实数据模型
  const handleDelete = async (department) => {// 检查是否有子部门
    const hasChildren = departments.some((dept) => dept.parent_id === department._id);
    if (hasChildren) {
      toast({
        title: "删除失败",
        description: "该部门下有子部门，请先删除子部门",
        variant: "destructive" });

      return;
    }
    if (!confirm(`确定要删除部门"${department.departmentName}"吗？此操作不可恢复。`)) {
      return;
    }
    try {
      await $w.cloud.callDataSource({
        dataSourceName: 'mc_departments',
        methodName: 'wedaDeleteV2',
        params: {
          filter: {
            where: {
              _id: {
                $eq: department._id } } } } });





      toast({
        title: "删除成功",
        description: "部门已删除" });

      loadDepartments();
    } catch (error) {
      console.error('删除部门失败:', error);
      toast({
        title: "删除失败",
        description: "无法删除部门，请稍后重试",
        variant: "destructive" });

    }
  };

  // 编辑部门
  // 编辑部门
  const handleEdit = (department) => {setEditingDepartment(department);
    setFormData({
      departmentName: department.departmentName || '',
      departmentCode: department.departmentCode || '',
      manager: department.manager || '__none__',
      description: department.description || '',
      parent_id: department.parent_id || '__none__',
      status: department.status !== false });

    setShowEditDialog(true);
  };

  // 重置表单
  // 重置表单
  const resetForm = () => {setFormData({
      departmentName: '',
      departmentCode: '',
      manager: '__none__',
      description: '',
      parent_id: '__none__',
      status: true });

    setEditingDepartment(null);
  };

  // 切换部门状态 - 使用真实数据模型
  // 切换部门状态 - 使用真实数据模型
  const toggleDepartmentStatus = async (department) => {try {
      await $w.cloud.callDataSource({
        dataSourceName: 'mc_departments',
        methodName: 'wedaUpdateV2',
        params: {
          data: {
            status: !department.status },

          filter: {
            where: {
              _id: {
                $eq: department._id } } } } });





      toast({
        title: "状态已更新",
        description: `部门已${!department.status ? '启用' : '禁用'}` });

      loadDepartments();
    } catch (error) {
      console.error('更新部门状态失败:', error);
      toast({
        title: "更新失败",
        description: "无法更新部门状态，请稍后重试",
        variant: "destructive" });

    }
  };

  // 获取状态徽章
  // 获取状态徽章
  const getStatusBadge = (status) => {return status ? <Badge className="bg-green-100 text-green-800">启用</Badge> : <Badge className="bg-gray-100 text-gray-800">禁用</Badge>;
  };

  // 获取父部门选项
  // 获取父部门选项
  const getParentOptions = () => {return departments.filter((dept) => !editingDepartment || dept._id !== editingDepartment._id);
  };

  // 过滤树形结构 - 支持层级搜索
  // 过滤树形结构 - 支持层级搜索
  const filterTree = (nodes, searchTerm) => {if (!searchTerm) return nodes;
    const searchLower = searchTerm.toLowerCase();
    return nodes.filter((node) => {
      const name = node.departmentName || '';
      const code = node.departmentCode || '';
      const manager = getMinisterName(node.manager).toLowerCase();
      const matchesSearch = name.toLowerCase().includes(searchLower) || code.toLowerCase().includes(searchLower) || manager.includes(searchLower);
      if (matchesSearch) return true;
      if (node.children && node.children.length > 0) {
        node.children = filterTree(node.children, searchTerm);
        return node.children.length > 0;
      }
      return false;
    });
  };

  // 获取过滤后的树形结构
  // 获取过滤后的树形结构
  const filteredTree = useMemo(() => {return filterTree(departmentTree, searchTerm);
  }, [departmentTree, searchTerm]);

  // 展开所有
  // 展开所有
  const expandAll = () => {const allIds = new Set();
    const collectIds = (nodes) => {
      nodes.forEach((node) => {
        if (node.children && node.children.length > 0) {
          allIds.add(node._id);
          collectIds(node.children);
        }
      });
    };
    collectIds(departmentTree);
    setExpandedRows(allIds);
  };

  // 折叠所有
  // 折叠所有
  const collapseAll = () => {setExpandedRows(new Set());
  };

  // 返回首页
  // 返回首页
  const handleBackToHome = () => {$w.utils.navigateTo({
      pageId: 'home',
      params: {} });

  };
  return <div className="space-y-6">
      {/* 操作栏 - 移除信息栏，添加返回首页按钮 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={handleBackToHome} className="flex items-center">
            <Home className="w-4 h-4 mr-2" />
            返回首页
          </Button>
        </div>
        
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input placeholder="搜索部门..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 w-64" />
          </div>
          
          <Button variant="outline" onClick={expandAll} className="text-blue-600">
            展开全部
          </Button>
          <Button variant="outline" onClick={collapseAll} className="text-blue-600">
            折叠全部
          </Button>
          
          <Dialog open={showAddDialog || showEditDialog} onOpenChange={showAddDialog ? setShowAddDialog : setShowEditDialog}>
            <DialogTrigger asChild>
              <Button className="bg-red-600 hover:bg-red-700">
                <Plus className="w-4 h-4 mr-2" />
                新增部门
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingDepartment ? '编辑部门' : '新增部门'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="departmentName">部门名称 *</Label>
                    <Input id="departmentName" value={formData.departmentName} onChange={(e) => setFormData({
                    ...formData,
                    departmentName: e.target.value })}
                  required />
                  </div>
                  <div>
                    <Label htmlFor="departmentCode">部门编码 *</Label>
                    <Input id="departmentCode" value={formData.departmentCode} onChange={(e) => setFormData({
                    ...formData,
                    departmentCode: e.target.value })}
                  required />
                  </div>
                  <div>
                    <Label htmlFor="manager">部门负责人</Label>
                    <Select value={formData.manager} onValueChange={(value) => setFormData({
                    ...formData,
                    manager: value })}>

                      <SelectTrigger>
                        <SelectValue placeholder="选择部门负责人" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">无负责人</SelectItem>
                        {ministers.map((minister) => <SelectItem key={minister._id} value={minister._id}>
                            {minister.name}
                          </SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="parent_id">上级部门</Label>
                    <Select value={formData.parent_id} onValueChange={(value) => setFormData({
                    ...formData,
                    parent_id: value })}>

                      <SelectTrigger>
                        <SelectValue placeholder="选择上级部门" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">无上级部门</SelectItem>
                        {getParentOptions().map((dept) => <SelectItem key={dept._id} value={dept._id}>
                            {dept.departmentName}
                          </SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status">状态</Label>
                    <Select value={formData.status.toString()} onValueChange={(value) => setFormData({
                    ...formData,
                    status: value === 'true' })}>

                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">启用</SelectItem>
                        <SelectItem value="false">禁用</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="description">部门描述</Label>
                    <Input id="description" value={formData.description} onChange={(e) => setFormData({
                    ...formData,
                    description: e.target.value })}
                  placeholder="请输入部门描述信息" />
                  </div>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => {
                  setShowAddDialog(false);
                  setShowEditDialog(false);
                  resetForm();
                }}>
                    取消
                  </Button>
                  <Button type="submit" className="bg-red-600 hover:bg-red-700">
                    {editingDepartment ? '保存修改' : '添加部门'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 部门树形列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span> </span>
            <span className="text-sm font-normal text-gray-500">
              共 {departments.length} 个部门
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            </div> : filteredTree.length === 0 ? <div className="text-center py-8 text-gray-500">
              <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>暂无部门数据</p>
            </div> : <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/3">部门名称</TableHead>
                    <TableHead>部门编码</TableHead>
                    <TableHead>负责人</TableHead>
                    <TableHead>上级部门</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>创建时间</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {renderTreeRows(filteredTree)}
                </TableBody>
              </Table>
            </div>}
        </CardContent>
      </Card>
    </div>;
}