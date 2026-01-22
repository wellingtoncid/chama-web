import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, LayoutDashboard, Truck, Menu, X, Users, 
  Globe, Megaphone, Settings, Mail, BarChart3, 
  Wallet, BadgeDollarSign 
} from 'lucide-react';

import AdminView from '../../components/AdminView';

export default function AdminPortal() {
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  
  const user = JSON.parse(localStorage.getItem('@ChamaFrete:user') || '{}');
  const userRole = user.role?.toLowerCase() || 'admin';

  // Sistema de verificação de permissões
  const hasPermission = (key: string) => {
    if (userRole === 'admin') return true;
    try {
      const perms = typeof user?.permissions === 'string' 
        ? JSON.parse(user.permissions) 
        : user?.permissions;
      return !!perms?.[key];
    } catch { return false; }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // Helper para trocar de aba e fechar sidebar no mobile automaticamente
  const changeTab = (tab: string) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row">
      
      {/* Mobile Header - Estilizado */}
      <header className="lg:hidden bg-slate-900 text-white p-4 flex justify-between items-center sticky top-0 z-[100] shadow-md">
         <div className="flex items-center gap-2">
            <span className="font-black italic text-orange-500 text-xl tracking-tighter">ADMIN</span>
            <span className="font-black italic text-white text-xl tracking-tighter">CF</span>
         </div>
         <button 
           onClick={() => setSidebarOpen(!isSidebarOpen)}
           className="p-2 bg-slate-800 rounded-lg"
         >
           {isSidebarOpen ? <X /> : <Menu />}
         </button>
      </header>

      {/* Sidebar - Design Control Tower */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        
        {/* Logo Section */}
        <div className="p-8 border-b border-white/5">
          <div className="text-2xl font-black text-orange-500 tracking-tighter italic uppercase leading-none">
            CHAMA<span className="text-white">ADMIN</span>
          </div>
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mt-2 italic">Control Tower v2.5</p>
        </div>
        
        {/* Navigation Content */}
        <nav className="flex-1 px-4 space-y-1 mt-6 overflow-y-auto custom-scrollbar">
          
          <button onClick={() => changeTab('home')} className={`flex items-center gap-3 w-full p-4 rounded-2xl font-black italic uppercase text-[10px] tracking-widest transition-all ${activeTab === 'home' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
            <LayoutDashboard size={18}/> Painel Geral
          </button>

          <p className="text-[9px] uppercase font-black text-slate-600 ml-4 pt-6 mb-2 tracking-widest">Operação Cargas</p>
          
          {hasPermission('approve_freights') && (
            <button onClick={() => changeTab('manage_freights')} className={`flex items-center gap-3 w-full p-4 rounded-2xl font-black italic uppercase text-[10px] tracking-widest transition-all ${activeTab === 'manage_freights' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
              <Truck size={18}/> Validar Fretes
            </button>
          )}

          {hasPermission('edit_users') && (
            <button onClick={() => changeTab('users')} className={`flex items-center gap-3 w-full p-4 rounded-2xl font-black italic uppercase text-[10px] tracking-widest transition-all ${activeTab === 'users' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
              <Users size={18}/> Usuários/Cargos
            </button>
          )}

          {userRole === 'admin' && ( 
            <button onClick={() => changeTab('groups')} className={`flex items-center gap-3 w-full p-4 rounded-2xl font-black italic uppercase text-[10px] tracking-widest transition-all ${activeTab === 'groups' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
              <Globe size={18}/> Grupos WhatsApp
            </button>
          )}

          <p className="text-[9px] uppercase font-black text-slate-600 ml-4 pt-6 mb-2 tracking-widest">Ads & Comercial</p>

          {(userRole === 'admin' || hasPermission('manage_ads')) && (
            <>
              <button onClick={() => changeTab('portal_requests')} className={`flex items-center gap-3 w-full p-4 rounded-2xl font-black italic uppercase text-[10px] tracking-widest transition-all ${activeTab === 'portal_requests' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                <Mail size={18}/> Leads do Portal
              </button>

              <button onClick={() => changeTab('ads_reports')} className={`flex items-center gap-3 w-full p-4 rounded-2xl font-black italic uppercase text-[10px] tracking-widest transition-all ${activeTab === 'ads_reports' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                <BarChart3 size={18}/> Relatórios Ads
              </button>

              <button onClick={() => changeTab('ads')} className={`flex items-center gap-3 w-full p-4 rounded-2xl font-black italic uppercase text-[10px] tracking-widest transition-all ${activeTab === 'ads' ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                <Megaphone size={18}/> Gerenciar Banners
              </button>
            </>
          )}

          {/* NOVA SEÇÃO: ESTRATÉGICO E FINANCEIRO */}
          {userRole === 'admin' && (
            <>
              <p className="text-[9px] uppercase font-black text-slate-600 ml-4 pt-6 mb-2 tracking-widest">Estratégico</p>
              
              <button onClick={() => changeTab('financial')} className={`flex items-center gap-3 w-full p-4 rounded-2xl font-black italic uppercase text-[10px] tracking-widest transition-all ${activeTab === 'financial' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                <Wallet size={18}/> Financeiro & BI
              </button>

              <button onClick={() => changeTab('manage_plans')} className={`flex items-center gap-3 w-full p-4 rounded-2xl font-black italic uppercase text-[10px] tracking-widest transition-all ${activeTab === 'manage_plans' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                <BadgeDollarSign size={18}/> Planos & Preços
              </button>

              <button onClick={() => changeTab('settings')} className={`flex items-center gap-3 w-full p-4 rounded-2xl font-black italic uppercase text-[10px] tracking-widest transition-all ${activeTab === 'settings' ? 'bg-slate-700 text-white shadow-lg shadow-slate-700/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                <Settings size={18}/> Configurações
              </button>
            </>
          )}
        </nav>

        {/* Perfil & Logout */}
        <div className="p-4 border-t border-white/5 bg-black/20">
            <button onClick={handleLogout} className="flex items-center gap-3 w-full p-4 rounded-2xl font-black italic uppercase text-[10px] tracking-widest text-red-400 hover:bg-red-500/10 hover:text-red-500 transition-all">
              <LogOut size={18} /> Sair do Painel
            </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 lg:p-12 max-h-screen overflow-y-auto">
        
        {/* Header de Boas-vindas com Identidade Visual */}
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-10">
          <div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tighter uppercase italic leading-none">
              Painel Administrativo
            </h1>
            <p className="text-slate-400 font-bold italic text-xs mt-3 uppercase tracking-widest">
              Gestor em serviço: <span className="text-slate-800">{user.name || 'Admin'}</span> • 
              Status: <span className="text-orange-600">{userRole}</span>
            </p>
          </div>
          <div className="flex gap-2">
             <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Sessão</span>
                <span className="text-[10px] font-black text-emerald-600 uppercase italic">Online</span>
             </div>
          </div>
        </header>

        {/* Delegamos a renderização baseada na activeTab selecionada acima */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
           <AdminView user={user} role={userRole} activeTab={activeTab} />
        </div>
      </main>

      {/* Overlay para fechar sidebar mobile ao clicar fora */}
      {isSidebarOpen && <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-all" onClick={() => setSidebarOpen(false)} />}
    </div>
  );
}