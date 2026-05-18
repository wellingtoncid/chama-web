import { useEffect, useState } from 'react';
import {
  Loader2, ShoppingBag, Truck,
  Megaphone, AlertTriangle, Eye, MessageCircle,
  BarChart3, ChevronRight, Package, Plus,
} from 'lucide-react';
import { api } from '../../api/api';
import { useNavigate } from 'react-router-dom';
import RequestModal from '../../components/modals/RequestModal';
import { UsageMeter } from '../shared/UsageMeter';
import DashboardShell from '../layout/DashboardShell';

interface Module {
  key: string;
  name: string;
  description: string;
  is_active: boolean;
  is_allowed: boolean;
  requires_approval?: boolean;
  approval_status?: 'pending' | 'approved' | 'rejected' | null;
  requested_at?: string | null;
}

interface DashboardData {
  freights: { total: number; active_count: number; total_views: number; total_interests: number };
  marketplace: { active_listings: number; total_interests: number };
  advertising: { active_campaigns: number; total_clicks: number };
  usage: { freights: { used: number; limit: number; remaining: number; plan_name?: string } };
  chart: { day: string; date: string; count: number }[];
  recent_activity: { type: string; message: string; time: string; freight_id?: number }[];
}

function StatCard({ label, value, subtitle, icon }: { label: string; value: string | number; subtitle?: string; icon?: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wide">{label}</p>
        {icon && <span className="text-slate-300 dark:text-slate-600">{icon}</span>}
      </div>
      <p className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white">{value}</p>
      {subtitle && <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{subtitle}</p>}
    </div>
  );
}

function ModuleCard({ title, desc, icon, moduleKey, modules }: {
  title: string; desc: string; icon: React.ReactNode; moduleKey: string; modules: Record<string, Module>;
}) {
  const navigate = useNavigate();
  const module = modules[moduleKey];
  const isAllowed = module?.is_allowed ?? false;
  const isActive = module?.is_active ?? false;
  const requiresApproval = module?.requires_approval ?? false;
  const approvalStatus = module?.approval_status ?? null;

  const cardState = !isAllowed ? 'locked' : isActive ? 'active' : requiresApproval && approvalStatus === 'pending' ? 'pending' : 'inactive';

  return (
    <button
      onClick={() => navigate('/dashboard/planos')}
      className={`p-5 rounded-2xl border-2 flex flex-col justify-between h-44 transition-all relative group text-left ${
        cardState === 'active'
          ? 'bg-white dark:bg-slate-800 border-emerald-200 dark:border-emerald-800'
          : 'bg-white dark:bg-slate-800 border-dashed border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-700'
      }`}
    >
      <div className="flex justify-between items-start">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
          cardState === 'active' ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
        }`}>{icon}</div>
        {cardState === 'active' && (
          <span className="text-[8px] font-black px-2 py-1 rounded-lg uppercase bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400">
            Ativo
          </span>
        )}
        {cardState === 'inactive' && (
          <span className="text-[8px] font-black px-2 py-1 rounded-lg uppercase bg-slate-100 dark:bg-slate-700 text-slate-400">
            Inativo
          </span>
        )}
      </div>
      <div>
        <h4 className="text-sm font-black uppercase text-slate-900 dark:text-white leading-tight">{title}</h4>
        <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 leading-tight mt-1">{desc}</p>
      </div>
    </button>
  );
}

export default function CompanyCommandCenter({ user }: any) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const [modules, setModules] = useState<Record<string, Module>>({});
  const [requestModal, setRequestModal] = useState({ isOpen: false, moduleKey: '', moduleName: '' });

  const userRole = String(user?.role || '').toLowerCase();
  const isCompany = userRole === 'company';

  const hasModule = (key: string) => modules[key]?.is_active === true;

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [dashRes, modulesRes] = await Promise.all([
        api.get('/company/dashboard'),
        api.get('/user/modules'),
      ]);

      if (dashRes.data?.success) setData(dashRes.data.data);

      if (modulesRes.data?.success) {
        const map: Record<string, Module> = {};
        modulesRes.data.data.modules.forEach((m: Module) => { map[m.key] = m; });
        setModules(map);
      }
    } catch (e) {
      console.error('Erro ao carregar dashboard:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="h-96 flex items-center justify-center text-orange-500"><Loader2 className="animate-spin" /></div>;

  const freights = data?.freights;
  const chart = data?.chart ?? [];
  const activity = data?.recent_activity ?? [];
  const maxChart = Math.max(...chart.map((d) => d.count), 1);

  const showAlert = freights && freights.active_count === 0;
  const usageHigh = (data?.usage?.freights?.limit ?? 0) > 0 && ((data?.usage?.freights?.used ?? 0) / (data?.usage?.freights?.limit ?? 1)) >= 0.8;

  return (
    <DashboardShell
      title={user.corporate_name || user.trade_name || 'Painel'}
      description={
        <span>
          Olá, <strong className="text-orange-500">{user.name}</strong>
        </span>
      }
      actions={
        <button
          onClick={() => navigate('/dashboard/logistica')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors text-xs uppercase tracking-wide"
        >
          <Plus size={16} /> Novo Frete
        </button>
      }
    >
      {/* ALERTAS */}
      {usageHigh && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl px-5 py-3 flex items-center gap-3">
          <AlertTriangle size={18} className="text-amber-500 shrink-0" />
          <p className="text-sm text-amber-800 dark:text-amber-300 flex-1 font-medium">
            Você usou <strong>{data?.usage?.freights?.used}</strong> de <strong>{data?.usage?.freights?.limit}</strong> fretes do seu plano.
          </p>
          <button onClick={() => navigate('/dashboard/planos')} className="text-xs font-bold text-amber-700 dark:text-amber-400 underline whitespace-nowrap">Ver planos</button>
        </div>
      )}
      {showAlert && (
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-2xl px-5 py-3 flex items-center gap-3">
          <Package size={18} className="text-blue-500 shrink-0" />
          <p className="text-sm text-blue-800 dark:text-blue-300 flex-1 font-medium">Nenhum frete ativo no momento.</p>
          <button onClick={() => navigate('/dashboard/logistica')} className="text-xs font-bold text-blue-700 dark:text-blue-400 underline whitespace-nowrap">Publicar agora</button>
        </div>
      )}

      {/* MÉTRICAS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Cargas Ativas"
          value={freights?.active_count ?? 0}
          subtitle={`${freights?.total ?? 0} no total`}
          icon={<Truck size={16} />}
        />
        <StatCard
          label="Visualizações"
          value={freights?.total_views ?? 0}
          subtitle="total"
          icon={<Eye size={16} />}
        />
        <StatCard
          label="Interesses"
          value={freights?.total_interests ?? 0}
          subtitle="motoristas"
          icon={<MessageCircle size={16} />}
        />
        {hasModule('marketplace') ? (
          <StatCard
            label="Marketplace"
            value={data?.marketplace?.active_listings ?? 0}
            subtitle={`${data?.marketplace?.total_interests ?? 0} interesses`}
            icon={<ShoppingBag size={16} />}
          />
        ) : hasModule('advertiser') ? (
          <StatCard
            label="Publicidade"
            value={data?.advertising?.active_campaigns ?? 0}
            subtitle={`${data?.advertising?.total_clicks ?? 0} cliques`}
            icon={<Megaphone size={16} />}
          />
        ) : (
          <button
            onClick={() => navigate('/dashboard/planos')}
            className="bg-white dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 p-5 flex flex-col items-center justify-center text-center hover:border-orange-300 dark:hover:border-orange-700 transition-colors cursor-pointer"
          >
            <ShoppingBag size={22} className="text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase leading-tight">Ative o Marketplace<br />ou Publicidade</p>
          </button>
        )}
      </div>

      {/* GRÁFICO */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 lg:p-6">
        <div className="flex items-center gap-2 mb-5">
          <BarChart3 size={16} className="text-slate-400" />
          <h3 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wide">Fretes publicados (últimos 7 dias)</h3>
        </div>
        <div className="flex items-end gap-2 h-24">
          {chart.map((d) => (
            <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[9px] font-bold text-slate-400">{d.count || ''}</span>
              <div
                className="w-full bg-gradient-to-t from-orange-400 to-orange-300 rounded-t transition-all"
                style={{ height: `${(d.count / maxChart) * 100}%`, minHeight: d.count > 0 ? '4px' : '2px' }}
              />
              <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase">{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* LIMITE DO PLANO */}
      <UsageMeter moduleKey="freights" />

      {/* MÓDULOS */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xs font-black uppercase text-slate-600 dark:text-slate-400 tracking-wider">Módulos</h3>
          </div>
          <button
            onClick={() => navigate('/dashboard/planos')}
            className="text-[10px] font-bold text-orange-500 hover:text-orange-600 transition-colors uppercase tracking-wide"
          >
            Gerenciar
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <ModuleCard title="Logística" desc="Publique cargas e encontre motoristas" icon={<Truck size={22} />} moduleKey="freights" modules={modules} />
          <ModuleCard title="Marketplace" desc="Venda de produtos e peças" icon={<ShoppingBag size={22} />} moduleKey="marketplace" modules={modules} />
          <ModuleCard title="Publicidade" desc="Destaque sua empresa e anúncios" icon={<Megaphone size={22} />} moduleKey="advertiser" modules={modules} />
        </div>

        <RequestModal
          isOpen={requestModal.isOpen}
          onClose={() => setRequestModal({ isOpen: false, moduleKey: '', moduleName: '' })}
          moduleName={requestModal.moduleName}
          moduleKey={requestModal.moduleKey}
          onSuccess={loadData}
        />
      </section>

      {/* ATIVIDADES RECENTES */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 lg:p-6">
        <h3 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wide mb-4">Atividades Recentes</h3>
        {activity.length > 0 ? (
          <div className="space-y-1">
            {activity.map((item, i) => (
              <div key={i} className="flex items-start gap-3 py-3 px-3 -mx-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <div className="w-2 h-2 rounded-full bg-orange-300 mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 dark:text-slate-300 truncate font-medium">{item.message}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{item.time}</p>
                </div>
                <button onClick={() => navigate(`/dashboard/logistica`)} className="text-slate-300 hover:text-orange-500 transition-colors shrink-0"><ChevronRight size={16} /></button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-xs font-bold text-slate-300 dark:text-slate-600">Nenhuma atividade recente.</p>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
