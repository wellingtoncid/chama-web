import { useState, useEffect, useMemo } from 'react';
import { api } from '../../api/api';
import {
  Trash2, Loader2, Plus, X,
  Search, BarChart3, Download,
  Play, Pause, RotateCcw, AlertTriangle, ChevronLeft, ChevronRight
} from 'lucide-react';
import { StatsGrid, StatCard, PageShell } from '@/components/admin';
import AdEditorModal from '@/components/advertiser/AdEditorModal';

export default function AdsManager() {
  const user = JSON.parse(localStorage.getItem('@ChamaFrete:user') || '{}');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [customDateStart, setCustomDateStart] = useState('');
  const [customDateEnd, setCustomDateEnd] = useState('');
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const allAds = ads;
  const activeAds = allAds.filter(a => a.computed_status === 'active' || a.computed_status === 'expiring_soon');
  const expiredAds = allAds.filter(a => a.computed_status === 'expired');
  const pausedAds = allAds.filter(a => a.computed_status === 'paused');

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, dateFilter, filter, customDateStart, customDateEnd, pageSize]);

  const getDateRange = () => {
    if (dateFilter === 'all') return { startDate: null, endDate: null };
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    
    let startDate: Date | null = null;
    let endDate: Date | null = null;
    
    switch (dateFilter) {
      case 'today':
        startDate = today;
        endDate = now;
        break;
      case 'week':
        startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = now;
        break;
      case 'month':
        startDate = startOfMonth;
        endDate = now;
        break;
      case 'lastmonth':
        startDate = startOfLastMonth;
        endDate = endOfLastMonth;
        break;
      case 'custom':
        if (customDateStart) startDate = new Date(customDateStart);
        if (customDateEnd) endDate = new Date(customDateEnd + 'T23:59:59');
        break;
    }
    
    return { startDate, endDate };
  };

  const hasDateFilter = dateFilter !== 'all';

  const filteredAds = useMemo(() => {
    const { startDate, endDate } = getDateRange();
    
    return ads.filter(ad => {
      if (startDate || endDate) {
        const adDate = new Date(ad.created_at);
        if (startDate && adDate < startDate) return false;
        if (endDate && adDate > endDate) return false;
      }
      
      const matchesSearch = 
        ad.title?.toLowerCase().includes(filter.toLowerCase()) || 
        ad.location_city?.toLowerCase().includes(filter.toLowerCase()) ||
        ad.category?.toLowerCase().includes(filter.toLowerCase()) ||
        ad.user_name?.toLowerCase().includes(filter.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || ad.computed_status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [ads, statusFilter, dateFilter, customDateStart, customDateEnd, filter]);

  const totalPages = Math.ceil(filteredAds.length / pageSize);
  const paginatedAds = filteredAds.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

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
      console.error('Erro ao carregar anúncios', error);
      setAds([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAds(); }, []);

  const pauseAd = async (id: number) => {
    try {
      await api.post('/admin-manage-ads', { action: 'pause', id });
      loadAds();
    } catch {
      alert('Erro ao pausar anúncio');
    }
  };

  const activateAd = async (id: number) => {
    try {
      await api.post('/admin-manage-ads', { action: 'activate', id });
      loadAds();
    } catch {
      alert('Erro ao ativar anúncio');
    }
  };

  const renewAd = async (id: number, days: number = 30) => {
    try {
      await api.post('/admin-manage-ads', { action: 'renew', id, days });
      loadAds();
    } catch {
      alert('Erro ao renovar anúncio');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Deseja remover este anúncio definitivamente?')) return;
    try {
      await api.post('/admin-manage-ads', { id, action: 'delete' });
      setAds(prev => prev.filter(ad => ad.id !== id));
    } catch {
      alert('Erro ao excluir anúncio.');
    }
  };

  const exportToCSV = () => {
    if (!filteredAds.length) return;
    
    const headers = ['ID', 'Campanha', 'Posição', 'Anunciante', 'Status', 'Cliques', 'Views', 'Criado em'];
    const rows = filteredAds.map((ad: any) => [
      ad.id,
      ad.title,
      ad.position,
      ad.user_name || 'N/A',
      ad.computed_status,
      ad.clicks_count || 0,
      ad.views_count || 0,
      new Date(ad.created_at).toLocaleDateString('pt-BR')
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(';')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `anuncios_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
    <PageShell
      title="Publicidade"
      description="Gerencie anúncios publicitários do sistema"
      actions={
        <div className="flex gap-2">
          <button onClick={exportToCSV} className="flex items-center gap-2 bg-slate-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase hover:bg-slate-700 transition-colors">
            <Download size={16} /> Exportar
          </button>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} /> Novo Anúncio
          </button>
        </div>
      }
    >
      <div className="mt-6">
        <StatsGrid>
          <StatCard label="Ativos" value={activeAds.length} variant="green" icon={Play} />
          <StatCard label="Expirando" value={expiredAds.length} variant="yellow" icon={AlertTriangle} />
          <StatCard label="Pausados" value={pausedAds.length} icon={Pause} />
          <StatCard label="Total" value={allAds.length} icon={BarChart3} />
        </StatsGrid>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mt-4">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar campanha..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-white dark:bg-slate-800 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos os Status</option>
            <option value="active">Ativos</option>
            <option value="expiring_soon">Expirando</option>
            <option value="paused">Pausados</option>
            <option value="expired">Expirados</option>
          </select>

          <select
            value={dateFilter}
            onChange={e => { setDateFilter(e.target.value); setShowCustomDate(e.target.value === 'custom'); }}
            className="bg-white dark:bg-slate-800 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos os Períodos</option>
            <option value="today">Hoje</option>
            <option value="week">Últimos 7 dias</option>
            <option value="month">Este Mês</option>
            <option value="lastmonth">Mês Passado</option>
            <option value="custom">Personalizado</option>
          </select>

          {showCustomDate && (
            <div className="flex items-center gap-2">
              <input 
                type="date"
                value={customDateStart}
                onChange={e => setCustomDateStart(e.target.value)}
                className="px-4 py-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input 
                type="date"
                value={customDateEnd}
                onChange={e => setCustomDateEnd(e.target.value)}
                className="px-4 py-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-blue-500"
              />
              {(customDateStart || customDateEnd) && (
                <button onClick={() => { setCustomDateStart(''); setCustomDateEnd(''); }} className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-700">
                  <X size={14} className="text-slate-400" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden mt-4">
        <div className="p-4 lg:p-5 border-b border-slate-100 dark:border-slate-700 flex flex-wrap justify-between items-center gap-3">
          <h3 className="font-bold text-slate-900 dark:text-white">
            Anúncios ({filteredAds.length})
          </h3>
          
          {!hasDateFilter && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400">Mostrar</span>
              <select 
                value={pageSize}
                onChange={e => setPageSize(Number(e.target.value))}
                className="px-2 py-1 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-300"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-xs text-slate-500 dark:text-slate-400">por página</span>
            </div>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-200 dark:border-slate-700">
                <th className="px-5 py-4">Preview</th>
                <th className="px-5 py-4">Campanha</th>
                <th className="px-5 py-4">Anunciante</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-center">Performance</th>
                <th className="px-5 py-4">Criado em</th>
                <th className="px-5 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {loading ? (
                <tr><td colSpan={7} className="px-5 py-20 text-center"><Loader2 className="animate-spin mx-auto text-slate-300" size={32} /></td></tr>
              ) : (hasDateFilter ? filteredAds : paginatedAds).length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-20 text-center font-bold text-slate-400 dark:text-slate-500">Nenhum anúncio encontrado</td></tr>
              ) : (hasDateFilter ? filteredAds : paginatedAds).map((ad: any) => {
                const statusConfig: Record<string, {color: string; bg: string; label: string}> = {
                  active: { color: 'text-emerald-600', bg: 'bg-emerald-100', label: 'ATIVO' },
                  expiring_soon: { color: 'text-amber-600', bg: 'bg-amber-100', label: 'EXPIRANDO' },
                  paused: { color: 'text-slate-500', bg: 'bg-slate-100', label: 'PAUSADO' },
                  expired: { color: 'text-red-600', bg: 'bg-red-100', label: 'EXPIRADO' }
                };
                const status = statusConfig[ad.computed_status] || statusConfig.active;
                
                return (
                  <tr key={ad.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="w-20 h-12 bg-slate-100 dark:bg-slate-700 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-600 relative">
                        <img src={getFullImageUrl(ad.image_url)} alt="" className="w-full h-full object-cover" />
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-800 dark:text-white text-sm">{ad.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded font-bold text-slate-500 dark:text-slate-300 uppercase">{ad.position}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">{ad.location_city || 'Nacional'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{ad.user_name || 'Desconhecido'}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`${status.bg} ${status.color} text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex justify-center gap-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-800 dark:text-white leading-none">{ad.clicks_count || 0}</span>
                          <span className="text-[9px] font-bold text-orange-500 uppercase mt-0.5">Cliques</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-800 dark:text-white leading-none">{ad.views_count || 0}</span>
                          <span className="text-[9px] font-bold text-blue-500 uppercase mt-0.5">Views</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-bold text-slate-400">
                        {ad.created_at ? new Date(ad.created_at).toLocaleDateString('pt-BR') : '-'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {ad.computed_status === 'active' || ad.computed_status === 'expiring_soon' ? (
                          <button onClick={() => pauseAd(ad.id)} className="py-2 px-4 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg text-xs font-bold uppercase hover:bg-amber-100 dark:hover:bg-amber-900/50">
                            <Pause size={14}/>
                          </button>
                        ) : (
                          <button onClick={() => activateAd(ad.id)} className="py-2 px-4 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-bold uppercase hover:bg-emerald-100 dark:hover:bg-emerald-900/50">
                            <Play size={14}/>
                          </button>
                        )}
                        {(ad.computed_status === 'expired' || ad.computed_status === 'paused') && (
                          <button onClick={() => renewAd(ad.id, 30)} className="py-2 px-4 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-bold uppercase hover:bg-blue-100 dark:hover:bg-blue-900/50">
                            <RotateCcw size={14}/>
                          </button>
                        )}
                        <button onClick={() => handleDelete(ad.id)} className="py-2 px-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold uppercase hover:bg-red-100 dark:hover:bg-red-900/50">
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

        {!hasDateFilter && totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Mostrando {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filteredAds.length)} de {filteredAds.length}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} className="text-slate-600 dark:text-slate-300" />
              </button>
              <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} className="text-slate-600 dark:text-slate-300" />
              </button>
            </div>
          </div>
        )}
      </div>
    </PageShell>

      {showCreateModal && (
        <AdEditorModal 
          userId={user.id} 
          onClose={() => setShowCreateModal(false)} 
          onSuccess={loadAds} 
        />
      )}
    </>
  );
}
