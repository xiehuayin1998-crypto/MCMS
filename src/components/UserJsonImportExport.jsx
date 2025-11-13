// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, useToast, Card, CardContent, CardHeader, CardTitle, Tabs, TabsContent, TabsList, TabsTrigger, Input, Label, Badge, Textarea } from '@/components/ui';
// @ts-ignore;
import { Download, Upload, FileText, X, CheckCircle, AlertCircle, FileCode, Copy } from 'lucide-react';

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

  // 下载JSON模板（完全避免中文编码问题）
  const downloadTemplate = () => {
    try {
      // 创建JSON模板数据
      const templateData = [{
        name: "张三",
        username: "zhangsan",
        password: "123456",
        department: "技术部",
        sex: "男",
        employee_number: "EMP001",
        employee_type: "正式员工",
        Workplace: "墨西哥城",
        mexican_company_positions: "软件工程师",
        headquarters_location: "北京总部",
        original_position: "高级工程师",
        join_date: "2023-01-15",
        birthday: "1990-05-20",
        age: 33,
        birth_place: "北京市",
        political_status: "群众",
        education: "本科",
        graduation_institution: "清华大学",
        major: "计算机科学",
        job_title: "高级工程师",
        job_title_date: "2022-06-01",
        hierarchy: "P7",
        hierarchy_date: "2022-06-01",
        ID_number: "110101199005201234",
        official_passport: "E12345678",
        official_passport_date: "2025-12-31",
        private_passport: "P87654321",
        private_passport_date: "2025-12-31",
        use_visa_type: "工作签证",
        visa_validity_period: "2024-12-31",
        localization_expenses_time: "2023-02-01",
        permanent_address_china: "北京市朝阳区",
        contact_number_china: "13800138000",
        contact_number_mexico: "+52-55-1234-5678",
        first_date_mexico: "2023-01-20",
        emergency_contact_name_china: "李四",
        relationship_with_domestic_emergency_contacts: "配偶",
        emergency_contact_number_china: "13900139000",
        birthdate: "05-20"
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
        description: "JSON模板已下载，完美支持中文"
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
        description: `已导出 ${users.length} 条用户数据，使用JSON格式完美支持中文`
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

          // 准备用户数据
          const userToCreate = {
            name: userData.name || '',
            username: userData.username || '',
            password: userData.password || '123456',
            department: userData.department || '',
            sex: userData.sex || '',
            employee_number: userData.employee_number || '',
            employee_type: userData.employee_type || '',
            Workplace: userData.Workplace || '',
            mexican_company_positions: userData.mexican_company_positions || '',
            headquarters_location: userData.headquarters_location || '',
            original_position: userData.original_position || '',
            join_date: userData.join_date || '',
            birthday: userData.birthday || '',
            age: userData.age ? parseInt(userData.age) : null,
            birth_place: userData.birth_place || '',
            political_status: userData.political_status || '',
            education: userData.education || '',
            graduation_institution: userData.graduation_institution || '',
            major: userData.major || '',
            job_title: userData.job_title || '',
            job_title_date: userData.job_title_date || '',
            hierarchy: userData.hierarchy || '',
            hierarchy_date: userData.hierarchy_date || '',
            ID_number: userData.ID_number || '',
            official_passport: userData.official_passport || '',
            official_passport_date: userData.official_passport_date || '',
            private_passport: userData.private_passport || '',
            private_passport_date: userData.private_passport_date || '',
            use_visa_type: userData.use_visa_type || '',
            visa_validity_period: userData.visa_validity_period || '',
            localization_expenses_time: userData.localization_expenses_time || '',
            permanent_address_china: userData.permanent_address_china || '',
            contact_number_china: userData.contact_number_china || '',
            contact_number_mexico: userData.contact_number_mexico || '',
            first_date_mexico: userData.first_date_mexico || '',
            emergency_contact_name_china: userData.emergency_contact_name_china || '',
            relationship_with_domestic_emergency_contacts: userData.relationship_with_domestic_emergency_contacts || '',
            emergency_contact_number_china: userData.emergency_contact_number_china || '',
            birthdate: userData.birthdate || ''
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
      department: "技术部"
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
            用户批量操作 - JSON格式（中文完美支持）
          </DialogTitle>
          <DialogDescription>
            使用JSON格式完全避免中文编码问题，支持文件导入和文本粘贴两种方式
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
                    文件导入
                  </>}
              </Button>
              <Button onClick={handleJsonTextImport} disabled={!jsonData.trim() || importing} className="bg-green-600 hover:bg-green-700">
                {importing ? <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    正在导入...
                  </> : <>
                    <FileCode className="w-4 h-4 mr-2" />
                    文本导入
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
                  <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">JSON格式</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>下载JSON模板</Label>
                  <p className="text-sm text-gray-600">JSON格式完全避免中文编码问题</p>
                  <Button onClick={downloadTemplate} variant="outline" className="w-full border-green-200 hover:bg-green-50">
                    <Download className="w-4 h-4 mr-2" />
                    下载JSON模板
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>方式一：文件导入</Label>
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

                <div className="space-y-2">
                  <Label>方式二：文本粘贴</Label>
                  <p className="text-sm text-gray-600">直接粘贴JSON格式的用户数据</p>
                  <div className="flex space-x-2 mb-2">
                    <Button onClick={copyTemplateToClipboard} variant="outline" size="sm">
                      <Copy className="w-4 h-4 mr-1" />
                      复制模板
                    </Button>
                  </div>
                  <Textarea value={jsonData} onChange={e => setJsonData(e.target.value)} placeholder={`请输入JSON格式的用户数据，例如：
[
  {
    "name": "张三",
    "username": "zhangsan",
    "password": "123456",
    "department": "技术部"
  }
]`} rows={8} className="font-mono text-sm" />
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
                  导出所有用户数据为JSON格式，完全避免中文编码问题。
                  JSON格式更易于编辑和处理，支持各种编程语言。
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

        {/* 移除底部的DialogFooter，因为按钮已经移动到顶部 */}
      </DialogContent>
    </Dialog>;
}