import { useState, useEffect } from 'react';
import { api } from '../api/api';
import { 
  Layout, Home, FileText, Bell, AlertTriangle, 
  Star as StarIcon, Maximize2, Repeat, Smartphone, Monitor, Truck
} from 'lucide-react';

export const AD_ICON_MAP: Record<string, any> = {
  layout: Layout,
  home: Home,
  'file-text': FileText,
  bell: Bell,
  'alert-triangle': AlertTriangle,
  star: StarIcon,
  maximize: Maximize2,
  repeat: Repeat,
  smartphone: Smartphone,
  monitor: Monitor,
  truck: Truck,
};

export const AD_COLOR_MAP: Record<string, string> = {
  sidebar: 'from-blue-500 to-cyan-600',
  header: 'from-purple-500 to-indigo-600',
  footer: 'from-emerald-500 to-teal-600',
  spotlight: 'from-amber-500 to-yellow-600',
  infeed: 'from-pink-500 to-rose-600',
  interstitial: 'from-fuchsia-500 to-pink-600',
  return_banner: 'from-red-500 to-orange-600',
  details: 'from-sky-500 to-blue-600',
  sponsor_section: 'from-indigo-500 to-blue-600',
  floating_button: 'from-violet-500 to-purple-600',
  freight_list: 'from-green-500 to-emerald-600',
  popup: 'from-rose-500 to-pink-600',
  strategic_partners: 'from-yellow-500 to-amber-600',
  media_network: 'from-cyan-500 to-teal-600',
};

export interface AdPosition {
  feature_key: string;
  feature_name: string;
  description: string | null;
  ad_size: string | null;
  icon_key: string | null;
  price_monthly: number;
  duration_days: number;
}

export function useAdPositions() {
  const [positions, setPositions] = useState<AdPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPositions = async () => {
      try {
        const res = await api.get('/ad-positions');
        if (res.data?.success) {
          setPositions(res.data.data || []);
        } else {
          setError('Erro ao carregar posições');
        }
      } catch (err) {
        console.error("Erro ao carregar posições de publicidade:", err);
        setError('Erro de conexão');
      } finally {
        setLoading(false);
      }
    };
    loadPositions();
  }, []);

  const getIcon = (iconKey: string | null) => {
    if (!iconKey) return Layout;
    return AD_ICON_MAP[iconKey] || Layout;
  };

  const getColor = (featureKey: string) => {
    return AD_COLOR_MAP[featureKey] || 'from-slate-500 to-slate-600';
  };

  const getPositionByKey = (key: string) => {
    return positions.find(p => p.feature_key === key);
  };

  return { 
    positions, 
    loading, 
    error,
    getIcon,
    getColor,
    getPositionByKey,
    ICON_MAP: AD_ICON_MAP,
    COLOR_MAP: AD_COLOR_MAP
  };
}
