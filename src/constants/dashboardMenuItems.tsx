import {
  Truck, Megaphone, ShoppingBag,
  User, CreditCard,
  Wallet, Users, PlusCircle, Tag, HelpCircle, FileText,
  Shield, LayoutGrid, Star, Flag, BookOpen, UserPlus, Settings, Mail, Headphones, ShieldCheck,
  UsersRound, Calculator
} from 'lucide-react';

export interface MenuItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  visible: boolean;
  highlight?: boolean;
  special?: boolean;
}

export interface MenuSection {
  title: string;
  visible?: boolean;
  items: MenuItem[];
}

export function buildMenuSections(
  role: string,
  activeModules: string[],
  isSuperAdmin: boolean,
  isInternal: boolean,
  isExternal: boolean,
  isCompany: boolean,
  isDriver: boolean,
  isAuthor: boolean,
): MenuSection[] {
  const hasModule = (key: string) => activeModules.includes(key);
  const hasFreights = hasModule('freights') || isSuperAdmin;
  const hasMarketplace = hasModule('marketplace') || isSuperAdmin;
  const hasQuotes = hasModule('quotes') || isSuperAdmin;
  const hasFinancial = hasModule('financial') || isSuperAdmin;
  const hasPlans = hasModule('plans') || isSuperAdmin;
  const hasSupport = hasModule('support') || isSuperAdmin;
  const hasAdvertiser = hasModule('advertiser') || isSuperAdmin;

  const navegarItems: MenuItem[] = [
    { label: 'Fretes', icon: <Truck size={20} />, path: '/fretes', visible: true },
    { label: 'Marketplace', icon: <ShoppingBag size={20} />, path: '/marketplace', visible: true },
    { label: 'Comunidade', icon: <UsersRound size={20} />, path: '/comunidade', visible: true },
    { label: 'Artigos', icon: <BookOpen size={20} />, path: '/artigos', visible: true },
    { label: 'Calculadora de Custos', icon: <Calculator size={20} />, path: '/calculadora-de-custos', visible: true },
  ];

  return [
    {
      title: "Navegar",
      visible: true,
      items: navegarItems,
    },
    {
      title: "Administração",
      visible: isInternal,
      items: [
        { label: 'BI & Performance', icon: <ShieldCheck size={20} />, path: '/dashboard/admin/bi', visible: isInternal, special: true },
        { label: 'Gestão de Cargas', icon: <Truck size={20} />, path: '/dashboard/admin/cargas', visible: isInternal },
        { label: 'Gestão de Comunidade', icon: <Megaphone size={20} />, path: '/dashboard/admin/comunidades', visible: isInternal },
        { label: 'Gestão de Cotações', icon: <FileText size={20} />, path: '/dashboard/admin/cotacoes', visible: isInternal },
        { label: 'Gestão de Marketplace', icon: <ShoppingBag size={20} />, path: '/dashboard/admin/marketplace', visible: isInternal },
        { label: 'Categorias Marketplace', icon: <LayoutGrid size={20} />, path: '/dashboard/admin/marketplace-categorias', visible: isInternal },
        { label: 'Gestão de Suporte', icon: <Headphones size={20} />, path: '/dashboard/admin/suporte', visible: isInternal },
        { label: 'Gestão Financeira', icon: <Wallet size={20} />, path: '/dashboard/admin/financeiro', visible: isInternal },
        { label: 'Gestão de Leads', icon: <Mail size={20} />, path: '/dashboard/admin/leads', visible: isInternal },
        { label: 'Planos de Assinatura', icon: <Tag size={20} />, path: '/dashboard/admin/planos', visible: isSuperAdmin },
        { label: 'Precificação', icon: <CreditCard size={20} />, path: '/dashboard/admin/precificacao', visible: isSuperAdmin },
        { label: 'Gestão de Identidade', icon: <ShieldCheck size={20} />, path: '/dashboard/admin/verificacoes', visible: isInternal },
        { label: 'Gestão de Publicidade', icon: <Megaphone size={20} />, path: '/dashboard/admin/publicidade', visible: isInternal },
        { label: 'Gestão de Artigos', icon: <BookOpen size={20} />, path: '/dashboard/admin/artigos', visible: isInternal },
        { label: 'Gestão de Autores', icon: <UserPlus size={20} />, path: '/dashboard/admin/autores', visible: isInternal },
        { label: 'Avaliações', icon: <Star size={20} />, path: '/dashboard/admin/avaliacoes', visible: isInternal },
        { label: 'Denúncias', icon: <Flag size={20} />, path: '/dashboard/admin/denuncias', visible: isInternal },
        { label: 'Afiliados', icon: <Star size={20} className="fill-amber-400 text-amber-500" />, path: '/dashboard/admin/afiliados', visible: isSuperAdmin },
        { label: 'Configurações', icon: <Settings size={20} />, path: '/dashboard/admin/configuracoes', visible: isInternal },
        { label: 'Auditoria do Sistema', icon: <Shield size={20} />, path: '/dashboard/admin/auditoria', visible: isInternal },
      ],
    },
    {
      title: "Acessos",
      visible: isSuperAdmin,
      items: [
        { label: 'Usuários', icon: <Users size={18} />, path: '/dashboard/admin/usuarios', visible: isSuperAdmin },
        { label: 'Cargos', icon: <Shield size={18} />, path: '/dashboard/admin/cargos', visible: isSuperAdmin },
        { label: 'Módulos', icon: <LayoutGrid size={18} />, path: '/dashboard/admin/modulos', visible: isSuperAdmin },
      ],
    },
    {
      title: "Operacional",
      visible: isExternal,
      items: [
        { label: 'Anunciar Carga', icon: <PlusCircle size={20} />, path: '/novo-frete', visible: isCompany && hasFreights, highlight: true },
        { label: 'Meus Fretes', icon: <Truck size={20} />, path: '/dashboard/logistica', visible: isCompany && hasFreights },
      ],
    },
    {
      title: "Ecossistema",
      visible: isExternal || isInternal,
      items: [
        { label: 'Meu Marketplace', icon: <ShoppingBag size={20} />, path: '/dashboard/vendas', visible: hasMarketplace },
        { label: 'Publicidade', icon: <Megaphone size={20} />, path: '/dashboard/anunciante', visible: (isCompany || role === 'advertiser' || isInternal) && hasAdvertiser },
        { label: 'Financeiro', icon: <CreditCard size={20} />, path: '/dashboard/financeiro', visible: hasFinancial || isDriver },
        { label: 'Planos', icon: <Tag size={20} />, path: '/dashboard/planos', visible: hasPlans },
        { label: 'Suporte', icon: <HelpCircle size={20} />, path: '/dashboard/suporte', visible: hasSupport },
        { label: 'Meus Artigos', icon: <BookOpen size={20} />, path: '/dashboard/meus-artigos', visible: isAuthor || isInternal || hasModule('articles') || role === 'author' },
        { label: 'Meu Perfil', icon: <User size={20} />, path: '/dashboard/profile', visible: true },
      ],
    },
  ];
}
