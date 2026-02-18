import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import AdCard from "./AdCard";
import { api } from "../../api/api";

const AdCarousel = ({ searchTerm, state, city }: any) => {
  const [ads, setAds] = useState<any[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        setLoading(true);
        const res = await api.get('/ads', { 
          params: { position: 'freight_list', search: searchTerm, state, city } 
        });
        const data = res.data?.data || (Array.isArray(res.data) ? res.data : []);
        setAds(data);
      } catch (err) {
        setAds([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAds();
  }, [searchTerm, state, city]);

  const total = ads.length;

  // Efeito de Giro Automático
  useEffect(() => {
    if (total <= 1) return;
    const itv = setInterval(() => {
      setCurrent(s => (s + 1) % total);
    }, 6000);
    return () => clearInterval(itv);
  }, [total]);

  if (loading) return <div className="h-28 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl w-full" />;
  
  // Se não houver anúncios, renderiza o AdCard fixo (ele abrirá o modal)
  if (total === 0) return <AdCard position="freight_list" variant="horizontal" />;

  return (
    <div className="relative overflow-hidden group rounded-2xl w-full bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
      
      {/* O SEGREDO DO MOVIMENTO ESTÁ AQUI: Width dinâmica e Flex-row */}
      <div 
        className="flex transition-transform duration-700 ease-in-out"
        style={{ 
          transform: `translateX(-${current * (100 / (total || 1))}%)`, 
          width: `${total * 100}%` 
        }}
      >
        {ads.map((ad) => (
          <div 
            key={ad.id} 
            className="flex-shrink-0" 
            style={{ width: `${100 / total}%` }} // Cada item ocupa exatamente 1/total do container pai
          >
            <div className="p-1">
               <AdCard 
                position="freight_list" 
                variant="horizontal" 
                forcedAd={ad} 
              />
            </div>
          </div>
        ))}
      </div>

      {/* Controles Visíveis apenas no Hover */}
      {total > 1 && (
        <>
          <button 
            onClick={(e) => { e.stopPropagation(); setCurrent(s => (s - 1 + total) % total); }} 
            className="absolute left-2 top-1/2 -translate-y-1/2 z-50 p-2 bg-white/90 dark:bg-slate-800/90 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-blue-600 hover:text-white"
          >
            <ChevronLeft size={18} />
          </button>
          
          <button 
            onClick={(e) => { e.stopPropagation(); setCurrent(s => (s + 1) % total); }} 
            className="absolute right-2 top-1/2 -translate-y-1/2 z-50 p-2 bg-white/90 dark:bg-slate-800/90 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-blue-600 hover:text-white"
          >
            <ChevronRight size={18} />
          </button>

          {/* Indicadores de bolinha */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-50">
            {ads.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all ${
                  current === i ? "w-6 bg-blue-600" : "w-1.5 bg-slate-300 dark:bg-slate-600"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AdCarousel;