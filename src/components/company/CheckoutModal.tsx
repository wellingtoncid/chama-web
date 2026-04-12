import { useState, useEffect } from 'react';
import { api } from '../../api/api';
import { 
  X, Check, Star, Zap, 
  AlertCircle, Loader2
} from 'lucide-react';
import Swal from 'sweetalert2';

interface CheckoutModalProps {
  freightId: number;
  onClose: () => void;
  onSuccess: () => void;
}

interface PricingOption {
  type: 'boost' | 'urgent';
  name: string;
  description: string;
  price: number;
  duration: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

export default function CheckoutModal({ freightId, onClose, onSuccess }: CheckoutModalProps) {
  const [selectedOption, setSelectedOption] = useState<PricingOption | null>(null);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<PricingOption[]>([]);

  useEffect(() => {
    loadPricingOptions();
  }, []);

  const loadPricingOptions = async () => {
    try {
      const res = await api.get('/wallet/pricing', { params: { module: 'freights' } });
      if (res.data?.success) {
        const rules = res.data.data || [];
        
        const featured = rules.find((r: any) => r.feature_key === 'boost');
        const urgent = rules.find((r: any) => r.feature_key === 'urgent');
        
        const loadedOptions: PricingOption[] = [];
        
        if (featured) {
          loadedOptions.push({
            type: 'boost',
            name: featured.feature_name || 'Destaque Frete',
            description: 'Seu frete aparece no topo das buscas',
            price: Number(featured.price_per_use),
            duration: featured.duration_days || 7,
            icon: <Star size={28} />,
            color: 'text-orange-500',
            bgColor: 'bg-orange-50 dark:bg-orange-900/30'
          });
        }
        
        if (urgent) {
          loadedOptions.push({
            type: 'urgent',
            name: urgent.feature_name || 'Frete Urgente',
            description: 'Marca como carga urgente para motoristas',
            price: Number(urgent.price_per_use),
            duration: urgent.duration_days || 7,
            icon: <Zap size={28} />,
            color: 'text-red-500',
            bgColor: 'bg-red-50 dark:bg-red-900/30'
          });
        }
        
        setOptions(loadedOptions);
      }
    } catch (e) {
      console.error('Erro ao carregar opções:', e);
    }
  };

  const handlePurchase = async () => {
    if (!selectedOption) return;
    
    setLoading(true);
    try {
      const res = await api.post('/freight/promote', {
        freight_id: freightId,
        type: selectedOption.type
      });

      if (res.data?.success && res.data?.checkout_url) {
        window.location.href = res.data.checkout_url;
      } else {
        Swal.fire({
          title: '<span class="font-black italic text-green-600">SUCESSO!</span>',
          text: 'Frete impulsionado com sucesso!',
          icon: 'success',
          confirmButtonColor: '#22c55e',
          customClass: {
            popup: 'rounded-[2.5rem] p-8 dark:bg-slate-800',
            confirmButton: 'rounded-xl font-black uppercase text-xs px-6 py-3'
          }
        });
        onSuccess();
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Não foi possível processar.';
      Swal.fire({
        title: '<span class="font-black italic text-red-600">ERRO!</span>',
        text: message,
        icon: 'error',
        confirmButtonColor: '#ef4444',
        customClass: {
          popup: 'rounded-[2.5rem] p-8 dark:bg-slate-800',
          confirmButton: 'rounded-xl font-black uppercase text-xs px-6 py-3'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 w-full max-w-xl rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
        
        {/* HEADER */}
        <div className="p-8 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-gradient-to-r from-slate-900 to-slate-800">
          <div>
            <h3 className="text-2xl font-black uppercase italic text-white">Impulsionar Frete</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Escolha como impulsionar sua carga</p>
          </div>
          <button onClick={onClose} className="bg-white/10 p-3 rounded-2xl hover:bg-white/20 transition-all text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-8">
          <div className="space-y-4">
            {options.map((option) => (
              <div 
                key={option.type}
                onClick={() => setSelectedOption(option)}
                className={`p-6 rounded-[2rem] border-4 cursor-pointer transition-all relative ${
                  selectedOption?.type === option.type 
                    ? `border-orange-500 ${option.bgColor}` 
                    : 'border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-700 hover:border-slate-200 dark:hover:border-slate-600'
                }`}
              >
                {selectedOption?.type === option.type && (
                  <div className={`absolute top-4 right-4 ${option.color} bg-white dark:bg-slate-800 rounded-full p-1 shadow-lg`}>
                    <Check size={16} />
                  </div>
                )}
                
                <div className="flex items-start gap-4">
                  <div className={`${option.bgColor} p-4 rounded-2xl ${option.color}`}>
                    {option.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-black uppercase italic text-slate-800 dark:text-white text-lg">{option.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{option.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-slate-900 dark:text-white italic">R$ {option.price.toFixed(2).replace('.', ',')}</p>
                        <p className="text-[10px] text-slate-400">/{option.duration} dias</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/30 rounded-2xl p-4 flex items-start gap-3 border border-blue-100 dark:border-blue-800 mt-6">
            <AlertCircle size={20} className="text-blue-500 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase">Importante</p>
              <p className="text-[10px] text-blue-600 dark:text-blue-300 mt-1">
                O pagamento é feito via Mercado Pago. Escolha a forma de pagamento no checkout.
              </p>
            </div>
          </div>

          <button 
            disabled={!selectedOption || loading}
            onClick={handlePurchase}
            className="w-full mt-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-6 rounded-[2rem] font-black uppercase tracking-widest hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>Continuar para Pagamento</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
