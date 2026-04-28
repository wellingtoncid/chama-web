import React, { useEffect, useState, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Truck, Megaphone, ShoppingBag, 
  User, ShieldCheck, CreditCard, LogOut, MessageSquare, 
  Wallet, UserCog, Settings, Mail, Users,
  PlusCircle, Tag, HelpCircle, Headphones, FileText, Shield, LayoutGrid, Star, Flag,
  X, ChevronRight, BookOpen, UserPlus
} from 'lucide-react';
import { api } from '@/api/api';

interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

const MenuDrawer: React.FC<MenuDrawerProps> = ({ isOpen, onClose, user }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeModules, setActiveModules] = useState<string[]>([]);
  const [isAvailable, setIsAvailable] = useState(user?.is_available ?? 1);
  const [isAuthor, setIsAuthor] = useState(false);

  const fetchUserModules = useCallback(async () => {
    try {
      const res = await api.get('/user/modules');
      if (res.data?.success) {
        const modules = res.data.data.modules || [];
        const active = modules
          .filter((m: any) => m.is_active)
          .map((m: any) => m.key);
        setActiveModules(active);
      }
    } catch (e) {
      console.error('Erro ao carregar módulos:', e);
    }
  }, []);

  const checkAuthorStatus = useCallback(async () => {
    try {
      const res = await api.get('/article-author-status');
      if (res.data?.success) {
        setIsAuthor(res.data.data.is_author || false);
      }
    } catch (e) {
      console.error('Erro ao verificar status de autor:', e);
    }
  }, []);

  useEffect(() => {
    fetchUserModules();
    if (user) {
      checkAuthorStatus();
    }
  }, [fetchUserModules, checkAuthorStatus, user]);

  useEffect(() => {
    if (user?.is_available !== undefined) {
      setIsAvailable(user.is_available);
    }
  }, [user?.is_available]);

  const role = String(user?.role || '').toLowerCase();
  const isInternal = ['admin', 'manager', 'support', 'finance', 'marketing', 'director', 'coordinator', 'supervisor'].includes(role);
  const isSuperAdmin = role === 'admin';
  const isExternal = ['driver', 'company'].includes(role);
  
  const hasModule = (key: string) => activeModules.includes(key);
  const hasFreights = hasModule('freights') || isSuperAdmin;
  const hasMarketplace = hasModule('marketplace') || isSuperAdmin;
  const hasQuotes = hasModule('quotes') || isSuperAdmin;
  const hasFinancial = hasModule('financial') || isSuperAdmin;
  const hasGroups = hasModule('groups') || isSuperAdmin;
  const hasPlans = hasModule('plans') || isSuperAdmin;
  const hasSupport = hasModule('support') || isSuperAdmin;
  const hasArticles = hasModule('articles') || isSuperAdmin;
  const hasAdvertiser = hasModule('advertiser') || isSuperAdmin;

  const isDriver = role === 'driver';
  const isCompany = role === 'company';

  const menuSections = [
    {
      title: "Administração",
      visible: isInternal,
      items: [
        { label: 'BI & Performance', icon: <ShieldCheck size={20} />, path: '/dashboard/admin/bi', visible: isInternal, special: true },
        { label: 'Gestão de Cargas', icon: <Truck size={20}/>, path: '/dashboard/admin/cargas', visible: isInternal },
        { label: 'Gestão de Comunidade', icon: <Megaphone size={20}/>, path: '/dashboard/admin/comunidades', visible: isInternal },
        { label: 'Gestão de Cotações', icon: <FileText size={20}/>, path: '/dashboard/admin/cotacoes', visible: isInternal },
        { label: 'Gestão de Marketplaces', icon: <ShoppingBag size={20}/>, path: '/dashboard/admin/marketplace', visible: isInternal },
        { label: 'Gestão de Suporte', icon: <Headphones size={20}/>, path: '/dashboard/admin/suporte', visible: isInternal },
        { label: 'Gestão Financeira', icon: <Wallet size={20}/>, path: '/dashboard/admin/financeiro', visible: isInternal },
        { label: 'Gestão de Leads', icon: <Mail size={20}/>, path: '/dashboard/admin/leads', visible: isInternal },
        { label: 'Planos de Assinatura', icon: <Tag size={20}/>, path: '/dashboard/admin/planos', visible: isSuperAdmin },
        { label: 'Precificação', icon: <CreditCard size={20}/>, path: '/dashboard/admin/precificacao', visible: isSuperAdmin },
        { label: 'Gestão de Identidade', icon: <ShieldCheck size={20}/>, path: '/dashboard/admin/verificacoes', visible: isInternal },
        { label: 'Gestão de Anúncios', icon: <Megaphone size={20}/>, path: '/dashboard/admin/publicidade', visible: isInternal },
        { label: 'Gestão de Artigos', icon: <BookOpen size={20}/>, path: '/dashboard/admin/artigos', visible: isInternal },
        { label: 'Gestão de Autores', icon: <UserPlus size={20}/>, path: '/dashboard/admin/autores', visible: isInternal },
        { label: 'Avaliações', icon: <Star size={20}/>, path: '/dashboard/admin/avaliacoes', visible: isInternal },
        { label: 'Denúncias', icon: <Flag size={20}/>, path: '/dashboard/admin/denuncias', visible: isInternal },
        { label: 'Afiliados', icon: <Star size={20} className="fill-amber-400 text-amber-500"/>, path: '/dashboard/admin/afiliados', visible: isSuperAdmin },
        { label: 'Configurações', icon: <Settings size={20}/>, path: '/dashboard/admin/configuracoes', visible: isInternal },
        { label: 'Auditoria do Sistema', icon: <Shield size={20}/>, path: '/dashboard/admin/auditoria', visible: isInternal },
      ]
    },
    {
      title: "Acessos",
      visible: isSuperAdmin,
      items: [
        { label: 'Usuários', icon: <Users size={18}/>, path: '/dashboard/admin/usuarios', visible: isSuperAdmin },
        { label: 'Cargos', icon: <Shield size={18}/>, path: '/dashboard/admin/cargos', visible: isSuperAdmin },
        { label: 'Módulos', icon: <LayoutGrid size={18}/>, path: '/dashboard/admin/modulos', visible: isSuperAdmin },
      ]
    },
    {
      title: "Operacional",
      visible: isExternal,
      items: [
        { label: 'Anunciar Carga', icon: <PlusCircle size={20}/>, path: '/novo-frete', visible: isCompany && hasFreights, highlight: true },
        { label: 'Meus Fretes', icon: <Truck size={20}/>, path: '/dashboard/logistica', visible: isCompany && hasFreights },
        { label: 'Meus Anúncios', icon: <ShoppingBag size={20}/>, path: '/dashboard/anunciante', visible: isCompany && hasAdvertiser },
        { label: 'Equipe', icon: <Users size={20}/>, path: '/dashboard/equipe', visible: isCompany },
      ]
    },
    {
      title: "Ecossistema",
      items: [
        { label: 'Cotações', icon: <FileText size={20}/>, path: '/dashboard/cotacoes', visible: isCompany && hasQuotes },
        { label: 'Marketplace', icon: <ShoppingBag size={20}/>, path: '/dashboard/vendas', visible: hasMarketplace },
        { label: 'Financeiro', icon: <CreditCard size={20}/>, path: '/dashboard/financeiro', visible: isExternal && (hasFinancial || isDriver) },
        { label: 'Planos', icon: isDriver ? <Shield size={20}/> : <Tag size={20}/>, path: '/dashboard/planos', visible: hasPlans },
        { label: 'Suporte', icon: <HelpCircle size={20}/>, path: '/dashboard/suporte', visible: hasSupport },
        { label: 'Meus Artigos', icon: <BookOpen size={20}/>, path: '/dashboard/meus-artigos', visible: isAuthor || isInternal || hasArticles || role === 'author' },
        { label: 'Meu Perfil', icon: <User size={20}/>, path: '/dashboard/profile', visible: true },
      ]
    },
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    localStorage.removeItem('@ChamaFrete:token');
    localStorage.removeItem('@ChamaFrete:user');
    onClose();
    window.location.href = '/';
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}
      
      {/* Drawer - Right side */}
      <div className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white dark:bg-slate-950 z-50 shadow-2xl transform transition-transform duration-300 ease-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                <span className="font-bold text-slate-600 dark:text-slate-300">{user?.name?.charAt(0) || 'U'}</span>
              </div>
            )}
            <div>
              <p className="font-bold text-sm text-slate-900 dark:text-white">{user?.name}</p>
              <p className="text-xs text-slate-500 capitalize">{role}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => handleNavigate('/dashboard')}
              className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <LayoutDashboard size={18} className="text-[#1f4ead]" />
              <span className="text-xs font-bold">Início</span>
            </button>
            <button 
              onClick={() => handleNavigate('/dashboard/chat')}
              className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <MessageSquare size={18} className="text-[#1f4ead]" />
              <span className="text-xs font-bold">Mensagens</span>
            </button>
          </div>
        </div>

        {/* Menu Content - Scrollable */}
        <div className="flex-1 overflow-y-auto py-4">
          {menuSections.map((section, sectionIndex) => {
            if (section.visible === false) return null;
            
            return (
              <div key={sectionIndex} className="mb-4">
                {section.title && (
                  <h3 className="px-4 mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {section.title}
                  </h3>
                )}
                <div className="space-y-0.5">
                  {section.items.filter(item => item.visible !== false).map((item, itemIndex) => {
                    const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
                    
                    return (
                      <button
                        key={itemIndex}
                        onClick={() => handleNavigate(item.path)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 transition-all ${
                          isActive 
                            ? 'bg-[#1f4ead]/10 text-[#1f4ead] dark:text-blue-400' 
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900'
                        } ${item.highlight ? 'border-l-4 border-orange-500' : ''}`}
                      >
                        <span className={isActive ? 'text-[#1f4ead]' : 'text-slate-400'}>
                          {item.icon}
                        </span>
                        <span className={`text-sm font-medium flex-1 text-left ${item.highlight ? 'text-orange-600 dark:text-orange-400' : ''}`}>
                          {item.label}
                        </span>
                        <ChevronRight size={16} className={`text-slate-300 ${isActive ? 'opacity-100' : 'opacity-0'}`} />
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer - Logout */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Sair da conta</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default MenuDrawer;