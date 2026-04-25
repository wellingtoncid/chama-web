import { useState, useEffect, useCallback } from 'react';
import { api } from '@/api/api';

export interface WidgetConfig {
  widget_key: string;
  widget_type: 'kpi' | 'chart_bar' | 'chart_line' | 'ranking' | 'table' | 'gauge';
  position_order: number;
  col_span: number;
  is_visible?: boolean;
  filters?: Record<string, any>;
}

export interface AvailableWidget {
  widget_key: string;
  widget_type: string;
  label: string;
  description: string;
  icon: string;
  category: string;
  required_permission?: string;
}

export interface DashboardData {
  user_widgets: WidgetConfig[];
  available_widgets: AvailableWidget[];
}

export function useDashboardWidgets(user: any) {
  const [widgets, setWidgets] = useState<WidgetConfig[]>([]);
  const [availableWidgets, setAvailableWidgets] = useState<AvailableWidget[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWidgets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/admin/dashboard/widgets');
      if (res.data?.success) {
        setWidgets(res.data.data.user_widgets || []);
        setAvailableWidgets(res.data.data.available_widgets || []);
      }
    } catch (e) {
      console.error('Error fetching widgets:', e);
      setError('Erro ao carregar widgets');
    } finally {
      setLoading(false);
    }
  }, []);

  const saveWidgets = useCallback(async (newWidgets: WidgetConfig[]) => {
    try {
      setSaving(true);
      setError(null);
      const res = await api.put('/admin/dashboard/widgets', {
        widgets: newWidgets.map((w, idx) => ({
          widget_key: w.widget_key,
          widget_type: w.widget_type,
          col_span: w.col_span
        }))
      });
      if (res.data?.success) {
        setWidgets(newWidgets);
        return true;
      }
      setError(res.data?.message || 'Erro ao salvar');
      return false;
    } catch (e) {
      console.error('Error saving widgets:', e);
      setError('Erro ao salvar widgets');
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  const resetWidgets = useCallback(async () => {
    try {
      setSaving(true);
      setError(null);
      const res = await api.post('/admin/dashboard/widgets/reset');
      if (res.data?.success) {
        await fetchWidgets();
        return true;
      }
      return false;
    } catch (e) {
      console.error('Error resetting widgets:', e);
      setError('Erro ao resetar widgets');
      return false;
    } finally {
      setSaving(false);
    }
  }, [fetchWidgets]);

  const fetchAvailableWidgets = useCallback(async () => {
    try {
      const res = await api.get('/admin/dashboard/widgets/available');
      if (res.data?.success) {
        setAvailableWidgets(res.data.data || []);
      }
    } catch (e) {
      console.error('Error fetching available widgets:', e);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchWidgets();
    }
  }, [user, fetchWidgets]);

  return {
    widgets,
    availableWidgets,
    loading,
    saving,
    error,
    fetchWidgets,
    saveWidgets,
    resetWidgets,
    fetchAvailableWidgets
  };
}