import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api/api';
import { 
  Search, Trash2, Star, Loader2, 
  ChevronRight, Edit3, PlusCircle,
  Package, MapPin, Clock, DollarSign
} from 'lucide-react';

export default function FreightsManagerView() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [freights, setFreights] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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
    } catch {
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
    } catch {
      alert("Erro ao excluir frete");
    }
  };

  const filtered = (freights || []).filter(f => {
    if (!f || !f.id) return false;
    const searchLower = searchTerm.toLowerCase().trim();
    const matchesSearch = searchLower === "" || (
      f.id?.toString().includes(searchLower) || 
      (f.origin_city || '').toLowerCase().includes(searchLower) || 
      (f.origin_state || '').toLowerCase().includes(searchLower) ||
      (f.dest_city || '').toLowerCase().includes(searchLower) || 
      (f.dest_state || '').toLowerCase().includes(searchLower) || 
      (f.product || '').toLowerCase().includes(searchLower) ||
      (f.company_name || '').toLowerCase().includes(searchLower)
    );
    if (statusFilter === 'featured') return matchesSearch && Number(f.is_featured) === 1;
    if (statusFilter === 'requested') return matchesSearch && Number(f.requested_featured) === 1;
    return matchesSearch;
  });

  const totalFretes = freights.length;
  const fretesDestaque = freights.filter(f => Number(f.is_featured) === 1).length;
  const fretesPedido = freights.filter(f => Number(f.requested_featured) === 1).length;

  return (
    <div className="p-5 lg:p-8 max-w-[1440px] mx-auto space-y-5 lg:space-y-6">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white">
            Gestão de Cargas
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Gerencie todos os fretes publicados na plataforma
          </p>
        </div>
        <button 
          onClick={() => navigate('/novo-frete')}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl font-black text-xs uppercase italic tracking-wider transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 active:scale-95"
        >
          <PlusCircle size={18} />
          Criar Frete
        </button>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-xl">
              <Package size={20} className="text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">Total</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{totalFretes}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-xl">
              <Star size={20} className="text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-amber-700 dark:text-amber-400 font-bold uppercase">Destaque</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{fretesDestaque}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-xl">
              <Clock size={20} className="text-purple-500" />
            </div>
            <div>
              <p className="text-xs text-purple-700 dark:text-purple-400 font-bold uppercase">Pedidos</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{fretesPedido}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-xl">
              <DollarSign size={20} className="text-emerald-500" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">Valor</p>
              <p className="text-xl font-black text-slate-900 dark:text-white">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(
                  freights.reduce((acc, f) => acc + (parseFloat(f.price || '0') || 0), 0)
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FILTERS */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Buscar por ID, Empresa, Cidade ou Produto..."
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-900 dark:text-white placeholder:text-slate-400 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white dark:bg-slate-800 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 font-black text-xs uppercase text-slate-600 dark:text-slate-300 outline-none"
          >
            <option value="all">Todos</option>
            <option value="featured">Destaques</option>
            <option value="requested">Pedidos de Destaque</option>
          </select>

          <button 
            onClick={loadFreights} 
            disabled={loading}
            className="p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-blue-500 transition-colors disabled:opacity-50"
          >
            <Loader2 size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">ID / Rota</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Produto</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Anunciante</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Valor</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Destaque</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {loading && freights.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <Loader2 className="animate-spin mx-auto text-slate-400" size={32} />
                    <p className="text-sm text-slate-400 mt-2">Carregando fretes...</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <Package className="mx-auto text-slate-300 dark:text-slate-600" size={48} />
                    <p className="text-lg font-black text-slate-400 dark:text-slate-500 mt-4">Nenhum frete encontrado</p>
                    <p className="text-sm text-slate-400 dark:text-slate-500">Tente ajustar os filtros de busca</p>
                  </td>
                </tr>
              ) : (
                filtered.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-400">#{f.id}</span>
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white flex items-center gap-1">
                            {f.origin_city} <ChevronRight size={12} className="text-blue-500"/> {f.dest_city}
                          </p>
                          <p className="text-xs text-slate-400 flex items-center gap-1">
                            <MapPin size={10} /> {f.origin_state} → {f.dest_state}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{f.product || 'Não especificado'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{f.company_name || 'Particular'}</p>
                      <p className="text-xs text-slate-400">ID: {f.user_id}</p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                        {f.price ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(f.price)) : '-'}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button 
                        onClick={() => handleToggleFeatured(f.id, f.is_featured)}
                        className={`p-2 rounded-xl transition-all ${
                          f.is_featured == "1" 
                          ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' 
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-500'
                        }`}
                      >
                        <Star size={16} fill={f.is_featured == "1" ? "currentColor" : "none"} />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => navigate('/novo-frete', { state: { editData: f } })}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(f.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                        >
                          <Trash2 size={16} />
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
    </div>
  );
}