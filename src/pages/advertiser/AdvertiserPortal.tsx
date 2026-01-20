import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, LayoutDashboard, Megaphone, BarChart3, 
  CreditCard, Menu, X, PlusCircle 
} from 'lucide-react';

// Importaremos os componentes da pasta components/advertiser
import { AdvertiserAdsManager } from '../../components/advertiser/AdvertiserAdsManager';
import { AdvertiserReports } from '../../components/advertiser/AdvertiserReports';

export default function AdvertiserPortal() {
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'ads' | 'reports' | 'plan'>('home');
  
  const user = JSON.parse(localStorage.getItem('@ChamaFrete:user') || '{}');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      
      {/* Sidebar Mobile */}
      <header className="lg:hidden bg-slate-900 text-white p-4 flex justify-between items-center shadow-xl">
         <span className="font-black italic text-orange-500 text-xl tracking-tighter">CHAMA <span className="text-white">ADS</span></span>
         <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 bg-slate-800 rounded-lg">
           {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
         </button>
      </header>

      {/* Sidebar Desktop */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col shadow-2xl transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-8 text-2xl font-black text-orange-500 tracking-tighter italic uppercase border-b border-slate-800">
          CHAMA <span className="text-white font-light">ADS</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-6">
          <button onClick={() => { setActiveTab('home'); setSidebarOpen(false); }} className={`flex items-center gap-3 w-full p-4 rounded-2xl font-bold transition-all ${activeTab === 'home' ? 'bg-orange-500 text-white shadow-lg shadow-orange-900/20' : 'text-slate-400 hover:bg-slate-800'}`}>
            <LayoutDashboard size={20}/> Resumo
          </button>

          <button onClick={() => { setActiveTab('ads'); setSidebarOpen(false); }} className={`flex items-center gap-3 w-full p-4 rounded-2xl font-bold transition-all ${activeTab === 'ads' ? 'bg-orange-500 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}>
            <Megaphone size={20}/> Meus Banners
          </button>

          <button onClick={() => { setActiveTab('reports'); setSidebarOpen(false); }} className={`flex items-center gap-3 w-full p-4 rounded-2xl font-bold transition-all ${activeTab === 'reports' ? 'bg-orange-500 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}>
            <BarChart3 size={20}/> Performance
          </button>

          <button onClick={() => { setActiveTab('plan'); setSidebarOpen(false); }} className={`flex items-center gap-3 w-full p-4 rounded-2xl font-bold transition-all ${activeTab === 'plan' ? 'bg-orange-500 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}>
            <CreditCard size={20}/> Meu Plano
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
            <button onClick={handleLogout} className="flex items-center gap-2 w-full p-4 text-slate-500 hover:text-white font-black uppercase text-xs transition-colors">
                <LogOut size={16} /> Encerrar Sessão
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-10 max-h-screen overflow-y-auto">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase italic leading-none">
                {activeTab === 'home' && "Bem-vindo, " + user.name.split('')[0]}
                {activeTab === 'ads' && "Gestão de Banners"}
                {activeTab === 'reports' && "Dados de Cliques"}
                {activeTab === 'plan' && "Sua Assinatura"}
            </h1>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">Painel de Publicidade Comercial</p>
          </div>
          
          {activeTab === 'ads' && (
            <button className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black uppercase italic text-xs flex items-center gap-2 hover:bg-orange-500 transition-all shadow-xl shadow-slate-200">
                <PlusCircle size={18} /> Novo Anúncio
            </button>
          )}
        </header>

        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {activeTab === 'home' && <div className="grid grid-cols-1 md:grid-cols-3 gap-6"> {/* Cards de resumo em breve */} </div>}
            {activeTab === 'ads' && <AdvertiserAdsManager userId={user.id} />}
            {activeTab === 'reports' && <AdvertiserReports userId={user.id} />}
            {activeTab === 'plan' && <div className="bg-white p-10 rounded-[3rem] shadow-sm">Configurações do Plano</div>}
        </section>
      </main>

      {isSidebarOpen && <div className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />}
    </div>
  );
}