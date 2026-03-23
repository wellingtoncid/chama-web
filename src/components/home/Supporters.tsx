import React, { useEffect, useState } from "react";
import { api } from "../../api/api"; 

const Supporters = () => {
  const [supporters, setSupporters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSupporters = async () => {
      try {
        const response = await api.get('/top-ads-freight');
        if (response.data?.success) {
          setSupporters(response.data.data);
        }
      } catch (error) {
        console.error("Erro ao carregar anunciantes", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSupporters();
  }, []);

  // Se estiver carregando ou não houver dados, podemos ocultar a seção ou mostrar skeleton
  if (loading || supporters.length === 0) return null;

  return (
    <section id="apoiadores" className="py-16 bg-white dark:bg-slate-950 overflow-hidden border-b border-slate-100 dark:border-slate-800">
      <div className="container mx-auto px-4 mb-10">
        <div className="text-center">
          <h2 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em] mb-2">
            Principais empresas <span className="text-[#1f4ead] dark:text-blue-400 italic">anunciando agora</span>
          </h2>
          <div className="h-1 w-12 bg-[#1f4ead] mx-auto rounded-full" />
        </div>
      </div>

      <div className="relative flex overflow-x-hidden group">
        {/* Usamos o supporters 3 vezes para o efeito infinito do marquee */}
        <div className="py-8 animate-marquee flex items-center gap-16 whitespace-nowrap">
          {[...supporters, ...supporters, ...supporters].map((supporter, index) => (
            <div
              key={index}
              className="flex items-center gap-6 group/item transition-all duration-300"
            >
              <div className="relative">
                <div className="w-14 h-14 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center text-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800">
                  {supporter.logo ? (
                    <img src={supporter.logo} alt={supporter.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-black text-blue-600">
                      {supporter.name ? supporter.name.charAt(0).toUpperCase() : 'F'}
                    </span>
                  )}
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-950 rounded-full" />
              </div>

              <div className="flex flex-col">
                <span className="text-2xl font-[1000] text-slate-800 dark:text-slate-200 uppercase italic tracking-tighter leading-none">
                  {supporter.name}
                </span>
                <span className="text-[9px] font-black text-[#1f4ead] dark:text-blue-400 uppercase tracking-widest mt-1">
                  {supporter.freights} fretes ativos
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Gradientes laterais */}
        <div className="absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-white dark:from-slate-950 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-40 bg-gradient-to-l from-white dark:from-slate-950 to-transparent z-10 pointer-events-none" />
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-marquee {
          animation: marquee ${supporters.length * 5}s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};

export default Supporters;