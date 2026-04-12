import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  MessageCircle,
  Truck,
  Building2,
  ShieldCheck,
  ArrowLeft,
  MapPinned,
  AlertCircle,
  LayoutGrid,
  Lock,
  Calendar,
  Star,
  ExternalLink,
  Flag,
  X,
} from 'lucide-react';
import { api } from '../../api/api';
import { useTracker } from '../../services/useTracker';
import Swal from 'sweetalert2';

import Header from '../../components/shared/Header';
import Footer from '../../components/shared/Footer';
import AdCard from '../../components/shared/AdCard';
import { ReviewsExpandable } from '../../components/reviews';

import FreightRow from '../../components/shared/FreightRow';
import ListingCard from '../../components/shared/ListingCard';

interface ProfileData {
  id: number;
  name?: string;
  trade_name?: string;
  corporate_name?: string;
  role?: string;
  user_type?: string;
  avatar_url?: string;
  cover_url?: string;
  banner_url?: string;
  bio?: string;
  city?: string;
  state?: string;
  whatsapp?: string;
  whatsapp_clean?: string;
  is_shipper?: boolean;
  is_seller?: boolean;
  rating_avg?: number;
  rating_count?: number;
  is_verified?: boolean;
  verified_until?: string;
  instagram?: string;
  linkedin?: string;
  vehicle_type?: string;
  body_type?: string;
  is_available?: number;
  availability_status?: string;
  member_since?: string;
  identity_confirmed?: number;
  extras?: Record<string, unknown>;
  [key: string]: unknown;
}

interface PostItem {
  id: number;
  type: string;
  [key: string]: unknown;
}

export default function ProfileView() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [freights, setFreights] = useState<PostItem[]>([]);
  const [marketplaceItems, setMarketplaceItems] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loggedUser = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('@ChamaFrete:user') || 'null') : null;
  const isLoggedIn = !!loggedUser?.id;
  const isOwnProfile = loggedUser?.id === profile?.id;

  const handleReportProfile = async () => {
    if (!reportReason) return;
    
    setSubmitting(true);
    try {
      const res = await api.post('reports', {
        target_type: 'user',
        target_id: profile.id,
        reason: reportReason,
        description: reportDescription
      });
      
      if (res.data?.success) {
        Swal.fire('Denunciado!', 'Sua denúncia foi enviada para análise.', 'success');
        setShowReportForm(false);
        setReportReason('');
        setReportDescription('');
      }
    } catch (err: any) {
      Swal.fire('Erro', err.response?.data?.message || 'Erro ao enviar denúncia.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const REPORT_REASONS = [
    { value: 'spam', label: 'Spam ou propaganda' },
    { value: 'harassment', label: 'Assédio ou ofensa' },
    { value: 'fake', label: 'Perfil falso' },
    { value: 'fraud', label: 'Fraude ou golpe' },
    { value: 'inappropriate', label: 'Comportamento inadequado' },
    { value: 'other', label: 'Outro motivo' },
  ];
  const { trackEvent } = useTracker();
  const trackedListings = useRef(new Set<number>());

  const handleListingView = useCallback((id: number) => {
    if (!trackedListings.current.has(id)) {
      trackedListings.current.add(id);
      trackEvent(id, 'LISTING', 'VIEW');
    }
  }, [trackEvent]);

  const handleListingClick = useCallback((slug: string, id: number) => {
    trackEvent(id, 'LISTING', 'CLICK');
    navigate(`/anuncio/${slug}`);
  }, [trackEvent, navigate]);

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

          const roleType = (data.role || data.user_type || '').toLowerCase();
          const isDriverRole = roleType === 'driver' || roleType === 'motorista';
          const isShipperRole =
            !!data.is_shipper ||
            ['shipper', 'company', 'transportadora', 'logistics'].includes(roleType);

          if (isDriverRole) {
            setMarketplaceItems(items);
            setFreights([]);
          } else {
            const freightList = items.filter((p: PostItem) => p.type !== 'marketplace');
            const marketList = items.filter((p: PostItem) => p.type === 'marketplace');
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

  const calculateProfileScore = (p: ProfileData, isDriverProfile: boolean) => {
    if (!p) return 0;
    
    let score = 0;
    
    // Campos comuns (60%)
    if (p.avatar_url) score += 15;
    if (p.name || p.trade_name) score += 10;
    if (p.bio && p.bio.length > 20) score += 15;
    if (p.city && p.state) score += 10;
    if (p.whatsapp) score += 10;
    
    if (isDriverProfile) {
      // Campos específicos para drivers (40%)
      if (p.vehicle_type) score += 20;
      if (p.body_type) score += 20;
    } else {
      // Campos específicos para empresas (40%)
      if (p.website) score += 20;
      if (p.instagram || p.linkedin) score += 20;
    }
    
    return score;
  };

  if (loading) return <LoadingState />;
  if (!profile) return <NotFoundState />;

  const type = (profile.role || profile.user_type || '').toLowerCase();
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

  const profileScore = calculateProfileScore(profile, isDriver);
  
  // Badge Identidade Confirmada: SÓ para motoristas, não para empresas
  // Verifica se tem algum tipo de verificação ativa (identity_confirmed, verified_until válido, is_verified = 1)
  const hasIdentityConfirmed = isDriver && (
    profile.is_verified === true || 
    (profile.verified_until && new Date(profile.verified_until) > new Date()) ||
    profile.identity_confirmed == 1
  );

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

  const displayName = profile.trade_name || profile.corporate_name || profile.name || 'Usuário Chama Frete';
  const displayRole = isDriver ? 'Motorista' : 'Empresa';
  
  // Garantia de Banner e Avatar (Usa banner_url ou cover_url se disponível)
  const bannerImg = profile.banner_url || profile.cover_url;
  const avatarImg = profile.avatar_url;

  const isAvailable = (profile.is_available === 1) || profile.availability_status === 'available';

  const instagramUrl = profile.instagram
    ? typeof profile.instagram === 'string' && profile.instagram.startsWith('http')
      ? profile.instagram
      : `https://instagram.com/${profile.instagram.replace('@', '')}`
    : null;

  const linkedinUrl =
    profile.linkedin && !isDriver
      ? typeof profile.linkedin === 'string' && profile.linkedin.startsWith('http')
        ? profile.linkedin
        : `https://linkedin.com/in/${profile.linkedin.replace('@', '')}`
      : null;

  const handleWhatsAppClick = async () => {
    if (!isLoggedIn || !profile.whatsapp_clean) return;
    try {
      await api.post(`/profile/track-click/${profile.id}`);
    } catch {
      console.error('Erro ao trackear click');
    }
    window.open(`https://wa.me/55${profile.whatsapp_clean}`, '_blank');
  };

  const hasFreights = isShipper && freights.length > 0;
  const hasMarketplace = (isDriver || isSeller || isShipper) && marketplaceItems.length > 0;
  const hasAnyPosts = hasFreights || hasMarketplace;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow pt-16 md:pt-20">
        {/* HEADER BANNER */}
        <div className={`h-64 md:h-120 w-full relative ${theme.bg}`}>
          {bannerImg ? (
            <img src={bannerImg} alt="Banner" className="absolute inset-0 w-full h-full object-cover opacity-80" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-black/60" />
          )}
          <button
            onClick={() => {
              if (window.history.length > 1) {
                navigate(-1);
              } else {
                navigate('/');
              }
            }}
            className="absolute top-8 left-8 z-20 bg-white/10 backdrop-blur-xl p-4 rounded-2xl text-white hover:bg-white/20 transition-all border border-white/20 shadow-lg"
            title="Voltar"
          >
            <ArrowLeft size={20} />
          </button>
        </div>

        <div className="max-w-6xl mx-auto px-4 -mt-24 relative z-10 pb-20">
          {/* CARD PRINCIPAL DE IDENTIDADE */}
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800 p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              {/* AVATAR OU VEÍCULO PADRÃO */}
              <div className="relative shrink-0">
                {isDriver ? (
                  <VehicleProfileBadge
                    vehicleType={profile.vehicle_type || (profile.extras?.vehicle_type as string)}
                    bodyType={profile.body_type || (profile.extras?.body_type as string)}
                    avatarUrl={avatarImg}
                    theme={theme}
                  />
                ) : (
                  <div className={`w-44 h-44 md:w-52 md:h-52 ${theme.bg} rounded-[3rem] p-1.5 shadow-2xl`}>
                    <div className="w-full h-full bg-white dark:bg-slate-800 rounded-[2.8rem] overflow-hidden flex items-center justify-center">
                      {avatarImg ? (
                        <img src={avatarImg} alt={displayName} className="w-full h-full object-cover" />
                      ) : (
                        <Building2 size={72} className="text-slate-200 dark:text-slate-600" />
                      )}
                    </div>
                  </div>
                )}
                {hasIdentityConfirmed && (
                  <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-amber-400 to-yellow-500 text-white p-3 rounded-2xl shadow-lg border-4 border-white dark:border-slate-900">
                    <ShieldCheck size={24} />
                  </div>
                )}
              </div>

              {/* INFO TEXTO */}
              <div className="flex-1 text-center md:text-left space-y-4">
                <div className="flex flex-wrap justify-center md:justify-start gap-2">
                  {hasIdentityConfirmed && (
                    <span className="bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-500/20 dark:to-yellow-500/20 text-amber-700 dark:text-amber-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter border border-amber-200 dark:border-amber-500/30 flex items-center gap-1.5 shadow-sm">
                      <ShieldCheck size={14} /> Identidade Confirmada
                    </span>
                  )}
                  {profile?.rating_count !== undefined && (
                    <Link
                      to={`/avaliacoes/${slug}`}
                      className="bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter border border-amber-100 dark:border-amber-500/20 flex items-center gap-1.5 hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors cursor-pointer"
                    >
                      <Star size={14} className="fill-amber-400 text-amber-400" /> 
                      {profile?.rating_count > 0 
                        ? `${Number(profile?.rating_avg || 0).toFixed(1)} (${profile?.rating_count}) Ver avaliações`
                        : '0 avaliações'}
                      <ExternalLink size={10} />
                    </Link>
                  )}
                  {profileScore === 100 && (
                    <span className="bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter border border-amber-100 dark:border-amber-500/20 flex items-center gap-1.5">
                      ⭐ Perfil Completo
                    </span>
                  )}
                  <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter">
                    {displayRole}
                  </span>
                  {isLoggedIn && !isOwnProfile && (
                    <button
                      onClick={() => setShowReportForm(true)}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                    >
                      <Flag size={12} /> Denunciar
                    </button>
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
              <div className={`grid ${isDriver ? 'lg:grid-cols-3' : ''} gap-10`}>
                <div className={isDriver ? 'lg:col-span-2' : ''}>
                  <p className="text-slate-600 dark:text-slate-300 text-lg font-medium leading-relaxed italic">
                    "{profile.bio ||
                      `Olá! Sou ${displayName} e utilizo o Chama Frete para conectar com parceiros de logística.`}"
                  </p>
                </div>
                {isDriver && (
                  <div className={`${theme.light} p-6 rounded-[2.5rem] border ${theme.border} space-y-4`}>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">
                      Ficha Técnica
                    </p>
                    <InfoItem
                      label="Veículo"
                      value={profile.vehicle_type || (profile.extras?.vehicle_type as string) || 'Não informado'}
                    />
                    <InfoItem
                      label="Implemento"
                      value={profile.body_type || (profile.extras?.body_type as string) || '---'}
                    />
                    <InfoItem
                      label="Status"
                      value={isAvailable ? 'Disponível' : 'Indisponível'}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* AVALIAÇÕES EXPANSÍVEL */}
            <div className="mt-8">
              <ReviewsExpandable
                targetId={profile.id}
                targetSlug={slug || ''}
                theme={isDriver ? 'orange' : 'blue'}
              />
            </div>

            {/* REDES SOCIAIS */}
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

          {/* SPOTLIGHT AD */}
          <div className="mt-12">
            <AdCard position="spotlight" variant="horizontal" state={profile.state} city={profile.city} />
          </div>

          {/* LISTAGEM DE POSTS */}
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
                {freights.map((item) => (
                  <FreightRow
                    key={item.id}
                    data={{ ...item, value: (item as Record<string, unknown>).price || (item as Record<string, unknown>).value }}
                    onClick={() => navigate(`/frete/${(item as Record<string, unknown>).slug || item.id}`)}
                    showDate
                  />
                ))}
              </div>
            </section>
          )}

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
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {marketplaceItems.map((item) => {
                  const itemData = item as unknown as Parameters<typeof ListingCard>[0]['data'];
                  return (
                    <ListingCard
                      key={item.id}
                      data={itemData}
                      onView={() => handleListingView(item.id)}
                      onClick={() => handleListingClick((item as Record<string, unknown>).slug as string, item.id)}
                    />
                  );
                })}
              </div>
            </section>
          )}

          {!hasAnyPosts && (
            <div className="mt-12 bg-white dark:bg-slate-900 p-16 rounded-[3rem] text-center border-2 border-dashed border-slate-200 dark:border-slate-800">
              <LayoutGrid size={48} className="text-slate-200 dark:text-slate-700 mx-auto mb-6" />
              <p className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">
                Sem publicações ativas no momento
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Report Profile Modal */}
      {showReportForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowReportForm(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase italic flex items-center gap-2">
                <Flag size={20} className="text-red-500" /> Denunciar Perfil
              </h3>
              <button onClick={() => setShowReportForm(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
              Selecione o motivo da denúncia:
            </p>
            
            <div className="space-y-2 mb-4">
              {REPORT_REASONS.map((reason) => (
                <label key={reason.value} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                  <input
                    type="radio"
                    name="report-reason"
                    value={reason.value}
                    checked={reportReason === reason.value}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-4 h-4 text-red-500"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">{reason.label}</span>
                </label>
              ))}
            </div>

            {reportReason === 'other' && (
              <textarea
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Descreva o motivo..."
                className="w-full p-3 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
                rows={3}
              />
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowReportForm(false)}
                className="flex-1 py-3 text-sm font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400"
              >
                Cancelar
              </button>
              <button
                onClick={handleReportProfile}
                disabled={submitting || !reportReason}
                className="flex-1 py-3 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl disabled:opacity-50"
              >
                {submitting ? 'Enviando...' : 'Enviar Denúncia'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface ThemeConfig {
  bg: string;
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
  theme: ThemeConfig;
}) {
  const vType = vehicleType || 'Não informado';

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

function InfoItem({ label, value }: { label: string; value: string }) {
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

function NotFoundState() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Header />
      <div className="flex-grow flex items-center justify-center p-10">
        <div className="bg-white dark:bg-slate-900 p-16 rounded-[3rem] text-center shadow-2xl max-w-md border border-slate-200 dark:border-slate-800">
          <AlertCircle size={80} className="text-red-100 dark:text-red-900/30 mx-auto mb-6" />
          <h1 className="text-2xl font-black uppercase italic text-slate-900 dark:text-white">Perfil Indisponível</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-4 font-medium italic">
            Este perfil não existe ou foi removido da plataforma.
          </p>
            <button
            onClick={() => {}}
            className="mt-10 bg-slate-900 dark:bg-white text-white dark:text-slate-900 w-full py-5 rounded-[2rem] font-black uppercase italic text-sm hover:scale-[1.02] transition-all shadow-lg"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    </div>
  );
}