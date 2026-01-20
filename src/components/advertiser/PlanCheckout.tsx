import { useState, useEffect } from 'react';
import { Check, ArrowRight, Loader2, X, Star, Trophy, Crown } from 'lucide-react';
import { api } from '../../api/api';

interface PlanCheckoutProps {
  onClose: () => void;
  onRefresh?: () => void; // O '?' torna opcional para não quebrar outros lugares
}

export default function PlanCheckout({ onClose, onRefresh }: PlanCheckoutProps) {
  const [plansFromDb, setPlansFromDb] = useState<any[]>([]);
  const [cycle, setCycle] = useState<'monthly' | 'quarterly' | 'semiannual' | 'yearly'>('monthly');
  const [selectedPlanName, setSelectedPlanName] = useState('Prata');
  const [loadingData, setLoadingData] = useState(true);
  const [loadingCheckout, setLoadingCheckout] = useState(false);

  // 1. Busca os planos reais do seu Banco de Dados
  useEffect(() => {
    async function fetchPlans() {
      try {
        const response = await api.get('?endpoint=get-plans'); // Seu endpoint que dá SELECT * FROM plans
        setPlansFromDb(response.data);
      } catch (error) {
        console.error("Erro ao carregar planos do banco", error);
      } finally {
        setLoadingData(false);
      }
    }
    fetchPlans();
  }, []);

  // 2. Função para encontrar o ID correto baseado no Nome e Ciclo
  // No seu banco: Bronze Mensal (ID 1), Bronze Trimestral (ID 2), etc.
  const getPlanId = () => {
    const plan = plansFromDb.find(p => 
      p.name.includes(selectedPlanName) && 
      p.cycle.toLowerCase() === cycle.toLowerCase()
    );
    return plan?.id;
  };

  const getPlanPrice = () => {
    const plan = plansFromDb.find(p => 
      p.name.includes(selectedPlanName) && 
      p.cycle.toLowerCase() === cycle.toLowerCase()
    );
    return plan?.price || 0;
  };

  const handleCheckout = async () => {
    const planId = getPlanId();
    if (!planId) return alert("Plano não encontrado");

    setLoadingCheckout(true);
    try {
      const response = await api.post('?endpoint=process-checkout', { plan_id: planId });
      if (response.data?.checkout_url) {
        if (onRefresh) onRefresh();
        window.location.href = response.data.checkout_url;
      }
    } catch (error) {
      alert("Erro ao conectar ao Mercado Pago");
    } finally {
      setLoadingCheckout(false);
    }
  };

  if (loadingData) return (
    <div className="fixed inset-0 bg-slate-900/90 flex items-center justify-center z-[110]">
      <Loader2 className="animate-spin text-orange-500" size={40} />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl relative my-auto overflow-hidden">
        
        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 z-10"><X /></button>

        <div className="flex flex-col lg:flex-row">
          <div className="flex-1 p-8 lg:p-12 border-r border-slate-100">
            <h2 className="text-3xl font-[1000] italic text-slate-900 uppercase mb-6">Planos <span className="text-[#1f4ead]">Sincronizados</span></h2>

            {/* Seletor de Ciclo */}
            <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl mb-8">
              {['monthly', 'quarterly', 'semiannual', 'yearly'].map((c) => (
                <button
                  key={c}
                  onClick={() => setCycle(c as any)}
                  className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${cycle === c ? 'bg-[#1f4ead] text-white' : 'text-slate-400'}`}
                >
                  {c === 'monthly' ? 'Mensal' : c === 'quarterly' ? '3 Meses' : c === 'semiannual' ? '6 Meses' : 'Anual'}
                </button>
              ))}
            </div>

            {/* Cards Dinâmicos (Agrupados por Nome: Bronze, Prata, Ouro) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['Bronze', 'Prata', 'Ouro'].map((name) => (
                <div 
                  key={name}
                  onClick={() => setSelectedPlanName(name)}
                  className={`p-6 rounded-[2rem] border-4 cursor-pointer transition-all ${selectedPlanName === name ? 'border-[#1f4ead] bg-slate-50' : 'border-transparent opacity-60'}`}
                >
                  <div className="text-2xl mb-2">{name === 'Ouro' ? <Crown className="text-yellow-500"/> : name === 'Prata' ? <Trophy className="text-slate-400"/> : <Star className="text-orange-400"/>}</div>
                  <h4 className="font-black text-slate-900 uppercase italic text-sm">{name}</h4>
                  <p className="text-xl font-black mt-2">R$ {plansFromDb.find(p => p.name.includes(name) && p.cycle === cycle)?.price || '---'}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Lado do Botão de Pagamento */}
          <div className="w-full lg:w-80 bg-slate-50 p-8 lg:p-12 flex flex-col justify-center">
             <div className="text-xs font-black text-slate-400 uppercase mb-1">Total a pagar agora:</div>
             <div className="text-4xl font-[1000] text-slate-900 mb-8 leading-none">R$ {getPlanPrice()}</div>
             
             <button 
                onClick={handleCheckout}
                disabled={loadingCheckout}
                className="w-full py-5 bg-[#1f4ead] text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-900 transition-all shadow-xl"
             >
                {loadingCheckout ? <Loader2 className="animate-spin" /> : <>Assinar Agora <ArrowRight size={18}/></>}
             </button>
             <p className="text-[9px] text-slate-400 mt-4 text-center font-bold uppercase italic">Pagamento seguro via Mercado Pago</p>
          </div>
        </div>
      </div>
    </div>
  );
}