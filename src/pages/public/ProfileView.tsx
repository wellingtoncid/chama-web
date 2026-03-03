import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MessageCircle,
  Truck,
  Building2,
  CheckCircle2,
  ShieldCheck,
  ArrowLeft,
  MapPinned,
  AlertCircle,
  LayoutGrid,
  Lock,
  Calendar,
} from 'lucide-react';
import { api } from '../../api/api';
import FreightRow from '../../components/shared/FreightRow';
import FreightCard from '../../components/shared/FreightCard';
import { VEHICLE_TYPE_IDS } from '../../constants/freightOptions';

const COMPANY_TYPE_LABELS: Record<string, string> = {
  transportadora: 'Transportadora',
  operador_logistico: 'Operador Logístico',
  armazem: 'Armazém / CD',
  agente_cargas: 'Agente de Cargas',
  embarcador: 'Embarcador',
  outros: 'Outros',
};

export default function ProfileView() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [freights, setFreights] = useState<any[]>([]);
  const [marketplaceItems, setMarketplaceItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loggedUser = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('@ChamaFrete:user') || 'null') : null;
  const isLoggedIn = !!loggedUser?.id;

  const fetchFullData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/profile/page/${slug}`);

      if (res.data?.success) {
        const data = res.data.data;
        setProfile(data);

        try {
          const postsRes = await api.get('/get-user-posts', {
            params: { user_id: data.id },
          });
          const items = Array.isArray(postsRes.data?.data) ? postsRes.data.data : [];

          // Identificação robusta de tipo de usuário (Driver x Empresa)
          const roleType = (data.role || data.user_type || '').toLowerCase();
          const isDriverRole = roleType === 'driver' || roleType === 'motorista';
          const isShipperRole =
            !!data.is_shipper ||
            ['shipper', 'company', 'transportadora', 'logistics'].includes(roleType);

          if (isDriverRole) {
            setMarketplaceItems(items);
            setFreights([]);
          } else {
            const freightList = items.filter((p: any) => p.type !== 'marketplace');
            const marketList = items.filter((p: any) => p.type === 'marketplace');
            setFreights(isShipperRole ? freightList : []);
            setMarketplaceItems(marketList);
          }
        } catch (postError) {
          console.error('Erro ao buscar posts:', postError);
          setFreights([]);
          setMarketplaceItems([]);
        }
      }
    } catch (e) {
      console.error('Erro ao carregar perfil:', e);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    if (slug) fetchFullData();
  }, [slug, fetchFullData]);

  if (loading) return <LoadingState />;
  if (!profile) return <NotFoundState navigate={navigate} />;

  // Fallback para user_type quando role não vier do backend
  const type = (profile.role || profile.user_type || '').toLowerCase();
  // Heurística extra: se tem vehicle_type e não é empresa explicita, tratamos como driver
  const isDriver =
    type === 'driver' ||
    type === 'motorista' ||
    (!!profile.vehicle_type && !['company', 'shipper', 'transportadora', 'logistics'].includes(type));
  const isShipper =
    !!profile.is_shipper ||
    ['shipper', 'company', 'transportadora', 'logistics'].includes(type);
  const isSeller =
    !!profile.is_seller ||
    (typeof profile.user_type === 'string' && profile.user_type.toUpperCase() === 'ADVERTISER');

  const theme = isDriver
    ? {
        primary: 'orange',
        bg: 'bg-orange-600',
        text: 'text-orange-600',
        light: 'bg-orange-50 dark:bg-orange-500/5',
        border: 'border-orange-100 dark:border-orange-900/30',
        shadow: 'shadow-orange-100',
      }
    : {
        primary: 'blue',
        bg: 'bg-blue-600',
        text: 'text-blue-600',
        light: 'bg-blue-50 dark:bg-blue-500/5',
        border: 'border-blue-100 dark:border-blue-900/30',
        shadow: 'shadow-blue-100',
      };

  const displayName = profile.corporate_name || profile.trade_name || profile.name || 'Usuário Chama Frete';
  const displayRole = isDriver ? 'Motorista Autônomo' : 'Empresa / Embarcador';
  const businessTypeLabel =
    profile.business_type && COMPANY_TYPE_LABELS[profile.business_type]
      ? COMPANY_TYPE_LABELS[profile.business_type]
      : null;

  const isAvailable =
    profile.is_available === 1 ||
    profile.availability_status === 'available' ||
    profile.availability_status === null ||
    typeof profile.availability_status === 'undefined';

  const instagramUrl = profile.instagram
    ? profile.instagram.startsWith('http')
      ? profile.instagram
      : `https://instagram.com/${profile.instagram.replace('@', '')}`
    : null;

  const linkedinUrl =
    profile.linkedin && !isDriver
      ? profile.linkedin.startsWith('http')
        ? profile.linkedin
        : `https://linkedin.com/in/${profile.linkedin.replace('@', '')}`
      : null;

  const handleWhatsAppClick = async () => {
    if (!isLoggedIn || !profile.whatsapp_clean) return;
    try {
      await api.post(`/profile/track-click/${profile.id}`);
    } catch (e) {
      console.error('Erro ao trackear click');
    }
    window.open(`https://wa.me/55${profile.whatsapp_clean}`, '_blank');
  };

  const hasFreights = isShipper && freights.length > 0;
  const hasMarketplace = (isDriver || isSeller) && marketplaceItems.length > 0;
  const hasAnyPosts = hasFreights || hasMarketplace;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      {/* HEADER BANNER */}
      <div className={`h-64 md:h-80 w-full relative ${theme.bg} overflow-hidden`}>
        {profile.cover_url ? (
          <img src={profile.cover_url} alt="Banner" className="w-full h-full object-cover opacity-70" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-black/60" />
        )}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-8 left-8 z-20 bg-white/10 backdrop-blur-xl p-4 rounded-2xl text-white hover:bg-white/20 transition-all"
        >
          <ArrowLeft size={20} />
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-24 relative z-10">
        {/* CARD PRINCIPAL DE IDENTIDADE */}
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800 p-8 md:p-12">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* AVATAR OU VEÍCULO PADRÃO */}
            <div className="relative shrink-0">
              {isDriver ? (
                <VehicleProfileBadge
                  vehicleType={profile.vehicle_type || profile.extras?.vehicle_type}
                  bodyType={profile.body_type || profile.extras?.body_type}
                  avatarUrl={profile.avatar_url}
                  theme={theme}
                />
              ) : (
                <div className={`w-44 h-44 md:w-52 md:h-52 ${theme.bg} rounded-[3rem] p-1.5 shadow-2xl`}>
                  <div className="w-full h-full bg-white dark:bg-slate-800 rounded-[2.8rem] overflow-hidden flex items-center justify-center">
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover" />
                    ) : (
                      <Building2 size={72} className="text-slate-200 dark:text-slate-600" />
                    )}
                  </div>
                </div>
              )}
              {profile.is_verified !== false && (
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-3 rounded-2xl shadow-lg border-4 border-white dark:border-slate-900">
                  <ShieldCheck size={24} />
                </div>
              )}
            </div>

            {/* INFO TEXTO */}
            <div className="flex-1 text-center md:text-left space-y-4">
              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                {profile.is_verified !== false && (
                  <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter border border-emerald-100 dark:border-emerald-500/20 flex items-center gap-1.5">
                    <CheckCircle2 size={14} /> Perfil Verificado
                  </span>
                )}
                <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter">
                  {displayRole}
                </span>
                {businessTypeLabel && (
                  <span className="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter">
                    {businessTypeLabel}
                  </span>
                )}
              </div>

              <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white uppercase italic leading-[0.9] tracking-tighter">
                {displayName}
              </h1>

              <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-slate-400 font-bold text-[11px] uppercase tracking-widest">
                <span className={`flex items-center gap-2 ${theme.text}`}>
                  <MapPinned size={18} /> {profile.city || 'Atendimento'} - {profile.state || 'Brasil'}
                </span>
                {profile.member_since && (
                  <span className="flex items-center gap-2">
                    <Calendar size={18} /> No Chama Frete desde {new Date(profile.member_since).getFullYear()}
                  </span>
                )}
              </div>

              {/* BLOCO DE CONTATO - APENAS PARA LOGADOS */}
              {isLoggedIn && profile.whatsapp_clean ? (
                <button
                  onClick={handleWhatsAppClick}
                  className={`inline-flex items-center gap-4 ${theme.bg} hover:scale-[1.02] text-white px-8 py-5 rounded-[2rem] font-black uppercase italic transition-all shadow-xl mt-4`}
                >
                  <MessageCircle size={24} />
                  <div className="text-left leading-tight">
                    <p className="text-[10px] opacity-80 not-italic uppercase">Contato</p>
                    <p className="text-lg">WhatsApp</p>
                  </div>
                </button>
              ) : (
                <div className="inline-flex items-center gap-3 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-6 py-4 rounded-2xl mt-4">
                  <Lock size={20} />
                  <span className="text-[11px] font-bold uppercase">Faça login para ver o contato</span>
                </div>
              )}
            </div>
          </div>

          {/* BIO / SOBRE */}
          <div className="mt-12 pt-10 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-slate-900 dark:text-white font-black uppercase italic text-sm tracking-widest flex items-center gap-3 mb-6">
              <div className={`w-10 h-1.5 ${theme.bg} rounded-full`} />
              {isDriver ? 'Sobre mim' : 'Sobre a Empresa'}
            </h3>
            <div className="grid lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2">
                <p className="text-slate-600 dark:text-slate-300 text-lg font-medium leading-relaxed italic">
                  "{profile.bio ||
                    `Olá! Sou ${displayName} e utilizo o Chama Frete para conectar com parceiros de logística.`}"
                </p>
              </div>
              <div className={`${theme.light} p-6 rounded-[2.5rem] border ${theme.border} space-y-4`}>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">
                  Ficha Técnica
                </p>
                {isDriver ? (
                  <>
                    <InfoItem
                      label="Veículo"
                      value={profile.vehicle_type || profile.extras?.vehicle_type || 'Não informado'}
                    />
                    <InfoItem
                      label="Implemento"
                      value={profile.body_type || profile.extras?.body_type || '---'}
                    />
                    <InfoItem
                      label="Status"
                      value={isAvailable ? 'Disponível para fretes' : 'Indisponível no momento'}
                    />
                  </>
                ) : (
                  <>
                    {businessTypeLabel && <InfoItem label="Tipo" value={businessTypeLabel} />}
                    <InfoItem label="Status" value={isAvailable ? 'Ativa' : 'Indisponível'} />
                  </>
                )}
              </div>
            </div>
          </div>

          {/* REDES SOCIAIS VISÍVEIS NO PERFIL PÚBLICO */}
          {(instagramUrl || linkedinUrl) && (
            <div className="mt-8 flex flex-wrap items-center gap-4">
              {instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest bg-pink-50 text-pink-600 border border-pink-100 hover:bg-pink-100"
                >
                  Instagram
                </a>
              )}
              {linkedinUrl && (
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest bg-slate-900 text-white border border-slate-800 hover:bg-black"
                >
                  LinkedIn
                </a>
              )}
            </div>
          )}
        </div>

        {/* SEÇÃO FRETES (Empresas com módulo frete) */}
        {hasFreights && (
          <section className="mt-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
              <h2 className="text-2xl md:text-3xl font-black uppercase italic text-slate-900 dark:text-white tracking-tighter">
                Fretes Disponíveis
              </h2>
              <span className="bg-white dark:bg-slate-900 px-4 py-2 rounded-full text-xs font-black text-slate-500 border border-slate-200 dark:border-slate-700 uppercase">
                {freights.length} {freights.length === 1 ? 'oferta' : 'ofertas'}
              </span>
            </div>
            <div className="space-y-4">
              {freights.map((item: any) => (
                <FreightRow
                  key={item.id}
                  data={{ ...item, value: item.price || item.value }}
                  onClick={() => navigate(`/frete/${item.slug || item.id}`)}
                  showDate
                />
              ))}
            </div>
          </section>
        )}

        {/* SEÇÃO MARKETPLACE / ANÚNCIOS (Motoristas ou empresas vendedoras) */}
        {hasMarketplace && (
          <section className="mt-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
              <h2 className="text-2xl md:text-3xl font-black uppercase italic text-slate-900 dark:text-white tracking-tighter">
                {isDriver ? 'Anúncios no Marketplace' : 'Produtos no Marketplace'}
              </h2>
              <span className="bg-white dark:bg-slate-900 px-4 py-2 rounded-full text-xs font-black text-slate-500 border border-slate-200 dark:border-slate-700 uppercase">
                {marketplaceItems.length} {marketplaceItems.length === 1 ? 'anúncio' : 'anúncios'}
              </span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {marketplaceItems.map((item: any) => (
                <FreightCard key={item.id} data={item} aba="" disabled={false} />
              ))}
            </div>
          </section>
        )}

        {/* VAZIO */}
        {!hasAnyPosts && (
          <div className="mt-12 bg-white dark:bg-slate-900 p-16 rounded-[3rem] text-center border-2 border-dashed border-slate-200 dark:border-slate-800">
            <LayoutGrid size={48} className="text-slate-200 dark:text-slate-700 mx-auto mb-6" />
            <p className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">
              Sem publicações ativas no momento
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function VehicleProfileBadge({
  vehicleType,
  bodyType,
  avatarUrl,
  theme,
}: {
  vehicleType?: string;
  bodyType?: string;
  avatarUrl?: string;
  theme: any;
}) {
  const vType = vehicleType || 'Não informado';
  const typeId = VEHICLE_TYPE_IDS[vType as keyof typeof VEHICLE_TYPE_IDS] || 'default';

  return (
    <div className={`w-44 h-44 md:w-52 md:h-52 ${theme.bg} rounded-[3rem] p-1.5 shadow-2xl`}>
      <div className="w-full h-full bg-white dark:bg-slate-800 rounded-[2.8rem] overflow-hidden flex flex-col items-center justify-center p-4">
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="w-full h-full object-cover rounded-2xl" />
        ) : (
          <>
            <div className="w-16 h-16 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 mb-2">
              <Truck size={32} />
            </div>
            <p className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase text-center leading-tight line-clamp-2">
              {vType}
            </p>
            {bodyType && (
              <p className="text-[9px] font-bold text-slate-400 mt-1 truncate max-w-full">{bodyType}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function InfoItem({ label, value }: any) {
  return (
    <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-3">
      <span className="text-[10px] font-black text-slate-400 uppercase">{label}</span>
      <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase italic truncate max-w-[60%]">
        {value}
      </span>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-slate-200 dark:border-slate-800 border-t-orange-500 rounded-full animate-spin" />
        <Truck className="absolute inset-0 m-auto text-slate-300 dark:text-slate-600" size={30} />
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mt-8">Carregando perfil...</p>
    </div>
  );
}

function NotFoundState({ navigate }: any) {
  return (
    <div className="min-h-screen flex items-center justify-center p-10 bg-slate-50 dark:bg-slate-950">
      <div className="bg-white dark:bg-slate-900 p-16 rounded-[3rem] text-center shadow-2xl max-w-md border border-slate-200 dark:border-slate-800">
        <AlertCircle size={80} className="text-red-100 dark:text-red-900/30 mx-auto mb-6" />
        <h1 className="text-2xl font-black uppercase italic text-slate-900 dark:text-white">Perfil Indisponível</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-4 font-medium italic">
          Este perfil não existe ou foi removido da plataforma.
        </p>
        <button
          onClick={() => navigate('/')}
          className="mt-10 bg-slate-900 dark:bg-white text-white dark:text-slate-900 w-full py-5 rounded-[2rem] font-black uppercase italic text-sm hover:scale-[1.02] transition-all shadow-lg"
        >
          Voltar ao Início
        </button>
      </div>
    </div>
  );
}
