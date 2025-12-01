
    'use strict';

    const cloudbase = require('@cloudbase/node-sdk');

    // 初始化 CloudBase 应用
    const app = cloudbase.init({
      // 使用当前云函数所在环境的环境 ID
      env: cloudbase.SYMBOL_CURRENT_ENV
    });

    // 获取数据模型
    const models = app.models;

    /**
     * 验证输入参数
     * @param {Object} params - 输入参数
     * @returns {Object} 验证结果
     */
    function validateParams(params) {
      if (!params) {
        return { valid: false, message: '参数不能为空' };
      }

      const { targetUserId, updateData } = params;

      if (!targetUserId || typeof targetUserId !== 'string') {
        return { valid: false, message: 'targetUserId 必须是非空字符串' };
      }

      if (!updateData || typeof updateData !== 'object' || Object.keys(updateData).length === 0) {
        return { valid: false, message: 'updateData 必须是非空对象' };
      }

      // 不允许更新 _id 字段
      if (updateData._id) {
        return { valid: false, message: '不允许更新 _id 字段' };
      }

      return { valid: true };
    }

    /**
     * 检查用户记录是否存在
     * @param {string} userId - 用户ID
     * @returns {Promise<Object>} 检查结果
     */
    async function checkUserExists(userId) {
      try {
        const result = await models.mc_users.get({
          filter: {
            where: {
              _id: {
                $eq: userId
              }
            }
          }
        });

        if (result.data && result.data.records && result.data.records.length > 0) {
          return { exists: true, user: result.data.records[0] };
        } else {
          return { exists: false, message: '用户记录不存在' };
        }
      } catch (error) {
        console.error('检查用户存在性时出错:', error);
        return { exists: false, message: '检查用户存在性时发生错误' };
      }
    }

    /**
     * 更新用户数据
     * @param {string} userId - 用户ID
     * @param {Object} updateData - 更新数据
     * @returns {Promise<Object>} 更新结果
     */
    async function updateUserData(userId, updateData) {
      try {
        // 使用数据模型的 update 方法绕过行级权限
        const result = await models.mc_users.update({
          data: updateData,
          filter: {
            where: {
              _id: {
                $eq: userId
              }
            }
          }
        });

        if (result.data && result.data.affectedRows > 0) {
          // 获取更新后的用户数据
          const updatedUserResult = await models.mc_users.get({
            filter: {
              where: {
                _id: {
                  $eq: userId
                }
              }
            }
          });

          if (updatedUserResult.data && updatedUserResult.data.records && updatedUserResult.data.records.length > 0) {
            return { 
              success: true, 
              message: '用户数据更新成功',
              updatedUser: updatedUserResult.data.records[0]
            };
          } else {
            return { 
              success: true, 
              message: '用户数据更新成功，但获取更新后数据失败'
            };
          }
        } else {
          return { 
            success: false, 
            message: '更新操作未影响任何记录' 
          };
        }
      } catch (error) {
        console.error('更新用户数据时出错:', error);
        return { 
          success: false, 
          message: `更新用户数据时发生错误: ${error.message}` 
        };
      }
    }

    /**
     * 主函数
     * @param {Object} event - 事件对象
     * @param {Object} context - 上下文对象
     * @returns {Promise<Object>} 响应对象
     */
    exports.main = async (event, context) => {
      try {
        console.log('收到更新用户请求:', JSON.stringify(event, null, 2));

        // 验证参数
        const validation = validateParams(event);
        if (!validation.valid) {
          return {
            success: false,
            message: validation.message
          };
        }

        const { targetUserId, updateData } = event;

        // 检查用户是否存在
        const userCheck = await checkUserExists(targetUserId);
        if (!userCheck.exists) {
          return {
            success: false,
            message: userCheck.message
          };
        }

        // 执行更新操作
        const updateResult = await updateUserData(targetUserId, updateData);
        
        if (updateResult.success) {
          console.log(`用户 ${targetUserId} 数据更新成功`);
          return {
            success: true,
            message: updateResult.message,
            updatedUser: updateResult.updatedUser
          };
        } else {
          console.error(`用户 ${targetUserId} 数据更新失败:`, updateResult.message);
          return {
            success: false,
            message: updateResult.message
          };
        }

      } catch (error) {
        console.error('云函数执行时发生未预期错误:', error);
        return {
          success: false,
          message: `服务器内部错误: ${error.message}`
        };
      }
    };
  