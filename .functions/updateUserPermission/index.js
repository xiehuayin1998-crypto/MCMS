
// 使用云开发环境内置的SDK，无需额外安装依赖
const tcb = require('tcb-admin-node');

// 初始化云开发环境
const app = tcb.init({
  env: tcb.getCurrentEnv()
});

const db = app.database();

/**
 * 用户权限管理云函数
 * 用于绕过行级权限限制，直接修改用户信息
 * 
 * @param {Object} event - 请求参数
 * @param {string} event.action - 操作类型：update, delete, create
 * @param {Object} event.data - 要更新的数据
 * @param {string} event.userId - 要操作的用户ID
 * @param {Object} event.filter - 查询条件
 * @param {Object} event.currentUser - 当前操作用户信息
 * @returns {Object} 操作结果
 */
exports.main = async (event, context) => {
  const { action, data, userId, filter, currentUser } = event;
  
  try {
    // 验证当前用户是否为管理员
    if (!currentUser || !currentUser.isAdmin) {
      return {
        success: false,
        error: '权限不足：只有管理员可以执行此操作'
      };
    }

    // 验证必要参数
    if (!action) {
      return {
        success: false,
        error: '缺少操作类型参数'
      };
    }

    let result;

    switch (action) {
      case 'update':
        // 更新用户信息
        if (!userId && !filter) {
          return {
            success: false,
            error: '缺少用户ID或查询条件'
          };
        }

        const updateFilter = userId ? { _id: userId } : filter;
        
        // 执行更新操作（绕过行级权限）
        result = await db.collection('mc_users')
          .where(updateFilter)
          .update(data);
        
        return {
          success: true,
          message: '用户信息更新成功',
          data: result
        };

      case 'delete':
        // 删除用户
        if (!userId && !filter) {
          return {
            success: false,
            error: '缺少用户ID或查询条件'
          };
        }

        const deleteFilter = userId ? { _id: userId } : filter;
        
        // 执行删除操作（绕过行级权限）
        result = await db.collection('mc_users')
          .where(deleteFilter)
          .remove();
        
        return {
          success: true,
          message: '用户删除成功',
          data: result
        };

      case 'create':
        // 创建用户
        if (!data) {
          return {
            success: false,
            error: '缺少用户数据'
          };
        }

        // 执行创建操作
        result = await db.collection('mc_users')
          .add(data);
        
        return {
          success: true,
          message: '用户创建成功',
          data: result
        };

      case 'batchUpdate':
        // 批量更新用户
        if (!filter || !data) {
          return {
            success: false,
            error: '缺少查询条件或更新数据'
          };
        }

        // 执行批量更新操作
        result = await db.collection('mc_users')
          .where(filter)
          .update(data);
        
        return {
          success: true,
          message: '批量更新成功',
          data: result
        };

      case 'batchDelete':
        // 批量删除用户
        if (!filter) {
          return {
            success: false,
            error: '缺少查询条件'
          };
        }

        // 执行批量删除操作
        result = await db.collection('mc_users')
          .where(filter)
          .remove();
        
        return {
          success: true,
          message: '批量删除成功',
          data: result
        };

      default:
        return {
          success: false,
          error: '不支持的操作类型'
        };
    }

  } catch (error) {
    console.error('用户权限管理云函数执行失败:', error);
    return {
      success: false,
      error: error.message || '操作执行失败'
    };
  }
};
