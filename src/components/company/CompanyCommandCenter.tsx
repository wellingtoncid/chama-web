import React, { useEffect, useState } from 'react';
import { Package, ShieldAlert, ArrowRight, Loader2, MessageCircle, Eye, Zap, TrendingUp } from 'lucide-react';
import { api } from '../../api/api';
import { useNavigate } from 'react-router-dom';

interface Metrics {
  freightsCount: number;
  interestsCount: number;
  visits: number;
  recentActivity: any[];
}

interface CompanyCommandCenterProps {
  user: any;
  refreshUser: () => Promise<void>;
}

export default function CompanyCommandCenter({ user, refreshUser }: CompanyCommandCenterProps) {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<Metrics>({ 
    freightsCount: 0, 
    interestsCount: 0, 
    visits: 0,
    recentActivity: [] 
  });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const res = await api.get('/metrics/dashboard-summary');
        
        if (res.data?.success) {
          const { freights, whatsapp, listings, activity } = res.data.data;

          setMetrics({
            freightsCount: (freights?.active_count || 0) + (listings?.active_count || 0),
            interestsCount: (freights?.total_clicks || 0) + (whatsapp?.total_clicks || 0) + (listings?.total_clicks || 0),
            visits: (freights?.total_views || 0) + (listings?.total_views || 0),
            recentActivity: activity?.recent_logs || []
          });
        }
      } catch (err) {
        console.error("Erro ao buscar dados do dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [refreshUser]);

  const handleAction = () => {
    if (!user.company_name || !user.document || Number(user.is_verified) !== 1) {
      setShowModal(true);
    } else {
      navigate('/dashboard/logistica');
    }
  };

  if (loading) return (
    <div className="h-64 flex flex-col items-center justify-center text-orange-500">
      <Loader2 className="animate-spin mb-2" />
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sincronizando Operações...</span>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase text-orange-500 tracking-[0.2em] mb-1">Status do Painel</p>
          <h1 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter">
            Console de <span className="text-orange-500">Operações</span>
          </h1>
        </div>
        {/* Venda de Plano no Header */}
        <div className="bg-slate-100 px-4 py-2 rounded-full flex items-center gap-3 border border-slate-200">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-bold uppercase text-slate-600">Plano Gratuito Ativo</span>
          <button className="text-[10px] font-black uppercase text-orange-600 hover:underline">Fazer Upgrade</button>
        </div>
      </header>

      {/* MÉTRICAS PRINCIPAIS COM INDICADORES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard 
          icon={<Eye size={20} />} 
          label="Visualizações Totais" 
          value={metrics.visits} 
          color="blue"
          subLabel="Alcance da marca"
        />
        <MetricCard 
          icon={<Package size={20} />} 
          label="Cargas Publicadas" 
          value={metrics.freightsCount} 
          color="orange"
          subLabel="Ativas agora"
        />
        <MetricCard 
          icon={<MessageCircle size={20} />} 
          label="Interesses Gerados" 
          value={metrics.interestsCount} 
          color="slate"
          subLabel="Cliques no WhatsApp"
          badge={metrics.interestsCount > 0 ? "Leads Ativos" : null}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* COLUNA ESQUERDA: AÇÕES E UPSELL */}
        <div className="lg:col-span-2 space-y-6">
          {/* GATILHO DE VENDA: URGÊNCIA */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
            <Zap className="absolute right-[-10px] top-[-10px] text-white/10 group-hover:text-orange-500/20 transition-colors" size={180} />
            <div className="relative z-10">
              <h3 className="text-2xl font-black uppercase italic italic">Turbinar Visibilidade</h3>
              <p className="text-slate-400 text-sm mt-2 max-w-md font-medium">
                Cargas com o selo <span className="text-orange-500 font-bold">URGÊNCIA</span> recebem até 5x mais contatos de motoristas qualificados.
              </p>
              <button className="mt-6 bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-black uppercase text-xs tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-orange-500/20">
                Destacar Cargas Agora <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* GERENCIAMENTO SIMPLES */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-black text-slate-900 uppercase italic text-sm">Painel Logístico</h3>
              <p className="text-slate-400 text-xs font-medium">Acesse o controle detalhado de fretes.</p>
            </div>
            <button 
              onClick={handleAction}
              className="bg-slate-100 hover:bg-slate-200 text-slate-900 px-6 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all"
            >
              Gerenciar <ArrowRight size={16} className="inline ml-1" />
            </button>
          </div>
        </div>

        {/* COLUNA DIREITA: FEED DE ATIVIDADE (A plataforma está viva!) */}
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm h-full">
          <div className="flex items-center gap-2 mb-6 text-slate-900">
            <TrendingUp size={18} />
            <h3 className="font-black uppercase italic text-sm">Atividade Recente</h3>
          </div>
          
          <div className="space-y-6">
            {metrics.recentActivity.length > 0 ? (
              metrics.recentActivity.map((log: any, idx: number) => (
                <div key={idx} className="flex gap-4 items-start">
                  <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${log.event_type === 'CLICK' ? 'bg-orange-500' : 'bg-blue-500'}`} />
                  <div>
                    <p className="text-xs font-bold text-slate-800 leading-tight">
                      {log.event_type === 'CLICK' ? 'Novo interesse em' : 'Nova visualização em'} {log.target_name || 'um frete'}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium mt-1">
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic">Nenhuma atividade recente registrada.</p>
            )}
          </div>
        </div>
      </div>

      {/* QUICK PROFILE MODAL (Mantido igual) */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl relative">
            <ShieldAlert className="text-orange-500 mb-6" size={48} />
            <h2 className="text-2xl font-black text-slate-900 uppercase italic">Perfil Requerido</h2>
            <p className="text-slate-500 mt-4 text-sm font-medium">
              {!user.company_name ? "Complete seu cadastro para publicar." : "Sua conta aguarda aprovação do administrador."}
            </p>
            <div className="mt-8 flex flex-col gap-3">
              <button onClick={() => navigate('/dashboard/profile')} className="bg-orange-500 text-white py-4 rounded-xl font-black uppercase text-xs">Ir para Perfil</button>
              <button onClick={() => setShowModal(false)} className="text-slate-400 font-black uppercase text-[10px] mt-2">Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ icon, label, value, color, subLabel, badge }: any) {
  const bg = color === 'orange' ? 'bg-orange-500' : color === 'blue' ? 'bg-blue-600' : 'bg-slate-900';
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
      {badge && (
        <div className="absolute top-4 right-4 bg-green-100 text-green-700 text-[8px] font-black uppercase px-2 py-1 rounded-md">
          {badge}
        </div>
      )}
      <div className={`${bg} w-10 h-10 rounded-xl flex items-center justify-center mb-4 text-white shadow-lg`}>
        {icon}
      </div>
      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 italic">{label}</p>
      <h3 className="text-4xl font-black text-slate-900 italic tracking-tighter">{value}</h3>
      <p className="text-[10px] font-medium text-slate-400 mt-2">{subLabel}</p>
    </div>
  );
}