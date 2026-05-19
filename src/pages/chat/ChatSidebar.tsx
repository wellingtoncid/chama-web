import { useState } from 'react';
import { Search, Inbox } from 'lucide-react';


interface ChatRoom {
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

interface ChatSidebarProps {
  rooms: ChatRoom[];
  loading: boolean;
  selectedRoomId?: number;
  onSelectRoom: (roomId: number) => void;
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

function formatTime(dateStr: string | null): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'agora';
  if (diffMin < 60) return `${diffMin} min`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

export default function ChatSidebar({ rooms, loading, selectedRoomId, onSelectRoom }: ChatSidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const sortedRooms = [...rooms].sort((a, b) => {
    const aTime = a.last_message_time ? new Date(a.last_message_time).getTime() : 0;
    const bTime = b.last_message_time ? new Date(b.last_message_time).getTime() : 0;
    return bTime - aTime;
  });

  const filteredRooms = sortedRooms.filter(room =>
    room.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.freight_product?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-slate-200 dark:border-slate-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Buscar conversas..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:text-slate-200 dark:placeholder-slate-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="space-y-1 p-3 animate-pulse">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-center gap-3 p-3">
                <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-28 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-2 w-40 bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredRooms.length > 0 ? (
          <div>
            {filteredRooms.map(room => {
              const isSelected = room.room_id === selectedRoomId;
              return (
                <button
                  key={room.room_id}
                  onClick={() => onSelectRoom(room.room_id)}
                  className={`w-full flex items-center gap-3 p-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                    isSelected ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                  }`}
                >
                  <div className="relative shrink-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${getAvatarColor(room.contact_name)}`}>
                      {getInitials(room.contact_name)}
                    </div>
                    {room.unread_count > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-black min-w-[18px] h-[18px] rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 px-1">
                        {room.unread_count > 99 ? '99+' : room.unread_count}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className={`text-sm font-bold truncate ${isSelected ? 'text-blue-700 dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}>
                        {room.contact_name}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap ml-2">
                        {formatTime(room.last_message_time)}
                      </span>
                    </div>
                    <p className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold truncate">
                      {room.freight_product}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {room.last_message || 'Inicie uma conversa...'}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="p-10 text-center">
            <Inbox size={28} className="text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              {searchTerm ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa ainda'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
