import { ExternalLink, Info } from 'lucide-react';

const Partners = () => {

  return (
    <section className="py-24 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 transition-colors">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
        <div className="space-y-20">
          
          {/* NÍVEL 1: PARCEIROS ESTRATÉGICOS */}
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
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  <div className="absolute -bottom-2 left-0 w-0 h-0.5 bg-[#1f4ead] group-hover:w-full transition-all" />
                </div>
              ))}
            </div>
          </div>

          {/* NÍVEL 2: MEDIA NETWORK */}
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
              {[...Array(5)].map((_, idx) => (
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
