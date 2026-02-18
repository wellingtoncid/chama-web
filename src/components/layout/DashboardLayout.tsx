import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

interface DashboardLayoutProps {
  user: any;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ user }) => {
  // Lógica de Tema
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('@ChamaFrete:theme') === 'dark';
  });

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

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-100 transition-colors duration-500">
      
      {/* SIDEBAR */}
      <Sidebar user={user} />

      <div className="flex flex-col flex-1 min-w-0 bg-transparent">
        
        {/* TOPBAR - Passamos a lógica do tema para o botão que deve estar lá dentro */}
        <div className="z-30">
          <Topbar user={user} {...({ isDark, toggleTheme } as any)} />
        </div>
        
        {/* ÁREA DE CONTEÚDO */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar bg-slate-50 dark:bg-[#020617] transition-colors duration-500">
          <div className="max-w-[1600px] mx-auto p-4 md:p-10 pb-32">
            
            <div className="animate-in fade-in slide-in-from-bottom-3 duration-700 ease-out">
              <Outlet />
            </div>

          </div>
        </main>

        {/* Overlay Mobile */}
        <div 
          id="sidebar-overlay" 
          className="hidden fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden transition-all duration-300" 
        />
      </div>

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