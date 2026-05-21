import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Check, Eye, MousePointer2, BarChart3, Target, 
  ArrowRight, TrendingUp, Shield, ChevronRight
} from 'lucide-react';
import Header from '../components/shared/Header';
import Footer from '../components/shared/Footer';
import { BusinessModal } from '../components/modals/BusinessModal';
import { useAdPositions } from '../hooks/useAdPositions';

const AdvertisingLandingPage = () => {
  const navigate = useNavigate();
  const [isBusinessModalOpen, setIsBusinessModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<'contact' | 'viewPlans' | null>(null);
  const { positions, loading } = useAdPositions();

  const handleRegister = () => {
    window.location.href = '/register?type=advertiser';
  };

  const handleViewPricing = () => {
    setModalAction('viewPlans');
    setIsBusinessModalOpen(true);
  };

  const benefits = [
    { icon: Eye, title: 'Visibilidade Exclusiva', desc: 'Destaque-se da concorrência sendo o primeiro a ser visto.' },
    { icon: MousePointer2, title: 'Tráfego Qualificado', desc: 'Pessoas interessadas em fretes e produtos, não apenas visitantes casuais.' },
    { icon: TrendingUp, title: 'Crescimento Real', desc: 'Acompanhe o aumento de visualizações e contatos a cada dia.' },
    { icon: Shield, title: 'Exposição Segura', desc: 'Seus dados protegidos enquanto sua marca ganha destaque.' },
  ];

  const positionDescriptions: Record<string, { desc: string; badge: string; mockup: string }> = {
    sidebar: { desc: 'Exposição lateral permanente nas listagens', badge: 'Alta Visibilidade', mockup: 'sidebar' },
    freight_list: { desc: 'Banner no topo das listagens de fretes', badge: 'Alta Exposição', mockup: 'feed' },
    spotlight: { desc: 'Posição premium na página de detalhes', badge: 'Premium', mockup: 'details' },
    footer: { desc: 'Visibilidade na parte inferior das páginas', badge: 'Constante', mockup: 'footer' },
    infeed_wide: { desc: 'Banner largo entre os resultados de busca', badge: 'Alta Conversão', mockup: 'feed' },
    marketplace_list: { desc: 'Anúncio entre os classificados do marketplace', badge: 'Segmentado', mockup: 'feed' },
    groups_list: { desc: 'Presença na lista de grupos WhatsApp', badge: 'Acessível', mockup: 'feed' },
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Header />

      {/* HERO */}
      <section className="pt-32 pb-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500 rounded-full blur-[150px]" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-orange-500 rounded-full blur-[150px]" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-orange-500/20 text-orange-400 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-8">
              <Target size={14} /> Marketing para Transporte
            </div>

            <h1 className="text-5xl md:text-7xl font-[1000] tracking-tighter leading-[0.9] mb-8 uppercase italic">
              Seja <span className="text-orange-500">Visto</span><br/>
              no Transporte
            </h1>
            
            <p className="text-xl text-slate-300 font-bold mb-12 max-w-3xl mx-auto leading-relaxed">
              Anuncie sua empresa, produtos ou serviços para milhares de motoristas e transportadoras. 
              Posicionamento estratégico onde a decisão acontece.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <button 
                onClick={handleRegister}
                className="px-10 py-5 bg-orange-500 text-white rounded-xl font-black uppercase text-sm tracking-wider hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/30 flex items-center gap-3"
              >
                Cadastrar <ArrowRight size={18} />
              </button>
              <button 
                onClick={() => { setModalAction('contact'); setIsBusinessModalOpen(true); }}
                className="px-10 py-5 bg-white/10 border-2 border-white/20 text-white rounded-xl font-black uppercase text-sm tracking-wider hover:bg-white/20 transition-all flex items-center gap-3"
              >
                Falar com Equipe <ChevronRight size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              <div className="flex items-center gap-3 justify-center">
                <Check size={18} className="text-orange-500" />
                <span className="font-bold text-sm text-slate-200">Anúncios direcionados</span>
              </div>
              <div className="flex items-center gap-3 justify-center">
                <Check size={18} className="text-orange-500" />
                <span className="font-bold text-sm text-slate-200">Relatórios em tempo real</span>
              </div>
              <div className="flex items-center gap-3 justify-center">
                <Check size={18} className="text-orange-500" />
                <span className="font-bold text-sm text-slate-200">WhatsApp direto</span>
              </div>
              <div className="flex items-center gap-3 justify-center">
                <Check size={18} className="text-orange-500" />
                <span className="font-bold text-sm text-slate-200">Suporte dedicado</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFÍCIOS */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-[1000] uppercase italic tracking-tighter mb-3">
              Por que <span className="text-orange-500">Anunciar</span>?
            </h2>
            <p className="text-slate-500 font-bold text-sm max-w-xl mx-auto">
              Resultados reais para empresas que querem se destacar no mercado de transporte.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
            {benefits.map((benefit, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all text-center">
                <div className="w-14 h-14 bg-orange-100 dark:bg-orange-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <benefit.icon size={28} className="text-orange-500" />
                </div>
                <h3 className="text-base font-black uppercase italic mb-2">{benefit.title}</h3>
                <p className="text-slate-500 text-xs font-bold leading-relaxed">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* POSIÇÕES DE ANÚNCIO */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-[1000] uppercase italic tracking-tighter mb-3">
              Onde seu anúncio <span className="text-orange-500">Aparece</span>?
            </h2>
            <p className="text-slate-500 font-bold text-sm">
              Posicionamentos estratégicos nas páginas mais visitadas da plataforma.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {loading ? (
              <div className="col-span-4 text-center py-8 text-slate-400">Carregando posições...</div>
            ) : (
              positions
                .filter(p => !['header', 'popup'].includes(p.feature_key))
                .slice(0, 4)
                .map((pos, i) => {
                  const info = positionDescriptions[pos.feature_key] || { desc: pos.description || '', badge: 'Visível', mockup: 'footer' };
                  return (
                    <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-lg transition-all">
                      <div className="flex flex-col items-center text-center">
                        <div className="mb-4">
                          {info.mockup === 'sidebar' && (
                            <div className="w-20 h-28 bg-slate-100 dark:bg-slate-700 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 flex flex-col items-center justify-center p-2">
                              <div className="w-6 h-8 bg-orange-500/30 rounded mb-1" />
                              <div className="w-10 h-1.5 bg-slate-300 dark:bg-slate-600 rounded mb-1" />
                              <div className="w-8 h-1.5 bg-slate-200 dark:bg-slate-700 rounded" />
                            </div>
                          )}
                          {info.mockup === 'feed' && (
                            <div className="w-20 h-28 bg-slate-100 dark:bg-slate-700 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 flex flex-col items-center justify-center p-2 gap-1">
                              <div className="w-14 h-5 bg-slate-200 dark:bg-slate-600 rounded" />
                              <div className="w-14 h-5 bg-orange-500/30 rounded border border-orange-400" />
                              <div className="w-14 h-5 bg-slate-200 dark:bg-slate-600 rounded" />
                            </div>
                          )}
                          {info.mockup === 'details' && (
                            <div className="w-20 h-28 bg-slate-100 dark:bg-slate-700 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 flex flex-col items-center justify-center p-2 gap-1">
                              <div className="w-14 h-6 bg-slate-200 dark:bg-slate-600 rounded" />
                              <div className="w-12 h-3 bg-orange-500/40 rounded" />
                              <div className="w-10 h-1.5 bg-slate-200 dark:bg-slate-700 rounded" />
                            </div>
                          )}
                          {info.mockup === 'footer' && (
                            <div className="w-20 h-28 bg-slate-100 dark:bg-slate-700 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 flex flex-col items-center justify-center p-2">
                              <div className="w-16 h-3 bg-slate-200 dark:bg-slate-600 rounded mb-1" />
                              <div className="w-12 h-2 bg-slate-200 dark:bg-slate-700 rounded mb-1" />
                              <div className="w-10 h-2 bg-orange-500/30 rounded" />
                            </div>
                          )}
                        </div>
                        <h3 className="text-lg font-black uppercase italic mb-1">{pos.feature_name}</h3>
                        <span className="text-[9px] font-black uppercase bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full mb-2">{info.badge}</span>
                        <p className="text-slate-500 text-xs font-bold leading-relaxed">{info.desc}</p>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-20 bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-[1000] uppercase italic tracking-tighter mb-4 text-white">
              Pronto para ser <span className="text-orange-500">visto</span>?
            </h2>
            <p className="text-slate-400 font-bold text-lg mb-10">
              Cadastre-se para conhecer os planos e começar a anunciar.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button 
                onClick={handleRegister}
                className="px-12 py-6 bg-orange-500 text-white rounded-xl font-black uppercase text-sm tracking-wider hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20 flex items-center justify-center gap-3 flex-1 max-w-sm mx-auto sm:mx-0"
              >
                Cadastrar <ArrowRight size={18} />
              </button>
              <button 
                onClick={handleViewPricing}
                className="px-12 py-6 bg-white/10 border-2 border-white/20 text-white rounded-xl font-black uppercase text-sm tracking-wider hover:bg-white/20 transition-all flex items-center justify-center gap-3 flex-1 max-w-sm mx-auto sm:mx-0"
              >
                Ver Planos <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <BusinessModal
        isOpen={isBusinessModalOpen}
        onClose={() => { setIsBusinessModalOpen(false); setModalAction(null); }}
        onSuccess={() => { if (modalAction === 'viewPlans') navigate('/publicidade'); }}
        initialSubject="Publicidade"
      />
    </div>
  );
};

export default AdvertisingLandingPage;
