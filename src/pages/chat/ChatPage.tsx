import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../api/api';
import ChatSidebar from './ChatSidebar';
import ChatRoom from './ChatRoom';
import AdCard from '../../components/shared/AdCard';
import { MessageSquare } from 'lucide-react';

interface ChatRoomItem {
  room_id: number;
  freight_id: number;
  freight_product: string;
  contact_id: number;
  contact_name: string;
  contact_avatar: string | null;
  last_message: string | null;
  last_message_time: string | null;
  unread_count: number;
}

export default function ChatPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<ChatRoomItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRooms() {
      try {
        const res = await api.get('/chat/rooms');
        if (res.data.success) setRooms(res.data.data);
      } catch (err) {
        console.error('Erro ao carregar conversas', err);
      } finally {
        setLoading(false);
      }
    }
    fetchRooms();
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-128px)] lg:h-[calc(100vh-88px)] -mb-32">
      <div className="max-w-4xl mx-auto w-full">
        <AdCard position="chat_header" variant="ecommerce" />
      </div>
      <div className="flex min-h-0 flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden mt-3">
      <div className={`w-full lg:w-[360px] lg:border-r border-slate-200 dark:border-slate-700 flex flex-col shrink-0 ${
        roomId ? 'hidden lg:flex' : 'flex'
      }`}>
        <ChatSidebar
          rooms={rooms}
          loading={loading}
          selectedRoomId={roomId ? Number(roomId) : undefined}
          onSelectRoom={(id) => navigate(`/chat/${id}`)}
        />
      </div>

      <div className={`flex-1 flex flex-col min-w-0 ${
        !roomId ? 'hidden lg:flex' : 'flex'
      }`}>
        {roomId ? (
          <ChatRoom
            roomId={Number(roomId)}
            onBack={() => navigate('/chat')}
            initialRoomData={rooms.find(r => r.room_id === Number(roomId))}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-slate-50/30 dark:bg-slate-950/30">
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MessageSquare size={28} className="text-slate-300 dark:text-slate-600" />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 uppercase italic text-sm">Selecione uma conversa</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Escolha um chat ao lado para começar</p>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
