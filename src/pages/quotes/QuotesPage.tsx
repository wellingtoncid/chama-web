import { useState, useEffect } from 'react';
import {
  FileText, Plus, MapPin, Package,
  Truck, Warehouse, Box, X, Send,
  Scale, ChevronRight, AlertCircle, CheckCircle, Loader2
} from 'lucide-react';
import { api } from '../../api/api';
import { Button } from '../../components/ui/Button';
import DashboardShell from '../../components/layout/DashboardShell';
import ConfirmModal from '../../components/shared/ConfirmModal';

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
  open: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  closed: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  expired: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const statusLabels: Record<string, string> = {
  open: 'Aberta',
  closed: 'Fechada',
  expired: 'Expirada',
};

const fmtRelative = (dateStr: string) => {
  const now = Date.now();
  const d = new Date(dateStr).getTime();
  const diffDays = Math.floor((now - d) / 86400000);
  if (diffDays === 0) {
    const h = Math.floor((now - d) / 3600000);
    if (h === 0) {
      const m = Math.floor((now - d) / 60000);
      return m <= 1 ? 'agora' : `${m}min atrás`;
    }
    return `hoje ${new Date(dateStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  }
  if (diffDays === 1) return 'ontem';
  if (diffDays < 7) return `${diffDays} dias atrás`;
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
};

const fmtFull = (s: string) =>
  s ? new Date(s).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';

export default function QuotesPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'my-quotes' | 'available' | 'responses'>('my-quotes');
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userModule, setUserModule] = useState<string | null>(null);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<'success' | 'error' | 'warning'>('success');
  const [confirmAccept, setConfirmAccept] = useState<{ quoteId: number; responseId: number } | null>(null);

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

  useEffect(() => { checkModuleAndLoad(); }, []);

  const showAlert = (msg: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setAlertMsg(msg);
    setAlertType(type);
    setTimeout(() => setAlertMsg(null), 3000);
  };

  const checkModuleAndLoad = async () => {
    try {
      const res = await api.get('/user/usage');
      if (res.data?.success) {
        const modules = res.data.data?.active_modules || [];
        if (modules.includes('quotes')) setUserModule('quotes');
      }
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (userModule) loadQuotes(); }, [activeTab, userModule]);

  const loadQuotes = async () => {
    try {
      setLoading(true);
      let res;
      if (activeTab === 'my-quotes') res = await api.get('/quotes');
      else if (activeTab === 'available') res = await api.get('/quotes/open');
      else if (activeTab === 'responses') res = await api.get('/quotes/responses/my');
      if (res?.data?.success) setQuotes(res.data.data || []);
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  };

  const handleCreateQuote = async () => {
    if (!formData.title.trim()) return showAlert('Preencha o título', 'warning');
    try {
      setSaving(true);
      const res = await api.post('/quotes', formData);
      if (res.data?.success) {
        showAlert('Cotação criada!', 'success');
        setShowCreateModal(false);
        setFormData({
          type: 'frete', title: '', origin_city: '', dest_city: '', commodity_type: '',
          requires_insurance: 1, weight: '', cargo_value: '', volume: '', period_days: '', pickup_date: '', description: ''
        });
        loadQuotes();
      }
    } catch (e: any) {
      showAlert(e.response?.data?.message || 'Não foi possível criar', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleRespondQuote = async () => {
    if (!selectedQuote || !responseData.price) return showAlert('Preencha o preço', 'warning');
    try {
      setSaving(true);
      const res = await api.post(`/quotes/${selectedQuote.id}/respond`, responseData);
      if (res.data?.success) {
        showAlert('Resposta enviada!', 'success');
        setShowResponseModal(false);
        setResponseData({ price: '', delivery_time: '', conditions: '', notes: '' });
        loadQuotes();
      }
    } catch (e: any) {
      showAlert(e.response?.data?.message || 'Não foi possível responder', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAcceptResponse = async () => {
    if (!confirmAccept) return;
    try {
      const res = await api.post(`/quotes/${confirmAccept.quoteId}/accept`, { response_id: confirmAccept.responseId });
      if (res.data?.success) {
        showAlert('Resposta aceita!', 'success');
        loadQuotes();
      }
    } catch {
      showAlert('Erro ao aceitar resposta', 'error');
    } finally {
      setConfirmAccept(null);
    }
  };

  const getQuoteTypeLabel = (type: string) => quoteTypes.find(t => t.value === type)?.label || type;
  const getQuoteTypeIcon = (type: string) => {
    const Icon = quoteTypes.find(t => t.value === type)?.icon || FileText;
    return <Icon size={16} />;
  };

  // Toast simples
  const AlertToast = () => {
    if (!alertMsg) return null;
    const colors = {
      success: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
      error: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
      warning: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
    };
    return (
      <div className={`fixed top-6 right-6 z-[60] flex items-center gap-2 px-4 py-3 rounded-2xl border shadow-lg animate-in slide-in-from-right-4 duration-300 ${colors[alertType]}`}>
        {alertType === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
        <span className="font-bold text-sm">{alertMsg}</span>
      </div>
    );
  };

  // Sem acesso ao módulo
  if (!userModule && !loading) {
    return (
      <DashboardShell title="Cotações" description="Solicite acesso ao módulo de Cotações">
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
          <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mb-6">
            <FileText size={40} className="text-amber-500" />
          </div>
          <h2 className="text-2xl font-black uppercase italic text-slate-900 dark:text-white mb-4">
            Módulo Indisponível
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8">
            O módulo de Cotações requer aprovação da equipe Chama Frete.
            Solicite acesso pelo painel da sua empresa.
          </p>
          <Button variant="default" onClick={() => window.location.href = '/dashboard'}>
            Voltar ao Dashboard
          </Button>
        </div>
      </DashboardShell>
    );
  }

  // Loading skeleton
  if (loading) return (
    <DashboardShell title="Cotações" description="Carregando...">
      <div className="space-y-4 animate-pulse">
        <div className="flex gap-2">
          {[1, 2, 3].map(i => <div key={i} className="h-10 w-36 bg-slate-200 dark:bg-slate-700 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl border p-6">
              <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
              <div className="h-5 w-40 bg-slate-200 dark:bg-slate-700 rounded mb-3" />
              <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
              <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  );

  return (
    <>
      <AlertToast />

      <DashboardShell
        title="Cotações"
        description="Gerencie suas solicitações de cotação"
        actions={
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus size={18} /> Nova Cotação
          </Button>
        }
      >
        {/* Tabs */}
        <div className="flex gap-2 bg-white dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 w-fit">
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
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Quotes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quotes.length === 0 ? (
            <div className="col-span-full bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700">
              <FileText size={48} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
              <p className="text-slate-500 dark:text-slate-400 font-medium">Nenhuma cotação encontrada</p>
            </div>
          ) : (
            quotes.map(quote => (
              <div
                key={quote.id}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg dark:hover:shadow-slate-900/50 transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${statusColors[quote.status]}`}>
                      {statusLabels[quote.status]}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full">
                      {getQuoteTypeIcon(quote.type)}
                      {getQuoteTypeLabel(quote.type)}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">#{quote.id}</span>
                </div>

                <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2 line-clamp-1">{quote.title}</h3>

                {(quote.origin_city || quote.dest_city) && (
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-2">
                    <MapPin size={12} />
                    {quote.origin_city && <span>{quote.origin_city}</span>}
                    {quote.origin_city && quote.dest_city && <ChevronRight size={12} className="text-slate-300" />}
                    {quote.dest_city && <span>{quote.dest_city}</span>}
                  </div>
                )}

                {quote.commodity_type && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 mb-2">Mercadoria: {quote.commodity_type}</p>
                )}

                {quote.weight && (
                  <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                    <Scale size={12} />
                    <span>{quote.weight} kg</span>
                  </div>
                )}

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500" title={fmtFull(quote.created_at)}>
                    {fmtRelative(quote.created_at)}
                  </span>

                  {activeTab === 'available' && quote.status === 'open' && (
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => {
                        setSelectedQuote(quote);
                        setShowResponseModal(true);
                      }}
                    >
                      Responder
                    </Button>
                  )}

                  {activeTab === 'my-quotes' && quote.responses && quote.responses.length > 0 && (
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {quote.responses.length} resposta(s)
                    </span>
                  )}

                  {activeTab === 'responses' && quote.winner_bid_id && quote.status === 'closed' && (
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Aceita</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </DashboardShell>

      {/* Confirmar Aceitação */}
      <ConfirmModal
        isOpen={!!confirmAccept}
        onClose={() => setConfirmAccept(null)}
        onConfirm={handleAcceptResponse}
        title="Aceitar esta resposta?"
        description="Ao aceitar, a cotação será encerrada."
        confirmText="Sim, aceitar"
        cancelText="Cancelar"
        variant="success"
      />

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black uppercase italic text-slate-900 dark:text-white">Nova Cotação</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 mb-2">Tipo de Cotação</label>
                <div className="grid grid-cols-2 gap-2">
                  {quoteTypes.map(type => (
                    <button
                      key={type.value}
                      onClick={() => setFormData({ ...formData, type: type.value })}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        formData.type === type.value
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-600'
                          : 'border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <type.icon size={18} className={formData.type === type.value ? 'text-emerald-600' : 'text-slate-400'} />
                        <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{type.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 mb-2">Título *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Descreva o serviço desejado"
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-sm text-slate-900 dark:text-slate-200 placeholder:text-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 mb-2">Cidade Origem</label>
                  <input
                    type="text"
                    value={formData.origin_city}
                    onChange={(e) => setFormData({ ...formData, origin_city: e.target.value })}
                    placeholder="Cidade/Estado"
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-sm text-slate-900 dark:text-slate-200 placeholder:text-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 mb-2">Cidade Destino</label>
                  <input
                    type="text"
                    value={formData.dest_city}
                    onChange={(e) => setFormData({ ...formData, dest_city: e.target.value })}
                    placeholder="Cidade/Estado"
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-sm text-slate-900 dark:text-slate-200 placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 mb-2">Mercadoria</label>
                  <input
                    type="text"
                    value={formData.commodity_type}
                    onChange={(e) => setFormData({ ...formData, commodity_type: e.target.value })}
                    placeholder="Ex: Eletrônicos, Móveis..."
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-sm text-slate-900 dark:text-slate-200 placeholder:text-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 mb-2">Peso (kg)</label>
                  <input
                    type="text"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    placeholder="Ex: 500"
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-sm text-slate-900 dark:text-slate-200 placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 mb-2">Valor Carga (R$)</label>
                  <input
                    type="text"
                    value={formData.cargo_value}
                    onChange={(e) => setFormData({ ...formData, cargo_value: e.target.value })}
                    placeholder="Ex: 10000"
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-sm text-slate-900 dark:text-slate-200 placeholder:text-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 mb-2">Volume</label>
                  <input
                    type="text"
                    value={formData.volume}
                    onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                    placeholder="Ex: 2 pallets"
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-sm text-slate-900 dark:text-slate-200 placeholder:text-slate-400"
                  />
                </div>
              </div>

              {formData.type === 'armazenagem' && (
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 mb-2">Período (dias)</label>
                  <input
                    type="number"
                    value={formData.period_days}
                    onChange={(e) => setFormData({ ...formData, period_days: e.target.value })}
                    placeholder="Quantos dias?"
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-sm text-slate-900 dark:text-slate-200"
                  />
                </div>
              )}

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 mb-2">Descrição</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detalhes adicionais..."
                  rows={3}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-sm text-slate-900 dark:text-slate-200 placeholder:text-slate-400 resize-none"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.requires_insurance === 1}
                  onChange={(e) => setFormData({ ...formData, requires_insurance: e.target.checked ? 1 : 0 })}
                  className="w-4 h-4 rounded border-slate-300 text-emerald-600"
                />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Requer seguro</span>
              </label>

              <Button onClick={handleCreateQuote} disabled={saving} className="w-full" size="lg">
                {saving ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                Criar Cotação
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Response Modal */}
      {showResponseModal && selectedQuote && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 max-w-lg w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black uppercase italic text-slate-900 dark:text-white">Responder Cotação</h3>
              <button onClick={() => setShowResponseModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 mb-4">
              <h4 className="font-bold text-slate-800 dark:text-slate-200">{selectedQuote.title}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {selectedQuote.origin_city} → {selectedQuote.dest_city}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 mb-2">Preço (R$) *</label>
                <input
                  type="number"
                  value={responseData.price}
                  onChange={(e) => setResponseData({ ...responseData, price: e.target.value })}
                  placeholder="0,00"
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-sm tabular-nums text-slate-900 dark:text-slate-200 placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 mb-2">Prazo de Entrega</label>
                <input
                  type="text"
                  value={responseData.delivery_time}
                  onChange={(e) => setResponseData({ ...responseData, delivery_time: e.target.value })}
                  placeholder="Ex: 5 dias úteis"
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-sm text-slate-900 dark:text-slate-200 placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 mb-2">Condições</label>
                <input
                  type="text"
                  value={responseData.conditions}
                  onChange={(e) => setResponseData({ ...responseData, conditions: e.target.value })}
                  placeholder="Ex: Pagamento em 30 dias"
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-sm text-slate-900 dark:text-slate-200 placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 mb-2">Observações</label>
                <textarea
                  value={responseData.notes}
                  onChange={(e) => setResponseData({ ...responseData, notes: e.target.value })}
                  placeholder="Detalhes adicionais..."
                  rows={2}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-sm text-slate-900 dark:text-slate-200 placeholder:text-slate-400 resize-none"
                />
              </div>

              <Button onClick={handleRespondQuote} disabled={saving} className="w-full" size="lg">
                {saving ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                Enviar Resposta
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
