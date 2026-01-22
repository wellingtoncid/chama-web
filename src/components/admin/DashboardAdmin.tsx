import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../../api/api';
import { 
  BarChart3, Zap, DollarSign, Users, Truck, 
  MousePointer2, TrendingUp, Megaphone, Wallet
} from 'lucide-react';

// Interfaces atualizadas conforme o novo backend
interface DashboardStats {
  total_pending: number;
  revenue: string;
  pending_revenue: string;
  total_users: number;
  drivers: number;
  companies: number;
  advertisers: number; // Alterado de partners para advertisers
  active_freights: number;
  featured_freights: number;
  total_interactions: number;
  conversion_rate: number;
}

interface PendingApproval {
  id: number;
  company_name: string;
  origin: string;
  destination: string;
  created_at: string;
}

interface Activity {
  user: string;
  action: string;
  time: string;
  type: string;
}

interface DashboardData {
  stats: DashboardStats;
  pending_approvals: PendingApproval[];
  recent_activities: Activity[]; 
}

export default function DashboardAdmin() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadDashboard = useCallback(async () => {
    try {
      setError(false);
      const response = await api.get('/admin-dashboard-data');
      const result = response.data;
      
      if (result && result.stats) {
        setData(result);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error("Erro ao carregar Dashboard:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleApprove = async (id: number) => {
    try {
      const res = await api.post('/approve-freight', { id, status: 'OPEN', approveFeatured: true }); 
      if (res.data.success) loadDashboard();
    } catch (err) { console.error("Erro ao aprovar:", err); }
  };

  const handleReject = async (id: number) => {
    if (!confirm("Deseja realmente recusar este frete?")) return;
    try {
      const res = await api.post('/reject-freight', { id, status: 'CLOSED' });
      if (res.data.success) loadDashboard();
    } catch (err) { console.error("Erro ao recusar:", err); }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-black italic text-slate-400 uppercase text-[10px] tracking-widest animate-pulse">
          Sincronizando BI e Operações...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-10 bg-white border-2 border-dashed border-red-200 rounded-[2.5rem] text-center my-10">
        <h2 className="text-red-600 font-black uppercase italic tracking-tighter text-xl">Erro na Conexão</h2>
        <button onClick={() => loadDashboard()} className="mt-6 px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase hover:bg-orange-500 transition-all shadow-lg">
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
      
      {/* KPI CARDS - FOCO FINANCEIRO E CRESCIMENTO */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Receita Confirmada" 
          value={`R$ ${data.stats.revenue}`} 
          sub={`Pendente: R$ ${data.stats.pending_revenue}`}
          icon={Wallet} color="bg-emerald-500" 
        />
        <KPICard 
          title="Taxa de Conversão" 
          value={`${data.stats.conversion_rate}%`} 
          sub="Efetividade de Cliques"
          icon={TrendingUp} color="bg-blue-600" 
        />
        <KPICard 
          title="Base de Usuários" 
          value={data.stats.total_users.toString()} 
          sub={`${data.stats.drivers} Mot. | ${data.stats.companies} Emp.`}
          icon={Users} color="bg-indigo-600" 
        />
        <KPICard 
          title="Fluxo de Cargas" 
          value={(data.stats.active_freights + data.stats.total_pending).toString()} 
          sub={`${data.stats.active_freights} No Ar | ${data.stats.total_pending} Espera`}
          icon={Truck} color="bg-orange-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* GRÁFICOS E SAÚDE */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="flex items-center gap-2 font-black uppercase italic text-xs mb-10 text-slate-800 tracking-widest">
              <BarChart3 size={18} className="text-blue-500"/> Performance do Ecossistema
            </h3>
            <div className="grid grid-cols-3 gap-6 mb-12 text-center">
              <StatItem label="Motoristas" count={data.stats.drivers} color="text-blue-600" />
              <StatItem label="Empresas" count={data.stats.companies} color="text-emerald-600" />
              <StatItem label="Anunciantes" count={data.stats.advertisers} color="text-orange-600" />
            </div>
            <div className="space-y-8 pt-8 border-t border-slate-50">
               <ProgressBar label="Interações Totais (Cliques/Views)" value={data.stats.total_interactions} max={10000} color="bg-blue-500" />
               <ProgressBar label="Penetração de Fretes VIP" value={data.stats.featured_freights} max={data.stats.active_freights || 1} color="bg-indigo-500" />
            </div>
          </div>

          {/* ATIVIDADES RECENTES - INCLUINDO PAGAMENTOS */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="flex items-center gap-2 font-black uppercase italic text-xs mb-8 text-slate-800 tracking-widest">
              <Zap size={18} className="text-orange-500"/> Feed de Eventos em Tempo Real
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.recent_activities.length > 0 ? data.recent_activities.map((act, idx) => (
                <ActivityItem key={idx} {...act} />
              )) : (
                <p className="text-slate-400 text-xs italic p-4">Aguardando novos eventos...</p>
              )}
            </div>
          </div>
        </div>

        {/* FILA DE VALIDAÇÃO OPERACIONAL */}
        <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl text-white">
          <div className="flex justify-between items-center mb-8">
            <h3 className="flex items-center gap-2 font-black uppercase italic text-xs text-orange-400 tracking-widest">
              <Megaphone size={18} className="animate-pulse"/> Aprovações
            </h3>
            <span className="bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-lg font-black">{data.pending_approvals.length}</span>
          </div>
          
          <div className="space-y-4">
            {data.pending_approvals.length > 0 ? data.pending_approvals.map((p) => (
              <div key={p.id} className="bg-white/5 border border-white/10 p-6 rounded-3xl group hover:bg-white/10 transition-all">
                <div className="flex justify-between items-start mb-3">
                  <p className="text-[10px] font-black uppercase text-orange-400 truncate max-w-[120px]">{p.company_name}</p>
                  <span className="text-[9px] text-slate-500 font-bold italic whitespace-nowrap">
                    {new Date(p.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div className="mb-4">
                  <p className="text-xs font-black uppercase italic text-slate-200 truncate">{p.origin}</p>
                  <div className="h-3 border-l-2 border-dotted border-white/20 ml-1.5 my-1"></div>
                  <p className="text-xs font-black uppercase italic text-slate-200 truncate">{p.destination}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleApprove(p.id)} className="flex-1 bg-white text-slate-900 hover:bg-orange-500 hover:text-white py-2.5 rounded-xl text-[9px] font-black uppercase transition-all">
                    Aprovar
                  </button>
                  <button onClick={() => handleReject(p.id)} className="px-3 bg-transparent border border-white/10 hover:border-red-500 hover:text-red-500 text-slate-400 py-2.5 rounded-xl text-[9px] font-black uppercase transition-all">
                    X
                  </button>
                </div>
              </div>
            )) : (
              <div className="py-20 text-center opacity-20">
                <p className="text-[10px] font-black uppercase italic">Operação Limpa</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// MANTENDO SUB-COMPONENTES AUXILIARES COM PEQUENAS MELHORIAS VISUAIS
function KPICard({ title, value, sub, icon: Icon, color }: any) {
  return (
    <div className="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-sm relative group">
      <div className={`${color} w-10 h-10 rounded-2xl flex items-center justify-center text-white mb-5 shadow-lg`}>
        <Icon size={20} />
      </div>
      <p className="text-[9px] font-black text-slate-400 uppercase mb-1 tracking-widest">{title}</p>
      <h2 className="text-2xl font-black italic text-slate-900 uppercase tracking-tighter">{value}</h2>
      <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase italic">{sub}</p>
    </div>
  );
}

function StatItem({ label, count, color }: any) {
  return (
    <div>
      <p className={`text-3xl font-black italic ${color} leading-none mb-2 tracking-tighter`}>{count || 0}</p>
      <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest leading-tight">{label}</p>
    </div>
  );
}

function ProgressBar({ label, value, max, color }: any) {
  const percent = max > 0 ? Math.min(Math.round((value / max) * 100), 100) : 0;
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-end">
        <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest italic">{label}</span>
        <span className="text-[10px] font-black italic text-slate-900">{value}</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`${color} h-full rounded-full transition-all duration-1000 ease-out`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function ActivityItem({ user, action, time, type }: Activity) {
  const formattedTime = new Date(time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const getBadgeColor = () => {
    switch(type) {
      case 'PAYMENT': return 'bg-emerald-500';
      case 'FREIGHT': return 'bg-orange-500';
      case 'REQUEST': return 'bg-blue-500';
      default: return 'bg-slate-400';
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-all border border-transparent hover:border-slate-100">
      <div className={`w-1.5 h-8 rounded-full ${getBadgeColor()}`} />
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-black text-slate-800 uppercase leading-none truncate">{user}</p>
        <p className="text-[10px] text-slate-500 font-medium mt-1 truncate">{action}</p>
      </div>
      <span className="text-[9px] font-bold text-slate-300 italic whitespace-nowrap">{formattedTime}</span>
    </div>
  );
}