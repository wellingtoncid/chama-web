import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDriverMatching } from '@/hooks/useDriverMatching';
import { api } from '@/api/api';
import InviteDriverModal from '@/components/freights/InviteDriverModal';
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
  UserCheck,
  Send,
  Clock,
  Check,
  XCircle,
  MessageSquare
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import DashboardShell from '../../components/layout/DashboardShell';
import { StatsGrid, StatCard } from '@/components/admin';
import Swal from 'sweetalert2';

type TabType = 'matching' | 'invitations' | 'interests';

export default function MatchingDriversPage() {
  const { freightId } = useParams<{ freightId: string }>();
  const navigate = useNavigate();
  const { loading, error, drivers, freight, findDrivers, getDistanceLabel, getMatchScoreLabel } = useDriverMatching();
  const [radiusKm, setRadiusKm] = useState(100);
  const [copied, setCopied] = useState(false);
  const [showRadiusModal, setShowRadiusModal] = useState<{ km: number; action: 'expand' | 'edit' } | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('matching');
  const [invitations, setInvitations] = useState<any[]>([]);
  const [interests, setInterests] = useState<any[]>([]);
  const [loadingInvites, setLoadingInvites] = useState(false);
  const [inviteModalDriver, setInviteModalDriver] = useState<{ id: number; name: string } | null>(null);
  const [pendingDriverIds, setPendingDriverIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (freightId) {
      findDrivers(parseInt(freightId), radiusKm);
    }
  }, [freightId, radiusKm]);

  // Carrega IDs de motoristas com convites existentes p/ desabilitar botão no Matching
  useEffect(() => {
    if (activeTab !== 'matching' || !freightId) return;
    api.get(`/freights/${freightId}/invitations`)
      .then(res => {
        if (res.data?.success) {
          setPendingDriverIds(new Set(res.data.data.map((i: any) => i.driver_id)));
        }
      })
      .catch(() => {});
  }, [activeTab, freightId]);

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

  const loadInvitations = useCallback(async () => {
    if (!freightId) return;
    setLoadingInvites(true);
    try {
      const [resInv, resInt] = await Promise.all([
        api.get(`/freights/${freightId}/invitations`),
        api.get('/company/invitations', { params: { freight_id: freightId } }),
      ]);
      if (resInv.data?.success) setInvitations(resInv.data.data);
      if (resInt.data?.success) setInterests(resInt.data.data.filter((i: any) => i.invited_by === 'driver' && i.status === 'pending'));
    } catch {
      // silent
    } finally {
      setLoadingInvites(false);
    }
  }, [freightId]);

  useEffect(() => {
    if (activeTab === 'invitations' || activeTab === 'interests') {
      loadInvitations();
    }
  }, [activeTab, loadInvitations]);

  const handleAcceptDriver = async (driverId: number) => {
    try {
      const res = await api.post('/accept-driver', { freight_id: parseInt(freightId!), driver_id: driverId });
      if (res.data?.success) {
        navigate('/dashboard/logistica');
      } else {
        Swal.fire({ icon: 'error', title: 'Erro', text: res.data?.message || 'Erro ao aceitar motorista' });
      }
    } catch {
      Swal.fire({ icon: 'error', title: 'Erro', text: 'Erro ao aceitar motorista. Tente novamente.' });
    }
  };

  const handleCancelMatch = async (invitationId: number) => {
    try {
      const result = await Swal.fire({
        title: 'Cancelar match?',
        text: 'O motorista será notificado e o frete voltará a ficar disponível.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Sim, cancelar',
        cancelButtonText: 'Voltar',
      });
      if (!result.isConfirmed) return;
      const res = await api.put(`/freight-invitations/${invitationId}/cancel-match`);
      if (res.data?.success) {
        Swal.fire({ icon: 'success', title: 'Match cancelado!', timer: 1500, showConfirmButton: false });
        loadInvitations();
      } else {
        Swal.fire({ icon: 'error', title: 'Erro', text: res.data?.message || 'Erro ao cancelar match' });
      }
    } catch {
      Swal.fire({ icon: 'error', title: 'Erro', text: 'Erro ao cancelar match. Tente novamente.' });
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

  const handleOpenChat = async (driverId: number) => {
    try {
      const res = await api.post('/chat/init', { freight_id: parseInt(freightId!), seller_id: driverId });
      if (res.data?.success) {
        navigate(`/chat/${res.data.room_id}`);
      } else {
        Swal.fire({ icon: 'error', title: 'Erro', text: res.data?.message || 'Erro ao abrir chat' });
      }
    } catch {
      Swal.fire({ icon: 'error', title: 'Erro', text: 'Erro ao abrir chat. Tente novamente.' });
    }
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

      {/* Stats */}
      <StatsGrid>
        <StatCard label="Motoristas Encontrados" value={drivers.length} icon={Navigation} variant="blue" />
        <StatCard label="Convites Pendentes" value={invitations.filter(i => i.status === 'pending').length} icon={Send} variant="yellow" />
        <StatCard label="Interessados" value={interests.length} icon={UserCheck} variant="purple" />
        <StatCard label="Convites Aceitos" value={invitations.filter(i => i.status === 'accepted').length} icon={CheckCircle2} variant="green" />
      </StatsGrid>

      {/* Tabs: Matching | Convidados | Interessados */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
        {[
          { key: 'matching' as TabType, label: 'Matching', icon: Navigation },
          { key: 'invitations' as TabType, label: 'Convidados', icon: Send },
          { key: 'interests' as TabType, label: 'Interessados', icon: UserCheck },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all flex-1 justify-center ${
              activeTab === tab.key
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Matching Tab */}
      {activeTab === 'matching' && (
        <>
      {error && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 text-center border border-red-100 dark:border-red-900">
          <p className="text-red-500 dark:text-red-400 font-medium mb-4">{error}</p>
          <Button variant="default" onClick={() => freightId && findDrivers(parseInt(freightId), radiusKm)}>
            Tentar Novamente
          </Button>
        </div>
      )}

      {!loading && !error && drivers.length === 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700">
          <Loader2 size={32} className="animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">Nenhum motorista encontrado</p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">Amplie o raio de busca ou tente novamente</p>
          <div className="flex items-center justify-center gap-2 mt-4">
            {[50, 100, 200, 500].map((km) => (
              <button key={km} onClick={() => setRadiusKm(km)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${radiusKm === km ? 'bg-orange-500 text-white' : 'bg-white dark:bg-slate-700 text-slate-600 border'}`}>
                {km}km
              </button>
            ))}
            <button onClick={() => setRadiusKm(2000)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${radiusKm === 2000 ? 'bg-orange-500 text-white' : 'bg-white dark:bg-slate-700 text-slate-600 border'}`}>
              Qualquer
            </button>
          </div>
        </div>
      )}

      {!loading && !error && drivers.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-4 lg:px-6 py-3.5 border-b border-slate-100 dark:border-slate-700 flex flex-wrap justify-between items-center gap-3">
            <h3 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">
              Motoristas ({drivers.length})
            </h3>
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-slate-400" />
              <select value={radiusKm} onChange={(e) => setRadiusKm(parseInt(e.target.value))}
                className="text-xs font-bold text-slate-600 dark:text-slate-400 bg-transparent border-none cursor-pointer">
                <option value={50}>50km</option>
                <option value={100}>100km</option>
                <option value={200}>200km</option>
                <option value={500}>500km</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Motorista</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Localização</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase w-[1%] whitespace-nowrap">Veículo</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase w-[1%] whitespace-nowrap">Compatibilidade</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase w-[1%] whitespace-nowrap">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {drivers.map((driver) => {
                  const scoreInfo = getMatchScoreLabel(driver.match_score || 0);
                  return (
                    <tr key={driver.driver_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0 overflow-hidden">
                            {driver.avatar_url ? (
                              <img src={driver.avatar_url} alt={driver.driver_name} className="w-full h-full object-cover" />
                            ) : (
                              <User size={14} className="text-slate-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-bold text-slate-800 dark:text-white whitespace-nowrap">{driver.driver_name}</span>
                              {driver.verification_status === 'verified' && <ShieldCheck size={14} className="text-green-500 shrink-0" />}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">{driver.home_city}/{driver.home_state}</div>
                        <div className="text-[10px] text-slate-400 mt-px">{getDistanceLabel(driver.distance_km || 0)}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-[10px] font-bold text-slate-500 uppercase">{driver.vehicle_type}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full" style={{ width: `${driver.match_score || 0}%` }} />
                          </div>
                          <span className={`text-xs font-bold ${scoreInfo.color}`}>{scoreInfo.label}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <a href={`/perfil/${driver.driver_slug}`} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition-all">
                            <User size={10} /> Perfil
                          </a>
                          {driver.driver_whatsapp && (
                            <button onClick={() => handleContactWhatsApp(driver.driver_whatsapp, driver.driver_name)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase bg-green-500 text-white hover:bg-green-600 transition-all">
                              <MessageCircle size={10} /> WA
                            </button>
                          )}
                          {driver.driver_id && (
                            <button onClick={() => handleOpenChat(driver.driver_id)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase bg-blue-500 text-white hover:bg-blue-600 transition-all">
                              <MessageSquare size={10} /> Chat
                            </button>
                          )}
                          {pendingDriverIds.has(driver.driver_id) ? (
                            <span className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase bg-slate-100 text-slate-400 cursor-not-allowed">
                              <Check size={10} /> Convidado
                            </span>
                          ) : (
                            <button onClick={() => setInviteModalDriver({ id: driver.driver_id, name: driver.driver_name })}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase bg-orange-500 text-white hover:bg-orange-600 transition-all">
                              <Send size={10} /> Convidar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
        </>
      )}

      {/* Invitations Tab */}
      {activeTab === 'invitations' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-4 lg:px-6 py-3.5 border-b border-slate-100 dark:border-slate-700 flex flex-wrap justify-between items-center gap-3">
            <h3 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">
              Convites ({invitations.length})
            </h3>
          </div>
          {loadingInvites ? (
            <div className="p-12 text-center">
              <Loader2 className="animate-spin text-blue-600 mx-auto" size={32} />
            </div>
          ) : invitations.length === 0 ? (
            <div className="px-4 py-12 text-center text-slate-400 dark:text-slate-500 font-medium">Nenhum convite enviado ainda</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Motorista</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase w-[1%] whitespace-nowrap">Veículo</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase w-[1%] whitespace-nowrap">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase w-[1%] whitespace-nowrap">Data</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase w-[1%] whitespace-nowrap">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {invitations.map((inv: any) => (
                    <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0 overflow-hidden">
                            {inv.avatar_url ? <img src={inv.avatar_url} alt={inv.driver_name} className="w-full h-full object-cover" /> : <User size={14} className="text-slate-400" />}
                          </div>
                          <span className="text-sm font-bold text-slate-800 dark:text-white">{inv.driver_name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-[10px] font-bold text-slate-500 uppercase">{inv.vehicle_type}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          inv.status === 'accepted' ? 'bg-green-100 text-green-700' :
                          inv.status === 'declined' ? 'bg-red-100 text-red-700' :
                          inv.status === 'cancelled' ? 'bg-slate-100 text-slate-500' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {inv.status === 'accepted' ? 'Aceito' :
                           inv.status === 'declined' ? 'Recusado' :
                           inv.status === 'cancelled' ? 'Cancelado' :
                           'Pendente'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-slate-600 dark:text-slate-300">{inv.created_at ? new Date(inv.created_at).toLocaleString('pt-BR') : ''}</div>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {inv.driver_whatsapp && (
                            <button onClick={() => handleContactWhatsApp(inv.driver_whatsapp, inv.driver_name)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase bg-green-500 text-white hover:bg-green-600 transition-all">
                              <MessageCircle size={10} /> WA
                            </button>
                          )}
                          {inv.driver_id && (
                            <>
                              <button onClick={() => handleOpenChat(inv.driver_id)}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase bg-blue-500 text-white hover:bg-blue-600 transition-all">
                                <MessageSquare size={10} /> Chat
                              </button>
                              {inv.status === 'accepted' && (
                                <>
                                  <button onClick={() => handleAcceptDriver(inv.driver_id)}
                                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase bg-orange-500 text-white hover:bg-orange-600 transition-all">
                                    <UserCheck size={10} /> Aceitar
                                  </button>
                                  <button onClick={() => handleCancelMatch(inv.id)}
                                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase bg-red-500 text-white hover:bg-red-600 transition-all">
                                    <X size={10} /> Cancelar
                                  </button>
                                </>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Interests Tab */}
      {activeTab === 'interests' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-4 lg:px-6 py-3.5 border-b border-slate-100 dark:border-slate-700 flex flex-wrap justify-between items-center gap-3">
            <h3 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">
              Interessados ({interests.length})
            </h3>
          </div>
          {loadingInvites ? (
            <div className="p-12 text-center">
              <Loader2 className="animate-spin text-blue-600 mx-auto" size={32} />
            </div>
          ) : interests.length === 0 ? (
            <div className="px-4 py-12 text-center text-slate-400 dark:text-slate-500 font-medium">Nenhum motorista interessado ainda</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Motorista</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase w-[1%] whitespace-nowrap">Veículo</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase w-[1%] whitespace-nowrap">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase w-[1%] whitespace-nowrap">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {interests.map((inv: any) => (
                    <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0 overflow-hidden">
                            {inv.avatar_url ? <img src={inv.avatar_url} alt={inv.driver_name} className="w-full h-full object-cover" /> : <User size={14} className="text-slate-400" />}
                          </div>
                          <span className="text-sm font-bold text-slate-800 dark:text-white">{inv.driver_name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-[10px] font-bold text-slate-500 uppercase">{inv.vehicle_type}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-700">Interessado</span>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {inv.driver_whatsapp && (
                            <button onClick={() => handleContactWhatsApp(inv.driver_whatsapp, inv.driver_name)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase bg-green-500 text-white hover:bg-green-600 transition-all">
                              <MessageCircle size={10} /> WA
                            </button>
                          )}
                          {inv.driver_id && (
                            <button onClick={() => handleOpenChat(inv.driver_id)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase bg-blue-500 text-white hover:bg-blue-600 transition-all">
                              <MessageSquare size={10} /> Chat
                            </button>
                          )}
                          {inv.driver_id && (
                            <button onClick={() => setInviteModalDriver({ id: inv.driver_id, name: inv.driver_name })}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase bg-orange-500 text-white hover:bg-orange-600 transition-all">
                              <Send size={10} /> Convidar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Invite Driver Modal */}
      {inviteModalDriver && (
        <InviteDriverModal
          driverId={inviteModalDriver.id}
          driverName={inviteModalDriver.name}
          freightId={parseInt(freightId!)}
          onClose={() => setInviteModalDriver(null)}
          onSuccess={() => { loadInvitations(); setActiveTab('invitations'); }}
        />
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
