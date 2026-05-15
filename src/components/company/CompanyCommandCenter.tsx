import { useEffect, useState } from 'react';
import {
  Plus, Loader2, ShoppingBag, Truck,
  FileSearch, Megaphone,
  Star, AlertTriangle, Eye, MessageCircle,
  BarChart3, ChevronRight, Package,
} from 'lucide-react';
import { api } from '../../api/api';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import RequestModal from '../../components/modals/RequestModal';
import { UsageMeter } from '../shared/UsageMeter';

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

function ModuleCard({ title, desc, icon, moduleKey, modules, onActivate, onDeactivate, onRequestAccess }: {
  title: string; desc: string; icon: React.ReactNode; moduleKey: string;
  modules: Record<string, Module>;
  onActivate?: () => void; onDeactivate?: () => void; onRequestAccess?: () => void;
}) {
  const module = modules[moduleKey];
  const isAllowed = module?.is_allowed ?? false;
  const isActive = module?.is_active ?? false;
  const requiresApproval = module?.requires_approval ?? false;
  const approvalStatus = module?.approval_status ?? null;

  const handleClick = () => {
    if (!isAllowed) {
      Swal.fire({ title: '<span class="italic font-black">MÓDULO NÃO DISPONÍVEL</span>', text: 'Este módulo não está disponível no seu plano atual.', icon: 'info', showCancelButton: true, confirmButtonText: 'VER PLANOS', confirmButtonColor: '#f97316', cancelButtonText: 'FECHAR', customClass: { popup: 'rounded-[2rem]', confirmButton: 'rounded-xl font-black uppercase' } }).then((res) => { if (res.isConfirmed) window.location.href = '/dashboard/planos'; });
      return;
    }
    if (isActive) {
      if (onDeactivate) {
        Swal.fire({ title: '<span class="italic font-black">DESATIVAR MÓDULO?</span>', text: `Ao desativar "${title}", você perderá acesso a este recurso.`, icon: 'warning', showCancelButton: true, confirmButtonText: 'DESATIVAR', confirmButtonColor: '#ef4444', cancelButtonText: 'MANTER ATIVO', customClass: { popup: 'rounded-[2rem]', confirmButton: 'rounded-xl font-black uppercase' } }).then((res) => { if (res.isConfirmed) onDeactivate(); });
      }
    } else if (requiresApproval && approvalStatus === 'pending') {
      return;
    } else if (requiresApproval) {
      if (onRequestAccess) onRequestAccess();
    } else {
      if (onActivate) onActivate();
    }
  };

  const cardState = !isAllowed ? 'locked' : isActive ? 'active' : requiresApproval && approvalStatus === 'pending' ? 'pending' : requiresApproval ? 'approval_required' : 'inactive';

  return (
    <div onClick={handleClick} className={`p-5 rounded-2xl border-2 flex flex-col justify-between h-48 transition-all relative group cursor-pointer ${
      cardState === 'locked' ? 'bg-slate-50 border-dashed border-slate-200 opacity-70' : cardState === 'active' ? 'bg-white border-emerald-200 hover:border-emerald-400 hover:shadow-lg' : cardState === 'pending' ? 'bg-amber-50 border-amber-200' : cardState === 'approval_required' ? 'bg-white border-dashed border-amber-300 hover:border-amber-400 hover:bg-amber-50/30' : 'bg-white border-dashed border-slate-200 hover:border-orange-300 hover:bg-orange-50/30'
    }`}>
      <div className="flex justify-between items-start">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
          cardState === 'locked' ? 'bg-slate-100 text-slate-400' : cardState === 'active' ? 'bg-emerald-100 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white' : cardState === 'pending' ? 'bg-amber-100 text-amber-600' : cardState === 'approval_required' ? 'bg-amber-100 text-amber-600 group-hover:bg-amber-500 group-hover:text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-orange-100 group-hover:text-orange-600'
        }`}>{icon}</div>
        {isAllowed && cardState !== 'pending' && (
          <span className={`text-[8px] font-black px-2 py-1 rounded-lg uppercase italic ${isActive ? 'bg-emerald-100 text-emerald-600' : cardState === 'approval_required' ? 'bg-amber-100 text-amber-600' : 'bg-orange-100 text-orange-600'}`}>
            {isActive ? 'Ativo' : cardState === 'approval_required' ? 'Disponível' : 'Inativo'}
          </span>
        )}
      </div>
      <div>
        <h4 className="text-sm font-black uppercase italic text-slate-900 leading-tight">{title}</h4>
        <p className="text-[10px] font-bold text-slate-400 leading-tight mt-1 uppercase italic">{desc}</p>
      </div>
    </div>
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
  const marketplace = data?.marketplace;
  const advertising = data?.advertising;
  const chart = data?.chart ?? [];
  const activity = data?.recent_activity ?? [];
  const hasMarketplace = hasModule('marketplace');
  const hasAdvertising = hasModule('advertiser');
  const maxChart = Math.max(...chart.map((d) => d.count), 1);

  const showAlert = freights && freights.active_count === 0;
  const usageHigh = (data?.usage?.freights?.limit ?? 0) > 0 && ((data?.usage?.freights?.used ?? 0) / (data?.usage?.freights?.limit ?? 1)) >= 0.8;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* HEADER */}
      <div className="px-2">
        <p className="text-sm text-slate-500 mb-1">
          Olá, <span className="text-orange-500 font-semibold">{user.name}</span>
        </p>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
          {user.corporate_name || user.trade_name || 'Painel'}
        </h1>
      </div>

      {/* ALERTAS */}
      {usageHigh && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 flex items-center gap-3">
          <AlertTriangle size={18} className="text-amber-500 shrink-0" />
          <p className="text-sm text-amber-800 flex-1">
            Você usou <strong>{data?.usage?.freights?.used}</strong> de <strong>{data?.usage?.freights?.limit}</strong> fretes do seu plano.
          </p>
          <button onClick={() => navigate('/dashboard/planos')} className="text-xs font-semibold text-amber-700 underline whitespace-nowrap">Ver planos</button>
        </div>
      )}
      {showAlert && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-3 flex items-center gap-3">
          <Package size={18} className="text-blue-500 shrink-0" />
          <p className="text-sm text-blue-800 flex-1">Nenhum frete ativo no momento.</p>
          <button onClick={() => navigate('/dashboard/logistica')} className="text-xs font-semibold text-blue-700 underline whitespace-nowrap">Publicar agora</button>
        </div>
      )}

      {/* MÉTRICAS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-1">
          <p className="text-[10px] font-semibold uppercase text-slate-400 tracking-wide">Cargas Ativas</p>
          <p className="text-2xl font-bold text-slate-900">{freights?.active_count ?? 0}</p>
          <p className="text-[10px] text-slate-400">{freights?.total ?? 0} no total</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-1">
          <p className="text-[10px] font-semibold uppercase text-slate-400 tracking-wide">Visualizações</p>
          <p className="text-2xl font-bold text-slate-900">{freights?.total_views ?? 0}</p>
          <div className="flex items-center gap-1 text-[10px] text-slate-400"><Eye size={12} /> total</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-1">
          <p className="text-[10px] font-semibold uppercase text-slate-400 tracking-wide">Interesses</p>
          <p className="text-2xl font-bold text-slate-900">{freights?.total_interests ?? 0}</p>
          <div className="flex items-center gap-1 text-[10px] text-slate-400"><MessageCircle size={12} /> motoristas</div>
        </div>
        {hasMarketplace ? (
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-1">
            <p className="text-[10px] font-semibold uppercase text-slate-400 tracking-wide">Marketplace</p>
            <p className="text-2xl font-bold text-slate-900">{marketplace?.active_listings ?? 0}</p>
            <p className="text-[10px] text-slate-400">{marketplace?.total_interests ?? 0} interesses</p>
          </div>
        ) : hasAdvertising ? (
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-1">
            <p className="text-[10px] font-semibold uppercase text-slate-400 tracking-wide">Publicidade</p>
            <p className="text-2xl font-bold text-slate-900">{advertising?.active_campaigns ?? 0}</p>
            <p className="text-[10px] text-slate-400">{advertising?.total_clicks ?? 0} cliques</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-dashed border-slate-200 p-5 flex flex-col items-center justify-center text-center">
            <ShoppingBag size={20} className="text-slate-300 mb-1" />
            <p className="text-[9px] font-semibold text-slate-400 uppercase">Ative o Marketplace<br/>ou Publicidade</p>
          </div>
        )}
      </div>

      {/* AÇÕES RÁPIDAS */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => navigate('/dashboard/logistica')} className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors text-sm">
          <Truck size={16} /> Novo Frete
        </button>
        {hasMarketplace && (
          <button onClick={() => navigate('/dashboard/vendas')} className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-slate-700 font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-sm">
            <ShoppingBag size={16} /> Novo Anúncio
          </button>
        )}
        {hasAdvertising && (
          <button onClick={() => navigate('/dashboard/admin/precificacao')} className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-slate-700 font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-sm">
            <Megaphone size={16} /> Campanha
          </button>
        )}
        <button onClick={() => navigate('/dashboard/logistica')} className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-slate-700 font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-sm">
          <Eye size={16} /> Ver Interesses
        </button>
      </div>

      {/* GRÁFICO */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={16} className="text-slate-400" />
          <h3 className="text-xs font-semibold uppercase text-slate-500 tracking-wide">Fretes publicados (últimos 7 dias)</h3>
        </div>
        <div className="flex items-end gap-2 h-20">
          {chart.map((d) => (
            <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[9px] font-bold text-slate-400">{d.count || ''}</span>
              <div
                className="w-full bg-orange-200 rounded-t transition-all"
                style={{ height: `${(d.count / maxChart) * 100}%`, minHeight: d.count > 0 ? '4px' : '2px' }}
              />
              <span className="text-[8px] font-semibold text-slate-400 uppercase">{d.day}</span>
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
            <h2 className="text-base font-bold text-slate-900">Módulos</h2>
            <p className="text-xs text-slate-400">Ative ou desative recursos da sua conta</p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <ModuleCard title="Logística" desc="Publique cargas e encontre motoristas" icon={<Truck size={22} />} moduleKey="freights" modules={modules} />
          <ModuleCard title="Marketplace" desc="Venda de produtos e peças" icon={<ShoppingBag size={22} />} moduleKey="marketplace" modules={modules} onActivate={!modules.marketplace?.is_active ? () => toggleModule('marketplace', true) : undefined} onDeactivate={() => toggleModule('marketplace', false)} />
          <ModuleCard title="Publicidade" desc="Destaque sua empresa e anúncios" icon={<Megaphone size={22} />} moduleKey="advertiser" modules={modules} onActivate={!modules.advertiser?.is_active ? () => toggleModule('advertiser', true) : undefined} onDeactivate={() => toggleModule('advertiser', false)} onRequestAccess={() => setRequestModal({ isOpen: true, moduleKey: 'advertiser', moduleName: 'Publicidade' })} />
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
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-xs font-semibold uppercase text-slate-400 tracking-wide mb-4">Atividades Recentes</h3>
        {activity.length > 0 ? (
          <div className="space-y-3">
            {activity.map((item, i) => (
              <div key={i} className="flex items-start gap-3 py-2 border-b border-slate-50 last:border-0">
                <div className="w-2 h-2 rounded-full bg-orange-200 mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 truncate">{item.message}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{item.time}</p>
                </div>
                <button onClick={() => navigate(`/dashboard/logistica`)} className="text-slate-300 hover:text-orange-500 transition-colors shrink-0"><ChevronRight size={16} /></button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-sm text-slate-300 py-6">Nenhuma atividade recente.</p>
        )}
      </div>
    </div>
  );

  function toggleModule(moduleKey: string, activate: boolean) {
    Swal.fire({
      title: `<span class="text-sm font-black">${activate ? 'ATIVAR' : 'DESATIVAR'} MÓDULO?</span>`,
      text: activate ? 'Tem certeza que deseja ativar este módulo?' : `Tem certeza que deseja desativar este módulo?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: activate ? 'ATIVAR' : 'DESATIVAR',
      confirmButtonColor: activate ? '#22c55e' : '#ef4444',
      cancelButtonText: 'CANCELAR',
      customClass: { popup: 'rounded-2xl', confirmButton: 'rounded-xl font-black text-xs' },
    }).then(async (res) => {
      if (!res.isConfirmed) return;
      try {
        await api.post('/user/modules', { module_key: moduleKey, action: activate ? 'activate' : 'deactivate' });
        setModules((prev) => ({ ...prev, [moduleKey]: { ...prev[moduleKey], is_active: activate } }));
        Swal.fire({ icon: 'success', title: 'Sucesso', text: `Módulo ${activate ? 'ativado' : 'desativado'} com sucesso!`, confirmButtonText: 'OK', customClass: { popup: 'rounded-2xl', confirmButton: 'rounded-xl font-black text-xs' } });
      } catch {
        Swal.fire({ icon: 'error', title: 'Erro', text: 'Não foi possível atualizar o módulo.', confirmButtonText: 'OK', customClass: { popup: 'rounded-2xl', confirmButton: 'rounded-xl font-black text-xs' } });
      }
    });
  }
}
