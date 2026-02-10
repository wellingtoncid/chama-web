import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Truck, Megaphone, ShoppingBag, 
  User, ShieldCheck, CreditCard, LogOut, MessageSquare, 
  Wallet, UserCog, Settings, Mail, Users,
  PlusCircle
} from 'lucide-react';

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  visible: boolean;
  special?: boolean; // O '?' indica que é opcional
}

const Sidebar = ({ user }: { user: any }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('@ChamaFrete:token');
    localStorage.removeItem('@ChamaFrete:user');
    navigate('/login');
  };

  // --- LÓGICA DE PERMISSÕES (Mesma do DashboardPage) ---
  const role = String(user?.role || '').toUpperCase();
  const isInternal = ['ADMIN', 'SUPERADMIN', 'SUPPORT', 'SALES', 'MANAGER'].includes(role);
  const isCompanyOrShipper = ['COMPANY', 'TRANSPORTADORA', 'SHIPPER', 'LOGISTICS'].includes(role);
  const hasAdsModule = !!user?.is_advertiser || isInternal || isCompanyOrShipper;

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
        { label: 'Cargas Global', icon: <Truck size={20}/>, path: '/dashboard/admin/cargas', visible: isInternal },
        { label: 'Comunidades', icon: <Megaphone size={20}/>, path: '/dashboard/admin/comunidades', visible: isInternal },
        { label: 'Usuários', icon: <Users size={20}/>, path: '/dashboard/admin/usuarios', visible: isInternal },
        { label: 'Financeiro BI', icon: <Wallet size={20}/>, path: '/dashboard/admin/financeiro', visible: isInternal },
        { label: 'Leads & CRM', icon: <Mail size={20}/>, path: '/dashboard/admin/leads', visible: isInternal },
        { label: 'Configurações', icon: <Settings size={20}/>, path: '/dashboard/admin/configuracoes', visible: isInternal },
        { label: 'Atividade', icon: <UserCog size={20}/>, path: '/dashboard/admin/atividade', visible: isInternal },
      ]
    },
    {
      title: "Operacional",
      visible: isCompanyOrShipper || isInternal,
      items: [
        { 
          label: 'Anunciar Carga', 
          icon: <PlusCircle size={20}/>, // PlusCircle para diferenciar
          path: '/novo-frete', 
          visible: isCompanyOrShipper || isInternal,
          highlight: true // <--- NOVA PROPRIEDADE PARA O ESTILO LARANJA
        },
        { label: 'Meus Fretes', icon: <Truck size={20}/>, path: '/dashboard/logistica', visible: isCompanyOrShipper || isInternal },
        { label: 'Publicidade', icon: <Megaphone size={20}/>, path: '/dashboard/anunciante', visible: hasAdsModule },
      ]
    },
    {
      title: "Ecossistema",
      items: [
        { label: 'Marketplace', icon: <ShoppingBag size={20}/>, path: '/dashboard/vendas', visible: true },
        { label: 'Financeiro', icon: <CreditCard size={20}/>, path: '/dashboard/financeiro', visible: true },
        { label: 'Meu Perfil', icon: <User size={20}/>, path: '/dashboard/profile', visible: true },
      ]
    }
  ];

  return (
    <>
      <aside className="hidden lg:flex w-64 bg-slate-900 text-white flex-col p-4 shadow-xl h-screen sticky top-0 overflow-y-auto border-r border-white/5 custom-scrollbar">
        <div className="p-6 mb-8 flex justify-center">
          <img src="/logo-white.png" alt="Chama Frete" className="w-32 h-auto" />
        </div>

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
                  let activeClass = 'bg-blue-600 text-white shadow-lg shadow-blue-900/20';
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
        
        <button 
          onClick={handleLogout}
          className="mt-8 flex items-center gap-3 p-4 rounded-2xl text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-all font-black text-[10px] uppercase tracking-widest border-t border-white/5 pt-6"
        >
          <LogOut size={18} />
          Encerrar Sessão
        </button>
      </aside>

      {/* MOBILE BAR (Opcional: adicionar o botão de anunciar carga se for empresa) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 border-t border-white/10 flex justify-around items-center px-2 py-3 z-50 backdrop-blur-md">
        {[
          { icon: <LayoutDashboard size={20}/>, path: '/dashboard', label: 'Home' },
          (isCompanyOrShipper || isInternal) && { icon: <PlusCircle size={20} className="text-orange-500"/>, path: '/novo-frete', label: 'Anunciar' },
          { icon: <MessageSquare size={20}/>, path: '/dashboard/chat', label: 'Chat' },
          { icon: <User size={20}/>, path: '/dashboard/profile', label: 'Perfil' },
        ].filter(Boolean).map((item: any) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center min-w-[64px] ${location.pathname === item.path ? 'text-blue-500' : 'text-slate-400'}`}
          >
            {item.icon}
            <span className="text-[9px] font-black mt-1 uppercase">{item.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
};

export default Sidebar;