import { UserPlus, Search, Handshake, Truck } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Crie seu Perfil",
    description: "Cadastre-se como motorista ou empresa e valide seus documentos em minutos.",
    color: "text-blue-600",
    bg: "bg-blue-50"
  },
  {
    icon: Search,
    title: "Busque Oportunidades",
    description: "Filtre por região, tipo de veículo ou valor. Ative alertas de rotas favoritas.",
    color: "text-orange-500",
    bg: "bg-orange-50"
  },
  {
    icon: Handshake,
    title: "Feche o Acordo",
    description: "Combine detalhes pelo chat e aceite o frete com segurança jurídica.",
    color: "text-green-600",
    bg: "bg-green-50"
  },
  {
    icon: Truck,
    title: "Siga viagem",
    description: "Inicie o transporte, monitore a entrega e receba o pagamento garantido.",
    color: "text-slate-900",
    bg: "bg-slate-100"
  },
];

const HowItWorks = () => {
  return (
    <section id="como-funciona" className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-2xl">
            <h5 className="text-[11px] font-bold text-orange-500 uppercase tracking-[0.2em] mb-4">// Processo Simples</h5>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
              A tecnologia que move o <br />
              <span className="text-slate-400 font-medium">transporte de cargas.</span>
            </h2>
          </div>
          <p className="text-slate-500 font-medium max-w-xs">
            Desenhamos um fluxo pensado na agilidade de quem está no trecho.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8 relative">
          {steps.map((step, index) => (
            <div key={index} className="relative group">
              <div className="mb-8 relative">
                <span className="absolute -top-4 -left-2 text-7xl font-black text-slate-100 group-hover:text-orange-100 transition-colors z-0">
                  0{index + 1}
                </span>
                <div className={`w-16 h-16 ${step.bg} ${step.color} rounded-2xl flex items-center justify-center relative z-10 shadow-sm transition-transform group-hover:-translate-y-2`}>
                  <step.icon size={32} />
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;