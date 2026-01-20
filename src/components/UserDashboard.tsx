import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, LayoutDashboard, MessageSquare, 
  PlusCircle, Menu, X, UserCircle, Bell, Megaphone 
} from 'lucide-react';
import DriverView from './driver/DriverView';
import CompanyView from './company/CompanyView';
import PlanCheckout from './advertiser/PlanCheckout';

interface UserDashboardProps {
  user?: any;
}

export default function UserDashboard({ user: propUser }: UserDashboardProps) {
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [isCheckoutOpen, setCheckoutOpen] = useState(false);
  
  const user = propUser || JSON.parse(localStorage.getItem('@ChamaFrete:user') || '{}');
  const userRole = user.role?.toLowerCase() || 'driver';
  
  // Verifica se o usuário tem permissão de anunciante (is_subscriber vindo do banco)
  const isSubscriber = user.is_subscriber === 1 || user.is_subscriber === true;
  const isAdmin = userRole === 'admin';

  const handleLogout = () => {
    localStorage.removeItem('@ChamaFrete:user');
    localStorage.removeItem('user_data');
    localStorage.removeItem('@ChamaFrete:token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      
      {/* BOTÃO MOBILE (Hambúrguer) */}
      <div className="lg:hidden bg-slate-900 p-4 flex justify-between items-center text-white">
        <span className="font-black italic text-orange-500">CHAMA FRETE</span>
        <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 bg-slate-800 rounded-lg">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* SIDEBAR */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white flex flex-col shadow-2xl transition-transform duration-300
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-8 text-2xl font-black text-orange-500 italic hidden lg:block">
          CHAMA FRETE
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <button 
            onClick={() => { setActiveTab('home'); setSidebarOpen(false); }} 
            className={`flex items-center gap-3 w-full p-4 rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all ${activeTab === 'home' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <LayoutDashboard size={18}/> 
            {userRole === 'company' ? 'Minhas Cargas' : 'Painel do Motorista'}
          </button>

          {/* ACESSO AO PORTAL DE ANUNCIANTES (Condicional) */}
          {(isSubscriber || isAdmin) && (
            <button 
              onClick={() => { navigate('/anunciante'); setSidebarOpen(false); }}
              className="flex items-center gap-3 w-full p-4 bg-orange-500/10 text-orange-400 border border-orange-500/20 hover:bg-orange-500 hover:text-white rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all mt-2"
            >
              <Megaphone size={18}/> Gerenciar Meus Ads
            </button>
          )}
          
          <button 
            onClick={() => { navigate('/dashboard/perfil'); setSidebarOpen(false); }}
            className="flex items-center gap-3 w-full p-4 text-slate-400 hover:bg-slate-800 rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all"
          >
            <UserCircle size={18}/> Meu Perfil
          </button>

          {!isSubscriber && !isAdmin && (
             <div className="px-4 py-6">
                <button 
                  onClick={() => setCheckoutOpen(true)}
                  className="w-full py-3 bg-slate-800 text-slate-400 rounded-xl text-[9px] font-black uppercase tracking-tighter hover:bg-emerald-600 hover:text-white transition-all border border-slate-700"
                >
                  🚀 Quero Anunciar no Portal
                </button>
             </div>
          )}

          <div className="pt-4">
            <button className="flex items-center gap-3 w-full p-4 text-slate-500 hover:bg-slate-800 rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all">
              <MessageSquare size={18}/> Suporte Técnico
            </button>
          </div>
        </nav>

        <button 
          onClick={handleLogout} 
          className="p-8 text-slate-500 flex items-center gap-2 hover:text-white font-black uppercase text-[11px] tracking-widest border-t border-slate-800 transition-colors"
        >
          <LogOut size={18} /> Sair do Sistema
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-4 lg:p-10 overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 border-b border-slate-200 pb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-[9px] font-black uppercase">
                 {userRole}
               </span>
               {isSubscriber && (
                 <span className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full text-[9px] font-black uppercase">
                   Anunciante Ativo
                 </span>
               )}
               <div className="flex text-amber-400"><Bell size={14} /></div>
            </div>
            <h1 className="text-3xl lg:text-4xl font-black text-slate-900 uppercase italic leading-none">
              Olá, {user.company_name || user.name}
            </h1>
            <p className="text-slate-400 text-xs font-bold uppercase mt-2 tracking-tight">
              Seja bem-vindo ao seu centro de comando logístico.
            </p>
          </div>

          {userRole === 'company' && (
            <button 
              onClick={() => navigate('/novo-frete')} 
              className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 hover:bg-orange-500 shadow-2xl shadow-slate-200 transition-all active:scale-95 group"
            >
              <PlusCircle size={20} className="group-hover:rotate-90 transition-transform" /> 
              LANÇAR NOVA CARGA
            </button>
          )}
        </header>

        <section className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          {userRole === 'driver' ? (
            <DriverView forceTab={activeTab} />
          ) : (
            <CompanyView />
          )}
        </section>
      </main>

      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {isCheckoutOpen && (
        <PlanCheckout 
          onClose={() => setCheckoutOpen(false)} 
          onRefresh={() => window.location.reload()} // Recarrega para aplicar o novo is_subscriber
        />
      )}
    </div>
  );
}