import { useState, useEffect, useMemo } from 'react';
import { api } from '../../api/api';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, Search, Loader2, Package, 
  Eye, MousePointer, List, LayoutGrid, Trash2, Edit, Star
} from 'lucide-react';
import { AdImage } from '../AdImage';
import Swal from 'sweetalert2';
import { PageShell, StatsGrid, StatCard } from '@/components/admin';

// --- Constantes e Helpers ---
const CATEGORIES = [
  { value: 'all', label: 'Todas' },
  { value: 'pecas', label: 'Peças' },
  { value: 'caminhoes', label: 'Caminhões' },
  { value: 'utilitarios', label: 'Utilitários' },
  { value: 'acessorios', label: 'Acessórios' },
  { value: 'implementos', label: 'Implementos' },
  { value: 'outros', label: 'Outros' },
];

const STATUS_MAP: Record<string, { label: string, color: string }> = {
  active: { label: 'Ativo', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  inactive: { label: 'Inativo', color: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400' },
  pending: { label: 'Pendente', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  expired: { label: 'Expirado', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  deleted: { label: 'Excluído', color: 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400' },
  sold: { label: 'Vendido', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  paused: { label: 'Pausado', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
};

const DATE_PRESETS = [
  { value: 'all', label: 'Qualquer data' },
  { value: 'today', label: 'Hoje' },
  { value: '7d', label: 'Últimos 7 dias' },
  { value: '30d', label: 'Últimos 30 dias' },
  { value: 'this_month', label: 'Este mês' },
  { value: 'custom', label: 'Personalizado' },
];

const formatDateISO = (d: Date) => d.toISOString().split('T')[0];
const getToday = () => new Date();
const getDaysAgo = (n: number) => { const d = new Date(); d.setDate(d.getDate() - n); return d; };

const resolveDateRange = (preset: string) => {
  const now = getToday();
  switch (preset) {
    case 'today': return { from: formatDateISO(now), to: formatDateISO(now) };
    case '7d': return { from: formatDateISO(getDaysAgo(7)), to: formatDateISO(now) };
    case '30d': return { from: formatDateISO(getDaysAgo(30)), to: formatDateISO(now) };
    case 'this_month': {
      const first = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from: formatDateISO(first), to: formatDateISO(now) };
    }
    default: return { from: '', to: '' };
  }
};

const formatNumber = (v: number) => v >= 1000 ? `${(v/1000).toFixed(1)}K` : v.toString();
const formatBRL = (v: string) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(v || '0'));

export default function MarketplaceManagerAdmin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [filter, setFilter] = useState({ status: 'all', category: 'all', search: '', is_affiliate: 'all', date_from: '', date_to: '' });
  const [datePreset, setDatePreset] = useState('all');
  const [showCustomDates, setShowCustomDates] = useState(false);

  const applyDatePreset = (preset: string) => {
    setDatePreset(preset);
    if (preset === 'custom') {
      setShowCustomDates(true);
      return;
    }
    setShowCustomDates(false);
    const { from, to } = resolveDateRange(preset);
    setFilter(prev => ({ ...prev, date_from: from, date_to: to }));
  };

  useEffect(() => { loadListings(); }, [filter]);

  const loadListings = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/marketplace', { 
        params: { ...filter, limit: 100 } 
      });
      if (data?.success) setListings(data.data || []);
    } catch (e) {
      console.error("Erro ao carregar:", e);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => ({
    total: listings.length,
    affiliates: listings.filter(l => l.is_affiliate === 1).length,
    views: listings.reduce((s, l) => s + (l.views_count || 0), 0),
    clicks: listings.reduce((s, l) => s + (l.clicks_count || 0), 0),
  }), [listings]);

  const handleAction = async (id: number, action: 'delete' | 'view' | 'edit', e: React.MouseEvent, url?: string, slug?: string) => {
    e.stopPropagation();
    if (action === 'view') return window.open(url || `/anuncio/${slug}`, '_blank');
    if (action === 'edit') return navigate(`/editar-anuncio/${id}`);
    
    const result = await Swal.fire({
      title: 'Excluir anúncio?',
      text: "Esta ação não pode ser desfeita.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Sim, excluir!'
    });

    if (result.isConfirmed) {
      try {
        await api.post('/admin/marketplace', { id, action: 'delete' });
        loadListings();
        Swal.fire('Excluído!', '', 'success');
      } catch {
        Swal.fire('Erro', 'Falha ao excluir.', 'error');
      }
    }
  };

  return (
    <PageShell
      title="Gestão de Marketplace"
      description="Gerencie anúncios e afiliados"
      actions={
        <div className="flex items-center gap-3">
          <div className="flex bg-white p-1 rounded-xl border border-slate-200">
            {[ {m: 'table', i: List}, {m: 'cards', i: LayoutGrid} ].map(v => (
              <button key={v.m} onClick={() => setViewMode(v.m as 'table' | 'cards')} className={`p-2.5 rounded-lg ${viewMode === v.m ? 'bg-purple-600 text-white' : 'text-slate-400'}`}>
                <v.i size={16} />
              </button>
            ))}
          </div>
          <button onClick={() => navigate('/novo-anuncio')} className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase hover:bg-purple-700 transition-colors">
            <Package size={16} /> Novo Anúncio
          </button>
        </div>
      }
    >
      {/* Indicadores Rápidos */}
      <div className="mt-6">
        <StatsGrid>
          <StatCard label="Total" value={stats.total} icon={ShoppingBag} />
          <StatCard label="Afiliados" value={stats.affiliates} variant="yellow" icon={Package} />
          <StatCard label="Views" value={formatNumber(stats.views)} variant="blue" icon={Eye} />
          <StatCard label="Cliques" value={formatNumber(stats.clicks)} variant="green" icon={MousePointer} />
        </StatsGrid>
      </div>

      {/* Barra de Filtros */}
      <div className="flex flex-wrap gap-3 mt-4 items-center">
        <select 
          value={filter.status} 
          onChange={e => setFilter({...filter, status: e.target.value})} 
          className="bg-white px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">Todos os Status</option>
          <option value="active">Ativos</option>
          <option value="pending">Pendentes</option>
          <option value="inactive">Inativos</option>
          <option value="sold">Vendidos</option>
          <option value="paused">Pausados</option>
          <option value="expired">Expirados</option>
          <option value="deleted">Excluídos</option>
        </select>
        
        <select 
          value={filter.category} 
          onChange={e => setFilter({...filter, category: e.target.value})} 
          className="bg-white px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-purple-500"
        >
          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>

        <select 
          value={datePreset} 
          onChange={e => applyDatePreset(e.target.value)} 
          className="bg-white px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-purple-500"
        >
          {DATE_PRESETS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>

        {showCustomDates && (
          <div className="flex items-center gap-2">
            <input 
              type="date" 
              value={filter.date_from}
              onChange={e => setFilter({...filter, date_from: e.target.value})}
              className="bg-white px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-purple-500"
            />
            <span className="text-xs font-bold text-slate-400">até</span>
            <input 
              type="date" 
              value={filter.date_to}
              onChange={e => setFilter({...filter, date_to: e.target.value})}
              className="bg-white px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        )}

        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Buscar anúncio..." value={filter.search} onChange={e => setFilter({...filter, search: e.target.value})} className="w-full pl-11 pr-4 py-2.5 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-purple-500" />
        </div>
      </div>

      {/* Grid ou Tabela */}
      {loading ? (
        <div className="py-20 flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-purple-600" size={40} />
          <p className="text-slate-400 font-bold animate-pulse">CARREGANDO MARKETPLACE...</p>
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
          <ShoppingBag size={48} className="mx-auto text-slate-200 mb-4" />
          <p className="text-slate-400 font-medium">Nenhum anúncio encontrado com esses filtros.</p>
        </div>
      ) : viewMode === 'table' ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-4">Produto</th>
                    <th className="px-5 py-4">Preço</th>
                    <th className="px-5 py-4 text-center">Status</th>
                    <th className="px-5 py-4 text-center">Stats</th>
                    <th className="px-5 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {listings.map(l => (
                    <tr key={l.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                            <AdImage url={l.main_image || l.images?.[0]} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-700 line-clamp-1">{l.title}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{l.category} • #{l.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-bold text-purple-600 text-sm tabular-nums">{formatBRL(l.price)}</td>
                      <td className="px-5 py-4 text-center">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${STATUS_MAP[l.status]?.color || ''}`}>
                          {STATUS_MAP[l.status]?.label || l.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-center gap-4 text-slate-400">
                          <div className="flex items-center gap-1"><Eye size={12} /> <span className="text-xs font-bold tabular-nums">{formatNumber(l.views_count)}</span></div>
                          <div className="flex items-center gap-1"><MousePointer size={12} /> <span className="text-xs font-bold tabular-nums">{formatNumber(l.clicks_count)}</span></div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                         <div className="flex justify-end gap-2">
                            <button onClick={(e) => handleAction(l.id, 'view', e, l.external_url, l.slug)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"><Eye size={16}/></button>
                            <button onClick={(e) => handleAction(l.id, 'edit', e)} className="p-2 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200"><Edit size={16}/></button>
                            <button onClick={(e) => handleAction(l.id, 'delete', e)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"><Trash2 size={16}/></button>
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
               {listings.map(l => (
                 <div key={l.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow group">
                    <div className="h-44 relative overflow-hidden bg-slate-100">
                      <AdImage url={l.main_image || l.images?.[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      {l.is_affiliate === 1 && (
                        <div className="absolute top-3 left-3 bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1">
                          <Star size={12} className="fill-white" /> Afiliado
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${STATUS_MAP[l.status]?.color}`}>
                          {STATUS_MAP[l.status]?.label}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="font-bold text-sm text-slate-900 line-clamp-1">{l.title}</h3>
                        <p className="text-xs text-slate-400">{l.category} • #{l.id}</p>
                      </div>
                      <p className="text-purple-600 font-bold text-lg tabular-nums">{formatBRL(l.price)}</p>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          <span className="flex items-center gap-1"><Eye size={12} /> {formatNumber(l.views_count)}</span>
                          <span className="flex items-center gap-1"><MousePointer size={12} /> {formatNumber(l.clicks_count)}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button onClick={(e) => handleAction(l.id, 'view', e, l.external_url, l.slug)} className="p-2 bg-slate-50 text-slate-500 rounded-lg hover:bg-blue-600 hover:text-white transition-colors flex-1 flex justify-center"><Eye size={16}/></button>
                        <button onClick={(e) => handleAction(l.id, 'edit', e)} className="p-2 bg-slate-50 text-slate-500 rounded-lg hover:bg-purple-600 hover:text-white transition-colors flex-1 flex justify-center"><Edit size={16}/></button>
                        <button onClick={(e) => handleAction(l.id, 'delete', e)} className="p-2 bg-slate-50 text-slate-500 rounded-lg hover:bg-red-600 hover:text-white transition-colors flex-1 flex justify-center"><Trash2 size={16}/></button>
                      </div>
                    </div>
                 </div>
               ))}
             </div>
           )}
    </PageShell>
  );
}