import { Component, useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

class ProfileErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ProfileView crash:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-8">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-lg border border-red-200 dark:border-red-900/50 shadow-xl">
            <h2 className="text-xl font-black text-red-600 mb-4 uppercase italic">Erro ao carregar perfil</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 font-mono bg-slate-100 dark:bg-slate-800 p-4 rounded-xl overflow-auto">
              {this.state.error?.message || 'Erro desconhecido'}
            </p>
            <p className="text-xs text-slate-400">Verifique o console para mais detalhes.</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
import {
  MessageCircle,
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
  Megaphone,
  Loader2,
  Globe,
  Instagram,
  Linkedin,
} from 'lucide-react';
import { api } from '../../api/api';
import { useTracker } from '../../services/useTracker';
import { usePageMeta } from '../../hooks/usePageMeta';
import Swal from 'sweetalert2';

import Header from '../../components/shared/Header';
import Footer from '../../components/shared/Footer';
import AdCard from '../../components/shared/AdCard';
import ArticleCard from '../../components/shared/ArticleCard';
import { ReviewsExpandable } from '../../components/reviews';

import FreightRow from '../../components/shared/FreightRow';
import ListingCard from '../../components/shared/ListingCard';
import { useProfileTheme } from '../../components/profile/ProfileTheme';
import {
  StatCard,
  ProfileInfoItem,
  VehicleProfileBadge,
  ProfileLoadingState,
  ProfileNotFoundState,
  IdentityBadge,
  GradientAvatar,
  ShareProfileButton,
} from '../../components/profile/ProfileComponents';

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
  website?: string;
  vehicle_type?: string;
  body_type?: string;
  is_available?: number;
  availability_status?: string;
  member_since?: string;
  identity_confirmed?: number;
  views_count?: number;
  clicks_count?: number;
  experience_years?: number;
  total_active_freights?: number;
  total_active_listings?: number;
  total_active_ads?: number;
  advertiser_category?: string;
  advertiser_target?: string;
  certifications?: string[];
  available_equipment?: string[];
  industry_sector?: string;
  fleet_size?: number;
  preferred_regions?: string[];
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
  const [adItems, setAdItems] = useState<PostItem[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(false);
  const [articlesTotal, setArticlesTotal] = useState(0);
  const [articlesPage, setArticlesPage] = useState(0);
  const ARTICLES_PER_PAGE = 10;
  const [loading, setLoading] = useState(true);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loggedUser = typeof window !== 'undefined' ? (() => {
    try {
      return JSON.parse(localStorage.getItem('@ChamaFrete:user') || 'null');
    } catch { return null; }
  })() : null;
  const isLoggedIn = !!loggedUser?.id;
  const isOwnProfile = loggedUser?.id === profile?.id;

  const asArray = (v: unknown): string[] =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];

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
    { value: 'suspicious_payment', label: 'Solicitou pagamento suspeito' },
    { value: 'external_deal', label: 'Quer negociar fora da plataforma' },
    { value: 'meet_in_person', label: 'Quer encontro presencial suspeito' },
    { value: 'fake_documents', label: 'Enviou documentos falsos' },
    { value: 'third_party', label: 'Usando dados de terceiros' },
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

  const [seoMeta, setSeoMeta] = useState<Record<string, string>>({});

  const fetchFullData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/profile/page/${slug}`);

      if (res.data?.success) {
        const data = res.data.data;
        setProfile(data);
        if (res.data.seo) setSeoMeta(res.data.seo);

        try {
          const postsRes = await api.get('/get-user-posts', {
            params: { user_id: data.id },
          });
          const items = Array.isArray(postsRes.data?.data) ? postsRes.data.data : [];

          const userType = (data.user_type || '').toUpperCase();
          const isDriverType = userType === 'DRIVER';
          const isAdvertiserType = userType === 'ADVERTISER';

          if (isAdvertiserType) {
            setMarketplaceItems(items.filter((p: PostItem) => p.type === 'marketplace'));
            setAdItems(items.filter((p: PostItem) => p.type === 'ad'));
            setFreights([]);
          } else if (isDriverType) {
            setMarketplaceItems(items);
            setFreights([]);
          } else {
            setFreights(items.filter((p: PostItem) => p.type !== 'marketplace'));
            setMarketplaceItems(items.filter((p: PostItem) => p.type === 'marketplace'));
          }
        } catch (postError) {
          console.error('Erro ao buscar posts:', postError);
          setFreights([]);
          setMarketplaceItems([]);
        }

        fetchArticles(data.id, 0);
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

  const fetchArticles = async (userId: number, page: number) => {
    try {
      setArticlesLoading(true);
      const res = await api.get(`/articles/user/${userId}`, {
        params: { limit: ARTICLES_PER_PAGE, offset: page * ARTICLES_PER_PAGE },
      });
      if (res.data?.success) {
        setArticles(res.data.data.articles || []);
        setArticlesTotal(res.data.data.total || 0);
        setArticlesPage(page);
      }
    } catch {
      setArticles([]);
    } finally {
      setArticlesLoading(false);
    }
  };

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

  usePageMeta(seoMeta.title ? {
    title: seoMeta.title,
    description: seoMeta.description,
    image: seoMeta.og_image,
    url: window.location.href,
    type: seoMeta.type || 'profile',
  } : {});

  if (loading) return <ProfileLoadingState />;
  if (!profile) return <ProfileNotFoundState />;

  const userType = (profile.user_type || '').toUpperCase();
  const isDriver = userType === 'DRIVER';
  const isAdvertiser = userType === 'ADVERTISER';
  const isShipper = userType === 'COMPANY' || userType === 'SHIPPER';
  const isSeller = isDriver || isAdvertiser || isShipper;

  const profileScore = calculateProfileScore(profile, isDriver);
  
  // Badge Identidade Confirmada: SÓ para motoristas, não para empresas
  // Verifica se tem algum tipo de verificação ativa (identity_confirmed, verified_until válido, is_verified = 1)
  const canBeVerified = isDriver || isAdvertiser;
  const hasIdentityConfirmed = canBeVerified && (
    profile.is_verified === true || 
    (profile.verified_until && new Date(profile.verified_until) > new Date()) ||
    profile.identity_confirmed == 1
  );

  const theme = useProfileTheme(profile.user_type);

  const displayName = profile.trade_name || profile.corporate_name || profile.name || 'Usuário Chama Frete';
  const roleLabel: Record<string, string> = {
    DRIVER: 'Profissional',
    ADVERTISER: 'Parceiro Anunciante',
    COMPANY: 'Empresa',
    SHIPPER: 'Empresa',
  };
  const displayRole = roleLabel[userType] || 'Empresa';
  
  const bannerImg = profile.cover_url;
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

  const websiteUrl = profile.website
    ? typeof profile.website === 'string' && profile.website.startsWith('http')
      ? profile.website
      : `https://${profile.website}`
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
  const hasMarketplace = isSeller && marketplaceItems.length > 0;
  const hasAnyPosts = hasFreights || hasMarketplace || adItems.length > 0;

  return (
    <ProfileErrorBoundary>
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow pt-16 md:pt-20">
        {/* HEADER BANNER */}
        <div className={`h-64 md:h-120 w-full relative overflow-hidden ${theme.bg}`}>
          {bannerImg ? (
            <>
              <img src={bannerImg} alt="Banner" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/60" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/40" />
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

        <div className="max-w-7xl mx-auto px-4 -mt-24 relative z-10 pb-20">
          {/* CARD PRINCIPAL DE IDENTIDADE */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[3rem] shadow-2xl border border-white/20 dark:border-slate-700/50 p-8 md:p-12">
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
                    <div className="w-full h-full bg-white dark:bg-slate-800 rounded-[2.8rem] overflow-hidden">
                      {avatarImg ? (
                        <img src={avatarImg} alt={displayName} loading="lazy" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600 flex items-center justify-center">
                          <span className="text-5xl md:text-6xl font-black text-white/90 tracking-tight">
                            {(displayName || 'U').split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || 'U'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {hasIdentityConfirmed && <IdentityBadge />}
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

                <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-slate-400 font-bold text-[11px] tracking-widest">
                  <span className={`flex items-center gap-2 ${theme.text}`}>
                    <MapPinned size={18} /> {profile.city || 'Atendimento'} - {profile.state || 'Brasil'}
                  </span>
                  {profile.member_since && (
                    <span className="flex items-center gap-2">
                      <Calendar size={18} /> No Chama Frete desde {new Date(profile.member_since).getFullYear()}
                    </span>
                  )}
                  {isLoggedIn ? (
                    profile.whatsapp_clean ? (
                      <button
                        onClick={handleWhatsAppClick}
                        className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                      >
                        <MessageCircle size={18} />
                        <span>WhatsApp</span>
                      </button>
                    ) : null
                  ) : (
                    <span className="flex items-center gap-1.5 text-slate-300 dark:text-slate-600">
                      <Lock size={14} />
                      <span>WhatsApp (login)</span>
                    </span>
                  )}
                  {websiteUrl && (
                    <a href={websiteUrl} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 transition-colors">
                      <Globe size={18} />
                      <span>Site</span>
                    </a>
                  )}
                  {instagramUrl && (
                    <a href={instagramUrl} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1.5 text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 transition-colors">
                      <Instagram size={18} />
                      <span>Instagram</span>
                    </a>
                  )}
                  {linkedinUrl && (
                    <a href={linkedinUrl} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1.5 text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
                      <Linkedin size={18} />
                      <span>LinkedIn</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* BIO / SOBRE */}
            <div className="mt-12 pt-10 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-slate-900 dark:text-white font-black uppercase italic text-sm tracking-widest flex items-center gap-3 mb-6">
                <div className={`w-10 h-1.5 ${theme.bg} rounded-full`} />
                {isDriver ? 'Sobre mim' : isAdvertiser ? 'Sobre o Anunciante' : 'Sobre a Empresa'}
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
                    <ProfileInfoItem
                      label="Veículo"
                      value={profile.vehicle_type || (profile.extras?.vehicle_type as string) || 'Não informado'}
                    />
                    <ProfileInfoItem
                      label="Implemento"
                      value={profile.body_type || (profile.extras?.body_type as string) || '---'}
                    />
                    <ProfileInfoItem
                      label="Status"
                      value={isAvailable ? 'Disponível' : 'Indisponível'}
                    />
                    {asArray(profile.certifications).length > 0 && (
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Certificações</p>
                        <div className="flex flex-wrap gap-1.5">
                          {asArray(profile.certifications).map((cert) => (
                            <span key={cert} className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2.5 py-1 rounded-lg text-[10px] font-bold">{cert}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {asArray(profile.available_equipment).length > 0 && (
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Equipamentos</p>
                        <div className="flex flex-wrap gap-1.5">
                          {asArray(profile.available_equipment).map((eq) => (
                            <span key={eq} className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-lg text-[10px] font-bold">{eq}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {asArray(profile.preferred_regions).length > 0 && (
                      <ProfileInfoItem label="Regiões" value={asArray(profile.preferred_regions).join(', ')} />
                    )}
                  </div>
                )}
                {!isDriver && !isAdvertiser && asArray(profile.preferred_regions).length > 0 && (
                  <div className={`${theme.light} p-6 rounded-[2.5rem] border ${theme.border} space-y-4`}>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">
                      Regiões de Atuação
                    </p>
                    <ProfileInfoItem label="Regiões" value={asArray(profile.preferred_regions).join(', ')} />
                  </div>
                )}
                {isAdvertiser && (profile.advertiser_category || profile.advertiser_target) && (
                  <div className={`${theme.light} p-6 rounded-[2.5rem] border ${theme.border} space-y-4`}>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">
                      Segmento
                    </p>
                    {profile.advertiser_category && (
                      <ProfileInfoItem label="Categoria" value={profile.advertiser_category} />
                    )}
                    {profile.advertiser_target && (
                      <ProfileInfoItem label="Público-alvo" value={profile.advertiser_target} />
                    )}
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

          </div>

          {/* SPOTLIGHT AD */}
          <div className="mt-12 max-w-4xl mx-auto">
            <AdCard position="spotlight" variant="ecommerce" state={profile.state} city={profile.city} />
          </div>

          {/* LISTAGEM DE POSTS */}
          {hasFreights && (
            <section className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
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

          {/* ARTIGOS DO AUTOR */}
          {articlesTotal > 0 && (
            <section className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
                <h2 className="text-2xl md:text-3xl font-black uppercase italic text-slate-900 dark:text-white tracking-tighter">
                  Artigos Publicados
                </h2>
                <span className="bg-white dark:bg-slate-900 px-4 py-2 rounded-full text-xs font-black text-slate-500 border border-slate-200 dark:border-slate-700 uppercase">
                  {articlesTotal} {articlesTotal === 1 ? 'artigo' : 'artigos'}
                </span>
              </div>

              {articlesLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin text-orange-500" size={28} />
                </div>
              ) : (
                <div className="space-y-4">
                  {articles.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}

                  {/* Paginação */}
                  {articlesTotal > ARTICLES_PER_PAGE && (
                    <div className="flex items-center justify-center gap-2 pt-4">
                      <button
                        onClick={() => fetchArticles(profile.id, articlesPage - 1)}
                        disabled={articlesPage === 0}
                        className="px-4 py-2 rounded-xl text-xs font-bold uppercase bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        Anterior
                      </button>
                      {Array.from({ length: Math.ceil(articlesTotal / ARTICLES_PER_PAGE) }, (_, i) => (
                        <button
                          key={i}
                          onClick={() => fetchArticles(profile.id, i)}
                          className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                            i === articlesPage
                              ? 'bg-orange-500 text-white'
                              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                      <button
                        onClick={() => fetchArticles(profile.id, articlesPage + 1)}
                        disabled={(articlesPage + 1) * ARTICLES_PER_PAGE >= articlesTotal}
                        className="px-4 py-2 rounded-xl text-xs font-bold uppercase bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        Próximo
                      </button>
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

          {/* ANÚNCIOS PUBLICITÁRIOS (advertiser) */}
          {adItems.length > 0 && (
            <section className="mt-12">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
                <h2 className="text-2xl md:text-3xl font-black uppercase italic text-slate-900 dark:text-white tracking-tighter flex items-center gap-3">
                  <Megaphone className="text-purple-600" size={24} /> Anúncios Publicitários
                </h2>
                <span className="bg-white dark:bg-slate-900 px-4 py-2 rounded-full text-xs font-black text-slate-500 border border-slate-200 dark:border-slate-700 uppercase">
                  {adItems.length} {adItems.length === 1 ? 'anúncio' : 'anúncios'}
                </span>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {adItems.map((item) => {
                  const ad = item as Record<string, unknown>;
                  return (
                    <div key={item.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-lg transition-shadow">
                      {ad.image_url && (
                        <img src={ad.image_url as string} alt={ad.title as string} loading="lazy" className="w-full h-40 object-cover" />
                      )}
                      <div className="p-4">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white uppercase line-clamp-2">{ad.title as string}</h4>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{ad.description as string}</p>
                        {(ad.destination_url || ad.link_whatsapp) && (
                          <a
                            href={(ad.destination_url || ad.link_whatsapp) as string}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-purple-600 hover:text-purple-700"
                          >
                            Saiba mais →
                          </a>
                        )}
                      </div>
                    </div>
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

      <ShareProfileButton
        url={typeof window !== 'undefined' ? window.location.href : `https://www.chamafrete.com.br/perfil/${slug}`}
        title={displayName}
      />

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
    </ProfileErrorBoundary>
  );
}

