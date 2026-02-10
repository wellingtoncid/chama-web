import { useState, useEffect } from 'react';
import { api } from '../../api/api';
import { 
  Flame, TrendingUp, Users, Edit3, 
  Download, Search, Calendar, Info, 
  MessageCircle, Loader2, Check, Trash2, X, AlertTriangle,
  History, User, Clock // Novos ícones
} from 'lucide-react';

export default function AdminPortalRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [savingId, setSavingId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  
  // Função para selecionar/deselecionar um lead
  const toggleSelect = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Função para selecionar todos os visíveis (filtrados)
  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map(r => r.id));
    }
  };

  // Função para arquivar vários leads de uma vez
  const handleBulkArchive = async () => {
    if (!window.confirm(`Deseja arquivar ${selectedIds.length} leads selecionados?`)) return;
    
    setLoading(true);
    try {
      // Fazemos um loop de promessas ou uma rota nova no back (o ideal é uma rota nova, mas usaremos o que você tem)
      await Promise.all(selectedIds.map(id => 
        api.post('admin-update-lead', { id, action: 'delete' })
      ));
      
      setRequests(prev => prev.filter(r => !selectedIds.includes(r.id)));
      setSelectedIds([]);
      alert("Leads arquivados com sucesso!");
    } catch (error) {
      alert("Erro ao processar exclusão em massa.");
    } finally {
      setLoading(false);
    }
  };

  // --- NOVOS ESTADOS ---
  const [deleteModal, setDeleteModal] = useState<{show: boolean, id: number | null}>({ show: false, id: null });
  const [historyDrawer, setHistoryDrawer] = useState<{show: boolean, notes: any[], leadId: number | null, title: string}>({ 
    show: false, notes: [], leadId: null, title: '' 
  });

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await api.get('admin-portal-requests');
      const data = Array.isArray(response.data.data) ? response.data.data : [];
      setRequests(data);
    } catch (error) { 
      console.error("Erro ao carregar dados", error); 
      setRequests([]); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  // --- NOVA FUNÇÃO: BUSCAR HISTÓRICO ---
  const openHistory = async (req: any) => {
    try {
      const response = await api.get(`admin-lead-history?id=${req.id}`);
      setHistoryDrawer({ 
        show: true, 
        notes: response.data.data || [], 
        leadId: req.id,
        title: req.title || 'Lead'
      });
    } catch (error) {
      alert("Erro ao carregar histórico de interações.");
    }
  };

  const getWhatsAppLink = (req: any) => {
    const phone = req.contact_info?.replace(/\D/g, '');
    const saudacao = req.type === 'business_ad' 
      ? `Olá! Sou da equipe comercial do Portal de Fretes. Recebi seu interesse em anunciar a empresa *${req.title}*. Podemos conversar?`
      : `Olá! Sou do suporte do Portal de Fretes. Recebi sua mensagem sobre *${req.title || 'sua sugestão'}*. Como posso ajudar?`;
    
    return `https://wa.me/55${phone}?text=${encodeURIComponent(saudacao)}`;
  };

  // --- FUNÇÃO ATUALIZADA: ENVIA 'NEW_NOTE' PARA O HISTÓRICO ---
  const handleUpdateDetails = async (id: number, status: string, notes: string, isNewNote = false) => {
    setSavingId(id);
    try {
      await api.post('admin-update-lead', { 
        id, 
        status, 
        admin_notes: notes,
        new_note: isNewNote ? notes : null // Se for alteração de texto, o back cria um registro na timeline
      });

      setRequests(prev => prev.map(r => 
        r.id === id ? { ...r, status, admin_notes: notes, last_contact: new Date().toISOString() } : r
      ));
      
      // Se a timeline estiver aberta para este lead, recarrega os dados dela
     if (isNewNote && historyDrawer.leadId === id) {
          // Adicione um pequeno delay para o banco respirar
          setTimeout(async () => {
              const response = await api.get(`admin-lead-history?id=${id}`);
              // Forçamos a atualização do estado das notas
              setHistoryDrawer(prev => ({ ...prev, notes: response.data.data || [] }));
          }, 300);
      }

      setTimeout(() => setSavingId(null), 1000);
    } catch (error) {
      console.error("Erro ao salvar", error);
      setSavingId(null);
      alert("Erro ao salvar alterações.");
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    try {
      await api.post('admin-update-lead', { id: deleteModal.id, action: 'delete' });
      setRequests(prev => prev.filter(r => r.id !== deleteModal.id));
      setDeleteModal({ show: false, id: null });
    } catch (error) {
      alert("Erro ao arquivar lead.");
    }
  };

  const filtered = requests.filter(req => {
    const matchesTab = activeTab === 'all' ? true : req.type === activeTab;
    const matchesSearch = (req.title?.toLowerCase().includes(searchTerm.toLowerCase())) || 
                          (req.contact_info?.includes(searchTerm));
    const matchesDate = dateFilter ? req.created_at.startsWith(dateFilter) : true;
    return matchesTab && matchesSearch && matchesDate;
  });

  const exportToCSV = () => {
    const headers = ["Data,Tipo,Empresa,Contato,Status,Prioridade,Notas Internas\n"];
    const rows = filtered.map(r => 
      `${new Date(r.created_at).toLocaleDateString()},${r.type},${r.title},${r.contact_info},${r.status},${r.priority === 1 ? 'Alta' : 'Normal'},"${r.admin_notes || ''}"`
    );
    const blob = new Blob([headers.concat(rows).join("\n")], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads_portal_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const stats = {
    total: requests.length,
    newLeads: requests.filter(r => r.status === 'pending' && r.type === 'business_ad').length,
    hotLeads: requests.filter(r => r.priority === 1).length
  };

  const getTimeStatusColor = (lastContact: string) => {
    if (!lastContact) return 'bg-slate-300';
    const diff = (new Date().getTime() - new Date(lastContact).getTime()) / (1000 * 60 * 60 * 24);
    if (diff < 1) return 'bg-emerald-500'; // Menos de 24h
    if (diff < 3) return 'bg-orange-500';  // Entre 1 e 3 dias
    return 'bg-rose-500';                 // Lead esquecido
  };

  const handleWhatsAppClick = async (req: any) => {
    // 1. Abre o WhatsApp em uma nova aba imediatamente
    window.open(getWhatsAppLink(req), '_blank');

    // 2. Registra na timeline que o admin iniciou o contato
    try {
      await api.post('admin-update-lead', { 
        id: req.id, 
        status: req.status, 
        admin_notes: req.admin_notes,
        new_note: "Iniciou contato via WhatsApp" 
      });
      
      // Se o histórico estiver aberto, atualiza a lista
      if (historyDrawer.show && historyDrawer.leadId === req.id) {
        const response = await api.get(`admin-lead-history?id=${req.id}`);
        setHistoryDrawer(prev => ({ ...prev, notes: response.data.data }));
      }
    } catch (e) {
      console.error("Erro ao registrar clique no WhatsApp");
    }
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans">
      
      {/* DASHBOARD DE MÉTRICAS */}
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
        
        {/* CONTROLES E FILTROS */}
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

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-4 mb-4 p-4 bg-blue-600 rounded-2xl shadow-lg animate-in fade-in slide-in-from-top-4">
            <p className="text-white text-[10px] font-black uppercase tracking-widest ml-2">
              {selectedIds.length} selecionados
            </p>
            <button 
              onClick={handleBulkArchive}
              className="ml-auto flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase hover:bg-rose-600 transition-all"
            >
              <Trash2 size={14} /> Arquivar Seleção
            </button>
            <button 
              onClick={() => setSelectedIds([])}
              className="text-white/70 hover:text-white px-2"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* BUSCA */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative col-span-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input type="text" placeholder="Buscar por nome, contato ou descrição..." className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl text-xs font-bold border-none focus:ring-2 focus:ring-blue-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input type="date" className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl text-xs font-bold border-none focus:ring-2 focus:ring-blue-500" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
          </div>
        </div>

        {/* TABELA */}
        <div className="overflow-x-auto">
          {loading ? (
             <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" /></div>
          ) : (
            <table className="w-full border-separate border-spacing-y-3">
              <thead>
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">
                  <th className="pb-2 px-6 text-left w-10">
                    <input 
                      type="checkbox" 
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                      checked={selectedIds.length === filtered.length && filtered.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="pb-2 px-6 text-left">Lead / Empresa</th>
                  <th className="pb-2 px-4 text-left">Histórico & Status</th>
                  <th className="pb-2 px-4 text-left">Notas CRM (Interno)</th>
                  <th className="pb-2 px-6 text-right">Ação</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((req) => (
                  <tr key={req.id} className={`group transition-all border-l-4 ${req.priority === 1 ? 'border-l-orange-500 bg-white' : 'border-l-transparent bg-slate-50/40'} shadow-sm`}>
                   {/* 1. NOVO TD: CHECKBOX (Ele agora assume o arredondamento da esquerda) */}
                  <td className="py-5 px-6 rounded-l-[2rem] border-y border-l border-slate-100">
                    <input 
                      type="checkbox" 
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                      checked={selectedIds.includes(req.id)}
                      onChange={() => toggleSelect(req.id)}
                    />
                  </td>

                  {/* 2. TD LEAD/EMPRESA: Removido o 'rounded-l-[2rem]' e 'border-l' para não conflitar com o checkbox */}
                  <td className="py-5 px-6 border-y border-slate-100">
                    <div className="flex items-center gap-2">
                      {/* Bolinha de Status de Tempo: Verde (recente), Laranja ou Vermelho (esquecido) */}
                      <div className={`w-2 h-2 rounded-full shrink-0 ${getTimeStatusColor(req.last_contact)}`} title="Status de contato" />
                      <p className="text-xs font-black text-slate-800 uppercase italic">{req.title || 'Lead s/ nome'}</p>
                    {req.priority === 1 && <Flame size={12} className="text-orange-500 fill-orange-500 animate-pulse" />}
                    </div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Entrada: {new Date(req.created_at).toLocaleDateString()}</p>

                    {req.description && (
                      <div className="mt-2 p-2 bg-blue-50/50 rounded-lg border border-blue-100/50 max-w-xs">
                        <p className="text-[10px] text-slate-600 italic leading-tight line-clamp-2">
                          "{req.description}"
                        </p>
                      </div>
                    )}
                  </td>

                    <td className="py-5 px-4 border-y border-slate-100">
                      <div className="flex items-center gap-3">
                        <select 
                          value={req.status} 
                          onChange={(e) => handleUpdateDetails(req.id, e.target.value, req.admin_notes)} 
                          className={`text-[9px] font-black uppercase border-none rounded-full py-1.5 px-3 focus:ring-0 shadow-sm ${
                            req.status === 'pending' ? 'bg-orange-500 text-white' : 
                            req.status === 'in_negotiation' ? 'bg-blue-500 text-white' : 'bg-slate-300'
                          }`}
                        >
                          <option value="pending">Novo</option>
                          <option value="in_negotiation">Em Negociação</option>
                          <option value="analyzed">Finalizado</option>
                        </select>
                        <button onClick={() => openHistory(req)} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all" title="Ver Linha do Tempo">
                            <History size={16} />
                        </button>
                      </div>
                    </td>

                    <td className="py-5 px-4 border-y border-slate-100">
                      <div className="flex items-center gap-2 bg-white/50 px-3 py-2 rounded-xl border border-slate-200 focus-within:bg-white transition-all">
                        {savingId === req.id ? <Loader2 size={12} className="animate-spin" /> : <Edit3 size={12} className="text-slate-400" />}
                        <input 
                          type="text" 
                          className="bg-transparent border-none text-[10px] font-bold p-0 focus:ring-0 w-full" 
                          defaultValue={req.admin_notes} 
                          placeholder="Adicionar nota..."
                          onBlur={(e) => {
                              if(e.target.value !== req.admin_notes) {
                                  handleUpdateDetails(req.id, req.status, e.target.value, true);
                              }
                          }} 
                        />
                      </div>
                    </td>

                    <td className="py-5 px-6 text-right rounded-r-[2rem] border-y border-r border-slate-100">
                      <div className="flex items-center justify-end gap-2">
                          {/* BOTÃO DO WHATSAPP ATUALIZADO */}
                          <button 
                              onClick={() => handleWhatsAppClick(req)} 
                              className="p-3 bg-emerald-500 text-white rounded-2xl shadow-lg hover:scale-110 transition-all"
                              title="Chamar no WhatsApp"
                          >
                              <MessageCircle size={18} />
                          </button>

                          <button 
                              onClick={() => setDeleteModal({ show: true, id: req.id })} 
                              className="p-3 bg-white text-rose-500 border border-rose-100 rounded-2xl shadow-sm hover:bg-rose-50 transition-all"
                          >
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

      {/* --- DRAWER DE HISTÓRICO (TIMELINE) --- */}
      {historyDrawer.show && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setHistoryDrawer({...historyDrawer, show: false})} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
            
            {/* CABEÇALHO */}
            <div className="p-6 border-b bg-slate-50 flex justify-between items-center">
                <div>
                    <h2 className="text-sm font-black text-slate-900 uppercase italic flex items-center gap-2">
                        <History size={18} className="text-blue-500" /> Detalhes do Lead
                    </h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{historyDrawer.title}</p>
                </div>
                <button onClick={() => setHistoryDrawer({...historyDrawer, show: false})} className="p-2 hover:bg-slate-200 rounded-full transition-all">
                    <X size={20} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                
                {/* 1. MENSAGEM ORIGINAL (O que o usuário enviou) */}
                {requests.find(r => r.id === historyDrawer.leadId)?.description && (
                  <section>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest flex items-center gap-2">
                      <MessageCircle size={14} /> Mensagem Original
                    </h3>
                    <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 text-xs text-slate-700 leading-relaxed italic">
                      "{requests.find(r => r.id === historyDrawer.leadId)?.description}"
                    </div>
                  </section>
                )}

                {/* 2. NOTAS CRM (Campo Editável / Fixo) */}
                <section>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest flex items-center gap-2">
                    <Edit3 size={14} /> Notas Internas (CRM)
                  </h3>
                  <textarea 
                    className="w-full bg-slate-50 border-slate-200 rounded-2xl text-xs font-medium p-4 focus:ring-blue-500 focus:bg-white transition-all min-h-[100px]"
                    placeholder="Digite observações permanentes sobre este lead..."
                    // Busca a versão mais atualizada do lead no estado principal
                    value={requests.find(r => r.id === historyDrawer.leadId)?.admin_notes || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setRequests(prev => prev.map(r => r.id === historyDrawer.leadId ? {...r, admin_notes: val} : r));
                    }}
                    onBlur={(e) => {
                      const lead = requests.find(r => r.id === historyDrawer.leadId);
                      if(lead) {
                        handleUpdateDetails(lead.id, lead.status, e.target.value, false);
                      }
                    }}
                  />
                </section>

                {/* 3. TIMELINE (Histórico de Interações) */}
                <section>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest flex items-center gap-2">
                    <Clock size={14} /> Linha do Tempo
                  </h3>
                  <div className="space-y-6 border-l-2 border-slate-100 ml-2">
                    {historyDrawer.notes.length === 0 ? (
                      <p className="pl-6 text-[10px] font-bold text-slate-400 uppercase italic">
                        Nenhuma interação registrada.
                      </p>
                    ) : (
                      historyDrawer.notes.map((note, idx) => {
                        // Verifica se a nota foi gerada automaticamente pelo sistema
                        const isSystem = note.author_name === 'Sistema';

                        return (
                          <div key={idx} className="relative pl-6 pb-2">
                            {/* Bolinha na linha do tempo: Cinza para sistema, Azul para humano */}
                            <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 shadow-sm ${
                              isSystem ? 'border-slate-300' : 'border-blue-500'
                            }`} />
                            
                            <div className="flex justify-between items-center mb-1">
                              <span className={`text-[10px] font-black uppercase flex items-center gap-1 ${
                                isSystem ? 'text-slate-400' : 'text-slate-800'
                              }`}>
                                {isSystem ? <TrendingUp size={10} /> : <User size={10} />} 
                                {note.author_name}
                              </span>
                              <span className="text-[9px] text-slate-400 font-bold">
                                {new Date(note.created_at).toLocaleString('pt-BR')}
                              </span>
                            </div>

                            {/* Balão de texto estilizado */}
                            <div className={`p-3 rounded-2xl rounded-tl-none border text-xs leading-relaxed transition-all ${
                              isSystem 
                                ? 'bg-slate-50 border-slate-100 text-slate-500 italic' 
                                : 'bg-white border-blue-50 text-slate-700 shadow-sm'
                            }`}>
                              {note.content}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </section>
            </div>

            {/* ADICIONAR NOVA NOTA AO HISTÓRICO */}
            <div className="p-6 bg-slate-50 border-t">
                <div className="relative">
                    <input 
                        type="text"
                        placeholder="Adicionar nova interação à timeline..."
                        className="w-full pl-4 pr-12 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500"
                        onKeyDown={(e) => {
                            if(e.key === 'Enter' && e.currentTarget.value.trim()) {
                                const lead = requests.find(r => r.id === historyDrawer.leadId);
                                handleUpdateDetails(lead.id, lead.status, e.currentTarget.value, true);
                                e.currentTarget.value = '';
                            }
                        }}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300">
                        <Check size={16} />
                    </div>
                </div>
                <p className="text-[8px] font-black text-slate-400 uppercase text-center mt-4 italic">Pressione Enter para salvar na timeline</p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO (SOFT DELETE / ARQUIVAR) */}
      {deleteModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="p-4 bg-rose-50 text-rose-500 rounded-full mb-4">
                <AlertTriangle size={32} />
              </div>
              <h2 className="text-xl font-black text-slate-900 uppercase italic">Arquivar Lead?</h2>
              <p className="text-sm text-slate-500 mt-2 font-medium">O lead sairá da sua lista ativa mas permanecerá salvo no banco de dados.</p>
              
              <div className="flex gap-3 mt-8 w-full">
                <button onClick={() => setDeleteModal({ show: false, id: null })} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase hover:bg-slate-200 transition-all">
                  Cancelar
                </button>
                <button onClick={handleDelete} className="flex-1 py-4 bg-rose-500 text-white rounded-2xl text-[10px] font-black uppercase shadow-lg hover:bg-rose-600 transition-all">
                  Sim, Arquivar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}