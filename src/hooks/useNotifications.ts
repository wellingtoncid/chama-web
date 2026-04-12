import { useState, useEffect, useCallback } from 'react';
import { api } from '@/api/api';

export interface Notification {
  id: number;
  user_id: number;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  link?: string;
  read_at?: string;
  is_read: boolean;
  priority: 'low' | 'normal' | 'high';
  created_at: string;
}

export function useNotifications(limit = 20) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/list-notifications', { params: { limit } });
      if (res.data?.success) {
        setNotifications(res.data.data || []);
        setUnreadCount(res.data.unread_count || 0);
      }
    } catch (err) {
      console.error('Erro ao carregar notificações:', err);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  const markAsRead = useCallback(async (id: number) => {
    try {
      await api.post('/mark-as-read', { id });
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Erro ao marcar como lida:', err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await api.post('/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Erro ao marcar todas como lidas:', err);
    }
  }, []);

  const checkProfileCompleteness = useCallback(async () => {
    try {
      await api.get('/profile/check-completeness');
    } catch (err) {
      console.error('Erro ao verificar completude:', err);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    checkProfileCompleteness
  };
}

export function useNotificationBell() {
  const { notifications, unreadCount, loading, fetchNotifications, markAsRead, markAllAsRead } = useNotifications(10);
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => {
    setIsOpen(true);
    fetchNotifications();
  }, [fetchNotifications]);

  const close = useCallback(() => setIsOpen(false), []);

  return {
    notifications,
    unreadCount,
    loading,
    isOpen,
    open,
    close,
    markAsRead,
    markAllAsRead
  };
}
