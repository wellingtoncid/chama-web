import { useState, useEffect } from 'react';
import { api } from '../../api/api';
import { 
  FileText, Search, Loader2, MapPin, Package, Truck, 
  Warehouse, Box, X, Send, Trash2, Edit, Eye, CheckCircle, Plus
} from 'lucide-react';
import Swal from 'sweetalert2';

interface Quote {
  id: number;
  shipper_id: number;
  type: 'frete' | 'armazenagem' | 'operacao_logistica' | 'cross_docking';
  title: string;
  origin_city?: string;
  dest_city?: string;
  commodity_type?: string;
  weight?: string;
  volume?: string;
  description?: string;
  status: 'open' | 'closed' | 'expired';
  created_at: string;
  shipper_name?: string;
  shipper_email?: string;
  responses_count?: number;
}

interface QuoteResponse {
  id: number;
  quote_id: number;
  company_id: number;
  price: string;
  delivery_time?: string;
  conditions?: string;
  notes?: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  company_name?: string;
}

const quoteTypes = [
  { value: 'frete', label: 'Frete', icon: Truck },
  { value: 'armazenagem', label: 'Armazenagem', icon: Warehouse },
  { value: 'operacao_logistica', label: 'Op. Logística', icon: Package },
  { value: 'cross_docking', label: 'Cross Docking', icon: Box },
];

const statusColors: Record<string, string> = {
  open: 'bg-green-100 text-green-700',
  closed: 'bg-slate-100 text-slate-600',
  expired: 'bg-red-100 text-red-700'
};

const statusLabels: Record<string, string> = {
  open: 'Aberta',
  closed: 'Fechada',
  expired: 'Expirada'
};

export default function QuotesManager() {
  const [loading, setLoading] = useState(true);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [responses, setResponses] = useState<QuoteResponse[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  
  const [filter, setFilter] = useState({ status: 'all', type: 'all', search: '' });
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [createData, setCreateData] = useState({
    user_id: '', type: 'frete', title: '', origin_city: '', dest_city: '', 
    commodity_type: '', weight: '', volume: '', description: ''
  });
  const [responseData, setResponseData] = useState({ company_id: '', price: '', delivery_time: '', conditions: '', notes: '' });
  const [companies, setCompanies] = useState<{id: number, name: string}[]>([]);

  useEffect(() => { loadQuotes(); }, [filter]);
  useEffect(() => { if (selectedQuote) loadResponses(); }, [selectedQuote]);

  const loadQuotes = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/quotes', { params: filter });
      if (res.data?.success) {
        setQuotes(res.data.data || []);
      }
    } catch (e) {
      console.error("Erro ao carregar:", e);
    } finally {
      setLoading(false);
    }
  };

  const loadResponses = async () => {
    if (!selectedQuote) return;
    try {
      setLoadingDetail(true);
      const res = await api.get(`/admin/quotes/${selectedQuote.id}`);
      if (res.data?.success) {
        setResponses(res.data.data?.responses || []);
      }
    } catch (e) {
      console.error("Erro ao carregar respostas:", e);
    } finally {
      setLoadingDetail(false);
    }
  };

  const loadCompanies = async () => {
    try {
      const res = await api.get('/api/companies');
      if (res.data?.companies) {
        setCompanies(res.data.companies);
      }
    } catch (e) {
      console.error("Erro ao carregar empresas:", e);
    }
  };

  const handleCreate = async () => {
    if (!createData.title || !createData.type) {
      return Swal.fire({ icon: 'warning', title: 'Preencha os campos obrigatórios' });
    }
    try {
      setSaving(true);
      const res = await api.post('/admin/quotes', createData);
      if (res.data?.success) {
        Swal.fire({ icon: 'success', title: 'Cotação criada!', timer: 1500 });
        setShowCreateModal(false);
        setCreateData({ user_id: '', type: 'frete', title: '', origin_city: '', dest_city: '', commodity_type: '', weight: '', volume: '', description: '' });
        loadQuotes();
      }
    } catch (e) {
      Swal.fire({ icon: 'error', title: 'Erro' });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (quote: Quote) => {
    setEditData({
      title: quote.title,
      origin_city: quote.origin_city || '',
      dest_city: quote.dest_city || '',
      commodity_type: quote.commodity_type || '',
      weight: quote.weight || '',
      volume: quote.volume || '',
      description: quote.description || '',
      status: quote.status
    });
    setSelectedQuote(quote);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedQuote) return;
    try {
      setSaving(true);
      const res = await api.put(`/admin/quotes/${selectedQuote.id}`, editData);
      if (res.data?.success) {
        Swal.fire({ icon: 'success', title: 'Atualizado!', timer: 1500 });
        setShowEditModal(false);
        loadQuotes();
      }
    } catch (e) {
      Swal.fire({ icon: 'error', title: 'Erro' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Excluir cotação?',
      text: 'Esta ação não pode ser desfeita',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, excluir',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const res = await api.delete(`/admin/quotes/${id}`);
        if (res.data?.success) {
          Swal.fire({ icon: 'success', title: 'Excluído!', timer: 1500 });
          loadQuotes();
          if (selectedQuote?.id === id) setSelectedQuote(null);
        }
      } catch (e) {
        Swal.fire({ icon: 'error', title: 'Erro' });
      }
    }
  };

  const openResponseModal = () => {
    loadCompanies();
    setResponseData({ company_id: '', price: '', delivery_time: '', conditions: '', notes: '' });
    setShowResponseModal(true);
  };

  const handleResponse = async () => {
    if (!selectedQuote || !responseData.company_id || !responseData.price) {
      return Swal.fire({ icon: 'warning', title: 'Preencha os campos obrigatórios' });
    }
    try {
      setSaving(true);
      const res = await api.post(`/admin/quotes/${selectedQuote.id}/respond`, responseData);
      if (res.data?.success) {
        Swal.fire({ icon: 'success', title: 'Resposta enviada!', timer: 1500 });
        setShowResponseModal(false);
        loadResponses();
      }
    } catch (e) {
      Swal.fire({ icon: 'error', title: 'Erro' });
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const formatCurrency = (value: string) => {
    if (!value) return '-';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value));
  };

  const getTypeIcon = (type: string) => {
    const found = quoteTypes.find(t => t.value === type);
    const Icon = found?.icon || FileText;
    return <Icon size={14} />;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-[3rem] p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-2xl">
              <FileText size={28} />
            </div>
            <div>
              <h2 className="text-3xl font-black uppercase italic">Cotações</h2>
              <p className="text-indigo-100 text-sm font-medium">Gerenciamento de cotações da plataforma</p>
            </div>
          </div>
          <button 
            onClick={() => { loadCompanies(); setShowCreateModal(true); }}
            className="bg-white text-indigo-600 px-6 py-3 rounded-2xl font-black uppercase text-sm flex items-center gap-2 hover:bg-indigo-50 transition-all"
          >
            <Plus size={18} /> Nova Cotação
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-100">
          {[
            { value: 'all', label: 'Todos' },
            { value: 'open', label: 'Abertas' },
            { value: 'closed', label: 'Fechadas' },
            { value: 'expired', label: 'Expiradas' }
          ].map(f => (
            <button
              key={f.value}
              onClick={() => setFilter({...filter, status: f.value})}
              className={`px-4 py-2 rounded-xl font-bold text-xs uppercase transition-all ${
                filter.status === f.value ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-100">
          <select
            value={filter.type}
            onChange={(e) => setFilter({...filter, type: e.target.value})}
            className="px-4 py-2 rounded-xl font-bold text-xs uppercase bg-transparent outline-none"
          >
            <option value="all">Todos Tipos</option>
            {quoteTypes.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            placeholder="Buscar por título, empresa..."
            value={filter.search}
            onChange={(e) => setFilter({...filter, search: e.target.value})}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List */}
        <div className="lg:col-span-1 bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden">
          <div className="max-h-[700px] overflow-y-auto">
            {loading ? (
              <div className="p-8 flex justify-center">
                <Loader2 className="animate-spin text-indigo-500" size={32} />
              </div>
            ) : quotes.length === 0 ? (
              <div className="p-8 text-center">
                <FileText size={40} className="mx-auto mb-3 text-slate-300" />
                <p className="text-slate-500 font-medium">Nenhuma cotação</p>
              </div>
            ) : (
              quotes.map(quote => (
                <button
                  key={quote.id}
                  onClick={() => setSelectedQuote(quote)}
                  className={`w-full p-4 text-left border-b border-slate-50 hover:bg-slate-50 transition-colors ${
                    selectedQuote?.id === quote.id ? 'bg-indigo-50 border-l-4 border-l-indigo-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${statusColors[quote.status]}`}>
                        {statusLabels[quote.status]}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] font-black uppercase text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                        {getTypeIcon(quote.type)}
                        {quoteTypes.find(t => t.value === quote.type)?.label}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">#{quote.id}</span>
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm mb-1 line-clamp-1">{quote.title}</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                      {quote.shipper_name || quote.shipper_email}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      {quote.responses_count || 0} <Eye size={10} />
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Detail */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden min-h-[700px]">
          {selectedQuote ? (
            <>
              <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-black uppercase italic text-slate-800">{selectedQuote.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${statusColors[selectedQuote.status]}`}>
                        {statusLabels[selectedQuote.status]}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                      <span>{selectedQuote.shipper_name}</span>
                      <span>&lt;{selectedQuote.shipper_email}&gt;</span>
                      <span>{formatDate(selectedQuote.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEdit(selectedQuote)}
                      className="px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg font-bold text-xs uppercase hover:bg-indigo-100 transition-colors flex items-center gap-1"
                    >
                      <Edit size={14} /> Editar
                    </button>
                    <button 
                      onClick={() => handleDelete(selectedQuote.id)}
                      className="px-3 py-2 bg-red-50 text-red-600 rounded-lg font-bold text-xs uppercase hover:bg-red-100 transition-colors flex items-center gap-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4 space-y-4">
                {/* Quote Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-xl p-4">
                    <span className="text-[10px] font-black uppercase text-slate-400">Origem</span>
                    <p className="font-bold text-slate-800">{selectedQuote.origin_city || '-'}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <span className="text-[10px] font-black uppercase text-slate-400">Destino</span>
                    <p className="font-bold text-slate-800">{selectedQuote.dest_city || '-'}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <span className="text-[10px] font-black uppercase text-slate-400">Mercadoria</span>
                    <p className="font-bold text-slate-800">{selectedQuote.commodity_type || '-'}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <span className="text-[10px] font-black uppercase text-slate-400">Peso</span>
                    <p className="font-bold text-slate-800">{selectedQuote.weight ? `${selectedQuote.weight} kg` : '-'}</p>
                  </div>
                </div>

                {selectedQuote.description && (
                  <div className="bg-slate-50 rounded-xl p-4">
                    <span className="text-[10px] font-black uppercase text-slate-400">Descrição</span>
                    <p className="font-medium text-slate-700 text-sm mt-1">{selectedQuote.description}</p>
                  </div>
                )}

                {/* Responses */}
                <div className="border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-black uppercase text-slate-800">Respostas ({responses.length})</h4>
                    {selectedQuote.status === 'open' && (
                      <button 
                        onClick={openResponseModal}
                        className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold uppercase rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1"
                      >
                        <Send size={12} /> Responder
                      </button>
                    )}
                  </div>

                  {loadingDetail ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="animate-spin text-indigo-500" size={24} />
                    </div>
                  ) : responses.length === 0 ? (
                    <p className="text-slate-400 text-sm text-center py-4">Nenhuma resposta ainda</p>
                  ) : (
                    <div className="space-y-2">
                      {responses.map(resp => (
                        <div key={resp.id} className={`p-3 rounded-xl border ${
                          resp.status === 'accepted' ? 'border-green-200 bg-green-50' : 
                          resp.status === 'rejected' ? 'border-red-200 bg-red-50' : 
                          'border-slate-200'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-bold text-slate-800">{resp.company_name || `Empresa #${resp.company_id}`}</span>
                              <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                resp.status === 'accepted' ? 'bg-green-200 text-green-700' :
                                resp.status === 'rejected' ? 'bg-red-200 text-red-700' :
                                'bg-yellow-200 text-yellow-700'
                              }`}>
                                {resp.status === 'accepted' ? 'Aceita' : resp.status === 'rejected' ? 'Rejeitada' : 'Pendente'}
                              </span>
                            </div>
                            <span className="font-black text-indigo-600">{formatCurrency(resp.price)}</span>
                          </div>
                          {resp.delivery_time && (
                            <p className="text-xs text-slate-500 mt-1">Prazo: {resp.delivery_time}</p>
                          )}
                          {resp.notes && (
                            <p className="text-xs text-slate-400 mt-1">{resp.notes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400">
              <div className="text-center">
                <FileText size={48} className="mx-auto mb-3 opacity-50" />
                <p className="font-medium">Selecione uma cotação</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedQuote && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black uppercase italic text-slate-900">Editar Cotação</h3>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-slate-100 rounded-xl">
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Título</label>
                <input 
                  type="text"
                  value={editData.title}
                  onChange={(e) => setEditData({...editData, title: e.target.value})}
                  className="w-full p-3 rounded-xl border border-slate-200 font-bold text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Origem</label>
                  <input 
                    type="text"
                    value={editData.origin_city}
                    onChange={(e) => setEditData({...editData, origin_city: e.target.value})}
                    className="w-full p-3 rounded-xl border border-slate-200 font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Destino</label>
                  <input 
                    type="text"
                    value={editData.dest_city}
                    onChange={(e) => setEditData({...editData, dest_city: e.target.value})}
                    className="w-full p-3 rounded-xl border border-slate-200 font-bold text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Status</label>
                <select 
                  value={editData.status}
                  onChange={(e) => setEditData({...editData, status: e.target.value})}
                  className="w-full p-3 rounded-xl border border-slate-200 font-bold text-sm"
                >
                  <option value="open">Aberta</option>
                  <option value="closed">Fechada</option>
                  <option value="expired">Expirada</option>
                </select>
              </div>

              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black uppercase text-sm flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all disabled:opacity-50"
              >
                {saving ? <Loader2 className="animate-spin" size={18} /> : <Edit size={18} />}
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Response Modal */}
      {showResponseModal && selectedQuote && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-8 max-w-lg w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black uppercase italic text-slate-900">Responder como Admin</h3>
              <button onClick={() => setShowResponseModal(false)} className="p-2 hover:bg-slate-100 rounded-xl">
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="bg-yellow-50 rounded-xl p-3 mb-4">
              <p className="text-xs text-yellow-700 font-medium">
                Esta resposta será enviada em nome de uma empresa. Selecione qual empresa deseja representar.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Empresa *</label>
                <select 
                  value={responseData.company_id}
                  onChange={(e) => setResponseData({...responseData, company_id: e.target.value})}
                  className="w-full p-3 rounded-xl border border-slate-200 font-bold text-sm"
                >
                  <option value="">Selecione uma empresa</option>
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Preço (R$) *</label>
                <input 
                  type="number"
                  value={responseData.price}
                  onChange={(e) => setResponseData({...responseData, price: e.target.value})}
                  placeholder="0,00"
                  className="w-full p-3 rounded-xl border border-slate-200 font-bold text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Prazo</label>
                <input 
                  type="text"
                  value={responseData.delivery_time}
                  onChange={(e) => setResponseData({...responseData, delivery_time: e.target.value})}
                  placeholder="Ex: 5 dias úteis"
                  className="w-full p-3 rounded-xl border border-slate-200 font-bold text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Condições</label>
                <input 
                  type="text"
                  value={responseData.conditions}
                  onChange={(e) => setResponseData({...responseData, conditions: e.target.value})}
                  placeholder="Ex: Pagamento em 30 dias"
                  className="w-full p-3 rounded-xl border border-slate-200 font-bold text-sm"
                />
              </div>

              <button
                onClick={handleResponse}
                disabled={saving}
                className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black uppercase text-sm flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all disabled:opacity-50"
              >
                {saving ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                Enviar Resposta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black uppercase italic text-slate-900">Nova Cotação</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-100 rounded-xl">
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="bg-yellow-50 rounded-xl p-3 mb-4">
              <p className="text-xs text-yellow-700 font-medium">
                Crie uma cotação em nome de outro usuário ou deixe em branco para criar em seu próprio nome.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Criar em nome de</label>
                <select 
                  value={createData.user_id}
                  onChange={(e) => setCreateData({...createData, user_id: e.target.value})}
                  className="w-full p-3 rounded-xl border border-slate-200 font-bold text-sm"
                >
                  <option value="">Próprio (Admin)</option>
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Tipo *</label>
                <select 
                  value={createData.type}
                  onChange={(e) => setCreateData({...createData, type: e.target.value})}
                  className="w-full p-3 rounded-xl border border-slate-200 font-bold text-sm"
                >
                  {quoteTypes.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Título *</label>
                <input 
                  type="text"
                  value={createData.title}
                  onChange={(e) => setCreateData({...createData, title: e.target.value})}
                  placeholder="Descreva o serviço desejado"
                  className="w-full p-3 rounded-xl border border-slate-200 font-bold text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Origem</label>
                  <input 
                    type="text"
                    value={createData.origin_city}
                    onChange={(e) => setCreateData({...createData, origin_city: e.target.value})}
                    placeholder="Cidade/Estado"
                    className="w-full p-3 rounded-xl border border-slate-200 font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Destino</label>
                  <input 
                    type="text"
                    value={createData.dest_city}
                    onChange={(e) => setCreateData({...createData, dest_city: e.target.value})}
                    placeholder="Cidade/Estado"
                    className="w-full p-3 rounded-xl border border-slate-200 font-bold text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Descrição</label>
                <textarea 
                  value={createData.description}
                  onChange={(e) => setCreateData({...createData, description: e.target.value})}
                  placeholder="Detalhes adicionais..."
                  rows={3}
                  className="w-full p-3 rounded-xl border border-slate-200 font-bold text-sm resize-none"
                />
              </div>

              <button
                onClick={handleCreate}
                disabled={saving}
                className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black uppercase text-sm flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all disabled:opacity-50"
              >
                {saving ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                Criar Cotação
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
