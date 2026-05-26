export const ADMIN_ONLY_KEYS = ['header', 'popup'];

interface AdPositionInfo {
  key: string;
  label: string;
  group: string;
  description: string;
  adSize: string;
  pages: string;
}

export const AD_POSITIONS: AdPositionInfo[] = [
  {
    key: 'spotlight',
    label: 'Destaque Principal (Topo da Listagem)',
    group: 'Premium',
    description: 'Banner horizontal nas páginas de detalhe de fretes, marketplace, grupos e perfil público',
    adSize: '728×90 (horizontal)',
    pages: 'Detalhe do Frete, Detalhe do Marketplace, Detalhe do Grupo, Perfil Público',
  },
  {
    key: 'sidebar',
    label: 'Banner Lateral (Site Inteiro)',
    group: 'Premium',
    description: 'Acompanha o usuário nas páginas de detalhe — exposição contínua na barra lateral',
    adSize: '300×600 (vertical)',
    pages: 'Detalhe do Frete, Detalhe do Marketplace, Detalhe do Grupo',
  },
  {
    key: 'freight_list',
    label: 'Banner na Lista de Fretes',
    group: 'Principais',
    description: 'Banner horizontal no topo (carrossel) e rodapé da lista de fretes — 728×90',
    adSize: '728×90 (horizontal)',
    pages: 'Lista de Fretes (carrossel topo + rodapé)',
  },
  {
    key: 'freight_card',
    label: 'Card na Lista de Fretes',
    group: 'Principais',
    description: 'Card de anúncio inserido a cada 8 fretes na grade de resultados — mesmo formato dos cards de frete',
    adSize: '300×250 (card 420px)',
    pages: 'Lista de Fretes (a cada 8 resultados)',
  },
  {
    key: 'infeed_wide',
    label: 'Banner no Feed de Resultados',
    group: 'Principais',
    description: 'Banner horizontal na home e páginas de artigos — alta visibilidade integrada ao conteúdo',
    adSize: '728×90 (horizontal)',
    pages: 'Home (4x), Lista de Artigos (2x), Detalhe do Artigo (2x)',
  },
  {
    key: 'marketplace_list',
    label: 'Banner no Marketplace',
    group: 'Principais',
    description: 'Banner horizontal no topo (carrossel) e rodapé do marketplace — 728×90',
    adSize: '728×90 (horizontal)',
    pages: 'Marketplace (carrossel topo + rodapé)',
  },
  {
    key: 'marketplace_card',
    label: 'Card no Marketplace',
    group: 'Principais',
    description: 'Card de anúncio inserido a cada 8 classificados na grade — mesmo formato dos cards do marketplace',
    adSize: '300×250 (card 420px)',
    pages: 'Marketplace (a cada 8 resultados)',
  },
  {
    key: 'groups_list',
    label: 'Banner em Grupos WhatsApp',
    group: 'Secundárias',
    description: 'Banner horizontal no topo (carrossel) e rodapé da lista de grupos — 728×90',
    adSize: '728×90 (horizontal)',
    pages: 'Lista de Grupos (carrossel topo + rodapé)',
  },
  {
    key: 'groups_card',
    label: 'Card em Grupos WhatsApp',
    group: 'Secundárias',
    description: 'Card de anúncio inserido a cada 6 grupos na grade — mesmo formato dos cards de grupo',
    adSize: '300×250 (card 420px)',
    pages: 'Lista de Grupos (a cada 6 resultados)',
  },
  {
    key: 'footer',
    label: 'Banner no Rodapé (Todas as Páginas)',
    group: 'Secundárias',
    description: 'Visível no rodapé de absolutamente todas as páginas do site — exposição em toda navegação',
    adSize: '728×90 (horizontal)',
    pages: 'Todas as páginas (rodapé, container max-w-4xl)',
  },
  {
    key: 'chat_header',
    label: 'Banner no Chat (Topo das Conversas)',
    group: 'Secundárias',
    description: 'Destaque no topo da lista de conversas do chat — atenção durante troca de mensagens',
    adSize: '728×90 (horizontal)',
    pages: 'Página do Chat (topo, acima da lista de conversas)',
  },
  {
    key: 'header',
    label: 'Banner Cabeçalho',
    group: 'Admin',
    description: 'Linha de avisos no topo do site (admin only)',
    adSize: 'full-width',
    pages: 'Todas as páginas (topo do header, full-width)',
  },
  {
    key: 'popup',
    label: 'Popup',
    group: 'Admin',
    description: 'Popup em tela cheia para avisos da plataforma',
    adSize: 'fullscreen',
    pages: 'Todas as páginas (overlay após 4s, 1x/24h)',
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

export const AD_POSITION_PAGES: Record<string, string> = Object.fromEntries(
  AD_POSITIONS.map(p => [p.key, p.pages])
);

export const ADVERTISER_TIERS = [
  { value: 'none', label: 'Nenhum' },
  { value: 'supporter_connect', label: 'Apoiador Connect' },
  { value: 'maintainer_premium', label: 'Mantenedor Premium' },
  { value: 'sponsor_master', label: 'Oferecimento Master' },
];

export const TIER_DEFAULT_POSITIONS: Record<string, string[]> = {
  supporter_connect: ['sidebar'],
  maintainer_premium: ['sidebar', 'freight_list', 'infeed_wide', 'marketplace_list', 'groups_list', 'freight_card', 'marketplace_card', 'groups_card'],
  sponsor_master: ['sidebar', 'freight_list', 'infeed_wide', 'marketplace_list', 'groups_list', 'freight_card', 'marketplace_card', 'groups_card', 'footer', 'spotlight', 'chat_header'],
};
