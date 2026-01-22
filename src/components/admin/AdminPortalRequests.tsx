import { useState, useEffect } from 'react';
import { api } from '../../api/api';
import { 
  Flame, TrendingUp, Users, Edit3, 
  Download, Search, Calendar, Info, 
  MessageCircle, Loader2, Check, Trash2, X, AlertTriangle
} from 'lucide-react';

export default function AdminPortalRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [savingId, setSavingId] = useState<number | null>(null);
  
  // Estados para o Modal de Exclusão
  const [deleteModal, setDeleteModal] = useState<{show: boolean, id: number | null}>({ show: false, id: null });

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin-portal-requests');
      setRequests(response.data);
    } catch (error) { 
      console.error("Erro ao carregar dados", error); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  // --- MENSAGEM DE CONTEXTO WHATSAPP ---
  const getWhatsAppLink = (req: any) => {
    const phone = req.contact_info?.replace(/\D/g, '');
    const saudacao = req.type === 'business_ad' 
      ? `Olá! Sou da equipe comercial do Portal de Fretes. Recebi seu interesse em anunciar a empresa *${req.title}*. Podemos conversar?`
      : `Olá! Sou do suporte do Portal de Fretes. Recebi sua mensagem sobre *${req.title || 'sua sugestão'}*. Como posso ajudar?`;
    
    return `https://wa.me/55${phone}?text=${encodeURIComponent(saudacao)}`;
  };

  const exportToCSV = () => {
    const headers = ["Data,Tipo,Empresa,Contato,Status,Prioridade,Notas\n"];
    const rows = filtered.map(r => 
      `${new Date(r.created_at).toLocaleDateString()},${r.type},${r.title},${r.contact_info},${r.status},${r.priority === 1 ? 'Alta' : 'Normal'},"${r.notes || ''}"`
    );
    const blob = new Blob([headers.concat(rows).join("\n")], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads_portal_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleUpdateDetails = async (id: number, status: string, notes: string) => {
    setSavingId(id);
    try {
      await api.post('/admin-update-portal-request-details', { id, status, notes });
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status, notes, last_contact: new Date().toISOString() } : r));
      setTimeout(() => setSavingId(null), 1000);
    } catch (error) {
      console.error("Erro ao salvar", error);
      setSavingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    try {
      await api.post('/admin-update-portal-request', { 
        id: deleteModal.id, 
        action: 'delete' 
      });
      setRequests(prev => prev.filter(r => r.id !== deleteModal.id));
      setDeleteModal({ show: false, id: null });
    } catch (error) {
      console.error("Erro ao excluir", error);
      alert("Erro ao excluir lead.");
    }
  };

  const filtered = requests.filter(req => {
    const matchesTab = activeTab === 'all' ? true : req.type === activeTab;
    const matchesSearch = (req.title?.toLowerCase().includes(searchTerm.toLowerCase())) || 
                          (req.contact_info?.includes(searchTerm)) ||
                          (req.description?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDate = dateFilter ? req.created_at.startsWith(dateFilter) : true;
    return matchesTab && matchesSearch && matchesDate;
  });

  const stats = {
    total: requests.length,
    newLeads: requests.filter(r => r.status === 'pending' && r.type === 'business_ad').length,
    hotLeads: requests.filter(r => r.priority === 1).length
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans">
      
      {/* 1. DASHBOARD DE MÉTRICAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
          <div className="flex justify-between items-center text-blue-500 mb-2">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Total Geral</p>
            <Users size={18} />
          </div>
          <h3 className="text-3xl font-black text-slate-900">{stats.total}</h3>
        </div>

        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
          <div className="flex justify-between items-center text-emerald-500 mb-2">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Leads de Anúncio</p>
            <TrendingUp size={18} />
          </div>
          <h3 className="text-3xl font-black text-slate-900">{stats.newLeads}</h3>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-red-600 p-6 rounded-[2rem] shadow-lg text-white">
          <div className="flex justify-between items-center mb-2">
            <p className="text-white/80 text-[10px] font-black uppercase tracking-widest">Prioridade Alta</p>
            <Flame className="animate-pulse" size={20} />
          </div>
          <h3 className="text-3xl font-black">{stats.hotLeads}</h3>
          <p className="text-[9px] font-bold text-orange-100 uppercase mt-1 italic">Identificados como "Quentes" 🔥</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[3rem] shadow-sm border border-slate-100">
        
        {/* 2. CONTROLES E FILTROS */}
        <div className="flex flex-col lg:flex-row justify-between gap-6 mb-8">
          <button onClick={exportToCSV} className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase hover:bg-slate-800 transition-all shadow-lg active:scale-95">
            <Download size={14} /> Exportar CSV
          </button>

          <div className="flex bg-slate-100 p-1.5 rounded-2xl overflow-x-auto border border-slate-200">
            {[{id:'all', label:'Todos'}, {id:'business_ad', label:'💰 Anúncios'}, {id:'suggestion', label:'Sugestões'}, {id:'external_group', label:'Grupos'}].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-5 py-2.5 rounded-xl text-[10px] whitespace-nowrap font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white text-blue-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. BUSCA */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative col-span-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input type="text" placeholder="Buscar..." className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl text-xs font-bold border-none focus:ring-2 focus:ring-blue-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input type="date" className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl text-xs font-bold border-none focus:ring-2 focus:ring-blue-500" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
          </div>
        </div>

        {/* 4. TABELA */}
        <div className="overflow-x-auto">
          {loading ? (
             <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" /></div>
          ) : (
            <table className="w-full border-separate border-spacing-y-3">
              <thead>
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">
                  <th className="pb-2 px-6 text-left">Lead / Empresa</th>
                  <th className="pb-2 px-4 text-left">Mensagem</th>
                  <th className="pb-2 px-4 text-left">Notas CRM</th>
                  <th className="pb-2 px-4 text-left">Status</th>
                  <th className="pb-2 px-6 text-right">Ação</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((req) => (
                  <tr key={req.id} className={`group transition-all border border-slate-100 shadow-sm ${req.status === 'pending' ? 'bg-white' : 'bg-slate-50/40'}`}>
                    <td className="py-5 px-6 rounded-l-[2rem] border-y border-l border-slate-100">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-black text-slate-800 uppercase italic">{req.title || 'Lead s/ nome'}</p>
                        {req.priority === 1 && <Flame size={12} className="text-orange-500 fill-orange-500 animate-pulse" />}
                      </div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Entrada: {new Date(req.created_at).toLocaleDateString()}</p>
                    </td>

                    <td className="py-5 px-4 border-y border-slate-100 max-w-[200px]">
                      <p className="text-[10px] text-slate-500 italic line-clamp-2 group-hover:line-clamp-none transition-all">
                        {req.description || "Sem descrição."}
                      </p>
                    </td>

                    <td className="py-5 px-4 border-y border-slate-100">
                      <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus-within:bg-white transition-all">
                        {savingId === req.id ? <Loader2 size={12} className="animate-spin" /> : <Edit3 size={12} className="text-slate-400" />}
                        <input type="text" className="bg-transparent border-none text-[10px] font-bold p-0 focus:ring-0 w-full" defaultValue={req.notes} onBlur={(e) => handleUpdateDetails(req.id, req.status, e.target.value)} />
                      </div>
                    </td>

                    <td className="py-5 px-4 border-y border-slate-100">
                      <select value={req.status} onChange={(e) => handleUpdateDetails(req.id, e.target.value, req.notes)} className={`text-[9px] font-black uppercase border-none rounded-full py-1.5 px-3 focus:ring-0 shadow-sm ${req.status === 'pending' ? 'bg-orange-500 text-white' : req.status === 'in_negotiation' ? 'bg-blue-500 text-white' : 'bg-slate-300'}`}>
                        <option value="pending">Novo</option>
                        <option value="in_negotiation">Em Negociação</option>
                        <option value="analyzed">Finalizado</option>
                      </select>
                    </td>

                    <td className="py-5 px-6 text-right rounded-r-[2rem] border-y border-r border-slate-100">
                      <div className="flex items-center justify-end gap-2">
                        <a href={getWhatsAppLink(req)} target="_blank" rel="noreferrer" className="p-3 bg-emerald-500 text-white rounded-2xl shadow-lg hover:scale-110 transition-all">
                          <MessageCircle size={18} />
                        </a>
                        <button onClick={() => setDeleteModal({ show: true, id: req.id })} className="p-3 bg-white text-rose-500 border border-rose-100 rounded-2xl shadow-sm hover:bg-rose-50 transition-all">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* MODAL DE CONFIRMAÇÃO CUSTOMIZADO */}
      {deleteModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl border border-slate-100 scale-in-center">
            <div className="flex flex-col items-center text-center">
              <div className="p-4 bg-rose-50 text-rose-500 rounded-full mb-4">
                <AlertTriangle size={32} />
              </div>
              <h2 className="text-xl font-black text-slate-900 uppercase italic">Excluir Lead?</h2>
              <p className="text-sm text-slate-500 mt-2 font-medium">Esta ação é irreversível e removerá todos os dados deste contato do CRM.</p>
              
              <div className="flex gap-3 mt-8 w-full">
                <button onClick={() => setDeleteModal({ show: false, id: null })} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase hover:bg-slate-200 transition-all">
                  Cancelar
                </button>
                <button onClick={handleDelete} className="flex-1 py-4 bg-rose-500 text-white rounded-2xl text-[10px] font-black uppercase shadow-lg shadow-rose-200 hover:bg-rose-600 transition-all">
                  Sim, Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}