import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/api';
import { MessageSquare, Clock, ChevronRight, Loader2, Search } from 'lucide-react';

export default function ChatList() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchRooms() {
      try {
        const res = await api.get('/chat/rooms');
        if (res.data.success) {
          setRooms(res.data.data);
        }
      } catch (err) {
        console.error("Erro ao carrergar conversas", err);
      } finally {
        setLoading(false);
      }
    }
    fetchRooms();
  }, []);

  const filteredRooms = rooms.filter(room => 
    room.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.freight_product?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-[1000] text-slate-900 uppercase italic">Minhas Mensagens</h1>
          <p className="text-slate-500 text-sm font-medium">Gerencie suas negociações de frete</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Buscar por produto ou nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64 transition-all"
          />
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        {filteredRooms.length > 0 ? (
          <div className="divide-y divide-slate-50">
            {filteredRooms.map((room) => (
              <button
                key={room.room_id}
                onClick={() => navigate(`/chat/${room.room_id}`)}
                className="w-full p-5 md:p-6 flex items-center gap-4 hover:bg-slate-50 transition-all text-left group"
              >
                {/* Avatar / Ícone */}
                <div className="relative">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <MessageSquare size={24} />
                  </div>
                  {room.unread_count > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                      {room.unread_count}
                    </span>
                  )}
                </div>

                {/* Informações da Conversa */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-black text-slate-900 truncate pr-4 uppercase italic text-sm">
                      {room.contact_name}
                    </h4>
                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 whitespace-nowrap">
                      <Clock size={12} /> {room.last_message_time ? new Date(room.last_message_time).toLocaleDateString() : ''}
                    </span>
                  </div>
                  
                  <p className="text-blue-600 text-[10px] font-black uppercase tracking-widest mb-1">
                    Carga: {room.freight_product}
                  </p>
                  
                  <p className="text-slate-500 text-sm truncate font-medium">
                    {room.last_message || "Inicie a conversa agora..."}
                  </p>
                </div>

                <ChevronRight className="text-slate-300 group-hover:text-blue-600 transition-colors" size={20} />
              </button>
            ))}
          </div>
        ) : (
          <div className="p-20 text-center">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="text-slate-300" size={32} />
            </div>
            <h3 className="font-bold text-slate-800 uppercase italic">Nenhuma conversa encontrada</h3>
            <p className="text-slate-500 text-sm mt-2">Interaja com os fretes para iniciar negociações.</p>
          </div>
        )}
      </div>
    </div>
  );
}