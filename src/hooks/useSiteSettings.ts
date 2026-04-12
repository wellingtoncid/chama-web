import { useState, useEffect, useCallback } from 'react';
import { api } from '@/api/api';

export interface SiteSettings {
  vehicle_types: string[];
  body_types: string[];
  equipment_types: string[];
  certification_types: string[];
}

const DEFAULT_SETTINGS: SiteSettings = {
  vehicle_types: [
    'Caminhão Truck',
    'Caminhão Toco',
    'Caminhão Baú',
    'Caminhão Plataforma',
    'Caminhão Refrigerado',
    'Caminhão Tanque',
    'Caminhão Caçamba',
    'Cavalo Mecânico',
    'Carreta',
    'Bitrem',
    'Rodotrem',
    'Van',
    'Utilitário',
    'Pickup',
    'Ônibus',
    'Moto',
    'Outros',
  ],
  body_types: [
    'Baú',
    'Plataforma',
    'Sider',
    'Graneleiro',
    'Tanque',
    'Caçamba',
    'Porta-container',
    'Frigorífico',
    'Aberto',
    'Grades',
  ],
  equipment_types: [
    'Plataforma Elevatória',
    'Rastreador GPS',
    'Guincho',
    'Dolly',
    'Cegonheira',
    'Munck',
    ' Empilhadeira',
  ],
  certification_types: [
    'MOPP',
    'Transporte Coletivo',
    'Transporte Escolar',
    'Carga Indivisível',
    'Emergência',
    'PID',
  ],
};

const CACHE_KEY = '@ChamaFrete:siteSettings';
const CACHE_DURATION = 5 * 60 * 1000;

interface CacheData {
  data: SiteSettings;
  timestamp: number;
}

function getCachedSettings(): SiteSettings | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed: CacheData = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < CACHE_DURATION) {
        return parsed.data;
      }
    }
  } catch {
    // ignore
  }
  return null;
}

function setCachedSettings(settings: SiteSettings): void {
  try {
    const cacheData: CacheData = { data: settings, timestamp: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch {
    // ignore
  }
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async (forceRefresh = false) => {
    if (!forceRefresh) {
      const cached = getCachedSettings();
      if (cached) {
        setSettings(cached);
        setLoading(false);
        return cached;
      }
    }

    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/public/site-settings');
      
      if (res.data?.success && res.data?.data) {
        const data = res.data.data;
        const parsed: SiteSettings = {
          vehicle_types: data.vehicle_types ? JSON.parse(data.vehicle_types) : DEFAULT_SETTINGS.vehicle_types,
          body_types: data.body_types ? JSON.parse(data.body_types) : DEFAULT_SETTINGS.body_types,
          equipment_types: data.equipment_types ? JSON.parse(data.equipment_types) : DEFAULT_SETTINGS.equipment_types,
          certification_types: data.certification_types ? JSON.parse(data.certification_types) : DEFAULT_SETTINGS.certification_types,
        };
        setSettings(parsed);
        setCachedSettings(parsed);
        return parsed;
      }
      
      setSettings(DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    } catch (err) {
      console.error('Error fetching site settings:', err);
      setError('Erro ao carregar configurações');
      setSettings(DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const refresh = useCallback(() => fetchSettings(true), [fetchSettings]);

  return {
    settings,
    loading,
    error,
    refresh,
    vehicleTypes: settings.vehicle_types,
    bodyTypes: settings.body_types,
    equipmentTypes: settings.equipment_types,
    certificationTypes: settings.certification_types,
  };
}

export { DEFAULT_SETTINGS };
