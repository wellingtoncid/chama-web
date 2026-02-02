import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Truck, Megaphone, ShoppingBag, 
  User, ShieldCheck, CreditCard, LogOut, MessageSquare 
} from 'lucide-react';

const Sidebar = ({ user }: { user: any }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('@ChamaFrete:token');
    localStorage.removeItem('@ChamaFrete:user');
    navigate('/login');
  };

  // Padronização de Roles
  const role = user.role?.toUpperCase() || 'DRIVER';
  const isAdmin = role === 'ADMIN';
  const isCompany = role === 'COMPANY' || role === 'SHIPPER' || isAdmin;
  const isAdvertiser = !!user.is_advertiser || role === 'ADVERTISER' || isCompany;

  const menuItems = [
    { label: 'Geral', icon: <LayoutDashboard size={20}/>, path: '/dashboard', visible: true },
    
    { 
      label: 'Admin', 
      icon: <ShieldCheck size={20} />, 
      path: '/dashboard/admin', 
      visible: isAdmin,
      special: true // Para estilização diferenciada
    },
    
    { 
      label: 'Mensagens', 
      icon: <MessageSquare size={20}/>, 
      path: '/chat', 
      visible: true,
      badge: true 
    },
    
    { 
      label: 'Meus Fretes', 
      icon: <Truck size={20}/>, 
      path: '/dashboard/logistica', 
      visible: isCompany || !!user.is_shipper
    },
    
    { 
      label: 'Publicidade', 
      icon: <Megaphone size={20}/>, 
      path: '/dashboard/anunciante', 
      visible: isAdvertiser
    },
    
    { label: 'Vendas', icon: <ShoppingBag size={20}/>, path: '/dashboard/vendas', visible: true },
    { label: 'Financeiro', icon: <CreditCard size={20}/>, path: '/dashboard/financeiro', visible: true },
    { label: 'Perfil', icon: <User size={20}/>, path: '/dashboard/profile', visible: true },
  ];

  const visibleItems = menuItems.filter(item => item.visible);

  return (
    <>
      {/* SIDEBAR DESKTOP */}
      <aside className="hidden lg:flex w-64 bg-slate-900 text-white flex-col p-4 shadow-xl h-screen sticky top-0 overflow-y-auto border-r border-white/5">
        <div className="p-6 mb-8 flex justify-center">
          <img src="/logo-white.png" alt="Chama Frete" className="w-32 h-auto" />
        </div>

        <nav className="flex-1 space-y-2">
          {visibleItems.map((item) => {
            const isActive = item.path === '/dashboard' 
              ? location.pathname === '/dashboard' 
              : location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 p-4 rounded-2xl transition-all font-bold text-sm ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                    : item.special 
                      ? 'text-orange-400 hover:bg-orange-500/10' 
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                {item.icon}
                <span className="flex-1">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        
        <button 
          onClick={handleLogout}
          className="mt-4 flex items-center gap-3 p-4 rounded-2xl text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-all font-black text-[10px] uppercase tracking-widest border-t border-white/5 pt-6"
        >
          <LogOut size={18} />
          Sair do Sistema
        </button>
      </aside>

      {/* NAVEGAÇÃO MOBILE */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 border-t border-white/10 flex justify-around items-center px-2 py-3 z-50 backdrop-blur-md">
        {visibleItems
          .filter(item => !item.special) // Remove Admin do mobile bar para economizar espaço
          .slice(0, 4) // Home, Chat, Logística, Ads
          .map((item) => {
            const isActive = location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center min-w-[64px] transition-all ${
                  isActive ? 'text-blue-500 scale-110' : 'text-slate-400'
                }`}
              >
                {item.icon}
                <span className="text-[9px] font-black mt-1 uppercase tracking-tighter">
                  {item.label === 'Geral' ? 'Home' : item.label}
                </span>
              </Link>
            );
          })}
          
          {/* Botão Perfil fixo no Mobile */}
          <Link 
            to="/dashboard/profile"
            className={`flex flex-col items-center justify-center min-w-[64px] ${location.pathname.includes('profile') ? 'text-blue-500' : 'text-slate-400'}`}
          >
            <User size={20} />
            <span className="text-[9px] font-black mt-1 uppercase tracking-tighter">Perfil</span>
          </Link>
      </nav>
    </>
  );
};

export default Sidebar;