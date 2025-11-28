// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, useToast, Card, CardContent, CardHeader, CardTitle, Tabs, TabsContent, TabsList, TabsTrigger, Input, Label, Badge, Textarea } from '@/components/ui';
// @ts-ignore;
import { Download, Upload, FileText, X, CheckCircle, AlertCircle, FileCode, Copy, FileSpreadsheet } from 'lucide-react';

export function UserJsonImportExport({
  open,
  onOpenChange,
  onComplete,
  $w // 添加$w参数
}) {
  const [activeTab, setActiveTab] = useState('import');
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [jsonData, setJsonData] = useState('');
  const {
    toast
  } = useToast();

  // 下载JSON模板（根据最新数据模型）
  const downloadJsonTemplate = () => {
    try {
      // 创建JSON模板数据，完全匹配最新的数据模型字段
      const templateData = [{
        name: "张三",
        username: "zhangsan",
        password: "123456",
        isAdmin: false,
        permissions: "",
        roles: ["user"],
        roles_level: [1],
        isMinister: false,
        navigationOrder: "",
        department: "技术部",
        sex: "男",
        employee_number: "EMP001",
        employee_type: "正式员工",
        Workplace: "墨西哥城",
        company: "墨西哥轨道交通装备有限公司",
        headquarters_location: "北京总部",
        job_position_number: "POS001",
        join_date: "2023-01-15",
        birthday: "1990-05-20",
        age: 33,
        birth_place: "北京市",
        social_security_number: "SSN001",
        rfc: "RFC001",
        education: "本科",
        graduation_institution: "清华大学",
        major: "计算机科学",
        country_of_citizenship: "中国",
        address: "墨西哥城某街道123号",
        telephone_number: "+52-55-1234-5678",
        ID_number: "110101199005201234",
        e_mail: "zhangsan@example.com",
        emergency_contact: "李四",
        telephone_number_of_emergency_contact: "13900139000"
      }];
      const jsonContent = JSON.stringify(templateData, null, 2);
      const blob = new Blob([jsonContent], {
        type: 'application/json; charset=utf-8'
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = '用户导入模板.json';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast({
        title: "下载成功",
        description: "JSON模板已下载，完全匹配最新数据模型"
      });
    } catch (error) {
      console.error('下载模板失败:', error);
      toast({
        title: "下载失败",
        description: error.message || "下载模板时发生错误",
        variant: "destructive"
      });
    }
  };

  // 下载Excel模板（CSV格式）
  const downloadExcelTemplate = () => {
    try {
      // 创建CSV格式的Excel模板
      const csvHeaders = ['name', 'username', 'password', 'isAdmin', 'permissions', 'roles', 'roles_level', 'isMinister', 'navigationOrder', 'department', 'sex', 'employee_number', 'employee_type', 'Workplace', 'company', 'headquarters_location', 'job_position_number', 'join_date', 'birthday', 'age', 'birth_place', 'social_security_number', 'rfc', 'education', 'graduation_institution', 'major', 'country_of_citizenship', 'address', 'telephone_number', 'ID_number', 'e_mail', 'emergency_contact', 'telephone_number_of_emergency_contact'];
      const csvContent = [csvHeaders.join(','), '张三,zhangsan,123456,false,,user,1,false,,技术部,男,EMP001,正式员工,墨西哥城,墨西哥轨道交通装备有限公司,北京总部,POS001,2023-01-15,1990-05-20,33,北京市,SSN001,RFC001,本科,清华大学,计算机科学,中国,墨西哥城某街道123号,+52-55-1234-5678,110101199005201234,zhangsan@example.com,李四,13900139000'].join('\n');

      // 添加BOM头解决中文乱码问题
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], {
        type: 'text/csv; charset=utf-8'
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = '用户导入模板.csv';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast({
        title: "下载成功",
        description: "Excel模板已下载，可在Excel中编辑后导入"
      });
    } catch (error) {
      console.error('下载Excel模板失败:', error);
      toast({
        title: "下载失败",
        description: error.message || "下载Excel模板时发生错误",
        variant: "destructive"
      });
    }
  };

  // 导出用户数据为JSON格式
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
      const users = result.records;
      const jsonContent = JSON.stringify(users, null, 2);
      const blob = new Blob([jsonContent], {
        type: 'application/json; charset=utf-8'
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `用户数据_${new Date().toISOString().split('T')[0]}.json`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast({
        title: "导出成功",
        description: `已导出 ${users.length} 条用户数据，使用JSON格式`
      });
    } catch (error) {
      console.error('导出用户数据失败:', error);
      toast({
        title: "导出失败",
        description: error.message || "导出用户数据时发生错误",
        variant: "destructive"
      });
    } finally {
      setExporting(false);
    }
  };

  // 处理JSON文件选择
  const handleFileSelect = event => {
    const file = event.target.files[0];
    if (file) {
      if (file.type !== 'application/json' && !file.name.toLowerCase().endsWith('.json')) {
        toast({
          title: "文件格式错误",
          description: "请选择JSON格式的文件",
          variant: "destructive"
        });
        return;
      }
      setImportFile(file);
    }
  };

  // 读取JSON文件
  const readJsonFile = file => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const text = e.target.result;
          const data = JSON.parse(text);
          if (!Array.isArray(data)) {
            throw new Error('JSON文件必须包含数组格式的数据');
          }
          resolve(data);
        } catch (error) {
          reject(new Error(`JSON解析失败: ${error.message}`));
        }
      };
      reader.onerror = e => reject(new Error('文件读取失败'));
      reader.readAsText(file, 'UTF-8');
    });
  };

  // 处理JSON文本导入
  const handleJsonTextImport = async () => {
    if (!jsonData.trim()) {
      toast({
        title: "请输入数据",
        description: "请先输入JSON格式的用户数据",
        variant: "destructive"
      });
      return;
    }
    try {
      setImporting(true);
      const data = JSON.parse(jsonData);
      if (!Array.isArray(data)) {
        throw new Error('JSON数据必须是数组格式');
      }
      await importUserData(data);
    } catch (error) {
      toast({
        title: "JSON格式错误",
        description: error.message || "请检查JSON格式是否正确",
        variant: "destructive"
      });
    } finally {
      setImporting(false);
    }
  };

  // 导入用户数据
  const importUserData = async data => {
    try {
      setImporting(true);
      setImportResults(null);
      const results = {
        total: data.length,
        success: 0,
        failed: 0,
        errors: []
      };

      // 批量导入用户
      for (let i = 0; i < data.length; i++) {
        const userData = data[i];
        try {
          // 验证必填字段
          if (!userData.name || !userData.username) {
            results.failed++;
            results.errors.push(`第${i + 1}条: 缺少必填字段(姓名或用户名)`);
            continue;
          }

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
            results.errors.push(`第${i + 1}条: 用户名 "${userData.username}" 已存在`);
            continue;
          }

          // 准备用户数据，完全匹配数据模型字段
          const userToCreate = {
            name: userData.name || '',
            username: userData.username || '',
            password: userData.password || '123456',
            isAdmin: userData.isAdmin || false,
            permissions: userData.permissions || '',
            roles: userData.roles || ['user'],
            roles_level: userData.roles_level || [1],
            isMinister: userData.isMinister || false,
            navigationOrder: userData.navigationOrder || '',
            department: userData.department || '',
            sex: userData.sex || '',
            employee_number: userData.employee_number || '',
            employee_type: userData.employee_type || '',
            Workplace: userData.Workplace || '',
            company: userData.company || '',
            headquarters_location: userData.headquarters_location || '',
            job_position_number: userData.job_position_number || '',
            join_date: userData.join_date || '',
            birthday: userData.birthday || '',
            age: userData.age ? parseInt(userData.age) : null,
            birth_place: userData.birth_place || '',
            social_security_number: userData.social_security_number || '',
            rfc: userData.rfc || '',
            education: userData.education || '',
            graduation_institution: userData.graduation_institution || '',
            major: userData.major || '',
            country_of_citizenship: userData.country_of_citizenship || '',
            address: userData.address || '',
            telephone_number: userData.telephone_number || '',
            ID_number: userData.ID_number || '',
            e_mail: userData.e_mail || '',
            emergency_contact: userData.emergency_contact || '',
            telephone_number_of_emergency_contact: userData.telephone_number_of_emergency_contact || ''
          };

          // 创建用户
          await $w.cloud.callDataSource({
            dataSourceName: 'mc_users',
            methodName: 'wedaCreateV2',
            params: {
              data: userToCreate
            }
          });
          results.success++;
        } catch (error) {
          results.failed++;
          results.errors.push(`第${i + 1}条: ${error.message || '创建用户失败'}`);
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

  // 文件导入
  const importUsers = async () => {
    if (!importFile) {
      toast({
        title: "请选择文件",
        description: "请先选择要导入的JSON文件",
        variant: "destructive"
      });
      return;
    }
    try {
      const data = await readJsonFile(importFile);
      await importUserData(data);
    } catch (error) {
      toast({
        title: "导入失败",
        description: error.message || "导入用户数据时发生错误",
        variant: "destructive"
      });
    }
  };

  // 复制模板到剪贴板
  const copyTemplateToClipboard = () => {
    const templateData = [{
      name: "张三",
      username: "zhangsan",
      password: "123456",
      department: "技术部",
      sex: "男",
      employee_number: "EMP001",
      employee_type: "正式员工",
      Workplace: "墨西哥城",
      company: "墨西哥轨道交通装备有限公司"
    }];
    const jsonText = JSON.stringify(templateData, null, 2);
    navigator.clipboard.writeText(jsonText).then(() => {
      toast({
        title: "复制成功",
        description: "模板数据已复制到剪贴板"
      });
    }).catch(() => {
      toast({
        title: "复制失败",
        description: "无法复制到剪贴板",
        variant: "destructive"
      });
    });
  };

  // 重置导入状态
  const resetImport = () => {
    setImportFile(null);
    setImportResults(null);
    setJsonData('');
  };

  // 关闭对话框
  const handleClose = () => {
    resetImport();
    onOpenChange(false);
  };

  // 完成操作
  const handleComplete = () => {
    handleClose();
    if (onComplete) onComplete();
  };
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileCode className="w-6 h-6 mr-2 text-blue-600" />
            用户批量操作
          </DialogTitle>
          <DialogDescription>
            支持JSON格式和Excel格式的导入导出，完全匹配最新数据模型
          </DialogDescription>
        </DialogHeader>

        {/* 将按钮移动到对话框标题下方 */}
        <div className="flex justify-between items-center py-4 border-b">
          <Button variant="outline" onClick={handleClose}>
            取消
          </Button>
          {activeTab === 'import' && <div className="flex space-x-2">
              <Button onClick={importUsers} disabled={!importFile || importing} variant="outline" className="border-blue-200 hover:bg-blue-50">
                {importing ? <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    正在导入...
                  </> : <>
                    <Upload className="w-4 h-4 mr-2" />
                    JSON文件导入
                  </>}
              </Button>
              <Button onClick={handleJsonTextImport} disabled={!jsonData.trim() || importing} className="bg-green-600 hover:bg-green-700">
                {importing ? <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    正在导入...
                  </> : <>
                    <FileCode className="w-4 h-4 mr-2" />
                    JSON文本导入
                  </>}
              </Button>
            </div>}
          {activeTab === 'export' && <Button onClick={handleComplete} variant="outline">
              完成
            </Button>}
        </div>

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
                  <div className="flex space-x-2 ml-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">JSON格式</Badge>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">Excel格式</Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 模板下载区域 */}
                <div className="space-y-4">
                  <Label>下载导入模板</Label>
                  <p className="text-sm text-gray-600">选择适合您的模板格式进行下载</p>
                  <div className="grid grid-cols-2 gap-4">
                    <Button onClick={downloadJsonTemplate} variant="outline" className="border-green-200 hover:bg-green-50 h-16 flex flex-col">
                      <FileCode className="w-5 h-5 mb-1 text-green-600" />
                      <span className="text-sm">JSON模板</span>
                      <span className="text-xs text-gray-500">推荐开发人员使用</span>
                    </Button>
                    <Button onClick={downloadExcelTemplate} variant="outline" className="border-blue-200 hover:bg-blue-50 h-16 flex flex-col">
                      <FileSpreadsheet className="w-5 h-5 mb-1 text-blue-600" />
                      <span className="text-sm">Excel模板</span>
                      <span className="text-xs text-gray-500">推荐普通用户使用</span>
                    </Button>
                  </div>
                </div>

                {/* JSON文件导入 */}
                <div className="space-y-2">
                  <Label>方式一：JSON文件导入</Label>
                  <p className="text-sm text-gray-600">选择JSON格式的文件进行导入</p>
                  <Input type="file" accept=".json" onChange={handleFileSelect} disabled={importing} className="border-2 border-dashed border-gray-300 p-4 hover:border-green-300 transition-colors" />
                  {importFile && <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                        <div>
                          <span className="font-medium text-green-800">{importFile.name}</span>
                          <p className="text-sm text-green-600">文件已选择，准备导入</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setImportFile(null)} disabled={importing}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>}
                </div>

                {/* JSON文本粘贴 */}
                <div className="space-y-2">
                  <Label>方式二：JSON文本粘贴</Label>
                  <p className="text-sm text-gray-600">直接粘贴JSON格式的用户数据</p>
                  <div className="flex space-x-2 mb-2">
                    <Button onClick={copyTemplateToClipboard} variant="outline" size="sm">
                      <Copy className="w-4 h-4 mr-1" />
                      复制JSON模板
                    </Button>
                  </div>
                  <Textarea value={jsonData} onChange={e => setJsonData(e.target.value)} placeholder={`请输入JSON格式的用户数据，例如：
[
  {
    "name": "张三",
    "username": "zhangsan",
    "password": "123456",
    "department": "技术部",
    "sex": "男",
    "employee_number": "EMP001"
  }
]`} rows={8} className="font-mono text-sm" />
                </div>

                {/* Excel导入说明 */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <FileSpreadsheet className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="font-medium text-blue-800">Excel模板使用说明</span>
                  </div>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• 下载Excel模板后，在Excel中编辑数据</li>
                    <li>• 保存为CSV格式（UTF-8编码）</li>
                    <li>• 目前仅支持JSON格式导入，Excel数据需转换为JSON格式</li>
                    <li>• 推荐使用在线工具将Excel转换为JSON</li>
                  </ul>
                </div>

                {importResults && <Card className={importResults.failed > 0 ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        {importResults.failed > 0 ? <AlertCircle className="w-5 h-5 mr-2 text-red-600" /> : <CheckCircle className="w-5 h-5 mr-2 text-green-600" />}
                        导入结果
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-gray-900">{importResults.total}</p>
                            <p className="text-sm text-gray-600">总计</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-green-600">{importResults.success}</p>
                            <p className="text-sm text-green-600">成功</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-red-600">{importResults.failed}</p>
                            <p className="text-sm text-red-600">失败</p>
                          </div>
                        </div>
                        {importResults.errors.length > 0 && <div className="max-h-32 overflow-y-auto">
                            <p className="text-sm font-medium mb-2">错误详情:</p>
                            {importResults.errors.map((error, index) => <p key={index} className="text-xs text-red-600 bg-red-100 p-1 rounded">
                                {error}
                              </p>)}
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
                  <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800">JSON格式</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  导出所有用户数据为JSON格式，包含所有字段信息。
                  JSON格式便于数据交换和备份。
                </p>
                <Button onClick={exportUsers} disabled={exporting} className="w-full bg-blue-600 hover:bg-blue-700">
                  {exporting ? <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      正在导出...
                    </> : <>
                      <Download className="w-4 h-4 mr-2" />
                      导出用户数据（JSON格式）
                    </>}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>;
}