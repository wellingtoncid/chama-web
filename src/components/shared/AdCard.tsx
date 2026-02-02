import { useState, useEffect, useMemo, useRef } from "react";
import { MessageCircle, ExternalLink } from "lucide-react";
import { api } from "../../api/api";
import { AdImage } from "../AdImage";

const DEFAULT_AD = {
  id: 0,
  title: "Anuncie sua Marca",
  description: "Apareça para milhares de motoristas em todo o Brasil. Clique e saiba como anunciar aqui!",
  image_url: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1470&auto=format&fit=crop",
  destination_url: "https://wa.me/5547992717125",
  category: "OPORTUNIDADE",
};

interface AdCardProps {
  position: 'freight_list' | 'sidebar' | 'details_page' | 'home_hero' | 'in-feed';
  variant?: 'horizontal' | 'vertical';
  city?: string;
  state?: string;
  search?: string;
}

export default function AdCard({ position, variant = 'vertical', city, state, search }: AdCardProps) {
  const [adsList, setAdsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const viewLogged = useRef<number | null>(null);

  useEffect(() => {
    const loadAds = async () => {
      try {
        setLoading(true);
        // Rota corrigida com /api/ se necessário, ou apenas /ads se sua baseURL já incluir /api
        const res = await api.get('/ads', { 
          params: { position, city, state, search } 
        });
        
        const adsArray = res.data?.data || (Array.isArray(res.data) ? res.data : []);
        setAdsList(adsArray);
      } catch (err) {
        console.error("Erro ao buscar anúncios:", err);
        setAdsList([]);
      } finally {
        setLoading(false);
      }
    };
    loadAds();
  }, [position, city, state, search]);

  const adToShow = useMemo(() => {
    if (!adsList || adsList.length === 0) return DEFAULT_AD;
    // O backend já filtra, mas o shuffle no front garante rotatividade visual imediata
    const shuffled = [...adsList].sort(() => Math.random() - 0.5);
    return shuffled[0] || DEFAULT_AD;
  }, [adsList]);

  // Log de Visualização
  useEffect(() => {
    if (loading || adToShow.id === 0 || viewLogged.current === adToShow.id) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          viewLogged.current = adToShow.id;
          api.post('/log-ad-view', { id: adToShow.id }).catch(() => {});
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [adToShow.id, loading]);

  const handleAction = () => {
    if (!adToShow || adToShow.id === 0) return;
    
    // Log de Clique
    api.post('/api/log-ad-click', { id: adToShow.id }).catch(() => {});

    const rawLink = adToShow.destination_url || adToShow.link_url || "";
    if (!rawLink) return;

    if (/^\d+$/.test(rawLink.replace(/\D/g, '')) && !rawLink.includes('http')) {
      window.open(`https://wa.me/55${rawLink.replace(/\D/g, '').slice(-11)}`, "_blank");
    } else {
      const finalUrl = rawLink.startsWith('http') ? rawLink : `https://${rawLink}`;
      window.open(finalUrl, "_blank");
    }
  };

  if (loading) return <div className="bg-slate-100 animate-pulse rounded-[2.5rem] w-full h-[100px] md:h-[420px]" />;

  const isWhatsapp = (adToShow.destination_url || "").includes('wa.me') || 
                     /^\d+$/.test((adToShow.destination_url || "").replace(/\D/g, ''));

  return (
    <div ref={containerRef} className="h-full w-full">
      {variant === 'horizontal' ? (
        <div onClick={handleAction} className="bg-white border border-slate-100 rounded-[2rem] p-3 flex items-center gap-4 shadow-sm hover:shadow-md transition-all group cursor-pointer h-full min-h-[100px] w-full">
          <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0">
            <AdImage url={adToShow.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-black text-slate-800 text-sm uppercase truncate">{adToShow.title}</h4>
            <p className="text-[10px] text-slate-500 line-clamp-2 italic">{adToShow.description}</p>
          </div>
          <button className={`p-3 rounded-xl ${isWhatsapp ? 'bg-[#25D366] text-white' : 'bg-slate-900 text-white'}`}>
            {isWhatsapp ? <MessageCircle size={16} fill="currentColor" /> : <ExternalLink size={16} />}
          </button>
        </div>
      ) : (
        <div onClick={handleAction} className="group relative overflow-hidden rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all h-full min-h-[420px] w-full flex flex-col cursor-pointer border border-slate-100">
          <div className="absolute inset-0 z-0">
            <AdImage url={adToShow.image_url} className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={adToShow.title} />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />
          </div>
          <div className="relative z-10 p-8 flex flex-col h-full text-white">
            <span className="w-fit text-[9px] bg-amber-500 text-slate-900 px-3 py-1 rounded-full font-black uppercase tracking-widest mb-4">Patrocinado</span>
            <h4 className="font-black italic uppercase text-2xl leading-none mt-2 tracking-tighter">{adToShow.title}</h4>
            <p className="text-sm text-slate-200 line-clamp-3 font-medium mt-4 italic">{adToShow.description}</p>
            <div className="mt-auto pt-6">
              <div className={`w-full ${isWhatsapp ? 'bg-[#25D366]' : 'bg-white text-slate-900'} py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 group-hover:scale-105 transition-all shadow-xl`}>
                {isWhatsapp ? 'Chamar no Zap' : 'Saiba Mais'}
                {isWhatsapp ? <MessageCircle size={14} fill="currentColor" /> : <ExternalLink size={14} />}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}