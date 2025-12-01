
    'use strict';
    
    const cloudbase = require('@cloudbase/node-sdk');
    
    exports.main = async (event, context) => {
      const { targetUserId, updateData } = event;
      
      // 参数校验
      if (!targetUserId) {
        return {
          success: false,
          error: '目标用户ID不能为空'
        };
      }
      
      if (!updateData || typeof updateData !== 'object') {
        return {
          success: false,
          error: '更新数据不能为空且必须为对象'
        };
      }
      
      try {
        // 初始化 CloudBase SDK
        const app = cloudbase.init({
          env: cloudbase.SYMBOL_CURRENT_ENV
        });
        
        // 获取当前用户信息
        const userInfo = await app.auth().getUserInfo();
        const currentUserOpenId = userInfo.openId || userInfo.uid;
        
        if (!currentUserOpenId) {
          return {
            success: false,
            error: '无法获取当前用户信息'
          };
        }
        
        // 获取当前用户的权限信息
        const models = app.models;
        const currentUserResult = await models.mc_users.get({
          filter: {
            where: {
              _openid: {
                $eq: currentUserOpenId
              }
            }
          },
          select: {
            isAdmin: true,
            _id: true,
            _openid: true
          }
        });
        
        if (!currentUserResult.data || !currentUserResult.data.records || currentUserResult.data.records.length === 0) {
          return {
            success: false,
            error: '当前用户不存在'
          };
        }
        
        const currentUser = currentUserResult.data.records[0];
        const isAdmin = currentUser.isAdmin === 1;
        
        // 构建更新条件
        let updateFilter = {
          where: {
            _id: {
              $eq: targetUserId
            }
          }
        };
        
        // 如果不是管理员，只能更新自己的数据
        if (!isAdmin) {
          updateFilter.where._openid = {
            $eq: currentUserOpenId
          };
        }
        
        // 检查目标用户是否存在
        const targetUserResult = await models.mc_users.get({
          filter: {
            where: {
              _id: {
                $eq: targetUserId
              }
            }
          },
          select: {
            _id: true,
            _openid: true
          }
        });
        
        if (!targetUserResult.data || !targetUserResult.data.records || targetUserResult.data.records.length === 0) {
          return {
            success: false,
            error: '目标用户不存在'
          };
        }
        
        // 执行更新操作
        const updateResult = await models.mc_users.update({
          data: updateData,
          filter: updateFilter
        });
        
        if (updateResult.data && updateResult.data.count > 0) {
          // 获取更新后的用户数据
          const updatedUserResult = await models.mc_users.get({
            filter: {
              where: {
                _id: {
                  $eq: targetUserId
                }
              }
            },
            select: {
              $master: true
            }
          });
          
          return {
            success: true,
            data: updatedUserResult.data.records[0],
            message: '更新成功'
          };
        } else {
          return {
            success: false,
            error: '更新失败，可能是权限不足或记录不存在'
          };
        }
        
      } catch (error) {
        console.error('更新用户数据时发生错误:', error);
        
        // 统一错误处理
        let errorMessage = '更新失败';
        
        if (error.message && error.message.includes('数据格式校验失败')) {
          errorMessage = '数据格式错误：' + error.message;
        } else if (error.message && error.message.includes('权限不足')) {
          errorMessage = '权限不足，无法更新该用户数据';
        } else if (error.message && error.message.includes('ECONNREFUSED')) {
          errorMessage = '网络连接失败，请稍后重试';
        } else {
          errorMessage = '系统错误：' + (error.message || '未知错误');
        }
        
        return {
          success: false,
          error: errorMessage
        };
      }
    };
  