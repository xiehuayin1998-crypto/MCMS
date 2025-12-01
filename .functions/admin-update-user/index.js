
    'use strict';

    const cloudbase = require('@cloudbase/node-sdk');

    // 初始化云开发 SDK
    const app = cloudbase.init({
      env: cloudbase.SYMBOL_CURRENT_ENV
    });

    exports.main = async (event, context) => {
      const { userId, updateData } = event;

      // 参数验证
      if (!userId || typeof userId !== 'string') {
        return {
          success: false,
          errorCode: 'INVALID_USER_ID',
          errorMessage: 'userId 必须是有效的字符串'
        };
      }

      if (!updateData || typeof updateData !== 'object' || Array.isArray(updateData)) {
        return {
          success: false,
          errorCode: 'INVALID_UPDATE_DATA',
          errorMessage: 'updateData 必须是有效的对象'
        };
      }

      try {
        // 获取数据库实例（使用服务端权限）
        const db = app.database();
        
        // 使用服务端权限直接更新用户记录
        const result = await db.collection('mc_users').doc(userId).update({
          data: updateData
        });

        if (result.stats && result.stats.updated > 0) {
          // 获取更新后的用户数据
          const updatedUser = await db.collection('mc_users').doc(userId).get();
          
          return {
            success: true,
            data: {
              updated: result.stats.updated,
              user: updatedUser.data
            },
            message: '用户记录更新成功'
          };
        } else {
          return {
            success: false,
            errorCode: 'UPDATE_FAILED',
            errorMessage: '更新失败，可能用户不存在或数据未发生变化'
          };
        }
      } catch (error) {
        console.error('更新用户记录失败:', error);

        // 处理不同类型的错误
        if (error.code === 'DATABASE_REQUEST_FAILED') {
          return {
            success: false,
            errorCode: 'DATABASE_ERROR',
            errorMessage: '数据库请求失败'
          };
        } else if (error.message && error.message.includes('permission')) {
          return {
            success: false,
            errorCode: 'PERMISSION_DENIED',
            errorMessage: '权限不足，无法更新用户记录'
          };
        } else if (error.message && error.message.includes('validation')) {
          return {
            success: false,
            errorCode: 'VALIDATION_ERROR',
            errorMessage: '数据验证失败：' + error.message
          };
        } else {
          return {
            success: false,
            errorCode: 'UNKNOWN_ERROR',
            errorMessage: '更新操作失败：' + (error.message || '未知错误')
          };
        }
      }
    };
  