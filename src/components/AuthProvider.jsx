// @ts-ignore;
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

// 创建认证上下文
const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
  hasPermission: () => false,
  hasRole: () => false,
  isAdmin: () => false
});

/**
 * 认证提供者组件 - 统一管理用户认证状态
 */
export function AuthProvider({
  children,
  $w
}) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 加载用户信息
  const loadUserInfo = useCallback(async () => {
    try {
      setIsLoading(true);

      // 1. 检查微搭平台认证状态
      const platformUser = $w.auth.currentUser;
      if (!platformUser?.userId) {
        // 未登录状态
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('currentUser');
        setIsLoading(false);
        return;
      }

      // 2. 检查本地存储的用户信息
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          // 验证存储的用户信息是否与平台认证一致
          if (parsedUser.userId === platformUser.userId) {
            setUser(parsedUser);
            setIsAuthenticated(true);
            setIsLoading(false);
            return;
          }
        } catch (error) {
          console.warn('解析存储的用户信息失败:', error);
          localStorage.removeItem('currentUser');
        }
      }

      // 3. 从数据源获取完整的用户信息
      try {
        const result = await $w.cloud.callDataSource({
          dataSourceName: 'mc_users',
          methodName: 'wedaGetRecordsV2',
          params: {
            filter: {
              where: {
                username: {
                  $eq: platformUser.name
                }
              }
            },
            select: {
              $master: true
            }
          }
        });
        if (result.records && result.records.length > 0) {
          const userData = result.records[0];
          const userInfo = {
            userId: userData._id,
            openId: platformUser.userId,
            name: userData.name,
            username: userData.username,
            isAdmin: userData.isAdmin || false,
            department: userData.department,
            employee_number: userData.employee_number,
            roles: userData.roles || [],
            permissions: userData.permissions || '',
            avatarUrl: platformUser.avatarUrl
          };
          setUser(userInfo);
          setIsAuthenticated(true);
          localStorage.setItem('currentUser', JSON.stringify(userInfo));
        } else {
          // 用户不存在于mc_users表中，使用基础信息
          const basicUserInfo = {
            userId: platformUser.userId,
            openId: platformUser.userId,
            name: platformUser.name,
            username: platformUser.name,
            isAdmin: false,
            department: '',
            employee_number: '',
            roles: [],
            permissions: '',
            avatarUrl: platformUser.avatarUrl
          };
          setUser(basicUserInfo);
          setIsAuthenticated(true);
          localStorage.setItem('currentUser', JSON.stringify(basicUserInfo));
        }
      } catch (error) {
        console.error('从数据源获取用户信息失败:', error);
        // 使用平台基础信息
        const basicUserInfo = {
          userId: platformUser.userId,
          openId: platformUser.userId,
          name: platformUser.name,
          username: platformUser.name,
          isAdmin: false,
          department: '',
          employee_number: '',
          roles: [],
          permissions: '',
          avatarUrl: platformUser.avatarUrl
        };
        setUser(basicUserInfo);
        setIsAuthenticated(true);
        localStorage.setItem('currentUser', JSON.stringify(basicUserInfo));
      }
    } catch (error) {
      console.error('加载用户信息失败:', error);
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('currentUser');
    } finally {
      setIsLoading(false);
    }
  }, [$w.auth.currentUser, $w.cloud]);

  // 登录函数 - 使用微搭平台托管登录
  const login = useCallback(async () => {
    try {
      const tcb = await $w.cloud.getCloudInstance();
      tcb.auth().toDefaultLoginPage({
        config_version: "env",
        redirect_uri: window.location.href,
        query: {
          s_domain: $w.utils.resolveStaticResourceUrl("/").replace(/^https?:\/\//, "").split("/")[0]
        }
      });
    } catch (error) {
      console.error('跳转登录页失败:', error);
      throw error;
    }
  }, [$w.cloud, $w.utils]);

  // 退出登录函数
  const logout = useCallback(async () => {
    try {
      const tcb = await $w.cloud.getCloudInstance();
      await tcb.auth().signOut();
      await tcb.auth().signInAnonymously();
      await $w.auth.getUserInfo({
        force: true
      });
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('currentUser');

      // 跳转到登录页
      $w.utils.navigateTo({
        pageId: 'login',
        params: {}
      });
    } catch (error) {
      console.error('退出登录失败:', error);
      throw error;
    }
  }, [$w.cloud, $w.auth, $w.utils]);

  // 刷新用户信息
  const refreshUser = useCallback(async () => {
    localStorage.removeItem('currentUser');
    await loadUserInfo();
  }, [loadUserInfo]);

  // 权限检查函数
  const hasPermission = useCallback(permission => {
    if (!user) return false;

    // 管理员拥有所有权限
    if (user.isAdmin) return true;
    if (!user.permissions) return false;
    try {
      const permissions = typeof user.permissions === 'string' ? user.permissions.split(',').map(p => p.trim()) : Array.isArray(user.permissions) ? user.permissions : [];
      const requiredPermissions = Array.isArray(permission) ? permission : [permission];
      return requiredPermissions.some(reqPerm => permissions.includes(reqPerm));
    } catch (error) {
      console.error('权限检查失败:', error);
      return false;
    }
  }, [user]);

  // 角色检查函数
  const hasRole = useCallback(role => {
    if (!user) return false;
    const userRoles = user.roles || [];
    const requiredRoles = Array.isArray(role) ? role : [role];
    return requiredRoles.some(reqRole => userRoles.includes(reqRole));
  }, [user]);

  // 管理员检查函数
  const isAdmin = useCallback(() => {
    return user?.isAdmin === true;
  }, [user]);

  // 初始化认证状态
  useEffect(() => {
    loadUserInfo();
  }, [loadUserInfo]);

  // 监听平台认证状态变化
  useEffect(() => {
    const checkAuthStatus = () => {
      if (!$w.auth.currentUser?.userId) {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('currentUser');
      } else {
        loadUserInfo();
      }
    };

    // 初始检查
    checkAuthStatus();

    // 可以添加平台认证状态变化的监听器（如果平台支持）
  }, [$w.auth.currentUser, loadUserInfo]);
  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshUser,
    hasPermission,
    hasRole,
    isAdmin
  };
  return <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>;
}

/**
 * 使用认证上下文的 Hook
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * 认证守卫组件 - 保护需要认证才能访问的内容
 */
export function AuthGuard({
  children,
  fallback = null,
  requireAuth = true
}) {
  const {
    isAuthenticated,
    isLoading
  } = useAuth();
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">正在验证身份...</p>
        </div>
      </div>;
  }
  if (requireAuth && !isAuthenticated) {
    return fallback || <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">需要登录</h3>
          <p className="text-gray-600">请先登录以访问此页面</p>
        </div>
      </div>;
  }
  if (!requireAuth && isAuthenticated) {
    return fallback || <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">已登录</h3>
          <p className="text-gray-600">您已经登录，无需访问此页面</p>
        </div>
      </div>;
  }
  return children;
}