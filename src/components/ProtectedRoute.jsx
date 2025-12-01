// @ts-ignore;
import React from 'react';

import { useAuth } from './AuthProvider';

/**
 * 受保护的路由组件
 * 用于包装需要特定权限才能访问的页面
 */
export function ProtectedRoute({
  children,
  requireAuth = true,
  requiredPermissions = [],
  requiredRoles = [],
  requireAdmin = false,
  fallback = null
}) {
  const {
    isAuthenticated,
    isLoading,
    hasPermission,
    hasRole,
    isAdmin
  } = useAuth();
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">正在验证权限...</p>
        </div>
      </div>;
  }

  // 检查认证要求
  if (requireAuth && !isAuthenticated) {
    return fallback || <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">需要登录</h3>
          <p className="text-gray-600">请先登录以访问此页面</p>
        </div>
      </div>;
  }

  // 检查管理员要求
  if (requireAdmin && !isAdmin()) {
    return fallback || <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">权限不足</h3>
          <p className="text-gray-600">需要管理员权限才能访问此页面</p>
        </div>
      </div>;
  }

  // 检查权限要求
  if (requiredPermissions.length > 0 && !hasPermission(requiredPermissions)) {
    return fallback || <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">权限不足</h3>
          <p className="text-gray-600">您没有访问此页面的权限</p>
        </div>
      </div>;
  }

  // 检查角色要求
  if (requiredRoles.length > 0 && !hasRole(requiredRoles)) {
    return fallback || <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">权限不足</h3>
          <p className="text-gray-600">您没有访问此页面的角色权限</p>
        </div>
      </div>;
  }
  return children;
}

/**
 * 管理员路由保护组件
 */
export function AdminRoute({
  children,
  fallback = null
}) {
  return <ProtectedRoute requireAuth={true} requireAdmin={true} fallback={fallback}>
      {children}
    </ProtectedRoute>;
}

/**
 * 权限路由保护组件
 */
export function PermissionRoute({
  permissions,
  children,
  fallback = null
}) {
  return <ProtectedRoute requireAuth={true} requiredPermissions={permissions} fallback={fallback}>
      {children}
    </ProtectedRoute>;
}

/**
 * 角色路由保护组件
 */
export function RoleRoute({
  roles,
  children,
  fallback = null
}) {
  return <ProtectedRoute requireAuth={true} requiredRoles={roles} fallback={fallback}>
      {children}
    </ProtectedRoute>;
}