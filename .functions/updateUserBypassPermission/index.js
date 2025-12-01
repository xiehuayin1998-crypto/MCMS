
// 绕过权限检查更新用户信息的云函数
module.exports = async function(params, context) {
  try {
    const { userId, updateData } = params;
    
    if (!userId) {
      return {
        success: false,
        message: '用户ID不能为空'
      };
    }
    
    if (!updateData || Object.keys(updateData).length === 0) {
      return {
        success: false,
        message: '更新数据不能为空'
      };
    }
    
    // 检查当前用户是否为管理员
    const currentUser = context.userInfo;
    if (!currentUser) {
      return {
        success: false,
        message: '用户未登录'
      };
    }
    
    // 查询当前用户是否为管理员
    const userResult = await context.database.collection('mc_users').where({
      _id: currentUser.userId
    }).get();
    
    if (userResult.data.length === 0) {
      return {
        success: false,
        message: '当前用户不存在'
      };
    }
    
    const currentUserData = userResult.data[0];
    if (!currentUserData.isAdmin) {
      return {
        success: false,
        message: '只有管理员可以执行此操作'
      };
    }
    
    // 使用数据库原生方法更新用户信息，绕过权限检查
    const result = await context.database.collection('mc_users').doc(userId).update(updateData);
    
    if (result.updated === 1) {
      return {
        success: false,
        message: '用户信息更新成功',
        data: result
      };
    } else {
      return {
        success: false,
        message: '用户信息更新失败，可能用户不存在',
        data: result
      };
    }
    
  } catch (error) {
    console.error('更新用户信息失败:', error);
    return {
      success: false,
      message: `更新失败: ${error.message}`
    };
  }
};
