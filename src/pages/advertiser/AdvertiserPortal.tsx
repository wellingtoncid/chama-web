import React, { useState, useEffect } from 'react';
import { 
  Megaphone, BarChart3, CreditCard, PlusCircle, 
  LayoutDashboard, Eye, MousePointer2, Loader2 
} from 'lucide-react';
import { api } from '../../api/api';

// Importando seus componentes originais
import AdvertiserAdsManager from '../../components/advertiser/AdvertiserAdsManager';
import AdvertiserReports from '../../components/advertiser/AdvertiserReports';

// Tornamos o user opcional (?) para matar o erro do AppRoutes
export default function AdvertiserPortal({ user: propUser }: { user?: any }) {
  const [activeTab, setActiveTab] = useState<'home' | 'ads' | 'reports' | 'plan'>('home');
  const [loading, setLoading] = useState(true);
  const [realStats, setRealStats] = useState({ views: 0, clicks: 0, ctr: '0%' });

  // Fallback: Se não veio por prop, busca no localStorage
  const user = propUser || JSON.parse(localStorage.getItem('@ChamaFrete:user') || '{}');

  useEffect(() => {
    async function fetchAdStats() {
      try {
        setLoading(true);
        // Rota real para buscar performance de banners do usuário
        const res = await api.get('/', { 
          params: { endpoint: 'get-ad-performance', user_id: user.id } 
        });
        
        if (res.data.success) {
          setRealStats({
            views: res.data.total_views || 0,
            clicks: res.data.total_clicks || 0,
            ctr: res.data.ctr || '0%'
          });
        }
      } catch (err) {
        console.error("Erro ao carregar métricas de anúncios");
      } finally {
        setLoading(false);
      }
    }

    if (user?.id) fetchAdStats();
  }, [user?.id]);

  const stats = [
    { label: 'Visualizações', value: realStats.views.toLocaleString(), icon: <Eye className="text-blue-500" /> },
    { label: 'Cliques', value: realStats.clicks.toLocaleString(), icon: <MousePointer2 className="text-emerald-500" /> },
    { label: 'CTR', value: realStats.ctr, icon: <Megaphone className="text-orange-500" /> },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* Header do Módulo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-[1000] text-slate-800 tracking-tighter uppercase italic leading-none">
            {activeTab === 'home' && "Painel de Publicidade"}
            {activeTab === 'ads' && "Meus Banners"}
            {activeTab === 'reports' && "Performance"}
            {activeTab === 'plan' && "Minha Assinatura"}
          </h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">
            ID Anunciante: #{user.id} • {user.company_name || user.name}
          </p>
        </div>
        
        {activeTab === 'ads' && (
          <button className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase italic text-xs flex items-center gap-2 hover:bg-orange-500 transition-all shadow-xl">
            <PlusCircle size={18} /> Novo Anúncio
          </button>
        )}
      </div>

      {/* Navegação Estilo Pílula */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-200/50 rounded-[2rem] w-fit">
        {[
          { id: 'home', label: 'Resumo', icon: <LayoutDashboard size={16}/> },
          { id: 'ads', label: 'Banners', icon: <Megaphone size={16}/> },
          { id: 'reports', label: 'Relatórios', icon: <BarChart3 size={16}/> },
          { id: 'plan', label: 'Plano', icon: <CreditCard size={16}/> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab.id 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Conteúdo Dinâmico */}
      <div className="mt-8">
        {loading && activeTab === 'home' ? (
          <div className="h-48 flex items-center justify-center"><Loader2 className="animate-spin text-orange-500" /></div>
        ) : activeTab === 'home' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((s, i) => (
              <div key={i} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:border-orange-200 transition-all group">
                <div className="p-3 bg-slate-50 w-fit rounded-2xl mb-4 group-hover:bg-orange-50 transition-colors">{s.icon}</div>
                <div className="text-4xl font-[1000] italic tracking-tighter uppercase text-slate-800">{s.value}</div>
                <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'ads' && (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
            <AdvertiserAdsManager user={user.id} />
          </div>
        )}

        {activeTab === 'reports' && <AdvertiserReports userId={user.id} />}

        {activeTab === 'plan' && (
          <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm text-center">
             <CreditCard size={48} className="mx-auto text-slate-200 mb-4" />
             <h3 className="text-xl font-black uppercase italic">Assinatura Ativa</h3>
             <p className="text-slate-400 font-bold italic mt-2">Suas cobranças são processadas via Mercado Pago.</p>
          </div>
        )}
      </div>
    </div>
  );
}