import { ClipboardList, MessageSquare, ShieldCheck, Zap, ArrowRight, Building2, CheckCircle2, Search, BarChart3 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { useNavigate } from "react-router-dom";

const ForCompanies = () => {
  const navigate = useNavigate();

  return (
    <section id="empresas" className="py-24 bg-white dark:bg-slate-950 transition-colors duration-500 overflow-hidden">
      <div className="container mx-auto px-4">
        
        {/* Header de Autoridade */}
        <div className="max-w-4xl mb-20">
          <div className="flex items-center gap-3 text-[#1f4ead] dark:text-blue-500 mb-6">
            <div className="h-[2px] w-12 bg-[#1f4ead] dark:bg-blue-500" />
            <span className="text-xs font-[1000] uppercase tracking-[0.3em]">B2B Logística Inteligente</span>
          </div>
          <h2 className="text-6xl md:text-8xl font-[1000] tracking-tighter text-slate-900 dark:text-white leading-[0.8] uppercase italic mb-8">
            CONTROLE A <br /> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1f4ead] to-blue-400">OPERAÇÃO.</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xl font-medium max-w-2xl leading-relaxed">
            Centralize suas cotações, elimine processos manuais e conecte-se com motoristas qualificados em uma única interface.
          </p>
        </div>

        {/* Grid Estilo "SaaS" */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Módulo 01: Cotações (O motor do novo sistema) */}
          <div className="lg:col-span-2 group relative">
            <div className="absolute inset-0 bg-blue-600/5 dark:bg-blue-500/5 rounded-[2.5rem] -rotate-1 group-hover:rotate-0 transition-transform duration-500" />
            <div className="relative h-full bg-slate-900 dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-800 flex flex-col md:flex-row gap-10 items-center">
              <div className="flex-1 space-y-6">
                <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-500/20">
                  Módulo de Inteligência
                </div>
                <h3 className="text-4xl font-black text-white uppercase italic leading-none">Central de <br /> Cotações</h3>
                <p className="text-slate-400 font-medium">
                  Chega de planilhas. Receba lances de motoristas em tempo real, compare preços e prazos, e feche o melhor negócio com um clique.
                </p>
                <div className="space-y-3">
                  {['Ranking de Propostas', 'Filtro por Tipo de Veículo', 'Chat de Negociação Integrado'].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-slate-300">
                      <CheckCircle2 size={16} className="text-blue-500" />
                      <span className="text-xs font-bold uppercase tracking-tight">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Representação Visual da Lista de Cotação */}
              <div className="w-full md:w-64 space-y-3">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="bg-slate-800/50 border border-white/5 p-4 rounded-2xl flex justify-between items-center group-hover:translate-x-2 transition-transform duration-500" style={{ transitionDelay: `${item * 100}ms` }}>
                    <div className="space-y-1">
                      <div className="h-2 w-16 bg-blue-500/40 rounded" />
                      <div className="h-1.5 w-12 bg-slate-600 rounded" />
                    </div>
                    <div className="text-blue-400 font-black text-xs">R$ 4.200</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Módulo 02: Rede WhatsApp (Onde a mágica acontece) */}
          <div className="bg-[#25D366]/10 dark:bg-green-500/5 border border-[#25D366]/20 rounded-[2.5rem] p-10 flex flex-col justify-between group hover:bg-[#25D366] transition-all duration-500">
            <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center text-[#25D366] mb-10 shadow-xl group-hover:scale-110 transition-transform">
              <MessageSquare size={32} />
            </div>
            <div>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase italic leading-none mb-4 group-hover:text-white transition-colors">Integração <br /> WhatsApp</h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium group-hover:text-white/80 transition-colors">
                Anuncie sua carga automaticamente em nossa rede de grupos regionais com mais de 50 mil motoristas ativos.
              </p>
            </div>
          </div>

          {/* Módulo 03: Filtro de Segurança */}
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-10 flex flex-col justify-between hover:shadow-xl transition-all">
            <ShieldCheck size={48} className="text-[#1f4ead] mb-8" />
            <div>
              <h4 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic mb-2">Segurança de Acesso</h4>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                Seus dados e fretes protegidos. Apenas motoristas com perfil validado e logado acessam as informações de contato.
              </p>
            </div>
          </div>

          {/* Módulo 04: Base de Dados */}
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-10 flex flex-col justify-between hover:shadow-xl transition-all">
            <BarChart3 size={48} className="text-orange-500 mb-8" />
            <div>
              <h4 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic mb-2">Inteligência de Mercado</h4>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                Visualize a oferta de veículos por região e tome decisões baseadas em dados reais de disponibilidade.
              </p>
            </div>
          </div>

          {/* Módulo 05: Cadastro (CTA) */}
          <div className="bg-[#1f4ead] rounded-[2.5rem] p-10 flex flex-col justify-center items-center text-center group cursor-pointer" onClick={() => navigate('/auth?type=company')}>
            <h3 className="text-3xl font-[1000] text-white uppercase italic leading-none mb-6">Comece agora a anunciar</h3>
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center text-white group-hover:scale-125 transition-all duration-500">
               <ArrowRight size={32} />
            </div>
            <span className="mt-6 text-white/60 text-[10px] font-black uppercase tracking-[0.2em]">Crie sua conta corporativa</span>
          </div>

        </div>
      </div>
    </section>
  );
}

export default ForCompanies;