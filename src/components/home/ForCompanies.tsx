import { Shield, BarChart3, Users } from "lucide-react";

const ForCompanies = () => {
  return (
    <section id="empresas" className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <h2 className="text-5xl font-black tracking-tight text-slate-900">
            A torre de controle da sua <span className="text-orange-500 italic">logística.</span>
          </h2>
          <p className="text-slate-500 font-medium">
            Gerencie centenas de cargas simultaneamente com inteligência de dados e rastreamento em tempo real.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
           {/* Bloco 1: Gestão */}
           <div className="p-10 bg-slate-50 rounded-[3rem] border border-slate-100 flex flex-col justify-between hover:border-orange-200 transition-all">
              <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-orange-500 mb-8">
                <Users size={28} />
              </div>
              <div>
                <h3 className="text-2xl font-black mb-4 tracking-tight">Frota Verificada</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">
                  Acesse uma base de dados com milhares de motoristas com histórico checado e reputação comprovada.
                </p>
              </div>
           </div>

           {/* Bloco 2: Dashboard (Destaque) */}
           <div className="p-10 bg-slate-900 text-white rounded-[3rem] flex flex-col justify-between md:scale-105 shadow-2xl shadow-slate-200">
              <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center text-white mb-8">
                <BarChart3 size={28} />
              </div>
              <div>
                <h3 className="text-2xl font-black mb-4 tracking-tight text-orange-500 italic">Métrica em Tempo Real</h3>
                <p className="text-slate-400 text-sm font-medium leading-relaxed">
                  Dashboards personalizados para medir performance, custos por KM e eficiência operacional.
                </p>
              </div>
           </div>

           {/* Bloco 3: Segurança */}
           <div className="p-10 bg-slate-50 rounded-[3rem] border border-slate-100 flex flex-col justify-between hover:border-orange-200 transition-all">
              <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-orange-500 mb-8">
                <Shield size={28} />
              </div>
              <div>
                <h3 className="text-2xl font-black mb-4 tracking-tight">Seguro Integrado</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">
                  Monitoramento de carga e integração direta com as principais seguradoras do mercado.
                </p>
              </div>
           </div>
        </div>
      </div>
    </section>
  );
}

export default ForCompanies;