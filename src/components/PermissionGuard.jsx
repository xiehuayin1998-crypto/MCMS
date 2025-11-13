// @ts-ignore;
import React from 'react';

/**
 * 权限守卫组件 - 保护需要特定权限才能访问的内容
 * @param {Object} props
 * @param {string|Array} props.permission - 需要的权限（单个权限或权限数组）
 * @param {string|Array} props.role - 需要的角色（单个角色或角色数组）
 * @param {boolean} props.isAdmin - 是否需要管理员权限
 * @param {ReactNode} props.children - 子组件
 * @param {ReactNode} props.fallback - 无权限时显示的内容
 * @param {Object} props.user - 当前用户信息
 */
export function PermissionGuard({
  permission,
  role,
  isAdmin,
  children,
  fallback = null,
  user
}) {
  // 如果没有用户信息，直接显示无权限
  if (!user) {
    console.log('PermissionGuard: 用户信息为空');
    return fallback;
  }

  // 检查管理员权限
  if (isAdmin) {
    if (user.isAdmin) {
      console.log('PermissionGuard: 管理员权限检查通过');
      return children;
    } else {
      console.log('PermissionGuard: 管理员权限检查失败');
      return fallback;
    }
  }

  // 检查角色权限
  if (role) {
    const requiredRoles = Array.isArray(role) ? role : [role];
    const userRoles = user.roles || [];
    const hasRole = requiredRoles.some(reqRole => userRoles.includes(reqRole));
    if (hasRole) {
      console.log('PermissionGuard: 角色权限检查通过', {
        requiredRoles,
        userRoles
      });
      return children;
    } else {
      console.log('PermissionGuard: 角色权限检查失败', {
        requiredRoles,
        userRoles
      });
      return fallback;
    }
  }

  // 检查具体权限
  if (permission) {
    const requiredPermissions = Array.isArray(permission) ? permission : [permission];
    const userPermissions = PermissionUtils.getUserPermissions(user);

    // 如果是管理员，默认拥有所有权限
    if (user.isAdmin) {
      console.log('PermissionGuard: 管理员拥有所有权限');
      return children;
    }
    const hasPermission = requiredPermissions.some(reqPerm => userPermissions.includes(reqPerm));
    if (hasPermission) {
      console.log('PermissionGuard: 具体权限检查通过', {
        requiredPermissions,
        userPermissions
      });
      return children;
    } else {
      console.log('PermissionGuard: 具体权限检查失败', {
        requiredPermissions,
        userPermissions
      });
      return fallback;
    }
  }

  // 如果没有指定任何权限要求，默认允许访问
  console.log('PermissionGuard: 无权限要求，默认允许访问');
  return children;
}

/**
 * 权限检查工具函数
 */
export const PermissionUtils = {
  /**
   * 解析用户权限字符串
   * @param {Object} user - 用户信息
   * @returns {Array}
   */
  parseUserPermissions(user) {
    if (!user || !user.permissions) return [];
    try {
      // 尝试解析为 JSON 数组
      const parsed = JSON.parse(user.permissions);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      // 如果是字符串，按逗号分隔
      if (typeof parsed === 'string') {
        return parsed.split(',').map(p => p.trim()).filter(p => p);
      }
    } catch (error) {
      // 如果 JSON 解析失败，尝试按逗号分隔
      console.log('JSON 解析失败，尝试按逗号分隔:', error);
      return user.permissions.split(',').map(p => p.trim()).filter(p => p);
    }
    return [];
  },
  /**
   * 检查用户是否拥有指定权限
   * @param {Object} user - 用户信息
   * @param {string|Array} permission - 需要的权限
   * @returns {boolean}
   */
  hasPermission(user, permission) {
    if (!user) {
      console.log('PermissionUtils.hasPermission: 用户信息为空');
      return false;
    }

    // 管理员拥有所有权限
    if (user.isAdmin) {
      console.log('PermissionUtils.hasPermission: 管理员拥有所有权限');
      return true;
    }
    const userPermissions = this.parseUserPermissions(user);
    const requiredPermissions = Array.isArray(permission) ? permission : [permission];
    const hasPermission = requiredPermissions.some(reqPerm => userPermissions.includes(reqPerm));
    console.log('PermissionUtils.hasPermission:', {
      requiredPermissions,
      userPermissions,
      hasPermission,
      userPermissionsRaw: user.permissions
    });
    return hasPermission;
  },
  /**
   * 检查用户是否拥有指定角色
   * @param {Object} user - 用户信息
   * @param {string|Array} role - 需要的角色
   * @returns {boolean}
   */
  hasRole(user, role) {
    if (!user) {
      console.log('PermissionUtils.hasRole: 用户信息为空');
      return false;
    }
    const userRoles = user.roles || [];
    const requiredRoles = Array.isArray(role) ? role : [role];
    const hasRole = requiredRoles.some(reqRole => userRoles.includes(reqRole));
    console.log('PermissionUtils.hasRole:', {
      requiredRoles,
      userRoles,
      hasRole
    });
    return hasRole;
  },
  /**
   * 检查用户是否是管理员
   * @param {Object} user - 用户信息
   * @returns {boolean}
   */
  isAdmin(user) {
    const isAdmin = user && user.isAdmin === true;
    console.log('PermissionUtils.isAdmin:', {
      isAdmin
    });
    return isAdmin;
  },
  /**
   * 获取用户的所有权限列表
   * @param {Object} user - 用户信息
   * @returns {Array}
   */
  getUserPermissions(user) {
    if (!user) return [];
    const permissions = this.parseUserPermissions(user);
    console.log('PermissionUtils.getUserPermissions:', {
      permissions,
      raw: user.permissions
    });
    return permissions;
  },
  /**
   * 获取用户的所有角色列表
   * @param {Object} user - 用户信息
   * @returns {Array}
   */
  getUserRoles(user) {
    if (!user) return [];
    const roles = user.roles || [];
    console.log('PermissionUtils.getUserRoles:', {
      roles
    });
    return roles;
  },
  /**
   * 检查用户是否拥有会议室申请管理权限
   * @param {Object} user - 用户信息
   * @returns {boolean}
   */
  hasMeetingManagementPermission(user) {
    // 支持多种权限标识
    const hasPermission = this.hasPermission(user, 'APPLICATION_MANAGEMENT_VIEW') || this.hasPermission(user, 'application.management.view') || this.hasPermission(user, 'meeting_room_management') || this.isAdmin(user);
    console.log('PermissionUtils.hasMeetingManagementPermission:', {
      hasPermission,
      user: user ? {
        name: user.name,
        isAdmin: user.isAdmin,
        permissions: user.permissions
      } : 'null'
    });
    return hasPermission;
  }
};