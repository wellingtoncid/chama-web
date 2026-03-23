export const SYSTEM_ROLES = {
  INTERNAL: ['admin', 'manager', 'support', 'finance', 'marketing', 'director', 'coordinator', 'supervisor'] as const,
  EXTERNAL: ['driver', 'company'] as const,
  PROTECTED: ['admin', 'driver', 'company'] as const,
} as const;

export const SYSTEM_MODULES = {
  FRETES: 'fretes',
  MARKETPLACE: 'marketplace',
  COTACOES: 'cotacoes',
  PUBLICIDADE: 'publicidade',
  CHAT: 'chat',
  FINANCEIRO: 'financeiro',
  GRUPOS: 'grupos',
  PLANOS: 'planos',
  SUPORTE: 'suporte',
} as const;

export const isInternalRole = (role: string): boolean => {
  return SYSTEM_ROLES.INTERNAL.includes(role.toLowerCase() as any);
};

export const isExternalRole = (role: string): boolean => {
  return SYSTEM_ROLES.EXTERNAL.includes(role.toLowerCase() as any);
};

export const isProtectedRole = (role: string): boolean => {
  return SYSTEM_ROLES.PROTECTED.includes(role.toLowerCase() as any);
};

export const normalizeRole = (role: string | null | undefined): string => {
  return (role || '').toLowerCase().trim();
};
