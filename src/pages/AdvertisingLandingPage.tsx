import React, { useState } from 'react';
import { Check, MessageCircle, Send, ShieldCheck, Trophy, Crown, Star, ArrowRight } from 'lucide-react';
import Header from '../components/shared/Header';
import Footer from '../components/shared/Footer';
import { api } from '../api';

const AdvertisingLandingPage = () => {
  // Estados para Ciclo de Pagamento e Plano Selecionado
  const [cycle, setCycle] = useState<'monthly' | 'quarterly' | 'semiannual' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState('Prata');
  const [loading, setLoading] = useState(false);

  // Mapeamento de IDs do Banco de Dados (Sincronizado com seu SQL)
  const planData: any = {
    Bronze: {
      icon: <Star className="text-orange-400" />,
      desc: 'Banner fixo na barra lateral do portal.',
      features: ['Exposição em todas as páginas', 'Ideal para serviços locais', 'Link para WhatsApp'],
      ids: { monthly: 1, quarterly: 2, semiannual: 3, yearly: 4 },
      prices: { monthly: 99, quarterly: 267, semiannual: 475, yearly: 830 }
    },
    Prata: {
      icon: <Trophy className="text-slate-400" />,
      desc: 'Banner horizontal entre a lista de fretes.',
      features: ['Maior visibilidade do site', 'Foco total no motorista', 'Segmentação por região'],
      ids: { monthly: 5, quarterly: 6, semiannual: 7, yearly: 8 },
      prices: { monthly: 199, quarterly: 537, semiannual: 955, yearly: 1670 },
      popular: true
    },
    Ouro: {
      icon: <Crown className="text-yellow-500" />,
      desc: 'Domínio total: Home + Lista + Sidebar.',
      features: ['Exposição máxima', 'Selo de Parceiro Premium', 'Suporte VIP 24h'],
      ids: { monthly: 9, quarterly: 10, semiannual: 11, yearly: 12 },
      prices: { monthly: 349, quarterly: 942, semiannual: 1675, yearly: 2930 }
    }
  };

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const planId = planData[selectedPlan].ids[cycle];
      
      // Passamos o endpoint na URL e o dado no corpo (POST)
      const response = await api.post('?endpoint=process-checkout', {
        plan_id: planId
      });

      if (response.data && response.data.checkout_url) {
        window.location.href = response.data.checkout_url;
      } else {
        console.error("Payload recebido:", response.data);
        alert(response.data.error || "Erro ao gerar pagamento");
      }
    } catch (error) {
      console.error("Erro na conexão:", error);
      alert("Não foi possível conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="container mx-auto px-4 pt-32 pb-20">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-[1000] italic text-slate-900 uppercase tracking-tighter leading-none">
            ANUNCIE NO <span className="text-[#1f4ead]">CHAMA FRETE</span>
          </h1>
          <p className="text-slate-500 mt-6 text-xl font-bold max-w-2xl mx-auto">
            Sua marca vista por milhares de motoristas que buscam carga todos os dias.
          </p>

          {/* Seletor de Ciclo */}
          <div className="mt-12 inline-flex flex-wrap justify-center gap-2 bg-white p-2 rounded-3xl shadow-xl border border-slate-100">
            {[
              { id: 'monthly', label: 'Mensal' },
              { id: 'quarterly', label: 'Trimestral' },
              { id: 'semiannual', label: 'Semestral' },
              { id: 'yearly', label: 'Anual (PROMO)' }
            ].map((c) => (
              <button
                key={c.id}
                onClick={() => setCycle(c.id as any)}
                className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                  cycle === c.id ? 'bg-[#1f4ead] text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grade de Planos */}
        <div className="grid lg:grid-cols-3 gap-8 mb-20">
          {Object.entries(planData).map(([name, data]: [string, any]) => (
            <div 
              key={name}
              onClick={() => setSelectedPlan(name)}
              className={`relative bg-white p-10 rounded-[3.5rem] border-4 transition-all cursor-pointer ${
                selectedPlan === name ? 'border-[#1f4ead] scale-105 shadow-2xl' : 'border-transparent opacity-80'
              }`}
            >
              {data.popular && (
                <span className="absolute -top-5 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-tighter">
                  Mais Procurado
                </span>
              )}
              
              <div className="text-4xl mb-4">{data.icon}</div>
              <h3 className="text-3xl font-[1000] uppercase italic text-slate-900 leading-none mb-2">{name}</h3>
              <p className="text-slate-400 text-sm font-bold mb-8 leading-tight">{data.desc}</p>
              
              <div className="mb-10">
                <span className="text-5xl font-[1000] text-slate-900">R$ {data.prices[cycle]}</span>
                <span className="text-slate-400 font-bold ml-2">/{cycle === 'monthly' ? 'mês' : 'total'}</span>
              </div>

              <ul className="space-y-4 mb-12">
                {data.features.map((f: string) => (
                  <li key={f} className="flex items-center gap-3 text-sm font-black text-slate-600 uppercase italic">
                    <Check className="text-emerald-500" size={18} strokeWidth={3} /> {f}
                  </li>
                ))}
              </ul>

              <button 
                onClick={handleCheckout}
                disabled={loading}
                className={`w-full py-6 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${
                  selectedPlan === name ? 'bg-[#1f4ead] text-white shadow-lg' : 'bg-slate-100 text-slate-400'
                }`}
              >
                {loading ? "Processando..." : <>Pagar Agora <ArrowRight size={20}/></>}
              </button>
            </div>
          ))}
        </div>

        {/* Seção Projetos Especiais */}
        <div className="bg-slate-900 rounded-[4rem] p-12 text-center text-white">
          <h2 className="text-3xl font-[1000] uppercase italic mb-6 leading-none">Precisa de algo sob medida?</h2>
          <p className="text-slate-400 font-medium mb-10 max-w-xl mx-auto italic">
            Para redes de postos, seguradoras e fabricantes que desejam parcerias exclusivas e integração via API.
          </p>
          <a 
            href="https://wa.me/5547992717125" 
            className="inline-flex items-center gap-3 bg-white text-slate-900 px-12 py-6 rounded-2xl font-[1000] uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all shadow-2xl"
          >
            <MessageCircle size={24}/> Falar com Diretor
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdvertisingLandingPage;