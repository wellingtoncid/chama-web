import { Search, MapPin, TrendingUp, Shield, Clock, ArrowRight } from "lucide-react";
import { Button } from "../../components/ui/button";
import { useState } from "react";

const Hero = () => {
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent("filter-freights", { detail: query }));
    const element = document.getElementById("fretes");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    /* Ajustado: bg-white para dark:bg-slate-950 */
    <section className="relative pt-24 lg:pt-40 pb-16 lg:pb-32 overflow-hidden bg-white dark:bg-slate-950 transition-colors duration-500">
      
      {/* Background Decorativo - Ajustado para não sumir no dark */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-[#1f4ead]/5 dark:bg-[#1f4ead]/10 skew-x-12 translate-x-20 -z-10" />
      
      <div className="container mx-auto px-4 relative">
        <div className="max-w-4xl mx-auto text-center">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-[#1f4ead]/10 text-[#1f4ead] dark:text-blue-400 rounded-full px-5 py-2 text-sm font-bold mb-8 animate-fade-in">
            <TrendingUp className="w-4 h-4" />
            <span className="uppercase tracking-wider">Mais de 20 mil inscrições</span>
          </div>

          {/* Headline - text-slate-900 para dark:text-white */}
          <h1 className="text-5xl md:text-7xl font-[1000] text-slate-900 dark:text-white mb-8 tracking-tighter leading-[0.9] animate-fade-up">
            A conexão ideal para o seu <br />
            <span className="text-[#1f4ead] dark:text-blue-500">frete está aqui.</span>
          </h1>

          {/* Subheadline - text-slate-500 para dark:text-slate-400 */}
          <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 mb-12 max-w-2xl mx-auto font-medium animate-fade-up" style={{ animationDelay: '0.1s' }}>
            A plataforma mais rápida para conectar empresas e profissionais em todo o Brasil. Simples, seguro e sem burocracia.
          </p>

          {/* BARRA DE BUSCA - O ponto crucial */}
          <form 
            onSubmit={handleSearch}
            /* Ajustado: bg-white para dark:bg-slate-900, sombra reduzida no dark, borda dark:border-slate-800 */
            className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-[0_20px_50px_rgba(31,78,173,0.15)] dark:shadow-none p-2 md:p-3 mb-16 animate-fade-up flex flex-col md:flex-row gap-2 border border-slate-100 dark:border-slate-800 relative group transition-all hover:border-[#1f4ead]/30" 
            style={{ animationDelay: '0.2s' }}
          >
            <div className="flex-1 relative flex items-center">
              <Search className="absolute left-6 w-6 h-6 text-[#1f4ead] dark:text-blue-400" />
              <input
                type="text"
                placeholder="Busque por cidade, estado, tipo de carga..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                /* Ajustado: text-slate-800 para dark:text-white */
                className="w-full h-16 pl-16 pr-6 rounded-[1.5rem] bg-transparent text-slate-800 dark:text-white font-bold text-lg placeholder:text-slate-400 focus:outline-none transition-all"
              />
            </div>
            <Button 
              type="submit"
              className="h-16 px-10 rounded-[2rem] bg-[#1f4ead] hover:bg-[#163a82] text-white font-black text-lg uppercase tracking-tight shadow-lg shadow-[#1f4ead]/20 transition-all hover:-translate-y-1 active:scale-95 flex gap-2"
            >
              Buscar Fretes
              <ArrowRight className="w-5 h-5" />
            </Button>
          </form>

          {/* Stats - Cards adaptados */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            
            {/* Stat 1: Segurança */}
            <div className="flex items-center justify-center md:justify-start gap-4 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center transition-colors">
                <Shield className="w-7 h-7 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-left">
                <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">98.5%</p>
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Segurança Total</p>
              </div>
            </div>
            
            {/* Stat 2: Ativos */}
            <div className="flex items-center justify-center md:justify-start gap-4 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-[#1f4ead]/10 dark:bg-blue-900/20 flex items-center justify-center transition-colors">
                <TrendingUp className="w-7 h-7 text-[#1f4ead] dark:text-blue-400" />
              </div>
              <div className="text-left">
                <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">15k+</p>
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Motoristas Ativos</p>
              </div>
            </div>

            {/* Stat 3: Suporte */}
            <div className="flex items-center justify-center md:justify-start gap-4 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center transition-colors">
                <Clock className="w-7 h-7 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="text-left">
                <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">24/7</p>
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Suporte Real</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;