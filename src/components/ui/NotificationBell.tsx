import { useState } from 'react';
import { useNotificationBell } from '@/hooks/useNotifications';
import { Bell, Check, CheckCheck, X, AlertTriangle, Users, Truck, MessageCircle } from 'lucide-react';

const TYPE_ICONS: Record<string, React.ReactNode> = {
  profile_incomplete: <AlertTriangle size={16} className="text-orange-500" />,
  new_match: <Users size={16} className="text-blue-500" />,
  freight_invite: <Truck size={16} className="text-green-500" />,
  new_message: <MessageCircle size={16} className="text-purple-500" />,
  system: <Bell size={16} className="text-slate-500" />
};

const TYPE_COLORS: Record<string, string> = {
  profile_incomplete: 'border-l-orange-500 bg-orange-50/50',
  new_match: 'border-l-blue-500 bg-blue-50/50',
  freight_invite: 'border-l-green-500 bg-green-50/50',
  high: 'border-l-red-500 bg-red-50/50',
  normal: 'border-l-slate-300'
};

export default function NotificationBell() {
  const { notifications, unreadCount, loading, isOpen, open, close, markAsRead, markAllAsRead } = useNotificationBell();
  const [showAll, setShowAll] = useState(false);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={open}
        className="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <Bell size={22} className="text-slate-600 dark:text-slate-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={close}
          />

          {/* Panel */}
          <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-black uppercase italic text-sm">
                Notificações
                {unreadCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">
                    {unreadCount}
                  </span>
                )}
              </h3>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    title="Marcar todas como lidas"
                  >
                    <CheckCheck size={16} className="text-slate-500" />
                  </button>
                )}
                <button
                  onClick={close}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X size={16} className="text-slate-500" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {loading && notifications.length === 0 ? (
                <div className="flex items-center justify-center py-10">
                  <div className="animate-spin w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="py-10 text-center">
                  <Bell size={32} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-sm text-slate-500">Nenhuma notificação</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {(showAll ? notifications : notifications.slice(0, 5)).map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => {
                        if (!notification.is_read) {
                          markAsRead(notification.id);
                        }
                        if (notification.link) {
                          window.location.href = notification.link;
                        }
                      }}
                      className={`px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer border-l-4 ${
                        notification.is_read 
                          ? 'opacity-60 border-l-transparent' 
                          : TYPE_COLORS[notification.type] || 'border-l-slate-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {TYPE_ICONS[notification.type] || TYPE_ICONS.system}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-bold text-sm truncate">
                              {notification.title}
                            </p>
                            <span className="text-[10px] text-slate-400 whitespace-nowrap">
                              {formatTime(notification.created_at)}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                            {notification.message}
                          </p>
                          {!notification.is_read && (
                            <span className="inline-block w-2 h-2 bg-orange-500 rounded-full mt-1.5" />
                          )}
                        </div>
                        {notification.is_read ? (
                          <Check size={14} className="text-slate-300 mt-1" />
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                          >
                            <Check size={14} className="text-slate-400" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {notifications.length > 5 && !showAll && (
                <button
                  onClick={() => setShowAll(true)}
                  className="w-full py-3 text-center text-xs font-bold text-orange-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Ver todas ({notifications.length})
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
