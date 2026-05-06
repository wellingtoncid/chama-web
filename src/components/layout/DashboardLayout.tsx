import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import MenuDrawer from '../shared/MenuDrawer';
import NotificationBell from '../ui/NotificationBell';
import { Menu, Sun, Moon, ChevronDown, LayoutDashboard, MessageSquare } from 'lucide-react';
import logoImg from '../../assets/chama-thumb-blue-rbg.png';

interface DashboardLayoutProps {
  user: any;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ user }) => {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('@ChamaFrete:theme') === 'dark';
  });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const navLinks = [
    { name: "Fretes", href: "/fretes" },
    { name: "Marketplace", href: "/marketplace" },
    { name: "Comunidades", href: "/comunidade" }
  ];

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('@ChamaFrete:theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('@ChamaFrete:theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);
  const displayName = user?.name ?? user?.email ?? 'Usuário';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-100 transition-colors duration-500">
      
      {/* Header-like bar - same as public pages */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsDrawerOpen(true)}
                className="lg:hidden flex items-center gap-2 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <Menu size={24} className="text-slate-600 dark:text-slate-300" />
              </button>
              <a href="/" className="flex items-center gap-2 group">
                <div className="w-9 h-9 flex items-center justify-center">
                  <img src={logoImg} alt="ChamaFrete" className="w-full h-full object-contain" />
                </div>
                <div className="hidden sm:flex flex-col">
                  <h1 className="text-2xl font-[1000] text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">
                    <span className="text-orange-500">Chama</span><span className="text-[#1f4ead]">Frete</span>
                  </h1>
                </div>
              </a>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-5">
              {navLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-orange-500 dark:hover:text-orange-400 transition-all relative group"
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all group-hover:w-full" />
                </a>
              ))}
            </nav>

            {/* Right Side - Actions */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <button 
                onClick={toggleTheme}
                className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
              >
                {isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
              </button>

              {/* Notifications */}
              <NotificationBell />

              {/* User Avatar - Opens MenuDrawer */}
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt={displayName} className="w-8 h-8 rounded-full object-cover"/>
                ) : (
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-200 text-slate-700">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                )}
                <span className="hidden md:block font-bold text-sm text-slate-700 dark:text-slate-200 whitespace-nowrap">{displayName}</span>
                <ChevronDown size={14} className="hidden md:block" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Quick Actions Bar */}
      <div className="lg:hidden bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 py-2 flex items-center gap-2">
        <button 
          onClick={() => setIsDrawerOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg"
        >
          <LayoutDashboard size={16} />
          <span className="text-xs font-bold">Início</span>
        </button>
        <button 
          onClick={() => window.location.href = '/dashboard/chat'}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg"
        >
          <MessageSquare size={16} />
          <span className="text-xs font-bold">Mensagens</span>
        </button>
        <button 
          onClick={toggleTheme}
          className="ml-auto p-2 text-slate-500"
        >
          {isDark ? '☀️' : '🌙'}
        </button>
      </div>

      {/* Main Content Area */}
      <main className="max-w-[1280px] mx-auto px-6 lg:px-10 py-6 pb-32">
        <div className="animate-in fade-in slide-in-from-bottom-3 duration-700 ease-out">
          <Outlet />
        </div>
      </main>

      {/* Menu Drawer */}
      <MenuDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        user={user} 
      />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #E2E8F0;
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1E293B;
          border: 1px solid #334155;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #334155; }
      `}</style>
    </div>
  );
};

export default DashboardLayout;