import { useState, useEffect } from 'react';
import { useDriverMatching } from '@/hooks/useDriverMatching';
import { 
  MapPin, 
  Truck, 
  Star, 
  Phone, 
  MessageCircle,
  X,
  Loader2,
  Navigation,
  ShieldCheck,
  User
} from 'lucide-react';

interface MatchingDriversModalProps {
  freightId: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function MatchingDriversModal({ freightId, isOpen, onClose }: MatchingDriversModalProps) {
  const { loading, error, drivers, freight, findDrivers, getDistanceLabel, getMatchScoreLabel } = useDriverMatching();
  const [selectedDriver, setSelectedDriver] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen && freightId) {
      findDrivers(freightId, 200);
    }
  }, [isOpen, freightId, findDrivers]);

  if (!isOpen) return null;

  const handleContactWhatsApp = (whatsapp: string | undefined, name: string) => {
    if (!whatsapp) return;
    const cleanNumber = whatsapp.replace(/\D/g, '');
    const url = `https://wa.me/55${cleanNumber}?text=${encodeURIComponent(
      `Olá ${name}! Vi seu perfil no Chama Frete e gostaria de combinar um frete.`
    )}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-orange-500 to-orange-600">
          <div>
            <h2 className="text-lg font-black text-white uppercase italic">
              Motoristas Compatíveis
            </h2>
            {freight && (
              <p className="text-xs text-white/80">
                {freight.origin} • {freight.vehicle_type} • {freight.body_type}
              </p>
            )}
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-xl transition-colors"
          >
            <X size={24} className="text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 size={40} className="animate-spin text-orange-500 mb-4" />
              <p className="text-slate-500 font-medium">Buscando motoristas próximos...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className="text-red-500 font-medium mb-4">{error}</p>
              <button 
                onClick={() => findDrivers(freightId)}
                className="px-6 py-3 bg-orange-500 text-white rounded-xl font-bold text-sm"
              >
                Tentar Novamente
              </button>
            </div>
          )}

          {!loading && !error && drivers.length === 0 && (
            <div className="text-center py-12">
              <Navigation size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500 font-medium">Nenhum motorista encontrado</p>
              <p className="text-sm text-slate-400 mt-2">
                Não há motoristas disponíveis na região do frete.
              </p>
            </div>
          )}

          {!loading && !error && drivers.length > 0 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 font-medium">
                {drivers.length} motorista{drivers.length > 1 ? 's' : ''} encontrado{drivers.length > 1 ? 's' : ''}
              </p>

              {drivers.map((driver) => {
                const scoreInfo = getMatchScoreLabel(driver.match_score || 0);
                
                return (
                  <div 
                    key={driver.driver_id}
                    className={`bg-slate-50 rounded-2xl p-4 border-2 transition-all cursor-pointer ${
                      selectedDriver === driver.driver_id 
                        ? 'border-orange-500 shadow-lg' 
                        : 'border-transparent hover:border-orange-200'
                    }`}
                    onClick={() => setSelectedDriver(
                      selectedDriver === driver.driver_id ? null : driver.driver_id
                    )}
                  >
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="w-16 h-16 rounded-2xl bg-slate-200 flex-shrink-0 overflow-hidden">
                        {driver.avatar_url ? (
                          <img 
                            src={driver.avatar_url} 
                            alt={driver.driver_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-orange-100">
                            <User size={24} className="text-orange-500" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-black uppercase italic text-sm truncate">
                            {driver.driver_name}
                          </h3>
                          {driver.verification_status === 'verified' && (
                            <ShieldCheck size={16} className="text-green-500 flex-shrink-0" />
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-500 mb-2">
                          <span className="flex items-center gap-1">
                            <MapPin size={12} />
                            {driver.home_city}/{driver.home_state}
                          </span>
                          <span className="flex items-center gap-1">
                            <Navigation size={12} />
                            {getDistanceLabel(driver.distance_km || 0)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                          <span className="px-2 py-1 bg-white rounded-lg text-xs font-medium">
                            {driver.vehicle_type}
                          </span>
                          <span className="px-2 py-1 bg-white rounded-lg text-xs text-slate-600">
                            {driver.body_type}
                          </span>
                        </div>

                        {/* Match Score */}
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-green-400 to-green-500"
                              style={{ width: `${driver.match_score || 0}%` }}
                            />
                          </div>
                          <span className={`text-xs font-bold ${scoreInfo.color}`}>
                            {scoreInfo.label}
                          </span>
                        </div>

                        {/* Equipment badges */}
                        {driver.available_equipment && driver.available_equipment.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {driver.available_equipment.slice(0, 3).map((eq, i) => (
                              <span 
                                key={i}
                                className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-medium"
                              >
                                {eq}
                              </span>
                            ))}
                            {driver.available_equipment.length > 3 && (
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px]">
                                +{driver.available_equipment.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Expanded Actions */}
                    {selectedDriver === driver.driver_id && (
                      <div className="mt-4 pt-4 border-t border-slate-200 flex gap-3">
                        <a
                          href={`/perfil/${driver.driver_slug}`}
                          className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs text-center hover:bg-slate-200 transition-colors"
                        >
                          Ver Perfil
                        </a>
                        {driver.driver_whatsapp && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleContactWhatsApp(driver.driver_whatsapp, driver.driver_name);
                            }}
                            className="flex-1 px-4 py-2 bg-green-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-green-600 transition-colors"
                          >
                            <MessageCircle size={14} />
                            WhatsApp
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50">
          <p className="text-xs text-slate-500 text-center">
            Resultados baseados na distância e compatibilidade de veículo
          </p>
        </div>
      </div>
    </div>
  );
}
