// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, Button, Input, Label, useToast } from '@/components/ui';
// @ts-ignore;
import { Key, Eye, EyeOff } from 'lucide-react';

export function PasswordChangeDialog({
  open,
  onOpenChange,
  $w,
  currentUser
}) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {
    toast
  } = useToast();

  // 重置表单
  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  // 关闭对话框
  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  // 验证密码强度
  const validatePassword = password => {
    if (password.length < 6) {
      return '密码长度至少6位';
    }
    if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
      return '密码必须包含字母和数字';
    }
    return null;
  };

  // 修改密码
  const handleChangePassword = async () => {
    // 验证输入
    if (!currentPassword) {
      toast({
        title: "请输入当前密码",
        variant: "destructive"
      });
      return;
    }
    if (!newPassword) {
      toast({
        title: "请输入新密码",
        variant: "destructive"
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({
        title: "两次输入的新密码不一致",
        variant: "destructive"
      });
      return;
    }
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      toast({
        title: passwordError,
        variant: "destructive"
      });
      return;
    }

    // 检查新密码是否与当前密码相同
    if (currentPassword === newPassword) {
      toast({
        title: "新密码不能与当前密码相同",
        variant: "destructive"
      });
      return;
    }
    try {
      setLoading(true);

      // 验证当前密码是否正确
      const userResult = await $w.cloud.callDataSource({
        dataSourceName: 'mc_users',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              _id: {
                $eq: currentUser._id
              },
              password: {
                $eq: currentPassword
              }
            }
          },
          select: {
            _id: true
          },
          pageSize: 1
        }
      });
      if (!userResult.records || userResult.records.length === 0) {
        toast({
          title: "当前密码错误",
          description: "请输入正确的当前密码",
          variant: "destructive"
        });
        return;
      }

      // 更新密码 - 使用正确的参数格式
      const updateParams = {
        filter: {
          where: {
            _id: {
              $eq: currentUser._id
            }
          }
        },
        data: {
          password: newPassword
        },
        getCount: true
      };
      console.log('更新密码参数:', JSON.stringify(updateParams, null, 2));
      console.log('当前用户ID:', currentUser._id);
      console.log('新密码:', newPassword);
      const updateResult = await $w.cloud.callDataSource({
        dataSourceName: 'mc_users',
        methodName: 'wedaUpdateV2',
        params: updateParams
      });
      console.log('更新结果:', JSON.stringify(updateResult, null, 2));
      if (updateResult && updateResult.count > 0) {
        toast({
          title: "密码修改成功",
          description: "您的密码已成功更新"
        });
        handleClose();
      } else {
        throw new Error('更新失败，可能没有找到匹配的记录');
      }
    } catch (error) {
      console.error('修改密码失败 - 完整错误信息:');
      console.error('错误类型:', typeof error);
      console.error('错误对象:', error);
      console.error('错误消息:', error.message);
      console.error('错误堆栈:', error.stack);
      console.error('错误代码:', error.code);
      console.error('错误详情:', JSON.stringify(error, null, 2));

      // 提供详细的错误信息
      let errorMessage = '请稍后重试';
      let errorTitle = '修改密码失败';
      if (error.message && error.message.includes('filter不能为空')) {
        errorTitle = '参数格式错误';
        errorMessage = '更新参数格式不正确，请检查参数配置';
      } else if (error.message && error.message.includes('权限')) {
        errorTitle = '权限不足';
        errorMessage = '您没有修改密码的权限';
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Key className="w-5 h-5 mr-2" />
            修改密码
          </DialogTitle>
          <DialogDescription>
            请输入当前密码和新密码来修改您的登录密码
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 当前密码 */}
          <div className="space-y-2">
            <Label htmlFor="currentPassword">当前密码</Label>
            <div className="relative">
              <Input id="currentPassword" type={showCurrentPassword ? "text" : "password"} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="请输入当前密码" className="pr-10" />
              <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* 新密码 */}
          <div className="space-y-2">
            <Label htmlFor="newPassword">新密码</Label>
            <div className="relative">
              <Input id="newPassword" type={showNewPassword ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="请输入新密码（至少6位，包含字母和数字）" className="pr-10" />
              <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowNewPassword(!showNewPassword)}>
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {newPassword && validatePassword(newPassword) && <p className="text-xs text-red-500">{validatePassword(newPassword)}</p>}
            {newPassword && !validatePassword(newPassword) && <p className="text-xs text-green-500">密码强度符合要求</p>}
          </div>

          {/* 确认新密码 */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">确认新密码</Label>
            <div className="relative">
              <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="请再次输入新密码" className="pr-10" />
              <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {confirmPassword && newPassword !== confirmPassword && <p className="text-xs text-red-500">两次输入的密码不一致</p>}
            {confirmPassword && newPassword === confirmPassword && <p className="text-xs text-green-500">密码一致</p>}
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            取消
          </Button>
          <Button onClick={handleChangePassword} disabled={loading || !currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword || validatePassword(newPassword)} className="bg-blue-600 hover:bg-blue-700">
            {loading ? <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                修改中...
              </> : '确认修改'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>;
}