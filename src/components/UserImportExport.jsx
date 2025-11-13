// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, useToast, Card, CardContent, CardHeader, CardTitle, Tabs, TabsContent, TabsList, TabsTrigger, Input, Label } from '@/components/ui';
// @ts-ignore;
import { Download, Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';

export function UserImportExport({
  open,
  onOpenChange,
  onComplete
}) {
  const [activeTab, setActiveTab] = useState('import');
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState(null);
  const [exporting, setExporting] = useState(false);
  const {
    toast
  } = useToast();

  // 下载导入模板
  const downloadTemplate = () => {
    try {
      // 创建模板数据
      const templateData = {
        name: '姓名',
        username: '用户名',
        password: '密码',
        department: '部门',
        roles: '角色',
        isAdmin: '是否管理员(true/false)',
        permissions: '权限列表(JSON格式)',
        isMinister: '是否部长(true/false)',
        navigationOrder: '功能导航顺序',
        gender: '性别',
        employee_number: '工号',
        employee_type: '类别',
        work_location: '工作地',
        mexico_position: '墨西哥公司职位',
        headquarters_unit: '总部所属单位',
        headquarters_position: '总部或原总部岗位',
        join_date: '入司时间(YYYY-MM-DD)',
        birth_date: '出生日期(YYYY-MM-DD)',
        age: '年龄',
        native_place: '籍贯',
        political_status: '政治面貌',
        education: '学历',
        graduation_school: '毕业院校',
        major: '专业',
        professional_title: '职称',
        current_title_appointment_date: '当前职称聘用时间(YYYY-MM-DD)',
        level: '层级',
        current_level_appointment_date: '当前层级聘用时间(YYYY-MM-DD)',
        id_card: '身份证号',
        official_passport: '因公护照号',
        official_passport_expiry: '因公护照有效期(YYYY-MM-DD)',
        private_passport: '因私护照号',
        private_passport_expiry: '因私护照到期时间(YYYY-MM-DD)',
        visa_type: '使用签证类型',
        visa_expiry: '签证有效期(YYYY-MM-DD)',
        localization_date: '本地化开支时间(YYYY-MM-DD)',
        domestic_address: '国内常住地址',
        domestic_phone: '国内联系电话',
        mexico_phone: '墨西哥联系电话',
        first_mexico_entry_date: '首次入境墨西哥时间(YYYY-MM-DD)',
        emergency_contact_name: '国内紧急联系人姓名',
        emergency_contact_relation: '与国内紧急联系人的关系',
        emergency_contact_phone: '国内紧急联系人电话',
        birthday: '生日(YYYY-MM-DD)'
      };

      // 转换为CSV格式
      const headers = Object.keys(templateData);
      const values = Object.values(templateData);
      const csvContent = [headers.join(','), values.join(',')].join('\n');

      // 创建下载链接
      const blob = new Blob([csvContent], {
        type: 'text/csv;charset=utf-8;'
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', '用户导入模板.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({
        title: "下载成功",
        description: "用户导入模板已下载"
      });
    } catch (error) {
      console.error('下载模板失败:', error);
      toast({
        title: "下载失败",
        description: "下载模板时发生错误",
        variant: "destructive"
      });
    }
  };

  // 导出用户数据
  const exportUsers = async () => {
    try {
      setExporting(true);

      // 获取所有用户数据
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'mc_users',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            $master: true
          },
          getCount: true
        }
      });
      if (!result.records || result.records.length === 0) {
        toast({
          title: "导出失败",
          description: "没有用户数据可导出",
          variant: "destructive"
        });
        return;
      }

      // 转换数据为CSV格式
      const users = result.records;
      const headers = Object.keys(users[0]).filter(key => !key.startsWith('_') && key !== 'owner' && key !== 'createBy' && key !== 'updateBy' && key !== 'createdAt' && key !== 'updatedAt');
      const csvContent = [headers.join(','), ...users.map(user => headers.map(header => {
        const value = user[header];
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value);
      }).join(','))].join('\n');

      // 创建下载链接
      const blob = new Blob([csvContent], {
        type: 'text/csv;charset=utf-8;'
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `用户数据_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({
        title: "导出成功",
        description: `已导出 ${users.length} 条用户数据`
      });
    } catch (error) {
      console.error('导出用户数据失败:', error);
      toast({
        title: "导出失败",
        description: "导出用户数据时发生错误",
        variant: "destructive"
      });
    } finally {
      setExporting(false);
    }
  };

  // 处理文件选择
  const handleFileSelect = event => {
    const file = event.target.files[0];
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        toast({
          title: "文件格式错误",
          description: "请选择CSV格式的文件",
          variant: "destructive"
        });
        return;
      }
      setImportFile(file);
    }
  };

  // 导入用户数据
  const importUsers = async () => {
    if (!importFile) {
      toast({
        title: "请选择文件",
        description: "请先选择要导入的CSV文件",
        variant: "destructive"
      });
      return;
    }
    try {
      setImporting(true);
      setImportResults(null);

      // 读取CSV文件
      const text = await readFileAsText(importFile);
      const lines = text.split('\n').filter(line => line.trim());
      if (lines.length < 2) {
        throw new Error('CSV文件格式不正确');
      }
      const headers = lines[0].split(',').map(h => h.trim());
      const data = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = values[index] || '';
        });
        return obj;
      });

      // 验证数据格式
      const requiredFields = ['name', 'username', 'password'];
      const results = {
        total: data.length,
        success: 0,
        failed: 0,
        errors: []
      };

      // 批量导入用户
      for (let i = 0; i < data.length; i++) {
        const userData = data[i];

        // 验证必填字段
        const missingFields = requiredFields.filter(field => !userData[field]);
        if (missingFields.length > 0) {
          results.failed++;
          results.errors.push(`第${i + 2}行: 缺少必填字段: ${missingFields.join(', ')}`);
          continue;
        }
        try {
          // 检查用户名是否已存在
          const existingUser = await $w.cloud.callDataSource({
            dataSourceName: 'mc_users',
            methodName: 'wedaGetRecordsV2',
            params: {
              select: {
                username: true
              },
              filter: {
                where: {
                  username: {
                    $eq: userData.username
                  }
                }
              },
              pageSize: 1
            }
          });
          if (existingUser.records && existingUser.records.length > 0) {
            results.failed++;
            results.errors.push(`第${i + 2}行: 用户名 "${userData.username}" 已存在`);
            continue;
          }

          // 创建用户
          await $w.cloud.callDataSource({
            dataSourceName: 'mc_users',
            methodName: 'wedaCreateV2',
            params: {
              data: {
                ...userData,
                isAdmin: userData.isAdmin === 'true',
                isMinister: userData.isMinister === 'true',
                age: userData.age ? parseInt(userData.age) : null,
                permissions: userData.permissions || '[]'
              }
            }
          });
          results.success++;
        } catch (error) {
          results.failed++;
          results.errors.push(`第${i + 2}行: ${error.message || '创建用户失败'}`);
        }
      }
      setImportResults(results);
      if (results.success > 0) {
        toast({
          title: "导入完成",
          description: `成功导入 ${results.success} 条用户数据，失败 ${results.failed} 条`
        });
      } else {
        toast({
          title: "导入失败",
          description: "所有用户数据导入失败",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('导入用户数据失败:', error);
      toast({
        title: "导入失败",
        description: error.message || "导入用户数据时发生错误",
        variant: "destructive"
      });
    } finally {
      setImporting(false);
    }
  };

  // 读取文件为文本
  const readFileAsText = file => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.onerror = e => reject(e);
      reader.readAsText(file);
    });
  };

  // 重置导入状态
  const resetImport = () => {
    setImportFile(null);
    setImportResults(null);
  };

  // 关闭对话框
  const handleClose = () => {
    resetImport();
    onOpenChange(false);
  };

  // 完成操作
  const handleComplete = () => {
    handleClose();
    if (onComplete) {
      onComplete();
    }
  };
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>用户批量操作</DialogTitle>
          <DialogDescription>
            支持批量导入和导出用户数据
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="import">
              <Upload className="w-4 h-4 mr-2" />
              导入用户
            </TabsTrigger>
            <TabsTrigger value="export">
              <Download className="w-4 h-4 mr-2" />
              导出用户
            </TabsTrigger>
          </TabsList>

          {/* 导入标签页 */}
          <TabsContent value="import" className="space-y-4 overflow-y-auto max-h-96">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  导入用户数据
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>下载导入模板</Label>
                  <p className="text-sm text-gray-600">请先下载模板文件，按照模板格式填写数据后再导入</p>
                  <Button onClick={downloadTemplate} variant="outline" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    下载导入模板
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>选择CSV文件</Label>
                  <Input type="file" accept=".csv" onChange={handleFileSelect} disabled={importing} />
                  {importFile && <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        <span className="text-sm">{importFile.name}</span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={resetImport} disabled={importing}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>}
                </div>

                {importResults && <Card className={importResults.failed > 0 ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        {importResults.failed > 0 ? <AlertCircle className="w-5 h-5 mr-2 text-red-600" /> : <CheckCircle className="w-5 h-5 mr-2 text-green-600" />}
                        导入结果
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p>总计: {importResults.total} 条</p>
                        <p className="text-green-600">成功: {importResults.success} 条</p>
                        <p className="text-red-600">失败: {importResults.failed} 条</p>
                        {importResults.errors.length > 0 && <div className="max-h-32 overflow-y-auto">
                            <p className="text-sm font-medium">错误详情:</p>
                            {importResults.errors.map((error, index) => <p key={index} className="text-xs text-red-600">{error}</p>)}
                          </div>}
                      </div>
                    </CardContent>
                  </Card>}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 导出标签页 */}
          <TabsContent value="export" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Download className="w-5 h-5 mr-2" />
                  导出用户数据
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  导出所有用户数据为CSV格式文件，包含完整的用户信息字段。
                </p>
                <Button onClick={exportUsers} disabled={exporting} className="w-full">
                  {exporting ? <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      正在导出...
                    </> : <>
                      <Download className="w-4 h-4 mr-2" />
                      导出用户数据
                    </>}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={handleClose}>
            取消
          </Button>
          {activeTab === 'import' && <Button onClick={importUsers} disabled={!importFile || importing}>
              {importing ? <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  正在导入...
                </> : <>
                  <Upload className="w-4 h-4 mr-2" />
                  开始导入
                </>}
            </Button>}
          {activeTab === 'export' && <Button onClick={handleComplete} variant="outline">
              完成
            </Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>;
}