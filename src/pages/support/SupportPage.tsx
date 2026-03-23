import { useState, useEffect, useRef } from 'react';
import { api } from '../../api/api';
import { 
  Headphones, Plus, Loader2, MessageCircle, Clock, 
  CheckCircle, X, Send, Paperclip, User, ChevronRight,
  AlertCircle, Search
} from 'lucide-react';
import Swal from 'sweetalert2';

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
  { value: 'U1', label: 'Baixa', desc: 'Dúvida geral', color: 'bg-green-100 text-green-700 border-green-200' },
  { value: 'U2', label: 'Média', desc: 'Problema não urgente', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { value: 'U3', label: 'Alta', desc: 'Problema que impede uso', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { value: 'U4', label: 'Crítica', desc: 'Sistema indisponível', color: 'bg-red-100 text-red-700 border-red-200' },
  { value: 'U5', label: 'Emergência', desc: 'Perda de dinheiro/dados', color: 'bg-purple-100 text-purple-700 border-purple-200' },
];

const priorityLabels = [
  { value: 1, label: 'Free', color: 'bg-slate-100 text-slate-600' },
  { value: 2, label: 'Recursos', color: 'bg-blue-100 text-blue-600' },
  { value: 3, label: 'Bronze', color: 'bg-orange-100 text-orange-600' },
  { value: 4, label: 'Prata', color: 'bg-cyan-100 text-cyan-600' },
  { value: 5, label: 'Ouro', color: 'bg-amber-100 text-amber-600' },
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

export default function SupportPage() {
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [showNewTicket, setShowNewTicket] = useState(false);
  
  const [newTicket, setNewTicket] = useState({
    subject: '',
    message: '',
    category: 'general',
    urgency_code: 'U1'
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadTickets();
  }, []);

  useEffect(() => {
    if (selectedTicket) {
      loadMessages(selectedTicket.id);
    }
  }, [selectedTicket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/my-tickets');
      if (res.data?.success) {
        setTickets(res.data.data || []);
      }
    } catch (e) {
      console.error("Erro ao carregar tickets:", e);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (ticketId: number) => {
    try {
      setLoadingMessages(true);
      const res = await api.get(`/my-tickets/${ticketId}/messages`);
      if (res.data?.success) {
        setMessages(res.data.data || []);
      }
    } catch (e) {
      console.error("Erro ao carregar mensagens:", e);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleCreateTicket = async () => {
    if (!newTicket.subject.trim() || !newTicket.message.trim()) {
      return Swal.fire({
        icon: 'warning',
        title: 'Campos obrigatórios',
        text: 'Preencha o assunto e a mensagem'
      });
    }

    try {
      setSending(true);
      const res = await api.post('/my-tickets', newTicket);
      
      if (res.data?.success) {
        Swal.fire({
          icon: 'success',
          title: 'Ticket criado!',
          text: 'Em breve você receberá uma resposta',
          timer: 2000
        });
        setShowNewTicket(false);
        setNewTicket({ subject: '', message: '', category: 'general', urgency_code: 'U1' });
        loadTickets();
      } else {
        throw new Error(res.data?.message || 'Erro');
      }
    } catch (e: any) {
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: e.response?.data?.message || 'Não foi possível criar o ticket'
      });
    } finally {
      setSending(false);
    }
  };

  const handleSendReply = async () => {
    if (!selectedTicket || !newTicket.message.trim()) return;

    try {
      setSending(true);
      const res = await api.post('/my-tickets/reply', {
        ticket_id: selectedTicket.id,
        message: newTicket.message
      });

      if (res.data?.success) {
        newTicket.message = '';
        loadMessages(selectedTicket.id);
        loadTickets();
      } else {
        throw new Error(res.data?.message || 'Erro');
      }
    } catch (e: any) {
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: e.response?.data?.message || 'Não foi possível enviar a resposta'
      });
    } finally {
      setSending(false);
    }
  };

  const handleCloseTicket = async (ticketId: number) => {
    const result = await Swal.fire({
      title: 'Fechar ticket?',
      text: 'Você não poderá mais enviar mensagens neste ticket',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sim, fechar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const res = await api.post('/my-tickets/close', { ticket_id: ticketId });
        if (res.data?.success) {
          Swal.fire({ icon: 'success', title: 'Ticket fechado', timer: 1500 });
          loadTickets();
          if (selectedTicket?.id === ticketId) {
            setSelectedTicket(null);
          }
        }
      } catch (e) {
        Swal.fire({ icon: 'error', title: 'Erro' });
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'OPEN': return 'bg-blue-100 text-blue-700';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-700';
      case 'CLOSED': return 'bg-slate-100 text-slate-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'OPEN': return 'Aberto';
      case 'IN_PROGRESS': return 'Em Andamento';
      case 'CLOSED': return 'Fechado';
      default: return status;
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return (
    <div className="p-20 flex flex-col items-center justify-center animate-pulse">
      <Loader2 className="animate-spin text-orange-500 mb-4" size={48} />
      <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Carregando...</span>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-[3rem] p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-2xl">
              <Headphones size={28} />
            </div>
            <div>
              <h2 className="text-3xl font-black uppercase italic">Suporte</h2>
              <p className="text-blue-100 text-sm font-medium">Central de atendimento</p>
            </div>
          </div>
          <button 
            onClick={() => setShowNewTicket(true)}
            className="bg-white text-blue-600 px-6 py-3 rounded-2xl font-black uppercase text-sm flex items-center gap-2 hover:bg-blue-50 transition-all"
          >
            <Plus size={18} /> Novo Ticket
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets List */}
        <div className="lg:col-span-1 bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar tickets..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="max-h-[600px] overflow-y-auto">
            {tickets.length === 0 ? (
              <div className="p-8 text-center">
                <MessageCircle size={40} className="mx-auto mb-3 text-slate-300" />
                <p className="text-slate-500 font-medium">Nenhum ticket</p>
                <p className="text-slate-400 text-xs mt-1">Clique em "Novo Ticket" para pedir help</p>
              </div>
            ) : (
              tickets.map(ticket => (
                <button
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`w-full p-4 text-left border-b border-slate-50 hover:bg-slate-50 transition-colors ${
                    selectedTicket?.id === ticket.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-1 gap-2">
                    <div className="flex items-center gap-1">
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
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">{formatDate(ticket.created_at)}</span>
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm mb-1 line-clamp-1">{ticket.subject}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2">{ticket.last_message || 'Sem mensagens'}</p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden min-h-[600px] flex flex-col">
          {selectedTicket ? (
            <>
              {/* Ticket Header */}
              <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-black uppercase italic text-slate-800">{selectedTicket.subject}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-400">
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
                    <button 
                      onClick={() => handleCloseTicket(selectedTicket.id)}
                      className="text-slate-400 hover:text-red-500 text-xs font-bold uppercase flex items-center gap-1"
                    >
                      <X size={14} /> Fechar
                    </button>
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
                  <div className="flex items-center justify-center h-full text-slate-400">
                    <p className="text-sm">Nenhuma mensagem ainda</p>
                  </div>
                ) : (
                  messages.map(msg => (
                    <div 
                      key={msg.id} 
                      className={`flex ${msg.sender_id === msg.ticket_id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] p-4 rounded-2xl ${
                        msg.is_admin_reply 
                          ? 'bg-blue-50 text-slate-800 rounded-tl-none' 
                          : 'bg-slate-900 text-white rounded-tr-none'
                      }`}>
                        {msg.is_admin_reply && (
                          <p className="text-[10px] font-black uppercase text-blue-600 mb-1">Suporte Chama Frete</p>
                        )}
                        <p className="text-sm font-medium">{msg.message}</p>
                        <p className={`text-[10px] mt-2 ${
                          msg.is_admin_reply ? 'text-slate-400' : 'text-slate-400'
                        }`}>
                          {formatDate(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              {selectedTicket.status !== 'CLOSED' ? (
                <div className="p-4 border-t border-slate-100">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTicket.message}
                      onChange={(e) => setNewTicket({...newTicket, message: e.target.value})}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendReply()}
                      placeholder="Digite sua mensagem..."
                      className="flex-1 p-3 bg-slate-50 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleSendReply}
                      disabled={sending || !newTicket.message.trim()}
                      className="bg-blue-500 text-white p-3 rounded-xl hover:bg-blue-600 transition-all disabled:opacity-50"
                    >
                      {sending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
                  <p className="text-slate-400 text-sm font-medium">Este ticket está fechado</p>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400">
              <div className="text-center">
                <MessageCircle size={48} className="mx-auto mb-3 opacity-50" />
                <p className="font-medium">Selecione um ticket</p>
                <p className="text-xs mt-1">ou crie um novo</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Ticket Modal */}
      {showNewTicket && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black uppercase italic text-slate-900">Abrir Ticket</h3>
              <button 
                onClick={() => setShowNewTicket(false)}
                className="p-2 hover:bg-slate-100 rounded-xl"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Assunto</label>
                <input 
                  type="text" 
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
                  placeholder="Descreva brevemente o problema"
                  className="w-full p-3 rounded-xl border border-slate-200 font-bold text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Categoria</label>
                <select 
                  value={newTicket.category}
                  onChange={(e) => setNewTicket({...newTicket, category: e.target.value})}
                  className="w-full p-3 rounded-xl border border-slate-200 font-bold text-sm"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Urgência</label>
                <select 
                  value={newTicket.urgency_code}
                  onChange={(e) => setNewTicket({...newTicket, urgency_code: e.target.value})}
                  className="w-full p-3 rounded-xl border border-slate-200 font-bold text-sm"
                >
                  {urgencyOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label} - {opt.desc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Mensagem</label>
                <textarea 
                  value={newTicket.message}
                  onChange={(e) => setNewTicket({...newTicket, message: e.target.value})}
                  placeholder="Descreva seu problema em detalhes..."
                  rows={5}
                  className="w-full p-3 rounded-xl border border-slate-200 font-bold text-sm resize-none"
                />
              </div>

              <button
                onClick={handleCreateTicket}
                disabled={sending || !newTicket.subject.trim() || !newTicket.message.trim()}
                className="w-full py-4 bg-blue-500 text-white rounded-xl font-black uppercase text-sm flex items-center justify-center gap-2 hover:bg-blue-600 transition-all disabled:opacity-50"
              >
                {sending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                Enviar Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
