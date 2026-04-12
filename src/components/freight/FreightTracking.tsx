import { useState, useEffect } from 'react';
import { api } from '@/api/api';
import { 
  MapPin, Clock, Package, Truck, CheckCircle, 
  CircleDot, AlertCircle, ChevronRight, Loader2
} from 'lucide-react';

interface TrackingEvent {
  id: number;
  status: string;
  description: string;
  latitude?: string;
  longitude?: string;
  created_at: string;
  is_final_step: number;
  driver_name?: string;
  company_name?: string;
}

interface FreightInfo {
  id: number;
  status: string;
  origin_city: string;
  origin_state: string;
  destination_city: string;
  destination_state: string;
  vehicle_type: string;
  cargo_type: string;
  weight: string;
  agreed_amount: string;
  driver_name?: string;
  driver_phone?: string;
  company_name?: string;
}

interface FreightTrackingProps {
  freightId: number;
  onClose?: () => void;
}

const STATUS_ICONS: Record<string, React.ReactNode> = {
  CREATED: <Package size={16} className="text-slate-400" />,
  PUBLISHED: <CircleDot size={16} className="text-blue-500" />,
  MATCH_CONFIRMED: <CheckCircle size={16} className="text-emerald-500" />,
  IN_PROGRESS: <Truck size={16} className="text-orange-500" />,
  IN_TRANSIT: <Truck size={16} className="text-orange-500" />,
  DELIVERED: <CheckCircle size={16} className="text-emerald-600" />,
  COMPLETED: <CheckCircle size={16} className="text-emerald-600" />,
  CANCELLED: <AlertCircle size={16} className="text-red-500" />,
};

const STATUS_LABELS: Record<string, string> = {
  CREATED: 'Frete Criado',
  PUBLISHED: 'Publicado',
  MATCH_CONFIRMED: 'Motorista Confirmado',
  IN_PROGRESS: 'Em Andamento',
  IN_TRANSIT: 'Em Trânsito',
  DELIVERED: 'Entregue',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado',
};

export default function FreightTracking({ freightId, onClose }: FreightTrackingProps) {
  const [loading, setLoading] = useState(true);
  const [freight, setFreight] = useState<FreightInfo | null>(null);
  const [tracking, setTracking] = useState<TrackingEvent[]>([]);

  useEffect(() => {
    loadTracking();
  }, [freightId]);

  const loadTracking = async () => {
    try {
      setLoading(true);
      const res = await api.get('/freight-tracking', {
        params: { freight_id: freightId }
      });

      if (res.data?.success) {
        setFreight(res.data.data.freight);
        setTracking(res.data.data.tracking);
      }
    } catch (e) {
      console.error('Erro ao carregar tracking:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="animate-spin text-orange-500" size={32} />
      </div>
    );
  }

  if (!freight) {
    return (
      <div className="p-8 text-center text-slate-500">
        Frete não encontrado
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-5 text-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black uppercase italic">Rastreamento</h3>
          <span className="text-xs bg-white/20 px-3 py-1 rounded-full">
            Frete #{freight.id}
          </span>
        </div>

        {/* Route */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-[10px] uppercase text-slate-400 mb-1">Origem</p>
            <p className="font-bold">{freight.origin_city} - {freight.origin_state}</p>
          </div>
          <ChevronRight size={20} className="text-slate-500" />
          <div className="flex-1">
            <p className="text-[10px] uppercase text-slate-400 mb-1">Destino</p>
            <p className="font-bold">{freight.destination_city} - {freight.destination_state}</p>
          </div>
        </div>

        {/* Cargo Info */}
        <div className="flex gap-4 mt-4 pt-4 border-t border-white/10">
          <div>
            <p className="text-[10px] uppercase text-slate-400">Carga</p>
            <p className="text-sm font-medium">{freight.cargo_type}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase text-slate-400">Peso</p>
            <p className="text-sm font-medium">{freight.weight} kg</p>
          </div>
          <div>
            <p className="text-[10px] uppercase text-slate-400">Veículo</p>
            <p className="text-sm font-medium">{freight.vehicle_type}</p>
          </div>
        </div>

        {/* Driver Info */}
        {freight.driver_name && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-[10px] uppercase text-slate-400 mb-1">Motorista</p>
            <p className="font-bold">{freight.driver_name}</p>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="p-5">
        <h4 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
          <Clock size={16} />
          Histórico
        </h4>

        {tracking.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <MapPin size={32} className="mx-auto mb-2" />
            <p className="text-sm">Nenhum registro de rastreamento ainda.</p>
          </div>
        ) : (
          <div className="space-y-0">
            {tracking.map((event, index) => (
              <div key={event.id} className="flex gap-4 relative">
                {/* Line */}
                {index < tracking.length - 1 && (
                  <div className="absolute left-[15px] top-8 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700" />
                )}

                {/* Icon */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${
                  event.is_final_step 
                    ? 'bg-emerald-100 text-emerald-600' 
                    : 'bg-slate-100 dark:bg-slate-800'
                }`}>
                  {STATUS_ICONS[event.status] || <CircleDot size={16} className="text-slate-400" />}
                </div>

                {/* Content */}
                <div className="flex-1 pb-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-slate-800 dark:text-white">
                        {STATUS_LABELS[event.status] || event.status}
                      </p>
                      {event.description && (
                        <p className="text-sm text-slate-500 mt-0.5">{event.description}</p>
                      )}
                      {event.driver_name && (
                        <p className="text-xs text-slate-400 mt-1">
                          por {event.driver_name}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 shrink-0">
                      {new Date(event.created_at).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Close Button */}
      {onClose && (
        <div className="p-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-slate-200 dark:bg-slate-700 font-bold text-slate-600 dark:text-slate-300"
          >
            Fechar
          </button>
        </div>
      )}
    </div>
  );
}
