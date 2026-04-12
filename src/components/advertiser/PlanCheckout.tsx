import { useState, useEffect } from 'react';
import { Check, ArrowRight, Loader2, X, Star, Trophy, Crown, CreditCard, ShieldCheck } from 'lucide-react';
import { api } from '../../api/api';
import Swal from 'sweetalert2';

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
        const response = await api.get('/plans');
        setPlansFromDb(response.data?.plans || []);
      } catch (error) {
        console.error("Erro ao carregar planos do banco", error);
      } finally {
        setLoadingData(false);
      }
    }
    fetchPlans();
  }, []);

  // 2. Função para encontrar o ID correto baseado no Nome e Ciclo
  // Os preços são colunas separadas: price, price_quarterly, price_semiannual, price_yearly
  const getPlanId = () => {
    const plan = plansFromDb.find(p => 
      p.name.includes(selectedPlanName) && p.category === 'advertising'
    );
    return plan?.id;
  };

  const getPlanPrice = () => {
    const plan = plansFromDb.find(p => 
      p.name.includes(selectedPlanName) && p.category === 'advertising'
    );
    if (!plan) return 0;
    
    // Seleciona o preço baseado no ciclo de cobrança
    const priceMap: Record<string, number> = {
      monthly: plan.price,
      quarterly: plan.price_quarterly,
      semiannual: plan.price_semiannual,
      yearly: plan.price_yearly
    };
    return priceMap[cycle] || plan.price || 0;
  };

  const handleCheckout = async () => {
    const planId = getPlanId();
    const price = getPlanPrice();
    const plan = plansFromDb.find(p => p.name.includes(selectedPlanName) && p.category === 'advertising');
    
    if (!planId) return alert("Plano não encontrado");

    // Se for plano gratuito, ativa direto
    if (price === 0) {
      try {
        setLoadingCheckout(true);
        const response = await api.post('/plans/subscribe', { 
          plan_id: planId,
          billing_cycle: cycle 
        });
        
        if (response.data?.success) {
          Swal.fire({
            icon: 'success',
            title: 'Plano Ativado!',
            text: `Você agora é assinante do plano ${plan?.name || selectedPlanName}.`,
            confirmButtonColor: '#059669'
          });
          if (onRefresh) onRefresh();
          onClose();
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Erro',
            text: response.data?.message || 'Erro ao ativar plano'
          });
        }
      } catch (e: any) {
        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: e.response?.data?.message || 'Erro ao processar'
        });
      } finally {
        setLoadingCheckout(false);
      }
      return;
    }

    // Para planos pagos, mostra confirmação
    const cycleLabel = cycle === 'monthly' ? 'mensal' : 
                       cycle === 'quarterly' ? 'trimestral' : 
                       cycle === 'semiannual' ? 'semestral' : 'anual';

    Swal.fire({
      title: `Confirmar Assinatura`,
      html: `
        <div class="text-left">
          <div class="bg-slate-50 rounded-2xl p-4 mb-4">
            <p class="font-bold text-lg">${plan?.name || selectedPlanName}</p>
            <p class="text-sm text-slate-500">Cobrança ${cycleLabel}</p>
          </div>
          <div class="flex items-center justify-between border-t pt-4">
            <span class="text-slate-500">Valor total:</span>
            <span class="font-black text-2xl text-emerald-600">R$ ${price.toFixed(2).replace('.', ',')}</span>
          </div>
          <p class="text-xs text-slate-400 mt-4 text-center">
            Você será redirecionado para o Mercado Pago para finalizar o pagamento.
          </p>
        </div>
      `,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Confirmar e Pagar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#059669',
      reverseButtons: true
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoadingCheckout(true);
        try {
          const response = await api.post('/plans/subscribe', { 
            plan_id: planId,
            billing_cycle: cycle 
          });
          
          if (response.data?.success) {
            if (response.data.url) {
              if (onRefresh) onRefresh();
              // Mostra loading enquanto redireciona
              Swal.fire({
                title: 'Redirecionando...',
                text: 'Aguarde enquanto redirecionamos para o Mercado Pago',
                didOpen: () => {
                  Swal.showLoading();
                },
                allowOutsideClick: false,
                showConfirmButton: false
              });
              setTimeout(() => {
                window.location.href = response.data.url;
              }, 500);
            }
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Erro',
              text: response.data?.message || 'Erro ao processar assinatura'
            });
          }
        } catch (e: any) {
          Swal.fire({
            icon: 'error',
            title: 'Erro',
            text: e.response?.data?.message || 'Erro ao conectar ao Mercado Pago'
          });
        } finally {
          setLoadingCheckout(false);
        }
      }
    });
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
              {['Bronze', 'Prata', 'Ouro'].map((name) => {
                const plan = plansFromDb.find(p => p.name.includes(name) && p.category === 'advertising');
                const priceMap: Record<string, number> = {
                  monthly: plan?.price || 0,
                  quarterly: plan?.price_quarterly || 0,
                  semiannual: plan?.price_semiannual || 0,
                  yearly: plan?.price_yearly || 0
                };
                const displayPrice = priceMap[cycle] || plan?.price || 0;
                
                return (
                  <div 
                    key={name}
                    onClick={() => setSelectedPlanName(name)}
                    className={`p-6 rounded-[2rem] border-4 cursor-pointer transition-all ${selectedPlanName === name ? 'border-[#1f4ead] bg-slate-50' : 'border-transparent opacity-60'}`}
                  >
                    <div className="text-2xl mb-2">{name === 'Ouro' ? <Crown className="text-yellow-500"/> : name === 'Prata' ? <Trophy className="text-slate-400"/> : <Star className="text-orange-400"/>}</div>
                    <h4 className="font-black text-slate-900 uppercase italic text-sm">{name}</h4>
                    <p className="text-xl font-black mt-2">R$ {displayPrice.toFixed(2).replace('.', ',')}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Lado do Botão de Pagamento */}
          <div className="w-full lg:w-80 bg-slate-50 p-8 lg:p-12 flex flex-col justify-center">
             <div className="text-xs font-black text-slate-400 uppercase mb-1">Total a pagar agora:</div>
             <div className="text-4xl font-[1000] text-slate-900 mb-8 leading-none">
               {getPlanPrice() === 0 ? 'GRÁTIS' : `R$ ${getPlanPrice()}`}
             </div>
             
             <button 
                onClick={handleCheckout}
                disabled={loadingCheckout}
                className="w-full py-5 bg-[#1f4ead] text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-900 transition-all shadow-xl disabled:opacity-50"
             >
                {loadingCheckout ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : getPlanPrice() === 0 ? (
                  <>Ativar Plano <Check size={18}/></>
                ) : (
                  <>Pagar com Mercado Pago <CreditCard size={18}/></>
                )}
             </button>
             
             {getPlanPrice() > 0 && (
               <div className="flex items-center justify-center gap-2 mt-4 text-slate-400">
                 <ShieldCheck size={14} />
                 <p className="text-[10px] font-bold uppercase">Pagamento 100% seguro</p>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}