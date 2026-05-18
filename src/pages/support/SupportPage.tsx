import { useState, useEffect, useRef } from 'react';
import { api } from '../../api/api';
import {
  Headphones, Plus, MessageCircle,
  CheckCircle, X, Send, User,
  AlertCircle, Search, Loader2
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import DashboardShell from '../../components/layout/DashboardShell';
import ConfirmModal from '../../components/shared/ConfirmModal';

interface Ticket {
  id: number;
  subject: string;
  category: string;
  priority: string;
  priority_level?: number;
  urgency_code?: string;
  status: string;
  created_at: string;
  last_update: string;
  last_message?: string;
}

const urgencyOptions = [
  { value: 'U1', label: 'Baixa', desc: 'Dúvida geral', color: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400' },
  { value: 'U2', label: 'Média', desc: 'Problema não urgente', color: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400' },
  { value: 'U3', label: 'Alta', desc: 'Problema que impede uso', color: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400' },
  { value: 'U4', label: 'Crítica', desc: 'Sistema indisponível', color: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400' },
  { value: 'U5', label: 'Emergência', desc: 'Perda de dinheiro/dados', color: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400' },
];

const priorityLabels = [
  { value: 1, label: 'Free', color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
  { value: 2, label: 'Recursos', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
  { value: 3, label: 'Bronze', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' },
  { value: 4, label: 'Prata', color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400' },
  { value: 5, label: 'Ouro', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
];

interface Message {
  id: number;
  ticket_id: number;
  sender_id: number;
  message: string;
  is_admin_reply: number;
  created_at: string;
  sender_name?: string;
  sender_role?: string;
}

const categories = [
  { value: 'general', label: 'Geral', icon: MessageCircle },
  { value: 'billing', label: 'Financeiro/Faturamento', icon: CheckCircle },
  { value: 'technical', label: 'Técnico', icon: AlertCircle },
  { value: 'account', label: 'Minha Conta', icon: User },
  { value: 'freight', label: 'Fretes', icon: Headphones },
];

const fmtRelative = (dateStr: string) => {
  if (!dateStr) return '-';
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

const getStatusColor = (status: string) => {
  switch (status) {
    case 'OPEN': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'CLOSED': return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
    default: return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'OPEN': return 'Aberto';
    case 'IN_PROGRESS': return 'Em Andamento';
    case 'CLOSED': return 'Fechado';
    default: return status;
  }
};

export default function SupportPage() {
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [closeConfirm, setCloseConfirm] = useState<number | null>(null);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<'success' | 'error' | 'warning'>('success');

  const [newTicket, setNewTicket] = useState({
    subject: '',
    message: '',
    category: 'general',
    urgency_code: 'U1'
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { loadTickets(); }, []);
  useEffect(() => { if (selectedTicket) loadMessages(selectedTicket.id); }, [selectedTicket]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const showAlert = (msg: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setAlertMsg(msg);
    setAlertType(type);
    setTimeout(() => setAlertMsg(null), 3000);
  };

  const loadTickets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/my-tickets');
      if (res.data?.success) setTickets(res.data.data || []);
    } catch { /* silent */ } finally { setLoading(false); }
  };

  const loadMessages = async (ticketId: number) => {
    try {
      setLoadingMessages(true);
      const res = await api.get(`/my-tickets/${ticketId}/messages`);
      if (res.data?.success) setMessages(res.data.data || []);
    } catch { /* silent */ } finally { setLoadingMessages(false); }
  };

  const handleCreateTicket = async () => {
    if (!newTicket.subject.trim() || !newTicket.message.trim()) {
      return showAlert('Preencha o assunto e a mensagem', 'warning');
    }
    try {
      setSending(true);
      const res = await api.post('/my-tickets', newTicket);
      if (res.data?.success) {
        showAlert('Ticket criado! Em breve você receberá uma resposta', 'success');
        setShowNewTicket(false);
        setNewTicket({ subject: '', message: '', category: 'general', urgency_code: 'U1' });
        loadTickets();
      } else {
        throw new Error(res.data?.message || 'Erro');
      }
    } catch (e: any) {
      showAlert(e.response?.data?.message || 'Não foi possível criar o ticket', 'error');
    } finally { setSending(false); }
  };

  const handleSendReply = async () => {
    if (!selectedTicket || !newTicket.message.trim()) return;
    try {
      setSending(true);
      const res = await api.post('/my-tickets/reply', { ticket_id: selectedTicket.id, message: newTicket.message });
      if (res.data?.success) {
        setNewTicket(prev => ({ ...prev, message: '' }));
        loadMessages(selectedTicket.id);
        loadTickets();
      } else {
        throw new Error(res.data?.message || 'Erro');
      }
    } catch (e: any) {
      showAlert(e.response?.data?.message || 'Não foi possível enviar a resposta', 'error');
    } finally { setSending(false); }
  };

  const handleCloseTicket = async () => {
    if (!closeConfirm) return;
    try {
      const res = await api.post('/my-tickets/close', { ticket_id: closeConfirm });
      if (res.data?.success) {
        showAlert('Ticket fechado', 'success');
        loadTickets();
        if (selectedTicket?.id === closeConfirm) setSelectedTicket(null);
      }
    } catch { showAlert('Erro ao fechar ticket', 'error'); }
    finally { setCloseConfirm(null); }
  };

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

  if (loading) return (
    <DashboardShell title="Suporte" description="Central de atendimento">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border p-4 space-y-3">
          <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-xl" />
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="space-y-2 border-b border-slate-100 dark:border-slate-700 pb-3">
              <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
          ))}
        </div>
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border p-4">
          <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-xl mb-4" />
          {[1, 2, 3].map(i => (
            <div key={i} className="flex mb-4">
              <div className="h-20 w-3/5 bg-slate-200 dark:bg-slate-700 rounded-2xl" />
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  );

  return (
    <>
      <AlertToast />

      <ConfirmModal
        isOpen={!!closeConfirm}
        onClose={() => setCloseConfirm(null)}
        onConfirm={handleCloseTicket}
        title="Fechar ticket?"
        description="Você não poderá mais enviar mensagens neste ticket"
        confirmText="Sim, fechar"
        cancelText="Cancelar"
        variant="warning"
      />

      <DashboardShell
        title="Suporte"
        description="Central de atendimento"
        actions={
          <Button onClick={() => setShowNewTicket(true)}>
            <Plus size={18} /> Novo Ticket
          </Button>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tickets List */}
          <div className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar tickets..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-200 placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="max-h-[600px] overflow-y-auto">
              {tickets.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageCircle size={40} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                  <p className="text-slate-500 dark:text-slate-400 font-medium">Nenhum ticket</p>
                  <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">Clique em "Novo Ticket" para pedir help</p>
                </div>
              ) : (
                tickets.map(ticket => (
                  <button
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className={`w-full p-4 text-left border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${
                      selectedTicket?.id === ticket.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500'
                        : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1 gap-2">
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${getStatusColor(ticket.status)}`}>
                          {getStatusLabel(ticket.status)}
                        </span>
                        {ticket.priority_level && ticket.priority_level > 1 && (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${priorityLabels.find(p => p.value === ticket.priority_level)?.color || 'bg-slate-100 text-slate-600'}`}>
                            VIP {priorityLabels.find(p => p.value === ticket.priority_level)?.label}
                          </span>
                        )}
                        {ticket.urgency_code && (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${urgencyOptions.find(u => u.value === ticket.urgency_code)?.color || 'bg-slate-100 text-slate-600'}`}>
                            {ticket.urgency_code}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap" title={fmtFull(ticket.created_at)}>
                        {fmtRelative(ticket.created_at)}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-1 line-clamp-1">{ticket.subject}</h4>
                    <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-2">{ticket.last_message || 'Sem mensagens'}</p>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden min-h-[600px] flex flex-col">
            {selectedTicket ? (
              <>
                {/* Ticket Header */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-black uppercase italic text-slate-800 dark:text-slate-200">{selectedTicket.subject}</h3>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                          #{selectedTicket.id} • {categories.find(c => c.value === selectedTicket.category)?.label || selectedTicket.category}
                        </span>
                        {selectedTicket.urgency_code && (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${urgencyOptions.find(u => u.value === selectedTicket.urgency_code)?.color || 'bg-slate-100 text-slate-600'}`}>
                            {selectedTicket.urgency_code}
                          </span>
                        )}
                        {selectedTicket.priority_level && selectedTicket.priority_level > 1 && (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${priorityLabels.find(p => p.value === selectedTicket.priority_level)?.color || 'bg-slate-100 text-slate-600'}`}>
                            Prioridade {priorityLabels.find(p => p.value === selectedTicket.priority_level)?.label}
                          </span>
                        )}
                      </div>
                    </div>
                    {selectedTicket.status !== 'CLOSED' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCloseConfirm(selectedTicket.id)}
                        className="text-slate-400 hover:text-red-500"
                      >
                        <X size={14} /> Fechar
                      </Button>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {loadingMessages ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="animate-spin text-blue-500" size={32} />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-slate-400 dark:text-slate-500">
                      <p className="text-sm">Nenhuma mensagem ainda</p>
                    </div>
                  ) : (
                    messages.map(msg => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.is_admin_reply ? 'justify-start' : 'justify-end'}`}
                      >
                        <div className={`max-w-[80%] p-4 rounded-2xl ${
                          msg.is_admin_reply
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-slate-800 dark:text-slate-200 rounded-tl-none'
                            : 'bg-slate-900 dark:bg-slate-700 text-white rounded-tr-none'
                        }`}>
                          {msg.is_admin_reply && (
                            <p className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 mb-1">Suporte Chama Frete</p>
                          )}
                          <p className="text-sm font-medium">{msg.message}</p>
                          <p className={`text-[10px] mt-2 text-slate-400 dark:text-slate-500`}>
                            {fmtRelative(msg.created_at)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                {selectedTicket.status !== 'CLOSED' ? (
                  <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newTicket.message}
                        onChange={(e) => setNewTicket(prev => ({ ...prev, message: e.target.value }))}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendReply()}
                        placeholder="Digite sua mensagem..."
                        className="flex-1 p-3 bg-slate-100 dark:bg-slate-700 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-200 placeholder:text-slate-400"
                      />
                      <Button
                        onClick={handleSendReply}
                        disabled={sending || !newTicket.message.trim()}
                        variant="default"
                        size="icon"
                      >
                        {sending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-center">
                    <p className="text-slate-400 dark:text-slate-500 text-sm font-medium">Este ticket está fechado</p>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 dark:text-slate-500">
                <div className="text-center">
                  <MessageCircle size={48} className="mx-auto mb-3 opacity-50" />
                  <p className="font-medium">Selecione um ticket</p>
                  <p className="text-xs mt-1">ou crie um novo</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DashboardShell>

      {/* New Ticket Modal */}
      {showNewTicket && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black uppercase italic text-slate-900 dark:text-white">Abrir Ticket</h3>
              <button onClick={() => setShowNewTicket(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 mb-2">Assunto</label>
                <input
                  type="text"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  placeholder="Descreva brevemente o problema"
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-sm text-slate-900 dark:text-slate-200 placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 mb-2">Categoria</label>
                <select
                  value={newTicket.category}
                  onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-sm text-slate-900 dark:text-slate-200"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 mb-2">Urgência</label>
                <select
                  value={newTicket.urgency_code}
                  onChange={(e) => setNewTicket({ ...newTicket, urgency_code: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-sm text-slate-900 dark:text-slate-200"
                >
                  {urgencyOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label} - {opt.desc}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 mb-2">Mensagem</label>
                <textarea
                  value={newTicket.message}
                  onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                  placeholder="Descreva seu problema em detalhes..."
                  rows={5}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-sm text-slate-900 dark:text-slate-200 placeholder:text-slate-400 resize-none"
                />
              </div>

              <Button
                onClick={handleCreateTicket}
                disabled={sending || !newTicket.subject.trim() || !newTicket.message.trim()}
                className="w-full"
                size="lg"
              >
                {sending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                Enviar Ticket
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
