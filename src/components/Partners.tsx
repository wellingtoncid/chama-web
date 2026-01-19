const Partners = () => {
  return (
    <section className="py-20 bg-[#F8FAFC] border-t border-slate-100">
      <div className="container mx-auto px-4">
        <div className="space-y-16">
          {/* Categoria principal em Azul */}
          <div>
            <h2 className="text-sm font-black text-blue-700 uppercase tracking-widest mb-10 border-l-4 border-blue-700 pl-4">
              Oferecimento
            </h2>
            <div className="flex flex-wrap items-center gap-12 opacity-90">
              <img src="/logos/afterclick.png" className="h-10 grayscale hover:grayscale-0 transition-all" alt="Partner" />
              <img src="/logos/appmax.png" className="h-10 grayscale hover:grayscale-0 transition-all" alt="Partner" />
            </div>
          </div>

          {/* Categoria secundária */}
          <div>
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-10 border-l-4 border-slate-300 pl-4">
              Mantenedores
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-6 gap-y-12 gap-x-8 items-center opacity-60">
               <div className="h-8 bg-slate-200 rounded-md w-32 animate-pulse" />
               <div className="h-8 bg-slate-200 rounded-md w-32 animate-pulse" />
               <div className="h-8 bg-slate-200 rounded-md w-32 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Partners;