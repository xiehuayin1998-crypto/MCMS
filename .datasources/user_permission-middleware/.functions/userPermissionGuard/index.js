
const cloud = require('wx-server-sdk')
cloud.init()

const db = cloud.database()

exports.main = async (event, context) => {
  const { action, data, userInfo } = event
  const { openId } = userInfo
  
  try {
    // 获取当前用户信息
    const userRes = await db.collection('mc_users')
      .where({ _openid: openId })
      .get()
    
    if (userRes.data.length === 0) {
      return { success: false, message: '用户不存在' }
    }
    
    const currentUser = userRes.data[0]
    
    switch (action) {
      case 'updateUser':
        const { userId, updateData } = data
        
        // 检查是否是管理员或修改自己的记录
        if (currentUser.isAdmin || userId === currentUser._id) {
          const result = await db.collection('mc_users')
            .doc(userId)
            .update({
              ...updateData,
              updatedAt: Date.now()
            })
          return { success: true, data: result }
        } else {
          return { success: false, message: '无权限修改此用户' }
        }
        
      case 'getUser':
        const { targetUserId } = data
        
        // 管理员可以查看所有用户，普通用户只能查看自己
        if (currentUser.isAdmin || targetUserId === currentUser._id) {
          const user = await db.collection('mc_users')
            .doc(targetUserId)
            .get()
          return { success: true, data: user.data }
        } else {
          return { success: false, message: '无权限查看此用户' }
        }
        
      case 'getAllUsers':
        // 只有管理员可以查看所有用户
        if (currentUser.isAdmin) {
          const users = await db.collection('mc_users')
            .get()
          return { success: true, data: users.data }
        } else {
          return { success: false, message: '无权限查看所有用户' }
        }
        
      default:
        return { success: false, message: '未知操作' }
    }
  } catch (error) {
    console.error('权限检查失败:', error)
    return { success: false, message: error.message }
  }
}
  