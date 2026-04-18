import React, { useState, useEffect, useMemo, useRef, type JSX } from "react";
import { MessageCircle, ExternalLink, ShieldCheck, Zap, ArrowRight, MapPin } from "lucide-react";
import { api } from "../../api/api";
import { AdImage } from "../AdImage";
import { useTracker } from "../../services/useTracker";
import { BusinessModal } from "../modals/BusinessModal";

const DEFAULT_AD = {
  id: 0,
  title: "Sua Marca Aqui",
  description: "Conecte-se com o ecossistema logístico que mais cresce no Brasil.",
  image_url: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1470&auto=format&fit=crop",
  category: "BUSINESS",
};

interface AdCardProps {
  position: string;
  variant?: 'banner-wide' | 'banner-compact' | 'vertical' | 'bar' | 'ecommerce' | 'footer' | 'sidebar' | 'notice';
  city?: string;
  state?: string;
  search?: string;
  forcedAd?: any;
}

export default function AdCard({ position, variant = 'vertical', city, state, search, forcedAd }: AdCardProps) {
  const [adsList, setAdsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [rotationSeconds, setRotationSeconds] = useState(8);
  const containerRef = useRef<HTMLDivElement>(null);
  const { trackEvent, trackWhatsAppClick } = useTracker();
  const [isBusinessModalOpen, setIsBusinessModalOpen] = useState(false);

  // Carrega configurações de rotação
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await api.get('/site-settings', { params: { keys: 'ad_rotation_seconds' } });
        if (res.data?.ad_rotation_seconds) {
          setRotationSeconds(parseInt(res.data.ad_rotation_seconds) || 8);
        }
      } catch (e) { /* usa padrão */ }
    };
    loadSettings();
  }, []);

  // Carga de Dados
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

  // Lógica de Rotação Automática
  useEffect(() => {
    if (loading || adsList.length <= 1 || forcedAd) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % adsList.length);
    }, rotationSeconds * 1000);

    return () => clearInterval(interval);
  }, [adsList.length, loading, forcedAd, rotationSeconds]);

  // Definição do Anúncio Atual
  const adToShow = useMemo(() => {
    if (forcedAd) return forcedAd;
    if (!adsList || adsList.length === 0) return DEFAULT_AD;
    return adsList[currentIndex] || DEFAULT_AD;
  }, [adsList, currentIndex, forcedAd]);

  // Tracking de Views
  const viewTracked = useRef<Set<number>>(new Set());
  
  useEffect(() => {
    if (loading || adToShow.id === 0) return;
    
    const sessionKey = `ad_view_${adToShow.id}`;
    if (viewTracked.current.has(adToShow.id) || sessionStorage.getItem(sessionKey)) {
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && entries[0].intersectionRatio >= 0.5) {
        viewTracked.current.add(adToShow.id);
        sessionStorage.setItem(sessionKey, '1');
        trackEvent(adToShow.id, 'AD', 'VIEW');
        observer.disconnect();
      }
    }, { threshold: 0.5 });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    return () => observer.disconnect();
  }, [adToShow.id, loading, trackEvent]);

  // Identifica se é WhatsApp
  const isWhatsappAction = 
    (adToShow.destination_url || "").includes('wa.me') || 
    !!adToShow.link_whatsapp || 
    /^\d+$/.test((adToShow.destination_url || "").replace(/\D/g, ''));

  // Badge Verificado
  const showVerified = adToShow.advertiser_verified;

  // Badge Localização
  const locationText = (adToShow.location_city && adToShow.location_city !== 'Brasil' && adToShow.location_city !== '') 
    ? adToShow.location_city 
    : null;

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

  if (loading) return <div className="bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl w-full h-24" />;

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

  // CTA Padrão
  const ctaText = isWhatsappAction ? 'WhatsApp' : 'Visitar';
  const ctaIcon = isWhatsappAction ? <MessageCircle size={14} fill="currentColor" /> : <ExternalLink size={14} />;

  // ===== VARIANT: banner-wide (728x90) =====
  if (variant === 'banner-wide') {
    return withModal(
      <div 
        ref={containerRef} 
        onClick={handleAction} 
        className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-3 flex items-center gap-4 shadow-sm hover:shadow-md transition-all group cursor-pointer h-28 w-full overflow-hidden relative"
      >
        <div className="h-full w-40 rounded-lg overflow-hidden flex-shrink-0">
          <AdImage url={adToShow.image_url} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[6px] font-black bg-slate-100 dark:bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">AD</span>
            {showVerified && (
              <span className="text-[6px] font-bold text-green-600 flex items-center gap-0.5">
                <ShieldCheck size={8} /> Verificado
              </span>
            )}
            {locationText && (
              <span className="text-[6px] text-slate-400 flex items-center gap-0.5">
                <MapPin size={8} /> {locationText}
              </span>
            )}
          </div>
          <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate">{adToShow.title}</h4>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">{adToShow.description}</p>
        </div>
        <div className="flex-shrink-0">
          <div className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase flex items-center gap-1.5 transition-all ${isWhatsappAction ? 'bg-[#25D366] text-white hover:bg-[#20BA5C]' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
            {ctaText} {ctaIcon}
          </div>
        </div>
      </div>
    );
  }

  // ===== VARIANT: banner-compact (728x90 horizontal) =====
  if (variant === 'banner-compact') {
    return withModal(
      <div 
        ref={containerRef} 
        onClick={handleAction} 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md flex items-stretch shadow-sm hover:shadow-md transition-all group cursor-pointer w-full h-14 overflow-hidden relative"
      >
        <span className="absolute top-1 left-1 text-[7px] font-black bg-slate-100 dark:bg-slate-800 text-slate-400 px-1 py-0.5 rounded z-10">AD</span>
        <div className="w-24 h-full flex-shrink-0">
          <AdImage url={adToShow.image_url} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 flex items-center px-2">
          <div className="min-w-0 flex-1 pr-1">
            <h4 className="font-bold text-slate-800 dark:text-slate-100 text-[10px] truncate">{adToShow.title}</h4>
            <p className="text-[8px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{adToShow.description}</p>
          </div>
          <div className={`flex-shrink-0 px-2 py-1 rounded text-[8px] font-bold uppercase ${isWhatsappAction ? 'bg-[#25D366] text-white hover:bg-[#20BA5C]' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
            {ctaText}
          </div>
        </div>
      </div>
    );
  }

  // ===== VARIANT: ecommerce (infeed_wide, freight_list) - imagem + badge FORA =====
  if (variant === 'ecommerce') {
    const hasText = adToShow.title || adToShow.description;
    return withModal(
      <div 
        ref={containerRef} 
        onClick={handleAction} 
        className="group cursor-pointer w-full"
      >
        <div className="relative rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all h-28">
          <AdImage url={adToShow.image_url} className="w-full h-full object-cover" />
          {hasText && (
            <div className="absolute inset-0 bg-slate-900/60 flex flex-col justify-end p-3">
              {adToShow.title && (
                <h4 className="font-bold text-white text-sm truncate">{adToShow.title}</h4>
              )}
              {adToShow.description && (
                <p className="text-white/80 text-[10px] line-clamp-1 mt-0.5">{adToShow.description}</p>
              )}
            </div>
          )}
        </div>
        <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Publicidade</span>
      </div>
    );
  }

  // ===== VARIANT: footer (ecommerce menor) - imagem + badge FORA =====
  if (variant === 'footer') {
    const hasText = adToShow.title || adToShow.description;
    return withModal(
      <div 
        ref={containerRef} 
        onClick={handleAction} 
        className="group cursor-pointer w-full"
      >
        <div className="relative rounded-md overflow-hidden shadow-sm hover:shadow-md transition-all h-24">
          <AdImage url={adToShow.image_url} className="w-full h-full object-cover" />
          {hasText && (
            <div className="absolute inset-0 bg-slate-900/60 flex flex-col justify-end p-2">
              {adToShow.title && (
                <h4 className="font-bold text-white text-xs truncate">{adToShow.title}</h4>
              )}
              {adToShow.description && (
                <p className="text-white/80 text-[8px] line-clamp-1 mt-0.5">{adToShow.description}</p>
              )}
            </div>
          )}
        </div>
        <span className="text-[7px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Publicidade</span>
      </div>
    );
  }

  // ===== VARIANT: sidebar (estilo Instagram feed) =====
  if (variant === 'sidebar') {
    const hasText = adToShow.title || adToShow.description;
    return withModal(
      <div 
        ref={containerRef} 
        onClick={handleAction} 
        className="group relative overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer aspect-[4/5] w-full"
      >
        <AdImage url={adToShow.image_url} className="w-full h-full object-cover" />
        {hasText && (
          <div className="absolute inset-0 bg-slate-900/60 flex flex-col justify-end p-3">
            {adToShow.title && (
              <h4 className="font-bold text-white text-xs truncate">{adToShow.title}</h4>
            )}
            {adToShow.description && (
              <p className="text-white/80 text-[8px] line-clamp-2 mt-0.5">{adToShow.description}</p>
            )}
          </div>
        )}
        <span className="absolute bottom-2 left-3 text-[6px] font-bold text-white/70 uppercase tracking-wider">Publicidade</span>
      </div>
    );
  }
  

  // ===== VARIANT: notice (Header - título + descrição) =====
  if (variant === 'notice') {
    const hasDescription = adToShow.description;
    return withModal(
      <div 
        ref={containerRef} 
        onClick={handleAction} 
        className="w-full bg-[#1f4ead] text-white py-1 px-3 cursor-pointer hover:bg-[#163a82] transition-all duration-500 group select-none"
      >
        <div className="container mx-auto flex items-center justify-center gap-2">
          <p className="text-[8px] sm:text-[12px] font-medium truncate">
            {adToShow.title || 'Aviso da plataforma'}
          </p>
          {hasDescription && (
            <>
              <span className="text-white/50">•</span>
              <p className="text-[8px] sm:text-[12px] text-white/80 truncate">
                {adToShow.description}
              </p>
            </>
          )}
          <ArrowRight size={8} className="group-hover:translate-x-1 transition-transform opacity-70" />
        </div>
      </div>
    );
  }

  // ===== VARIANT: bar (deprecated - usar notice) =====

  // ===== VARIANT: vertical (sidebar 300x600) =====
  return withModal(
    <div 
      ref={containerRef} 
      onClick={handleAction} 
      className="group relative overflow-hidden rounded-2xl shadow-sm hover:shadow-xl transition-all h-full min-h-[380px] w-full flex flex-col cursor-pointer border border-slate-100 dark:border-slate-800"
    >
      <div className="absolute inset-0 z-0">
        <AdImage url={adToShow.image_url} className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
      </div>
      <div className="relative z-10 p-6 flex flex-col h-full text-white">
        <div className="flex items-center gap-1.5 mb-3 flex-wrap">
          <span className="text-[7px] font-black bg-white/20 px-2 py-0.5 rounded uppercase tracking-wide">Publicidade</span>
          {showVerified && (
            <span className="text-[7px] font-bold bg-green-500/80 px-2 py-0.5 rounded uppercase flex items-center gap-1">
              <ShieldCheck size={8} /> Verificado
            </span>
          )}
          {locationText && (
            <span className="text-[7px] font-medium bg-white/10 backdrop-blur-sm px-2 py-0.5 rounded flex items-center gap-1">
              <MapPin size={8} /> {locationText}
            </span>
          )}
        </div>
        <h4 className="font-bold uppercase text-xl leading-tight tracking-tight">{adToShow.title}</h4>
        <p className="text-xs text-slate-200 line-clamp-2 font-medium mt-2">{adToShow.description}</p>
        <div className="mt-auto pt-4">
          <div className={`w-full py-3 rounded-lg font-bold uppercase text-[10px] tracking-wider flex items-center justify-center gap-2 group-hover:scale-[1.02] transition-all ${isWhatsappAction ? 'bg-[#25D366] text-white hover:bg-[#20BA5C]' : 'bg-white text-slate-900 hover:bg-slate-100'}`}>
            {ctaText} {ctaIcon}
          </div>
        </div>
      </div>
    </div>
  );
}
