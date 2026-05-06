import { useState, useEffect } from 'react';
import { api } from '../../api/api';
import { 
  Headphones, Search, Loader2, CheckCircle, X, 
  Clock, AlertCircle, MessageCircle, Send, User,
  ChevronDown, Filter, Eye, Mail
} from 'lucide-react';
import Swal from 'sweetalert2';
import { PageShell, StatsGrid, StatCard } from '@/components/admin';

interface Ticket {
  id: number;
  user_id: number;
  subject: string;
  category: string;
  priority: string;
  priority_level?: number;
  urgency_code?: string;
  status: string;
  created_at: string;
  last_update: string;
  user_name?: string;
  user_role?: string;
}

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

const priorityColors: Record<string, string> = {
  LOW: 'bg-slate-100 text-slate-600',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  HIGH: 'bg-orange-100 text-orange-700',
  URGENT: 'bg-red-100 text-red-700'
};

const userPriorityLabels = [
  { value: 1, label: 'Free', color: 'bg-slate-100 text-slate-600' },
  { value: 2, label: 'Recursos', color: 'bg-blue-100 text-blue-600' },
  { value: 3, label: 'Bronze', color: 'bg-orange-100 text-orange-600' },
  { value: 4, label: 'Prata', color: 'bg-cyan-100 text-cyan-600' },
  { value: 5, label: 'Ouro', color: 'bg-amber-100 text-amber-600' },
];

const urgencyOptions = [
  { value: 'U1', label: 'Baixa', desc: 'Dúvida geral', color: 'bg-green-100 text-green-700' },
  { value: 'U2', label: 'Média', desc: 'Problema não urgente', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'U3', label: 'Alta', desc: 'Problema que impede uso', color: 'bg-orange-100 text-orange-700' },
  { value: 'U4', label: 'Crítica', desc: 'Sistema indisponível', color: 'bg-red-100 text-red-700' },
  { value: 'U5', label: 'Emergência', desc: 'Perda de dinheiro/dados', color: 'bg-purple-100 text-purple-700' },
];

const statusColors: Record<string, string> = {
  OPEN: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-purple-100 text-purple-700',
  CLOSED: 'bg-slate-100 text-slate-500'
};

const categoryLabels: Record<string, string> = {
  FINANCIAL: 'Financeiro',
  TECHNICAL: 'Técnico',
  COMPLAINT: 'Reclamação',
  GENERAL: 'Geral',
  OTHER: 'Outro'
};

export default function SupportTicketsManager() {
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState<string>('%');
  const [priorityFilter, setPriorityFilter] = useState<string>('%');
  const [searchTerm, setSearchTerm] = useState('');
  const [replyMessage, setReplyMessage] = useState('');

  useEffect(() => {
    loadTickets();
  }, [filter, priorityFilter]);

  useEffect(() => {
    if (selectedTicket) {
      loadMessages(selectedTicket.id);
    }
  }, [selectedTicket]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/support/tickets', { params: { status: filter } });
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
      const res = await api.get(`/support/tickets/${ticketId}/messages`);
      if (res.data?.success) {
        setMessages(res.data.data || []);
      }
    } catch (e) {
      console.error("Erro ao carregar mensagens:", e);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleReply = async () => {
    if (!selectedTicket || !replyMessage.trim()) return;

    try {
      setSending(true);
      const res = await api.post('/support/reply', {
        ticket_id: selectedTicket.id,
        message: replyMessage
      });

      if (res.data?.success) {
        setReplyMessage('');
        loadMessages(selectedTicket.id);
        loadTickets();
        Swal.fire({ icon: 'success', title: 'Resposta enviada!', timer: 1500 });
      }
    } catch (e) {
      Swal.fire({ icon: 'error', title: 'Erro ao enviar' });
    } finally {
      setSending(false);
    }
  };

  const handleCloseTicket = async (ticketId: number) => {
    const result = await Swal.fire({
      title: 'Fechar ticket?',
      text: 'O cliente não poderá mais responder',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sim, fechar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const res = await api.post('/support/close-ticket', { id: ticketId });
        if (res.data?.success) {
          Swal.fire({ icon: 'success', title: 'Ticket fechado' });
          loadTickets();
          if (selectedTicket?.id === ticketId) {
            setSelectedTicket(null);
          }
        }
      } catch (e) {
        Swal.fire({ icon: 'error', title: 'Erro ao fechar' });
      }
    }
  };

  const handleUpdateUrgency = async (ticketId: number, newUrgency: string) => {
    try {
      const res = await api.post('/support/update-ticket', {
        id: ticketId,
        urgency_code: newUrgency
      });
      if (res.data?.success) {
        Swal.fire({ icon: 'success', title: 'Urgência atualizada!', timer: 1500 });
        loadTickets();
      }
    } catch (e) {
      Swal.fire({ icon: 'error', title: 'Erro ao atualizar' });
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = searchTerm === '' || 
      t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.id.toString().includes(searchTerm);
    const matchesPriority = priorityFilter === '%' || 
      (priorityFilter === 'vip' && t.priority_level && t.priority_level > 1) ||
      (priorityFilter === 'normal' && (!t.priority_level || t.priority_level === 1));
    return matchesSearch && matchesPriority;
  });

  const openCount = tickets.filter(t => t.status === 'OPEN').length;
  const progressCount = tickets.filter(t => t.status === 'IN_PROGRESS').length;

  return (
    <PageShell
      title="Gestão de Suporte"
      description="Gerencie chamados de clientes"
    >
      {/* STATS GRID */}
      <div className="mt-6">
        <StatsGrid>
          <StatCard label="Total" value={tickets.length} icon={<MessageCircle size={16} />} />
          <StatCard label="Abertos" value={openCount} variant="blue" icon={<Clock size={16} />} />
          <StatCard label="Em Andamento" value={progressCount} variant="purple" icon={<AlertCircle size={16} />} />
          <StatCard label="Fechados" value={tickets.filter(t => t.status === 'CLOSED').length} variant="green" icon={<CheckCircle size={16} />} />
        </StatsGrid>
      </div>

      {/* FILTERS */}
      <div className="flex flex-col md:flex-row gap-3 mt-4">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            placeholder="Buscar por ID ou assunto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-white px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="%">Todos os Status</option>
            <option value="OPEN">Abertos</option>
            <option value="IN_PROGRESS">Em Andamento</option>
            <option value="CLOSED">Fechados</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-white px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="%">Todas Prioridades</option>
            <option value="vip">VIP Only</option>
            <option value="normal">Free</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
        {/* Tickets List */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="max-h-[700px] overflow-y-auto">
            {loading ? (
              <div className="p-8 flex justify-center">
                <Loader2 className="animate-spin text-indigo-500" size={32} />
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="p-8 text-center">
                <Headphones size={40} className="mx-auto mb-3 text-slate-300" />
                <p className="text-slate-500 font-medium">Nenhum ticket encontrado</p>
              </div>
            ) : (
              filteredTickets.map(ticket => (
                <button
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`w-full p-4 text-left border-b border-slate-50 hover:bg-slate-50 transition-colors ${
                    selectedTicket?.id === ticket.id ? 'bg-indigo-50 border-l-4 border-l-indigo-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${statusColors[ticket.status] || 'bg-slate-100'}`}>
                        {ticket.status === 'OPEN' ? 'Aberto' : ticket.status === 'IN_PROGRESS' ? 'Em Andamento' : 'Fechado'}
                      </span>
                      {ticket.priority_level && ticket.priority_level > 1 && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${userPriorityLabels.find(p => p.value === ticket.priority_level)?.color || 'bg-slate-100'}`}>
                          VIP {userPriorityLabels.find(p => p.value === ticket.priority_level)?.label}
                        </span>
                      )}
                      {ticket.urgency_code && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${urgencyOptions.find(u => u.value === ticket.urgency_code)?.color || 'bg-slate-100'}`}>
                          {ticket.urgency_code}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400">#{ticket.id}</span>
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm mb-1 line-clamp-1">{ticket.subject}</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <User size={10} /> {ticket.user_name || `User #${ticket.user_id}`}
                    </span>
                    <span className="text-[10px] text-slate-400">{formatDate(ticket.created_at)}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Ticket Detail */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden min-h-[700px] flex flex-col">
          {selectedTicket ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-black uppercase italic text-slate-800">{selectedTicket.subject}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${statusColors[selectedTicket.status]}`}>
                        {selectedTicket.status === 'OPEN' ? 'Aberto' : selectedTicket.status === 'IN_PROGRESS' ? 'Em Andamento' : 'Fechado'}
                      </span>
                      {selectedTicket.priority_level && selectedTicket.priority_level > 1 && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${userPriorityLabels.find(p => p.value === selectedTicket.priority_level)?.color || 'bg-slate-100'}`}>
                          VIP {userPriorityLabels.find(p => p.value === selectedTicket.priority_level)?.label}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                      <span className="flex items-center gap-1">
                        <User size={12} /> {selectedTicket.user_name || `User #${selectedTicket.user_id}`}
                      </span>
                      <span>{categoryLabels[selectedTicket.category] || selectedTicket.category}</span>
                      <span>Criado em {formatDate(selectedTicket.created_at)}</span>
                      {selectedTicket.urgency_code && (
                        <select
                          value={selectedTicket.urgency_code}
                          onChange={(e) => handleUpdateUrgency(selectedTicket.id, e.target.value)}
                          className="ml-2 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          {urgencyOptions.map(u => (
                            <option key={u.value} value={u.value}>{u.label} ({u.value})</option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {selectedTicket.status !== 'CLOSED' && (
                      <>
                        <button 
                          onClick={() => handleCloseTicket(selectedTicket.id)}
                          className="px-4 py-2.5 bg-red-50 text-red-600 rounded-xl font-bold text-xs uppercase hover:bg-red-100 transition-colors flex items-center gap-1"
                        >
                          <X size={14} /> Fechar
                        </button>
                        <button className="px-4 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-xs uppercase hover:bg-indigo-100 transition-colors flex items-center gap-1">
                          <Mail size={14} /> Email
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="animate-spin text-indigo-500" size={32} />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-slate-400">
                    <p className="text-sm">Nenhuma mensagem</p>
                  </div>
                ) : (
                  messages.map(msg => (
                    <div 
                      key={msg.id}
                      className={`flex ${msg.is_admin_reply ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[85%] p-4 rounded-2xl ${
                        msg.is_admin_reply 
                          ? 'bg-indigo-600 text-white rounded-tr-none' 
                          : 'bg-slate-100 text-slate-800 rounded-tl-none'
                      }`}>
                        <div className="flex items-center gap-2 mb-2">
                          <User size={12} className={msg.is_admin_reply ? 'text-indigo-200' : 'text-slate-400'} />
                          <span className={`text-[10px] font-black uppercase ${msg.is_admin_reply ? 'text-indigo-200' : 'text-slate-500'}`}>
                            {msg.sender_name || (msg.is_admin_reply ? 'Suporte' : `User #${msg.sender_id}`)}
                          </span>
                          <span className={`text-[10px] ${msg.is_admin_reply ? 'text-indigo-300' : 'text-slate-400'}`}>
                            {formatDate(msg.created_at)}
                          </span>
                        </div>
                        <p className="text-sm font-medium whitespace-pre-wrap">{msg.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Reply Input */}
              {selectedTicket.status !== 'CLOSED' && (
                <div className="p-4 border-t border-slate-100">
                  <div className="flex gap-2">
                    <textarea
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Digite sua resposta..."
                      rows={2}
                      className="flex-1 bg-white px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    />
                    <button
                      onClick={handleReply}
                      disabled={sending || !replyMessage.trim()}
                      className="bg-indigo-600 text-white px-4 rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 self-end"
                    >
                      {sending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400">
              <div className="text-center">
                <MessageCircle size={48} className="mx-auto mb-3 opacity-50" />
                <p className="font-medium">Selecione um ticket</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
