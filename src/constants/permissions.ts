export const PERMISSIONS = {
  freight: {
    view: { slug: 'freight.view', label: 'Ver fretes' },
    create: { slug: 'freight.create', label: 'Criar fretes' },
    edit: { slug: 'freight.edit', label: 'Editar fretes' },
    delete: { slug: 'freight.delete', label: 'Excluir fretes' },
  },
  marketplace: {
    view: { slug: 'marketplace.view', label: 'Ver marketplace' },
    create: { slug: 'marketplace.create', label: 'Criar anúncios' },
    edit: { slug: 'marketplace.edit', label: 'Editar anúncios' },
    delete: { slug: 'marketplace.delete', label: 'Excluir anúncios' },
  },
  cotacoes: {
    view: { slug: 'cotacoes.view', label: 'Ver cotações' },
    create: { slug: 'cotacoes.create', label: 'Criar cotações' },
    respond: { slug: 'cotacoes.respond', label: 'Responder cotações' },
    edit: { slug: 'cotacoes.edit', label: 'Editar cotações' },
    delete: { slug: 'cotacoes.delete', label: 'Excluir cotações' },
  },
  publicidade: {
    view: { slug: 'publicidade.view', label: 'Ver anúncios' },
    create: { slug: 'publicidade.create', label: 'Criar anúncios' },
    edit: { slug: 'publicidade.edit', label: 'Editar anúncios' },
    delete: { slug: 'publicidade.delete', label: 'Excluir anúncios' },
  },
  chat: {
    view: { slug: 'chat.view', label: 'Ver mensagens' },
    send: { slug: 'chat.send', label: 'Enviar mensagens' },
  },
  financeiro: {
    view: { slug: 'financeiro.view', label: 'Ver financeiro' },
    manage: { slug: 'financeiro.manage', label: 'Gerenciar financeiro' },
  },
  planos: {
    view: { slug: 'planos.view', label: 'Ver planos' },
    manage: { slug: 'planos.manage', label: 'Gerenciar planos' },
  },
  suporte: {
    view: { slug: 'suporte.view', label: 'Ver tickets' },
    respond: { slug: 'suporte.respond', label: 'Responder tickets' },
    manage: { slug: 'suporte.manage', label: 'Gerenciar tickets' },
  },
  ads: {
    view: { slug: 'ads.view', label: 'Ver relatórios de ads' },
    create: { slug: 'ads.create', label: 'Criar anúncios pagos' },
    manage: { slug: 'ads.manage', label: 'Gerenciar anúncios' },
  },
  wallet: {
    view: { slug: 'wallet.view', label: 'Visualizar saldo' },
    withdraw: { slug: 'wallet.withdraw', label: 'Solicitar saque' },
    manage: { slug: 'wallet.manage', label: 'Gerenciar carteira' },
  },
  users: {
    manage: { slug: 'users.manage', label: 'Gerenciar usuários' },
    invite: { slug: 'users.invite', label: 'Convidar colaboradores' },
  },
  roles: {
    manage: { slug: 'roles.manage', label: 'Gerenciar cargos' },
  },
  grupos: {
    view: { slug: 'grupos.view', label: 'Ver grupos' },
    create: { slug: 'grupos.create', label: 'Criar grupos' },
    edit: { slug: 'grupos.edit', label: 'Editar grupos' },
    delete: { slug: 'grupos.delete', label: 'Excluir grupos' },
  },
  driver: {
    view: { slug: 'driver.view', label: 'Ver Driver Pro' },
    document_verification: { slug: 'driver.document_verification', label: 'Verificação de Documentos' },
    priority_support: { slug: 'driver.priority_support', label: 'Suporte Prioritário' },
    radar_highlight: { slug: 'driver.radar_highlight', label: 'Destaque no Radar' },
    match_priority: { slug: 'driver.match_priority', label: 'Prioridade no Match' },
  },
} as const;

export type PermissionCategory = keyof typeof PERMISSIONS;

export const PERMISSION_LIST = Object.entries(PERMISSIONS).flatMap(
  ([category, perms]) =>
    Object.values(perms).map((p) => ({ ...p, category }))
);

export const getPermissionSlug = (category: string, action: string): string => {
  const categoryKey = category as PermissionCategory;
  if (!PERMISSIONS[categoryKey]) return '';
  const perm = (PERMISSIONS[categoryKey] as Record<string, { slug: string; label: string }>)?.[action];
  return perm?.slug || '';
};

export const getPermissionLabel = (slug: string): string => {
  const perm = PERMISSION_LIST.find((p) => p.slug === slug);
  return perm?.label || slug;
};
