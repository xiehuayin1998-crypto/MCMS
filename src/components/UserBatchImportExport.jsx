// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, useToast, Card, CardContent, CardHeader, CardTitle, Tabs, TabsContent, TabsList, TabsTrigger, Input, Label, Badge } from '@/components/ui';
// @ts-ignore;
import { Download, Upload, FileText, X, CheckCircle, AlertCircle, FileSpreadsheet } from 'lucide-react';

export function UserBatchImportExport({
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

  // 更可靠的CSV编码函数 - 专门针对中文优化
  const encodeCSVForChinese = (data, headers) => {
    // 使用UTF-8 BOM标记，这是Excel识别中文编码的关键
    const BOM = '\uFEFF';

    // 构建CSV内容
    const lines = [];

    // 1. 添加表头行 - 使用中文表头
    const headerLine = headers.map(header => {
      // 对中文表头进行特殊处理，确保编码正确
      return `"${header.replace(/"/g, '""')}"`;
    }).join(',');
    lines.push(headerLine);

    // 2. 添加数据行
    data.forEach(row => {
      const rowLine = headers.map(header => {
        let value = row[header] || '';

        // 处理不同类型的数据
        if (typeof value === 'string') {
          // 转义引号并确保中文字符正确编码
          value = value.replace(/"/g, '""');
          // 对包含逗号、换行符或引号的值进行引号包围
          if (value.includes(',') || value.includes('\n') || value.includes('"')) {
            return `"${value}"`;
          }
          return value;
        } else if (value instanceof Date) {
          // 日期格式处理
          return value.toISOString().split('T')[0];
        } else if (value === null || value === undefined) {
          return '';
        }
        return String(value);
      }).join(',');
      lines.push(rowLine);
    });
    return BOM + lines.join('\r\n'); // 使用\r\n确保Windows兼容性
  };

  // 改进的CSV解析函数 - 专门处理中文编码
  const parseCSVWithChinese = csvText => {
    try {
      // 检测并移除BOM标记
      let content = csvText;
      if (csvText.charCodeAt(0) === 0xFEFF) {
        content = csvText.substring(1);
      }
      const lines = content.split('\r\n').filter(line => line.trim() !== '');
      if (lines.length < 2) {
        throw new Error('CSV文件格式不正确或为空');
      }

      // 解析表头
      const headers = parseCSVLineImproved(lines[0]);

      // 解析数据行
      const data = [];
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === '') continue;
        const values = parseCSVLineImproved(lines[i]);
        if (values.length === headers.length) {
          const row = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          data.push(row);
        } else {
          console.warn(`第${i + 1}行列数不匹配: 期望${headers.length}列，实际${values.length}列`);
        }
      }
      return data;
    } catch (error) {
      throw new Error(`CSV解析失败: ${error.message}`);
    }
  };

  // 更可靠的CSV行解析函数
  const parseCSVLineImproved = line => {
    const values = [];
    let currentValue = '';
    let inQuotes = false;
    let escapeNext = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (escapeNext) {
        currentValue += char;
        escapeNext = false;
        continue;
      }
      if (char === '\\') {
        escapeNext = true;
        continue;
      }
      if (char === '"') {
        inQuotes = !inQuotes;
        continue;
      }
      if (char === ',' && !inQuotes) {
        values.push(currentValue.trim());
        currentValue = '';
        continue;
      }
      currentValue += char;
    }

    // 添加最后一个值
    values.push(currentValue.trim());

    // 清理引号
    return values.map(value => {
      // 移除外层的引号
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, value.length - 1);
      }
      // 处理转义的引号
      value = value.replace(/""/g, '"');
      return value;
    });
  };

  // 下载导入模板（完全支持中文）
  const downloadTemplate = () => {
    try {
      // 创建模板数据 - 使用中文表头
      const templateData = [{
        '姓名': '张三',
        '用户名': 'zhangsan',
        '密码': '123456',
        '部门': '技术部',
        '性别': '男',
        '工号': 'EMP001',
        '类别': '正式员工',
        '工作地': '墨西哥城',
        '墨西哥公司职位': '软件工程师',
        '总部所属单位': '北京总部',
        '总部或原总部岗位': '高级工程师',
        '入司时间': '2023-01-15',
        '出生日期': '1990-05-20',
        '年龄': '33',
        '籍贯': '北京市',
        '政治面貌': '群众',
        '学历': '本科',
        '毕业院校': '清华大学',
        '专业': '计算机科学',
        '职称': '高级工程师',
        '当前职称聘用时间': '2022-06-01',
        '层级': 'P7',
        '当前层级聘用时间': '2022-06-01',
        '身份证号': '110101199005201234',
        '因公护照号': 'E12345678',
        '因公护照有效期': '2025-12-31',
        '因私护照号': 'P87654321',
        '因私护照到期时间': '2025-12-31',
        '使用签证类型': '工作签证',
        '签证有效期': '2024-12-31',
        '本地化开支时间': '2023-02-01',
        '国内常住地址': '北京市朝阳区',
        '国内联系电话': '13800138000',
        '墨西哥联系电话': '+52-55-1234-5678',
        '首次入境墨西哥时间': '2023-01-20',
        '国内紧急联系人姓名': '李四',
        '与国内紧急联系人的关系': '配偶',
        '国内紧急联系人电话': '13900139000',
        '生日': '05-20'
      }];

      // 中文表头（按数据模型字段顺序）
      const chineseHeaders = ['姓名', '用户名', '密码', '部门', '性别', '工号', '类别', '工作地', '墨西哥公司职位', '总部所属单位', '总部或原总部岗位', '入司时间', '出生日期', '年龄', '籍贯', '政治面貌', '学历', '毕业院校', '专业', '职称', '当前职称聘用时间', '层级', '当前层级聘用时间', '身份证号', '因公护照号', '因公护照有效期', '因私护照号', '因私护照到期时间', '使用签证类型', '签证有效期', '本地化开支时间', '国内常住地址', '国内联系电话', '墨西哥联系电话', '首次入境墨西哥时间', '国内紧急联系人姓名', '与国内紧急联系人的关系', '国内紧急联系人电话', '生日'];

      // 使用改进的编码函数
      const csvContent = encodeCSVForChinese(templateData, chineseHeaders);

      // 创建下载链接，强制UTF-8编码
      const blob = new Blob([csvContent], {
        type: 'text/csv; charset=utf-8'
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = '用户导入模板_中文优化.csv';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast({
        title: "下载成功",
        description: "中文优化模板已下载，确保Excel正确显示中文"
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

  // 导出用户数据（完全支持中文）
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

      // 中文表头映射（按数据模型字段顺序）
      const chineseHeaders = ['姓名', '用户名', '密码', '部门', '性别', '工号', '类别', '工作地', '墨西哥公司职位', '总部所属单位', '总部或原总部岗位', '入司时间', '出生日期', '年龄', '籍贯', '政治面貌', '学历', '毕业院校', '专业', '职称', '当前职称聘用时间', '层级', '当前层级聘用时间', '身份证号', '因公护照号', '因公护照有效期', '因私护照号', '因私护照到期时间', '使用签证类型', '签证有效期', '本地化开支时间', '国内常住地址', '国内联系电话', '墨西哥联系电话', '首次入境墨西哥时间', '国内紧急联系人姓名', '与国内紧急联系人的关系', '国内紧急联系人电话', '生日'];

      // 英文字段名映射（按数据模型字段顺序）
      const englishFields = ['name', 'username', 'password', 'department', 'sex', 'employee_number', 'employee_type', 'Workplace', 'mexican_company_positions', 'headquarters_location', 'original_position', 'join_date', 'birthday', 'age', 'birth_place', 'political_status', 'education', 'graduation_institution', 'major', 'job_title', 'job_title_date', 'hierarchy', 'hierarchy_date', 'ID_number', 'official_passport', 'official_passport_date', 'private_passport', 'private_passport_date', 'use_visa_type', 'visa_validity_period', 'localization_expenses_time', 'permanent_address_china', 'contact_number_china', 'contact_number_mexico', 'first_date_mexico', 'emergency_contact_name_china', 'relationship_with_domestic_emergency_contacts', 'emergency_contact_number_china', 'birthdate'];
      const users = result.records;

      // 准备导出数据
      const exportData = users.map(user => {
        const row = {};
        chineseHeaders.forEach((header, index) => {
          const fieldName = englishFields[index];
          let value = user[fieldName];

          // 处理空值
          if (value === null || value === undefined) {
            value = '';
          }

          // 处理日期格式
          if (value && (fieldName.includes('_date') || fieldName.includes('date') || fieldName.includes('time'))) {
            try {
              value = new Date(value).toISOString().split('T')[0];
            } catch (e) {
              // 保持原值
            }
          }
          row[header] = value;
        });
        return row;
      });

      // 使用改进的编码函数
      const csvContent = encodeCSVForChinese(exportData, chineseHeaders);

      // 创建下载链接
      const blob = new Blob([csvContent], {
        type: 'text/csv; charset=utf-8'
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `用户数据_${new Date().toISOString().split('T')[0]}_中文.csv`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast({
        title: "导出成功",
        description: `已导出 ${users.length} 条用户数据，完美支持中文显示`
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

  // 改进的CSV文件读取（支持中文编码）
  const readCSVFile = file => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const text = e.target.result;
          const data = parseCSVWithChinese(text);
          resolve(data);
        } catch (error) {
          reject(new Error(`CSV解析失败: ${error.message}`));
        }
      };
      reader.onerror = e => reject(new Error('文件读取失败'));

      // 使用UTF-8编码读取
      reader.readAsText(file, 'UTF-8');
    });
  };

  // 处理文件选择
  const handleFileSelect = event => {
    const file = event.target.files[0];
    if (file) {
      if (file.type !== 'text/csv' && !file.name.toLowerCase().endsWith('.csv')) {
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
      const data = await readCSVFile(importFile);
      if (!data || data.length === 0) {
        toast({
          title: "导入失败",
          description: "CSV文件中没有有效数据",
          variant: "destructive"
        });
        return;
      }

      // 中文表头到英文字段的映射
      const fieldMapping = {
        '姓名': 'name',
        '用户名': 'username',
        '密码': 'password',
        '部门': 'department',
        '性别': 'sex',
        '工号': 'employee_number',
        '类别': 'employee_type',
        '工作地': 'Workplace',
        '墨西哥公司职位': 'mexican_company_positions',
        '总部所属单位': 'headquarters_location',
        '总部或原总部岗位': 'original_position',
        '入司时间': 'join_date',
        '出生日期': 'birthday',
        '年龄': 'age',
        '籍贯': 'birth_place',
        '政治面貌': 'political_status',
        '学历': 'education',
        '毕业院校': 'graduation_institution',
        '专业': 'major',
        '职称': 'job_title',
        '当前职称聘用时间': 'job_title_date',
        '层级': 'hierarchy',
        '当前层级聘用时间': 'hierarchy_date',
        '身份证号': 'ID_number',
        '因公护照号': 'official_passport',
        '因公护照有效期': 'official_passport_date',
        '因私护照号': 'private_passport',
        '因私护照到期时间': 'private_passport_date',
        '使用签证类型': 'use_visa_type',
        '签证有效期': 'visa_validity_period',
        '本地化开支时间': 'localization_expenses_time',
        '国内常住地址': 'permanent_address_china',
        '国内联系电话': 'contact_number_china',
        '墨西哥联系电话': 'contact_number_mexico',
        '首次入境墨西哥时间': 'first_date_mexico',
        '国内紧急联系人姓名': 'emergency_contact_name_china',
        '与国内紧急联系人的关系': 'relationship_with_domestic_emergency_contacts',
        '国内紧急联系人电话': 'emergency_contact_number_china',
        '生日': 'birthdate'
      };
      const results = {
        total: data.length,
        success: 0,
        failed: 0,
        errors: []
      };

      // 批量导入用户
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        try {
          // 转换字段名从中文到英文
          const userData = {};
          Object.keys(row).forEach(chineseField => {
            const englishField = fieldMapping[chineseField];
            if (englishField) {
              userData[englishField] = row[chineseField];
            }
          });

          // 验证必填字段
          if (!userData.name || !userData.username) {
            results.failed++;
            results.errors.push(`第${i + 2}行: 缺少必填字段(姓名或用户名)`);
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
            results.errors.push(`第${i + 2}行: 用户名 "${userData.username}" 已存在`);
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
          description: "所有用户数据导入失败，请检查CSV文件格式",
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
    if (onComplete) onComplete();
  };
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileSpreadsheet className="w-6 h-6 mr-2 text-blue-600" />
            用户批量操作 - 中文编码彻底修复版
          </DialogTitle>
          <DialogDescription>
            完全支持中文编码，使用改进的CSV解析算法确保Excel正确显示中文字符
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
                  <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">中文编码已修复</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>下载导入模板</Label>
                  <p className="text-sm text-gray-600">使用改进的编码算法，确保Excel正确显示中文</p>
                  <Button onClick={downloadTemplate} variant="outline" className="w-full border-green-200 hover:bg-green-50">
                    <Download className="w-4 h-4 mr-2" />
                    下载修复版中文模板
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>选择CSV文件</Label>
                  <p className="text-sm text-gray-600">支持包含中文的CSV文件，使用改进的解析算法</p>
                  <Input type="file" accept=".csv" onChange={handleFileSelect} disabled={importing} className="border-2 border-dashed border-gray-300 p-4 hover:border-green-300 transition-colors" />
                  {importFile && <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                        <div>
                          <span className="font-medium text-green-800">{importFile.name}</span>
                          <p className="text-sm text-green-600">文件已选择，准备导入</p>
                        </div>
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
                  <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800">中文表头优化</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  导出所有用户数据为CSV格式，使用改进的编码算法确保Excel等软件正确显示中文。
                  导出的文件包含完整的中文表头，方便查看和编辑。
                </p>
                <Button onClick={exportUsers} disabled={exporting} className="w-full bg-blue-600 hover:bg-blue-700">
                  {exporting ? <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      正在导出...
                    </> : <>
                      <Download className="w-4 h-4 mr-2" />
                      导出用户数据（中文优化）
                    </>}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            取消
          </Button>
          {activeTab === 'import' && <Button onClick={importUsers} disabled={!importFile || importing} className="bg-green-600 hover:bg-green-700">
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