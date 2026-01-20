import { DollarSign, Route, Bell, Star, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "../../components/ui/button";

const benefits = [
  { icon: DollarSign, title: "Pagamento Garantido", description: "Receba via Pix assim que confirmar a entrega." },
  { icon: Route, title: "Cargas de Retorno", description: "Nunca volte com o caminhão vazio." },
];

const ForDrivers = () => {
  return (
    <section id="motoristas" className="py-24 bg-slate-950 text-white overflow-hidden relative">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 px-4 py-1.5 rounded-full">
              <Star className="w-4 h-4 text-orange-500 fill-orange-500" />
              <span className="text-xs font-black uppercase tracking-widest text-orange-500">Para quem vive na estrada</span>
            </div>
            
            <h2 className="text-5xl lg:text-6xl font-black tracking-tighter leading-[1.1]">
              Mais fretes, <br />
              <span className="text-slate-500 font-medium italic">menos burocracia.</span>
            </h2>

            <div className="grid sm:grid-cols-2 gap-6">
              {benefits.map((b, i) => (
                <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-3xl hover:bg-white/10 transition-all">
                  <b.icon className="w-8 h-8 text-orange-500 mb-4" />
                  <h4 className="font-bold text-lg mb-2">{b.title}</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">{b.description}</p>
                </div>
              ))}
            </div>

            <Button size="xl" className="bg-orange-500 hover:bg-orange-600 rounded-2xl h-14 px-8 font-black uppercase text-xs tracking-[0.2em]">
              Quero Me Cadastrar <ArrowRight className="ml-2" />
            </Button>
          </div>

          {/* MOCKUP INTERATIVO (O "Dashboard" dentro da Landing) */}
          <div className="relative group">
            <div className="absolute inset-0 bg-orange-500/20 blur-[120px] rounded-full" />
            <div className="relative bg-slate-900 border border-white/10 rounded-[2.5rem] p-4 shadow-2xl">
               <div className="bg-slate-800/50 rounded-t-[1.8rem] p-6 border-b border-white/5">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-full bg-orange-500/20 border border-orange-500/50" />
                     <div className="space-y-1">
                        <div className="h-2 w-24 bg-white/20 rounded" />
                        <div className="h-2 w-16 bg-white/10 rounded" />
                     </div>
                  </div>
               </div>
               <div className="p-6 space-y-4">
                  {[1, 2].map(i => (
                    <div key={i} className="bg-white/5 p-4 rounded-2xl border border-white/5 flex justify-between items-center group-hover:border-orange-500/30 transition-all">
                       <div className="flex gap-4 items-center">
                          <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-orange-500"><Route size={18}/></div>
                          <div className="space-y-1"><div className="h-2 w-20 bg-white/40 rounded" /><div className="h-2 w-32 bg-white/10 rounded" /></div>
                       </div>
                       <div className="text-right font-bold text-orange-500">R$ 4.500</div>
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

export default ForDrivers;