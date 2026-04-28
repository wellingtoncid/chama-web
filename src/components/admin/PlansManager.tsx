import { useState, useEffect, useMemo } from 'react';
import { api } from '@/api/api';
import StatsGrid, { StatCard } from './StatsGrid'; 
import { 
  Plus, Edit3, Trash2, Star, X, Loader2, BadgeDollarSign, 
  CheckCircle2, Zap, Layout, ShieldCheck, Layers, List, LayoutGrid,
  Filter
} from 'lucide-react';
import { AdminLayout } from './index';

const PLAN_TYPES = [
  { id: 'all', label: 'Todos' },
  { id: 'freight_list', label: 'Fretes' },
  { id: 'sidebar', label: 'Marketplace' },
  { id: 'urgent', label: 'Urgente' },
  { id: 'driver_verified', label: 'Motorista' },
  { id: 'total', label: 'Total' },
  { id: 'featured', label: 'Destaque' },
];

export default function PlansManager() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  
  const [planData, setPlanData] = useState<any>({ 
    id: null, name: '', price: '', duration_days: '', type: 'featured', description: '', active: 1 
  });

  const loadPlans = async () => {
    try {
      setLoading(true);
      const res = await api.get('/manage-plans'); 
      const data = res.data.success === false ? [] : (res.data.plans || res.data.data || []);
      setPlans(Array.isArray(data) ? data : []);
    } catch (e) { console.error("Erro:", e); } finally { setLoading(false); }
  };

  useEffect(() => { loadPlans(); }, []);

  const stats = useMemo(() => ({
    total: plans.length,
    active: plans.filter(p => Number(p.active) === 1).length,
    paused: plans.filter(p => Number(p.active) !== 1).length,
    revenue: plans.reduce((acc, p) => acc + (Number(p.active) === 1 ? parseFloat(p.price) || 0 : 0), 0),
  }), [plans]);

  const filteredPlans = useMemo(() => {
    return plans.filter(p => {
      const matchType = typeFilter === 'all' || p.type === typeFilter;
      const matchSearch = !search || p.name?.toLowerCase().includes(search.toLowerCase());
      return matchType && matchSearch;
    });
  }, [plans, typeFilter, search]);

  const handleSavePlan = async () => {
    if(!planData.name || !planData.price) return alert("Preencha Nome e Preço");
    try {
      setSaving(true);
      await api.post('/manage-plans', { ...planData, action: 'save' });
      setShowDrawer(false);
      loadPlans();
    } catch { alert("Erro ao salvar"); } finally { setSaving(false); }
  };
  
  const togglePlanStatus = async (plan: any) => {
    const newStatus = Number(plan.active) === 1 ? 0 : 1;
    if (!confirm(newStatus === 0 ? "Desativar?" : "Reativar?")) return;
    try {
      await api.post('/manage-plans', { ...plan, active: newStatus, action: 'save' });
      loadPlans();
    } catch { alert("Erro"); }
  };

  const getPlanIcon = (type: string, size = 20) => {
    switch(type) {
      case 'sidebar': return <Layout size={size} className="text-amber-500"/>;
      case 'freight_list': return <Layers size={size} className="text-slate-600"/>;
      case 'urgent': return <Zap size={size} className="text-red-500"/>;
      case 'driver_verified': return <ShieldCheck size={size} className="text-blue-500"/>;
      case 'total': return <BadgeDollarSign size={size} className="text-emerald-500"/>;
      default: return <Star size={size} className="text-orange-500"/>;
    }
  };

  const openNew = () => {
    setPlanData({ id: null, name: '', price: '', duration_days: '', type: 'featured', description: '', active: 1 });
    setShowDrawer(true);
  };

  const openEdit = (plan: any) => {
    setPlanData(plan);
    setShowDrawer(true);
  };

  return (
    <AdminLayout
      title="Planos de Assinatura"
      description="Gerencie planos de assinatura do sistema"
      actions={
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors">
          <Plus size={20} /> Novo Plano
        </button>
      }
    >
      {/* STATS GRID */}
      <StatsGrid>
          <StatCard label="Total Planos" value={stats.total} icon={<Layers size={18}/>} />
          <StatCard label="Ativos" value={stats.active} variant="green" icon={<CheckCircle2 size={18}/>} />
          <StatCard label="Pausados" value={stats.paused} variant="red" icon={<Trash2 size={18}/>} />
          <StatCard label="Receita Potencial" value={stats.revenue} prefix="R$ " variant="blue" icon={<BadgeDollarSign size={18}/>} />
        </StatsGrid>

        {/* FILTROS */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-8 mb-6">
          <div className="flex flex-wrap gap-2">
            {PLAN_TYPES.map(t => (
              <button key={t.id} onClick={() => setTypeFilter(t.id)} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${typeFilter === t.id ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input type="text" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl border-none text-sm" />
              <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
              <button onClick={() => setViewMode('table')} className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white dark:bg-slate-700 shadow-md' : 'text-slate-400'}`}><List size={18}/></button>
              <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 shadow-md' : 'text-slate-400'}`}><LayoutGrid size={18}/></button>
            </div>
          </div>
        </div>

        {/* TABELA */}
        {viewMode === 'table' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase text-slate-500">Tipo</th>
                  <th className="px-4 py-4 text-left text-xs font-bold uppercase text-slate-500">Plano</th>
                  <th className="px-4 py-4 text-left text-xs font-bold uppercase text-slate-500">Valor</th>
                  <th className="px-4 py-4 text-left text-xs font-bold uppercase text-slate-500">Ciclo</th>
                  <th className="px-4 py-4 text-left text-xs font-bold uppercase text-slate-500">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-bold uppercase text-slate-500">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filteredPlans.map((plan) => (
                  <tr key={plan.id} className={`hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors ${Number(plan.active) !== 1 && 'opacity-60'}`}>
                    <td className="px-6 py-4">{getPlanIcon(plan.type)}</td>
                    <td className="px-4 py-4">
                      <div className="font-bold text-slate-800 dark:text-white">{plan.name}</div>
                      <div className="text-xs text-slate-400">{plan.type}</div>
                    </td>
                    <td className="px-4 py-4 font-bold text-slate-800 dark:text-white">R$ {plan.price}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{plan.duration_days} dias</td>
                    <td className="px-4 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${Number(plan.active) === 1 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' : 'bg-slate-100 text-slate-500'}`}>
                        {Number(plan.active) === 1 ? 'Ativo' : 'Pausado'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEdit(plan)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all"><Edit3 size={16}/></button>
                        <button onClick={() => togglePlanStatus(plan)} className={`p-2 rounded-lg transition-all ${Number(plan.active) === 1 ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30' : 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30'}`}>
                          {Number(plan.active) === 1 ? <Trash2 size={16}/> : <CheckCircle2 size={16}/>}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredPlans.length === 0 && (
              <div className="p-12 text-center text-slate-400">Nenhum plano encontrado</div>
            )}
          </div>
        )}

        {/* GRID */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPlans.map((plan) => (
              <div key={plan.id} className={`bg-white dark:bg-slate-800 p-6 rounded-2xl border-2 transition-all group relative ${Number(plan.active) === 1 ? 'border-slate-100 dark:border-slate-700 hover:border-blue-300' : 'border-dashed border-slate-200 dark:border-slate-600 opacity-60'}`}>
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => openEdit(plan)} className="p-2 bg-white dark:bg-slate-700 shadow-lg rounded-xl text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition-colors"><Edit3 size={14}/></button>
                  <button onClick={() => togglePlanStatus(plan)} className={`p-2 bg-white dark:bg-slate-700 shadow-lg rounded-xl transition-colors ${Number(plan.active) === 1 ? 'text-red-500 hover:bg-red-600 hover:text-white' : 'text-emerald-500 hover:bg-emerald-600 hover:text-white'}`}>
                    {Number(plan.active) === 1 ? <Trash2 size={14}/> : <CheckCircle2 size={14}/>}
                  </button>
                </div>
                <div className="mb-4">{getPlanIcon(plan.type, 28)}</div>
                <h4 className="font-bold text-slate-800 dark:text-white leading-tight mb-2">{plan.name}</h4>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-2xl font-bold text-slate-900 dark:text-white">R$ {plan.price}</span>
                  <span className="text-xs text-slate-400">/{plan.duration_days}d</span>
                </div>
                <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                  <p className="text-xs text-slate-400 line-clamp-2 mb-3">{plan.description || 'Sem descrição'}</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${Number(plan.active) === 1 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' : 'bg-slate-100 text-slate-500'}`}>
                    {Number(plan.active) === 1 ? 'Ativo' : 'Pausado'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* DRAWER */}
        {showDrawer && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]">
            <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-slate-800 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
              <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-800 z-10">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">{planData.id ? 'Editar Plano' : 'Novo Plano'}</h3>
                <button onClick={() => setShowDrawer(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl"><X size={20}/></button>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Nome do Plano</label>
                  <input value={planData.name} onChange={e => setPlanData({...planData, name: e.target.value})} placeholder="Ex: Starter" className="w-full p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 font-bold outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Preço (R$)</label>
                    <input type="number" value={planData.price} onChange={e => setPlanData({...planData, price: e.target.value})} placeholder="0.00" className="w-full p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 font-bold outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Duração (dias)</label>
                    <input type="number" value={planData.duration_days} onChange={e => setPlanData({...planData, duration_days: e.target.value})} placeholder="30" className="w-full p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 font-bold outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Tipo</label>
                  <select value={planData.type} onChange={e => setPlanData({...planData, type: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 font-bold outline-none cursor-pointer">
                    <option value="freight_list">Lista de Fretes</option>
                    <option value="sidebar">Marketplace</option>
                    <option value="urgent">Urgente</option>
                    <option value="driver_verified">Motorista Verificado</option>
                    <option value="total">Exposição Total</option>
                    <option value="featured">Destaque</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-slate-500 mb-2 block">Descrição</label>
                  <textarea value={planData.description} onChange={e => setPlanData({...planData, description: e.target.value})} rows={4} placeholder="Descrição do plano..." className="w-full p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 font-bold outline-none resize-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <button onClick={handleSavePlan} disabled={saving} className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                  {saving ? <Loader2 className="animate-spin" size={18}/> : 'Salvar Plano'}
                </button>
              </div>
            </div>
            <div className="absolute inset-0" onClick={() => setShowDrawer(false)} />
          </div>
        )}
    </AdminLayout>
  );
}