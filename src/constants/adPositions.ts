export const ADMIN_ONLY_KEYS = ['header', 'popup', 'strategic_partners', 'media_network'];

interface AdPositionInfo {
  key: string;
  label: string;
  group: string;
  description: string;
  adSize: string;
}

export const AD_POSITIONS: AdPositionInfo[] = [
  {
    key: 'spotlight',
    label: 'Destaque Principal (Topo da Listagem)',
    group: 'Premium',
    description: 'Banner vertical de alto impacto no topo das páginas de listagem — visibilidade máxima para destacar sua marca acima de tudo',
    adSize: '300×600',
  },
  {
    key: 'sidebar',
    label: 'Banner Lateral (Site Inteiro)',
    group: 'Premium',
    description: 'Acompanha o usuário em todas as páginas do site — exposição contínua durante toda a navegação, ideal para marcas',
    adSize: '300×600',
  },
  {
    key: 'freight_list',
    label: 'Banner na Lista de Fretes',
    group: 'Principais',
    description: 'Exibido entre os resultados de fretes — alcance direto de empresas que estão contratando fretes agora',
    adSize: '728×90',
  },
  {
    key: 'infeed_wide',
    label: 'Banner no Feed de Resultados',
    group: 'Principais',
    description: 'Banner horizontal entre os cards de resultados da busca — alta visibilidade integrada ao conteúdo principal',
    adSize: '728×90',
  },
  {
    key: 'marketplace_list',
    label: 'Banner no Marketplace',
    group: 'Principais',
    description: 'Exibido entre os anúncios do marketplace — alcance compradores ativos enquanto pesquisam produtos e peças',
    adSize: '728×90',
  },
  {
    key: 'groups_list',
    label: 'Banner em Grupos WhatsApp',
    group: 'Secundárias',
    description: 'Aparece na página de grupos de WhatsApp — segmentação de motoristas e empresas em busca de conexão',
    adSize: '300×250',
  },
  {
    key: 'footer',
    label: 'Banner no Rodapé (Todas as Páginas)',
    group: 'Secundárias',
    description: 'Visível no rodapé de absolutamente todas as páginas do site — cobertura completa com exposição em toda navegação do usuário',
    adSize: '300×250',
  },
  {
    key: 'chat_header',
    label: 'Banner no Chat (Topo das Conversas)',
    group: 'Secundárias',
    description: 'Destaque no topo da lista de conversas do chat — atenção durante troca de mensagens entre transportadores',
    adSize: '728×90',
  },
  {
    key: 'header',
    label: 'Banner Cabeçalho',
    group: 'Admin',
    description: 'Linha de avisos no topo do site (admin only)',
    adSize: 'full-width',
  },
  {
    key: 'popup',
    label: 'Popup',
    group: 'Admin',
    description: 'Popup em tela cheia para avisos da plataforma',
    adSize: 'fullscreen',
  },
  {
    key: 'strategic_partners',
    label: 'Parceiros Estratégicos',
    group: 'Admin',
    description: 'Seção de logos de parceiros estratégicos',
    adSize: 'logo',
  },
  {
    key: 'media_network',
    label: 'Rede de Mídia',
    group: 'Admin',
    description: 'Seção de logos de mídia e anunciantes',
    adSize: 'logo',
  },
];

export const AD_POSITION_LABEL: Record<string, string> = Object.fromEntries(
  AD_POSITIONS.map(p => [p.key, p.label])
);

export const AD_POSITION_GROUP: Record<string, string> = Object.fromEntries(
  AD_POSITIONS.map(p => [p.key, p.group])
);

export const AD_POSITION_DESC: Record<string, string> = Object.fromEntries(
  AD_POSITIONS.map(p => [p.key, p.description])
);

export const AD_POSITION_SIZE: Record<string, string> = Object.fromEntries(
  AD_POSITIONS.map(p => [p.key, p.adSize])
);

export const ADVERTISER_TIERS = [
  { value: 'none', label: 'Nenhum' },
  { value: 'supporter_connect', label: 'Apoiador Connect' },
  { value: 'maintainer_premium', label: 'Mantenedor Premium' },
  { value: 'sponsor_master', label: 'Oferecimento Master' },
];

export const TIER_DEFAULT_POSITIONS: Record<string, string[]> = {
  supporter_connect: ['sidebar'],
  maintainer_premium: ['sidebar', 'freight_list', 'infeed_wide', 'marketplace_list', 'groups_list'],
  sponsor_master: ['sidebar', 'freight_list', 'infeed_wide', 'marketplace_list', 'groups_list', 'footer', 'spotlight', 'chat_header', 'popup', 'header'],
};
