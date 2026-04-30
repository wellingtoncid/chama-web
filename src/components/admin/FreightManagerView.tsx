import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api/api';
import { StatsGrid, StatCard, TimeFilter, PageShell } from '@/components/admin';
import {
  Search, Trash2, Star, Loader2,
  Edit3, PlusCircle,
  Package, DollarSign, ChevronRight, MapPin,
  Clock
} from 'lucide-react';

export default function FreightsManagerView() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [freights, setFreights] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState<'today' | '7days' | '30days' | 'thisMonth' | 'custom' | 'all'>('all');

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
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl font-black text-xs uppercase italic tracking-wider transition-all shadow-lg hover:shadow-blue-500/40 active:scale-95"
        >
          <PlusCircle size={18} />
          Criar Frete
        </button>
      }
    >
      <StatsGrid>
        <StatCard label="Total" value={totalFretes} icon={Package} />
        <StatCard label="Destaques" value={fretesDestaque} variant="yellow" icon={Star} />
        <StatCard label="Pedidos" value={fretesPedido} variant="purple" icon={Clock} />
        <StatCard label="Valor Total" value={valorTotalFormatado} variant="green" icon={DollarSign} />
      </StatsGrid>

      <div className="flex flex-col md:flex-row gap-3 mt-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Buscar por ID, Empresa, Cidade ou Produto..."
            className="w-full pl-11 pr-4 py-3 bg-white rounded-2xl border border-slate-200 font-bold text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white px-4 py-3 rounded-2xl border border-slate-200 font-black text-xs uppercase text-slate-600 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos os Status</option>
            <option value="featured">Apenas Destaques</option>
            <option value="requested">Pedidos de Destaque</option>
            <option value="active">Ativos</option>
            <option value="paused">Pausados</option>
          </select>

          <TimeFilter value={timeFilter} onChange={handleTimeFilterChange} />
          
          <button 
            onClick={loadFreights} 
            disabled={loading}
            className="p-3 bg-white rounded-2xl border border-slate-200 text-slate-500 hover:text-blue-500 disabled:opacity-50 transition-all"
          >
            <Loader2 size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm mt-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-[10px] font-black uppercase text-slate-400 tracking-widest">ID / Rota</th>
                <th className="px-4 py-3 text-left text-[10px] font-black uppercase text-slate-400 tracking-widest">Produto</th>
                <th className="px-4 py-3 text-left text-[10px] font-black uppercase text-slate-400 tracking-widest">Anunciante</th>
                <th className="px-4 py-3 text-right text-[10px] font-black uppercase text-slate-400 tracking-widest">Valor</th>
                <th className="px-4 py-3 text-center text-[10px] font-black uppercase text-slate-400 tracking-widest">Destaque</th>
                <th className="px-4 py-3 text-right text-[10px] font-black uppercase text-slate-400 tracking-widest">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && freights.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <Loader2 className="animate-spin mx-auto text-slate-400" size={32} />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400 font-bold uppercase italic">Nenhum frete encontrado</td>
                </tr>
              ) : (
                filtered.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-slate-300">#{f.id}</span>
                        <div>
                          <p className="text-xs font-black text-slate-900 uppercase italic flex items-center gap-1">
                            {f.origin_city} <ChevronRight size={10} className="text-blue-500"/> {f.dest_city}
                          </p>
                          <p className="text-[10px] text-slate-400 font-bold">
                            {f.origin_state} → {f.dest_state}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs font-bold text-slate-700 uppercase">{f.product || 'CARGA GERAL'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs font-black text-slate-800 uppercase leading-none">{f.company_name || 'PARTICULAR'}</p>
                      <p className="text-[9px] text-slate-400 mt-1 font-bold">USER ID: {f.user_id}</p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="text-xs font-black text-emerald-600">
                        {f.price ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(f.price)) : 'A COMBINAR'}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button 
                        onClick={() => handleToggleFeatured(f.id, f.is_featured)}
                        className={`p-2 rounded-xl transition-all ${
                          f.is_featured == "1" 
                          ? 'bg-amber-100 text-amber-600 shadow-sm' 
                          : 'bg-slate-50 text-slate-300 hover:bg-amber-50 hover:text-amber-400'
                        }`}
                      >
                        <Star size={14} fill={f.is_featured == "1" ? "currentColor" : "none"} />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => navigate('/novo-frete', { state: { editData: f } })}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(f.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
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
      </div>
    </PageShell>
  );
}