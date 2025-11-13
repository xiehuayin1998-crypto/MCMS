// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';

// @ts-ignore;
import { PermissionUtils } from './PermissionGuard';

/**
 * 权限按钮组件 - 根据权限显示/隐藏按钮
 * @param {Object} props
 * @param {string|Array} props.permission - 需要的权限
 * @param {string|Array} props.role - 需要的角色
 * @param {boolean} props.isAdmin - 是否需要管理员权限
 * @param {Object} props.user - 当前用户信息
 * @param {ReactNode} props.fallback - 无权限时显示的内容
 * @param {boolean} props.hideIfNoPermission - 无权限时是否隐藏（默认true）
 * @param {Object} props.buttonProps - 按钮属性
 */
export function PermissionButton({
  permission,
  role,
  isAdmin,
  user,
  fallback = null,
  hideIfNoPermission = true,
  buttonProps = {},
  children,
  ...props
}) {
  // 检查权限
  let hasPermission = true;
  if (isAdmin && !PermissionUtils.isAdmin(user)) {
    hasPermission = false;
  }
  if (role && !PermissionUtils.hasRole(user, role)) {
    hasPermission = false;
  }
  if (permission && !PermissionUtils.hasPermission(user, permission)) {
    hasPermission = false;
  }

  // 无权限时的处理
  if (!hasPermission) {
    if (hideIfNoPermission) {
      return null;
    }
    return fallback;
  }

  // 有权限，渲染按钮
  return <Button {...buttonProps} {...props}>
      {children}
    </Button>;
}

/**
 * 权限链接组件 - 用于导航链接的权限控制
 */
export function PermissionLink({
  permission,
  role,
  isAdmin,
  user,
  children,
  ...props
}) {
  const hasPermission = PermissionUtils.hasPermission(user, permission) || PermissionUtils.hasRole(user, role) || isAdmin && PermissionUtils.isAdmin(user);
  if (!hasPermission) {
    return null;
  }
  return React.cloneElement(children, props);
}