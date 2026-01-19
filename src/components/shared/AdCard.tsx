import { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { api } from "../../api";

const DEFAULT_AD = {
  id: 0,
  title: "Sua Empresa Aqui",
  description: "Destaque sua marca para milhares de motoristas e transportadores em todo o Brasil.",
  image_url: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=1470&auto=format&fit=crop",
  link_whatsapp: "5547992717125",
  category: "ANUNCIE",
};

interface AdCardProps {
  position: 'freight_list' | 'sidebar' | 'details_page' | 'home_hero';
  variant?: 'horizontal' | 'vertical';
  city?: string;
  search?: string;
}

export function AdCard({ position, variant = 'vertical', city, search }: AdCardProps) {
  const [ad, setAd] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAd = async () => {
      try {
        setLoading(true);
        // Chamada enviando os parâmetros para o PHP filtrar
        const res = await api.get('/ads', {
          params: { position, city, search }
        });

        if (Array.isArray(res.data) && res.data.length > 0) {
          const selectedAd = res.data[0];
          setAd(selectedAd);
          
          if (selectedAd.id > 0) {
            api.post('/manage-ads', { id: selectedAd.id, action: 'increment-view' });
          }
        } else {
          setAd(DEFAULT_AD);
        }
      } catch (err) {
        console.error("Erro ao carregar ad:", err);
        setAd(DEFAULT_AD);
      } finally {
        setLoading(false);
      }
    };

    loadAd();
  }, [position, city, search]);

  const handleAction = () => {
    if (!ad) return;
    if (ad.id !== 0) api.post('/manage-ads', { id: ad.id, action: 'increment-click' });
    const phone = ad.link_whatsapp.replace(/\D/g, '');
    window.open(`https://wa.me/${phone}`, "_blank");
  };

  if (loading) return (
    <div className={`mx-auto bg-slate-100 animate-pulse rounded-[2rem] ${variant === 'horizontal' ? 'h-24 max-w-[700px] w-full' : 'h-64 w-full'}`} />
  );
  
  if (!ad) return null;

  // VARIANTE HORIZONTAL: Ajustada com Max-Width e Estilo Fixo
  if (variant === 'horizontal') {
    return (
      <div className="w-full flex justify-center px-4 py-2">
        <div 
          className="bg-white border border-slate-100 rounded-[2rem] p-3 flex items-center gap-4 shadow-sm hover:shadow-md transition-all group"
          style={{ height: '90px', maxWidth: '700px', width: '100%' }}
        >
          <div className="w-24 h-full rounded-2xl overflow-hidden flex-shrink-0 bg-slate-50">
            <img src={ad.image_url} alt={ad.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
          </div>
          
          <div className="flex-1 min-w-0">
            <span className="text-[7px] font-black text-orange-500 uppercase tracking-widest block mb-0.5">{ad.category}</span>
            <h4 className="font-black text-slate-800 text-sm uppercase italic leading-tight truncate">{ad.title}</h4>
            <p className="text-[10px] text-slate-500 line-clamp-1 font-medium">{ad.description}</p>
          </div>

          <button 
            onClick={handleAction} 
            className="bg-[#25D366] text-white px-5 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-transform flex-shrink-0"
          >
            <MessageCircle size={12} fill="currentColor" /> WhatsApp
          </button>
        </div>
      </div>
    );
  }

  // VARIANTE VERTICAL
  return (
    <div className="group relative overflow-hidden rounded-[2.5rem] shadow-xl transition-all h-full min-h-[350px] w-full">
      <div className="absolute inset-0 z-0">
        <img src={ad.image_url} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" alt={ad.title} />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-900/40 to-transparent" />
      </div>
      <div className="relative z-10 p-8 flex flex-col h-full justify-between text-white">
        <div>
          <span className="text-[8px] bg-white/20 backdrop-blur-md px-3 py-1 rounded-full font-black uppercase tracking-widest border border-white/10">
            {ad.category}
          </span>
          <h4 className="font-[1000] italic uppercase text-2xl leading-none mt-6 drop-shadow-lg">{ad.title}</h4>
          <p className="text-xs text-white/80 line-clamp-3 mt-3 font-medium">{ad.description}</p>
        </div>
        <button onClick={handleAction} className="w-full bg-white text-slate-900 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all shadow-lg flex items-center justify-center gap-2">
          Falar com Anunciante
        </button>
      </div>
    </div>
  );
}