
// 用户权限检查工具
export const UserPermission = {
  // 检查是否有权限修改用户
  canEditUser: (currentUser, targetUserId) => {
    if (!currentUser) return false
    return currentUser.isAdmin || currentUser._id === targetUserId
  },
  
  // 检查是否有权限查看用户
  canViewUser: (currentUser, targetUserId) => {
    if (!currentUser) return false
    return currentUser.isAdmin || currentUser._id === targetUserId
  },
  
  // 检查是否有权限查看所有用户
  canViewAllUsers: (currentUser) => {
    if (!currentUser) return false
    return currentUser.isAdmin
  },
  
  // 获取当前用户信息
  getCurrentUser: async () => {
    try {
      const user = await $w.cloud.callDataSource({
        dataSourceName: 'mc_users',
        methodName: 'wedaGetItemV2',
        params: {
          filter: {
            where: {
              _openid: {
                $eq: $w.auth.currentUser.openid
              }
            }
          }
        }
      })
      return user
    } catch (error) {
      console.error('获取用户信息失败:', error)
      return null
    }
  }
}
  