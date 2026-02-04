import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../api/api';
import { 
  Truck, Phone, ArrowLeft, Info, Loader2, 
  AlertTriangle, MessageCircle, Lock, Weight, 
  Package, Star, ShieldCheck, 
  Calendar, Share2, Eye, TrendingUp
} from 'lucide-react';

import Header from '../../components/shared/Header';
import Footer from '../../components/shared/Footer';
import AuthModal from '../../components/modals/AuthModal';
import AdCard from '../../components/shared/AdCard'; 
import FreightCard from '../../components/shared/FreightCard';
import { useTracker } from '../../services/useTracker';

export default function FreightDetails() {
  const { slug } = useParams(); 
  const navigate = useNavigate();
  
  const [freight, setFreight] = useState<any>(null);
  const [relatedFreights, setRelatedFreights] = useState<any[]>([]);
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
          const data = res.data.data;
          setFreight(data);
          
          // Registro de View
          if (!viewLogged.current) {
            trackEvent(data.id, 'FREIGHT', 'VIEW'); // Usa o novo sistema unificado
            viewLogged.current = true;
          }

          // Busca Similares baseados no destino (Correção da lista vazia)
          try {
            const relatedRes = await api.get('/freights', { 
              params: { dest_state: data.dest_state, limit: 10 } 
            });
            const filtered = (relatedRes.data?.data || []).filter((f: any) => f.id !== data.id);
            setRelatedFreights(filtered.slice(0, 4));
          } catch (e) {
            console.error("Erro ao carregar similares");
          }
        } else {
          setError(true);
        }
      } catch (err) { 
        setError(true); 
      } finally { 
        setLoading(false); 
      }
    }
    loadData();
  }, [slug]);

  // Formatação de data segura (Evita o NaN)
  const getMemberSince = (dateString: any) => {
    if (!dateString || dateString === "NULL") return '2025';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? '2025' : date.getFullYear();
  };

  const handleShare = async () => {
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
    } catch (err) { console.log(err); }
  };

  const executeWhatsApp = useCallback(async (currentFreight: any) => {
    const phone = currentFreight?.display_phone?.replace(/\D/g, ''); 
    if (!phone) return alert("Contato indisponível.");
    trackEvent(currentFreight.id, 'FREIGHT', 'WHATSAPP_CLICK');
    const msg = encodeURIComponent(`Olá, vi sua carga de ${currentFreight.product} no Chama Frete. Ainda está disponível?`);
    window.open(`https://wa.me/55${phone}?text=${msg}`, '_blank');
  }, []);

  const executeChat = useCallback(async (currentFreight: any, currentUserId: any) => {
    if (currentUserId === currentFreight?.user_id) return alert("Você é o anunciante.");
    try {
      setChatLoading(true);
      const res = await api.post('/chat/init', { freight_id: currentFreight.id, seller_id: currentFreight.user_id });
      if (res.data?.success) navigate(`/chat/${res.data.room_id}`);
    } catch (err) { alert("Erro ao abrir chat."); }
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
      <main className="max-w-6xl mx-auto pt-32 pb-20 px-4">
        
        {/* NAVEGAÇÃO */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate('/fretes')} className="flex items-center gap-2 text-slate-400 font-bold hover:text-blue-600 transition-all uppercase text-[10px] tracking-widest">
            <ArrowLeft size={16} /> Voltar
          </button>
          <button onClick={handleShare} className="flex items-center gap-2 text-slate-400 font-bold hover:text-slate-900 transition-all uppercase text-[10px] tracking-widest">
            Compartilhar <Share2 size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ESQUERDA: CONTEÚDO PRINCIPAL */}
          <div className="lg:col-span-8 space-y-8">
            <div className={`bg-white rounded-[3rem] p-8 md:p-12 shadow-sm border border-slate-100 relative`}>
              
              <div className="absolute top-8 right-8 flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full border border-blue-100">
                <TrendingUp size={14} />
                <span className="text-[10px] font-black uppercase italic">Alta Procura</span>
              </div>

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

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
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
                 <div className="bg-white border-2 border-slate-50 p-5 rounded-3xl text-center flex flex-col items-center justify-center col-span-2 md:col-span-1">
                    <Weight size={20} className="mb-2 text-blue-600" />
                    <p className="text-[9px] font-black text-slate-400 uppercase">Peso</p>
                    <p className="text-xs font-bold text-slate-700 uppercase">{freight.weight}kg</p>
                 </div>
              </div>

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
            <AdCard position="details_page" variant="horizontal" city={freight.origin_city} state={freight.origin_state} />

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
                  <p className={`text-3xl md:text-5xl font-[1000] mb-10 tracking-tighter italic ${parseFloat(freight.price) > 0 ? 'text-green-600' : 'text-slate-400'}`}>
                    {parseFloat(freight.price) > 0 ? parseFloat(freight.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'A COMBINAR'}
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

                  {/* Sobre o Anunciante (Correção do NaN) */}
                  <div className="mt-8 pt-8 border-t border-slate-100 text-left">
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-5 text-center">Sobre o Anunciante</p>
                      <div className="flex items-center gap-4 bg-slate-50 p-5 rounded-[2rem] border border-slate-100">
                        <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shrink-0">
                          {freight.avatar_url ? <img src={freight.avatar_url} alt="Avatar" className="w-full h-full object-cover" /> : freight.company_name?.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-slate-900 uppercase italic truncate text-sm mb-1">{freight.company_name}</p>
                          <div className="flex items-center gap-1">
                            <Star size={12} className="text-amber-400 fill-amber-400" />
                            <span className="text-slate-600 font-black text-[11px]">{Number(freight.owner_rating || 5).toFixed(1)}</span>
                            <span className="text-blue-600 font-black text-[9px] uppercase ml-2">Verificado</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 grid grid-cols-2 gap-2">
                         <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                            <p className="text-[8px] font-black text-slate-400 uppercase">Anúncios</p>
                            <p className="text-[10px] font-bold text-slate-700 uppercase italic">{freight.total_owner_freights || '10+'} ativos</p>
                         </div>
                         <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                            <p className="text-[8px] font-black text-slate-400 uppercase">Desde</p>
                            <p className="text-[10px] font-bold text-slate-700 uppercase italic">{getMemberSince(freight.owner_created_at)}</p>
                         </div>
                      </div>
                  </div>
                </div>
              </div>

              {/* Anúncio Vertical */}
              <AdCard position="sidebar" variant="vertical" state={freight.origin_state} />

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