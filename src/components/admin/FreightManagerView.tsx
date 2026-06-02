import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api/api';
import { StatsGrid, StatCard, TimeFilter, PageShell } from '@/components/admin';
import {
  Search, Trash2, Star, Loader2,
  Edit3, PlusCircle, Eye,
  Package, DollarSign, ChevronRight, ChevronLeft,
  Clock
} from 'lucide-react';

export default function FreightsManagerView() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [freights, setFreights] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState<'today' | '7days' | '30days' | 'thisMonth' | 'custom' | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handleTimeFilterChange = (value: 'today' | '7days' | '30days' | 'thisMonth' | 'custom' | 'all', _customRange?: { start: string; end: string }) => {
    setTimeFilter(value);
    // TODO: integrar com loadFreights passando o período
  };

  const loadFreights = async () => {
    try {
      setLoading(true);
      const res = await api.get('admin-list-freights');
      const rawData = res.data?.data || res.data;
      setFreights(Array.isArray(rawData) ? rawData : []);
    } catch (e) {
      console.error("Erro ao carregar fretes:", e);
      setFreights([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadFreights(); }, []);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter, pageSize]);

  const handleToggleFeatured = async (id: number, currentStatus: any) => {
    const newStatus = currentStatus == "1" ? "0" : "1";
    try {
      await api.post('manage-freights', { 
        id, 
        featured: newStatus, 
        action: 'toggle-featured' 
      });
      setFreights(prev => prev.map(f => f.id === id ? { ...f, is_featured: newStatus, requested_featured: "0" } : f));
    } catch (error) {
      alert("Erro ao atualizar destaque");
    }
  };

  const handleDelete = async (id: number) => {
    if(!confirm("Apagar este frete permanentemente?")) return;
    try {
      const res = await api.post('manage-freights', { 
        id, 
        action: 'delete' 
      });
      if (res.data.success) {
        setFreights(prev => prev.filter(f => f.id !== id));
      }
    } catch (error) {
      alert("Erro ao excluir frete");
    }
  };

  // Filtro consolidado
  const filtered = (freights || []).filter(f => {
    if (!f || !f.id) return false;
    const searchLower = searchTerm.toLowerCase().trim();
    const matchesSearch = searchLower === "" || (
      f.id?.toString().includes(searchLower) || 
      (f.origin_city || '').toLowerCase().includes(searchLower) || 
      (f.dest_city || '').toLowerCase().includes(searchLower) || 
      (f.product || '').toLowerCase().includes(searchLower) ||
      (f.company_name || '').toLowerCase().includes(searchLower)
    );

    if (statusFilter === 'featured') return matchesSearch && Number(f.is_featured) === 1;
    if (statusFilter === 'requested') return matchesSearch && Number(f.requested_featured) === 1;
    
    // Filtros de status padrão (Active/Paused/etc se houver campo status no frete)
    if (statusFilter !== 'all' && f.status) return matchesSearch && f.status === statusFilter;
    
    return matchesSearch;
  });

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginatedFreights = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Métricas
  const totalFretes = freights.length;
  const fretesDestaque = freights.filter(f => Number(f.is_featured) === 1).length;
  const fretesPedido = freights.filter(f => Number(f.requested_featured) === 1).length;
  const valorTotal = freights.reduce((acc, f) => acc + (parseFloat(f.price || '0') || 0), 0);
  const valorTotalFormatado = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(valorTotal);

  return (
    <PageShell
      title="Gestão de Cargas"
      description="Gerencie todos os fretes publicados na plataforma"
      actions={
        <button 
          onClick={() => navigate('/novo-frete')}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-black text-xs uppercase italic tracking-wider transition-all shadow-lg hover:shadow-blue-500/40 active:scale-95"
        >
          <PlusCircle size={18} />
          Criar Frete
        </button>
      }
    >
      {/* Espaçamento entre header e stats */}
      <div className="mt-6">
        <StatsGrid>
          <StatCard label="Total" value={totalFretes} icon={<Package size={16} />} />
          <StatCard label="Destaque" value={fretesDestaque} variant="yellow" icon={<Star size={16} />} />
          <StatCard label="Pedidos" value={fretesPedido} variant="purple" icon={<Clock size={16} />} />
          <StatCard label="Valor Total" value={valorTotalFormatado} variant="green" icon={<DollarSign size={16} />} />
        </StatsGrid>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-3 mt-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Buscar por ID, Empresa, Cidade ou Produto..."
            className="w-full pl-11 pr-4 py-2.5 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos os Status</option>
            <option value="featured">Apenas Destaque</option>
            <option value="requested">Pedidos de Destaque</option>
            <option value="active">Ativos</option>
            <option value="paused">Pausados</option>
          </select>

          <TimeFilter value={timeFilter} onChange={handleTimeFilterChange} />
          
          <button 
            onClick={loadFreights} 
            disabled={loading}
            className="p-2.5 bg-white rounded-xl border border-slate-200 text-slate-500 hover:text-blue-500 disabled:opacity-50 transition-all"
          >
            <Loader2 size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm mt-4">
        <div className="px-5 py-3.5 border-b border-slate-100 flex flex-wrap justify-between items-center gap-3">
          <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
            Cargas ({filtered.length})
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Mostrar</span>
            <select
              value={pageSize}
              onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-xs text-slate-500">por página</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50/80 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5 text-left text-[10px] font-black uppercase text-slate-400 tracking-widest">ID / Rota</th>
                <th className="px-5 py-3.5 text-left text-[10px] font-black uppercase text-slate-400 tracking-widest">Produto</th>
                <th className="px-5 py-3.5 text-left text-[10px] font-black uppercase text-slate-400 tracking-widest">Tipo</th>
                <th className="px-5 py-3.5 text-left text-[10px] font-black uppercase text-slate-400 tracking-widest">Anunciante</th>
                <th className="px-5 py-3.5 text-right text-[10px] font-black uppercase text-slate-400 tracking-widest">Valor</th>
                <th className="px-5 py-3.5 text-center text-[10px] font-black uppercase text-slate-400 tracking-widest">Destaque</th>
                <th className="px-5 py-3.5 text-right text-[10px] font-black uppercase text-slate-400 tracking-widest">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && freights.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <Loader2 className="animate-spin mx-auto text-slate-300" size={32} />
                    <p className="text-xs font-bold text-slate-400 mt-3 uppercase tracking-wider">Carregando fretes...</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Nenhum frete encontrado</p>
                  </td>
                </tr>
              ) : (
                 paginatedFreights.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-5 py-4">
                      <p className="text-xs font-black text-slate-900 uppercase flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400">#{f.id}</span>
                        <span className="text-slate-700">{f.origin_city}<span className="text-slate-400 ml-0.5">/{f.origin_state}</span></span>
                        <ChevronRight size={12} className="text-blue-500 shrink-0"/>
                        <span className="text-slate-700">{f.dest_city}<span className="text-slate-400 ml-0.5">/{f.dest_state}</span></span>
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-[10px] font-black uppercase text-slate-600">
                        {f.product || 'Carga Geral'}
                      </span>
                      {f.distance_km && <span className="ml-2 text-[9px] font-bold text-slate-400">{f.distance_km} km</span>}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-lg bg-slate-100 text-[9px] font-bold text-slate-500 uppercase">
                        {f.cargo_type_name || (f.cargo_type_id ? 'Geral' : '—')}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-xs font-black uppercase leading-none">
                        <span className="text-[10px] font-bold text-slate-400">#{f.user_id}</span>{' '}{f.company_name || 'Particular'}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <p className="text-xs font-black text-emerald-600 tabular-nums">
                        {f.price ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(f.price)) : '—'}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <button 
                        onClick={() => handleToggleFeatured(f.id, f.is_featured)}
                        className={`inline-flex items-center justify-center p-2 rounded-lg transition-all ${
                          f.is_featured == "1" 
                          ? 'bg-amber-100 text-amber-600 shadow-sm hover:bg-amber-200' 
                          : 'bg-slate-100 text-slate-300 hover:bg-amber-50 hover:text-amber-400'
                        }`}
                      >
                        <Star size={14} fill={f.is_featured == "1" ? "currentColor" : "none"} />
                      </button>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <a
                          href={`/frete/${f.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Ver"
                        >
                          <Eye size={14} />
                        </a>
                        <button 
                          onClick={() => navigate('/novo-frete', { state: { editData: f } })}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Editar"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(f.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Excluir"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between">
            <div className="text-xs text-slate-500">
              Mostrando {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filtered.length)} de {filtered.length}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} className="text-slate-600" />
              </button>
              <span className="text-sm font-bold text-slate-600">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} className="text-slate-600" />
              </button>
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}
