import { UserPlus, Search, ShieldCheck, Zap } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Conexão Direta",
    description: "Sem atravessadores. Motoristas e empresas se conectam em um ambiente validado e seguro.",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-900/20"
  },
  {
    icon: Search,
    title: "Inteligência de Carga",
    description: "Nosso ecossistema filtra as melhores oportunidades para o seu tipo de veículo e rota atual.",
    color: "text-orange-500 dark:text-orange-400",
    bg: "bg-orange-50 dark:bg-orange-900/20"
  },
  {
    icon: ShieldCheck,
    title: "Segurança Jurídica",
    description: "Documentação digital, histórico de pontualidade e negociações transparentes para ambas as partes.",
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-50 dark:bg-green-900/20"
  },
  {
    icon: Zap,
    title: "Agilidade no Fluxo",
    description: "Do anúncio ao carregamento em tempo recorde. Tecnologia focada na velocidade do trecho.",
    color: "text-slate-900 dark:text-white",
    bg: "bg-slate-100 dark:bg-slate-800"
  },
];

const HowItWorks = () => {
  return (
    <section id="como-funciona" className="py-24 bg-white dark:bg-slate-950 transition-colors">
      <div className="container mx-auto px-4">
        
        {/* Header da Seção com Badge Radar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-8">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
              <h5 className="text-[11px] font-[1000] text-slate-900 dark:text-white uppercase tracking-[0.4em]">
                Ecossistema Ativo <span className="text-orange-500">Chama Frete</span>
              </h5>
            </div>

            <h2 className="text-4xl md:text-6xl font-[1000] text-slate-900 dark:text-white tracking-tighter italic uppercase leading-[0.9]">
              Muito além de um <br />
              <span className="text-[#1f4ead] dark:text-blue-500">aplicativo de fretes.</span>
            </h2>
          </div>
          <div className="max-w-sm">
            <p className="text-slate-500 dark:text-slate-400 font-bold leading-relaxed border-l-2 border-slate-100 dark:border-slate-800 pl-6">
              Integramos tecnologia de ponta com a realidade de quem vive na estrada, eliminando a burocracia e acelerando o fechamento de cargas.
            </p>
          </div>
        </div>

        {/* Grid de Passos */}
        <div className="grid md:grid-cols-4 gap-12 relative">
          {/* Linha Decorativa Desktop */}
          <div className="hidden md:block absolute top-12 left-0 w-full h-[1px] bg-slate-100 dark:bg-slate-800 z-0" />
          
          {steps.map((step, index) => (
            <div key={index} className="relative group z-10">
              <div className="mb-10 relative">
                {/* Número Gigante de Fundo */}
                <span className="absolute -top-6 -left-4 text-8xl font-black text-slate-50 dark:text-slate-900 group-hover:text-blue-50 dark:group-hover:text-[#1f4ead]/10 transition-colors z-0 select-none">
                  0{index + 1}
                </span>
                
                {/* Ícone Container */}
                <div className={`w-20 h-20 ${step.bg} ${step.color} rounded-[2rem] flex items-center justify-center relative z-10 shadow-sm border border-white dark:border-slate-800 transition-all duration-500 group-hover:-translate-y-3 group-hover:rotate-6 group-hover:shadow-xl`}>
                  <step.icon size={36} strokeWidth={2.5} />
                </div>
              </div>

              <div className="relative">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 uppercase italic tracking-tighter">
                  {step.title}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">
                  {step.description}
                </p>
              </div>
              
              {/* Indicador de Progresso Minimalista (Preenchimento no Hover) */}
              <div className="mt-8 h-1 w-full bg-slate-50 dark:bg-slate-900 rounded-full overflow-hidden">
                <div className="h-full bg-[#1f4ead] w-0 group-hover:w-full transition-all duration-700 ease-in-out" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;