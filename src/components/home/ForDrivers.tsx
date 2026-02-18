import { DollarSign, Route, Bell, Star, CheckCircle2, ArrowRight, Zap, MapPin } from "lucide-react";
import { Button } from "../../components/ui/button";

const benefits = [
  { 
    icon: DollarSign, 
    title: "Pagamento Direto", 
    description: "Sem intermediários retendo seu dinheiro. Combine e receba direto da empresa." 
  },
  { 
    icon: Route, 
    title: "Cargas de Retorno", 
    description: "Otimize sua rota. Encontre fretes para voltar para casa com o baú cheio." 
  },
  { 
    icon: Bell, 
    title: "Alertas no Zap", 
    description: "Seja avisado instantaneamente quando surgir um frete na sua cidade." 
  },
  { 
    icon: Zap, 
    title: "Agilidade Total", 
    description: "Filtre por tipo de carroceria, peso e destino em poucos segundos." 
  },
];

const ForDrivers = () => {
  return (
    <section id="motoristas" className="py-24 bg-slate-950 text-white overflow-hidden relative">
      {/* Elementos Decorativos de Fundo */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/10 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2" />
      
      {/* Aumento do padding lateral no container para dar fôlego ao mockup */}
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          <div className="space-y-10 relative z-10">
            <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 px-4 py-2 rounded-full">
              <Star className="w-4 h-4 text-orange-500 fill-orange-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">
                O melhor amigo do estradeiro
              </span>
            </div>
            
            <h2 className="text-5xl lg:text-7xl font-[1000] tracking-tighter leading-[0.9] uppercase italic">
              LUCRO NO BOLSO, <br />
              <span className="text-slate-500 not-italic font-medium">PÉ NA ESTRADA.</span>
            </h2>

            <p className="text-slate-400 text-lg max-w-md font-medium leading-relaxed">
              O Chama Frete foi feito por quem entende o trecho. Aqui você manda no seu tempo e escolhe as melhores oportunidades.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {benefits.map((b, i) => (
                <div key={i} className="bg-white/5 border border-white/10 p-5 rounded-[2rem] hover:bg-white/10 transition-all group">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <b.icon className="w-6 h-6 text-orange-500" />
                  </div>
                  <h4 className="font-black text-sm uppercase tracking-tight mb-1">{b.title}</h4>
                  <p className="text-slate-500 text-xs leading-relaxed">{b.description}</p>
                </div>
              ))}
            </div>

            <Button size="xl" className="bg-orange-500 hover:bg-orange-600 text-white rounded-2xl h-16 px-10 font-black uppercase text-sm tracking-widest shadow-2xl shadow-orange-500/20 group">
              Cadastrar meu Caminhão <ArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" />
            </Button>
          </div>

          {/* MOCKUP INTERATIVO - Ajustado para não sair da tela */}
          <div className="relative group lg:scale-105 lg:mr-8"> {/* Scale reduzido de 110 para 105 e margem direita adicionada */}
            <div className="absolute inset-0 bg-orange-600/20 blur-[100px] rounded-full animate-pulse" />
            
            <div className="relative bg-slate-900 border border-white/10 rounded-[3rem] p-3 shadow-2xl overflow-hidden">
              {/* Top Bar Mockup */}
              <div className="bg-slate-800/80 rounded-t-[2.5rem] p-6 border-b border-white/5">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center font-black text-xl italic shadow-lg">CF</div>
                    <div>
                      <div className="h-3 w-24 bg-white/20 rounded-full mb-2" />
                      <div className="flex items-center gap-1">
                        <MapPin size={10} className="text-orange-500" />
                        <div className="h-2 w-16 bg-white/10 rounded-full" />
                      </div>
                    </div>
                  </div>
                  <Bell size={20} className="text-slate-500" />
                </div>
              </div>

              {/* Lista de "Fretes" */}
              <div className="p-4 space-y-3 bg-slate-900/50">
                {[
                  { from: "Itajaí, SC", to: "São Paulo, SP", price: "R$ 3.850", type: "Sider" },
                  { from: "Curitiba, PR", to: "Goiânia, GO", price: "R$ 6.200", type: "Grade Baixa" },
                  { from: "Joinville, SC", to: "Rio de Janeiro, RJ", price: "R$ 4.100", type: "Baú" }
                ].map((freight, i) => (
                  <div key={i} className={`p-4 rounded-2xl border ${i === 0 ? 'border-orange-500/50 bg-orange-500/5' : 'border-white/5 bg-white/5'} flex justify-between items-center hover:bg-white/10 transition-all cursor-default`}>
                    <div className="flex gap-4 items-center">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${i === 0 ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                        <Route size={18}/>
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-white uppercase tracking-tight">{freight.from} → {freight.to}</div>
                        <div className="text-[9px] text-slate-500 font-bold uppercase">{freight.type}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-black text-orange-500">{freight.price}</div>
                      <div className="text-[8px] text-green-500 font-black uppercase tracking-tighter">Disponível</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Tab Mockup */}
              <div className="p-4 pt-2 flex justify-around border-t border-white/5 bg-slate-900">
                 <div className="w-8 h-1 bg-orange-500 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
              </div>
            </div>

            {/* Floating Badge - Posicionamento ajustado para não vazar */}
            <div className="absolute -bottom-4 -right-4 lg:right-0 bg-green-500 p-4 rounded-2xl shadow-2xl rotate-6 group-hover:rotate-0 transition-all z-20">
               <div className="flex items-center gap-2">
                 <CheckCircle2 size={18} className="text-white" />
                 <span className="text-[10px] font-black text-white uppercase tracking-widest whitespace-nowrap">Acesso Imediato</span>
               </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default ForDrivers;