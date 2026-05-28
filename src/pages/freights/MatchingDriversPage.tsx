import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDriverMatching } from '@/hooks/useDriverMatching';
import { api } from '@/api/api';
import {
  ArrowLeft,
  MapPin,
  Truck,
  MessageCircle,
  Loader2,
  Navigation,
  ShieldCheck,
  User,
  Phone,
  Share2,
  Copy,
  ExternalLink,
  Eye,
  Headphones,
  Filter,
  CheckCircle2,
  X,
  UserCheck
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import DashboardShell from '../../components/layout/DashboardShell';

export default function MatchingDriversPage() {
  const { freightId } = useParams<{ freightId: string }>();
  const navigate = useNavigate();
  const { loading, error, drivers, freight, findDrivers, getDistanceLabel, getMatchScoreLabel } = useDriverMatching();
  const [radiusKm, setRadiusKm] = useState(100);
  const [copied, setCopied] = useState(false);
  const [showRadiusModal, setShowRadiusModal] = useState<{ km: number; action: 'expand' | 'edit' } | null>(null);

  useEffect(() => {
    if (freightId) {
      findDrivers(parseInt(freightId), radiusKm);
    }
  }, [freightId, radiusKm]);

  const handleEditFreight = async () => {
    if (!freightId) return;

    try {
      const res = await api.get('/list-my-freights');
      const freights = res.data?.data || [];
      const freightData = freights.find((f: { id: number }) => f.id === parseInt(freightId));

      if (freightData) {
        navigate(`/novo-frete`, { state: { editData: freightData } });
      } else {
        navigate(`/novo-frete`, { state: { editData: freight } });
      }
    } catch {
      navigate(`/novo-frete`, { state: { editData: freight } });
    }
  };

  const handleRadiusChange = (km: number) => {
    setShowRadiusModal({ km, action: 'expand' });
  };

  const confirmRadiusChange = () => {
    if (showRadiusModal && showRadiusModal.action === 'expand') {
      setRadiusKm(showRadiusModal.km);
    }
    setShowRadiusModal(null);
  };

  const handleAcceptDriver = async (driverId: number) => {
    try {
      const res = await api.post('/accept-driver', { freight_id: parseInt(freightId!), driver_id: driverId });
      if (res.data?.success) {
        navigate('/dashboard/logistica');
      } else {
        alert(res.data?.message || 'Erro ao aceitar motorista');
      }
    } catch {
      alert('Erro ao aceitar motorista. Tente novamente.');
    }
  };

  const handleContactWhatsApp = (whatsapp: string | undefined, name: string) => {
    if (!whatsapp) return;
    const cleanNumber = whatsapp.replace(/\D/g, '');
    const url = `https://wa.me/55${cleanNumber}?text=${encodeURIComponent(
      `Olá ${name}! Vi seu perfil no Chama Frete e gostaria de combinar um frete.`
    )}`;
    window.open(url, '_blank');
  };

  const shareWhatsApp = () => {
    const text = `🔍 Olá! Estou procurando motoristas para um frete no Chama Frete.\n\n🚚 De: ${freight?.origin_city || 'Origem'}\n📍 Para: ${freight?.dest_city || 'Destino'}\n🚛 Veículo: ${freight?.vehicle_type}\n\nAcesse: ${window.location.origin}/frete/${freight?.slug || freightId}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/frete/${freight?.slug || freightId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const freightUrl = `${window.location.origin}/frete/${freight?.slug || freightId}`;

  // Loading skeleton
  if (loading) {
    return (
      <DashboardShell
        title="Motoristas Compatíveis"
        description="Buscando motoristas..."
      >
        <div className="space-y-4 animate-pulse">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i}>
                  <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                  <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700">
            <Loader2 size={48} className="animate-spin text-orange-500 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">Buscando motoristas compatíveis...</p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">Analisando localização e perfil dos motoristas</p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title={
        <span>
          Motoristas <span className="text-orange-500">Compatíveis</span>
        </span>
      }
      description={freight ? `${freight.origin_city} → ${freight.dest_city} • ${freight.vehicle_type} • ${freight.body_type}` : undefined}
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard/logistica')}
          >
            <ArrowLeft size={14} /> Voltar
          </Button>
          {freight?.slug && (
            <a
              href={`/frete/${freight.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors"
            >
              <Eye size={14} />
              Ver Frete
            </a>
          )}
        </div>
      }
    >
      {/* Freight Summary Card */}
      {freight && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase italic mb-4">Resumo do Frete</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Origem</p>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{freight.origin_city} - {freight.origin_state}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Destino</p>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{freight.dest_city} - {freight.dest_state}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Veículo</p>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{freight.vehicle_type}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Carroceria</p>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{freight.body_type}</p>
            </div>
          </div>
          {(freight.equipment_needed?.length > 0 || freight.certifications_needed?.length > 0) && (
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex flex-wrap gap-4">
              {freight.equipment_needed?.length > 0 && (
                <div>
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Equipamentos</p>
                  <div className="flex flex-wrap gap-2">
                    {freight.equipment_needed.map((eq: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-medium">
                        {eq}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {freight.certifications_needed?.length > 0 && (
                <div>
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Certificações</p>
                  <div className="flex flex-wrap gap-2">
                    {freight.certifications_needed.map((cert: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-medium">
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 text-center border border-red-100 dark:border-red-900">
          <p className="text-red-500 dark:text-red-400 font-medium mb-4">{error}</p>
          <Button
            variant="default"
            onClick={() => freightId && findDrivers(parseInt(freightId), radiusKm)}
          >
            Tentar Novamente
          </Button>
        </div>
      )}

      {/* Empty State with Tips */}
      {!loading && !error && drivers.length === 0 && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-10 text-center border border-slate-100 dark:border-slate-700 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <Navigation size={40} className="text-slate-300 dark:text-slate-600" />
            </div>
            <h3 className="text-xl font-black text-slate-700 dark:text-white uppercase italic mb-2">
              Nenhum motorista encontrado
            </h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium mb-6">
              Sua busca por:
            </p>

            <div className="flex flex-wrap justify-center gap-2 mb-8 max-w-md mx-auto">
              <span className="px-3 py-1.5 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg text-xs font-medium border border-orange-100 dark:border-orange-800">
                📍 {radiusKm}km de {freight?.origin_city || 'Origem'}
              </span>
              {freight?.vehicle_type && (
                <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-medium">
                  🚛 {freight.vehicle_type}
                </span>
              )}
              {freight?.body_type && (
                <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-medium">
                  📦 {freight.body_type}
                </span>
              )}
              {freight?.equipment_needed?.map((eq: string, i: number) => (
                <span key={i} className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-medium">
                  ⚙️ {eq}
                </span>
              ))}
              {freight?.certifications_needed?.map((cert: string, i: number) => (
                <span key={i} className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-medium">
                  📜 {cert}
                </span>
              ))}
            </div>

            <div className="text-left space-y-4 max-w-lg mx-auto">
              <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase italic flex items-center gap-2">
                💡 DICAS PARA ENCONTRAR MOTORISTAS:
              </h4>

              <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
                <p className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase italic mb-3">
                  🔹 Amplie o raio de busca
                </p>
                <div className="flex flex-wrap gap-2">
                  {[50, 100, 200, 500].map((km) => (
                    <button
                      key={km}
                      onClick={() => handleRadiusChange(km)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        radiusKm === km
                          ? 'bg-orange-500 text-white shadow-lg shadow-orange-200 dark:shadow-orange-900'
                          : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:border-orange-300 dark:hover:border-orange-500'
                      }`}
                    >
                      {km}km
                    </button>
                  ))}
                  <button
                    onClick={() => handleRadiusChange(2000)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      radiusKm === 2000
                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-200 dark:shadow-orange-900'
                        : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:border-orange-300 dark:hover:border-orange-500'
                    }`}
                  >
                    Qualquer
                  </button>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
                <p className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase italic mb-3">
                  🔹 Divulgue este frete nas redes sociais
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="default"
                    onClick={shareWhatsApp}
                    className="bg-green-500 hover:bg-green-600 text-white border-none"
                  >
                    <MessageCircle size={14} />
                    WhatsApp
                  </Button>
                  <Button
                    variant="default"
                    onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(freightUrl)}`, '_blank')}
                    className="bg-blue-600 hover:bg-blue-700 text-white border-none"
                  >
                    <Share2 size={14} />
                    Facebook
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={copyLink}
                  >
                    {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                    {copied ? 'Copiado!' : 'Copiar Link'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.open(freightUrl, '_blank')}
                  >
                    <ExternalLink size={14} />
                    Ver Frete
                  </Button>
                </div>
              </div>

              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-2xl p-5 border border-orange-100 dark:border-orange-800">
                <p className="text-xs font-black text-slate-700 dark:text-orange-300 uppercase italic mb-1">
                  🔹 Solicite motoristas específicos
                </p>
                <p className="text-xs text-slate-500 dark:text-orange-200/70 mb-3">
                  Nossa equipe pode ajudar a encontrar profissionais para sua carga.
                </p>
                <a
                  href="/dashboard/suporte"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors"
                >
                  <Headphones size={14} />
                  Falar com Suporte
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Drivers List */}
      {!loading && !error && drivers.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {drivers.length} motorista{drivers.length > 1 ? 's' : ''} encontrado{drivers.length > 1 ? 's' : ''}
            </p>
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-slate-400 dark:text-slate-500" />
              <select
                value={radiusKm}
                onChange={(e) => setRadiusKm(parseInt(e.target.value))}
                className="text-xs font-medium text-slate-600 dark:text-slate-400 bg-transparent border-none cursor-pointer"
              >
                <option value={50}>50km</option>
                <option value={100}>100km</option>
                <option value={200}>200km</option>
                <option value={500}>500km</option>
              </select>
            </div>
          </div>

          {drivers.map((driver) => {
            const scoreInfo = getMatchScoreLabel(driver.match_score || 0);

            return (
              <div
                key={driver.driver_id}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-lg hover:border-orange-200 dark:hover:border-orange-800 transition-all"
              >
                <div className="flex items-start gap-6">
                  {/* Avatar */}
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-700 flex-shrink-0 overflow-hidden">
                    {driver.avatar_url ? (
                      <img
                        src={driver.avatar_url}
                        alt={driver.driver_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-orange-100 dark:bg-orange-900/30">
                        <User size={24} className="text-orange-400" />
                      </div>
                    )}
                  </div>

                  {/* Main Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-black uppercase italic text-slate-900 dark:text-white">
                            {driver.driver_name}
                          </h3>
                          {driver.verification_status === 'verified' && (
                            <ShieldCheck size={20} className="text-green-500 flex-shrink-0" />
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1.5">
                            <MapPin size={14} />
                            {driver.home_city}/{driver.home_state}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Navigation size={14} />
                            {getDistanceLabel(driver.distance_km || 0)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Truck size={14} />
                            {driver.vehicle_type}
                          </span>
                        </div>
                      </div>

                      {/* Match Score */}
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full"
                              style={{ width: `${driver.match_score || 0}%` }}
                            />
                          </div>
                          <span className={`text-sm font-bold ${scoreInfo.color}`}>
                            {scoreInfo.label}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest">Compatibilidade</p>
                      </div>
                    </div>

                    {driver.available_equipment?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Equipamentos:</span>
                        {driver.available_equipment.map((eq: string, i: number) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-medium"
                          >
                            {eq}
                          </span>
                        ))}
                      </div>
                    )}

                    {driver.available_certifications?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Certificações:</span>
                        {driver.available_certifications.map((cert: string, i: number) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-medium"
                          >
                            {cert}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                      <a
                        href={`/perfil/${driver.driver_slug}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                      >
                        <User size={14} />
                        Ver Perfil
                      </a>
                      {driver.driver_whatsapp && (
                        <Button
                          variant="default"
                          onClick={() => handleContactWhatsApp(driver.driver_whatsapp, driver.driver_name)}
                          className="bg-green-500 hover:bg-green-600 text-white border-none shadow-lg shadow-green-500/20"
                        >
                          <MessageCircle size={14} />
                          WhatsApp
                        </Button>
                      )}
                      {driver.driver_phone && (
                        <a
                          href={`tel:${driver.driver_phone}`}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20"
                        >
                          <Phone size={14} />
                          Ligar
                        </a>
                      )}
                      <Button
                        variant="default"
                        onClick={() => handleAcceptDriver(driver.driver_id)}
                        className="bg-orange-500 hover:bg-orange-600 text-white border-none shadow-lg shadow-orange-500/20"
                      >
                        <UserCheck size={14} />
                        Aceitar Motorista
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Radius Confirmation Modal */}
      {showRadiusModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black uppercase italic text-slate-900 dark:text-white">
                AMPLIAR RAIO DE BUSCA
              </h3>
              <button onClick={() => setShowRadiusModal(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <p className="text-slate-600 dark:text-slate-400">
                Para encontrar mais motoristas, você pode ampliar o raio de busca para <strong className="text-orange-500">{showRadiusModal.km}km</strong>.
              </p>
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4">
                <p className="text-sm text-orange-700 dark:text-orange-400">
                  💡 Você também pode <strong>editar seu anúncio</strong> para ser mais atrativo aos motoristas.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRadiusModal(null);
                  handleEditFreight();
                }}
                className="flex-1"
              >
                EDITAR ANÚNCIO
              </Button>
              <Button
                variant="default"
                onClick={confirmRadiusChange}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white border-none"
              >
                AMPLIAR RAIO
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
