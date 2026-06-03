import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../api/api';
import { 
  MapPin, Calendar, Share2, Loader2, User, Building2, 
  Phone, Lock, Star, AlertTriangle, Info, ShieldCheck, Flag,
  Eye, Heart, ChevronRight, Clock, Mail, FileText, Camera
} from 'lucide-react';
import Header from '../../components/shared/Header';
import Footer from '../../components/shared/Footer';
import AdCard from '../../components/shared/AdCard';
import { AdImage } from '../../components/AdImage';
import AuthModal from '../../components/modals/AuthModal';
import { useTracker } from '../../services/useTracker';
import { usePageMeta } from '../../hooks/usePageMeta';

interface ListingData {
  id: number;
  title: string;
  slug: string;
  description?: string;
  price: string | number;
  category: string;
  main_image?: string;
  gallery?: string[];
  images?: string[];
  location_city: string;
  location_state: string;
  is_featured: number;
  created_at: string;
  seller_name: string;
  seller_slug: string;
  seller_avatar?: string;
  seller_phone?: string;
  user_id?: number;
  seller_verified: number;
  seller_since: string;
  total_listings: number;
  item_condition?: string;
  views_count?: number;
  related?: ListingData[];
  seller_listings?: ListingData[];
  seller_display_name?: string;
  seller_is_company?: number;
  seller_last_active?: string;
  seller_verifications?: {
    email: boolean;
    whatsapp: boolean;
    document: boolean;
    instagram: boolean;
  };
}

export default function ListingDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { trackEvent } = useTracker();
  
  const [listing, setListing] = useState<ListingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<'WHATSAPP' | 'CHAT' | null>(null);

  const [authState, setAuthState] = useState({
    isAuthenticated: !!localStorage.getItem('@ChamaFrete:token'),
    user: JSON.parse(localStorage.getItem('@ChamaFrete:user') || '{}')
  });
  
  const viewLogged = useRef(false);

  useEffect(() => {
    async function loadData() {
      if (!slug) return;
      try {
        setLoading(true);
        const res = await api.get(`/anuncio/${slug}`);
        
        if (res.data?.success) {
          const data = res.data.data as ListingData;
          setListing(data);
          
          if (!viewLogged.current) {
            trackEvent(data.id, 'LISTING', 'VIEW');
            viewLogged.current = true;
          }
        } else {
          setError(true);
        }
      } catch { 
        setError(true); 
      } finally { 
        setLoading(false); 
      }
    }
    loadData();
  }, [slug, trackEvent]);

  const getMemberSince = (dateString: string | null | undefined) => {
    if (!dateString || dateString === "NULL") return '2025';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? '2025' : date.getFullYear();
  };

  const getLastActive = (dateString: string | null | undefined) => {
    if (!dateString || dateString === "NULL" || dateString === "0000-00-00 00:00:00") return 'Indisponível';
    const now = new Date();
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Indisponível';
    const diffMs = now.getTime() - date.getTime();
    if (diffMs < 0) return 'Online agora';
    const diffMin = Math.floor(diffMs / (1000 * 60));
    if (diffMin < 1) return 'Online agora';
    if (diffMin < 60) return `Último acesso há ${diffMin} min`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `Último acesso há ${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Último acesso ontem';
    if (diffDays < 7) return `Último acesso há ${diffDays} dias`;
    if (diffDays < 30) return `Último acesso há ${Math.floor(diffDays / 7)} sem.`;
    return `Último acesso há ${Math.floor(diffDays / 30)} meses`;
  };

  const handleShare = async () => {
    const shareData = {
      title: listing?.title,
      text: `Olha este anúncio no Chama Frete: ${listing?.title} por R$ ${listing?.price}`,
      url: window.location.href,
    };
    try {
      if (navigator.share) await navigator.share(shareData);
      else {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copiado!");
      }
    } catch (err) { console.log(err); }
  };

  const executeWhatsApp = () => {
    const phone = listing?.seller_phone?.replace(/\D/g, '') || '';
    if (!phone) return alert("Contato indisponível.");
    trackEvent(listing.id, 'LISTING', 'WHATSAPP_CLICK');
    const msg = encodeURIComponent(`Olá! Vi o anúncio "${listing?.title}" no Chama Frete e gostaria de mais informações.`);
    window.open(`https://wa.me/55${phone}?text=${msg}`, '_blank');
  };

  const executeChat = () => {
    if (authState.user.id === listing?.user_id) return alert("Você é o anunciante.");
    navigate(`/dashboard/chat?listing=${listing?.id}`);
  };

  const handleWhatsAppClick = () => {
    if (!authState.isAuthenticated) {
      setPendingAction('WHATSAPP');
      setIsAuthModalOpen(true);
      return;
    }
    executeWhatsApp();
  };

  const handleChatClick = () => {
    if (!authState.isAuthenticated) {
      setPendingAction('CHAT');
      setIsAuthModalOpen(true);
      return;
    }
    executeChat();
  };

  const handleAuthSuccess = () => {
    const token = localStorage.getItem('@ChamaFrete:token');
    const userData = JSON.parse(localStorage.getItem('@ChamaFrete:user') || '{}');
    setAuthState({ isAuthenticated: !!token, user: userData });
    setIsAuthModalOpen(false);
    setTimeout(() => {
      if (pendingAction === 'WHATSAPP') executeWhatsApp();
      else if (pendingAction === 'CHAT') executeChat();
      setPendingAction(null);
    }, 500);
  };

  const images = listing?.gallery?.length > 0 
    ? listing.gallery 
    : listing?.main_image 
      ? [listing.main_image] 
      : [];

  const listingTitle = listing ? `${listing.title} | ${listing.location_city}-${listing.location_state}` : undefined;
  const listingDesc = listing ? `Anúncio: ${listing.title} por ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(listing.price))} em ${listing.location_city}-${listing.location_state}.` : undefined;
  const listingImage = listing?.main_image || listing?.gallery?.[0] || undefined;

  usePageMeta(listing ? {
    title: listingTitle,
    description: listingDesc,
    image: listingImage,
    url: window.location.href,
    type: 'article',
  } : {});

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-emerald-600" size={40} />
    </div>
  );

  if (error || !listing) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
      <AlertTriangle className="text-amber-500 mb-4" size={48} />
      <h2 className="text-xl font-black uppercase italic">Anúncio não encontrado</h2>
      <button onClick={() => navigate('/marketplace')} className="mt-4 bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold uppercase">Voltar</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="max-w-7xl mx-auto pt-24 lg:pt-32 pb-20 px-4">
        
        {/* NAVEGAÇÃO */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 lg:mb-8">
          <nav className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <Link to="/" className="hover:text-emerald-600 transition-colors shrink-0">Home</Link>
            <ChevronRight size={10} className="shrink-0" />
            <Link to="/marketplace" className="hover:text-emerald-600 transition-colors shrink-0">Classificados</Link>
            <ChevronRight size={10} className="shrink-0" />
            <span className="text-slate-600 truncate max-w-[120px] sm:max-w-[200px]">{listing.title}</span>
          </nav>
          <div className="flex items-center gap-3 sm:gap-4">
            {Number(listing.views_count) > 0 && (
              <span className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase">
                <Eye size={12} /> {listing.views_count} visualizaç{Number(listing.views_count) !== 1 ? 'ões' : 'ão'}
              </span>
            )}
            <button className="flex items-center gap-1 text-slate-400 hover:text-red-500 transition-all">
              <Heart size={14} />
            </button>
            <button onClick={handleShare} className="flex items-center gap-1.5 sm:gap-2 text-slate-400 font-bold hover:text-emerald-600 transition-all uppercase text-[10px] tracking-widest">
              Compartilhar <Share2 size={14} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ESQUERDA: CONTEÚDO PRINCIPAL */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white rounded-2xl lg:rounded-[3rem] p-5 sm:p-8 lg:p-12 shadow-sm border border-slate-100 relative">
              
              {/* Box Produto e Valor */}
              <div className="mb-6 lg:mb-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-50 pb-6 lg:pb-10">
                  <div className="flex items-start sm:items-center gap-4 sm:gap-6">
                    <div className="bg-emerald-600 p-3 sm:p-5 rounded-2xl lg:rounded-3xl text-white shadow-lg shrink-0">
                      <Building2 size={28} className="sm:size-[40px]" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-3">
                        <span className="bg-emerald-100 text-emerald-700 px-2 sm:px-3 py-1 rounded-lg text-[8px] sm:text-[10px] font-black uppercase italic">
                          {listing.category}
                        </span>
                        {listing.subcategory && (
                          <span className="bg-emerald-50 text-emerald-500 px-2 sm:px-3 py-1 rounded-lg text-[8px] sm:text-[10px] font-black uppercase italic">
                            {listing.subcategory}
                          </span>
                        )}
                        <span className="bg-slate-100 text-slate-500 px-2 sm:px-3 py-1 rounded-lg text-[8px] sm:text-[10px] font-black uppercase italic">
                          {listing.item_condition || 'usado'}
                        </span>
                        {listing.is_featured === 1 && (
                          <span className="bg-amber-100 text-amber-700 px-2 sm:px-3 py-1 rounded-lg text-[8px] sm:text-[10px] font-black uppercase italic">
                            Destaque
                          </span>
                        )}
                        {Number(listing.accepting_offers) === 1 && (
                          <span className="bg-emerald-100 text-emerald-700 px-2 sm:px-3 py-1 rounded-lg text-[8px] sm:text-[10px] font-black uppercase italic">
                            Aceito ofertas
                          </span>
                        )}
                        {Number(listing.accepting_trade) === 1 && (
                          <span className="bg-amber-100 text-amber-700 px-2 sm:px-3 py-1 rounded-lg text-[8px] sm:text-[10px] font-black uppercase italic">
                            Aceito troca
                          </span>
                        )}
                        <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded text-[8px] sm:text-[10px] font-black uppercase italic">
                          #{listing.id}
                        </span>
                      </div>
                      <h1 className="text-xl sm:text-2xl lg:text-4xl font-[1000] uppercase italic text-slate-900 leading-tight break-words">
                        {listing.title}
                      </h1>
                    </div>
                  </div>
                </div>
              </div>

              {/* Galeria de Imagens */}
              <div className="mb-10">
                <div className="relative aspect-[4/3] bg-slate-100 rounded-[2rem] overflow-hidden">
                  {images.length > 0 ? (
                    <AdImage 
                      url={images[currentImageIndex]} 
                      className="w-full h-full object-contain"
                      alt={listing.title}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="bg-slate-200 rounded-full p-6">
                        <User size={48} className="text-slate-400" />
                      </div>
                    </div>
                  )}
                  
                  {images.length > 1 && (
                    <>
                      <button 
                        onClick={() => setCurrentImageIndex(i => i > 0 ? i - 1 : images.length - 1)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 rounded-full shadow-lg hover:bg-white transition-all"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
                      </button>
                      <button 
                        onClick={() => setCurrentImageIndex(i => i < images.length - 1 ? i + 1 : 0)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 rounded-full shadow-lg hover:bg-white transition-all"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
                      </button>
                    </>
                  )}
                </div>
                
                {images.length > 1 && (
                  <div className="flex gap-2 p-4 overflow-x-auto">
                    {images.map((img: string, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                          idx === currentImageIndex 
                            ? 'border-emerald-500' 
                            : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <AdImage url={img} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Descrição */}
              {listing.description && (
                <div>
                  <h4 className="font-black uppercase text-[11px] text-slate-900 mb-4 flex items-center gap-2 italic">
                    <Info size={18} className="text-emerald-600" /> Descrição
                  </h4>
                  <div className="text-slate-600 font-medium bg-slate-50 p-5 sm:p-8 rounded-xl lg:rounded-[2.5rem] border border-slate-100 whitespace-pre-line text-xs sm:text-sm leading-relaxed">
                    {listing.description}
                  </div>
                </div>
              )}
            </div>

            {/* Anúncio Horizontal */}
            <div className="max-w-4xl mx-auto">
              <AdCard position="spotlight" variant="ecommerce" city={listing.location_city} state={listing.location_state} />
            </div>

            {/* Anúncios Relacionados */}
            {listing.related && listing.related.length > 0 && (
              <div className="pt-4">
                <h3 className="font-[1000] uppercase italic text-slate-900 text-xl mb-6 flex items-center gap-3">
                  <Building2 className="text-emerald-600" size={24} /> Outros anúncios em {listing.location_state}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {listing.related.map((item) => (
                    <Link key={item.id} to={`/anuncio/${item.slug}`} className="group">
                      <div className="aspect-square rounded-xl overflow-hidden bg-slate-100">
                        {item.main_image || item.images?.[0] ? (
                          <AdImage 
                            url={item.main_image || item.images[0]} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            alt={item.title}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User size={32} className="text-slate-400" />
                          </div>
                        )}
                      </div>
                      <h4 className="font-bold text-sm text-slate-800 mt-2 uppercase italic line-clamp-2">
                        {item.title}
                      </h4>
                      <p className="text-emerald-600 font-black text-sm">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(item.price))}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Mais anúncios do vendedor */}
            {listing.seller_listings && listing.seller_listings.length > 0 && (
              <div className="pt-4">
                <h3 className="font-[1000] uppercase italic text-slate-900 text-xl mb-6 flex items-center gap-3">
                  <User className="text-emerald-600" size={22} /> Mais de {listing.seller_name?.split(' ')[0]}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {listing.seller_listings.map((item) => (
                    <Link key={item.id} to={`/anuncio/${item.slug}`} className="group">
                      <div className="aspect-square rounded-xl overflow-hidden bg-slate-100">
                        {item.main_image || item.images?.[0] ? (
                          <AdImage
                            url={item.main_image || item.images[0]}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            alt={item.title}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User size={32} className="text-slate-400" />
                          </div>
                        )}
                      </div>
                      <h4 className="font-bold text-sm text-slate-800 mt-2 uppercase italic line-clamp-2">
                        {item.title}
                      </h4>
                      <p className="text-emerald-600 font-black text-sm">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(item.price))}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Dicas de Segurança */}
            <div className="bg-white rounded-2xl lg:rounded-[3rem] p-5 sm:p-8 border border-slate-100">
              <h4 className="font-black uppercase text-[10px] sm:text-[11px] text-slate-900 mb-4 sm:mb-6 flex items-center gap-2 italic">
                <ShieldCheck size={16} className="sm:size-[18px] text-amber-500" /> Dicas de Segurança
              </h4>
              <ul className="space-y-2 sm:space-y-3">
                <li className="flex gap-3 sm:gap-4 items-start text-[11px] sm:text-xs lg:text-sm text-slate-600">
                  <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 font-bold text-[8px] sm:text-[10px]">1</span>
                  Verifique a reputação do vendedor antes de fechar negócio.
                </li>
                <li className="flex gap-3 sm:gap-4 items-start text-[11px] sm:text-xs lg:text-sm text-slate-600">
                  <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 font-bold text-[8px] sm:text-[10px]">2</span>
                  Use o chat do Chama Frete para todas as comunicações.
                </li>
                <li className="flex gap-3 sm:gap-4 items-start text-[11px] sm:text-xs lg:text-sm text-slate-600">
                  <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 font-bold text-[8px] sm:text-[10px]">3</span>
                  Desconfie de preços muito abaixo do mercado.
                </li>
              </ul>
            </div>
          </div>

          {/* DIREITA: SIDEBAR FIXA */}
          <div className="lg:col-span-4 space-y-6">
            <div className="sticky top-32 space-y-6">
              
              {/* Box de Contato */}
              <div className="bg-white rounded-2xl lg:rounded-[3rem] p-5 sm:p-8 lg:p-10 shadow-2xl border-2 border-slate-100">
                <div className="text-center">
                  <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase mb-2 tracking-[0.3em]">Preço</p>
                  <p className="text-2xl sm:text-3xl lg:text-5xl font-[1000] mb-6 lg:mb-10 tracking-tighter italic text-emerald-600">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(listing.price))}
                  </p>
                  
                  <div className="space-y-3 lg:space-y-4">
                    <button onClick={handleWhatsAppClick} className="w-full py-4 lg:py-5 rounded-xl lg:rounded-[1.5rem] font-black uppercase italic flex flex-col items-center justify-center gap-1 shadow-xl active:scale-95 transition-all bg-green-500 text-white hover:bg-green-600 px-4">
                      <div className="flex items-center gap-2">
                        {authState.isAuthenticated ? <Phone size={18} className="lg:size-[20px]" /> : <Lock size={18} className="lg:size-[20px]" />}
                        <span className="text-xs sm:text-sm lg:text-base">WhatsApp</span>
                      </div>
                      <span className="text-[8px] lg:text-[9px] opacity-80 font-bold">{authState.isAuthenticated ? 'Falar com anunciante' : 'Entrar para liberar'}</span>
                    </button>

                    <button onClick={handleChatClick} className="w-full bg-slate-900 text-white py-4 lg:py-5 rounded-xl lg:rounded-[1.5rem] font-black uppercase italic flex flex-col items-center justify-center gap-1 hover:bg-emerald-700 transition-all shadow-xl px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm lg:text-base">Enviar Mensagem</span>
                      </div>
                      <span className="text-[8px] lg:text-[9px] opacity-80 font-bold">Inicie agora mesmo</span>
                    </button>
                  </div>

                  {listing.contact_preference && listing.contact_preference !== 'ambos' && (
                    <p className="text-center mt-3 text-[10px] text-slate-400">
                      Vendedor prefere contato via <strong className="text-slate-600">{listing.contact_preference === 'whatsapp' ? 'WhatsApp' : listing.contact_preference === 'chat' ? 'Chat' : 'WhatsApp ou Chat'}</strong>
                    </p>
                  )}

                  {listing.user_id && (
                    <div className="text-center pt-2">
                      <Link
                        to={`/denunciar/anuncio/${slug}`}
                        className="text-[10px] text-slate-400 hover:text-red-500 font-bold uppercase tracking-widest transition-colors inline-flex items-center gap-1"
                      >
                        <Flag size={11} /> Denunciar
                      </Link>
                    </div>
                  )}

                  {/* Sobre o Anunciante */}
                  <div className="mt-8 pt-8 border-t border-slate-100">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest text-center mb-5">Sobre o Anunciante</p>

                    <Link
                      to={`/perfil/${listing.seller_slug}`}
                      className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-emerald-300 transition-colors"
                    >
                      <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0">
                        {listing.seller_avatar ? <img src={listing.seller_avatar} alt="" className="w-full h-full object-cover rounded-xl" /> : (listing.seller_display_name || listing.seller_name)?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm leading-tight">{listing.seller_display_name || listing.seller_name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Star size={12} className="text-amber-400 fill-amber-400" />
                          <span className="text-xs text-slate-500">5.0</span>
                          {listing.seller_is_company === 1 ? (
                            <span className="text-[9px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">Empresa</span>
                          ) : (
                            <span className="text-[9px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">Profissional</span>
                          )}
                        </div>
                      </div>
                    </Link>

                    <div className="mt-4 space-y-2.5">
                      {getLastActive(listing.seller_last_active) !== 'Indisponível' && (
                        <div className="flex items-center gap-2.5">
                          <Clock size={14} className="text-slate-400 shrink-0" />
                          <span className="text-xs text-slate-600">{getLastActive(listing.seller_last_active)}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2.5">
                        <MapPin size={14} className="text-slate-400 shrink-0" />
                        <span className="text-xs text-slate-600">{listing.seller_city || listing.location_city}, {listing.seller_state || listing.location_state}</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Calendar size={14} className="text-slate-400 shrink-0" />
                        <span className="text-xs text-slate-600">Membro desde {getMemberSince(listing.seller_since)}</span>
                      </div>
                    </div>

                    {listing.seller_verifications && (
                      <div className="mt-5 pt-4 border-t border-slate-100">
                        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center mb-3">Informações Verificadas</p>
                        <div className="space-y-2">
                          {[
                            { key: 'email', label: 'E-mail', icon: Mail },
                            { key: 'whatsapp', label: 'WhatsApp', icon: Phone },
                            { key: 'document', label: 'Identidade', icon: FileText },
                            { key: 'instagram', label: 'Instagram', icon: Camera },
                          ].map((item) => {
                            const verified = listing.seller_verifications?.[item.key as keyof typeof listing.seller_verifications];
                            const Icon = item.icon;
                            return (
                              <div key={item.key} className="flex items-center gap-2.5 py-0.5">
                                {verified ? (
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-emerald-500 shrink-0"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-slate-300 shrink-0"><path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                )}
                                <Icon size={13} className="text-slate-400 shrink-0" />
                                <span className="text-xs text-slate-500">{item.label}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <Link
                      to={`/perfil/${listing.seller_slug}`}
                      className="mt-5 flex items-center justify-center gap-2 w-full bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs uppercase tracking-wider py-3 rounded-xl transition-colors"
                    >
                      <User size={14} />
                      Acessar Perfil
                    </Link>

                  </div>
              </div>
            </div>

            {/* Anúncio Vertical */}
            <AdCard position="sidebar" variant="sidebar" state={listing.location_state} />
          </div>
        </div>
      </div>
      </main> 

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onSuccess={handleAuthSuccess} />
      <Footer />
    </div>
  );
}
