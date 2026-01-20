import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, LayoutDashboard, Truck, Menu, X, Users, 
  Globe, Megaphone, Settings, Mail, BarChart3 
} from 'lucide-react';

import AdminView from '../../components/admin/AdminView';

export default function AdminPortal() {
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  
  const user = JSON.parse(localStorage.getItem('@ChamaFrete:user') || '{}');
  const userRole = user.role?.toLowerCase() || 'admin';

  // Centralizamos a verificação de permissão aqui para o Menu
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

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row">
      
      {/* Mobile Header */}
      <header className="lg:hidden bg-slate-900 text-white p-4 flex justify-between items-center">
         <span className="font-black italic text-orange-500 text-xl">ADMIN CF</span>
         <button onClick={() => setSidebarOpen(!isSidebarOpen)}>
           {isSidebarOpen ? <X /> : <Menu />}
         </button>
      </header>

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col shadow-2xl transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-8 text-2xl font-black text-orange-500 tracking-tighter italic uppercase">ADMIN CF</div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
          <button onClick={() => { setActiveTab('home'); setSidebarOpen(false); }} className={`flex items-center gap-3 w-full p-3 rounded-xl font-bold transition-all ${activeTab === 'home' ? 'bg-orange-500 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}>
            <LayoutDashboard size={18}/> Painel Geral
          </button>

          <p className="text-[10px] uppercase font-black text-slate-500 ml-3 pt-4 mb-2">Operação</p>
          
          {hasPermission('approve_freights') && (
            <button onClick={() => { setActiveTab('manage_freights'); setSidebarOpen(false); }} className={`flex items-center gap-3 w-full p-3 rounded-xl font-bold ${activeTab === 'manage_freights' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
              <Truck size={18}/> Validar Fretes
            </button>
          )}

          {hasPermission('edit_users') && (
            <button onClick={() => { setActiveTab('users'); setSidebarOpen(false); }} className={`flex items-center gap-3 w-full p-3 rounded-xl font-bold ${activeTab === 'users' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
              <Users size={18}/> Usuários/Cargos
            </button>
          )}

          {userRole === 'admin' && ( 
            <button onClick={() => { setActiveTab('groups'); setSidebarOpen(false); }} className={`flex items-center gap-3 w-full p-3 rounded-xl font-bold ${activeTab === 'groups' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
              <Globe size={18}/> Grupos WhatsApp
            </button>
          )}

          <p className="text-[10px] uppercase font-black text-slate-500 ml-3 pt-4 mb-2">Comercial & Ads</p>

          {(userRole === 'admin' || hasPermission('manage_ads')) && (
            <>
              <button onClick={() => { setActiveTab('portal_requests'); setSidebarOpen(false); }} className={`flex items-center gap-3 w-full p-3 rounded-xl font-bold ${activeTab === 'portal_requests' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}>
                <Mail size={18}/> Leads do Portal
              </button>

              <button onClick={() => { setActiveTab('ads_reports'); setSidebarOpen(false); }} className={`flex items-center gap-3 w-full p-3 rounded-xl font-bold ${activeTab === 'ads_reports' ? 'bg-orange-500 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}>
                <BarChart3 size={18}/> Relatórios Ads
              </button>

              <button onClick={() => { setActiveTab('ads'); setSidebarOpen(false); }} className={`flex items-center gap-3 w-full p-3 rounded-xl font-bold ${activeTab === 'ads' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
                <Megaphone size={18}/> Gerenciar Banners
              </button>
            </>
          )}

          {userRole === 'admin' && ( 
            <button onClick={() => { setActiveTab('settings'); setSidebarOpen(false); }} className={`flex items-center gap-3 w-full p-3 rounded-xl font-bold ${activeTab === 'settings' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
              <Settings size={18}/> Configurações
            </button>
          )}
        </nav>

        <button onClick={handleLogout} className="p-8 text-slate-500 flex items-center gap-2 hover:text-white transition-all font-bold border-t border-slate-800">
          <LogOut size={18} /> Sair do Painel
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-10 max-h-screen overflow-y-auto">
        <header className="mb-8 border-b border-slate-200 pb-8">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase italic">
            Painel Administrativo
          </h1>
          <p className="text-slate-500 font-medium italic text-sm">
            Gestor: {user.name} • <span className="text-orange-600 font-bold uppercase">{userRole}</span>
          </p>
        </header>

        {/* Delegamos a renderização para o AdminView */}
        <AdminView user={user} role={userRole} activeTab={activeTab} />
      </main>

      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
    </div>
  );
}