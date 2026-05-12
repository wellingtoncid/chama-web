import { INTERNAL_ROLES, EXTERNAL_ROLES } from './roles';

export const isInternal = (role: string): boolean => {
  return INTERNAL_ROLES.some(r => r.slug === role);
};

export const isExternal = (role: string): boolean => {
  return EXTERNAL_ROLES.some(r => r.slug === role);
};

export const isSuperAdmin = (role: string): boolean => {
  return role === 'admin';
};

export const isDriver = (role: string): boolean => {
  return role === 'driver';
};

export const isCompany = (role: string): boolean => {
  return role === 'company';
};

export const isStaff = (role: string): boolean => {
  return ['admin', 'manager', 'analyst', 'assistant'].includes(role);
};
