
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
        // 获取数据模型实例（使用服务端权限）
        const models = app.models;

        // 使用服务端权限更新用户记录
        const result = await models.mc_users.update({
          filter: {
            where: {
              _id: {
                $eq: userId
              }
            }
          },
          data: updateData
        });

        if (result.data && result.data.length > 0) {
          return {
            success: true,
            data: result.data[0],
            message: '用户记录更新成功'
          };
        } else {
          return {
            success: false,
            errorCode: 'USER_NOT_FOUND',
            errorMessage: '未找到指定的用户记录'
          };
        }
      } catch (error) {
        console.error('更新用户记录失败:', error);

        // 处理不同类型的错误
        if (error.code === 'DATABASE_ERROR') {
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
        } else {
          return {
            success: false,
            errorCode: 'UNKNOWN_ERROR',
            errorMessage: '更新操作失败：' + (error.message || '未知错误')
          };
        }
      }
    };
  