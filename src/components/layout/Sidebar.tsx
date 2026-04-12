import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Truck, Megaphone, ShoppingBag, 
  User, ShieldCheck, CreditCard, LogOut, MessageSquare, 
  Wallet, UserCog, Settings, Mail, Users,
  PlusCircle, Tag, HelpCircle, Headphones, FileText, Menu, X, Shield, LayoutGrid, Star, Flag
} from 'lucide-react';
import logoImg from '../../assets/chama-thumb-blue-rbg.png';
import { useState, useEffect, useCallback } from 'react';
import { api } from '../../api/api';
import Swal from 'sweetalert2';

const Sidebar = ({ user }: { user: any }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeModules, setActiveModules] = useState<string[]>([]);
  const [isAvailable, setIsAvailable] = useState(user?.is_available ?? 1);
  const [toggling, setToggling] = useState(false);

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

  useEffect(() => {
    fetchUserModules();
  }, [fetchUserModules]);

  useEffect(() => {
    if (user?.is_available !== undefined) {
      setIsAvailable(user.is_available);
    }
  }, [user?.is_available]);

  const toggleAvailability = async () => {
    const newStatus = isAvailable === 1 ? 0 : 1;
    setToggling(true);
    try {
      const res = await api.post('/toggle-availability', { is_available: newStatus });
      if (res.data.success) {
        setIsAvailable(newStatus);
        const updatedUser = { ...user, is_available: newStatus };
        localStorage.setItem('@ChamaFrete:user', JSON.stringify(updatedUser));
        Swal.fire({
          icon: 'success',
          title: newStatus === 1 ? 'Você está disponível!' : 'Você está indisponível',
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: 'top-end'
        });
      }
    } catch (e: any) {
      console.error('Erro ao togglar disponibilidade:', e);
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: e.response?.data?.message || 'Não foi possível atualizar sua disponibilidade.'
      });
    } finally {
      setToggling(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('@ChamaFrete:token');
    localStorage.removeItem('@ChamaFrete:user');
    navigate('/login');
  };

  // --- LÓGICA DE PERMISSÕES ---
  const role = String(user?.role || '').toLowerCase();
  const isInternal = ['admin', 'manager', 'support', 'finance', 'marketing', 'director', 'coordinator', 'supervisor'].includes(role);
  const isSuperAdmin = role === 'admin';
  const isExternal = ['driver', 'company'].includes(role);
  
  // Módulos ativos
  const hasModule = (key: string) => activeModules.includes(key);
  const hasFreights = hasModule('freights') || isSuperAdmin;
  const hasMarketplace = hasModule('marketplace') || isSuperAdmin;
  const hasQuotes = hasModule('quotes') || isSuperAdmin;
  const hasFinancial = hasModule('financial') || isSuperAdmin;
  const hasGroups = hasModule('groups') || isSuperAdmin;
  const hasPlans = hasModule('plans') || isSuperAdmin;
  const hasSupport = hasModule('support') || isSuperAdmin;
  const hasAdvertiser = hasModule('advertiser') || isSuperAdmin;

  // Driver specific
  const isDriver = role === 'driver';
  const isCompany = role === 'company';

  // --- DEFINIÇÃO DO MENU POR SEÇÕES ---
  const menuSections = [
    {
      title: "Principal",
      items: [
        { label: 'Início', icon: <LayoutDashboard size={20}/>, path: '/dashboard', visible: true },
        { label: 'Mensagens', icon: <MessageSquare size={20}/>, path: '/dashboard/chat', visible: true },
      ]
    },
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
        { label: 'Planos & Precificação', icon: <Tag size={20}/>, path: '/dashboard/admin/precificacao', visible: isSuperAdmin },
        { label: 'Gestão de Identidade', icon: <ShieldCheck size={20}/>, path: '/dashboard/admin/verificacoes', visible: isInternal },
        { label: 'Gestão de Anúncios', icon: <Megaphone size={20}/>, path: '/dashboard/admin/publicidade', visible: isInternal },
        { label: 'Avaliações', icon: <Star size={20}/>, path: '/dashboard/admin/avaliacoes', visible: isInternal },
        { label: 'Denúncias', icon: <Flag size={20}/>, path: '/dashboard/admin/denuncias', visible: isInternal },
        { label: 'Afiliados', icon: <Star size={20} className="fill-amber-400 text-amber-500"/>, path: '/dashboard/admin/afiliados', visible: isSuperAdmin },
        { label: 'Configurações', icon: <Settings size={20}/>, path: '/dashboard/admin/configuracoes', visible: isInternal },
        { label: 'Log de Atividades', icon: <UserCog size={20}/>, path: '/dashboard/admin/atividade', visible: isInternal },
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
        // Só empresa pode criar fretes
        { 
          label: 'Anunciar Carga', 
          icon: <PlusCircle size={20}/>, 
          path: '/novo-frete', 
          visible: isCompany && hasFreights,
          highlight: true
        },
        // Só empresa vê "Logística / Meus Fretes"
        { label: 'Meus Fretes', icon: <Truck size={20}/>, path: '/dashboard/logistica', visible: isCompany && hasFreights },
        // Só empresa tem anúncios publicitários
        { label: 'Meus Anúncios', icon: <ShoppingBag size={20}/>, path: '/dashboard/anunciante', visible: isCompany && hasAdvertiser },
        // Gestão de equipe para empresas
        { label: 'Equipe', icon: <Users size={20}/>, path: '/dashboard/equipe', visible: isCompany },
      ]
    },
    {
      title: "Ecossistema",
      items: [
        { label: 'Comunidades', icon: <Users size={20}/>, path: '/dashboard/comunidades', visible: hasGroups },
        // Cotações só para empresa
        { label: 'Cotações', icon: <FileText size={20}/>, path: '/dashboard/cotacoes', visible: isCompany && hasQuotes },
        // Marketplace para ambos (driver pode ver/vender itens)
        { label: 'Marketplace', icon: <ShoppingBag size={20}/>, path: '/dashboard/vendas', visible: hasMarketplace },
        // Financeiro: para empresa e driver (mostra carteira + histórico)
        { label: 'Financeiro', icon: <CreditCard size={20}/>, path: '/dashboard/financeiro', visible: isExternal && (hasFinancial || isDriver) },
        // Planos: só para driver
        { label: 'Planos', icon: <Shield size={20}/>, path: '/dashboard/planos', visible: isDriver && hasPlans },
        // Planos: só empresa vê planos gerais
        { label: 'Planos', icon: <Tag size={20}/>, path: '/dashboard/planos', visible: isCompany && hasPlans },
        { label: 'Suporte', icon: <HelpCircle size={20}/>, path: '/dashboard/suporte', visible: hasSupport },
        { label: 'Meu Perfil', icon: <User size={20}/>, path: '/dashboard/profile', visible: true },
      ]
    }
  ];

  return (
    <>
      <aside className="hidden lg:flex w-64 bg-slate-900 dark:bg-black text-white flex-col p-4 shadow-xl h-screen sticky top-0 overflow-y-auto border-r border-white/5 custom-scrollbar">
        {/* Logo Area do Sidebar */}
        <div className="px-4 py-8 mb-4 flex items-center gap-3 group transition-transform hover:scale-105 justify-center">
          {/* Logo Icon */}
          <div className="w-9 h-9 flex items-center justify-center transition-all group-hover:rotate-6 shrink-0">
            <img 
              src={logoImg} 
              alt="Logo ChamaFrete" 
              className="w-full h-full object-contain" 
            />
          </div>
          
          {/* Texto da Marca - Sem Slogan */}
          <h1 className="text-xl font-[1000] text-white tracking-tighter uppercase italic leading-none">
            <span className="text-orange-500">Chama</span><span className="text-blue-500">Frete</span>
          </h1>
        </div>

        {/* Toggle de Disponibilidade - Só para Drivers */}
        {isDriver && (
          <div className="mx-2 mb-6 p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isAvailable === 1 ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-300">
                  {isAvailable === 1 ? 'Disponível' : 'Indisponível'}
                </span>
              </div>
              <button
                onClick={toggleAvailability}
                disabled={toggling}
                className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                  isAvailable === 1 ? 'bg-emerald-500' : 'bg-slate-600'
                } disabled:opacity-50`}
              >
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-lg transition-all duration-300 ${
                  isAvailable === 1 ? 'left-6' : 'left-0.5'
                }`} />
              </button>
            </div>
            <p className="text-[9px] text-slate-500 mt-2 leading-tight">
              {isAvailable === 1 
                ? 'Você aparece nas buscas de empresas' 
                : 'Você não aparece nas buscas'}
            </p>
          </div>
        )}

        <nav className="flex-1 space-y-8">
          {menuSections.map((section, idx) => (
            section.visible !== false && (
              <div key={idx} className="space-y-2">
                <h3 className="px-4 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-4">
                  {section.title}
                </h3>
                {section.items.filter(i => i.visible).map((item: any) => {
                  const isActive = item.path === '/dashboard' 
                    ? location.pathname === '/dashboard' 
                    : location.pathname.startsWith(item.path);
                  
                  // Lógica de cores dinâmica
                  let activeClass = 'bg-[#1f4ead] text-white shadow-lg shadow-blue-900/40';
                  let idleClass = 'text-slate-400 hover:bg-white/5 hover:text-white';

                  if (item.highlight) {
                    idleClass = 'bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white shadow-sm border border-orange-500/20';
                    activeClass = 'bg-orange-600 text-white shadow-lg shadow-orange-900/20';
                  } else if (item.special) {
                    idleClass = 'text-orange-400 hover:bg-orange-500/10';
                  }
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 p-3.5 rounded-2xl transition-all font-bold text-sm ${isActive ? activeClass : idleClass}`}
                    >
                      {item.icon}
                      <span className="flex-1">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )
          ))}
        </nav>
        
        <div className="mt-8 space-y-2">
        <button 
          onClick={handleLogout}
          className="mt-8 flex items-center gap-3 p-4 rounded-2xl text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-all font-black text-[10px] uppercase tracking-widest border-t border-white/5 pt-6"
        >
          <LogOut size={18} />
          Encerrar Sessão
        </button>
        </div>
      </aside>

      {/* MOBILE - Hamburger Menu */}
      <div className="lg:hidden">
        {/* Botão Hamburger */}
        <button 
          onClick={() => setMobileMenuOpen(true)}
          className="fixed top-4 right-4 z-50 p-3 bg-slate-900 rounded-xl shadow-lg"
        >
          <Menu size={24} className="text-white" />
        </button>

        {/* Overlay */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/60 z-40"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Menu Mobile */}
        <aside className={`fixed top-0 right-0 w-72 bg-slate-900 text-white flex-col p-4 shadow-xl h-screen z-50 transition-transform duration-300 ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">Menu</h3>
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 hover:bg-white/10 rounded-xl"
            >
              <X size={20} className="text-slate-400" />
            </button>
          </div>

          <nav className="space-y-6 overflow-y-auto pb-20">
            {menuSections.map((section, idx) => (
              section.visible !== false && (
                <div key={idx} className="space-y-2">
                  <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">
                    {section.title}
                  </h3>
                  {section.items.filter(i => i.visible).map((item: any) => {
                    const isActive = item.path === '/dashboard' 
                      ? location.pathname === '/dashboard' 
                      : location.pathname.startsWith(item.path);

                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 p-3 rounded-xl transition-all font-bold text-sm ${
                          isActive 
                            ? 'bg-blue-600 text-white' 
                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        {item.icon}
                        <span className="flex-1">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )
            ))}

            <button 
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="flex items-center gap-3 p-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all font-bold text-sm w-full"
            >
              <LogOut size={20} />
              <span>Encerrar Sessão</span>
            </button>
          </nav>
        </aside>

        {/* Indicador de menu no canto */}
        <div className="lg:hidden fixed top-4 right-4 z-30">
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="p-3 bg-slate-800/90 backdrop-blur rounded-xl shadow-lg hover:bg-slate-700 transition-colors"
          >
            <Menu size={24} className="text-white" />
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;