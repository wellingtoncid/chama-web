export const MODULES = {
  fretes: {
    key: 'fretes',
    label: 'Fretes',
    description: 'Gerenciamento de fretes',
    icon: 'Truck',
    defaultFor: ['company', 'driver'],
    required: true,
  },
  marketplace: {
    key: 'marketplace',
    label: 'Marketplace',
    description: 'Anúncios de vendas',
    icon: 'ShoppingBag',
    defaultFor: ['company', 'driver'],
    required: false,
  },
  cotacoes: {
    key: 'cotacoes',
    label: 'Cotações',
    description: 'Sistema de cotações',
    icon: 'FileText',
    defaultFor: ['company'],
    required: false,
  },
  publicidade: {
    key: 'publicidade',
    label: 'Publicidade',
    description: 'Anúncios publicitários',
    icon: 'Megaphone',
    defaultFor: ['company'],
    required: false,
  },
  chat: {
    key: 'chat',
    label: 'Chat',
    description: 'Mensagens',
    icon: 'MessageCircle',
    defaultFor: ['company', 'driver'],
    required: false,
  },
  financeiro: {
    key: 'financeiro',
    label: 'Financeiro',
    description: 'Transações e relatórios',
    icon: 'CreditCard',
    defaultFor: ['company'],
    required: false,
  },
  planos: {
    key: 'planos',
    label: 'Planos',
    description: 'Planos de assinatura',
    icon: 'Tag',
    defaultFor: ['company', 'driver'],
    required: false,
  },
  suporte: {
    key: 'suporte',
    label: 'Suporte',
    description: 'Tickets de suporte',
    icon: 'HelpCircle',
    defaultFor: ['company', 'driver'],
    required: false,
  },
  grupos: {
    key: 'grupos',
    label: 'Grupos WhatsApp',
    description: 'Comunidades e grupos de WhatsApp',
    icon: 'Users',
    defaultFor: ['company', 'driver'],
    required: false,
  },
  driver: {
    key: 'driver',
    label: 'Driver Pro',
    description: 'Recursos premium para motoristas',
    icon: 'Shield',
    defaultFor: ['driver'],
    required: true,
  },
};

export type ModuleKey = keyof typeof MODULES;

export const MODULE_LIST: Module[] = Object.values(MODULES);
export const MODULE_KEYS = Object.keys(MODULES);

export interface Module {
  key: string;
  label: string;
  description: string;
  icon: string;
  defaultFor: string[];
  required: boolean;
}
