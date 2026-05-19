import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/api';
import { Send, ArrowLeft, ShieldCheck, X, Flag, MoreVertical, EyeOff, Ban, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import Swal from 'sweetalert2';

interface Message {
  id: number;
  room_id: number;
  sender_id: number;
  message: string;
  created_at: string;
  sender_name: string;
}

interface RoomInfo {
  room_id: number;
  freight_id: number;
  freight_product: string;
  contact_id: number;
  contact_name: string;
  contact_avatar: string | null;
  contact_slug: string;
}

interface RoomInitialData {
  contact_name: string;
  contact_avatar: string | null;
  freight_product: string;
  contact_id: number;
}

interface ChatRoomProps {
  roomId: number;
  onBack?: () => void;
  initialRoomData?: RoomInitialData | null;
}

const AVATAR_COLORS = [
  'bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500',
  'bg-rose-500', 'bg-cyan-500', 'bg-orange-500', 'bg-pink-500',
];

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function formatMessageTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return 'agora';
  if (diffMin < 60) return `${diffMin} min`;
  if (date.getDate() === now.getDate() && date.getMonth() === now.getMonth()) {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }
  if (diffMin < 1440) return 'Ontem ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) + ' ' +
    date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export default function ChatRoom({ roomId, onBack, initialRoomData }: ChatRoomProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const shouldAutoScroll = useRef(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);

  const REPORT_REASONS = [
    { value: 'spam', label: 'Spam ou propaganda' },
    { value: 'harassment', label: 'Assédio ou ofensa' },
    { value: 'fake', label: 'Perfil falso' },
    { value: 'fraud', label: 'Fraude ou golpe' },
    { value: 'inappropriate', label: 'Comportamento inadequado' },
    { value: 'suspicious_payment', label: 'Solicitou pagamento suspeito' },
    { value: 'external_deal', label: 'Quer negociar fora da plataforma' },
    { value: 'meet_in_person', label: 'Quer encontro presencial suspeito' },
    { value: 'fake_documents', label: 'Enviou documentos falsos' },
    { value: 'third_party', label: 'Usando dados de terceiros' },
    { value: 'other', label: 'Outro motivo' },
  ];

  const handleReport = async () => {
    if (!reportReason) return;
    setReportSubmitting(true);
    try {
      const targetId = initialRoomData?.contact_id || roomInfo?.contact_id;
      const res = await api.post('reports', {
        target_type: 'user',
        target_id: targetId,
        reason: reportReason,
        description: reportDescription
      });
      if (res.data?.success) {
        Swal.fire('Denunciado!', 'Sua denúncia foi enviada para análise.', 'success');
        setShowReportForm(false);
        setReportReason('');
        setReportDescription('');
      }
    } catch (err: any) {
      Swal.fire('Erro', err.response?.data?.message || 'Erro ao enviar denúncia.', 'error');
    } finally {
      setReportSubmitting(false);
    }
  };

  const loadMessages = async () => {
    try {
      setError(null);
      const container = messagesContainerRef.current;
      if (container) {
        const diff = container.scrollHeight - container.scrollTop - container.clientHeight;
        shouldAutoScroll.current = diff < 150;
      }
      const res = await api.get(`/chat/messages/${roomId}`);
      if (res.data.success) {
        setMessages(res.data.data);
      }
    } catch {
      setError('Erro ao carregar mensagens');
    }
  };

  const loadRoomInfo = async () => {
    try {
      const res = await api.get(`/chat/room/${roomId}`);
      if (res.data.success) {
        setRoomInfo(res.data.data);
      }
    } catch {
      // room info is not critical
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      const receiverId = roomInfo?.contact_id
        || messages.find(m => m.sender_id !== user?.id)?.sender_id;

      const res = await api.post('/chat/send', {
        room_id: roomId,
        message: newMessage,
        receiver_id: receiverId
      });

      if (res.data.success) {
        shouldAutoScroll.current = true;
        setMessages(prev => [...prev, {
          id: res.data.message_id,
          room_id: roomId,
          sender_id: user?.id ?? 0,
          message: newMessage,
          created_at: new Date().toISOString(),
          sender_name: ''
        }]);
        setNewMessage('');
      }
    } catch {
      alert('Erro ao enviar mensagem');
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([loadMessages(), loadRoomInfo()]).finally(() => setLoading(false));
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [roomId]);

  useEffect(() => {
    if (shouldAutoScroll.current && messagesContainerRef.current) {
      const el = messagesContainerRef.current;
      requestAnimationFrame(() => { el.scrollTop = el.scrollHeight; });
    }
  }, [messages]);

  const roomName = initialRoomData?.contact_name || roomInfo?.contact_name || '';
  const roomAvatar = initialRoomData?.contact_avatar || roomInfo?.contact_avatar || null;
  const roomSlug = roomInfo?.contact_slug || '';

  const contactName = roomName || 'Negociação de Frete';

  const handleProfileClick = () => {
    if (roomSlug) {
      navigate(`/perfil/${roomSlug}`);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-0 flex-1 animate-pulse">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
          </div>
        </div>
        <div className="flex-1 p-4 space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
              <div className={`${i % 2 === 0 ? 'w-48' : 'w-64'} h-16 bg-slate-200 dark:bg-slate-700 rounded-2xl`} />
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 dark:text-slate-400 font-medium">{error}</p>
          <Button onClick={loadMessages} variant="link" className="mt-2 text-blue-600 text-sm font-bold">Tentar novamente</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-0 flex-1">
      <div className="shrink-0">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3 min-w-0">
            {onBack && (
              <Button onClick={onBack} variant="ghost" size="icon" className="lg:hidden shrink-0">
                <ArrowLeft size={20} className="text-slate-600 dark:text-slate-400" />
              </Button>
            )}
            <button onClick={handleProfileClick} className="flex items-center gap-3 min-w-0 hover:opacity-80 transition-opacity" disabled={!roomSlug}>
              {roomAvatar ? (
                <img src={roomAvatar} alt={contactName} className="w-10 h-10 rounded-full object-cover shrink-0" />
              ) : (
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ${getAvatarColor(contactName)}`}>
                  {getInitials(contactName)}
                </div>
              )}
              <div className="min-w-0 text-left">
                <h3 className="font-bold text-slate-800 dark:text-white text-sm truncate">
                  {contactName}
                </h3>
                {(initialRoomData?.freight_product || roomInfo?.freight_product) && (
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-black uppercase tracking-widest">
                    {initialRoomData?.freight_product || roomInfo?.freight_product}
                  </span>
                )}
              </div>
            </button>
          </div>

          <div className="relative shrink-0">
            <button onClick={() => setShowMenu(!showMenu)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
              <MoreVertical size={18} className="text-slate-500 dark:text-slate-400" />
            </button>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-full mt-1 z-20 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1 w-56 overflow-hidden">
                  <button
                    onClick={async () => {
                      setShowMenu(false);
                      try {
                        await api.post('/chat/mark-unread', { room_id: roomId });
                        Swal.fire('Mensagens não lidas', 'Mensagens marcadas como não lidas.', 'success');
                      } catch { Swal.fire('Erro', 'Erro ao marcar como não lido.', 'error'); }
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
                  >
                    <EyeOff size={16} className="text-slate-400" />
                    Marcar como não lido
                  </button>
                  <button
                    onClick={() => { setShowMenu(false); setShowSafetyModal(true); setShowReportForm(true); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
                  >
                    <Flag size={16} className="text-red-400" />
                    Denunciar usuário
                  </button>
                  <button
                    onClick={async () => {
                      setShowMenu(false);
                      const contactId = initialRoomData?.contact_id || roomInfo?.contact_id;
                      if (!contactId) return;
                      const { isConfirmed } = await Swal.fire({
                        title: 'Bloquear usuário?',
                        text: 'Você não receberá mais mensagens desta pessoa.',
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonText: 'Bloquear',
                        cancelButtonText: 'Cancelar',
                        confirmButtonColor: '#EF4444',
                      });
                      if (!isConfirmed) return;
                      try {
                        await api.post('/chat/block', { user_id: contactId });
                        Swal.fire('Bloqueado!', 'Usuário bloqueado com sucesso.', 'success');
                      } catch { Swal.fire('Erro', 'Erro ao bloquear usuário.', 'error'); }
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
                  >
                    <Ban size={16} className="text-slate-400" />
                    Bloquear usuário
                  </button>
                  <hr className="border-slate-100 dark:border-slate-700 my-1" />
                  <button
                    onClick={async () => {
                      setShowMenu(false);
                      const { isConfirmed } = await Swal.fire({
                        title: 'Excluir conversa?',
                        text: 'Esta conversa será removida da sua lista.',
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonText: 'Excluir',
                        cancelButtonText: 'Cancelar',
                        confirmButtonColor: '#EF4444',
                      });
                      if (!isConfirmed) return;
                      try {
                        await api.post('/chat/delete', { room_id: roomId });
                        Swal.fire('Excluída!', 'Conversa removida da sua lista.', 'success');
                        if (onBack) onBack();
                      } catch { Swal.fire('Erro', 'Erro ao excluir conversa.', 'error'); }
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-left"
                  >
                    <Trash2 size={16} />
                    Excluir conversa
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="px-3 py-2 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-900/50">
          <p className="text-[10px] text-amber-700 dark:text-amber-400 leading-relaxed">
            <ShieldCheck size={12} className="inline mr-1 -mt-0.5" />
            A Chama Frete não solicita seus dados ou envia links por este chat. Ao suspeitar de algo, denuncie.
          </p>
        </div>
      </div>

      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto min-h-0 p-4 space-y-4 bg-slate-50/30 dark:bg-slate-950/30">
        <div className="flex justify-center">
          <div className="bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-2.5 text-center max-w-[90%]">
            <ShieldCheck size={14} className="inline text-slate-400 mr-1 -mt-0.5" />
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              Não envie informações de contato para anúncios de {(initialRoomData?.freight_product || roomInfo?.freight_product || '').toLowerCase()} para ter mais segurança.
            </span>
            <button
              onClick={() => setShowSafetyModal(true)}
              className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold hover:underline ml-1"
            >
              Negociando com segurança
            </button>
          </div>
        </div>

        {messages.map((msg, idx) => {
          const isMe = msg.sender_id === user?.id;
          return (
            <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-2xl text-sm font-medium shadow-sm ${
                isMe
                  ? 'bg-blue-600 text-white rounded-tr-none'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-700'
              }`}>
                {msg.message}
                <div className={`text-[9px] mt-1 opacity-70 ${isMe ? 'text-right' : 'text-left'}`}>
                  {formatMessageTime(msg.created_at)}
                </div>
              </div>
            </div>
          );
        })}

        <div ref={scrollRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 flex gap-2 shrink-0">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Digite sua mensagem..."
          className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none dark:placeholder-slate-500"
        />
        <Button
          disabled={sending}
          size="icon"
          className="bg-blue-600 text-white p-3 rounded-xl hover:bg-slate-900 dark:hover:bg-blue-700 disabled:opacity-50 shrink-0"
        >
          {sending ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send size={20} />}
        </Button>
      </form>

      {showSafetyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => { setShowSafetyModal(false); setShowReportForm(false); }}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-6 relative" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => { setShowSafetyModal(false); setShowReportForm(false); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <X size={20} />
            </button>

            {showReportForm ? (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <Flag size={20} className="text-red-500" />
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Denunciar Usuário</h3>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                  Selecione o motivo da denúncia:
                </p>
                <div className="space-y-2 mb-4">
                  {REPORT_REASONS.map((reason) => (
                    <label key={reason.value} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                      <input
                        type="radio"
                        name="report-reason"
                        value={reason.value}
                        checked={reportReason === reason.value}
                        onChange={(e) => setReportReason(e.target.value)}
                        className="w-4 h-4 text-red-500"
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300">{reason.label}</span>
                    </label>
                  ))}
                </div>
                {reportReason === 'other' && (
                  <textarea
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    placeholder="Descreva o motivo..."
                    className="w-full p-3 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
                    rows={3}
                  />
                )}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowReportForm(false)}
                    className="flex-1 py-3 text-sm font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={handleReport}
                    disabled={reportSubmitting || !reportReason}
                    className="flex-1 py-3 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl disabled:opacity-50"
                  >
                    {reportSubmitting ? 'Enviando...' : 'Enviar Denúncia'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">Negociando com segurança</h3>
                <ul className="space-y-3 mb-6">
                  <li className="flex gap-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    <span className="text-blue-600 font-bold shrink-0 mt-0.5">1.</span>
                    <span>
                      Sempre mantenha a negociação no chat e não envie ou peça telefone ou e-mail.
                    </span>
                  </li>
                  <li className="flex gap-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    <span className="text-blue-600 font-bold shrink-0 mt-0.5">2.</span>
                    <span>
                      Realize pagamento apenas após receber o produto em mãos, ou quando confirmar a realização do serviço.
                    </span>
                  </li>
                  <li className="flex gap-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    <span className="text-blue-600 font-bold shrink-0 mt-0.5">3.</span>
                    <span>
                      Confira os dados de segurança no perfil do usuário e seu histórico de negociações.
                    </span>
                  </li>
                  <li className="flex gap-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    <span className="text-blue-600 font-bold shrink-0 mt-0.5">4.</span>
                    <span>
                      A Chama Frete nunca envia pedidos de pagamento de produto ou serviços por e-mail ou celular.
                    </span>
                  </li>
                  <li className="flex gap-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    <span className="text-blue-600 font-bold shrink-0 mt-0.5">5.</span>
                    <span>
                      Viu algum comportamento diferente do padrão? Desconfie e{' '}
                      <button
                        onClick={() => setShowReportForm(true)}
                        className="text-blue-600 dark:text-blue-400 font-bold hover:underline inline"
                      >
                        denuncie
                      </button>
                      .
                    </span>
                  </li>
                </ul>
                <Button onClick={() => setShowSafetyModal(false)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold">
                  Ok, entendi
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
