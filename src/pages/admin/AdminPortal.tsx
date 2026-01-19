import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, LayoutDashboard, Truck, MessageSquare, 
  Menu, X, Users, Globe, Megaphone, Settings,
  Mail // Adicionado para os Leads
} from 'lucide-react';

// IMPORTAÇÃO DIRETA DAS VIEWS
import DashboardAdmin from '../../components/admin/DashboardAdmin';
import UsersManagerView from '../../components/admin/UsersManagerView';
import FreightManagerView from '../../components/admin/FreightManagerView';
import GroupsManagerView from '../../components/admin/GroupsManagerView';
import AdsManager from '../../components/admin/AdsManager';
import SettingsView from '../../components/admin/SettingsView';
import AdminPortalRequests from '../../components/admin/AdminPortalRequests'; // <-- Importado aqui

export default function AdminPortal() {
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  
  const user = JSON.parse(localStorage.getItem('@ChamaFrete:user') || '{}');
  const userRole = user.role?.toLowerCase() || 'admin';

  const hasPermission = (user: any, key: string) => {
    if (user?.role?.toLowerCase() === 'admin') return true;
    try {
      const perms = typeof user?.permissions === 'string' 
        ? JSON.parse(user.permissions) 
        : user?.permissions;
      return !!perms?.[key];
    } catch {
      return false;
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <DashboardAdmin />;

      case 'manage_freights':
        return hasPermission(user, 'approve_freights') 
          ? <FreightManagerView /> 
          : <DashboardAdmin />;

      case 'users':
        return hasPermission(user, 'edit_users') 
          ? <UsersManagerView /> 
          : <DashboardAdmin />;

      case 'groups':
        return (user.role === 'admin' || hasPermission(user, 'manage_groups')) 
          ? <GroupsManagerView /> 
          : <DashboardAdmin />;

      // --- NOVA VIEW DE SOLICITAÇÕES ---
      case 'portal_requests':
        return (user.role === 'admin' || hasPermission(user, 'manage_ads')) 
          ? <AdminPortalRequests /> 
          : <DashboardAdmin />;

      case 'ads':
        return (user.role === 'admin' || hasPermission(user, 'manage_ads')) 
          ? <AdsManager /> 
          : <DashboardAdmin />;

      case 'settings':
        return user.role === 'admin' 
          ? <SettingsView /> 
          : <DashboardAdmin />;

      default:
        return <DashboardAdmin />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row">
      
      <header className="lg:hidden bg-slate-900 text-white p-4 flex justify-between items-center">
         <span className="font-black italic text-orange-500 text-xl">ADMIN CF</span>
         <button onClick={() => setSidebarOpen(!isSidebarOpen)}>
           {isSidebarOpen ? <X /> : <Menu />}
         </button>
      </header>

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col shadow-2xl transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-8 text-2xl font-black text-orange-500 tracking-tighter italic uppercase">ADMIN CF</div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
          <button onClick={() => { setActiveTab('home'); setSidebarOpen(false); }} className={`flex items-center gap-3 w-full p-3 rounded-xl font-bold transition-all ${activeTab === 'home' ? 'bg-orange-500 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}>
            <LayoutDashboard size={18}/> Painel Geral
          </button>

          <p className="text-[10px] uppercase font-black text-slate-500 ml-3 pt-4 mb-2">Gestão de Operação</p>
          
          {hasPermission(user, 'approve_freights') && (
            <button onClick={() => { setActiveTab('manage_freights'); setSidebarOpen(false); }} className={`flex items-center gap-3 w-full p-3 rounded-xl font-bold ${activeTab === 'manage_freights' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
              <Truck size={18}/> Validar Fretes
            </button>
          )}

          {hasPermission(user, 'edit_users') && (
            <button onClick={() => { setActiveTab('users'); setSidebarOpen(false); }} className={`flex items-center gap-3 w-full p-3 rounded-xl font-bold ${activeTab === 'users' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
              <Users size={18}/> Usuários/Cargos
            </button>
          )}

          {user.role === 'admin' && ( 
            <button onClick={() => { setActiveTab('groups'); setSidebarOpen(false); }} className={`flex items-center gap-3 w-full p-3 rounded-xl font-bold ${activeTab === 'groups' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
              <Globe size={18}/> Grupos WhatsApp
            </button>
          )}

          {/* NOVO BOTÃO DE LEADS/SOLICITAÇÕES */}
          {(user.role === 'admin' || hasPermission(user, 'manage_ads')) && (
            <button onClick={() => { setActiveTab('portal_requests'); setSidebarOpen(false); }} className={`flex items-center gap-3 w-full p-3 rounded-xl font-bold ${activeTab === 'portal_requests' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'text-slate-400 hover:bg-slate-800'}`}>
              <Mail size={18}/> Leads do Portal
            </button>
          )}

          {(user.role === 'admin' || hasPermission(user, 'manage_ads')) && (
            <button onClick={() => { setActiveTab('ads'); setSidebarOpen(false); }} className={`flex items-center gap-3 w-full p-3 rounded-xl font-bold ${activeTab === 'ads' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
              <Megaphone size={18}/> Marketing/Ads
            </button>
          )}

          {user.role === 'admin' && ( 
            <button onClick={() => { setActiveTab('settings'); setSidebarOpen(false); }} className={`flex items-center gap-3 w-full p-3 rounded-xl font-bold ${activeTab === 'settings' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
              <Settings size={18}/> Configurações
            </button>
          )}
        </nav>

        <button onClick={handleLogout} className="p-8 text-slate-500 flex items-center gap-2 hover:text-white transition-all font-bold border-t border-slate-800">
          <LogOut size={18} /> Sair do Painel
        </button>
      </aside>

      <main className="flex-1 p-4 lg:p-10 max-h-screen overflow-y-auto">
        <header className="mb-8 border-b border-slate-200 pb-8">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase italic">
            {activeTab === 'portal_requests' ? 'Leads e Solicitações' : activeTab === 'home' ? 'Painel Geral' : activeTab.replace('_', ' ')}
          </h1>
          <p className="text-slate-500 font-medium italic text-sm">
            Gestor: {user.name} • <span className="text-orange-600 font-bold uppercase">{userRole}</span>
          </p>
        </header>

        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          {renderContent()}
        </div>
      </main>

      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
    </div>
  );
}