import React, { useState, useEffect, useMemo, useRef, type JSX } from "react";
import { MessageCircle, ExternalLink, ShieldCheck, Zap, ArrowRight } from "lucide-react";
import { api } from "../../api/api";
import { AdImage } from "../AdImage";
import { useTracker } from "../../services/useTracker";
import { BusinessModal } from "../modals/BusinessModal";

const DEFAULT_AD = {
  id: 0,
  title: "Sua Marca Aqui",
  description: "Conecte-se com o ecossistema logístico que mais cresce no Brasil. Clique para anunciar.",
  image_url: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1470&auto=format&fit=crop",
  category: "BUSINESS",
};

interface AdCardProps {
  position: 'freight_list' | 'sidebar' | 'details_page' | 'home_hero' | 'in-feed' | 'spotlight' | 'header' | 'footer' | 'popup';
  variant?: 'horizontal' | 'vertical' | 'side-banner' | 'native' | 'bar';
  city?: string;
  state?: string;
  search?: string;
  forcedAd?: any;
}

export default function AdCard({ position, variant = 'vertical', city, state, search, forcedAd }: AdCardProps) {
  const [adsList, setAdsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const viewLogged = useRef<number | null>(null);
  const { trackEvent, trackWhatsAppClick } = useTracker();
  const [isBusinessModalOpen, setIsBusinessModalOpen] = useState(false);

  // 1. Carga de Dados
  useEffect(() => {
    if (forcedAd) {
      setLoading(false);
      return;
    }
    const loadAds = async () => {
      try {
        setLoading(true);
        const res = await api.get('/ads', { 
          params: { position, city, state, search } 
        });
        const adsArray = res.data?.data || (Array.isArray(res.data) ? res.data : []);
        setAdsList(adsArray);
        
        // Sorteia o primeiro anúncio ao carregar
        if (adsArray.length > 0) {
          setCurrentIndex(Math.floor(Math.random() * adsArray.length));
        }
      } catch (err) {
        setAdsList([]);
      } finally {
        setLoading(false);
      }
    };
    loadAds();
  }, [position, city, state, search, forcedAd]);

  // 2. Lógica de Rotação Automática (Troca a cada 8 segundos)
  useEffect(() => {
    if (loading || adsList.length <= 1 || forcedAd) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % adsList.length);
      // Resetamos o log de visualização para o novo anúncio ser contabilizado
      viewLogged.current = null; 
    }, 8000); // 8 segundos é o tempo ideal para leitura

    return () => clearInterval(interval);
  }, [adsList.length, loading, forcedAd]);

  // 3. Definição do Anúncio Atual
  const adToShow = useMemo(() => {
    if (forcedAd) return forcedAd;
    if (!adsList || adsList.length === 0) return DEFAULT_AD;
    return adsList[currentIndex] || DEFAULT_AD;
  }, [adsList, currentIndex, forcedAd]);

  // 4. Tracking de Impressão (View)
  useEffect(() => {
    // Registra a visualização sempre que o adToShow mudar e estiver visível
    if (loading || adToShow.id === 0 || viewLogged.current === adToShow.id) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        viewLogged.current = adToShow.id;
        trackEvent(adToShow.id, 'AD', 'VIEW');
        observer.disconnect();
      }
    }, { threshold: 0.5 });

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [adToShow.id, loading, trackEvent]);

  // Identifica se é uma ação de WhatsApp
  const isWhatsappAction = 
    (adToShow.destination_url || "").includes('wa.me') || 
    !!adToShow.link_whatsapp || 
    /^\d+$/.test((adToShow.destination_url || "").replace(/\D/g, ''));

  const handleAction = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (adToShow.id === 0) {
      setIsBusinessModalOpen(true);
      return;
    }

    const rawLink = adToShow.destination_url || adToShow.link_whatsapp || adToShow.link_url || "";
    if (!rawLink) return;

    if (isWhatsappAction) {
      const cleanPhone = rawLink.replace(/\D/g, '');
      trackWhatsAppClick(adToShow.id, 'AD', cleanPhone);
    } else {
      trackEvent(adToShow.id, 'AD', 'CLICK');
      const finalUrl = rawLink.startsWith('http') ? rawLink : `https://${rawLink}`;
      window.open(finalUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) return <div className="bg-slate-100 dark:bg-slate-800 animate-pulse rounded-3xl w-full h-28" />;

  const withModal = (content: JSX.Element) => (
    <>
      {content}
      <BusinessModal 
        isOpen={isBusinessModalOpen} 
        onClose={() => setIsBusinessModalOpen(false)} 
        initialSubject={`Interesse em anunciar na posição: ${position}`}
      />
    </>
  );

  // --- RENDERS ---
  if (variant === 'native') {
    return withModal(
      <div ref={containerRef} onClick={handleAction} className="bg-blue-50/50 dark:bg-blue-950/20 border-2 border-blue-100 dark:border-blue-900/50 rounded-3xl p-5 cursor-pointer group transition-all hover:scale-[1.01]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <Zap size={16} fill="currentColor" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">Destaque Premium</span>
          </div>
          <span className="text-[9px] font-bold text-slate-400 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-full uppercase">Patrocinado</span>
        </div>
        <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase italic leading-tight mb-2 group-hover:text-blue-600 transition-colors">{adToShow.title}</h4>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">{adToShow.description}</p>
        <div className="flex items-center justify-between pt-4 border-t border-blue-100 dark:border-blue-900/50">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter flex items-center gap-1">
            <ShieldCheck size={12} /> Parceiro Verificado
          </span>
          <button className="text-blue-600 dark:text-blue-400 font-black uppercase text-[10px] tracking-widest flex items-center gap-2">
            {isWhatsappAction ? 'Chamar no Zap' : 'Ver Detalhes'} <ArrowRight size={14} />
          </button>
        </div>
      </div>
    );
  }

  if (variant === 'side-banner') {
    return withModal(
      <div ref={containerRef} onClick={handleAction} className="sticky top-24 w-full h-[600px] rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 cursor-pointer group shadow-sm hover:shadow-2xl transition-all">
        <AdImage url={adToShow.image_url} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        <div className="absolute bottom-0 p-6 w-full text-white">
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-400 mb-2">Publicidade</p>
          <h4 className="text-xl font-black uppercase italic leading-none mb-4 tracking-tighter">{adToShow.title}</h4>
          <button className={`w-full py-4 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${isWhatsappAction ? 'bg-[#25D366] text-white' : 'bg-white text-slate-950 hover:bg-blue-600 hover:text-white'}`}>
             {isWhatsappAction ? 'WhatsApp' : 'Confira Agora'}
          </button>
        </div>
      </div>
    );
  }

  if (variant === 'horizontal') {
    return withModal(
      <div ref={containerRef} onClick={handleAction} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-2 flex items-center gap-4 shadow-sm hover:shadow-md transition-all group cursor-pointer h-28 w-full overflow-hidden relative select-none active:scale-[0.98]">
        <div className="h-full aspect-video rounded-xl overflow-hidden flex-shrink-0">
          <AdImage url={adToShow.image_url} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[7px] font-black bg-slate-100 dark:bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">AD</span>
            <h4 className="font-black text-slate-800 dark:text-slate-100 text-sm uppercase truncate">{adToShow.title}</h4>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-snug">{adToShow.description}</p>
        </div>
        <div className="pr-4 hidden sm:block">
          <div className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-tighter ${isWhatsappAction ? 'bg-[#25D366] text-white' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'}`}>
            {isWhatsappAction ? 'WhatsApp' : 'Abrir'}
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'bar') {
    return withModal(
      <div 
        key={adToShow.id} // A key força o React a re-renderizar e aplicar animação na troca
        ref={containerRef} 
        onClick={handleAction} 
        className="w-full bg-[#1f4ead] text-white py-2 px-4 cursor-pointer hover:bg-[#163a82] transition-all duration-500 ease-in-out animate-in fade-in slide-in-from-right-1 group select-none"
      >
        <div className="container mx-auto flex items-center justify-center gap-3">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-white/20 px-2 py-0.5 rounded leading-none">
            {adsList.length > 1 ? `Oferta ${currentIndex + 1}` : 'Destaque'}
          </span>
          <p className="text-[11px] sm:text-xs font-bold truncate tracking-tight">
            {adToShow.title}: <span className="font-normal opacity-90 hidden sm:inline">{adToShow.description}</span>
          </p>
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    );
  }

  return withModal(
    <div ref={containerRef} onClick={handleAction} className="group relative overflow-hidden rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all h-full min-h-[420px] w-full flex flex-col cursor-pointer border border-slate-100 dark:border-slate-800">
      <div className="absolute inset-0 z-0">
        <AdImage url={adToShow.image_url} className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
      </div>
      <div className="relative z-10 p-8 flex flex-col h-full text-white">
        <span className="w-fit text-[9px] bg-blue-600 text-white px-3 py-1 rounded-full font-black uppercase tracking-widest mb-4">Parceiro Oficial</span>
        <h4 className="font-black italic uppercase text-2xl leading-none mt-2 tracking-tighter">{adToShow.title}</h4>
        <p className="text-sm text-slate-200 line-clamp-3 font-medium mt-4 italic">{adToShow.description}</p>
        <div className="mt-auto pt-6">
          <div className={`w-full py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 group-hover:bg-white group-hover:text-slate-900 transition-all ${isWhatsappAction ? 'bg-[#25D366] text-white' : 'bg-white/10 backdrop-blur-md text-white border border-white/20'}`}>
            {isWhatsappAction ? 'Chamar no Zap' : 'Saiba Mais'}
            {isWhatsappAction ? <MessageCircle size={14} fill="currentColor" /> : <ExternalLink size={14} />}
          </div>
        </div>
      </div>
    </div>
  );
}