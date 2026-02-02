import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

interface DashboardLayoutProps {
  user: any;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ user }) => {
  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] overflow-hidden text-slate-900 font-sans selection:bg-orange-100 selection:text-orange-600">
      
      {/* SIDEBAR: Passamos o user para que ela decida mostrar Ads/Logística */}
      <Sidebar user={user} />

      <div className="flex flex-col flex-1 min-w-0 relative">
        
        {/* TOPBAR: Z-index elevado para não sumir sob cards com transform/shadow */}
        <div className="z-30">
          <Topbar user={user} />
        </div>
        
        {/* ÁREA DE CONTEÚDO: Padding inferior ajustado para mobile */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar bg-slate-50/50">
          <div className="max-w-[1600px] mx-auto p-4 md:p-8 lg:p-10 pb-32">
            
            {/* Animação suave na troca de páginas do Outlet */}
            <div className="animate-in fade-in slide-in-from-bottom-3 duration-700 ease-out">
              <Outlet />
            </div>

          </div>
        </main>

        {/* Overlay Mobile: Ativado via estado na Sidebar/Topbar se necessário */}
        <div 
          id="sidebar-overlay" 
          className="hidden fixed inset-0 bg-slate-950/40 backdrop-blur-md z-40 lg:hidden transition-all duration-300" 
        />
      </div>

      {/* Estilo Global para a scrollbar do Dashboard (Brutalista/Clean) */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #E2E8F0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #CBD5E1;
        }
      `}</style>
    </div>
  );
};

export default DashboardLayout;