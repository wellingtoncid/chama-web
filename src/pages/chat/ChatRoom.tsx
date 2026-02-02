import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../api/api';
import { Send, ArrowLeft, Loader2, User, Phone } from 'lucide-react';

export default function ChatRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [roomInfo, setRoomInfo] = useState<any>(null);

  const loggedUser = JSON.parse(localStorage.getItem('user') || '{}');

  // Carregar mensagens
  const loadMessages = async () => {
    try {
      const res = await api.get(`/chat/messages/${roomId}`);
      if (res.data.success) {
        setMessages(res.data.data);
      }
    } catch (err) {
      console.error("Erro ao carregar mensagens");
    } finally {
      setLoading(false);
    }
  };

  // Enviar mensagem
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      const receiverId = messages.find(m => m.sender_id !== loggedUser.id)?.sender_id 
                         || roomInfo?.seller_id || roomInfo?.buyer_id;

      const res = await api.post('/chat/send', {
        room_id: roomId,
        message: newMessage,
        receiver_id: receiverId
      });

      if (res.data.success) {
        setMessages([...messages, {
          id: res.data.message_id,
          sender_id: loggedUser.id,
          message: newMessage,
          created_at: new Date().toISOString()
        }]);
        setNewMessage("");
      }
    } catch (err) {
      alert("Erro ao enviar mensagem");
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 5000); // Atualiza a cada 5 segundos
    return () => clearInterval(interval);
  }, [roomId]);

  useEffect(() => {
    // Scroll para o fim quando chegar nova mensagem
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (loading) return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] lg:h-[calc(100vh-120px)] bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header do Chat */}
      <div className="p-4 border-b flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/chat')} className="lg:hidden"><ArrowLeft size={20}/></button>
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
            <User size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Negociação de Frete</h3>
            <span className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Online agora</span>
          </div>
        </div>
      </div>

      {/* Área de Mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
        {messages.map((msg, idx) => {
          const isMe = msg.sender_id === loggedUser.id;
          return (
            <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-2xl text-sm font-medium shadow-sm ${
                isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
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

      {/* Input de Mensagem */}
      <form onSubmit={handleSendMessage} className="p-4 bg-white border-t flex gap-2 items-center">
        <input 
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Digite sua mensagem..."
          className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <button 
          disabled={sending}
          className="bg-blue-600 text-white p-3 rounded-xl hover:bg-slate-900 transition-all disabled:opacity-50"
        >
          {sending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
        </button>
      </form>
    </div>
  );
}