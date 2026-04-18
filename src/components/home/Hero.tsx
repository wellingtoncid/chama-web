import { ArrowRight, Building2, Truck } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative pt-24 lg:pt-40 pb-16 lg:pb-32 overflow-hidden bg-white dark:bg-slate-950 transition-colors duration-500">
      
      {/* Video Background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-30 dark:opacity-20"
      >
        <source src="/videos/hero1.mp4" type="video/mp4" />
      </video>
      
      {/* Overlay para garantir leitura do texto */}
      <div className="absolute inset-0 bg-white/60 dark:bg-slate-950/70" />
      
      <div className="container mx-auto px-4 relative">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-full px-5 py-2 text-sm font-bold mb-8 animate-fade-in">
            <span className="uppercase tracking-wider">Desde 2017 • 15.000+ inscritos</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-[1000] text-slate-900 dark:text-white mb-8 tracking-tighter leading-[0.9] uppercase italic animate-fade-up">
            Conectando o<br />
            <span className="text-[#1f4ead] dark:text-blue-500">Transporte do Brasil.</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 mb-12 max-w-2xl mx-auto font-medium animate-fade-up" style={{ animationDelay: '0.1s' }}>
            O melhor lugar para conectar empresas e profissionais em todo o Brasil.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <Link 
              to="/register?type=company"
              className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-[#1f4ead] hover:bg-[#163a82] text-white rounded-2xl font-black text-lg uppercase tracking-tight shadow-xl shadow-blue-500/20 transition-all hover:-translate-y-1 active:scale-95"
            >
              Sou Empresa
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              to="/register?type=driver"
              className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-black text-lg uppercase tracking-tight shadow-xl shadow-orange-500/20 transition-all hover:-translate-y-1 active:scale-95"
            >
              Sou Motorista
              <Truck className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;