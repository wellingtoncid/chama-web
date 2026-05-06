import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/api';
import {
  Trash2, Loader2, Plus,
  Search, BarChart3,
  Play, Pause, RotateCcw, AlertTriangle
} from 'lucide-react';
import { StatsGrid, StatCard, PageShell } from '@/components/admin';

export default function AdsManager() {
  const navigate = useNavigate();
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Cálculos de Métricas
  const allAds = ads;
  const activeAds = allAds.filter(a => a.computed_status === 'active' || a.computed_status === 'expiring_soon');
  const expiredAds = allAds.filter(a => a.computed_status === 'expired');
  const pausedAds = allAds.filter(a => a.computed_status === 'paused');

  // Filtro lógico
  const filteredAds = ads.filter(ad => {
    const matchesSearch = 
      ad.title?.toLowerCase().includes(filter.toLowerCase()) || 
      ad.location_city?.toLowerCase().includes(filter.toLowerCase()) ||
      ad.category?.toLowerCase().includes(filter.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || ad.computed_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getFullImageUrl = (path: string) => {
    if (!path || path.trim() === "") return 'https://placehold.co/800x400/f1f5f9/64748b?text=Sem+Imagem';
    if (path.startsWith('http')) return path;
    const cleanPath = path.replace(/^\//, '').replace(/^api\//, '');
    return `http://127.0.0.1:8000/${cleanPath}`;
  };

  const loadAds = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin-ads');
      const adsData = res.data?.data || res.data || [];
      setAds(Array.isArray(adsData) ? adsData : []);
    } catch (error) {
      console.error("Erro ao carregar anúncios", error);
      setAds([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAds(); }, []);

  // --- HANDLES DE AÇÃO ---

  const pauseAd = async (id: number) => {
    try {
      await api.post('/admin-manage-ads', { action: 'pause', id });
      loadAds();
    } catch {
      alert("Erro ao pausar anúncio");
    }
  };

  const activateAd = async (id: number) => {
    try {
      await api.post('/admin-manage-ads', { action: 'activate', id });
      loadAds();
    } catch {
      alert("Erro ao ativar anúncio");
    }
  };

  const renewAd = async (id: number, days: number = 30) => {
    try {
      await api.post('/admin-manage-ads', { action: 'renew', id, days });
      loadAds();
    } catch {
      alert("Erro ao renovar anúncio");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Deseja remover este anúncio definitivamente?")) return;
    try {
      await api.post('/admin-manage-ads', { id, action: 'delete' });
      setAds(prev => prev.filter(ad => ad.id !== id));
    } catch {
      alert("Erro ao excluir anúncio.");
    }
  };

  return (
    <PageShell
      title="Publicidade"
      description="Gerencie anúncios publicitários do sistema"
      actions={
        <button 
          onClick={() => navigate('/novo-anuncio')}
          className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase hover:bg-orange-600 transition-colors"
        >
          <Plus size={16} /> Novo Anúncio
        </button>
      }
    >

      {/* Stats Grid */}
      <div className="mt-6">
        <StatsGrid>
          <StatCard label="Ativos" value={activeAds.length} variant="green" icon={Play} />
          <StatCard label="Expirando" value={expiredAds.length} variant="yellow" icon={AlertTriangle} />
          <StatCard label="Pausados" value={pausedAds.length} variant="default" icon={Pause} />
          <StatCard label="Total" value={allAds.length} icon={BarChart3} />
        </StatsGrid>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mt-4 items-center">
        <select 
          value={statusFilter} 
          onChange={e => setStatusFilter(e.target.value)} 
          className="bg-white px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="all">Todos os Status</option>
          <option value="active">Ativos</option>
          <option value="expiring_soon">Expirando</option>
          <option value="paused">Pausados</option>
          <option value="expired">Expirados</option>
        </select>

        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Buscar campanha..." value={filter} onChange={e => setFilter(e.target.value)} className="w-full pl-11 pr-4 py-2.5 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-200">
                <th className="px-5 py-4">Preview</th>
                <th className="px-5 py-4">Campanha</th>
                <th className="px-5 py-4">Anunciante</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-center">Performance</th>
                <th className="px-5 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6} className="px-5 py-20 text-center"><Loader2 className="animate-spin mx-auto text-slate-300" size={32} /></td></tr>
              ) : filteredAds.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-20 text-center font-bold text-slate-400">Nenhum anúncio encontrado</td></tr>
              ) : filteredAds.map((ad: any) => {
                const statusConfig: Record<string, {color: string; bg: string; label: string}> = {
                  active: { color: 'text-emerald-600', bg: 'bg-emerald-100', label: '● ATIVO' },
                  expiring_soon: { color: 'text-amber-600', bg: 'bg-amber-100', label: '● EXPIRANDO' },
                  paused: { color: 'text-slate-500', bg: 'bg-slate-100', label: '○ PAUSADO' },
                  expired: { color: 'text-red-600', bg: 'bg-red-100', label: '● EXPIRADO' }
                };
                const status = statusConfig[ad.computed_status] || statusConfig.active;
                
                return (
                  <tr key={ad.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="w-20 h-12 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 relative">
                        <img src={getFullImageUrl(ad.image_url)} alt="" className="w-full h-full object-cover" />
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-800 text-sm">{ad.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-bold text-slate-500 uppercase">{ad.position}</span>
                        <span className="text-[10px] text-slate-400 font-bold">{ad.location_city}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-xs font-bold text-slate-700">{ad.user_name || 'Desconhecido'}</p>
                      <p className="text-[10px] text-slate-400 truncate max-w-[150px]">{ad.location_city || 'Nacional'}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`${status.bg} ${status.color} text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex justify-center gap-4">
                          <div className="flex flex-col">
                              <span className="text-sm font-bold text-slate-800 leading-none">{ad.clicks_count || 0}</span>
                              <span className="text-[9px] font-bold text-orange-500 uppercase mt-0.5">Cliques</span>
                          </div>
                          <div className="flex flex-col">
                              <span className="text-sm font-bold text-slate-800 leading-none">{ad.views_count || 0}</span>
                              <span className="text-[9px] font-bold text-blue-500 uppercase mt-0.5">Views</span>
                          </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {ad.computed_status === 'active' || ad.computed_status === 'expiring_soon' ? (
                          <button onClick={() => pauseAd(ad.id)} className="p-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100">
                            <Pause size={14}/>
                          </button>
                        ) : (
                          <button onClick={() => activateAd(ad.id)} className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100">
                            <Play size={14}/>
                          </button>
                        )}
                        {(ad.computed_status === 'expired' || ad.computed_status === 'paused') && (
                          <button onClick={() => renewAd(ad.id, 30)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
                            <RotateCcw size={14}/>
                          </button>
                        )}
                        <button onClick={() => handleDelete(ad.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100">
                          <Trash2 size={14}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </PageShell>
  );
}