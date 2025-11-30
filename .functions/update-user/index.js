
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

    // 直接尝试更新用户记录，不进行前置检查
    // 这样可以避免误判"用户不存在"的情况
    const updateResult = await db.collection('mc_users')
      .doc(userId)
      .update(updateData);

    // 根据更新结果判断操作是否成功
    if (updateResult.updated > 0) {
      // 更新成功，获取更新后的用户信息
      const updatedUser = await db.collection('mc_users')
        .where({
          _id: userId
        })
        .get();

      if (updatedUser.data && updatedUser.data.length > 0) {
        return {
          success: true,
          data: updatedUser.data[0],
          message: '用户记录更新成功'
        };
      } else {
        // 虽然更新成功但查询不到用户，可能是权限问题
        return {
          success: true,
          data: null,
          message: '用户记录更新成功，但无法查询更新后的数据'
        };
      }
    } else {
      // 更新失败，检查用户是否存在
      const userRecord = await db.collection('mc_users')
        .where({
          _id: userId
        })
        .get();

      if (!userRecord.data || userRecord.data.length === 0) {
        return {
          success: false,
          errorCode: 'USER_NOT_FOUND',
          errorMessage: '未找到指定的用户记录'
        };
      } else {
        // 用户存在但更新失败，可能是数据没有变化
        return {
          success: true,
          data: userRecord.data[0],
          message: '用户记录无变化，无需更新'
        };
      }
    }
  } catch (error) {
    console.error('更新用户记录失败:', error);

    // 根据错误类型提供更精确的错误信息
    if (error.code === 'DATABASE_PERMISSION_DENIED' || error.message && error.message.includes('permission')) {
      return {
        success: false,
        errorCode: 'PERMISSION_DENIED',
        errorMessage: '权限不足，无法更新用户记录'
      };
    } else if (error.message && error.message.includes('not found') || error.message && error.message.includes('不存在')) {
      return {
        success: false,
        errorCode: 'USER_NOT_FOUND',
        errorMessage: '未找到指定的用户记录'
      };
    } else if (error.message && error.message.includes('validation')) {
      return {
        success: false,
        errorCode: 'VALIDATION_ERROR',
        errorMessage: '数据验证失败：' + error.message
      };
    } else if (error.code === 'DATABASE_ERROR' || error.message && error.message.includes('database')) {
      return {
        success: false,
        errorCode: 'DATABASE_ERROR',
        errorMessage: '数据库操作失败：' + (error.message || '未知错误')
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
