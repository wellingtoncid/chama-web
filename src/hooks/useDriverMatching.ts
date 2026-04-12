import { useState, useCallback } from 'react';
import { api } from '@/api/api';

export interface MatchingDriver {
  driver_id: number;
  driver_name: string;
  driver_slug: string;
  driver_whatsapp?: string;
  vehicle_type: string;
  body_type: string;
  home_city: string;
  home_state: string;
  service_radius_km: number;
  available_equipment: string[];
  avatar_url: string | null;
  verification_status: string;
  profile_completeness: number;
  distance_km: number;
  match_score: number;
}

export interface MatchingFreight {
  id: number;
  slug?: string;
  user_id?: number;
  origin_state?: string;
  origin_city?: string;
  dest_state?: string;
  dest_city?: string;
  origin?: string;
  destination?: string;
  product?: string;
  weight?: string;
  vehicle_type?: string;
  body_type?: string;
  price?: string;
  description?: string;
  contact_preference?: string;
  equipment_needed?: string[];
  certifications_needed?: string[];
}

export interface MatchingResponse {
  success: boolean;
  freight_id?: number;
  freight?: MatchingFreight;
  drivers: MatchingDriver[];
  total: number;
  message?: string;
}

export function useDriverMatching() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drivers, setDrivers] = useState<MatchingDriver[]>([]);
  const [freight, setFreight] = useState<MatchingFreight | null>(null);

  const findDrivers = useCallback(async (freightId: number, maxDistanceKm = 200): Promise<MatchingResponse | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await api.get(`/freight/${freightId}/matching-drivers`, {
        params: { max_distance_km: maxDistanceKm }
      });
      
      if (res.data?.success) {
        setDrivers(res.data.drivers || []);
        setFreight(res.data.freight || null);
        return res.data;
      } else {
        setError(res.data?.message || 'Erro ao buscar motoristas');
        return null;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro de conexão';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getDistanceLabel = (km: number): string => {
    if (km < 1) return `${Math.round(km * 1000)}m`;
    if (km < 10) return `${km.toFixed(1)}km`;
    return `${Math.round(km)}km`;
  };

  const getMatchScoreLabel = (score: number): { label: string; color: string } => {
    if (score >= 80) return { label: 'Excelente', color: 'text-green-600' };
    if (score >= 60) return { label: 'Bom', color: 'text-blue-600' };
    if (score >= 40) return { label: 'Regular', color: 'text-yellow-600' };
    return { label: 'Baixo', color: 'text-gray-600' };
  };

  return {
    loading,
    error,
    drivers,
    freight,
    findDrivers,
    getDistanceLabel,
    getMatchScoreLabel,
    reset: () => {
      setDrivers([]);
      setFreight(null);
      setError(null);
    }
  };
}

export function useProfileCompleteness() {
  const [loading, setLoading] = useState(false);
  const [completeness, setCompleteness] = useState<{
    score: number;
    completed: string[];
    missing: string[];
    is_complete: boolean;
  } | null>(null);

  const checkCompleteness = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/profile/completeness');
      if (res.data?.success) {
        setCompleteness(res.data.data);
        return res.data.data;
      }
    } catch (err) {
      console.error('Erro ao verificar completude:', err);
    } finally {
      setLoading(false);
    }
    return null;
  }, []);

  const getMissingFields = (): string[] => {
    if (!completeness) return [];
    return completeness.missing;
  };

  const getFieldLabel = (field: string): string => {
    const labels: Record<string, string> = {
      name: 'Nome completo',
      bio: 'Biografia/descrição',
      avatar: 'Foto de perfil',
      vehicle_type: 'Tipo de veículo',
      body_type: 'Tipo de carroceria',
      location: 'Localização/base',
      rntrc: 'RNTRC',
      verification: 'Verificação de documentos'
    };
    return labels[field] || field;
  };

  return {
    loading,
    completeness,
    checkCompleteness,
    getMissingFields,
    getFieldLabel,
    isComplete: completeness?.is_complete ?? false,
    score: completeness?.score ?? 0
  };
}

export function useGeocoding() {
  const [loading, setLoading] = useState(false);

  const geocodeCep = useCallback(async (cep: string) => {
    setLoading(true);
    try {
      const res = await api.get('/geocode/cep', { params: { cep } });
      if (res.data?.success) {
        return res.data.data;
      }
      return null;
    } catch (err) {
      console.error('Erro ao geocodificar CEP:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateLocation = useCallback(async (lat: number, lng: number, city?: string, state?: string, cep?: string) => {
    setLoading(true);
    try {
      const res = await api.post('/driver/location', { lat, lng, city, state, cep });
      return res.data?.success ?? false;
    } catch (err) {
      console.error('Erro ao atualizar localização:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    geocodeCep,
    updateLocation
  };
}
