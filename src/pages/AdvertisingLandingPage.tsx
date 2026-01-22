import React, { useState, useEffect } from 'react';
import { 
  Check, Trophy, Crown, Star, ArrowRight, Loader2, Sparkles, 
  Send, CheckCircle, MessageSquare, Users, BarChart3, Target, 
  Zap, ShieldCheck, MapPin, Smartphone, MousePointer2 
} from 'lucide-react';
import Header from '../components/shared/Header';
import Footer from '../components/shared/Footer';
import { api } from '../api/api';

const AdvertisingLandingPage = () => {
  // Estados de Plano e Ciclo
  const [cycle, setCycle] = useState<'monthly' | 'quarterly' | 'semiannual' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState('Prata');
  const [loading, setLoading] = useState(false);
  const [fetchingPlans, setFetchingPlans] = useState(true);
  const [plans, setPlans] = useState<any>(null);

  // Estado do Formulário B2B
  const [leadStatus, setLeadStatus] = useState<'idle' | 'sending' | 'success'>('idle');

  const planDetails: any = {
    Bronze: { 
        icon: <Star />, 
        desc: 'Visibilidade Lateral', 
        features: ['Banner fixo em todas as páginas', 'Link direto para seu WhatsApp', 'Ideal para serviços locais e regionais', 'Relatório de visualizações mensal'], 
        color: 'text-orange-400' 
    },
    Prata: { 
        icon: <Trophy />, 
        desc: 'Ouro da Conversão', 
        features: ['Banner horizontal entre os fretes', 'Aparece no momento da decisão', 'Prioridade de carregamento', 'Segmentação por estado/região'], 
        popular: true, 
        color: 'text-blue-500' 
    },
    Ouro: { 
        icon: <Crown />, 
        desc: 'Autoridade Máxima', 
        features: ['Domínio total: Home + Lista + Sidebar', 'Selo de Parceiro Verificado', 'Destaque em notificações push', 'Suporte VIP e Gerente de Conta'], 
        color: 'text-yellow-500' 
    }
  };

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await api.get('?endpoint=get-advertising-plans');
        setPlans(response.data);
      } catch (error) { 
        console.error("Erro ao carregar planos:", error); 
      } finally { 
        setFetchingPlans(false); 
      }
    };
    fetchPlans();
  }, []);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const planId = plans[selectedPlan].ids[cycle];
      const response = await api.post('?endpoint=process-checkout', { plan_id: planId });
      if (response.data?.checkout_url) {
        window.location.href = response.data.checkout_url;
      }
    } catch (error) { 
      alert("Erro ao iniciar o processo de pagamento."); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleLeadSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLeadStatus('sending');
    
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const company = formData.get('company') as string;
    const whatsapp = formData.get('whatsapp') as string;
    const message = formData.get('message') as string;

    try {
      // Mapeamento exato com as colunas do seu Banco de Dados
      await api.post('?endpoint=portal-request', {
        type: 'advertising_lead',
        title: `${name} | ${company}`, 
        contact_info: whatsapp,       
        description: message,          
        notes: `Empresa: ${company} | Lead vindo da Landing Page de Anúncios` 
      });
      
      setLeadStatus('success');
    } catch (error) {
      console.error("Erro ao enviar contato:", error);
      alert("Erro ao enviar contato. Verifique sua conexão.");
      setLeadStatus('idle');
    }
  };

  if (fetchingPlans) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Header />

      {/* 1. HERO: Posicionamento como Ecossistema */}
      <section className="pt-40 pb-24 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50 via-white to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-6xl md:text-9xl font-[1000] tracking-tighter leading-[0.8] mb-8 uppercase italic">
              Sua marca conectada ao <br/><span className="text-blue-600">Ecossistema do Transporte</span>
            </h1>
            <p className="text-2xl text-slate-500 font-bold mb-12 max-w-3xl mx-auto leading-tight italic">
              Apareça para motoristas, frotistas e tomadores de decisão que utilizam nossa inteligência logística todos os dias.
            </p>
            
            <div className="flex flex-wrap justify-center gap-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                <span className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100"><Check size={14} className="text-blue-600"/> Motoristas Autônomos</span>
                <span className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100"><Check size={14} className="text-blue-600"/> Gestores de Frota</span>
                <span className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100"><Check size={14} className="text-blue-600"/> Agenciadores de Carga</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PROVA SOCIAL & MÉTRICAS REALISTAS */}
      <section className="py-12 border-y border-slate-100 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { v: '500k+', l: 'Acessos Mensais' },
              { v: '45.000', l: 'Motoristas Ativos' },
              { v: '1.200+', l: 'Cidades Cobertas' },
              { v: '24h', l: 'Exposição Contínua' }
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl font-[1000] text-blue-600 tracking-tighter leading-none mb-2">{s.v}</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. ONDE OS ANÚNCIOS APARECEM (Mockup Visual) */}
      <section className="py-24 overflow-hidden">
        <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
                <div className="relative">
                    <div className="bg-slate-200 rounded-[3rem] aspect-video w-full border-8 border-slate-900 overflow-hidden shadow-2xl relative">
                        <div className="absolute top-4 left-4 right-4 h-8 bg-white rounded-lg opacity-50" />
                        {/* Banner Lateral */}
                        <div className="absolute top-16 left-4 w-1/4 bottom-4 bg-orange-500/20 border-2 border-dashed border-orange-500 rounded-lg flex items-center justify-center p-4 text-center">
                            <span className="text-[8px] font-black uppercase text-orange-600">Banner Sidebar</span>
                        </div>
                        {/* Banner Feed */}
                        <div className="absolute top-16 right-4 left-[30%] h-32 bg-blue-500/20 border-2 border-dashed border-blue-500 rounded-lg flex items-center justify-center p-4 text-center">
                            <span className="text-[10px] font-black uppercase text-blue-600">Banner Horizontal (Feed)</span>
                        </div>
                    </div>
                </div>
                <div>
                    <h2 className="text-5xl font-[1000] uppercase italic tracking-tighter mb-8 leading-[0.9]">MÁXIMA VISIBILIDADE EM <span className="text-blue-600">PONTOS DE DECISÃO</span></h2>
                    <div className="space-y-8">
                        <div className="flex gap-6 items-start">
                            <Smartphone className="shrink-0 text-blue-600" size={32} />
                            <div>
                                <h4 className="text-xl font-black uppercase italic">Mobile First</h4>
                                <p className="font-bold text-slate-500 italic">Otimizado para o motorista que está na estrada e usa o celular como ferramenta de trabalho.</p>
                            </div>
                        </div>
                        <div className="flex gap-6 items-start">
                            <MousePointer2 className="shrink-0 text-blue-600" size={32} />
                            <div>
                                <h4 className="text-xl font-black uppercase italic">Clique Direto</h4>
                                <p className="font-bold text-slate-500 italic">Conversão imediata. O anúncio leva o interessado direto para o seu WhatsApp ou Canal de Vendas.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* 4. PLANOS E PREÇOS (Com todos os Ciclos) */}
      <section id="pricing" className="py-24 bg-slate-900 rounded-[5rem] mx-4 mb-12 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-5xl md:text-7xl font-[1000] uppercase italic mb-12 tracking-tighter italic">ESCOLHA SEU <span className="text-blue-500">IMPACTO</span></h2>
          
          <div className="inline-flex flex-wrap justify-center bg-white/5 p-2 rounded-[2.5rem] border border-white/10 mb-20">
            {[
              { id: 'monthly', l: 'Mensal' },
              { id: 'quarterly', l: 'Trimestral' },
              { id: 'semiannual', l: 'Semestral' },
              { id: 'yearly', l: 'Anual (PROMO)' }
            ].map((c) => (
              <button 
                key={c.id} 
                onClick={() => setCycle(c.id as any)} 
                className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    cycle === c.id ? 'bg-blue-600 text-white shadow-xl scale-105' : 'text-slate-400 hover:text-white'
                }`}
              >
                {c.l}
              </button>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {Object.entries(plans).map(([name, data]: [string, any]) => {
              const isSelected = selectedPlan === name;
              const detail = planDetails[name];
              return (
                <div 
                  key={name} 
                  onClick={() => setSelectedPlan(name)} 
                  className={`relative p-12 rounded-[4rem] transition-all duration-500 cursor-pointer border-4 flex flex-col ${
                    isSelected ? 'bg-white text-slate-900 scale-105 border-blue-600 shadow-2xl shadow-blue-500/20' : 'bg-white/5 text-white border-transparent'
                  }`}
                >
                  {detail.popular && (
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-8 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">
                        Mais Procurado
                    </span>
                  )}
                  
                  <div className={`text-5xl mb-8 ${detail.color}`}>{detail.icon}</div>
                  <h3 className="text-4xl font-[1000] uppercase italic mb-2">{name}</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-8">{detail.desc}</p>
                  
                  <div className="mb-10 text-left bg-slate-500/5 p-8 rounded-3xl">
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-black opacity-40 italic">R$</span>
                      <span className="text-6xl font-[1000] tracking-tighter leading-none">
                        {data.prices[cycle]?.toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold uppercase opacity-40">Ciclo {cycle}</span>
                  </div>

                  <ul className="space-y-5 text-left mb-12 flex-grow">
                    {detail.features.map((f: string) => (
                      <li key={f} className="flex items-start gap-3 text-xs font-black uppercase italic leading-tight">
                        <CheckCircle size={18} className="text-blue-500 shrink-0" strokeWidth={3} /> {f}
                      </li>
                    ))}
                  </ul>

                  <button 
                    onClick={(e) => { e.stopPropagation(); handleCheckout(); }} 
                    disabled={loading} 
                    className={`w-full py-8 rounded-[2.2rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all ${
                        isSelected ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    {loading ? <Loader2 className="animate-spin" /> : <>Contratar Agora <ArrowRight size={20}/></>}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. FORMULÁRIO CORPORATIVO: Foco em Estudo de Viabilidade */}
      <section className="py-24 container mx-auto px-4">
        <div className="bg-slate-900 rounded-[5rem] p-12 md:p-20 relative overflow-hidden border-b-8 border-orange-500 shadow-2xl">
            <div className="grid lg:grid-cols-2 gap-20 items-center relative z-10">
                <div className="text-white">
                    <div className="inline-flex items-center gap-2 bg-orange-500 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
                        Projetos Corporativos B2B
                    </div>
                    <h2 className="text-5xl font-[1000] uppercase italic mb-8 leading-[0.9] tracking-tighter">
                        ESTRATÉGIAS DE <br/><span className="text-orange-500">ALTA ESCALA</span>
                    </h2>
                    <p className="text-lg font-bold text-slate-400 italic mb-10 leading-relaxed">
                        Redes de postos, seguradoras e marcas nacionais: desenvolvemos projetos personalizados de integração e visibilidade para grandes demandas.
                    </p>
                    <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 inline-flex">
                        <ShieldCheck className="text-orange-500" size={24} />
                        <div className="text-[10px] font-black uppercase tracking-widest">Análise de viabilidade comercial em até 24h.</div>
                    </div>
                </div>
                
                <div className="bg-white/5 backdrop-blur-md p-10 rounded-[4rem] border border-white/10">
                    {leadStatus === 'success' ? (
                        <div className="text-center py-10">
                            <CheckCircle size={60} className="text-orange-500 mx-auto mb-6" />
                            <h3 className="text-2xl font-black text-white uppercase italic">Solicitação Enviada!</h3>
                            <p className="text-slate-400 mt-2 font-bold italic">Nossa equipe entrará em contato em breve.</p>
                        </div>
                    ) : (
                        <>
                            <h3 className="text-2xl font-[1000] uppercase italic mb-8 text-white text-center leading-none">
                                Solicitar Atendimento <br/><span className="text-orange-500">Especializado</span>
                            </h3>
                            <form className="space-y-4" onSubmit={handleLeadSubmit}>
                              <input 
                                required 
                                name="name" 
                                placeholder="Responsável pela Marca" 
                                className="w-full p-6 bg-white/10 rounded-3xl border border-white/10 focus:border-orange-500 outline-none text-white font-bold transition-all placeholder:text-slate-500" 
                              />
                              <input 
                                required 
                                name="company"
                                placeholder="Empresa / Razão Social" 
                                className="w-full p-6 bg-white/10 rounded-3xl border border-white/10 focus:border-orange-500 outline-none text-white font-bold transition-all placeholder:text-slate-500" 
                              />
                              <input 
                                required 
                                name="whatsapp" 
                                placeholder="WhatsApp Profissional" 
                                className="w-full p-6 bg-white/10 rounded-3xl border border-white/10 focus:border-orange-500 outline-none text-white font-bold transition-all placeholder:text-slate-500" 
                              />
                              <textarea 
                                required
                                name="message" 
                                placeholder="Conte-nos brevemente seu objetivo comercial..." 
                                className="w-full p-6 bg-white/10 rounded-3xl border border-white/10 focus:border-orange-500 outline-none text-white font-bold h-32 resize-none transition-all placeholder:text-slate-500" 
                              />
                              <button 
                                  disabled={leadStatus === 'sending'} 
                                  type="submit" 
                                  className="w-full py-8 bg-orange-500 text-white rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-sm hover:bg-white hover:text-slate-900 transition-all shadow-2xl flex items-center justify-center gap-3"
                              >
                                  {leadStatus === 'sending' ? <Loader2 className="animate-spin" /> : "Iniciar Estudo de Viabilidade"}
                              </button>
                          </form>
                        </>
                    )}
                </div>
            </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AdvertisingLandingPage;