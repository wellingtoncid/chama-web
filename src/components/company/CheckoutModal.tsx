import { useState } from 'react';
import { api } from '../../api/api';
import { 
  X, Check, Star, CreditCard, 
  ShieldCheck, Loader2} from 'lucide-react';

interface CheckoutModalProps {
  freightId: number;
  plans: any[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function CheckoutModal({ freightId, plans, onClose, onSuccess }: CheckoutModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [step, setStep] = useState<'select' | 'pay'>('select');
  const [loading, setLoading] = useState(false);

  const handleProcessPayment = async () => {
    setLoading(true);
    try {
      // Simulação de chamada para o seu Back-end processar o pagamento
      await api.post('', { 
        freight_id: freightId, 
        plan_id: selectedPlan.id 
      }, { params: { endpoint: 'process-checkout' } });

      alert("Pagamento aprovado! Seu frete agora está em destaque.");
      onSuccess();
    } catch (e) {
      alert("Erro ao processar pagamento.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in duration-300">
        
        {/* HEADER */}
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-2xl font-black uppercase italic text-slate-800">Impulsionar Frete</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Escolha o melhor plano para sua carga</p>
          </div>
          <button onClick={onClose} className="bg-white p-3 rounded-2xl shadow-sm hover:bg-red-50 hover:text-red-500 transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="p-8">
          {step === 'select' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {plans.filter(p => p.type === 'featured').map((plan) => (
                  <div 
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan)}
                    className={`p-6 rounded-[2rem] border-4 cursor-pointer transition-all relative overflow-hidden group ${
                      selectedPlan?.id === plan.id ? 'border-orange-500 bg-orange-50/30' : 'border-slate-100 bg-white hover:border-slate-200'
                    }`}
                  >
                    {selectedPlan?.id === plan.id && (
                      <div className="absolute top-4 right-4 bg-orange-500 text-white p-1 rounded-full">
                        <Check size={14} />
                      </div>
                    )}
                    <Star className={`${selectedPlan?.id === plan.id ? 'text-orange-500' : 'text-slate-300'} mb-4`} size={24} fill={selectedPlan?.id === plan.id ? 'currentColor' : 'none'} />
                    <p className="font-black uppercase italic text-slate-800 text-lg">{plan.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-4">{plan.duration_days} dias de visibilidade máxima</p>
                    <p className="text-2xl font-black text-slate-900 italic">R$ {plan.price}</p>
                  </div>
                ))}
              </div>

              <button 
                disabled={!selectedPlan}
                onClick={() => setStep('pay')}
                className="w-full mt-6 bg-slate-900 text-white py-6 rounded-[2rem] font-black uppercase tracking-widest hover:bg-orange-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Continuar para Pagamento
              </button>
            </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-right">
              {/* RESUMO DO PEDIDO */}
              <div className="bg-slate-50 p-6 rounded-[2rem] flex justify-between items-center border border-slate-100">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase">Plano Selecionado</p>
                  <p className="font-black text-slate-800 uppercase italic">{selectedPlan.name}</p>
                </div>
                <p className="text-2xl font-black text-orange-500 italic">R$ {selectedPlan.price}</p>
              </div>

              {/* SIMULAÇÃO DE CARTÃO */}
              <div className="space-y-4">
                <div className="bg-slate-100 p-8 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center text-slate-400">
                   <CreditCard size={40} className="mb-2 opacity-20" />
                   <p className="font-black text-[10px] uppercase">Integração com Gateway de Pagamento</p>
                   <p className="text-[9px] font-bold">Mercado Pago / Stripe / Pix</p>
                </div>
                
                <div className="flex items-center gap-2 text-emerald-600 justify-center">
                  <ShieldCheck size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Ambiente 100% Seguro</span>
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={() => setStep('select')} className="flex-1 py-5 font-black uppercase text-xs text-slate-400">Voltar</button>
                <button 
                  onClick={handleProcessPayment}
                  disabled={loading}
                  className="flex-[2] bg-emerald-500 text-white py-5 rounded-[1.5rem] font-black uppercase text-xs tracking-widest hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <Check size={18}/>}
                  Confirmar e Pagar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}