import { useState, useEffect } from 'react';
import { 
  FileText, Plus, Loader2, Search, MapPin, Package, 
  Truck, Warehouse, Box, Clock, CheckCircle, X, Send,
  DollarSign, Calendar, Scale, ChevronRight
} from 'lucide-react';
import { api } from '../../api/api';
import Swal from 'sweetalert2';

interface Quote {
  id: number;
  shipper_id: number;
  type: 'frete' | 'armazenagem' | 'operacao_logistica' | 'cross_docking';
  title: string;
  origin_city?: string;
  dest_city?: string;
  commodity_type?: string;
  requires_insurance: number;
  weight?: string;
  cargo_value?: string;
  volume?: string;
  period_days?: number;
  pickup_date?: string;
  description?: string;
  status: 'open' | 'closed' | 'expired';
  winner_bid_id?: number;
  created_at: string;
  shipper_name?: string;
  responses?: QuoteResponse[];
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
  company_slug?: string;
}

const quoteTypes = [
  { value: 'frete', label: 'Frete', icon: Truck, desc: 'Transporte de cargas' },
  { value: 'armazenagem', label: 'Armazenagem', icon: Warehouse, desc: 'Armazenamento de mercadorias' },
  { value: 'operacao_logistica', label: 'Operação Logística', icon: Package, desc: 'Serviços logísticos completos' },
  { value: 'cross_docking', label: 'Cross Docking', icon: Box, desc: 'Descarga e distribuição direta' },
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

export default function QuotesPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'my-quotes' | 'available' | 'responses'>('my-quotes');
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userModule, setUserModule] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    type: 'frete',
    title: '',
    origin_city: '',
    dest_city: '',
    commodity_type: '',
    requires_insurance: 1,
    weight: '',
    cargo_value: '',
    volume: '',
    period_days: '',
    pickup_date: '',
    description: ''
  });

  const [responseData, setResponseData] = useState({
    price: '',
    delivery_time: '',
    conditions: '',
    notes: ''
  });

  useEffect(() => {
    checkModuleAndLoad();
  }, []);

  const checkModuleAndLoad = async () => {
    try {
      const res = await api.get('/user/usage');
      if (res.data?.success) {
        const modules = res.data.data?.active_modules || [];
        if (modules.includes('quotes')) {
          setUserModule('quotes');
        }
      }
    } catch (e) {
      console.error("Erro ao verificar módulos:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userModule) {
      loadQuotes();
    }
  }, [activeTab, userModule]);

  const loadQuotes = async () => {
    try {
      setLoading(true);
      let res;
      
      if (activeTab === 'my-quotes') {
        res = await api.get('/quotes');
      } else if (activeTab === 'available') {
        res = await api.get('/quotes/open');
      } else if (activeTab === 'responses') {
        res = await api.get('/quotes/responses/my');
      }

      if (res?.data?.success) {
        setQuotes(res.data.data || []);
      }
    } catch (e: any) {
      if (e.response?.status === 403) {
        Swal.fire({
          icon: 'warning',
          title: 'Módulo necessário',
          text: e.response.data?.message || 'Você precisa ativar um módulo de Cotações'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuote = async () => {
    if (!formData.title.trim()) {
      return Swal.fire({ icon: 'warning', title: 'Campo obrigatório', text: 'Preencha o título' });
    }

    try {
      setSaving(true);
      const res = await api.post('/quotes', formData);
      
      if (res.data?.success) {
        Swal.fire({ icon: 'success', title: 'Cotação criada!', timer: 2000 });
        setShowCreateModal(false);
        setFormData({
          type: 'frete',
          title: '',
          origin_city: '',
          dest_city: '',
          commodity_type: '',
          requires_insurance: 1,
          weight: '',
          cargo_value: '',
          volume: '',
          period_days: '',
          pickup_date: '',
          description: ''
        });
        loadQuotes();
      }
    } catch (e: any) {
      Swal.fire({ icon: 'error', title: 'Erro', text: e.response?.data?.message || 'Não foi possível criar' });
    } finally {
      setSaving(false);
    }
  };

  const handleRespondQuote = async () => {
    if (!selectedQuote || !responseData.price) {
      return Swal.fire({ icon: 'warning', title: 'Campo obrigatório', text: 'Preencha o preço' });
    }

    try {
      setSaving(true);
      const res = await api.post(`/quotes/${selectedQuote.id}/respond`, responseData);
      
      if (res.data?.success) {
        Swal.fire({ icon: 'success', title: 'Resposta enviada!', timer: 2000 });
        setShowResponseModal(false);
        setResponseData({ price: '', delivery_time: '', conditions: '', notes: '' });
        loadQuotes();
      }
    } catch (e: any) {
      Swal.fire({ icon: 'error', title: 'Erro', text: e.response?.data?.message || 'Não foi possível responder' });
    } finally {
      setSaving(false);
    }
  };

  const handleAcceptResponse = async (quoteId: number, responseId: number) => {
    const result = await Swal.fire({
      title: 'Aceitar resposta?',
      text: 'Esta ação fechará a cotação',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sim, aceitar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const res = await api.post(`/quotes/${quoteId}/accept`, { response_id: responseId });
        if (res.data?.success) {
          Swal.fire({ icon: 'success', title: 'Resposta aceita!', timer: 2000 });
          loadQuotes();
        }
      } catch (e) {
        Swal.fire({ icon: 'error', title: 'Erro' });
      }
    }
  };

  const getQuoteTypeLabel = (type: string) => {
    return quoteTypes.find(t => t.value === type)?.label || type;
  };

  const getQuoteTypeIcon = (type: string) => {
    const Icon = quoteTypes.find(t => t.value === type)?.icon || FileText;
    return <Icon size={16} />;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (value: string) => {
    if (!value) return '-';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value));
  };

  if (loading) return (
    <div className="p-20 flex flex-col items-center justify-center animate-pulse">
      <Loader2 className="animate-spin text-emerald-500 mb-4" size={48} />
      <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Carregando...</span>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-[3rem] p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-2xl">
              <FileText size={28} />
            </div>
            <div>
              <h2 className="text-3xl font-black uppercase italic">Cotações</h2>
              <p className="text-emerald-100 text-sm font-medium">Gerencie suas solicitações</p>
            </div>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-white text-emerald-600 px-6 py-3 rounded-2xl font-black uppercase text-sm flex items-center gap-2 hover:bg-emerald-50 transition-all"
          >
            <Plus size={18} /> Nova Cotação
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-white p-1.5 rounded-2xl border border-slate-100 w-fit">
        {[
          { key: 'my-quotes', label: 'Minhas Cotações' },
          { key: 'available', label: 'Disponíveis' },
          { key: 'responses', label: 'Minhas Respostas' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-6 py-2 rounded-xl font-bold text-sm uppercase transition-all ${
              activeTab === tab.key 
                ? 'bg-emerald-600 text-white' 
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Quotes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quotes.length === 0 ? (
          <div className="col-span-full bg-white rounded-[2rem] p-12 text-center border border-slate-100">
            <FileText size={48} className="mx-auto mb-3 text-slate-300" />
            <p className="text-slate-500 font-medium">Nenhuma cotação encontrada</p>
          </div>
        ) : (
          quotes.map(quote => (
            <div 
              key={quote.id}
              className="bg-white rounded-[2rem] border border-slate-100 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${statusColors[quote.status]}`}>
                    {statusLabels[quote.status]}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-black uppercase text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                    {getQuoteTypeIcon(quote.type)}
                    {getQuoteTypeLabel(quote.type)}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400">#{quote.id}</span>
              </div>

              <h3 className="font-bold text-slate-800 mb-2 line-clamp-1">{quote.title}</h3>

              {(quote.origin_city || quote.dest_city) && (
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                  <MapPin size={12} />
                  {quote.origin_city && <span>{quote.origin_city}</span>}
                  {quote.origin_city && quote.dest_city && <span>→</span>}
                  {quote.dest_city && <span>{quote.dest_city}</span>}
                </div>
              )}

              {quote.commodity_type && (
                <p className="text-xs text-slate-400 mb-2">Mercadoria: {quote.commodity_type}</p>
              )}

              {quote.weight && (
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <Scale size={12} />
                  <span>{quote.weight} kg</span>
                </div>
              )}

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                <span className="text-[10px] text-slate-400">{formatDate(quote.created_at)}</span>
                
                {activeTab === 'available' && quote.status === 'open' && (
                  <button
                    onClick={() => {
                      setSelectedQuote(quote);
                      setShowResponseModal(true);
                    }}
                    className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-bold uppercase rounded-lg hover:bg-emerald-600 transition-colors"
                  >
                    Responder
                  </button>
                )}

                {activeTab === 'my-quotes' && quote.responses && quote.responses.length > 0 && (
                  <span className="text-xs font-bold text-emerald-600">
                    {quote.responses.length} resposta(s)
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black uppercase italic text-slate-900">Nova Cotação</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-100 rounded-xl">
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Tipo de Cotação</label>
                <div className="grid grid-cols-2 gap-2">
                  {quoteTypes.map(type => (
                    <button
                      key={type.value}
                      onClick={() => setFormData({...formData, type: type.value})}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        formData.type === type.value 
                          ? 'border-emerald-500 bg-emerald-50' 
                          : 'border-slate-200 hover:border-emerald-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <type.icon size={18} className={formData.type === type.value ? 'text-emerald-600' : 'text-slate-400'} />
                        <span className="font-bold text-sm">{type.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Título *</label>
                <input 
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Descreva o serviço desejado"
                  className="w-full p-3 rounded-xl border border-slate-200 font-bold text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Cidade Origem</label>
                  <input 
                    type="text"
                    value={formData.origin_city}
                    onChange={(e) => setFormData({...formData, origin_city: e.target.value})}
                    placeholder="Cidade/Estado"
                    className="w-full p-3 rounded-xl border border-slate-200 font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Cidade Destino</label>
                  <input 
                    type="text"
                    value={formData.dest_city}
                    onChange={(e) => setFormData({...formData, dest_city: e.target.value})}
                    placeholder="Cidade/Estado"
                    className="w-full p-3 rounded-xl border border-slate-200 font-bold text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Mercadoria</label>
                  <input 
                    type="text"
                    value={formData.commodity_type}
                    onChange={(e) => setFormData({...formData, commodity_type: e.target.value})}
                    placeholder="Ex: Eletrônicos, Móveis..."
                    className="w-full p-3 rounded-xl border border-slate-200 font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Peso (kg)</label>
                  <input 
                    type="text"
                    value={formData.weight}
                    onChange={(e) => setFormData({...formData, weight: e.target.value})}
                    placeholder="Ex: 500"
                    className="w-full p-3 rounded-xl border border-slate-200 font-bold text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Valor Carga (R$)</label>
                  <input 
                    type="text"
                    value={formData.cargo_value}
                    onChange={(e) => setFormData({...formData, cargo_value: e.target.value})}
                    placeholder="Ex: 10000"
                    className="w-full p-3 rounded-xl border border-slate-200 font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Volume</label>
                  <input 
                    type="text"
                    value={formData.volume}
                    onChange={(e) => setFormData({...formData, volume: e.target.value})}
                    placeholder="Ex: 2 pallets"
                    className="w-full p-3 rounded-xl border border-slate-200 font-bold text-sm"
                  />
                </div>
              </div>

              {formData.type === 'armazenagem' && (
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Período (dias)</label>
                  <input 
                    type="number"
                    value={formData.period_days}
                    onChange={(e) => setFormData({...formData, period_days: e.target.value})}
                    placeholder="Quantos dias?"
                    className="w-full p-3 rounded-xl border border-slate-200 font-bold text-sm"
                  />
                </div>
              )}

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Descrição</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Detalhes adicionais..."
                  rows={3}
                  className="w-full p-3 rounded-xl border border-slate-200 font-bold text-sm resize-none"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={formData.requires_insurance === 1}
                  onChange={(e) => setFormData({...formData, requires_insurance: e.target.checked ? 1 : 0})}
                  className="w-4 h-4 rounded border-slate-300 text-emerald-600"
                />
                <span className="text-sm font-medium text-slate-600">Requer seguro</span>
              </label>

              <button
                onClick={handleCreateQuote}
                disabled={saving}
                className="w-full py-4 bg-emerald-500 text-white rounded-xl font-black uppercase text-sm flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all disabled:opacity-50"
              >
                {saving ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                Criar Cotação
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
              <h3 className="text-xl font-black uppercase italic text-slate-900">Responder Cotação</h3>
              <button onClick={() => setShowResponseModal(false)} className="p-2 hover:bg-slate-100 rounded-xl">
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 mb-4">
              <h4 className="font-bold text-slate-800">{selectedQuote.title}</h4>
              <p className="text-xs text-slate-500 mt-1">
                {selectedQuote.origin_city} → {selectedQuote.dest_city}
              </p>
            </div>

            <div className="space-y-4">
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
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Prazo de Entrega</label>
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

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Observações</label>
                <textarea 
                  value={responseData.notes}
                  onChange={(e) => setResponseData({...responseData, notes: e.target.value})}
                  placeholder="Detalhes adicionais..."
                  rows={2}
                  className="w-full p-3 rounded-xl border border-slate-200 font-bold text-sm resize-none"
                />
              </div>

              <button
                onClick={handleRespondQuote}
                disabled={saving}
                className="w-full py-4 bg-emerald-500 text-white rounded-xl font-black uppercase text-sm flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all disabled:opacity-50"
              >
                {saving ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                Enviar Resposta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
