import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../api/api';
import { 
  ArrowLeft, MapPin, Calendar, Share2, Loader2, User, Building2, 
  Phone, Lock, Star, AlertTriangle, Info, TrendingUp, ShieldCheck
} from 'lucide-react';
import Header from '../../components/shared/Header';
import Footer from '../../components/shared/Footer';
import AdCard from '../../components/shared/AdCard';
import { AdImage } from '../../components/AdImage';
import AuthModal from '../../components/modals/AuthModal';
import { useTracker } from '../../services/useTracker';

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
  seller_verified: number;
  seller_since: string;
  total_listings: number;
  item_condition?: string;
  related?: ListingData[];
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
      <main className="max-w-6xl mx-auto pt-32 pb-20 px-4">
        
        {/* NAVEGAÇÃO */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate('/marketplace')} className="flex items-center gap-2 text-slate-400 font-bold hover:text-emerald-600 transition-all uppercase text-[10px] tracking-widest">
            <ArrowLeft size={16} /> Voltar
          </button>
          <button onClick={handleShare} className="flex items-center gap-2 text-slate-400 font-bold hover:text-slate-900 transition-all uppercase text-[10px] tracking-widest">
            Compartilhar <Share2 size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ESQUERDA: CONTEÚDO PRINCIPAL */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-sm border border-slate-100 relative">
              
              {/* Box Produto e Valor */}
              <div className="mb-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-50 pb-10">
                  <div className="flex items-center gap-6">
                    <div className="bg-emerald-600 p-5 rounded-3xl text-white shadow-lg shrink-0">
                      <Building2 size={40} />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase italic">
                          {listing.category}
                        </span>
                        <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-lg text-[10px] font-black uppercase italic">
                          {listing.item_condition || 'usado'}
                        </span>
                        {listing.is_featured === 1 && (
                          <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase italic">
                            Destaque
                          </span>
                        )}
                        <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded text-[10px] font-black uppercase italic">
                          #{listing.id}
                        </span>
                      </div>
                      <h1 className="text-3xl md:text-4xl font-[1000] uppercase italic text-slate-900 leading-tight break-words">
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
                  <div className="text-slate-600 font-medium bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 whitespace-pre-line text-sm leading-relaxed">
                    {listing.description}
                  </div>
                </div>
              )}
            </div>

            {/* Anúncio Horizontal */}
            <AdCard position="spotlight" variant="banner-wide" city={listing.location_city} state={listing.location_state} />

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
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price)}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Dicas de Segurança */}
            <div className="bg-white rounded-[3rem] p-8 border border-slate-100">
              <h4 className="font-black uppercase text-[11px] text-slate-900 mb-6 flex items-center gap-2 italic">
                <ShieldCheck size={18} className="text-amber-500" /> Dicas de Segurança
              </h4>
              <ul className="space-y-3">
                <li className="flex gap-4 items-start text-xs md:text-sm text-slate-600">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 font-bold text-[10px]">1</span>
                  Verifique a reputação do vendedor antes de fechar negócio.
                </li>
                <li className="flex gap-4 items-start text-xs md:text-sm text-slate-600">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 font-bold text-[10px]">2</span>
                  Use o chat do Chama Frete para todas as comunicações.
                </li>
                <li className="flex gap-4 items-start text-xs md:text-sm text-slate-600">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 font-bold text-[10px]">3</span>
                  Desconfie de preços muito abaixo do mercado.
                </li>
              </ul>
            </div>
          </div>

          {/* DIREITA: SIDEBAR FIXA */}
          <div className="lg:col-span-4 space-y-6">
            <div className="sticky top-32 space-y-6">
              
              {/* Box de Contato */}
              <div className="bg-white rounded-[3rem] p-8 md:p-10 shadow-2xl border-2 border-slate-100">
                <div className="text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-[0.3em]">Preço</p>
                  <p className="text-3xl md:text-5xl font-[1000] mb-10 tracking-tighter italic text-emerald-600">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(listing.price)}
                  </p>
                  
                  <div className="space-y-4">
                    <button onClick={handleWhatsAppClick} className="w-full py-5 rounded-[1.5rem] font-black uppercase italic flex flex-col items-center justify-center gap-1 shadow-xl active:scale-95 transition-all bg-green-500 text-white hover:bg-green-600 px-4">
                      <div className="flex items-center gap-2">
                        {authState.isAuthenticated ? <Phone size={20} /> : <Lock size={20} />}
                        <span className="text-sm md:text-base">WhatsApp</span>
                      </div>
                      <span className="text-[9px] opacity-80 font-bold">{authState.isAuthenticated ? 'Falar com anunciante' : 'Entrar para liberar'}</span>
                    </button>

                    <button onClick={handleChatClick} className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black uppercase italic flex flex-col items-center justify-center gap-1 hover:bg-emerald-700 transition-all shadow-xl px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm md:text-base">Enviar Mensagem</span>
                      </div>
                      <span className="text-[9px] opacity-80 font-bold">Inicie agora mesmo</span>
                    </button>
                  </div>

                  {/* Sobre o Anunciante */}
                  <div className="mt-8 pt-8 border-t border-slate-100 text-left">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-5 text-center">Sobre o Anunciante</p>
                    <Link 
                      to={`/perfil/${listing.seller_slug}`}
                      className="flex items-center gap-4 bg-slate-50 p-5 rounded-[2rem] border border-slate-100 hover:bg-slate-100 transition-colors"
                    >
                      <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shrink-0">
                        {listing.seller_avatar ? <img src={listing.seller_avatar} alt="Avatar" className="w-full h-full object-cover rounded-2xl" /> : listing.seller_name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Building2 size={14} className="text-slate-400" />
                          <p className="font-black text-slate-900 uppercase italic truncate text-sm">{listing.seller_name}</p>
                          {listing.seller_verified == 1 && (
                            <span className="text-emerald-600">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <Star size={12} className="text-amber-400 fill-amber-400" />
                          <span className="text-slate-600 font-black text-[11px]">5.0</span>
                          {listing.seller_verified == 1 && (
                            <span className="text-emerald-600 font-black text-[9px] uppercase ml-2">Verificado</span>
                          )}
                        </div>
                      </div>
                    </Link>
                    
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                        <p className="text-[8px] font-black text-slate-400 uppercase">Anúncios</p>
                        <p className="text-[10px] font-bold text-slate-700 uppercase italic">{listing.total_listings} ativo{listing.total_listings !== 1 ? 's' : ''}</p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                        <p className="text-[8px] font-black text-slate-400 uppercase">Desde</p>
                        <p className="text-[10px] font-bold text-slate-700 uppercase italic">{getMemberSince(listing.seller_since)}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <MapPin size={12} className="text-emerald-600" />
                          <span className="text-[10px] font-bold text-slate-600 uppercase">Localização</span>
                        </div>
                        <span className="text-[10px] font-black text-slate-800 uppercase">{listing.location_city}, {listing.location_state}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Calendar size={12} className="text-emerald-600" />
                          <span className="text-[10px] font-bold text-slate-600 uppercase">Publicado em</span>
                        </div>
                        <span className="text-[10px] font-black text-slate-800 uppercase">{new Date(listing.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Anúncio Vertical */}
              <AdCard position="sidebar" variant="vertical" state={listing.location_state} />
            </div>
          </div>
        </div>
      </main> 

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onSuccess={handleAuthSuccess} />
      <Footer />
    </div>
  );
}
