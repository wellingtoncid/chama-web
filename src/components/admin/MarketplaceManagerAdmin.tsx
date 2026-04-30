import { useState, useEffect, useMemo } from 'react';
import { api } from '../../api/api';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, Search, Loader2, MapPin, Trash2, Edit, 
  Eye, Package, Star, ExternalLink, MousePointer, 
  LayoutGrid, List
} from 'lucide-react';
import { AdImage } from '../AdImage';
import Swal from 'sweetalert2';
import { PageShell } from '@/components/admin';

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
};

const formatNumber = (v: number) => v >= 1000 ? `${(v/1000).toFixed(1)}K` : v.toString();
const formatBRL = (v: string) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(v || '0'));

export default function MarketplaceManagerAdmin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [filter, setFilter] = useState({ status: 'all', category: 'all', search: '', is_affiliate: 'all' });

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

  const handleAction = async (id: number, action: 'delete' | 'view' | 'edit', e: React.MouseEvent, url?: string) => {
    e.stopPropagation();
    if (action === 'view') return window.open(url || `/anuncio/${id}`, '_blank');
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
          <div className="flex bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            {[ {m: 'table', i: List}, {m: 'cards', i: LayoutGrid} ].map(v => (
              <button key={v.m} onClick={() => setViewMode(v.m as any)} className={`p-2 rounded-lg ${viewMode === v.m ? 'bg-purple-600 text-white' : 'text-slate-400'}`}>
                <v.i size={18} />
              </button>
            ))}
          </div>
          <button onClick={() => navigate('/novo-anuncio')} className="flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase hover:bg-purple-700 transition-all shadow-lg shadow-purple-500/20">
            <Package size={18} /> Novo Anúncio
          </button>
        </div>
      }
    >
      {/* Indicadores Rápidos */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', val: stats.total, icon: ShoppingBag, color: 'text-purple-600', bg: 'bg-purple-100' },
          { label: 'Afiliados', val: stats.affiliates, icon: Star, color: 'text-amber-600', bg: 'bg-amber-100' },
          { label: 'Views', val: formatNumber(stats.views), icon: Eye, color: 'text-blue-600', bg: 'bg-blue-100' },
          { label: 'Cliques', val: formatNumber(stats.clicks), icon: MousePointer, color: 'text-emerald-600', bg: 'bg-emerald-100' },
        ].map((s, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-3">
            <div className={`${s.bg} dark:bg-opacity-10 p-2 rounded-xl`}><s.icon size={20} className={s.color} /></div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 leading-none mb-1">{s.label}</p>
              <p className="text-xl font-black text-slate-800 dark:text-white leading-none">{s.val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Barra de Filtros */}
      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <div className="flex bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
          {['all', 'active', 'pending'].map(s => (
            <button key={s} onClick={() => setFilter({...filter, status: s})} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase ${filter.status === s ? 'bg-purple-600 text-white' : 'text-slate-500'}`}>
              {s === 'all' ? 'Todos' : s === 'active' ? 'Ativos' : 'Pendentes'}
            </button>
          ))}
        </div>
        
        <select value={filter.category} onChange={e => setFilter({...filter, category: e.target.value})} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs font-bold uppercase outline-none">
          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>

        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Buscar anúncio..." value={filter.search} onChange={e => setFilter({...filter, search: e.target.value})} className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500" />
        </div>
      </div>

      {/* Grid ou Tabela */}
      {loading ? (
        <div className="py-20 flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-purple-600" size={40} />
          <p className="text-slate-400 font-bold animate-pulse">CARREGANDO MARKETPLACE...</p>
        </div>
      ) : (
        <div className={viewMode === 'cards' ? "grid grid-cols-1 md:grid-cols-4 gap-6" : ""}>
          {listings.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
              <ShoppingBag size={48} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-400 font-medium">Nenhum anúncio encontrado com esses filtros.</p>
            </div>
          ) : viewMode === 'table' ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-900/50 text-[10px] uppercase font-black text-slate-400 border-b border-slate-100 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-4">Produto</th>
                    <th className="px-6 py-4">Preço</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-center">Stats</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                  {listings.map(l => (
                    <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 overflow-hidden flex-shrink-0">
                            <AdImage url={l.main_image || l.images?.[0]} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-700 dark:text-white line-clamp-1">{l.title}</p>
                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{l.category} • ID: #{l.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-black text-purple-600 dark:text-purple-400 text-sm">{formatBRL(l.price)}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${STATUS_MAP[l.status]?.color || ''}`}>
                          {STATUS_MAP[l.status]?.label || l.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-4 text-slate-400">
                          <div className="flex items-center gap-1"><Eye size={12} /> <span className="text-xs font-bold">{formatNumber(l.views_count)}</span></div>
                          <div className="flex items-center gap-1"><MousePointer size={12} /> <span className="text-xs font-bold">{formatNumber(l.clicks_count)}</span></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                         <div className="flex justify-end gap-2">
                            <button onClick={(e) => handleAction(l.id, 'view', e, l.external_url)} className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg"><Eye size={16}/></button>
                            <button onClick={(e) => handleAction(l.id, 'edit', e)} className="p-2 bg-slate-100 dark:bg-slate-700 text-slate-500 rounded-lg"><Edit size={16}/></button>
                            <button onClick={(e) => handleAction(l.id, 'delete', e)} className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg"><Trash2 size={16}/></button>
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               {listings.map(l => (
                 <div key={l.id} className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-xl transition-all group">
                    <div className="h-48 relative overflow-hidden">
                      <AdImage url={l.main_image || l.images?.[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      {l.is_affiliate === 1 && (
                        <div className="absolute top-3 left-3 bg-amber-500 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-lg flex items-center gap-1 uppercase">
                          <Star size={10} className="fill-white" /> Afiliado
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <p className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase mb-2 ${STATUS_MAP[l.status]?.color}`}>
                        {STATUS_MAP[l.status]?.label}
                      </p>
                      <h3 className="font-bold text-slate-800 dark:text-white text-sm line-clamp-1 mb-1">{l.title}</h3>
                      <p className="text-purple-600 dark:text-purple-400 font-black text-lg mb-4">{formatBRL(l.price)}</p>
                      <div className="flex gap-2">
                        <button onClick={(e) => handleAction(l.id, 'view', e, l.external_url)} className="flex-1 bg-slate-100 dark:bg-slate-700 p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-purple-600 hover:text-white transition-all"><Eye size={18} className="mx-auto"/></button>
                        <button onClick={(e) => handleAction(l.id, 'edit', e)} className="flex-1 bg-slate-100 dark:bg-slate-700 p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-purple-600 hover:text-white transition-all"><Edit size={18} className="mx-auto"/></button>
                        <button onClick={(e) => handleAction(l.id, 'delete', e)} className="flex-1 bg-red-50 dark:bg-red-900/20 p-2 rounded-xl text-red-600 hover:bg-red-600 hover:text-white transition-all"><Trash2 size={18} className="mx-auto"/></button>
                      </div>
                    </div>
                 </div>
               ))}
            </div>
          )}
        </div>
      )}
    </PageShell>
  );
}