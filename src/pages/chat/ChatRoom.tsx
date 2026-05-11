import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/api/api';
import { Send, ArrowLeft, Loader2, MessageSquare } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

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
}

export default function ChatRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadMessages = async () => {
    try {
      setError(null);
      const res = await api.get(`/chat/messages/${roomId}`);
      if (res.data.success) {
        setMessages(res.data.data);
      }
    } catch {
      setError("Erro ao carregar mensagens");
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
        setMessages(prev => [...prev, {
          id: res.data.message_id,
          room_id: Number(roomId),
          sender_id: user?.id ?? 0,
          message: newMessage,
          created_at: new Date().toISOString(),
          sender_name: ''
        }]);
        setNewMessage("");
      }
    } catch {
      alert("Erro ao enviar mensagem");
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    loadMessages();
    loadRoomInfo();
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [roomId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 dark:text-slate-400 font-medium">{error}</p>
          <button onClick={loadMessages} className="mt-2 text-blue-600 text-sm font-bold">Tentar novamente</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] lg:h-[calc(100vh-120px)] bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/chat')} className="lg:hidden">
            <ArrowLeft size={20} className="text-slate-600 dark:text-slate-400" />
          </button>
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white shrink-0">
            <MessageSquare size={18} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white text-sm">
              {roomInfo?.contact_name || "Negociação de Frete"}
            </h3>
              {roomInfo?.freight_product && (
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-black uppercase tracking-widest">
                {roomInfo.freight_product}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30 dark:bg-slate-950/30">
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
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 flex gap-2">
        <input 
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Digite sua mensagem..."
          className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none dark:placeholder-slate-500"
        />
        <button 
          disabled={sending}
          className="bg-blue-600 text-white p-3 rounded-xl hover:bg-slate-900 dark:hover:bg-blue-700 transition-all disabled:opacity-50 shrink-0"
        >
          {sending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
        </button>
      </form>
    </div>
  );
}
