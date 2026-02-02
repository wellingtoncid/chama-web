import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../api/api';
import { 
  Truck, Phone, ArrowLeft, Info, Loader2, 
  AlertTriangle, MessageCircle, Lock, Weight, 
  Package, CheckCircle2, Clock, Star, ShieldCheck, 
  Calendar, MapPin, Share2, Flag, ChevronRight, X,
  Eye, Heart, Route, DollarSign, FileText, ExternalLink,
  TrendingUp, Users, CheckCircle, Copy, AlertCircle
} from 'lucide-react';

import Header from '../../components/shared/Header';
import Footer from '../../components/shared/Footer';
import AuthModal from '../../components/modals/AuthModal'; 
import AdCard from '../../components/shared/AdCard'; 

// Interface para tipagem forte
interface Freight {
  id: number;
  slug: string;
  product: string;
  origin_city: string;
  origin_state: string;
  dest_city: string;
  dest_state: string;
  vehicle_type: string;
  body_type: string;
  weight: number;
  price: number;
  description: string;
  contact_phone_clean: string;
  user_id: number;
  company_name: string;
  avatar_url?: string;
  owner_rating: number;
  created_at: string;
  distance_km?: number;
  urgency_level?: 'low' | 'medium' | 'high';
  views_count?: number;
  is_verified?: boolean;
}

export default function FreightDetails() {
  const { slug } = useParams(); 
  const navigate = useNavigate();
  
  // ESTADOS PRINCIPAIS
  const [freight, setFreight] = useState<Freight | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [relatedFreights, setRelatedFreights] = useState<any[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [ads, setAds] = useState<any[]>([]);
  
  // ESTADOS DE MODAIS E AUTH
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [pendingAction, setPendingAction] = useState<'WHATSAPP' | 'CHAT' | 'REPORT' | null>(null);
  
  const [authState, setAuthState] = useState({
    isAuthenticated: !!localStorage.getItem('@ChamaFrete:token'),
    user: JSON.parse(localStorage.getItem('@ChamaFrete:user') || '{}')
  });

  // Sincronizar estado de autenticação
  useEffect(() => {
    const syncAuthState = () => {
      const token = localStorage.getItem('@ChamaFrete:token');
      const user = localStorage.getItem('@ChamaFrete:user');
      
      const newState = {
        isAuthenticated: !!token,
        user: user ? JSON.parse(user) : {}
      };
      
      console.log('🔄 Sincronizando estado de auth:', newState);
      setAuthState(newState);
    };

    // Sincroniza imediatamente
    syncAuthState();

    // Listener para mudanças no localStorage (login em outra aba)
    window.addEventListener('storage', syncAuthState);
    
    // Listener customizado para login na mesma aba
    window.addEventListener('authStateChanged', syncAuthState);

    return () => {
      window.removeEventListener('storage', syncAuthState);
      window.removeEventListener('authStateChanged', syncAuthState);
    };
  }, []);

  // REGISTRO DE MÉTRICAS (Essencial para vender Ads depois)
  const registerMetric = useCallback(async (eventType: string, targetId: any) => {
    try {
      await api.post('/log-event', { target_id: targetId, event_type: eventType });
    } catch (err) {
      console.error("Erro ao registrar métrica:", eventType);
    }
  }, []);

  // CARREGAR ADS DO BACKEND
  const loadAds = useCallback(async () => {
    console.log('📢 Carregando ads...');
    try {
      const res = await api.get('/ads', {
        params: {
          position: 'details_page',
          status: 'active',
          limit: 5
        }
      });
      
      console.log('📢 Resposta da API de ads:', res.data);
      
      if (res.data?.success && res.data.data && res.data.data.length > 0) {
        console.log('📢 Ads carregados:', res.data.data.length, 'anúncios');
        setAds(res.data.data);
        
        // Registra impressões dos ads
        res.data.data.forEach((ad: any) => {
          registerMetric('AD_IMPRESSION', ad.id);
        });
      } else {
        console.log('📢 Nenhum ad retornado. Usando fallback para desenvolvimento.');
        // Fallback ads para desenvolvimento/teste
        const fallbackAds = [
          {
            id: 'fallback-1',
            title: 'Anuncie Aqui - Seu Negócio em Destaque',
            description: 'Alcance milhares de transportadores e embarcadores todos os dias. Entre em contato para saber mais sobre nossos planos de publicidade.',
            image_url: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&q=80',
            link_url: 'mailto:comercial@chamafrete.com.br',
            ad_type: 'horizontal'
          },
          {
            id: 'fallback-2',
            title: 'Rastreamento GPS em Tempo Real',
            description: 'Monitore sua frota 24/7 com a tecnologia mais avançada do mercado. Economize combustível e aumente a segurança.',
            image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
            link_url: '#',
            ad_type: 'vertical'
          },
          {
            id: 'fallback-3',
            title: 'Seguro Carga - Proteção Total',
            description: 'Proteja sua carga com as melhores seguradoras do Brasil. Cotação online em minutos.',
            image_url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80',
            link_url: '#',
            ad_type: 'cta'
          }
        ];
        setAds(fallbackAds as any);
      }
    } catch (err: any) {
      console.error('❌ Erro ao carregar ads:', err);
      console.error('❌ Detalhes do erro:', err.response?.data || err.message);
      
      // Usar fallback em caso de erro
      console.log('📢 Usando ads de fallback devido a erro');
      const fallbackAds = [
        {
          id: 'fallback-error-1',
          title: 'Espaço Publicitário Disponível',
          description: 'Anuncie aqui e alcance seu público-alvo. Entre em contato com nossa equipe comercial.',
          image_url: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&q=80',
          link_url: '#',
          ad_type: 'horizontal'
        }
      ];
      setAds(fallbackAds as any);
    }
  }, [registerMetric]);

  // Cálculo de valores derivados (Memoizado para performance)
  const freightMetrics = useMemo(() => {
    if (!freight) return null;
    
    const pricePerKm = freight.distance_km && freight.price 
      ? (freight.price / freight.distance_km).toFixed(2)
      : null;
    
    const estimatedDuration = freight.distance_km 
      ? Math.ceil(freight.distance_km / 80) // 80km/h média
      : null;
    
    const daysAgo = Math.floor((Date.now() - new Date(freight.created_at).getTime()) / (1000 * 60 * 60 * 24));
    const isRecent = daysAgo <= 3;
    
    return {
      pricePerKm,
      estimatedDuration,
      daysAgo,
      isRecent,
      formattedPrice: freight.price > 0 
        ? freight.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
        : 'A COMBINAR'
    };
  }, [freight]);

  // CARREGAMENTO DE DADOS
  useEffect(() => {
    async function loadData() {
      if (!slug) return;
      try {
        setLoading(true);
        setError(false);
        
        const res = await api.get(`/public-freight/${slug}`);
        if (res.data?.success) {
          const currentFreight = res.data.data;
          setFreight(currentFreight);
          
          // Registra que a carga foi vista
          registerMetric('FREIGHT_VIEW', currentFreight.id);

          // Busca Cargas Relacionadas (Mesma Cidade ou Rota Similar)
          const relRes = await api.get('/freights', {
            params: { 
              origin_city: currentFreight.origin_city,
              limit: 6
            }
          });
          
          if (relRes.data?.success) {
            const filtered = relRes.data.data
              .filter((f: any) => f.id !== currentFreight.id)
              .slice(0, 4);
            setRelatedFreights(filtered);
          }

          // Carrega ads
          loadAds();
        } else { 
          setError(true); 
        }
      } catch (err) { 
        console.error('Erro ao carregar frete:', err);
        setError(true); 
      } finally { 
        setLoading(false); 
      }
    }
    loadData();
  }, [slug, registerMetric, loadAds]);

  // Verificar favoritos quando autenticar
  useEffect(() => {
    if (authState.isAuthenticated && freight?.id) {
      checkIfFavorite(freight.id);
    }
  }, [authState.isAuthenticated, freight?.id]);

  // FORÇA fechamento do modal se usuário estiver autenticado
  useEffect(() => {
    if (authState.isAuthenticated && isAuthModalOpen) {
      console.log('🔒 Usuário autenticado detectado! Fechando modal...');
      setIsAuthModalOpen(false);
    }
  }, [authState.isAuthenticated, isAuthModalOpen]);

  // Verificar favoritos
  const checkIfFavorite = async (freightId: number) => {
    try {
      const res = await api.get(`/favorites/check/${freightId}`);
      setIsFavorite(res.data?.isFavorite || false);
    } catch (err) {
      console.error('Erro ao verificar favorito:', err);
    }
  };

  // Toggle favorito
  const handleToggleFavorite = async () => {
    if (!authState.isAuthenticated) {
      setPendingAction('CHAT');
      setIsAuthModalOpen(true);
      return;
    }

    try {
      if (isFavorite) {
        await api.delete(`/favorites/${freight?.id}`);
        setIsFavorite(false);
      } else {
        await api.post('/favorites', { freight_id: freight?.id });
        setIsFavorite(true);
        registerMetric('FREIGHT_FAVORITED', freight?.id);
      }
    } catch (err) {
      console.error('Erro ao favoritar:', err);
    }
  };

  // HANDLERS
  const handleShare = async () => {
    try {
      const shareData = {
        title: `Frete: ${freight?.product}`,
        text: `Confira este frete de ${freight?.origin_city} para ${freight?.dest_city}`,
        url: window.location.href
      };

      if (navigator.share) {
        await navigator.share(shareData);
        registerMetric('FREIGHT_SHARED', freight?.id);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2000);
      }
    } catch (err) { 
      console.log(err); 
    }
  };

  const handleWhatsAppClick = () => {
    if (!authState.isAuthenticated) {
      setPendingAction('WHATSAPP');
      setIsAuthModalOpen(true);
      return;
    }
    
    if (!freight) return;
    
    registerMetric('WHATSAPP_CLICK', freight.id);
    const msg = encodeURIComponent(
      `Olá! Vi seu frete de *${freight.product}* no Chama Frete.\n\n` +
      `📍 Rota: ${freight.origin_city}/${freight.origin_state} → ${freight.dest_city}/${freight.dest_state}\n` +
      `💰 Valor: ${freightMetrics?.formattedPrice}\n\n` +
      `Ainda está disponível?`
    );
    window.open(`https://wa.me/55${freight.contact_phone_clean}?text=${msg}`, '_blank');
  };

  const handleChatClick = async () => {
    if (!authState.isAuthenticated) {
      setPendingAction('CHAT');
      setIsAuthModalOpen(true);
      return;
    }
    
    if (!freight) return;
    
    if (authState.user.id === freight.user_id) {
      return alert("Você não pode negociar com seu próprio anúncio.");
    }
    
    try {
      setChatLoading(true);
      registerMetric('CHAT_INITIATED', freight.id);
      const res = await api.post('/chat/init', { 
        freight_id: freight.id, 
        seller_id: freight.user_id 
      });
      
      if (res.data?.success) {
        navigate(`/chat/${res.data.room_id}`);
      }
    } catch (err) { 
      alert("Erro ao iniciar chat. Tente novamente."); 
    } finally { 
      setChatLoading(false); 
    }
  };

  const submitReport = async () => {
    if (!reportReason.trim()) {
      alert("Por favor, descreva o motivo da denúncia.");
      return;
    }

    if (!authState.isAuthenticated) {
      setPendingAction('REPORT');
      setIsReportModalOpen(false);
      setIsAuthModalOpen(true);
      return;
    }

    try {
      setReportSubmitting(true);
      await api.post('/reports', {
        freight_id: freight?.id,
        reason: reportReason,
        type: 'freight'
      });
      
      alert("Denúncia enviada com sucesso! Nossa equipe irá analisar.");
      setIsReportModalOpen(false);
      setReportReason('');
      registerMetric('FREIGHT_REPORTED', freight?.id);
    } catch (err) {
      alert("Erro ao enviar denúncia. Tente novamente.");
    } finally {
      setReportSubmitting(false);
    }
  };

  const handleAuthSuccess = () => {
    console.log('✅ handleAuthSuccess chamado!');
    console.log('LocalStorage token:', localStorage.getItem('@ChamaFrete:token'));
    console.log('LocalStorage user:', localStorage.getItem('@ChamaFrete:user'));
    
    // FORÇA o fechamento do modal PRIMEIRO
    setIsAuthModalOpen(false);
    console.log('🚪 Modal FECHADO (isAuthModalOpen = false)');
    
    // Atualiza o estado imediatamente - FORÇA React a re-renderizar
    setAuthState(prev => {
      const newState = {
        isAuthenticated: true,
        user: JSON.parse(localStorage.getItem('@ChamaFrete:user') || '{}')
      };
      console.log('📝 Estado atualizado de:', prev, 'para:', newState);
      return newState;
    });
    
    // Dispara evento para outros componentes
    window.dispatchEvent(new Event('authStateChanged'));
    
    // Executa ação pendente
    const action = pendingAction;
    setPendingAction(null);
    
    if (action) {
      console.log('⏳ Executando ação pendente:', action);
      setTimeout(() => {
        if (action === 'WHATSAPP') {
          console.log('📱 Abrindo WhatsApp...');
          handleWhatsAppClick();
        } else if (action === 'CHAT') {
          console.log('💬 Abrindo Chat...');
          handleChatClick();
        } else if (action === 'REPORT') {
          console.log('🚩 Abrindo modal de denúncia...');
          setIsReportModalOpen(true);
        }
      }, 100);
    }
  };

  // LOADING STATE
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
        <p className="text-slate-400 font-bold text-sm">Carregando detalhes...</p>
      </div>
    );
  }

  // ERROR STATE
  if (error || !freight) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <AlertTriangle className="text-red-500 mb-4" size={48} />
        <h2 className="text-2xl font-black text-slate-900 mb-2">Frete não encontrado</h2>
        <p className="text-slate-600 mb-6 text-center">
          Este frete pode ter sido removido ou o link está incorreto.
        </p>
        <button 
          onClick={() => navigate('/fretes')}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all"
        >
          Ver todos os fretes
        </button>
      </div>
    );
  }

  // Urgência visual
  const urgencyConfig = {
    high: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100', label: 'URGENTE' },
    medium: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', label: 'MODERADO' },
    low: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100', label: 'NORMAL' }
  };
  
  const urgency = urgencyConfig[freight.urgency_level || 'low'];

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Header />
      
      {/* DEBUG - REMOVER DEPOIS */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-slate-900 text-white p-4 rounded-lg text-xs z-[200] max-w-xs overflow-auto max-h-96">
          <div className="font-bold mb-2">🔍 Debug FreightDetails:</div>
          <div className="space-y-1">
            <div>Autenticado: {authState.isAuthenticated ? '✅ SIM' : '❌ NÃO'}</div>
            <div>User ID: {authState.user?.id || 'N/A'}</div>
            <div>User Name: {authState.user?.name || 'N/A'}</div>
            <div>Modal Auth Aberto: {isAuthModalOpen ? '✅ SIM' : '❌ NÃO'}</div>
            <div>Ação Pendente: {pendingAction || 'Nenhuma'}</div>
            <div className="border-t border-slate-700 pt-2 mt-2">
              <div className="font-bold mb-1">📢 Ads:</div>
              <div>Total Carregado: {ads.length}</div>
              {ads.length > 0 && (
                <div className="text-[10px] mt-1">
                  {ads.map((ad, i) => (
                    <div key={ad.id} className="truncate">
                      {i + 1}. {ad.title}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* BANNER AD FIXO (se houver ad de banner) */}
      {ads.length > 0 && ads[0]?.ad_type === 'banner' && (
        <div className="bg-white border-b border-slate-200 sticky top-20 z-40 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-2">
            <div 
              onClick={() => {
                registerMetric('AD_CLICK', ads[0].id);
                if (ads[0].link_url) {
                  window.open(ads[0].link_url, '_blank', 'noopener,noreferrer');
                }
              }}
              className="flex items-center justify-between gap-4 cursor-pointer group"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 shrink-0">
                  Patrocinado
                </span>
                <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                  {ads[0].title}
                </p>
              </div>
              
              {ads[0].link_url && (
                <div className="flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-widest shrink-0">
                  Saiba mais
                  <ExternalLink size={12} className="group-hover:translate-x-1 transition-transform" />
                </div>
              )}
              
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setAds(prevAds => prevAds.filter((_, i) => i !== 0));
                }}
                className="text-slate-400 hover:text-slate-900 transition-colors p-1"
                title="Fechar anúncio"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
      
      <main className="max-w-6xl mx-auto pt-32 pb-20 px-4">
        
        {/* NAVEGAÇÃO E AÇÕES */}
        <div className="flex items-center justify-between mb-8 gap-4">
          <button 
            onClick={() => navigate('/fretes')} 
            className="flex items-center gap-2 text-slate-400 font-black hover:text-blue-600 transition-all uppercase text-[10px] tracking-widest"
          >
            <ArrowLeft size={16} /> Voltar
          </button>
          
          <div className="flex items-center gap-3">
            {/* Visualizações */}
            {freight.views_count && (
              <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase">
                <Eye size={14} />
                <span>{freight.views_count}</span>
              </div>
            )}
            
            {/* Favoritar */}
            <button 
              onClick={handleToggleFavorite}
              className={`p-2 rounded-xl transition-all ${
                isFavorite 
                  ? 'bg-red-50 text-red-500' 
                  : 'bg-slate-100 text-slate-400 hover:text-red-500'
              }`}
              title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            >
              <Heart size={16} className={isFavorite ? 'fill-current' : ''} />
            </button>
            
            {/* Compartilhar */}
            <button 
              onClick={handleShare} 
              className="flex items-center gap-2 text-slate-400 font-black hover:text-slate-900 transition-all uppercase text-[10px] tracking-widest bg-slate-100 px-4 py-2 rounded-xl"
            >
              {shareSuccess ? (
                <>
                  <CheckCircle size={14} className="text-green-500" />
                  <span className="text-green-500">Copiado!</span>
                </>
              ) : (
                <>
                  Compartilhar <Share2 size={14} />
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* COLUNA PRINCIPAL */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* CARD PRINCIPAL */}
            <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-sm border border-slate-100 overflow-hidden">
              
              {/* HEADER */}
              <div className="mb-10 pb-10 border-b border-slate-50">
                <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-600 p-4 rounded-2xl text-white shadow-lg">
                      <Truck size={32} />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg font-black text-[9px] uppercase italic border border-blue-100">
                        Carga Ativa
                      </span>
                      {freightMetrics?.isRecent && (
                        <span className="bg-green-50 text-green-600 px-3 py-1 rounded-lg font-black text-[9px] uppercase italic border border-green-100 animate-pulse">
                          ● Novo
                        </span>
                      )}
                      {freight.is_verified && (
                        <span className="bg-purple-50 text-purple-600 px-3 py-1 rounded-lg font-black text-[9px] uppercase italic border border-purple-100">
                          <CheckCircle size={10} className="inline mr-1" />
                          Verificado
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Badge de urgência */}
                  <span className={`${urgency.bg} ${urgency.text} px-3 py-1 rounded-lg font-black text-[9px] uppercase italic border ${urgency.border}`}>
                    {urgency.label}
                  </span>
                </div>
                
                {/* TÍTULO */}
                <h1 className="text-4xl md:text-6xl font-[1000] uppercase italic text-slate-900 leading-[0.85] tracking-tighter break-words mb-4">
                  {freight.product}
                </h1>
                
                {/* Meta info */}
                <div className="flex flex-wrap items-center gap-4 text-slate-400 text-[10px] font-bold">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    Postado há {freightMetrics?.daysAgo} dia{freightMetrics?.daysAgo !== 1 ? 's' : ''}
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText size={12} />
                    ID #{freight.id}
                  </span>
                </div>
              </div>

              {/* ROTA DESTACADA */}
              <div className="mb-10 bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-[2rem] border-2 border-slate-100">
                <div className="flex items-center gap-2 mb-4">
                  <Route className="text-blue-600" size={20} />
                  <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Rota do Frete</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                    <p className="text-[9px] font-black text-blue-500 uppercase mb-2 tracking-widest italic flex items-center gap-2">
                      <MapPin size={12} /> Origem
                    </p>
                    <p className="font-black text-slate-900 text-2xl uppercase italic leading-none truncate">
                      {freight.origin_city}
                    </p>
                    <p className="text-blue-600 font-black text-sm italic uppercase">
                      {freight.origin_state}
                    </p>
                  </div>
                  
                  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                    <p className="text-[9px] font-black text-green-500 uppercase mb-2 tracking-widest italic flex items-center gap-2">
                      <MapPin size={12} /> Destino
                    </p>
                    <p className="font-black text-slate-900 text-2xl uppercase italic leading-none truncate">
                      {freight.dest_city}
                    </p>
                    <p className="text-green-600 font-black text-sm italic uppercase">
                      {freight.dest_state}
                    </p>
                  </div>
                </div>
                
                {/* Métricas da rota */}
                {(freight.distance_km || freightMetrics?.estimatedDuration) && (
                  <div className="mt-4 flex flex-wrap gap-3">
                    {freight.distance_km && (
                      <div className="bg-white px-4 py-2 rounded-xl border border-slate-100 text-[10px] font-black text-slate-600">
                        📏 {freight.distance_km} km
                      </div>
                    )}
                    {freightMetrics?.estimatedDuration && (
                      <div className="bg-white px-4 py-2 rounded-xl border border-slate-100 text-[10px] font-black text-slate-600">
                        ⏱️ ~{freightMetrics.estimatedDuration}h estimadas
                      </div>
                    )}
                    {freightMetrics?.pricePerKm && (
                      <div className="bg-white px-4 py-2 rounded-xl border border-slate-100 text-[10px] font-black text-green-600">
                        💵 R$ {freightMetrics.pricePerKm}/km
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* CARACTERÍSTICAS TÉCNICAS */}
              <div className="mb-10">
                <h3 className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest flex items-center gap-2">
                  <Info size={14} /> Especificações Técnicas
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { icon: <Truck size={18}/>, label: 'Veículo', val: freight.vehicle_type, color: 'blue' },
                    { icon: <Package size={18}/>, label: 'Carroceria', val: freight.body_type, color: 'purple' },
                    { icon: <Weight size={18}/>, label: 'Peso', val: `${freight.weight.toLocaleString()} kg`, color: 'orange' }
                  ].map((item, i) => (
                    <div key={i} className="bg-gradient-to-br from-slate-50 to-white border-2 border-slate-50 p-4 rounded-2xl hover:border-slate-200 transition-all group">
                      <div className={`text-${item.color}-500 flex justify-center mb-2 group-hover:scale-110 transition-transform`}>
                        {item.icon}
                      </div>
                      <p className="text-[8px] font-black text-slate-400 uppercase mb-1 text-center">
                        {item.label}
                      </p>
                      <p className="text-[11px] font-black text-slate-800 uppercase italic text-center truncate">
                        {item.val || '---'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* DESCRIÇÃO DETALHADA */}
              <div className="space-y-4">
                <h4 className="font-black uppercase text-[10px] tracking-widest flex items-center gap-2 text-slate-400 px-2">
                  <FileText size={14} /> Detalhes e Observações
                </h4>
                <div className="bg-slate-50 p-8 rounded-[2.5rem] text-slate-700 text-sm md:text-base leading-relaxed border border-slate-100 break-words">
                  {freight.description ? (
                    <p className="whitespace-pre-wrap">{freight.description}</p>
                  ) : (
                    <p className="text-slate-400 italic">Nenhuma observação adicional fornecida pelo anunciante.</p>
                  )}
                </div>
              </div>

              {/* AD INLINE - CTA DESTACADO */}
              {ads.length > 2 && ads[2] && (
                <div className="mt-8">
                  <div 
                    onClick={() => {
                      registerMetric('AD_CLICK', ads[2].id);
                      if (ads[2].link_url) {
                        window.open(ads[2].link_url, '_blank', 'noopener,noreferrer');
                      }
                    }}
                    className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-[2rem] p-8 text-white cursor-pointer hover:shadow-2xl hover:scale-[1.02] transition-all group relative overflow-hidden"
                  >
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -translate-y-20 translate-x-20"></div>
                      <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-16 -translate-x-16"></div>
                    </div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-3 opacity-70">
                        <span className="text-[8px] font-black uppercase tracking-[0.3em]">
                          Conteúdo Patrocinado
                        </span>
                      </div>
                      
                      <h3 className="text-2xl md:text-3xl font-[1000] uppercase italic mb-3 leading-tight">
                        {ads[2].title}
                      </h3>
                      
                      <p className="text-blue-100 text-sm mb-4 leading-relaxed">
                        {ads[2].description}
                      </p>
                      
                      {ads[2].link_url && (
                        <div className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest group-hover:gap-3 transition-all">
                          Acessar agora
                          <ExternalLink size={14} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ANÚNCIOS DO SISTEMA */}
            {ads.length > 0 && (
              <div className="w-full space-y-6">
                {ads.map((ad, index) => (
                  <div key={ad.id}>
                    <div className="flex items-center gap-4 mb-4 opacity-30">
                      <span className="text-[9px] font-black uppercase tracking-[0.3em] italic text-slate-400">
                        Patrocinado
                      </span>
                      <div className="h-px bg-slate-200 flex-1" />
                    </div>
                    
                    <div 
                      onClick={() => {
                        registerMetric('AD_CLICK', ad.id);
                        if (ad.link_url) {
                          window.open(ad.link_url, '_blank', 'noopener,noreferrer');
                        }
                      }}
                      className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden hover:shadow-xl hover:border-blue-200 transition-all cursor-pointer group"
                    >
                      {/* Anúncio Horizontal */}
                      <div className="flex flex-col md:flex-row">
                        {/* Imagem */}
                        {ad.image_url && (
                          <div className="md:w-1/3 h-48 md:h-auto overflow-hidden bg-slate-100">
                            <img 
                              src={ad.image_url} 
                              alt={ad.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              onError={(e) => {
                                e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f1f5f9" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="%2394a3b8"%3ESem imagem%3C/text%3E%3C/svg%3E';
                              }}
                            />
                          </div>
                        )}
                        
                        {/* Conteúdo */}
                        <div className="flex-1 p-6 md:p-8 flex flex-col justify-center">
                          <div className="mb-3">
                            <h4 className="text-xl md:text-2xl font-[1000] uppercase italic text-slate-900 leading-tight mb-2 group-hover:text-blue-600 transition-colors">
                              {ad.title}
                            </h4>
                            <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">
                              {ad.description}
                            </p>
                          </div>
                          
                          {ad.link_url && (
                            <div className="flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-widest group-hover:gap-3 transition-all">
                              Saiba mais
                              <ExternalLink size={12} className="group-hover:translate-x-1 transition-transform" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Fallback se não houver ads */}
            {ads.length === 0 && (
              <div className="w-full">
                <div className="flex items-center gap-4 mb-4 opacity-30">
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] italic text-slate-400">
                    Patrocinado
                  </span>
                  <div className="h-px bg-slate-200 flex-1" />
                </div>
                <div className="bg-white p-2 rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden min-h-[120px]">
                  <AdCard position="details_page" variant="horizontal" />
                </div>
              </div>
            )}

            {/* CARGAS RELACIONADAS */}
            {relatedFreights.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-[1000] uppercase italic text-slate-900">
                    Outras cargas de {freight.origin_city}
                  </h3>
                  <button 
                    onClick={() => navigate(`/fretes?origem=${freight.origin_city}`)}
                    className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline flex items-center gap-1"
                  >
                    Ver todas <ExternalLink size={12} />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {relatedFreights.map((item: any) => (
                    <div 
                      key={item.id} 
                      onClick={() => { 
                        navigate(`/frete/${item.slug}`); 
                        window.scrollTo({ top: 0, behavior: 'smooth' }); 
                      }}
                      className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center justify-between group cursor-pointer hover:border-blue-600 hover:shadow-xl transition-all"
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <p className="font-black uppercase italic text-slate-900 group-hover:text-blue-600 transition-colors truncate text-sm">
                          {item.product}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 truncate">
                          Para: {item.dest_city}/{item.dest_state}
                        </p>
                        {item.price > 0 && (
                          <p className="text-[10px] font-black text-green-600 mt-1">
                            {parseFloat(item.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </p>
                        )}
                      </div>
                      <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SIDEBAR - AÇÕES E CONTATO */}
          <div className="lg:col-span-4 space-y-6">
            {/* CARD PRINCIPAL DE AÇÃO */}
            <div className="bg-white rounded-[3rem] p-8 md:p-10 shadow-2xl border-2 border-slate-900 sticky top-32 overflow-hidden">
              <div className="text-center">
                
                {/* PREÇO DESTACADO */}
                <div className="mb-8">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-[0.2em] italic flex items-center justify-center gap-2">
                    <DollarSign size={12} />
                    Pagamento Estimado
                  </p>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-3xl border-2 border-green-100">
                    <p className="text-3xl md:text-4xl font-[1000] tracking-tighter italic text-green-600 leading-none break-all">
                      {freightMetrics?.formattedPrice}
                    </p>
                    {freightMetrics?.pricePerKm && freight.price > 0 && (
                      <p className="text-[10px] text-green-600 font-bold mt-2 opacity-70">
                        R$ {freightMetrics.pricePerKm} por km
                      </p>
                    )}
                  </div>
                </div>
                
                {/* BOTÕES DE AÇÃO */}
                <div className="space-y-3 mb-8">
                  <button 
                    onClick={handleWhatsAppClick} 
                    className="w-full bg-green-500 text-white py-5 rounded-2xl font-black uppercase italic flex items-center justify-center gap-3 hover:bg-green-600 transition-all shadow-xl shadow-green-100 active:scale-95"
                  >
                    <Phone size={20} /> 
                    {authState.isAuthenticated ? 'Chamar no WhatsApp' : 'Liberar Contato'}
                  </button>
                  
                  <button 
                    onClick={handleChatClick} 
                    disabled={chatLoading || (authState.isAuthenticated && authState.user.id === freight.user_id)}
                    className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase italic flex items-center justify-center gap-3 hover:bg-blue-600 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                  >
                    {chatLoading ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <MessageCircle size={20} />
                    )} 
                    Negociar no Chat
                  </button>
                </div>

                {/* CARD DO ANUNCIANTE */}
                <div className="pt-8 border-t border-slate-100 text-left">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-3 tracking-widest text-center">
                    Anunciante
                  </p>
                  
                  <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-5 rounded-2xl border-2 border-slate-100 relative overflow-hidden">
                    {!authState.isAuthenticated && (
                      <div className="absolute inset-0 bg-slate-50/90 backdrop-blur-[3px] z-10 flex flex-col items-center justify-center gap-2">
                        <Lock size={20} className="text-slate-400" />
                        <p className="text-[9px] font-black text-slate-500 uppercase">
                          Faça login para ver
                        </p>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center text-white font-black text-lg shrink-0 overflow-hidden shadow-lg">
                        {freight.avatar_url ? (
                          <img src={freight.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          (freight.company_name || 'E').charAt(0).toUpperCase()
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-slate-900 uppercase italic truncate text-sm leading-tight mb-1">
                          {freight.company_name || 'Empresa'}
                        </p>
                        
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="flex items-center gap-1">
                            <Star size={12} className="text-amber-400 fill-amber-400" />
                            <span className="text-slate-700 font-black text-[10px]">
                              {freight.owner_rating ? Number(freight.owner_rating).toFixed(1) : '5.0'}
                            </span>
                          </div>
                          
                          {freight.is_verified && (
                            <div className="flex items-center gap-1 bg-blue-100 px-2 py-0.5 rounded-lg">
                              <ShieldCheck size={10} className="text-blue-600" />
                              <span className="text-blue-600 font-black text-[8px] uppercase">
                                Verificado
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AVISOS E SEGURANÇA */}
                <div className="mt-8 space-y-4">
                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex gap-3 text-left">
                    <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={16} />
                    <p className="text-[9px] text-amber-700 font-bold uppercase leading-tight">
                      Confira a carga pessoalmente antes de realizar qualquer pagamento antecipado.
                    </p>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3 text-left">
                    <ShieldCheck className="text-blue-500 shrink-0 mt-0.5" size={16} />
                    <p className="text-[9px] text-blue-700 font-bold uppercase leading-tight">
                      Use sempre o chat da plataforma para manter registro das negociações.
                    </p>
                  </div>
                  
                  {/* Footer actions */}
                  <div className="flex flex-col items-center gap-3 pt-4 border-t border-slate-50">
                    <div className="text-[10px] font-black text-slate-300 uppercase flex items-center gap-2">
                      <Calendar size={12} /> 
                      {new Date(freight.created_at).toLocaleDateString('pt-BR', { 
                        day: '2-digit', 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </div>
                    
                    <button 
                      onClick={() => setIsReportModalOpen(true)} 
                      className="flex items-center justify-center gap-2 text-slate-300 hover:text-red-500 transition-all font-black uppercase text-[10px] tracking-widest w-full py-2 hover:bg-red-50 rounded-xl"
                    >
                      <Flag size={14} /> Denunciar Anúncio
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ADS VERTICAIS NA SIDEBAR */}
            {ads.slice(0, 2).map((ad, index) => (
              <div key={`sidebar-ad-${ad.id}`}>
                <div className="flex items-center gap-2 mb-3 opacity-30">
                  <span className="text-[8px] font-black uppercase tracking-[0.3em] italic text-slate-400">
                    Patrocinado
                  </span>
                  <div className="h-px bg-slate-200 flex-1" />
                </div>
                
                <div 
                  onClick={() => {
                    registerMetric('AD_CLICK', ad.id);
                    if (ad.link_url) {
                      window.open(ad.link_url, '_blank', 'noopener,noreferrer');
                    }
                  }}
                  className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden hover:shadow-xl hover:border-blue-200 transition-all cursor-pointer group"
                >
                  {/* Imagem */}
                  {ad.image_url && (
                    <div className="w-full h-40 overflow-hidden bg-slate-100">
                      <img 
                        src={ad.image_url} 
                        alt={ad.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f1f5f9" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="%2394a3b8"%3ESem imagem%3C/text%3E%3C/svg%3E';
                        }}
                      />
                    </div>
                  )}
                  
                  {/* Conteúdo */}
                  <div className="p-5">
                    <h4 className="text-base font-[1000] uppercase italic text-slate-900 leading-tight mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {ad.title}
                    </h4>
                    <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2 mb-3">
                      {ad.description}
                    </p>
                    
                    {ad.link_url && (
                      <div className="flex items-center gap-2 text-blue-600 font-black text-[9px] uppercase tracking-widest group-hover:gap-3 transition-all">
                        Ver mais
                        <ExternalLink size={10} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main> 

      {/* MODAL DE DENÚNCIA */}
      {isReportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsReportModalOpen(false)} 
              className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 transition-colors"
            >
              <X size={24}/>
            </button>
            
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Flag size={24} className="text-red-500" />
              </div>
              <h3 className="text-2xl font-[1000] uppercase italic text-slate-900 mb-2">
                Denunciar Anúncio
              </h3>
              <p className="text-sm text-slate-600">
                Descreva o problema encontrado neste anúncio
              </p>
            </div>
            
            <div className="space-y-4">
              <textarea 
                value={reportReason} 
                onChange={(e) => setReportReason(e.target.value)} 
                placeholder="Descreva o motivo da denúncia (obrigatório)..." 
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-6 text-sm min-h-[150px] focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all resize-none"
                maxLength={500}
              />
              
              <p className="text-[10px] text-slate-400 text-right">
                {reportReason.length}/500 caracteres
              </p>
              
              <button 
                onClick={submitReport} 
                disabled={!reportReason.trim() || reportSubmitting}
                className="w-full bg-red-500 text-white py-5 rounded-2xl font-black uppercase italic active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {reportSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Flag size={20} />
                    Enviar Denúncia
                  </>
                )}
              </button>
              
              <p className="text-[9px] text-slate-400 text-center italic">
                Nossa equipe analisará sua denúncia em até 24h
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE AUTENTICAÇÃO */}
      {console.log('🎭 Renderizando AuthModal. isOpen:', isAuthModalOpen)}
      <AuthModal 
        key={isAuthModalOpen ? 'open' : 'closed'}
        isOpen={isAuthModalOpen} 
        onClose={() => {
          console.log('❌ Fechando modal (onClose)');
          setIsAuthModalOpen(false);
          setPendingAction(null);
        }} 
        onSuccess={handleAuthSuccess} 
      />
      
      <Footer />
    </div>
  );
}