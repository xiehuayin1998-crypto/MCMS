
'use strict';

const cloudbase = require('@cloudbase/node-sdk');

// 初始化云开发 SDK
const app = cloudbase.init({
  env: cloudbase.SYMBOL_CURRENT_ENV
});

exports.main = async (event, context) => {
  const { userId, updateData } = event;

  // 参数验证
  if (!userId) {
    return {
      success: false,
      errorCode: 'INVALID_PARAMS',
      errorMessage: 'userId 不能为空'
    };
  }

  if (!updateData || typeof updateData !== 'object') {
    return {
      success: false,
      errorCode: 'INVALID_PARAMS',
      errorMessage: 'updateData 必须是有效的对象'
    };
  }

  try {
    // 获取数据库实例
    const db = app.database();

    // 首先检查用户是否存在
    const userRecord = await db.collection('mc_users')
      .doc(userId)
      .get();

    if (!userRecord.data || Object.keys(userRecord.data).length === 0) {
      return {
        success: false,
        errorCode: 'USER_NOT_FOUND',
        errorMessage: '未找到指定的用户记录'
      };
    }

    // 使用数据库原生 API 更新用户记录（绕过行级权限）
    const updateResult = await db.collection('mc_users')
      .doc(userId)
      .update(updateData);

    if (updateResult.updated > 0) {
      // 获取更新后的用户信息
      const updatedUser = await db.collection('mc_users')
        .doc(userId)
        .get();

      return {
        success: true,
        data: updatedUser.data,
        message: '用户记录更新成功'
      };
    } else {
      return {
        success: false,
        errorCode: 'UPDATE_FAILED',
        errorMessage: '用户记录更新失败'
      };
    }
  } catch (error) {
    console.error('更新用户记录失败:', error);

    // 处理不同类型的错误
    if (error.code === 'DATABASE_ERROR' || error.message && error.message.includes('database')) {
      return {
        success: false,
        errorCode: 'DATABASE_ERROR',
        errorMessage: '数据库操作失败'
      };
    } else if (error.message && error.message.includes('validation')) {
      return {
        success: false,
        errorCode: 'VALIDATION_ERROR',
        errorMessage: '数据验证失败：' + error.message
      };
    } else if (error.message && error.message.includes('permission')) {
      return {
        success: false,
        errorCode: 'PERMISSION_DENIED',
        errorMessage: '权限不足：' + error.message
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
