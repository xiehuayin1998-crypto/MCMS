// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Button, Badge, useToast, AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui';
// @ts-ignore;
import { Edit, Trash2, User, Mail, Phone, Building, Shield } from 'lucide-react';

// @ts-ignore;
import { EmployeeEditDialog } from './EmployeeEditDialog';
export function EmployeeTable({
  employees = [],
  departments = [],
  roles = [],
  onEmployeeUpdated,
  onEmployeeDeleted,
  $w
}) {
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [deletingEmployee, setDeletingEmployee] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [useCloudFunction, setUseCloudFunction] = useState(false);
  const {
    toast
  } = useToast();

  // 检查云函数是否存在
  const checkCloudFunction = async () => {
    try {
      const result = await $w.cloud.callFunction({
        name: 'update-user',
        data: {
          test: true
        }
      });
      setUseCloudFunction(true);
      return true;
    } catch (error) {
      if (error.code === 'FUNCTION_NOT_FOUND') {
        console.warn('update-user 云函数未找到，将使用 wedaUpdateV2');
        setUseCloudFunction(false);
        return false;
      }
      console.warn('云函数调用失败，将使用 wedaUpdateV2:', error);
      setUseCloudFunction(false);
      return false;
    }
  };
  useEffect(() => {
    checkCloudFunction();
  }, []);
  const handleEdit = employee => {
    setEditingEmployee(employee);
    setEditDialogOpen(true);
  };
  const handleDelete = employee => {
    setDeletingEmployee(employee);
    setDeleteDialogOpen(true);
  };
  const confirmDelete = async () => {
    if (!deletingEmployee) return;
    try {
      let result;
      if (useCloudFunction) {
        // 使用 update-user 云函数删除用户（软删除）
        const cloudResult = await $w.cloud.callFunction({
          name: 'update-user',
          data: {
            userId: deletingEmployee._id,
            updateData: {
              status: 'deleted',
              deletedAt: new Date().getTime()
            }
          }
        });
        if (cloudResult.result.success) {
          result = {
            count: 1
          };
        } else {
          const errorMessage = cloudResult.result.errorMessage || '删除失败';
          if (errorMessage.includes('未找到') || errorMessage.includes('not found')) {
            throw new Error('未找到指定的用户记录');
          }
          throw new Error(errorMessage);
        }
      } else {
        // 使用 wedaDeleteV2 作为备选方案
        result = await $w.cloud.callDataSource({
          dataSourceName: 'mc_users',
          methodName: 'wedaDeleteV2',
          params: {
            filter: {
              where: {
                _id: {
                  $eq: deletingEmployee._id
                }
              }
            }
          }
        });
      }
      if (result.count > 0) {
        toast({
          title: "删除成功",
          description: `员工 "${deletingEmployee.name}" 已删除`
        });
        onEmployeeDeleted && onEmployeeDeleted();
      } else {
        throw new Error('未找到指定的用户记录');
      }
    } catch (error) {
      console.error('删除员工失败:', error);
      const errorMessage = error.message || '删除员工时发生错误';
      toast({
        title: "删除失败",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setDeleteDialogOpen(false);
      setDeletingEmployee(null);
    }
  };

  // 安全获取部门名称
  const getDepartmentName = departmentId => {
    if (!Array.isArray(departments) || !departmentId) {
      return '未分配';
    }
    const dept = departments.find(d => d._id === departmentId);
    return dept ? dept.name : '未分配';
  };

  // 安全获取角色名称
  const getRoleNames = roleIds => {
    if (!Array.isArray(roleIds) || !Array.isArray(roles) || roles.length === 0) {
      return [];
    }
    return roleIds.map(roleId => {
      const role = roles.find(r => r._id === roleId);
      return role ? role.roleName : '未知角色';
    });
  };

  // 安全渲染员工列表
  const renderEmployeeList = () => {
    if (!Array.isArray(employees) || employees.length === 0) {
      return <TableRow>
          <TableCell colSpan={10} className="text-center py-8 text-gray-500">
            暂无员工数据
          </TableCell>
        </TableRow>;
    }
    return employees.map(employee => <TableRow key={employee._id}>
        <TableCell className="font-medium">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-gray-500" />
            <span>{employee.name}</span>
          </div>
        </TableCell>
        <TableCell>{employee.username}</TableCell>
        <TableCell>
          <div className="flex items-center space-x-1">
            <Mail className="w-4 h-4 text-gray-500" />
            <span>{employee.email}</span>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center space-x-1">
            <Phone className="w-4 h-4 text-gray-500" />
            <span>{employee.phone}</span>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center space-x-1">
            <Building className="w-4 h-4 text-gray-500" />
            <span>{getDepartmentName(employee.department)}</span>
          </div>
        </TableCell>
        <TableCell>{employee.position}</TableCell>
        <TableCell>{employee.employee_number}</TableCell>
        <TableCell>
          <Badge variant={employee.status === 'active' ? 'default' : employee.status === 'inactive' ? 'destructive' : 'secondary'}>
            {employee.status === 'active' ? '在职' : employee.status === 'inactive' ? '离职' : '暂停'}
          </Badge>
        </TableCell>
        <TableCell>
          <div className="flex flex-wrap gap-1">
            {getRoleNames(employee.roles).map(roleName => <Badge key={roleName} variant="outline" className="text-xs">
                <Shield className="w-3 h-3 mr-1" />
                {roleName}
              </Badge>)}
          </div>
        </TableCell>
        <TableCell>
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" onClick={() => handleEdit(employee)}>
              <Edit className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDelete(employee)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>);
  };
  return <div className="space-y-4">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>姓名</TableHead>
              <TableHead>用户名</TableHead>
              <TableHead>邮箱</TableHead>
              <TableHead>电话</TableHead>
              <TableHead>部门</TableHead>
              <TableHead>职位</TableHead>
              <TableHead>工号</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>角色</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {renderEmployeeList()}
          </TableBody>
        </Table>
      </div>

      {/* 编辑对话框 */}
      <EmployeeEditDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} employee={editingEmployee} departments={departments} roles={roles} onEmployeeUpdated={onEmployeeUpdated} $w={$w} />

      {/* 删除确认对话框 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除员工 "{deletingEmployee?.name}" 吗？此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>;
}