import { ExternalLink, Info, BadgeCheck } from "lucide-react";

// Simulando anunciantes que já fecharam pacotes de mídia/ads
const activeAdvertisers = [
  { name: "Pirelli", logo: "/logos/pirelli.png", type: "Premium" },
  { name: "Shell Box", logo: "/logos/shell.png", type: "Partner" },
];

const Partners = () => {
  return (
    <section className="py-24 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 transition-colors">
      <div className="container mx-auto px-4">
        <div className="space-y-20">
          
          {/* NÍVEL 1: PARCEIROS ESTRATÉGICOS (Donos do Ecossistema) */}
          <div>
            <div className="flex items-center gap-3 mb-12">
              <div className="w-1.5 h-6 bg-[#1f4ead] rounded-full" />
              <h2 className="text-xs font-[1000] text-[#1f4ead] dark:text-blue-500 uppercase tracking-[0.3em]">
                Strategic Partners
              </h2>
            </div>
            
            <div className="flex flex-wrap items-center gap-12 md:gap-20">
              {["afterclick", "appmax"].map((partner) => (
                <div key={partner} className="group relative">
                  <img 
                    src={`/logos/${partner}.png`} 
                    className="h-10 md:h-12 grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-500 cursor-pointer" 
                    alt={partner} 
                  />
                  <div className="absolute -bottom-2 left-0 w-0 h-0.5 bg-[#1f4ead] group-hover:w-full transition-all" />
                </div>
              ))}
            </div>
          </div>

          {/* NÍVEL 2: MEDIA NETWORK (Empresas reais que pagam Ads + Espaços Livres) */}
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] p-8 md:p-12 border border-slate-100 dark:border-slate-800">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
              <div>
                <h2 className="text-xs font-[1000] text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-2">
                  Anunciantes & Media Network
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Soluções e benefícios para o ecossistema logístico.</p>
              </div>
              
              <button className="group flex items-center gap-2 text-[10px] font-[1000] uppercase tracking-widest text-[#1f4ead] dark:text-blue-400 bg-white dark:bg-slate-800 px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all">
                Seja um anunciante <ExternalLink size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              
              {/* Renderiza Anunciantes Ativos */}
              {activeAdvertisers.map((ad, i) => (
                <div key={i} className="group relative aspect-video bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-center p-6 hover:shadow-xl transition-all cursor-pointer overflow-hidden">
                  <div className="absolute top-2 left-2">
                    <BadgeCheck size={14} className="text-blue-500 opacity-50" />
                  </div>
                  {/* Aqui entraria o logo do anunciante real */}
                  <span className="text-lg font-black text-slate-400 group-hover:text-[#1f4ead] transition-colors uppercase italic">{ad.name}</span>
                </div>
              ))}

              {/* Espaços para Novos Ads (Venda) */}
              {[1, 2, 3].map((space) => (
                <div key={space} className="group relative aspect-video border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center p-6 hover:border-[#1f4ead] hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all cursor-pointer">
                  <Info size={20} className="text-slate-300 dark:text-slate-700 group-hover:text-[#1f4ead] mb-2 transition-colors" />
                  <span className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-tighter text-center">
                    Espaço Disponível <br /> 
                    <span className="text-[#1f4ead] opacity-0 group-hover:opacity-100 transition-opacity">Reserve via Mídia Kit</span>
                  </span>
                </div>
              ))}

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Partners;