// @ts-ignore;
import React from 'react';

// 权限常量定义
export const PERMISSION_LIST = {
  // 用户管理权限
  USER_VIEW: 'user.view',
  USER_CREATE: 'user.create',
  USER_EDIT: 'user.edit',
  USER_DELETE: 'user.delete',
  // 角色管理权限
  ROLE_VIEW: 'role.view',
  ROLE_CREATE: 'role.create',
  ROLE_EDIT: 'role.edit',
  ROLE_DELETE: 'role.delete',
  // 部门管理权限
  DEPARTMENT_VIEW: 'department.view',
  DEPARTMENT_CREATE: 'department.create',
  DEPARTMENT_EDIT: 'department.edit',
  DEPARTMENT_DELETE: 'department.delete',
  // 会议室管理权限
  MEETING_ROOM_VIEW: 'meeting.room.view',
  MEETING_ROOM_CREATE: 'meeting.room.create',
  MEETING_ROOM_EDIT: 'meeting.room.edit',
  MEETING_ROOM_DELETE: 'meeting.room.delete',
  // 会议室预定权限
  MEETING_BOOKING_VIEW: 'meeting.booking.view',
  MEETING_BOOKING_CREATE: 'meeting.booking.create',
  MEETING_BOOKING_EDIT: 'meeting.booking.edit',
  MEETING_BOOKING_DELETE: 'meeting.booking.delete',
  MEETING_BOOKING_APPROVE: 'meeting.booking.approve',
  // 申请管理权限
  APPLICATION_MANAGEMENT_VIEW: 'application.management.view',
  APPLICATION_MANAGEMENT_APPROVE: 'application.management.approve',
  APPLICATION_MANAGEMENT_REJECT: 'application.management.reject',
  APPLICATION_MANAGEMENT_CANCEL: 'application.management.cancel',
  // 文件管理权限
  FILE_VIEW: 'file.view',
  FILE_UPLOAD: 'file.upload',
  FILE_EDIT: 'file.edit',
  FILE_DELETE: 'file.delete',
  // 规章制度权限
  REGULATION_VIEW: 'regulation.view',
  REGULATION_CREATE: 'regulation.create',
  REGULATION_EDIT: 'regulation.edit',
  REGULATION_DELETE: 'regulation.delete',
  // 质量体系权限
  QUALITY_VIEW: 'quality.view',
  QUALITY_CREATE: 'quality.create',
  QUALITY_EDIT: 'quality.edit',
  QUALITY_DELETE: 'quality.delete',
  // 安全环境权限
  SAFETY_VIEW: 'safety.view',
  SAFETY_CREATE: 'safety.create',
  SAFETY_EDIT: 'safety.edit',
  SAFETY_DELETE: 'safety.delete'
};

// 权限分组
export const PERMISSION_GROUPS = {
  user: {
    name: '用户管理',
    permissions: ['USER_VIEW', 'USER_CREATE', 'USER_EDIT', 'USER_DELETE']
  },
  role: {
    name: '角色管理',
    permissions: ['ROLE_VIEW', 'ROLE_CREATE', 'ROLE_EDIT', 'ROLE_DELETE']
  },
  department: {
    name: '部门管理',
    permissions: ['DEPARTMENT_VIEW', 'DEPARTMENT_CREATE', 'DEPARTMENT_EDIT', 'DEPARTMENT_DELETE']
  },
  meeting: {
    name: '会议室管理',
    permissions: ['MEETING_ROOM_VIEW', 'MEETING_ROOM_CREATE', 'MEETING_ROOM_EDIT', 'MEETING_ROOM_DELETE', 'MEETING_BOOKING_VIEW', 'MEETING_BOOKING_CREATE', 'MEETING_BOOKING_EDIT', 'MEETING_BOOKING_DELETE', 'MEETING_BOOKING_APPROVE']
  },
  application: {
    name: '申请管理',
    permissions: ['APPLICATION_MANAGEMENT_VIEW', 'APPLICATION_MANAGEMENT_APPROVE', 'APPLICATION_MANAGEMENT_REJECT', 'APPLICATION_MANAGEMENT_CANCEL']
  },
  file: {
    name: '文件管理',
    permissions: ['FILE_VIEW', 'FILE_UPLOAD', 'FILE_EDIT', 'FILE_DELETE']
  },
  regulation: {
    name: '规章制度',
    permissions: ['REGULATION_VIEW', 'REGULATION_CREATE', 'REGULATION_EDIT', 'REGULATION_DELETE']
  },
  quality: {
    name: '质量体系',
    permissions: ['QUALITY_VIEW', 'QUALITY_CREATE', 'QUALITY_EDIT', 'QUALITY_DELETE']
  },
  safety: {
    name: '安全环境',
    permissions: ['SAFETY_VIEW', 'SAFETY_CREATE', 'SAFETY_EDIT', 'SAFETY_DELETE']
  }
};

// 权限工具函数
export const parsePermissions = permissionsStr => {
  if (!permissionsStr) return [];
  try {
    const parsed = JSON.parse(permissionsStr);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (error) {
    if (typeof permissionsStr === 'string') {
      return permissionsStr.split(',').filter(p => p.trim()).map(p => p.trim());
    }
  }
  return [];
};
export const hasUserRoles = user => {
  return user.roles && user.roles.length > 0;
};
export const getUserPermissionCount = user => {
  if (!user.permissions) return 0;
  const permissions = parsePermissions(user.permissions);
  return permissions.length;
};