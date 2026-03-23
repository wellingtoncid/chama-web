export const ROLES = {
  admin: {
    slug: 'admin',
    label: 'Administrador Master',
    description: 'Acesso total ao sistema',
    type: 'internal',
    isProtected: true,
    permissions: ['all'],
    modules: ['fretes', 'marketplace', 'cotacoes', 'publicidade', 'chat', 'financeiro', 'planos', 'suporte'],
  },
  manager: {
    slug: 'manager',
    label: 'Gerente',
    description: 'Gestão de fretes e suporte',
    type: 'internal',
    isProtected: false,
    permissions: ['freight.view', 'freight.edit', 'wallet.view', 'chat.send', 'users.view', 'support.view', 'support.respond'],
    modules: ['fretes', 'chat', 'financeiro', 'suporte'],
  },
  support: {
    slug: 'support',
    label: 'Suporte',
    description: 'Atendimento ao cliente',
    type: 'internal',
    isProtected: false,
    permissions: ['chat.send', 'freight.view', 'support.view', 'support.respond', 'support.manage'],
    modules: ['chat', 'fretes', 'suporte'],
  },
  finance: {
    slug: 'finance',
    label: 'Financeiro',
    description: 'Gestão financeira',
    type: 'internal',
    isProtected: false,
    permissions: ['wallet.view', 'wallet.manage', 'wallet.withdraw'],
    modules: ['financeiro'],
  },
  marketing: {
    slug: 'marketing',
    label: 'Marketing',
    description: 'Gestão de marketing e anúncios',
    type: 'internal',
    isProtected: false,
    permissions: ['ads.view', 'ads.create', 'ads.manage', 'marketplace.view'],
    modules: ['marketplace', 'publicidade'],
  },
  director: {
    slug: 'director',
    label: 'Diretor',
    description: 'Direção executiva',
    type: 'internal',
    isProtected: false,
    permissions: ['all'],
    modules: ['fretes', 'marketplace', 'cotacoes', 'publicidade', 'chat', 'financeiro', 'planos', 'suporte', 'grupos'],
  },
  coordinator: {
    slug: 'coordinator',
    label: 'Coordenador',
    description: 'Coordenação de equipe',
    type: 'internal',
    isProtected: false,
    permissions: ['users.view', 'freight.view', 'wallet.view', 'chat.send', 'support.view'],
    modules: ['fretes', 'chat', 'financeiro', 'suporte'],
  },
  supervisor: {
    slug: 'supervisor',
    label: 'Supervisor',
    description: 'Supervisão de equipe',
    type: 'internal',
    isProtected: false,
    permissions: ['users.view', 'freight.view', 'chat.send', 'support.view'],
    modules: ['fretes', 'chat', 'suporte'],
  },
  driver: {
    slug: 'driver',
    label: 'Motorista',
    description: 'Motorista de fretes',
    type: 'external',
    isProtected: true,
    permissions: ['freight.view', 'marketplace.view', 'marketplace.create', 'marketplace.edit', 'chat.view', 'chat.send', 'wallet.view', 'grupos.view', 'support.create', 'support.view', 'planos.view', 'driver.view', 'driver.document_verification', 'driver.priority_support', 'driver.radar_highlight', 'driver.match_priority'],
    modules: ['fretes', 'driver', 'marketplace', 'chat', 'grupos', 'suporte', 'planos'],
    defaultFor: 'driver',
  },
  company: {
    slug: 'company',
    label: 'Empresa',
    description: 'Empresa/Transportadora',
    type: 'external',
    isProtected: true,
    permissions: ['freight.view', 'freight.create', 'freight.edit', 'freight.delete', 'marketplace.view', 'marketplace.create', 'marketplace.edit', 'marketplace.delete', 'chat.view', 'chat.send', 'chat.manage', 'wallet.view', 'wallet.withdraw', 'cotacoes.view', 'cotacoes.create', 'cotacoes.edit', 'cotacoes.delete', 'cotacoes.respond', 'ads.view', 'ads.create', 'ads.manage', 'grupos.view', 'grupos.create', 'support.create', 'support.view', 'support.manage', 'planos.view', 'planos.manage'],
    modules: ['fretes', 'marketplace', 'chat', 'financeiro', 'cotacoes', 'publicidade', 'grupos', 'suporte', 'planos'],
    defaultFor: 'company',
  },
} as const;

export type RoleSlug = keyof typeof ROLES;
export type RoleType = 'internal' | 'external';

export const INTERNAL_ROLES = Object.values(ROLES).filter((r) => r.type === 'internal');
export const EXTERNAL_ROLES = Object.values(ROLES).filter((r) => r.type === 'external');

export const getRoleBySlug = (slug: string) => {
  return Object.values(ROLES).find((r) => r.slug === slug);
};

export const getDefaultPermissionsForRole = (role: string): string[] => {
  const roleData = getRoleBySlug(role);
  return roleData?.permissions ? [...roleData.permissions] : [];
};
