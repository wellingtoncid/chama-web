import { ArrowRight, Truck } from "lucide-react";
import { Button } from "../components/ui/button";

const CTA = () => {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="container mx-auto max-w-6xl">
        <div className="bg-slate-950 rounded-[3rem] p-8 md:p-16 lg:p-24 relative overflow-hidden">
          {/* Elementos Decorativos */}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-orange-500/10 to-transparent pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-orange-500/20 rounded-full blur-[100px]" />

          <div className="relative z-10 flex flex-col items-center text-center space-y-8">
            <div className="w-20 h-20 bg-orange-500 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-orange-500/20 rotate-3">
              <Truck className="w-10 h-10 text-white" />
            </div>
            
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-tight max-w-3xl">
              Pronto para maximizar <br /> 
              seus resultados?
            </h2>
            
            <p className="text-slate-400 text-lg md:text-xl max-w-2xl font-medium">
              Junte-se a maior comunidade logística do Brasil. Cadastro gratuito para motoristas e transportadoras.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center pt-4">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white h-16 px-10 rounded-2xl font-black uppercase text-xs tracking-widest transition-all hover:scale-105 active:scale-95">
                Começar Agora Grátis
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 text-white h-16 px-10 rounded-2xl font-black uppercase text-xs tracking-widest">
                Falar com Consultor
              </Button>
            </div>
            
            <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest">
              Sem taxas de adesão • Suporte humanizado • +15k motoristas
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;