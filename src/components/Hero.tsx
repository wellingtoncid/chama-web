import { Search, MapPin, TrendingUp, Shield, Clock, ArrowRight } from "lucide-react";
import { Button } from "../components/ui/button";
import { useState } from "react";

const Hero = () => {
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Dispara um evento personalizado que a lista de fretes vai escutar
    window.dispatchEvent(new CustomEvent("filter-freights", { detail: query }));
    
    // Scroll suave para a seção de fretes
    const element = document.getElementById("fretes");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section className="relative pt-24 lg:pt-40 pb-16 lg:pb-32 overflow-hidden bg-white">
      {/* Background Decorativo Sutil */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-[#1f4ead]/5 skew-x-12 translate-x-20 -z-10" />
      
      <div className="container mx-auto px-4 relative">
        <div className="max-w-4xl mx-auto text-center">
          
          {/* Badge - Azul Institucional */}
          <div className="inline-flex items-center gap-2 bg-[#1f4ead]/10 text-[#1f4ead] rounded-full px-5 py-2 text-sm font-bold mb-8 animate-fade-in">
            <TrendingUp className="w-4 h-4" />
            <span className="uppercase tracking-wider">Média de 5.240 novos fretes hoje</span>
          </div>

          {/* Headline - Ultra Bold conforme referência */}
          <h1 className="text-5xl md:text-7xl font-[1000] text-slate-900 mb-8 tracking-tighter leading-[0.9] animate-fade-up">
            O frete certo para o seu <br />
            <span className="text-[#1f4ead]">caminhão está aqui.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-slate-500 mb-12 max-w-2xl mx-auto font-medium animate-fade-up transition-all" style={{ animationDelay: '0.1s' }}>
            A plataforma mais rápida para conectar transportadores e cargas em todo o Brasil. Simples, seguro e sem burocracia.
          </p>

          {/* BARRA DE BUSCA ÚNICA - Design Premium */}
          <form 
            onSubmit={handleSearch}
            className="bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(31,78,173,0.15)] p-2 md:p-3 mb-16 animate-fade-up flex flex-col md:flex-row gap-2 border border-slate-100 relative group transition-all hover:border-[#1f4ead]/30" 
            style={{ animationDelay: '0.2s' }}
          >
            <div className="flex-1 relative flex items-center">
              <Search className="absolute left-6 w-6 h-6 text-[#1f4ead]" />
              <input
                type="text"
                placeholder="Busque por cidade, estado, tipo de carga ou veículo..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full h-16 pl-16 pr-6 rounded-[1.5rem] bg-transparent text-slate-800 font-bold text-lg placeholder:text-slate-400 focus:outline-none transition-all"
              />
            </div>
            <Button 
              type="submit"
              className="h-16 px-10 rounded-[1.5rem] bg-[#1f4ead] hover:bg-[#163a82] text-white font-black text-lg uppercase tracking-tight shadow-lg shadow-[#1f4ead]/20 transition-all hover:-translate-y-1 active:scale-95 flex gap-2"
            >
              Buscar Fretes
              <ArrowRight className="w-5 h-5" />
            </Button>
          </form>

          {/* Stats - Cores originais mantidas mas com refinamento */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-center md:justify-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center">
                <Shield className="w-7 h-7 text-green-600" />
              </div>
              <div className="text-left">
                <p className="text-2xl font-black text-slate-900 tracking-tighter">98.5%</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Segurança Total</p>
              </div>
            </div>
            
            <div className="flex items-center justify-center md:justify-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-[#1f4ead]/10 flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-[#1f4ead]" />
              </div>
              <div className="text-left">
                <p className="text-2xl font-black text-slate-900 tracking-tighter">15k+</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Motoristas Ativos</p>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center">
                <Clock className="w-7 h-7 text-[#F97316]" />
              </div>
              <div className="text-left">
                <p className="text-2xl font-black text-slate-900 tracking-tighter">24/7</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Suporte Real</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;