import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../api/api';
import { 
  Truck, Phone, Info, Loader2, 
  AlertTriangle, MessageCircle, Lock, Weight, 
  Package, Star, ShieldCheck, 
  Calendar, Share2, Eye, TrendingUp, Flag, MapPin,
  Clock, Mail, FileText, Camera, User
} from 'lucide-react';

import Header from '../../components/shared/Header';
import Footer from '../../components/shared/Footer';
import AuthModal from '../../components/modals/AuthModal';
import AdCard from '../../components/shared/AdCard'; 
import FreightCard from '../../components/shared/FreightCard';
import { Breadcrumb } from '../../components/shared/Breadcrumb';
import { useTracker } from '../../services/useTracker';
import { usePageMeta } from '../../hooks/usePageMeta';
import { formatWeight } from '../../lib/utils';

interface FreightData {
  id: number;
  product: string;
  origin_city: string;
  origin_state: string;
  dest_city: string;
  dest_state: string;
  price: string | number;
  vehicle_type: string;
  body_type: string;
  weight: string | number;
  cargo_type_name?: string;
  distance_km?: string | number;
  description?: string;
  status: string;
  views_count?: number;
  owner_name?: string;
  company_name?: string;
  owner_avatar?: string;
  owner_slug?: string;
  owner_is_verified?: number;
  owner_rating?: number;
  owner_whatsapp?: string;
  owner_created_at?: string;
  total_owner_freights?: number;
  display_phone?: string;
  user_id?: number;
  created_at: string;
  owner_is_company?: number;
  owner_last_active?: string;
  owner_city?: string;
  owner_state?: string;
  owner_verifications?: {
    email: boolean;
    whatsapp: boolean;
    document: boolean;
    instagram: boolean;
  };
}

interface RelatedFreight {
  id: number;
  product: string;
  origin_city: string;
  origin_state: string;
  dest_city: string;
  dest_state: string;
  price: string | number;
}

export default function FreightDetails() {
  const { slug } = useParams(); 
  const navigate = useNavigate();
  
  const [freight, setFreight] = useState<FreightData | null>(null);
  const [relatedFreights, setRelatedFreights] = useState<RelatedFreight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const { trackEvent } = useTracker();
  
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
        const res = await api.get(`/public-freight/${slug}`);
        
        if (res.data?.success) {
          const data = res.data.data as FreightData;
          setFreight(data);
          
          if (!viewLogged.current) {
            trackEvent(data.id, 'FREIGHT', 'VIEW');
            viewLogged.current = true;
          }

          try {
            const relatedRes = await api.get('/freights', { 
              params: { dest_state: data.dest_state, limit: 10 } 
            });
            const filtered = ((relatedRes.data?.data || []) as RelatedFreight[]).filter((f) => f.id !== data.id);
            setRelatedFreights(filtered.slice(0, 4));
          } catch {
            console.error("Erro ao carregar similares");
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
    if (!freight) return;
    const shareData = {
      title: `Carga: ${freight.product}`,
      text: `Vi este frete no Chama Frete: ${freight.origin_city} para ${freight.dest_city}`,
      url: window.location.href,
    };
    try {
      if (navigator.share) await navigator.share(shareData);
      else {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copiado!");
      }
    } catch { console.log("Share cancelled"); }
  };

  const executeWhatsApp = useCallback(async (currentFreight: FreightData | null) => {
    const phone = currentFreight?.display_phone?.replace(/\D/g, ''); 
    if (!phone) return alert("Contato indisponível.");
    if (currentFreight) trackEvent(currentFreight.id, 'FREIGHT', 'WHATSAPP_CLICK');
    const msg = encodeURIComponent(`Olá, vi sua carga de ${currentFreight?.product} no Chama Frete. Ainda está disponível?`);
    window.open(`https://wa.me/55${phone}?text=${msg}`, '_blank');
  }, [trackEvent]);

  const executeChat = useCallback(async (currentFreight: FreightData | null, currentUserId: number) => {
    if (!currentFreight) return;
    if (currentUserId === currentFreight.user_id) return alert("Você é o anunciante.");
    try {
      setChatLoading(true);
      const res = await api.post('/chat/init', { freight_id: currentFreight.id, seller_id: currentFreight.user_id });
      if (res.data?.success) navigate(`/chat/${res.data.room_id}`);
    } catch { alert("Erro ao abrir chat."); }
    finally { setChatLoading(false); }
  }, [navigate]);

  const handleWhatsAppClick = () => {
    if (!authState.isAuthenticated) {
      setPendingAction('WHATSAPP');
      setIsAuthModalOpen(true);
      return;
    }
    executeWhatsApp(freight);
  };

  const handleChatClick = () => {
    if (!authState.isAuthenticated) {
      setPendingAction('CHAT');
      setIsAuthModalOpen(true);
      return;
    }
    executeChat(freight, authState.user.id);
  };

  const handleAuthSuccess = () => {
    const token = localStorage.getItem('@ChamaFrete:token');
    const userData = JSON.parse(localStorage.getItem('@ChamaFrete:user') || '{}');
    setAuthState({ isAuthenticated: !!token, user: userData });
    setIsAuthModalOpen(false);
    setTimeout(() => {
      if (pendingAction === 'WHATSAPP') executeWhatsApp(freight);
      else if (pendingAction === 'CHAT') executeChat(freight, userData.id);
      setPendingAction(null);
    }, 500);
  };

  const freightTitle = freight ? `${freight.product} | ${freight.origin_city} → ${freight.dest_city}` : undefined;
  const freightDesc = freight ? `Frete: ${freight.product} saindo de ${freight.origin_city}/${freight.origin_state} para ${freight.dest_city}/${freight.dest_state}.` : undefined;
  const freightImage = freight?.owner_avatar || undefined;

  usePageMeta(freight ? {
    title: freightTitle,
    description: freightDesc,
    image: freightImage,
    url: window.location.href,
    type: 'article',
  } : {});

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );

  if (error || !freight) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
      <AlertTriangle className="text-amber-500 mb-4" size={48} />
      <h2 className="text-xl font-black uppercase italic">Frete não encontrado</h2>
      <button onClick={() => navigate('/fretes')} className="mt-4 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold uppercase">Voltar</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="max-w-7xl mx-auto pt-32 pb-20 px-4">
        
        {/* NAVEGAÇÃO */}
        <div className="flex items-center justify-between mb-6">
          <Breadcrumb items={[
            { label: 'Home', href: '/' },
            { label: 'Fretes', href: '/fretes' },
            { label: freight.product },
          ]} linkClassName="hover:text-blue-600" />
          <button onClick={handleShare} className="flex items-center gap-2 text-slate-400 font-bold hover:text-slate-900 transition-all uppercase text-[10px] tracking-widest">
            Compartilhar <Share2 size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ESQUERDA: CONTEÚDO PRINCIPAL */}
          <div className="lg:col-span-8 space-y-8">
            <div className={`bg-white rounded-[3rem] p-8 md:p-12 shadow-sm border border-slate-100 relative`}>
              
              {(freight.views_count || 0) >= 50 && (
                <div className="absolute top-8 right-8 flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full border border-blue-100">
                  <TrendingUp size={14} />
                  <span className="text-[10px] font-black uppercase italic">Alta Procura</span>
                </div>
              )}

              {/* Box Produto e Valor */}
              <div className="mb-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-50 pb-10">
                  <div className="flex items-center gap-6">
                    <div className="bg-blue-600 p-5 rounded-3xl text-white shadow-lg shrink-0">
                      <Truck size={40} />
                    </div>
                    <div>
                      <h1 className="text-3xl md:text-5xl font-[1000] uppercase italic text-slate-900 leading-tight break-words">{freight.product}</h1>
                      <div className="flex items-center gap-3 mt-3">
                        <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-lg font-black text-[10px] uppercase italic">ID: {freight.id}</span>
                        <span className="flex items-center gap-1 text-slate-400 font-black text-[10px] uppercase italic ml-2">
                           <Eye size={14} /> {freight.views_count || 0} views
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rota e Detalhes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                  <p className="text-[10px] font-black text-blue-500 uppercase mb-2 tracking-widest">Origem</p>
                  <p className="font-[1000] text-slate-800 text-xl md:text-2xl uppercase italic">{freight.origin_city} / {freight.origin_state}</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                  <p className="text-[10px] font-black text-green-500 uppercase mb-2 tracking-widest">Destino</p>
                  <p className="font-[1000] text-slate-800 text-xl md:text-2xl uppercase italic">{freight.dest_city} / {freight.dest_state}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                 <div className="bg-white border-2 border-slate-50 p-5 rounded-3xl text-center flex flex-col items-center justify-center">
                    <Truck size={20} className="mb-2 text-blue-600" />
                    <p className="text-[9px] font-black text-slate-400 uppercase">Veículo</p>
                    <p className="text-xs font-bold text-slate-700 uppercase">{freight.vehicle_type}</p>
                 </div>
                 <div className="bg-white border-2 border-slate-50 p-5 rounded-3xl text-center flex flex-col items-center justify-center">
                    <Package size={20} className="mb-2 text-blue-600" />
                    <p className="text-[9px] font-black text-slate-400 uppercase">Carroceria</p>
                    <p className="text-xs font-bold text-slate-700 uppercase">{freight.body_type}</p>
                 </div>
                 <div className="bg-white border-2 border-slate-50 p-5 rounded-3xl text-center flex flex-col items-center justify-center">
                    <Weight size={20} className="mb-2 text-blue-600" />
                    <p className="text-[9px] font-black text-slate-400 uppercase">Peso</p>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">{formatWeight(freight.weight)}</p>
                 </div>
                 <div className="bg-white border-2 border-slate-50 p-5 rounded-3xl text-center flex flex-col items-center justify-center">
                    <Package size={20} className="mb-2 text-blue-600" />
                    <p className="text-[9px] font-black text-slate-400 uppercase">Tipo de Carga</p>
                    <p className="text-xs font-bold text-slate-700 uppercase">{freight.cargo_type_name || 'Geral'}</p>
                 </div>
              </div>
              {freight.distance_km && (
                <div className="mb-6 text-center">
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                    <MapPin size={12} /> Distância: {Math.round(Number(freight.distance_km))} km
                  </span>
                </div>
              )}

              <div>
                <h4 className="font-black uppercase text-[11px] text-slate-900 mb-4 flex items-center gap-2 italic">
                  <Info size={18} className="text-blue-600" /> Observações
                </h4>
                <div className="text-slate-600 font-medium bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 whitespace-pre-line text-sm leading-relaxed">
                  {freight.description || 'Sem observações adicionais.'}
                </div>
              </div>
            </div>

            {/* Anúncio Horizontal */}
            <div className="max-w-4xl mx-auto">
              <AdCard position="spotlight" variant="ecommerce" city={freight.origin_city} state={freight.origin_state} />
            </div>

            {/* Fretes Similares (Correção Visual) */}
            {relatedFreights.length > 0 && (
              <div className="pt-4">
                <h3 className="font-[1000] uppercase italic text-slate-900 text-xl mb-6 flex items-center gap-3">
                  <Truck className="text-blue-600" size={24} /> Outras cargas para {freight.dest_state}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {relatedFreights.map(f => (
                    <FreightCard key={f.id} data={f} />
                  ))}
                </div>
              </div>
            )}

            {/* Segurança */}
            <div className="bg-white rounded-[3rem] p-8 border border-slate-100">
               <h4 className="font-black uppercase text-[11px] text-slate-900 mb-6 flex items-center gap-2 italic">
                  <ShieldCheck size={18} className="text-amber-500" /> Dicas de Segurança
               </h4>
               <ul className="space-y-3">
                  <li className="flex gap-4 items-start text-xs md:text-sm text-slate-600">
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 font-bold text-[10px]">1</span>
                    Nunca realize pagamentos antecipados.
                  </li>
                  <li className="flex gap-4 items-start text-xs md:text-sm text-slate-600">
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 font-bold text-[10px]">2</span>
                    Confirme os dados da empresa antes de carregar.
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
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-[0.3em]">Valor Estimado</p>
                  <p className={`text-3xl md:text-5xl font-[1000] mb-10 tracking-tighter italic ${parseFloat(String(freight.price)) > 0 ? 'text-green-600' : 'text-slate-400'}`}>
                    {parseFloat(String(freight.price)) > 0 ? parseFloat(String(freight.price)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'A COMBINAR'}
                  </p>
                  
                  <div className="space-y-4">
                    <button onClick={handleWhatsAppClick} className="w-full py-5 rounded-[1.5rem] font-black uppercase italic flex flex-col items-center justify-center gap-1 shadow-xl active:scale-95 transition-all bg-green-500 text-white hover:bg-green-600 px-4">
                      <div className="flex items-center gap-2">
                        {authState.isAuthenticated ? <Phone size={20} /> : <Lock size={20} />}
                        <span className="text-sm md:text-base">WhatsApp</span>
                      </div>
                      <span className="text-[9px] opacity-80 font-bold">{authState.isAuthenticated ? 'Falar com anunciante' : 'Entrar para liberar'}</span>
                    </button>

                    <button onClick={handleChatClick} disabled={chatLoading} className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black uppercase italic flex flex-col items-center justify-center gap-1 hover:bg-blue-700 transition-all shadow-xl px-4">
                      <div className="flex items-center gap-2">
                        {chatLoading ? <Loader2 className="animate-spin" size={20} /> : <MessageCircle size={20} />}
                        <span className="text-sm md:text-base">Negociar no Chat</span>
                      </div>
                      <span className="text-[9px] opacity-80 font-bold">Inicie agora mesmo</span>
                    </button>
                  </div>

                  {freight.user_id && (
                    <div className="text-center pt-2">
                      <Link
                        to={`/denunciar/frete/${slug}`}
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
                      to={freight.owner_slug ? `/perfil/${freight.owner_slug}` : '#'}
                      className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-blue-300 transition-colors"
                    >
                      <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0">
                        {freight.owner_avatar ? <img src={freight.owner_avatar} alt="" className="w-full h-full object-cover rounded-xl" /> : freight.company_name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm leading-tight">{freight.company_name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Star size={12} className="text-amber-400 fill-amber-400" />
                          <span className="text-xs text-slate-500">{Number(freight.owner_rating || 5).toFixed(1)}</span>
                          {freight.owner_is_company === 1 ? (
                            <span className="text-[9px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">Empresa</span>
                          ) : (
                            <span className="text-[9px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">Profissional</span>
                          )}
                        </div>
                      </div>
                    </Link>

                    <div className="mt-4 space-y-2.5">
                      {getLastActive(freight.owner_last_active) !== 'Indisponível' && (
                        <div className="flex items-center gap-2.5">
                          <Clock size={14} className="text-slate-400 shrink-0" />
                          <span className="text-xs text-slate-600">{getLastActive(freight.owner_last_active)}</span>
                        </div>
                      )}
                      {(freight.owner_city || freight.owner_state) && (
                        <div className="flex items-center gap-2.5">
                          <MapPin size={14} className="text-slate-400 shrink-0" />
                          <span className="text-xs text-slate-600">{freight.owner_city}{freight.owner_city && freight.owner_state ? ', ' : ''}{freight.owner_state}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2.5">
                        <Calendar size={14} className="text-slate-400 shrink-0" />
                        <span className="text-xs text-slate-600">Membro desde {getMemberSince(freight.owner_created_at)}</span>
                      </div>
                    </div>

                    {freight.owner_verifications && (
                      <div className="mt-5 pt-4 border-t border-slate-100">
                        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center mb-3">Informações Verificadas</p>
                        <div className="space-y-2">
                          {[
                            { key: 'email', label: 'E-mail', icon: Mail },
                            { key: 'whatsapp', label: 'WhatsApp', icon: Phone },
                            { key: 'document', label: 'Identidade', icon: FileText },
                            { key: 'instagram', label: 'Instagram', icon: Camera },
                          ].map((item) => {
                            const verified = freight.owner_verifications?.[item.key as keyof typeof freight.owner_verifications];
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

                    {freight.owner_slug && (
                      <Link
                        to={`/perfil/${freight.owner_slug}`}
                        className="mt-5 flex items-center justify-center gap-2 w-full bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs uppercase tracking-wider py-3 rounded-xl transition-colors"
                      >
                        <User size={14} />
                        Acessar Perfil
                      </Link>
                    )}

                    <div className="mt-3 flex items-center justify-center text-xs text-slate-400">
                      {freight.total_owner_freights || 0} frete{freight.total_owner_freights !== 1 ? 's' : ''} ativo{freight.total_owner_freights !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              </div>

              {/* Anúncio Vertical */}
              <AdCard position="sidebar" variant="sidebar" state={freight.origin_state} />

              <div className="flex items-center justify-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  <Calendar size={12} /> {new Date(freight.created_at).toLocaleDateString('pt-BR')}
              </div>
            </div>
          </div>
        </div>
      </main> 

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onSuccess={handleAuthSuccess} />
      <Footer />
    </div>
  );
}