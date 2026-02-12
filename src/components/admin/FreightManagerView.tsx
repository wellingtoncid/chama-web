import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Adicionado para navegação
import { api } from '../../api/api';
import { 
  Search, Trash2, Star, Loader2, 
  ChevronRight, Edit3, PlusCircle 
} from 'lucide-react';

export default function FreightsManagerView() {
  const navigate = useNavigate(); // Hook para navegar
  const [loading, setLoading] = useState(false);
  const [freights, setFreights] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadFreights = async () => {
    try {
      setLoading(true);
      const res = await api.get('admin-list-freights');
      // Verifica se a estrutura é res.data.data (padrão do seu controller) ou res.data (array direto)
      const data = res.data.success ? res.data.data : res.data;
      setFreights(data || []);
    } catch (e) {
      console.error("Erro ao carregar fretes");
    } finally {
      setLoading(false);
    }
};

  useEffect(() => { loadFreights(); }, []);

 // Função para Alternar Destaque
  const handleToggleFeatured = async (id: number, currentStatus: any) => {
    const newStatus = currentStatus == "1" ? "0" : "1";
    try {
      // Rota direta e limpa
      await api.post('manage-freights', { 
        id, 
        featured: newStatus, 
        action: 'toggle-featured' 
      });
      
      setFreights(prev => prev.map(f => f.id === id ? { ...f, isFeatured: newStatus, requested_featured: "0" } : f));
    } catch (e) {
      alert("Erro ao atualizar destaque");
    }
  };

// Função para Excluir
  const handleDelete = async (id: number) => {
    if(!confirm("Apagar este frete permanentemente?")) return;
    
    try {
      const res = await api.post('manage-freights', { 
        id, 
        action: 'delete' 
      });
      
      if (res.data.success) {
        // Em vez de recarregar tudo do banco, remove localmente para ser instantâneo
        setFreights(prev => prev.filter(f => f.id !== id));
      }
    } catch (e) {
      alert("Erro ao excluir frete");
    }
  };

  const filtered = (freights || []).filter(f => {
    if (!f || !f.id) return false;
    const searchLower = searchTerm.toLowerCase();
    
    const matchesSearch = 
      f.id?.toString().includes(searchTerm) || 
      (f.origin_city || '').toLowerCase().includes(searchLower) || 
      (f.origin_state || '').toLowerCase().includes(searchLower) ||
      (f.dest_city || '').toLowerCase().includes(searchLower) || 
      (f.dest_state || '').toLowerCase().includes(searchLower) || 
      (f.product || '').toLowerCase().includes(searchLower) ||
      (f.company_name || '').toLowerCase().includes(searchLower);

    // Melhora a comparação para aceitar 1 (número) ou "1" (string)
    if (statusFilter === 'featured') return matchesSearch && Number(f.isFeatured) === 1;
    if (statusFilter === 'requested') return matchesSearch && Number(f.requested_featured) === 1;
    return matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* HEADER DE AÇÕES E BUSCA */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Buscar por ID, Empresa, Cidade ou Produto..."
            className="w-full pl-11 pr-4 py-3 bg-white rounded-2xl border border-slate-200 font-bold text-xs shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          {/* BOTÃO PARA POPULAR PLATAFORMA */}
          <button 
            onClick={() => navigate('/novo-frete')}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl font-black text-[10px] uppercase italic tracking-wider transition-all shadow-lg shadow-blue-100 active:scale-95"
          >
            <PlusCircle size={16} /> Criar Frete Real
          </button>

          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white px-4 py-3 rounded-2xl border border-slate-200 font-black text-[10px] uppercase text-slate-600 outline-none"
          >
            <option value="all">Todos</option>
            <option value="featured">Destaques</option>
            <option value="requested">Pedidos de Destaque</option>
          </select>

          <button onClick={loadFreights} className="p-3 bg-white rounded-2xl border border-slate-200 text-slate-500 hover:text-blue-500 transition-colors">
            <Loader2 size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">ID / Rota</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Anunciante</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 text-center">Destaque</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-slate-300 bg-slate-100 px-2 py-1 rounded-md group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                        #{f.id}
                      </span>
                      <div>
                        <p className="font-black text-slate-800 text-xs uppercase italic flex items-center gap-1">
                          {f.origin_city} <ChevronRight size={10} className="text-blue-500"/> {f.dest_city}
                        </p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                          {f.product} | {f.origin_state} | {f.dest_state} </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-slate-700 uppercase">{f.company_name || 'Particular'}</span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">ID User: {f.user_id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => handleToggleFeatured(f.id, f.isFeatured)}
                      className={`relative p-2.5 rounded-2xl transition-all ${
                        f.isFeatured == "1" 
                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-200 scale-110' 
                        : 'bg-slate-100 text-slate-300 hover:bg-orange-100 hover:text-orange-500'
                      }`}
                    >
                      <Star size={16} fill={f.isFeatured == "1" ? "currentColor" : "none"} />
                      {f.requested_featured == "1" && f.isFeatured == "0" && (
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                        </span>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      {/* BOTÃO EDITAR ADICIONADO */}
                      <button 
                        onClick={() => navigate('/novo-frete', { state: { editData: f } })}
                        className="p-2 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                        title="Editar Frete"
                      >
                        <Edit3 size={16} />
                      </button>

                      <button 
                        onClick={() => handleDelete(f.id)}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        title="Excluir Frete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}