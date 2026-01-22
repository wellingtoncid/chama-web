import { useState, useEffect, useMemo, useRef } from "react";
import { MessageCircle, ExternalLink } from "lucide-react";
import { api } from "../../api/api";
import { AdImage } from "../AdImage";

// Placeholder interno
const DEFAULT_AD = {
  id: 0,
  title: "Anuncie no Chama Frete",
  description: "Sua marca vista por milhares de motoristas em todo o Brasil. Clique e saiba mais!",
  image_url: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1470&auto=format&fit=crop",
  destination_url: "https://wa.me/5547992717125",
  category: "OPORTUNIDADE",
};

interface AdCardProps {
  position: 'freight_list' | 'sidebar' | 'details_page' | 'home_hero';
  variant?: 'horizontal' | 'vertical';
  city?: string;
  state?: string;
  search?: string;
}

export function AdCard({ position, variant = 'vertical', city, state, search }: AdCardProps) {
  const [adsList, setAdsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const viewLogged = useRef<number | null>(null); // Evita duplicar logs na mesma sessão

  // 1. Busca de anúncios na API
  useEffect(() => {
    const loadAds = async () => {
      try {
        setLoading(true);
        const res = await api.get('/ads', {
          params: { position, city, state, search }
        });
        setAdsList(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Erro ao buscar anúncios:", err);
        setAdsList([]);
      } finally {
        setLoading(false);
      }
    };
    loadAds();
  }, [position, city, state, search]);

  // 2. Seleção Inteligente do Anúncio
  const adToShow = useMemo(() => {
    if (!adsList || adsList.length === 0) return DEFAULT_AD;

    let pool = adsList.filter(ad => ad.position === position);
    if (pool.length === 0) pool = adsList;

    if (city || state) {
      const locationMatch = pool.filter(ad => 
        ad.location_city?.toLowerCase() === city?.toLowerCase() ||
        ad.location_city?.toLowerCase() === state?.toLowerCase() ||
        ad.location_city?.toLowerCase() === 'brasil'
      );
      if (locationMatch.length > 0) pool = locationMatch;
    }

    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return shuffled[0] || DEFAULT_AD;
  }, [adsList, city, state, position]);

  // 3. Rastreamento de Visualização Profissional (Intersection Observer)
  useEffect(() => {
    // Não loga se for o placeholder (ID 0) ou se já logamos este ID nesta sessão
    if (loading || adToShow.id === 0 || viewLogged.current === adToShow.id) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          viewLogged.current = adToShow.id;
          api.post('/manage-ads', { 
            id: adToShow.id, 
            action: 'increment-view' 
          }).catch(() => {});
          
          observer.disconnect(); // Logou uma vez, para de observar
        }
      },
      { threshold: 0.5 } // 50% do anúncio deve estar visível
    );

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [adToShow.id, loading]);

  // 4. Ação de Clique Inteligente
  const handleAction = () => {
    if (!adToShow) return;

    // Log de clique no banco
    if (adToShow.id > 0) {
      api.post('/manage-ads', { 
        id: adToShow.id, 
        action: 'increment-click' 
      }).catch(() => {});
    }

    // Identifica se o link é WhatsApp ou Site
    const rawLink = adToShow.destination_url || adToShow.link_whatsapp || "";
    
    // Se conter apenas números ou padrão de telefone, trata como WhatsApp
    const cleanNumber = rawLink.replace(/\D/g, '');
    if (cleanNumber.length >= 10 && cleanNumber.length <= 13 && !rawLink.includes('http')) {
      const text = encodeURIComponent(`Olá, vi seu anúncio "${adToShow.title}" no Chama Frete.`);
      window.open(`https://wa.me/${cleanNumber.length <= 11 ? '55' + cleanNumber : cleanNumber}?text=${text}`, "_blank");
    } else {
      // Caso contrário, trata como link externo
      const finalUrl = rawLink.startsWith('http') ? rawLink : `https://${rawLink}`;
      window.open(finalUrl, "_blank");
    }
  };

  if (loading) return (
    <div className={`mx-auto bg-slate-100 animate-pulse rounded-[2rem] w-full ${
      variant === 'horizontal' ? 'h-24 max-w-[700px]' : 'h-[400px]'
    }`} />
  );

  // Determina o ícone e estilo baseado no tipo de link
  const isWhatsapp = (adToShow.destination_url || adToShow.link_whatsapp || "").includes('wa.me') || 
                     (/^\d+$/.test((adToShow.destination_url || "").replace(/\D/g, '')));

  return (
    <div ref={containerRef} className="w-full h-full">
      {variant === 'horizontal' ? (
        /* --- LAYOUT HORIZONTAL --- */
        <div className="w-full flex justify-center px-4 py-2">
          <div 
            onClick={handleAction}
            className="bg-white border border-slate-100 rounded-[2rem] p-3 flex items-center gap-4 shadow-sm hover:shadow-md transition-all group border-l-4 border-l-orange-500 cursor-pointer"
            style={{ height: '95px', maxWidth: '700px', width: '100%' }}
          >
            <div className="w-28 h-full rounded-2xl overflow-hidden flex-shrink-0 bg-slate-50">
              <AdImage 
                url={adToShow.image_url} 
                alt={adToShow.title} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <span className="text-[7px] font-black text-orange-600 uppercase tracking-widest block mb-0.5">
                  {adToShow.category || "Destaque"}
              </span>
              <h4 className="font-black text-slate-800 text-sm uppercase italic leading-tight truncate">
                  {adToShow.title}
              </h4>
              <p className="text-[10px] text-slate-500 line-clamp-1 font-medium">
                  {adToShow.description}
              </p>
            </div>

            <button className={`${isWhatsapp ? 'bg-[#25D366]' : 'bg-slate-900'} text-white px-5 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-transform flex-shrink-0 shadow-lg`}>
              {isWhatsapp ? <MessageCircle size={14} fill="currentColor" /> : <ExternalLink size={14} />} 
              {isWhatsapp ? 'WhatsApp' : 'Ver Site'}
            </button>
          </div>
        </div>
      ) : (
        /* --- LAYOUT VERTICAL --- */
        <div className="group relative overflow-hidden rounded-[2.5rem] shadow-2xl transition-all h-full min-h-[420px] w-full flex flex-col border border-slate-100">
          <div className="absolute inset-0 z-0">
            <AdImage 
                url={adToShow.image_url} 
                className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                alt={adToShow.title} 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent opacity-90" />
          </div>

          <div className="relative z-10 p-8 flex flex-col h-full justify-between text-white flex-1">
            <div>
              <div className="flex justify-between items-start">
                <span className="text-[9px] bg-orange-600 px-4 py-1.5 rounded-full font-black uppercase tracking-[0.2em] shadow-xl">
                  {adToShow.category || "Patrocinado"}
                </span>
              </div>
              
              <h4 className="font-[1000] italic uppercase text-3xl leading-[0.9] mt-8 drop-shadow-2xl tracking-tighter">
                {adToShow.title}
              </h4>
              
              <div className="w-12 h-1.5 bg-orange-500 my-5 rounded-full" />
              
              <p className="text-sm text-slate-200 line-clamp-4 font-medium leading-relaxed drop-shadow italic">
                "{adToShow.description}"
              </p>
            </div>

            <div className="mt-auto">
              <button 
                onClick={handleAction} 
                className="w-full bg-white text-slate-900 py-5 rounded-[1.8rem] font-[1000] uppercase text-[11px] tracking-widest hover:bg-orange-500 hover:text-white transition-all shadow-2xl flex items-center justify-center gap-3 active:scale-95 group/btn"
              >
                {isWhatsapp ? 'Falar no WhatsApp' : 'Acessar Conteúdo'}
                {isWhatsapp ? <MessageCircle size={18} /> : <ExternalLink size={18} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}