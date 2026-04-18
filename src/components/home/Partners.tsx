import { useState, useEffect, useRef } from 'react';
import { ExternalLink, Info, BadgeCheck, Loader2, Star } from 'lucide-react';
import { api, BASE_URL_API } from '../../api/api';
import { useTracker } from '../../services/useTracker';

interface Ad {
  id: number;
  title: string;
  image_url: string;
  destination_url: string;
  link_url?: string;
  position: string;
  user_id: number;
  views_count?: number;
  clicks_count?: number;
}

const Partners = () => {
  const [strategicAds, setStrategicAds] = useState<Ad[]>([]);
  const [mediaAds, setMediaAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const { trackEvent } = useTracker();
  const viewTracked = useRef<Set<number>>(new Set());

  // Tracking de views para anúncios do Partners
  useEffect(() => {
    const allAds = [...strategicAds, ...mediaAds];
    allAds.forEach((ad) => {
      if (ad.id && !viewTracked.current.has(ad.id)) {
        const sessionKey = `ad_view_${ad.id}`;
        if (!sessionStorage.getItem(sessionKey)) {
          viewTracked.current.add(ad.id);
          sessionStorage.setItem(sessionKey, '1');
          trackEvent(ad.id, 'AD', 'VIEW');
        }
      }
    });
  }, [strategicAds, mediaAds, trackEvent]);

  useEffect(() => {
    const loadAds = async () => {
      try {
        // Busca anúncios por posição específica no backend (mais eficiente)
        const [resStrategic, resMedia] = await Promise.all([
          api.get('/ads', { params: { position: 'strategic_partners' } }),
          api.get('/ads', { params: { position: 'media_network' } })
        ]);
        
        const strategicData = resStrategic.data?.data || resStrategic.data || [];
        const mediaData = resMedia.data?.data || resMedia.data || [];
        
        if (!Array.isArray(strategicData)) {
          setStrategicAds([]);
        } else {
          setStrategicAds(strategicData.slice(0, 3));
        }
        
        if (!Array.isArray(mediaData)) {
          setMediaAds([]);
        } else {
          setMediaAds(mediaData.slice(0, 5));
        }
      } catch (error) {
        console.error("Erro ao carregar anúncios:", error);
        setStrategicAds([]);
        setMediaAds([]);
      } finally {
        setLoading(false);
      }
    };
    loadAds();
  }, []);

  const getImageUrl = (path: string) => {
    if (!path) return 'https://placehold.co/400x300/f1f5f9/64748b?text=Sem+Imagem';
    if (path.startsWith('http')) return path;
    const cleanPath = path.replace(/^\//, '').replace(/^api\//, '');
    return `http://127.0.0.1:8000/${cleanPath}`;
  };

  const handleAdClick = async (ad: Ad) => {
    const link = ad.destination_url || ad.link_url;
    
    // Registra clique no backend - usa URL completa para evitar duplicação
    try {
      await fetch(BASE_URL_API + '/ads/click/' + ad.id + '?type=CLICK');
    } catch (e) {
      console.error("Erro ao registrar clique:", e);
    }
    
    // Abre o link do anúncio
    if (link) {
      window.open(link, '_blank');
    }
  };

  if (loading) {
    return (
      <section className="py-24 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800">
        <div className="container mx-auto px-4 flex justify-center">
          <Loader2 className="animate-spin text-slate-400" size={40} />
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 transition-colors">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
        <div className="space-y-20">
          
          {/* NÍVEL 1: PARCEIROS ESTRATÉGICOS - usa posição: home_hero, spotlight */}
          <div>
            <div className="flex items-center gap-3 mb-12">
              <div className="w-1.5 h-6 bg-[#1f4ead] rounded-full" />
              <h2 className="text-xs font-[1000] text-[#1f4ead] dark:text-blue-500 uppercase tracking-[0.3em]">
                Strategic Partners
              </h2>
            </div>
            
            <div className="flex flex-wrap items-center gap-12 md:gap-20">
              {strategicAds.length > 0 ? (
                strategicAds.map((ad) => (
                  <div 
                    key={ad.id}
                    onClick={() => handleAdClick(ad)}
                    className="group relative cursor-pointer"
                  >
                    <div className="h-16 md:h-20 w-32 md:w-40 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden flex items-center justify-center border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all">
                      <img 
                        src={getImageUrl(ad.image_url)}
                        alt={ad.title}
                        className="w-full h-full object-contain p-2"
                      />
                    </div>
                    <div className="absolute -bottom-2 left-0 w-0 h-0.5 bg-[#1f4ead] group-hover:w-full transition-all" />
                    <Star className="absolute -top-2 -right-2 text-yellow-500 fill-yellow-500" size={16} />
                  </div>
                ))
              ) : (
                <>
                  {["afterclick", "appmax"].map((partner) => (
                    <div key={partner} className="group relative">
                      <img 
                        src={`/logos/${partner}.png`} 
                        className="h-10 md:h-12 grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-500 cursor-pointer" 
                        alt={partner}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                      <div className="absolute -bottom-2 left-0 w-0 h-0.5 bg-[#1f4ead] group-hover:w-full transition-all" />
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* NÍVEL 2: MEDIA NETWORK - usa posição: sidebar, header */}
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] p-8 md:p-12 border border-slate-100 dark:border-slate-800">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
              <div>
                <h2 className="text-xs font-[1000] text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-2">
                  Anunciantes & Media Network
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Soluções e benefícios para o ecossistema logístico.</p>
              </div>
              
              <a href="/anunciar" className="group flex items-center gap-2 text-[10px] font-[1000] uppercase tracking-widest text-[#1f4ead] dark:text-blue-400 bg-white dark:bg-slate-800 px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all">
                Seja um anunciante <ExternalLink size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </a>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              
              {mediaAds.length > 0 ? (
                mediaAds.map((ad) => (
                  <div 
                    key={ad.id} 
                    onClick={() => handleAdClick(ad)}
                    className="group relative aspect-video bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-center p-2 hover:shadow-xl transition-all cursor-pointer overflow-hidden"
                  >
                    <div className="absolute top-2 left-2 z-10">
                      <BadgeCheck size={14} className="text-blue-500 opacity-75" />
                    </div>
                    <img 
                      src={getImageUrl(ad.image_url)} 
                      alt={ad.title}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ))
              ) : null}

              {[...Array(Math.max(0, 5 - mediaAds.length))].map((_, idx) => (
                <div key={`empty-${idx}`} className="group relative aspect-video border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center p-6 hover:border-[#1f4ead] hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all cursor-pointer">
                  <Info size={20} className="text-slate-300 dark:text-slate-700 group-hover:text-[#1f4ead] mb-2 transition-colors" />
                  <span className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-tighter text-center">
                    Espaço Disponível
                  </span>
                </div>
              ))}

            </div>
          </div>

        </div>
        </div>
      </div>
    </section>
  );
};

export default Partners;
