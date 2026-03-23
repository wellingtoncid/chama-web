import React, { useState, useEffect } from 'react';
import { 
  Check, Trophy, Crown, Star, ArrowRight, Loader2, 
  CheckCircle, ShieldCheck, Smartphone, MousePointer2, Lock, AlertCircle
} from 'lucide-react';
import Header from '../components/shared/Header';
import Footer from '../components/shared/Footer';
import { api } from '../api/api';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface Plan {
  id: number;
  name: string;
  slug: string;
  type: string;
  description: string;
  features: string[];
  is_highlighted: boolean;
  prices: {
    monthly: number;
    quarterly: number | null;
    semiannual: number | null;
    yearly: number | null;
  };
  discounts: {
    quarterly: number;
    semiannual: number;
    yearly: number;
  };
}

const AdvertisingLandingPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Estados
  const [cycle, setCycle] = useState<'monthly' | 'quarterly' | 'semiannual' | 'yearly'>('monthly');
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingPlans, setFetchingPlans] = useState(true);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // Estado do Formulário B2B
  const [leadStatus, setLeadStatus] = useState<'idle' | 'sending' | 'success'>('idle');

  // Verificar login
  const token = localStorage.getItem("@ChamaFrete:token");
  const user = JSON.parse(localStorage.getItem("@ChamaFrete:user") || "null");
  const isLogged = !!token && !!user;

  // Verificar se veio de retorno de pagamento
  const paymentStatus = searchParams.get('payment');
  const pendingPlanId = searchParams.get('plan_id');
  const pendingCycle = searchParams.get('cycle');

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await api.get('get-advertising-plans');
        const data = response.data?.data || response.data || [];
        setPlans(Array.isArray(data) ? data : []);
        
        // Se veio com parâmetro de plano, selecionar automaticamente
        if (pendingPlanId) {
          setSelectedPlanId(parseInt(pendingPlanId));
          setShowConfirmation(true);
          if (pendingCycle) {
            setCycle(pendingCycle as any);
          }
        }
      } catch (error) { 
        console.error("Erro ao carregar planos:", error); 
      } finally { 
        setFetchingPlans(false); 
      }
    };
    fetchPlans();
  }, [pendingPlanId, pendingCycle]);

  // Selecionar primeiro plano destacado ao carregar
  useEffect(() => {
    if (plans.length > 0 && !selectedPlanId) {
      const highlighted = plans.find(p => p.is_highlighted);
      if (highlighted) {
        setSelectedPlanId(highlighted.id);
      }
    }
  }, [plans, selectedPlanId]);

  const selectedPlan = plans.find(p => p.id === selectedPlanId);

  const handleSelectPlan = (planId: number) => {
    if (!isLogged) {
      // Redirecionar para cadastro com parâmetros
      const params = new URLSearchParams({
        redirect: '/anuncie',
        plan_id: planId.toString(),
        cycle: cycle
      });
      navigate(`/cadastro?${params.toString()}`);
      return;
    }
    setSelectedPlanId(planId);
    setShowConfirmation(true);
  };

  const handleCheckout = async () => {
    if (!isLogged || !selectedPlanId || !user?.id) {
      alert("Você precisa estar logado para continuar.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('process-checkout', { 
        plan_id: selectedPlanId,
        billing_cycle: cycle,
        user_id: user.id
      });
      
      if (response.data?.url) {
        window.location.href = response.data.url;
      } else if (response.data?.success === false) {
        alert(response.data.message || "Erro ao processar pagamento.");
      }
    } catch (error) { 
      console.error("Erro no checkout:", error);
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
      await api.post('portal-request', {
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

  const getPlanIcon = (planName: string) => {
    if (planName.toLowerCase().includes('bronze')) return <Star />;
    if (planName.toLowerCase().includes('prata')) return <Trophy />;
    if (planName.toLowerCase().includes('ouro')) return <Crown />;
    return <Star />;
  };

  const getPlanColor = (planName: string) => {
    if (planName.toLowerCase().includes('bronze')) return 'text-orange-400';
    if (planName.toLowerCase().includes('prata')) return 'text-blue-500';
    if (planName.toLowerCase().includes('ouro')) return 'text-yellow-500';
    return 'text-blue-500';
  };

  const formatPrice = (price: number | null | undefined) => {
    if (!price) return '0';
    return price.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  };

  if (fetchingPlans) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );

  // Mostrar resumo de confirmação se logado e com plano selecionado
  if (showConfirmation && selectedPlan && isLogged) {
    const currentPrice = selectedPlan.prices[cycle];
    const currentDiscount = selectedPlan.discounts[cycle];
    
    return (
      <div className="min-h-screen bg-white text-slate-900">
        <Header />
        
        <section className="pt-32 pb-20 px-4">
          <div className="max-w-2xl mx-auto">
            <button 
              onClick={() => setShowConfirmation(false)}
              className="mb-6 text-blue-600 hover:underline flex items-center gap-2"
            >
              ← Voltar para planos
            </button>
            
            <div className="bg-white rounded-[3rem] border-2 border-blue-600 p-10 shadow-2xl">
              <div className="text-center mb-8">
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 ${getPlanColor(selectedPlan.name)} mb-4`}>
                  {getPlanIcon(selectedPlan.name)}
                </div>
                <h2 className="text-3xl font-black uppercase italic">{selectedPlan.name}</h2>
                <p className="text-slate-500 mt-2">{selectedPlan.description}</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <span className="font-bold text-slate-600">Ciclo de Cobrança</span>
                  <span className="font-black uppercase">{cycle === 'monthly' ? 'Mensal' : cycle === 'quarterly' ? 'Trimestral' : cycle === 'semiannual' ? 'Semestral' : 'Anual'}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <span className="font-bold text-slate-600">Valor {cycle === 'monthly' ? 'Mensal' : 'Total'}</span>
                  <span className="font-black text-2xl text-blue-600">R$ {formatPrice(currentPrice)}</span>
                </div>
                {currentDiscount > 0 && (
                  <div className="flex justify-between items-center py-3 bg-green-50 -mx-10 px-10 rounded-lg">
                    <span className="font-bold text-green-700">Economia</span>
                    <span className="font-black text-green-600">{currentDiscount}% OFF</span>
                  </div>
                )}
              </div>

              <button 
                onClick={handleCheckout}
                disabled={loading}
                className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-3"
              >
                {loading ? <Loader2 className="animate-spin" /> : <>Contratar Agora <ArrowRight size={24}/></>}
              </button>
              
              <p className="text-center text-slate-400 text-xs mt-4">
                Pagamento seguro via MercadoPago
              </p>
            </div>
          </div>
        </section>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Header />

      {/* Alerta de retorno de pagamento */}
      {paymentStatus && (
        <div className={`fixed top-20 right-4 z-50 p-4 rounded-2xl shadow-2xl ${
          paymentStatus === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center gap-2">
            {paymentStatus === 'success' ? <CheckCircle /> : <AlertCircle />}
            <span className="font-bold">
              {paymentStatus === 'success' ? 'Pagamento aprovado!' : 'Pagamento pendente ou falhou'}
            </span>
          </div>
        </div>
      )}

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

      {/* 2. PROVA SOCIAL & MÉTRICAS */}
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

      {/* 3. ONDE OS ANÚNCIOS APARECEM */}
      <section className="py-24 overflow-hidden">
        <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
                <div className="relative">
                    <div className="bg-slate-200 rounded-[3rem] aspect-video w-full border-8 border-slate-900 overflow-hidden shadow-2xl relative">
                        <div className="absolute top-4 left-4 right-4 h-8 bg-white rounded-lg opacity-50" />
                        <div className="absolute top-16 left-4 w-1/4 bottom-4 bg-orange-500/20 border-2 border-dashed border-orange-500 rounded-lg flex items-center justify-center p-4 text-center">
                            <span className="text-[8px] font-black uppercase text-orange-600">Banner Sidebar</span>
                        </div>
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

      {/* 4. PLANOS E PREÇOS */}
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
            {plans.map((plan) => {
              const isSelected = selectedPlanId === plan.id;
              const price = plan.prices[cycle];
              const discount = plan.discounts[cycle];
              
              return (
                <div 
                  key={plan.id}
                  className={`relative p-12 rounded-[4rem] transition-all duration-500 cursor-pointer border-4 flex flex-col ${
                    isSelected ? 'bg-white text-slate-900 scale-105 border-blue-600 shadow-2xl shadow-blue-500/20' : 'bg-white/5 text-white border-transparent hover:bg-white/10'
                  }`}
                  onClick={() => handleSelectPlan(plan.id)}
                >
                  {plan.is_highlighted && (
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-8 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">
                        Mais Procurado
                    </span>
                  )}
                  
                  <div className={`text-5xl mb-8 ${getPlanColor(plan.name)}`}>{getPlanIcon(plan.name)}</div>
                  <h3 className="text-4xl font-[1000] uppercase italic mb-2">{plan.name}</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-8">{plan.description}</p>
                  
                  <div className="mb-10 text-left bg-slate-500/5 p-8 rounded-3xl">
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-black opacity-40 italic">R$</span>
                      <span className="text-6xl font-[1000] tracking-tighter leading-none">
                        {formatPrice(price)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] font-bold uppercase opacity-40">{cycle === 'monthly' ? 'por mês' : `por ${cycle === 'quarterly' ? '3 meses' : cycle === 'semiannual' ? '6 meses' : 'ano'}`}</span>
                      {discount > 0 && (
                        <span className="bg-green-500 text-white px-2 py-0.5 rounded-full text-[9px] font-black">-{discount}%</span>
                      )}
                    </div>
                  </div>

                  <ul className="space-y-5 text-left mb-12 flex-grow">
                    {(plan.features || []).map((feature: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-3 text-xs font-black uppercase italic leading-tight">
                        <CheckCircle size={18} className="text-blue-500 shrink-0" strokeWidth={3} /> {feature}
                      </li>
                    ))}
                  </ul>

                  <button 
                    className={`w-full py-8 rounded-[2.2rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all ${
                        isSelected ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    {!isLogged && <Lock size={16} />}
                    {isLogged ? 'Selecionar' : 'Cadastre-se para Contratar'} <ArrowRight size={20}/>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. FORMULÁRIO CORPORATIVO */}
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
                                Solicitar Atendimento <span className="text-orange-500">Especializado</span>
                            </h3>
                            <form className="space-y-4" onSubmit={handleLeadSubmit}>
                              <input required name="name" placeholder="Responsável pela Marca" className="w-full p-6 bg-white/10 rounded-3xl border border-white/10 focus:border-orange-500 outline-none text-white font-bold transition-all placeholder:text-slate-500" />
                              <input required name="company" placeholder="Empresa / Razão Social" className="w-full p-6 bg-white/10 rounded-3xl border border-white/10 focus:border-orange-500 outline-none text-white font-bold transition-all placeholder:text-slate-500" />
                              <input required name="whatsapp" placeholder="WhatsApp Profissional" className="w-full p-6 bg-white/10 rounded-3xl border border-white/10 focus:border-orange-500 outline-none text-white font-bold transition-all placeholder:text-slate-500" />
                              <textarea required name="message" placeholder="Conte-nos brevemente seu objetivo comercial..." className="w-full p-6 bg-white/10 rounded-3xl border border-white/10 focus:border-orange-500 outline-none text-white font-bold h-32 resize-none transition-all placeholder:text-slate-500" />
                              <button disabled={leadStatus === 'sending'} type="submit" className="w-full py-8 bg-orange-500 text-white rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-sm hover:bg-white hover:text-slate-900 transition-all shadow-2xl flex items-center justify-center gap-3">
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
